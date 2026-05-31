# Twenty Years of Special Education Identification in the United States

### A State-by-Category Descriptive Analysis, 2005–2025

---

**Abstract.** This study describes two decades of special-education
identification in the United States using a state-by-category panel of IDEA
Part B child counts (SY2005-06 to SY2024-25), joined to NCES public-school
enrollment to form a national and state-level identification rate. We
document a shallow-U national trend that rose to a record 15.7% by
SY2023-24; a reorganization of the category mix away from specific learning
disability toward autism and other-health-impairment; a near-fivefold rise
in administrative autism identification that sits below but parallel to
epidemiological estimates and varies threefold across states; a durable
~1.85-fold cross-state gap in which an administrative cap is plainly
visible in Texas; a steady rise in inclusive placement that remains sharply
unequal by disability category; and a COVID-19 rate rise that is shown to
be an enrollment-denominator artifact rather than expanded identification.
Throughout, we separate what the data establish from what they cannot:
because the panel is aggregate and child-anonymous, it describes *what*
changed, *where*, and *by how much*, but cannot adjudicate over- versus
under-identification, test diagnostic substitution, or assign causes.

**Data and reproducibility.** All figures and statistics are computed from
an assembled relational dataset (`_shared/idea_db_v2.sqlite`); each
chapter's `chapterN_analysis.ipynb` regenerates that chapter's figures from
the dataset alone. Source files (OSEP §618 Child Count; NCES Digest Table
203.20) and their provenance are listed in `_shared/sources_manifest.json`.

---

## Contents

| # | Chapter | Topic |
|---|---|---|
| 1 | The Data and Its Measurement Limits | Sources, construction, and the threats that bound every later claim |
| 2 | The National Identification Trend | The shallow-U rate, decomposed into numerator and denominator |
| 3 | The Recomposition of Disability Categories | SLD's relative decline; the rise of autism and OHI |
| 4 | Anatomy of the Autism Increase | Administrative vs epidemiological prevalence; state dispersion |
| 5 | Cross-State Variation in Identification | A durable ~1.85-fold gap; the Texas administrative cap |
| 6 | Placement in the Least Restrictive Environment | Rising but category-unequal inclusion |
| 7 | The COVID-19 Inflection | A denominator-shock rate rise; the disrupted referral pipeline |
| 8 | Synthesis | What the panel shows, and what it cannot |

Each chapter folder contains the chapter text (`chapterN.md`, Markdown with
LaTeX), its analysis notebook (`chapterN_analysis.ipynb`), and its figures
(`figures/`). Shared materials — the dataset, the source manifest, and a
combined figure folder — are in `_shared/`.
