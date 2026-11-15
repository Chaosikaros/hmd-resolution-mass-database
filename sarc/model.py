"""Geometric PPD inputs and manufacturer-weighted SARC calibration.

Reference PPD values supply calibration targets.
Prediction inputs do not require target PPD or manufacturer identifiers.
Manufacturer identifiers determine fitting weights.
"""
from __future__ import annotations
from pathlib import Path
import json
import math
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
INPUT_COLUMNS = ['w_px', 'h_px', 'fov_default_deg', 'geometry_span_deg', 'qbase',
                 'optics', 'model_axis', 'physical_optics', 'tiled_lens_array']
CATEGORICAL = ['optics', 'model_axis', 'physical_optics']


def validate_inputs(frame: pd.DataFrame, training: bool = False) -> pd.DataFrame:
    needed = INPUT_COLUMNS + (['device_id', 'cluster', 'ppd_default'] if training else [])
    missing = sorted(set(needed) - set(frame.columns))
    if missing:
        raise ValueError(f'Missing required columns: {missing}')
    if frame.empty:
        raise ValueError('The input table is empty.')
    d = frame.copy()
    for c in ['w_px', 'h_px', 'fov_default_deg', 'geometry_span_deg', 'qbase'] + (['ppd_default'] if training else []):
        d[c] = pd.to_numeric(d[c], errors='raise')
        if not np.isfinite(d[c]).all() or (d[c] <= 0).any():
            raise ValueError(f'{c} must contain finite positive numbers.')
    if (d[['fov_default_deg', 'geometry_span_deg']] >= 180).any().any():
        raise ValueError('This prepared geometry input expects FOV spans below 180 degrees.')
    b = d.tiled_lens_array.astype(str).str.strip().str.lower()
    if not b.isin(['true', 'false', '1', '0']).all():
        raise ValueError('tiled_lens_array must be True/False or 1/0, not missing.')
    d['tiled_lens_array'] = b.isin(['true', '1'])
    for c in CATEGORICAL:
        if d[c].isna().any():
            raise ValueError(f'{c} must be explicit; use an explicit unknown category.')
        d[c] = d[c].astype(str)
    if training:
        if d.device_id.duplicated().any() or d.cluster.isna().any():
            raise ValueError('Training device IDs must be unique and groups nonmissing.')
        d['cluster'] = d.cluster.astype(str)
    return d


def load_data(path: Path | None = None) -> pd.DataFrame:
    d = validate_inputs(pd.read_csv(path or ROOT / 'data' / 'references.csv'), training=True)
    return d.sort_values('device_id').reset_index(drop=True)


def geometry(d: pd.DataFrame) -> np.ndarray:
    """Return the geometric PPD proxy without using reference PPD values.

    Small-FOV diagonal or unspecified axes use pixel-diagonal/FOV.
    Other inputs, including tiled lens arrays, retain their resolved qbase.
    """
    q = d.qbase.to_numpy(float).copy()
    small = (d.optics.eq('small_fov') & d.model_axis.isin(['unspecified', 'diagonal'])
             & ~d.tiled_lens_array.astype(bool)).to_numpy()
    q[small] = np.hypot(d.w_px, d.h_px)[small] / d.fov_default_deg.to_numpy(float)[small]
    return q



def weighted_median_interval(values: np.ndarray, integer_weights: np.ndarray) -> tuple[float, float]:
    """The entire minimizer interval of weighted absolute loss; exact weight ties."""
    z, w = np.asarray(values, float), np.asarray(integer_weights, np.int64)
    if len(z) == 0 or not np.isfinite(z).all() or (w <= 0).any():
        raise ValueError('A weighted median needs finite observations and positive weights.')
    ix = np.argsort(z, kind='stable'); z, w = z[ix], w[ix]
    cs = np.cumsum(w); total = cs[-1]
    lo = z[np.flatnonzero(2 * cs >= total)[0]]
    hi = z[np.flatnonzero(2 * cs > total)[0]]
    return float(lo), float(hi)


class GroupCalibrator:
    """Calibrate geometric PPD using weighted median log-ratio offsets.

    Select optical/axis groups, with optical and global fallbacks.
    """
    def __init__(self):
        self.state: dict = {}

    def fit(self, frame: pd.DataFrame) -> 'GroupCalibrator':
        """Fit offsets and the manufacturer-held-out log2 residual scale."""
        d = validate_inputs(frame, training=True)
        self._fit_offsets(d)
        if d.cluster.nunique() < 2:
            raise ValueError('Residual intervals require at least two manufacturer groups.')
        group_mse = []
        for cluster in sorted(d.cluster.unique()):
            test = d.cluster.eq(cluster)
            held_out = GroupCalibrator()._fit_offsets(d.loc[~test])
            residual = np.log2(held_out.predict(d.loc[test]) / d.loc[test, 'ppd_default'].to_numpy(float))
            group_mse.append(float(np.mean(residual**2)))
        self.state['residual_interval'] = {
            'method': 'leave_one_manufacturer_out',
            'weighting': 'equal_manufacturer_mean_squared_log2_residual',
            'sigma_log2': max(0.10, float(np.sqrt(np.mean(group_mse)))),
            'sigma_floor_log2': 0.10,
            'normal_multiplier': 1.96,
            'nominal_coverage': 0.95,
        }
        return self

    def _fit_offsets(self, frame: pd.DataFrame) -> 'GroupCalibrator':
        d = validate_inputs(frame, training=True)
        d = d.loc[~d.tiled_lens_array].copy()
        if d.empty:
            raise ValueError('At least one non-tiled training reference is required.')
        counts = d.cluster.value_counts()
        lcm = math.lcm(*map(int, counts))
        w = np.array([lcm // int(counts[c]) for c in d.cluster], dtype=np.int64)
        residual = np.log2(d.ppd_default.to_numpy(float) / geometry(d))
        models = {}
        masks = {'global': np.ones(len(d), dtype=bool)}
        for o in sorted(d.optics.unique()):
            masks['optics:' + o] = d.optics.eq(o).to_numpy()
            for axis in [False, True]:
                masks[f'axis:{o}:{int(axis)}'] = (d.optics.eq(o) & d.model_axis.eq('unspecified').eq(axis)).to_numpy()
        for name, mask in masks.items():
            if not mask.any():
                continue
            lo, hi = weighted_median_interval(residual[mask], w[mask])
            models[name] = {'log2_multiplier': (lo + hi) / 2,
                            'median_interval': [lo, hi], 'n': int(mask.sum()),
                            'manufacturers': int(d.loc[mask, 'cluster'].nunique())}
        self.state = {'method': 'SARC', 'mode': 'axis', 'schema': 1,
                      'geometry': 'frozen_small_fov_axis_proxy_v1', 'groups': models,
                      'training_ids': d.device_id.astype(int).tolist()}
        return self

    def predict(self, frame: pd.DataFrame) -> np.ndarray:
        d = validate_inputs(frame)
        if not self.state:
            raise RuntimeError('Call fit() or load() first.')
        q, out = geometry(d), []
        groups = self.state['groups']
        for i, row in enumerate(d.itertuples()):
            if row.tiled_lens_array:
                out.append(float(row.qbase)); continue
            keys = [f'axis:{row.optics}:{int(row.model_axis == "unspecified")}',
                    "optics:" + row.optics, "global"]
            key = next(k for k in keys if k in groups)
            out.append(q[i] * 2 ** groups[key]['log2_multiplier'])
        return np.asarray(out)

    def predict_interval(self, frame: pd.DataFrame) -> np.ndarray:
        """Nominal 95% model-residual bounds, excluding input uncertainty."""
        interval = self.state['residual_interval']
        factor = 2 ** (interval['normal_multiplier'] * interval['sigma_log2'])
        predicted = self.predict(frame)
        return np.column_stack((predicted / factor, predicted * factor))

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.state, indent=2, ensure_ascii=False), encoding='utf-8')

    @classmethod
    def load(cls, path: Path) -> 'GroupCalibrator':
        state = json.loads(path.read_text(encoding='utf-8'))
        if state.get('schema') != 1: raise ValueError('Unsupported model schema.')
        if state.get('mode') != 'axis': raise ValueError('Unsupported SARC grouping.')
        obj = cls(); obj.state = state
        return obj

