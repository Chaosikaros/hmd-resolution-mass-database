"""Fit SARC, calculate PPD and verify published values."""
from pathlib import Path
import argparse
import json
import numpy as np
import pandas as pd
from .model import GroupCalibrator, load_data

ROOT = Path(__file__).resolve().parents[1]

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['fit', 'predict', 'verify'])
    parser.add_argument('--input', type=Path)
    parser.add_argument('--model', type=Path, default=ROOT/'data/model.json')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    refs = load_data(ROOT/'data/references.csv')
    if args.command == 'fit':
        model = GroupCalibrator().fit(load_data(args.input) if args.input else refs)
        path = args.output or ROOT/'output/model.json'
        model.save(path)
        print(f'Saved fitted model to {path}')
    elif args.command == 'predict':
        rows = pd.read_csv(args.input or ROOT/'data/prediction_inputs.csv', keep_default_na=False)
        model = GroupCalibrator.load(args.model)
        rows['sarc_prediction'] = model.predict(rows)
        rows['ppd_estimate_sigma_log2'] = model.state['residual_interval']['sigma_log2']
        rows[['ppd_estimate_low', 'ppd_estimate_high']] = model.predict_interval(rows)
        path = args.output or ROOT/'output/predictions.csv'
        path.parent.mkdir(parents=True, exist_ok=True)
        rows.to_csv(path, index=False)
        print(f'Saved {len(rows)} predictions to {path}')
    elif args.command == 'verify':
        model = GroupCalibrator().fit(refs)
        saved = GroupCalibrator.load(args.model)
        assert model.state.keys() == saved.state.keys()
        for key in ['method', 'mode', 'schema', 'geometry', 'training_ids']:
            assert model.state[key] == saved.state[key], key
        assert model.state['residual_interval'].keys() == saved.state['residual_interval'].keys()
        for key, value in model.state['residual_interval'].items():
            if isinstance(value, str):
                assert value == saved.state['residual_interval'][key], key
            else:
                np.testing.assert_allclose(value, saved.state['residual_interval'][key], rtol=1e-12, atol=1e-12)
        assert model.state['groups'].keys() == saved.state['groups'].keys()
        for key, group in model.state['groups'].items():
            for field, value in group.items():
                np.testing.assert_allclose(value, saved.state['groups'][key][field], rtol=1e-12, atol=1e-12)
        rows = pd.read_csv(args.input or ROOT/'data/prediction_inputs.csv', keep_default_na=False)
        predicted = model.predict(rows)
        expected = rows.expected_ppd.to_numpy(float)
        np.testing.assert_allclose(predicted, expected, rtol=1e-12, atol=1e-10)
        print(json.dumps({'status':'passed', 'references':len(refs),
                         'manufacturer_groups':refs.cluster.nunique(),
                         'predictions':len(rows), 'cohorts':rows.cohort.value_counts().to_dict(),
                         'matches_published_values':True}, indent=2))

if __name__ == '__main__': main()
