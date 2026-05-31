# Twenty Years of Special Education Identification in the United States
### A State-by-Category Descriptive Analysis, 2005–2025

A descriptive study of two decades of IDEA Part B special-education
identification, built on a state-by-category panel (SY2005-06 to
SY2024-25) joined to NCES public-school enrollment.

Start with **`00_title_and_contents.md`** for the abstract and chapter map.

## Contents

```
.
  00_title_and_contents.md           <- title, abstract, contents
  README.md                          <- this file
  _shared/
    idea_db_v2.sqlite                <- the assembled dataset (all notebooks read this)
    sources_manifest.json            <- OSEP + NCES source URLs and SHA-256 hashes
    build.py                         <- build script that assembles the dataset from source files
    data_construction_notes.md       <- how the data were assembled; processing rules and caveats
    migrate_reporting_vs_statutory.py <- idempotent patch for an existing dataset (rebuild via build.py needs no patch)
  chapter1_dataset_and_measurement_limits/
    chapter1.md                      <- chapter text (Markdown + LaTeX)
    chapter1_analysis.ipynb          <- reproduces every figure and statistic
    figures/                         <- this chapter's figures (PNG)
  chapter2_national_identification_trend/
  chapter3_category_recomposition/
  chapter4_autism_increase/
  chapter5_cross_state_variation/
  chapter6_lre_placement/
  chapter7_covid_inflection/
  chapter8_synthesis/                <- synthesis chapter (text only, no notebook)
```

## Chapter map

| # | Chapter | Figures | Key external sources cited |
|---|---|---|---|
| 1 | The Data and Its Measurement Limits | 1.1-1.3 | OSEP §618, NCES Digest 203.20 |
| 2 | The National Identification Trend | 2.1-2.2 | NCES Fast Facts, ECS, Morgan/Brookings |
| 3 | The Recomposition of Disability Categories | 3.1-3.3 | Shattuck 2006, Nelson 2017, Nat. Academies |
| 4 | Anatomy of the Autism Increase | 4.1-4.3 | CDC ADDM (MMWR), Shattuck 2006 |
| 5 | Cross-State Variation in Identification | 5.1-5.3 | Morgan et al. 2023 (TX cap), OSEP 2018 |
| 6 | Placement in the Least Restrictive Environment | 6.1-6.3 | Penn GSE Inclusion Census |
| 7 | The COVID-19 Inflection | 7.1-7.2 | Hopkins et al. 2025 (EEPA), CALDER, NBER |
| 8 | Synthesis | — | — |

## How to read

Open any `chapterN.md` in VS Code (or any Markdown previewer). Figures are
linked with relative paths (`figures/figN_*.png`) and render inline. LaTeX
math renders in VS Code's Markdown preview with a math extension, or on
GitHub/Jupyter.

## How to reproduce

Each chapter's notebook reads only `../_shared/idea_db_v2.sqlite` and writes
its figures into the chapter's own `figures/` folder:

```bash
pip install jupyter pandas numpy matplotlib --break-system-packages
cd chapterN_*/
jupyter nbconvert --to notebook --execute --inplace chapterN_analysis.ipynb
```

CDC ADDM benchmarks (Chapter 4) and the Texas-cap dates and OSEP finding
(Chapter 5) are external constants entered in the notebook/text, cited
inline; everything else is computed from the dataset.

## Two data-construction notes carried in the text

While assembling the data we made two decisions worth flagging; both are
discussed in the chapters and recorded in
`_shared/data_construction_notes.md`:

1. **Composition is computed within a fixed age band** (Chapter 1 §1.5,
   §1.7). The 13 category counts sum exactly to the "All Disabilities" total
   only per age band; at the all-ages level, categories with a missing
   component band are left NULL rather than partially summed, so all-ages
   category sums understate the total. All composition analysis therefore
   stays within the 6-21 band.

2. **SY2019-20 placement data are incomplete** (Chapter 6 §6.2). In that
   year 34 of 51 states report no LRE/environment data, so it is excluded
   from all placement aggregates.

## Data scope (one-line reminders)

- Identification rate: 19 years (SY2005-06 -> SY2023-24); SY2024-25 has
  counts but no rate (enrollment denominator pending).
- LRE/environment: school-age (6-21) only, SY2012-13 -> SY2024-25,
  SY2019-20 excluded.
- The dataset is aggregate and child-anonymous: it describes *what*
  changed, *where*, and *by how much*, but cannot adjudicate over- vs
  under-identification, test diagnostic substitution, or separate
  catch-up from new identification.
