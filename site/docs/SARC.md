# SARC: PPD calculation

Structure- and axis-aware robust calibration (SARC) estimates PPD from documented
geometric inputs and official reference values. `sarc/model.py` implements fitting
and prediction using NumPy and pandas. The included official
references and prediction inputs allow the published PPD estimates to be recalculated.

## Inputs

`data/references.csv` contains the current 66 official main-dataset references
across 21 manufacturer groups. Only these official values fit the model.
`data/prediction_inputs.csv` contains current SARC estimate inputs, their cohort,
stable ID and expected adopted value. Official values remain unchanged in the
downloadable website datasets. Auxiliary/historical rows do not fit the model.

| Column | Meaning |
| --- | --- |
| device_id, name | Stable catalogue identity |
| cluster | Manufacturer group used for calibration weights |
| ppd_default | Official training target; never an inference feature |
| w_px, h_px | Adopted per-eye or explicitly matched central-region pixel spans |
| fov_default_deg | Adopted angular span in degrees |
| geometry_span_deg | Resolved angular span used for qbase, with matching pixel axis |
| qbase | Resolved geometric pixel-per-degree proxy |
| optics | Calibration group; can differ from the physical optics description |
| model_axis | Source/effective axis status, including `unspecified` |
| physical_optics | Retained physical structure description |
| tiled_lens_array | Architecture flag supported by device specifications |

Prepared inputs make the adopted geometry inspectable. For horizontal or
unspecified-axis spans, qbase = w_px / FOV. For an explicit diagonal span D,
horizontal span is 2 atan(tan(D/2) * w / sqrt(w²+h²)). For an explicit vertical
span V, qbase = h_px / V directly. Convert degrees to radians for diagonal
trigonometry, then back to degrees before dividing pixels. The diagonal conversion assumes a rectangular active
area, square pixels and rectilinear projection. The six Varjo multi-resolution
references use separately matched central-region inputs. Nonrectangular cases
retain their effective source-reported axis spans and stated limitations.

The SARC proxy q equals qbase, except for `small_fov` devices with
`unspecified` or `diagonal` model axis: q = sqrt(w_px² + h_px²) / fov_default_deg.
This is a model proxy and does not assert that the source explicitly reported a
diagonal field of view. Explicit tiled lens arrays retain their resolved qbase.
FOV spans must be positive and below 180 degrees for this prepared SARC API.

## Calibration

For each training device i, calculate r_i = log2(official_PPD_i / q_i). Each
manufacturer has equal total weight: a device in a group of n devices receives
weight proportional to 1/n. Compute the weighted-median minimizer interval of r
within each available group; the fitted offset is the interval midpoint.
Integer weights and cumulative comparisons handle exact median ties.

Offsets are fitted globally, by optical group, and by optical group crossed with
whether the model axis is unspecified. For inference, select the most specific
available offset: optical/axis group, optical group, then global fallback.

`estimated_PPD = q * 2**offset`

Tiled lens arrays return qbase directly. Manufacturer identifiers set fitting
weights; they are not predictive features. No target is used to calculate an
inference input.

## Model-residual intervals

The displayed PPD interval describes model residuals, not uncertainty in the
source specifications. Leave out each manufacturer in turn, fit on the remaining
official references, and calculate log2(predicted PPD / official PPD) for the
held-out devices. Average squared residuals within each manufacturer, then average
those group means equally. The residual scale sigma is the square root of that
mean, with a floor of 0.10 log2 units.

The current sigma is 0.134031074895889. The nominal 95% interval is
`[estimated_PPD / 2**(1.96*sigma), estimated_PPD * 2**(1.96*sigma)]`.
This corresponds to dividing and multiplying by approximately 1.19972.
The 95% label uses a normal approximation; it does not guarantee coverage for
individual devices or include input, axis, configuration or extrapolation
uncertainty. This residual interval is distinct from the weighted-median
minimizer interval used to select a fitted offset.

## Run

From the repository root:

```sh
python -m pip install -r requirements.txt
python -m sarc verify
python -m sarc fit --output output/model.json
python -m sarc predict --model output/model.json --output output/predictions.csv
```

`fit` recalculates offsets and the residual scale from the official reference CSV.
`predict` adds `sarc_prediction`, `ppd_estimate_sigma_log2`, `ppd_estimate_low`
and `ppd_estimate_high` to the supplied prediction inputs. Alternate input
files can be passed with `--input`. `verify` checks the current fitted groups,
training IDs, residual scale and predictions against the saved current state using tight numeric
tolerances.

Each published SARC derivation links to `data/model.json` relative to the
repository root and records its SHA-256 fingerprint, fitted group and log2
multiplier. Original source values, matching geometry and screenshots remain
attached to the device record.

The estimated PPD is a nominal geometry-based estimate, not a new measured or
manufacturer-reported value. Source resolution, FOV, configuration and scope
uncertainties are not removed by calibration. Third-party PPD values do not
enter this calibration pool.
