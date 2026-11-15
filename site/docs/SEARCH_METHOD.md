# Search and evidence collection

## Scope and record identity

HMD Resolution and Mass Database (HRMD) studies head-mounted displays through traceable online evidence.
The main dataset covers complete records from 2016 to the current evidence
cutoff. An all-years incomplete dataset retains devices with unresolved inputs.
Complete pre-2016 devices have individual historical pages. Missing data remain missing.

Start with the exact manufacturer, product name, hardware revision, regional
variant and configuration. Keep distinct configurations separate when their
display, optics or head-worn assembly differs. Resolve aliases with stable device
IDs; do not combine specifications from similarly named products.

## Search procedure

1. Search the exact model and relevant field in Google and Baidu. Useful query
   patterns include `"MODEL" specifications`, `"MODEL" weight headband`,
   `"MODEL" resolution per eye`, `"MODEL" horizontal field of view`,
   `"MODEL" PPD`, and `"MODEL" weight resolution field of view optics`. Substitute the actual
   device name and record the literal query actually used.
2. Inspect matching manufacturer product pages, manuals, technical documents,
   announcements and archived manufacturer pages first. Confirm model, version,
   configuration, unit, axis and date before adopting a value.
3. Once a matching official source sufficiently supports a field, use it.
   Continue searching when it does not support the adopted scope or when equally
   authoritative official sources conflict. Differences in lower-priority sources
   do not automatically invalidate a sufficient matching official source.
4. For official omissions, inspect traceable publications, contemporaneous
   reporting, specialist databases, reviews and distributors. Record the actual
   selection and its reason; do not impose an independent laboratory-measurement
   requirement on ordinary catalogue fields.
5. For an unresolved field, record actual queries, search-result screenshots,
   inspected sources and the remaining gap. Distinguish no useful results from
   connection errors, inaccessible pages, blank pages and CAPTCHA blocks. An
   unsuccessful search does not establish that a value or source does not exist.

## Capture and attribution

Load the actual source in a browser. Save the exact quotation or table location,
source URL, relevant unhighlighted capture and a transparent highlighted view.
Keep identifying model/configuration context and the relevant unit/axis visible.
Do not reconstruct a source page from fetched text or use a search snippet as a
substitute for a screenshot of the cited page.

Record the actual capture or visit time and its basis. Reused captures keep their
original timestamp; a packaging date is not a source visit. Preserve an archive
copy and its SHA-256 fingerprint. The publication website uses compressed display
copies with unchanged pixel dimensions, linked to those fingerprints. Where an
existing record lacks a required capture, preserve that gap rather than declaring
the evidence review complete.

## Field interpretation and adoption

- Weight describes the adopted head-worn configuration. Bare-headset mass does
  not silently replace an assembly including straps/supports. Preserve ranges,
  approximate values and strict or inclusive inequalities. A reported bound is
  a threshold, not a measured mass;
  see [field definitions](DATA_FIELDS.md).
- Preserve per-eye resolution, display structure and the source's meaning of
  pixels. Multi-resolution displays can use a separately documented central
  calibration region without replacing whole-device specifications.
- If a source does not specify FOV axis, the project defaults to horizontal;
  if it does not specify PPD location, the project defaults to central. Record
  these as project conventions, never as quotations from the source. Explicit
  scope overrides a default. The SARC model retains the source-axis status as an
  input; its geometric proxy assumptions are described separately.
- Adopt official PPD when available. Otherwise calculate SARC from documented,
  compatible inputs. Third-party PPD remains in independent reference fields
  with quotations and captures; it is not relabelled as a project estimate.
- Estimated, shared or qualified specifications may be used with their stated
  rationale and limitations. Missing a field limits uses that depend on it; it does not automatically
  remove the device from the catalogue.
- A score describes evidence support strength and the stated reason, not a
  probability that a specification is objectively correct.

## Review and update

For each adopted field, check model/configuration alignment, number, unit, axis,
quotation-to-capture agreement, source priority, intended use and scoring reason.
Record the decision and its supporting evidence.

Contributors submit proposed field changes plus URLs, quotations and evidence
through the website's GitHub Issue form. Maintainers inspect that proposal,
document the adopted value and rationale, and update the database. Refit SARC when its official reference inputs or
grouping change, then check dependent estimates, dataset exports, source links
and checksums. 
