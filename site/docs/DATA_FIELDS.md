# Reading the downloadable datasets

The main and incomplete CSV files retain specifications and their field-level
evidence, including quotations, URLs, capture links and adoption rationales.
Missing values are empty.

Downloads use UTF-8 CSV. The website language selects English or Chinese
descriptions; column names and machine-readable codes stay the same. Device
names, source quotations and literal source section titles retain their original
wording. Project-written locator explanations follow the selected language.

## Mass

Read `mass_point_g` together with `mass_value_kind`, `mass_bound_inclusive`,
`mass_scope` and the source quotation:

- For an exact, nominal or approximate value, it contains the adopted magnitude.
- For an upper or lower bound, it contains the reported threshold.
  `mass_bound_inclusive=true` denotes an inclusive bound; `false` denotes a strict
  inequality. The threshold is not a measurement of the actual mass.
- For a finite range, the lower and upper limits are retained separately. The
  value kind and field rationale identify the adopted coordinate, such as a
  midpoint or a reported configuration value.

## PPD

`ppd_working` is the adopted PPD, with its origin in `ppd_working_kind`: official
when a matching manufacturer value is available, otherwise a project estimate.
The main dataset's project estimates use SARC. The calculation and inputs are in
`ppd_derivation`; incomplete records can retain an explicitly identified geometric
fallback when SARC does not support the reported geometry. Missing required inputs
remain missing.

`third_party_ppd_reference` and its evidence are reference information only. They
do not replace adopted PPD and do not enter SARC calibration. Calibration uses
compatible official references from the main dataset.

`ppd_estimate_low` and `ppd_estimate_high` are nominal 95% model-residual bounds
for SARC estimates; `ppd_estimate_sigma_log2` is their log2 residual scale.
They do not bound uncertainty in source inputs. See the [SARC guide](SARC.md#model-residual-intervals)
for the formula and manufacturer-held-out calculation. Official PPD values and
uncalibrated geometric fallbacks do not receive these SARC intervals.

## Geometry and year

Whole-headset resolution and FOV are distinct from any matched central display
region used for PPD calibration. `ppd_calibration_region` records that geometry
separately. When a source leaves PPD location or FOV axis unspecified, the project
defaults to central PPD and horizontal FOV; source wording and explicit scope are
preserved. The SARC guide explains how source-axis status enters its proxy.

The recorded year may describe an announcement, demonstration or release.
The year basis identifies the event; a documented
announcement does not establish commercial availability.

Source quotations, capture dates and evidence support scores describe the recorded
evidence.
