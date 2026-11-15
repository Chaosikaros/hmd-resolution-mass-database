# HMD Resolution and Mass Database (HRMD)

HRMD collects head-mounted display specifications with field-level source links,
quotations, screenshots and adoption rationales. The bilingual website lets readers
inspect the evidence behind each value and propose additions or corrections.

**[Browse the HRMD website](https://chaosikaros.github.io/hmd-resolution-mass-database/site/)**

The evidence cutoff is **13 October 2026**. The database contains:

| Collection | Records | Scope |
| --- | ---: | --- |
| Main dataset | 241 | Complete records from 2016–2026 |
| Incomplete dataset | 46 | Records with missing inputs, across all years |
| Historical device pages | 13 | Complete records before 2016 |

The main dataset uses **66 official PPD values and 175 SARC estimates**. SARC is
calibrated on those 66 official references, grouped into 21 manufacturer groups.
Third-party PPD values are retained as reference information only.

## Data and methods

- [Main dataset — CSV](site/dataset_formal.csv)
- [Incomplete dataset — CSV](site/dataset_incomplete.csv)
- [Field definitions and interpretation](site/docs/DATA_FIELDS.md)
- [Search and evidence collection](site/docs/SEARCH_METHOD.md)
- [SARC equations, inputs and calculation](site/docs/SARC.md)

The CSV files include specifications and field-level evidence. Device pages link
each field to its sources and captures. Missing values remain empty; ranges, inequalities,
configuration details and source limitations accompany the adopted values.
Website downloads follow the selected language and use UTF-8 CSV. Column names
and machine-readable codes are stable; source quotations retain their original
wording. The website's methods page includes the complete bilingual guide.

## Browse locally

With Python 3.10 or newer, run:

```sh
python scripts/preview.py --open
```

On Windows, `start-preview.cmd` runs the same preview. The website opens at
<http://127.0.0.1:8788/hmd-resolution-mass-database/> and serves the `site/` directory. English is the default language; your language preference is remembered.

## Run SARC

```sh
python -m pip install -r requirements.txt
python -m sarc verify
python -m sarc fit --output output/model.json
python -m sarc predict --model output/model.json --output output/predictions.csv
```

`verify` refits the supplied official references and checks the saved model and
all supplied SARC predictions. The prediction inputs identify their collection:
175 main, 18 incomplete and 12 historical records. Only the main dataset supplies
calibration references. Two incomplete records use a separately labelled geometric
fallback because their FOV is outside SARC's supported range.

## Contribute

Use the website's **Contribute data and evidence** form or open a
[GitHub Issue](https://github.com/chaosikaros/hmd-resolution-mass-database/issues).
The form prepares an Issue; sign in to GitHub, attach source captures and review
the proposal before submitting. Long proposals can be copied or downloaded as
Markdown. See [CONTRIBUTING.md](CONTRIBUTING.md) for the required evidence.

## License

The project's original code, documentation and curated data are released under
the [MIT License](LICENSE). Third-party quotations, screenshots, photographs and
other source materials retain their respective rights and are excluded from the
MIT license. See [Third-party materials](THIRD_PARTY_NOTICES.md).
