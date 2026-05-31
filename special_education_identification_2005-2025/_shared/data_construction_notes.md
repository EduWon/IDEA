# Data Construction Notes — IDEA Part B State Panel

**Scope.** State-level child counts of students served under IDEA Part B
by federal disability category (SY 2005-06 to SY 2024-25, 20 years),
plus PK-12 state enrollment denominators (SY 2005-06 to SY 2023-24,
19 years) to enable identification rate calculation. 50 states + DC.

**One paragraph rationale.** v1 of this database accumulated dimensions
(race, sex, EL, environment, age detail) and time ranges (NCES 1976+
national, OSEP 2005+ state) incrementally and without a self-describing
metadata layer. The result was a DB whose column definitions, source
provenance, and caveats were partly in code, partly in a README, and
partly in the builder's head. v2 starts from a deliberately narrow
scope: **two fact tables (counts + enrollment), three sources, twenty
school years for counts and nineteen for rates**.

---

## 1. Scope

### 1.1 In scope

- **Jurisdiction**: 50 states + District of Columbia (51 units).
- **Disability category**: 13 federal IDEA Part B categories + ALL (§3).
- **School year**:
  - Disability counts: SY 2005-06 through SY 2024-25 (20 years).
  - PK-12 enrollment denominator: SY 2005-06 through SY 2023-24 (19 years).
  - Identification rate (count / enrollment): 19 years; SY 2024-25 is
    "count only, no rate".
- **Sources**:
  - OSEP §618 Part B Child Count raw CSV (the numerator).
  - NCES Digest 203.20 from Digest 2013 (d13) and Digest 2024 (d24)
    (the denominator). See §2.2.

### 1.2 Explicitly out of scope (do not load)

| Out | Notes |
|---|---|
| SY 1976-77 through SY 2004-05 | OSEP Annual Report PDFs only; PDF parsing cost is disqualifying for v2 |
| SY 2024-25 enrollment denominator | NCES Digest 2025 (d25) not yet released; add in v2.1 |
| Race / ethnicity | v3 separate project |
| Sex | v3 separate project |
| English Learner / LEP | v3 separate project |
| Educational environment / LRE placement | v3 separate project |
| Disability sub-categories (e.g. separate Deafness, DD age-split) | NOT a v3 item — no such detail exists in OSEP §618 source; all labels map losslessly to the 13 federal categories (audited 2026-05-30, §3.2) |
| Single-age detail (age 3, 4, ..., 21) | v3 if needed |
| IDEA Part C (early intervention, ages 0-2) | different project entirely |
| LEA / district-level counts | different project |
| School-level counts | different project |
| Outcomes (graduation, exiting, discipline, assessment) | different project |
| Race-stratified or sex-stratified enrollment denominator | v3 (would require NCES CCD raw) |
| NCES national totals (Table 204.30) | computed on-demand, not stored |

### 1.3 Single deliverable

One SQLite database file plus the build script that produced it plus
this SPEC. No web UI, no API, no automated refresh. Annual refresh is
a manual re-run after OSEP publishes the next year's count file and
NCES publishes the next Digest edition.

---

## 2. Data sources (verified 2026-05-29)

### 2.1 Numerator source: OSEP §618 Part B Child Count

Two CKAN datasets on `data.ed.gov` host all 20 child-count files:

**Pre-SY 2012-13** — "IDEA Section 618 State Level Data Files Part B Child Count":
- Dataset URL: https://data.ed.gov/dataset/idea-section-618-state-level-data-files-part-b-child-count
- Dataset UUID: `207550d8-e977-448a-bf44-15e35104b9d1`
- Format: Child Count only (no educational environments).
- Years: SY 2005-06 through SY 2011-12 (7 files).
- Filename pattern: `bchildcount{fall_year}.csv`.

**SY 2012-13 onward** — "IDEA Section 618 State Part B Child Count and Educational Environments":
- Dataset URL: https://data.ed.gov/dataset/idea-section-618-state-part-b-child-count-and-educational-environments
- Dataset UUID: `71ca7d0c-a161-4abe-9e2b-4e68ffb1061a`
- Format: Combined Child Count + Educational Environments. **The
  educational environment is a ROW dimension (`SEA Education
  Environment`), not a set of columns.** Each (state, disability,
  age-group) appears once per environment PLUS a `Total, *` row that
  equals the sum of the individual environments. v2 reads ONLY the
  `Total, Early Childhood` / `Total, School Age` (older: `Total, Age 3-5`
  / `Total, Age 6-21`) rows — the EC total carries the 3-5 band, the
  School-Age total the 6-21 band. Summing the individual environment rows
  would double-count against the Total rows, so they are ignored. This is
  the correct reading of "ignore environment breakdown"; the figures
  themselves come from the Total rows.
- Years: SY 2012-13 through SY 2024-25 (13 files).
- Filename patterns:
  - SY 2012-13 through SY 2016-17: `bchildcountandedenvironments{fall_year}.csv`
  - SY 2017-18 through SY 2019-20: `bchildcountandedenvironments{SY}.csv`
  - SY 2020-21 onward: `bchildcountandedenvironment{SY}.csv` (singular)

### 2.2 Denominator source: NCES Digest Table 203.20

NCES Digest Table 203.20 ("Enrollment in public elementary and secondary
schools, by region, state, and jurisdiction: Selected years"). Each
Digest edition publishes selected years. A **single edition does not
cover the full 19-year window**; two editions combined do:

**NCES Digest 2013 (d13), Table 203.20** — covers Fall 1990, 2000-2011 actual:
- URL: https://nces.ed.gov/programs/digest/d13/tables/xls/tabn203.20.xls
- Use for: SY 2005-06 through SY 2010-11 (6 years).
- SHA-256 verified 2026-05-29: `e8019e10e1cc60d196b1d7d04d0b3610bf74d8c5b3bee0ab8cc3711ca4874cf8`

**NCES Digest 2024 (d24), Table 203.20** — covers Fall 1990, 2000, 2011-2023 actual:
- URL: https://nces.ed.gov/programs/digest/d24/tables/xls/tabn203.20.xlsx
- Use for: SY 2011-12 through SY 2023-24 (13 years).
- SHA-256 verified 2026-05-29: `8e370b60d62ab13327c3aa8ff2275c70a063e81d96fda050e19b3371178b6226`

**Overlap policy**: SY 2011-12 appears in both editions. Use d24 (more
recent vintage; reflects any NCES revisions). Record d13 as the source
for SY 2005-06 through SY 2010-11 only. Record d24 as source for
SY 2011-12 through SY 2023-24.

**SY 2024-25 enrollment**: NCES Digest 2025 (d25) is expected
December 2025. Add as a third NCES source in v2.1 when published.

### 2.3 Programmatic OSEP access

OSEP files come from `data.ed.gov` (CKAN). The full URL list with
SHA-256 hashes is in **`sources_manifest.json`** under `osep_618_files`.
Each manifest entry (OSEP and NCES) now carries an explicit `source_id`
field — `download.py` reads it directly and writes it to `meta_source`;
it is NOT inferred from filename or edition. This guarantees contract
test #2 (every fact `source_id` exists in `meta_source`) is satisfiable.

To fetch fresh from CKAN:
```python
import urllib.request, json
def get_resources(dataset_uuid):
    url = f"https://data.ed.gov/api/3/action/package_show?id={dataset_uuid}"
    body = urllib.request.urlopen(url, timeout=30).read()
    obj, _ = json.JSONDecoder().raw_decode(body.decode())
    return obj['result']['resources']
pre  = get_resources("207550d8-e977-448a-bf44-15e35104b9d1")
post = get_resources("71ca7d0c-a161-4abe-9e2b-4e68ffb1061a")
```

### 2.4 NCES data documentation

NCES Table 203.20 footnote on the Excel sheet itself:
> "Includes imputations for nonreported prekindergarten enrollment."

The denominator includes NCES-imputed prekindergarten enrollment in
specific (state, year) cells. Flag these in `meta_dataquality` with
`issue_code='IMPUTED_PK'`. v1 found six such cells for California and
Oregon; v2 must rediscover by reading the footnote markers in the Excel
(e.g. `\1\` flags).

### 2.5 Verified at build-spec time (2026-05-29)

- All 20 OSEP raw files: SHA-256 verified against v1 build hashes. All match.
- NCES d13 and d24 Excel files: SHA-256 verified by fresh download.
- v1's NCES file (`nces_203_20_state_enrollment.xlsx`, SHA `be040feb...`)
  was the d23 edition. v2 uses d24 instead because d24 adds Fall 2023
  (SY 2023-24).

---

## 3. The 13 federal disability categories

### 3.1 Canonical codes

| Code | Federal label (as in OSEP files) | Required since |
|---|---|---|
| SLD  | Specific Learning Disability       | EHA 1975          |
| SLI  | Speech or Language Impairment      | EHA 1975          |
| OHI  | Other Health Impairment            | EHA 1975          |
| ID   | Intellectual Disability (was "Mental Retardation" pre-Rosa's Law 2010) | EHA 1975 |
| ED   | Emotional Disturbance              | EHA 1975          |
| MD   | Multiple Disabilities              | EHA 1975          |
| HI   | Hearing Impairment                 | EHA 1975          |
| OI   | Orthopedic Impairment              | EHA 1975          |
| VI   | Visual Impairment                  | EHA 1975          |
| DB   | Deaf-Blindness                     | EHA 1975          |
| AUT  | Autism                             | IDEA 1990         |
| TBI  | Traumatic Brain Injury             | IDEA 1990         |
| DD   | Developmental Delay (optional; state-elected ages 3-5, 3-7, or 3-9) | P.L. 99-457, 1986 |
| ALL  | (aggregate) sum across the 13      | —                 |

All 13 categories are present from SY 2005-06 onward. "Deafness" raw
labels are merged into `HI` (§3.2); there is no 14th `DEAF` code in v2.
`dim_disability` is exactly 13 categories + `ALL` = 14 rows.

### 3.2 Categories needing a decision

**Reporting categories vs. statutory categories.** The 13 disability
categories in this database are the categories as reported in OSEP's IDEA
Section 618 Child Count collection, which do not coincide with the 13
statutory eligibility categories defined in IDEA Part B regulations (34 CFR
§300.8). Two differences matter. First, the statute lists "Deafness" and
"Hearing impairment" as distinct eligibility categories, but the Section
618 child-count files contain no separate "Deafness" label; deaf students
are reported within a single "Hearing impairment" (HI) count. A full audit
of all 20 source files (SY 2005-06 through SY 2024-25) found zero
occurrences of a standalone "Deafness" category, consistent across all 50
states + DC and across every year — the reporting form itself provides no
field to separate the two. Second, "Developmental delay" (DD) is not a
statutory eligibility category — it is a noncategorical option states may
apply to children ages 3–9 at their discretion — yet OSEP reports it as a
distinct child-count line item, and this database loads it as such. As a
result, our HI count subsumes deafness, and DD appears as a category
despite its noncategorical statutory status. Analyses requiring
deaf/hard-of-hearing disaggregation, or strict alignment to the statutory
taxonomy (e.g., cross-national comparisons that map to 34 CFR §300.8),
should treat the Section 618 reporting frame as the operative definition
and not assume statutory equivalence. This distinction is recorded in the
dataset itself: `dim_disability.notes` carries a short caveat on the HI and
DD rows, and `meta_dataquality` carries an info-severity row
(`REPORTING_VS_STATUTORY`). Both are written by `build.py`
(`populate_dims` for the notes, `populate_meta_dataquality` for the ledger
row), so a clean rebuild reproduces them.

Earlier build decisions, subsumed by the paragraph above:

- **Deafness vs HI** (RESOLVED — non-issue): a full audit of all 20 OSEP
  §618 files (2026-05-30) found that "Deafness" is NEVER reported as a
  separate label. OSEP §618 child count uses exactly the 13 federal
  categories (Deafness is folded into Hearing Impairment at source). The
  `DEAF` code contemplated in early drafts has no raw counterpart and is
  not loaded. `dim_disability` is fixed at 13 categories + ALL.
- **Disability sub-categorization is NOT a v3 item.** There is no
  sub-category information in the source to load — see §1.2. The only
  label variation is cosmetic (plural forms, "Mental retardation"→ID, a
  DD age-eligibility note), all losslessly normalized to the 13 codes.
- **Suffixed labels**: strip "(Ages 3-5)" type suffixes; rely on age
  columns for age detail.

### 3.3 Label normalization

| Raw OSEP label | Normalize to |
|---|---|
| "Mental Retardation" | `ID` |
| "Intellectual Disability" | `ID` |
| "Serious Emotional Disturbance" or "Emotional Disturbance" | `ED` |
| "Autistic" or "Autism" | `AUT` |
| "Developmental Delay" or "Developmental Delays" | `DD` |
| "Deafness" | `HI` (merged; not a separate code — see §3.2) |
| "All Disabilities" or "All disabilities" | `ALL` |

---

## 4. Schema

### 4.1 Core fact tables (two)

```sql
CREATE TABLE fact_state_disability (
    school_year       TEXT NOT NULL,    -- e.g. '2014-15'
    state_code        TEXT NOT NULL,    -- 'TX', 'CA', 'DC'
    disability_code   TEXT NOT NULL,
    age_band          TEXT NOT NULL,    -- '3-5' | '6-21' | 'ALL'
    n_students        INTEGER,          -- NULL if suppressed
    source_id         TEXT NOT NULL,
    dq_flag           TEXT,
    PRIMARY KEY (school_year, state_code, disability_code, age_band)
);

CREATE TABLE fact_state_enrollment (
    school_year       TEXT NOT NULL,    -- '2014-15'
    state_code        TEXT NOT NULL,    -- 'TX', 'CA', 'DC'
    n_total           INTEGER NOT NULL, -- PK-12 fall membership, all public schools
    source_id         TEXT NOT NULL,    -- 'nces_d13_203_20' or 'nces_d24_203_20'
    dq_flag           TEXT,             -- e.g. 'IMPUTED_PK'
    PRIMARY KEY (school_year, state_code)
);
```

Design decisions:

- **`fact_state_enrollment`** is single-column (`n_total`). No grade
  breakdown, no race/sex/EL split. NCES Digest 203.20 reports total
  PK-12 only; that's all we need for the identification rate.
- **`fact_state_disability`** has 20 years; **`fact_state_enrollment`**
  has 19 years. The asymmetry is intentional and documented; SY 2024-25
  identification rate is not computable until v2.1.
- **`source_id`** in both tables points to `meta_source`. No row without
  a source.

### 4.1a Synthesis of ALL rows (single canonical procedure)

`v_identification_rate` depends on the cell `(disability_code='ALL',
age_band='ALL')`. OSEP raw does not always provide this cell directly,
so loaders synthesize it. **All four branches below live in one function
`synthesize_all_cells()` in `loaders/common.py`** — do not implement them
as independent patches, or a branch will be missed.

1. **age_band='ALL' (per disability_code)**: insert a derived row with
   `n_students = SUM(component bands)`, `dq_flag='DERIVED_AGE_ALL'`.
   **NULL propagation**: if ANY component band ('3-5' or '6-21') is NULL
   (e.g. OSEP suppressed an entire age group with the '*' data-quality
   marker — observed for WY SY2014-15, ME/VT SY2017-18, LA SY2020-21),
   the derived ALL is also NULL with `dq_flag='ALL_INCOMPLETE_BAND'`. A
   partial sum (3-5 only) would understate the total and produce a
   spurious ~1-3% identification rate, so the cell is treated as missing
   in both the count tables and v_identification_rate.

2. **disability_code='ALL' (per age_band)**: insert a derived row with
   `n_students = SUM` over the 13 federal categories (after Deafness→HI
   merge per §3.2; always 13, never 14), `dq_flag='DERIVED_DIS_ALL'`.

3. **NONCATEGORICAL states (meta_dataquality issue #14, e.g. IA SY
   2019-20 onward)**: do NOT sum 13 categories (they are absent). Read
   the `ALL` row directly from raw; `dq_flag='ALL_NONCATEGORICAL'`. The
   Phase 3 "13-category sum = ALL" reconciliation skips these (state,
   year) pairs and lists them in test output.

4. **Block-flagged anomaly cells (meta_dataquality severity='block',
   e.g. issue #16 AZ×MD×SY2024-25, an implausible 1,792→34,953 jump)**:
   the cell is IMPUTED with the same cell's prior-year value
   (carry-forward), `dq_flag='IMPUTED_PRIOR_YEAR'`, before any ALL sum.
   The raw (anomalous) value is preserved in meta_dataquality.source_ref
   for audit but is NOT written to fact. This keeps the normal category
   count intact (block-exclusion would zero out the real ~1,792 students)
   and lets 13-category-sum = ALL hold. Imputation is a synthesized
   estimate, not measured — flagged accordingly — and affects only the
   count tables; SY2024-25 has no enrollment denominator so it never
   enters v_identification_rate.

The (ALL, ALL) cell is produced by applying branch 1 to the branch-2
output (or equivalently branch 2 to branch-1 output); the function must
guarantee exactly one (ALL, ALL) row per (school_year, state_code).

### 4.2 Derived view

```sql
CREATE VIEW v_identification_rate AS
SELECT
    d.school_year,
    d.state_code,
    d.n_students          AS n_served,
    e.n_total             AS n_enrolled,
    100.0 * d.n_students / e.n_total AS pct_identified
FROM fact_state_disability d
JOIN fact_state_enrollment e
  ON d.school_year = e.school_year
 AND d.state_code  = e.state_code
WHERE d.disability_code = 'ALL'
  AND d.age_band        = 'ALL';
```

INNER JOIN ⇒ SY 2024-25 absent until enrollment is added in v2.1.
Documented in `meta_metric` (§4.4).

### 4.3 Dimension tables

```sql
CREATE TABLE dim_disability (
    code               TEXT PRIMARY KEY,
    label              TEXT NOT NULL,
    federal_required   INTEGER NOT NULL,
    federal_added_year INTEGER NOT NULL,
    notes              TEXT
);

CREATE TABLE dim_jurisdiction (
    code       TEXT PRIMARY KEY,    -- 'TX', 'CA', 'DC'
    name       TEXT NOT NULL,
    fips       TEXT NOT NULL
);

CREATE TABLE dim_year (
    school_year  TEXT PRIMARY KEY,
    fall_year    INTEGER NOT NULL
);
```

`dim_year` built from `SELECT DISTINCT school_year` over both fact
tables (the union; v1 N6 lesson).

### 4.4 Metadata tables (required from day one)

```sql
CREATE TABLE meta_source (
    source_id        TEXT PRIMARY KEY,    -- 'osep_618_2005_06', 'nces_d24_203_20'
    source_class     TEXT NOT NULL,       -- 'OSEP_618' | 'NCES_DIGEST'
    description      TEXT NOT NULL,
    school_year      TEXT,                -- per-year for OSEP; NULL for NCES (multi-year)
    edition          TEXT,                -- 'Digest 2024' for NCES; NULL for OSEP
    url              TEXT NOT NULL,
    retrieval_date   TEXT NOT NULL,       -- ISO date when downloaded
    raw_file_path    TEXT NOT NULL,
    sha256           TEXT NOT NULL,
    doc_url          TEXT,
    notes            TEXT
);

CREATE TABLE meta_column (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name   TEXT NOT NULL,
    column_name  TEXT NOT NULL,
    description  TEXT NOT NULL,           -- non-empty enforced
    unit         TEXT,
    source_id    TEXT,
    computation  TEXT,
    status       TEXT NOT NULL,           -- 'verified' | 'pending'
    notes        TEXT,
    UNIQUE(table_name, column_name)
);

CREATE TABLE meta_metric (
    metric_id           TEXT PRIMARY KEY,
    description         TEXT NOT NULL,
    numerator_source    TEXT NOT NULL,    -- table.column or expression
    numerator_filter    TEXT,             -- WHERE clause
    denominator_source  TEXT NOT NULL,
    denominator_filter  TEXT,
    formula             TEXT NOT NULL,
    unit                TEXT NOT NULL,
    age_scope_num       TEXT NOT NULL,    -- 'ages 3-21'
    age_scope_den       TEXT NOT NULL,    -- 'PK-12 enrollment'
    coverage            TEXT NOT NULL,    -- 'SY 2005-06 to SY 2023-24'
    asymmetries         TEXT,             -- documented numerator/denominator mismatches
    notes               TEXT
);

CREATE TABLE meta_dataquality (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    school_year     TEXT,
    state_code      TEXT,
    disability_code TEXT,
    issue_code      TEXT NOT NULL,
    severity        TEXT NOT NULL,        -- 'block' | 'warn' | 'info'
    description     TEXT NOT NULL,
    source_ref      TEXT NOT NULL         -- footnote verbatim
);

CREATE TABLE meta_db_version (
    version    TEXT PRIMARY KEY,
    applied_on TEXT NOT NULL,
    notes      TEXT
);
```

`meta_metric` has exactly **one row at v2.0.0**:

| metric_id | identification_rate |
|---|---|
| description | Share of public school PK-12 enrollment identified for IDEA Part B services |
| numerator_source | `fact_state_disability.n_students` |
| numerator_filter | `disability_code='ALL' AND age_band='ALL'` |
| denominator_source | `fact_state_enrollment.n_total` |
| denominator_filter | (none) |
| formula | `100.0 * n_students / n_total` |
| unit | percent |
| age_scope_num | ages 3 through 21 (IDEA Part B served population) |
| age_scope_den | PK-12 fall membership (NCES public school enrollment) |
| coverage | SY 2005-06 through SY 2023-24 (19 years) |
| asymmetries | (1) Numerator includes ages 19-21 in IDEA transition services that are typically not in the PK-12 denominator (upward bias). (2) Numerator includes parentally-placed private school children receiving services under an ISP (IDEA §300.132); the denominator counts only public school enrollment. This is an upward bias in the SAME direction as (1), NOT an aligned/canceling effect. (3) Federal disability categories composing the numerator are stable across this 19-year window (no category additions). |
| notes | (1) and (2) are both upward biases on the rate. Their combined magnitude is NOT separately bounded in v2; treat v_identification_rate as a slight overestimate of true PK-12 identification share. Quantifying (2) would require private-school ISP counts not loaded in v2. |

No other derived metrics in v2. The single metric is the only quantitative
claim the v2 schema actively supports. Composition shares
(SLD / ALL etc.) are computed from `fact_state_disability` directly
without needing `meta_metric` rows; they are descriptive arithmetic, not
defined metrics with documented asymmetries.

### 4.5 Self-description contract (enforced by build tests)

`tests/test_contract.py` must run after the build and fail the run if
any of these are false:

1. Every column in every user table has a row in `meta_column` with non-empty `description`.
2. Every `source_id` in `fact_state_disability` and `fact_state_enrollment` exists in `meta_source`.
3. Every `disability_code` in `fact_state_disability` exists in `dim_disability`.
4. Every `state_code` in both fact tables exists in `dim_jurisdiction`.
5. Every `school_year` in either fact table exists in `dim_year`.
6. Every `meta_source` row has non-empty `url`, ISO-format `retrieval_date`, and 64-char `sha256`.
7. Every raw file on disk hashes to its `meta_source.sha256`.
8. `meta_dataquality.severity` ∈ {'block', 'warn', 'info'}.
9. `meta_db_version` has at least one row.
10. `dim_year` rows equal `SELECT DISTINCT school_year FROM (fact_state_disability UNION fact_state_enrollment)`.
11. Every metric in `meta_metric` has non-empty `coverage` and `asymmetries` fields (NULL allowed only if no asymmetries).
12. `v_identification_rate` returns rows only for years where both fact tables have data (inner-join check: `COUNT(DISTINCT school_year)` = 12 at v2.0.0). The 12 are SY 2012-13 through SY 2023-24, the intersection of OSEP disability years (SY 2012-13..2024-25) and NCES d24 enrollment years (SY 2011-12..2023-24). At v2.1.0 this becomes 19 (SY 2005-06..2023-24).

Fail the build on any failure.

---

### 4.6 v3 extension: LRE / educational environment (School Age 6-21)

Status: **v3**, post-2012 only (SY2012-13..2024-25; pre-2012 files have no
environment dimension). Scope decision: School Age (6-21) only — the EC
(3-5) environment taxonomy is a different, non-comparable classification
system, so a unified inclusion metric across age bands is not meaningful.

**Source structure (verified 2026-05-30):** environment is a ROW
dimension. School-Age data is carried in the `Age 5 (School Age)-21`
(2020+) / `Ages 6-21` (≤2019) column. Nine standard OSEP placement groups
partition the School-Age population exactly: **where a (state, year) has
reported environment rows, the group sum equals `Total, School Age` with 0
mismatches** (territories excluded). Raw environment labels are normalized
to these groups (table below); label wording drifted over the years (e.g.
"of day"→"of the day", "Total, Age 6-21"→"Total, School Age") and is
normalized away.

**KNOWN DEFECT — SY2019-20 environment coverage (verified 2026-05-30).**
The "all 51 states, all 13 years" coverage claim does NOT hold for the
environment fact: in SY2019-20, **34 of the 51 jurisdictions have no
environment rows at all** for `disability_code='ALL'` (every `n_students`
NULL), so `v_lre_inclusion.n_total_school_age` is 0 and `inclusion_80_rate`
is NULL for those 34 states. The 17 states that DO report (incl. CA, TX,
PA) reconcile normally. SY2019-20 is the age-5 reclassification transition
year (issue #15); the environment dimension was reported only partially.
Consequence: **SY2019-20 must be excluded from any national or
cross-state LRE aggregate.** A naive enrollment-weighted national
inclusion rate that sums numerator and denominator across states collapses
to ~62% in SY2019-20 purely because ~2/3 of the denominator is missing —
an artifact, not a real dip. This (state, year) gap should be recorded as
a `meta_dataquality` row (issue_code `LRE_MISSING_2019_20`, severity
`block`); it is not currently in the ledger.

```
dim_environment(env_group PK, label, lre_tier)
  inside_80_plus   "Inside regular class ≥80% of day"        most_inclusive
  inside_40_79     "Inside regular class 40-79% of day"      partial
  inside_lt_40     "Inside regular class <40% of day"        separate_within
  separate_school  "Separate school"                         separate
  residential      "Residential facility"                    separate
  homebound        "Homebound / hospital"                    other
  correctional     "Correctional facility"                   other
  private          "Parentally placed in private school"     other
  home             "Home"                                    other

fact_state_environment(
  school_year, state_code, disability_code, env_group,
  n_students, source_id, dq_flag,
  PK(school_year, state_code, disability_code, env_group))
```

**Metric — `v_lre_inclusion`** (OSEP's headline LRE indicator):
`inclusion_80_rate = 100 * inside_80_plus / total_school_age`, where
total_school_age is the sum over all nine groups for
(school_year, state_code, disability_code='ALL'). Asymmetry: suppressed
('*'/'x') environment cells are treated as 0 within the group sum; a
state-year whose `Total, School Age` is itself suppressed yields a NULL
rate (no spurious denominator).

---

## 5. Pre-loaded data quality issues

These caveats are pre-loaded into `meta_dataquality` at build time. Each
row includes the verbatim source footnote text in `source_ref`.

| # | issue_code | scope | severity | source |
|---|---|---|---|---|
| 1 | SUPPRESSED | WI, SY 2016-17 through SY 2019-20 | block | NCES Digest 2022 Table 204.70 footnote 6 |
| 2 | TX_CAP | TX, SY 2005-06 through SY 2017-18 | warn | Texas Education Agency administrative cap |
| 3 | COVID | all states, SY 2020-21 | info | OSEP Fast Facts COVID note |
| 4 | MISSING | VT, SY 2007-08 | block | NCES Digest Table 204.30 footnote 1 |
| 5 | MISSING | VT, SY 2008-09 | block | NCES Digest Table 204.30 footnote 1 |
| 6 | DD_GAP | all states, SY 2012-13 | warn | OSEP raw file structure |
| 7 | DD_GAP | all states, SY 2013-14 | warn | OSEP raw file structure |
| 8 | AGE_BACKFILL | NE 3-5, SY 2016-17 | warn | NCES Digest 2022 Table 204.30 footnote 3 |
| 9 | AGE_BACKFILL | ME 6-21, SY 2017-18 | warn | NCES Digest 2022 Table 204.30 footnote 4 |
| 10 | AGE_BACKFILL | MN 3-5, SY 2017-18 | warn | NCES Digest 2022 Table 204.30 footnote 4 |
| 11 | AGE_BACKFILL | VT 6-21, SY 2017-18 | warn | NCES Digest 2022 Table 204.30 footnote 4 |
| 12 | AGE_BACKFILL | LA, SY 2020-21 | warn | NCES Digest 2022 Table 204.30 footnote 6 |
| 13 | AGE_BACKFILL | LA, SY 2021-22 | warn | NCES Digest 2022 Table 204.30 footnote 7 |
| 14 | NONCATEGORICAL | IA, SY 2019-20 onward | block | OSEP raw: Iowa reports only ALL |
| 15 | AGE_5_RECLASS | all states, SY 2020-21 onward | info | OSEP FFY 2020 reporting change: school-age 5-year-olds moved from the 3-5 band to a new `Age 5 (School Age)-21` column. Loader rule: 6-21 band reads `Ages 6-21` through SY2019-20 and `Age 5 (School Age)-21` from SY2020-21; the 3-5 band reads whichever of `Age 3 to 5` / `Age 3 to 5 (Early Childhood)` is populated (never both). SY2019-20 is transitional (3-5 in the EC column, 6-21 still `Ages 6-21`). |
| 16 | ANOMALY | AZ × MD × SY 2024-25 | block | v1 review finding (count jumped 1,792→34,953) |
| 17 | IMPUTED_PK | CA/OR, multiple years | warn | NCES Digest 2023 Table 203.20 footnote 1: "Includes imputations for nonreported prekindergarten enrollment." Discover specific cells by scanning d13.xls and d24.xlsx footnote markers. |
| 18 | NO_RATE_DATA | all states, SY 2024-25 | block | Enrollment denominator not yet published; identification rate not computable until v2.1 |

Issue #18 is automatically true for SY 2024-25 until d25 is published.

When a future year introduces new issues, **add a row, do not create a
separate CAVEATS.md**.

---

## 6. Build phases

### Phase 0: setup (1 hour)

```
idea_db_v2/
  raw/
    osep/                       # bchildcount*.csv and bchildcountandedenvironment*.csv
    nces/                       # tabn203.20_d13.xls and tabn203.20_d24.xlsx
  schema/
    01_dim.sql                  # dim tables
    02_fact.sql                 # fact_state_disability + fact_state_enrollment
    03_meta.sql                 # meta_source, meta_column, meta_metric, meta_dataquality, meta_db_version
    04_views.sql                # v_identification_rate
    05_lre.sql                  # v3: dim_environment, fact_state_environment, v_lre_inclusion
  loaders/
    common.py                   # shared utilities (ALL synthesis, imputation)
    jurisdictions.py            # 51 states + DC, FIPS, scope filter
    osep_pre_2012.py            # SY 2005-06 through SY 2011-12 child count
    osep_post_2012.py           # SY 2012-13 through SY 2024-25 child count (Total rows)
    osep_environment.py         # v3: LRE/environment, School Age 6-21
    nces_203_20.py              # both Digest editions (.xls d13 + .xlsx d24)
  tests/
    test_contract.py            # 12 self-description assertions
    test_values.py              # value sanity checks (incl. pre-2012 tolerance)
    test_metric.py              # identification_rate spot checks
    test_lre.py                 # v3: LRE integrity + inclusion-rate checks
  build.py                      # main entrypoint
  download.py                   # uses sources_manifest.json
  sources_manifest.json         # 22 entries: 20 OSEP + 2 NCES
  SPEC.md                       # this document
  README.md                     # short pointer to SPEC.md
  processed/                    # output SQLite (gitignored)
```

### Phase 1: OSEP post-2012 + NCES d24 → minimum viable (1-2 days)

- Download 13 OSEP files (SY 2012-13 through SY 2024-25) + NCES d24.
- Verify SHA-256 on download (warn but don't fail if NCES files differ
  from manifest — NCES revises editions; OSEP files matching is the
  strict check).
- Write `meta_source` rows automatically with
  `retrieval_date = datetime.date.today().isoformat()`.
- Implement `loaders/osep_post_2012.py`. Read child-count columns only.
- Implement `loaders/nces_203_20.py`. Parse Excel for d24 rows
  corresponding to SY 2011-12 through SY 2023-24. Record any
  PK-imputation footnote markers in `meta_dataquality` as IMPUTED_PK.
- Load `fact_state_disability` (13 years × 51 states × ~14 categories × ~3 age bands).
- Load `fact_state_enrollment` (13 years × 51 states).
- Load `dim_disability`, `dim_jurisdiction`, build `dim_year`.
- Insert pre-known issues into `meta_dataquality`.
- Insert the single `identification_rate` row into `meta_metric`.
- Create `v_identification_rate` view.
- Run all contract tests. Tag as v2.0.0.

### Phase 2: OSEP pre-2012 + NCES d13 (1 day)

- Download 7 OSEP pre-2012 files + NCES d13.
- Implement `loaders/osep_pre_2012.py`. These files have a simpler
  structure (NO environment row dimension; rows are State × Disability).
  Verified findings (2026-05-30): a 'Year' header row after 3-4 preamble
  rows; some years embed newlines inside quoted column names; the band
  totals are exact columns 'Age 3 to 5' and 'Age 6 to 21'; disability
  labels are legacy/plural ('Mental retardation'→ID, 'Hearing
  impairments'→HI, etc.); **SY2009-10 inserts an 'Ethnicity' column that
  shifts 'Disability' from index 2 to 3**, so State/Disability columns
  are located by header label, not fixed index. 'All disabilities' is
  read as raw ALL (see §6 pre-2012 tolerance: raw ALL ≥ sum13).
- Implement d13 parser (older .xls format). Extract Fall 2005-2010 columns,
  map to SY 2005-06 through SY 2010-11.
- Extend `fact_state_disability` by 7 years (now 20 years total).
- Extend `fact_state_enrollment` by 6 years (now 19 years total).
- Verify `v_identification_rate` now returns 19 distinct school years
  (one of the contract tests will check this).
- Tag as v2.1.0.

### Phase 3: validation (half day)

- **The 13-category = ALL reconciliation holds at the level of an
  individual age band ('3-5' and '6-21' separately), NOT at the
  synthesized age_band='ALL' level.** Within each component band, the sum
  over the 13 categories equals the raw "All Disabilities" figure for that
  band (within rounding), for all post-2012 (state, year) pairs except the
  exclusions below. The test MUST be run per band; running it on
  age_band='ALL' is incorrect (see next bullet).
  **Exclusions**: (a) (state, year) pairs flagged NONCATEGORICAL (issue
  #14, e.g. IA SY 2019-20+) are skipped — their ALL is read from raw, not
  summed (§4.1a branch 3); (b) cells flagged severity='block' (e.g. issue
  #16) are imputed with the prior-year value before summing (§4.1a branch
  4), so the recomputed ALL replaces the raw ALL for that (state, year,
  band). Imputed and skipped pairs must be printed in test output, never
  silently passed.
- **age_band='ALL' does NOT satisfy ALL = sum13 in general, by design.**
  Per §4.1a branch 1, a category whose component band is NULL (suppressed
  or unreported) yields a NULL age_band='ALL' cell flagged
  `ALL_INCOMPLETE_BAND`; that category then drops out of the
  category-summed ALL while the (disability='ALL', age='ALL') cell —
  read/derived independently — still reflects the full population. The
  result is `raw_ALL_(ALL,ALL) >= sum13_(age=ALL)` whenever any category
  has an incomplete band. This is observed in post-2012 data every year
  (e.g. AR, NJ, NY, FL, CT; 2–13 states per year), NOT only pre-2012. The
  reconciliation at the age_band='ALL' level therefore checks the WEAKER
  invariant `raw_ALL >= sum13` and lists every (state, year) where a
  strict inequality occurs together with the categories carrying
  `ALL_INCOMPLETE_BAND`; it never asserts equality there.
- **Pre-2012 tolerance (SY 2005-06..2011-12)**: in the pre-2012 files the
  raw "All disabilities" total is consistently ≥ the 13-category sum
  (uncategorized children — chiefly ages 3-5 — are counted in ALL but not
  distributed across the 13 federal categories; observed gap up to ~17%
  in small states). The raw ALL is preserved and used as the rate
  numerator (matching the post-2012 convention where ALL is read from
  raw). The reconciliation for pre-2012 therefore checks the WEAKER
  invariant `raw_ALL >= sum13` (never the reverse) rather than equality,
  and records the gap. Exact equality is asserted only for post-2012 AND
  only per component band ('3-5', '6-21'); never at age_band='ALL' (see
  the ALL_INCOMPLETE_BAND bullet above).
- Sum across 50+DC per category-year should be within 3-5% of NCES
  Digest 204.30 national totals (the documented OSEP-NCES vintage gap).
- Identification rate spot checks (`tests/test_metric.py`):
  - National rate (SY 2012-13) ≈ 12.9%.
  - National rate (SY 2022-23) ≈ 15.2%.
  - Massachusetts SY 2022-23 ≈ 19%.
  - Texas pre/post cap visible.
  - Wisconsin SY 2016-17 to SY 2019-20: rate should be NULL.
- Tag as v2.1.1.

### Phase 4 (deferred): annual refresh

When OSEP publishes SY 2025-26 (expected fall 2026) and NCES publishes
Digest 2025 (expected December 2025 — actually for SY 2024-25 numbers):

1. Fetch latest CKAN package metadata for OSEP, find new resource URL.
2. Download NCES d25 (URL pattern: `https://nces.ed.gov/programs/digest/d25/tables/xls/tabn203.20.xlsx`).
3. Add new entries to `sources_manifest.json`.
4. Re-run `python3 build.py`.
5. Resolve issue #18 (SY 2024-25 NO_RATE_DATA) by removing the row.
6. Verify contract tests. Tag as v2.2.0.

---

## 7. Lessons from v1 (do not repeat)

1. **Don't grow the schema organically.** v1 added six fact tables by
   accretion. v2: two fact tables, no expansion within v2.
2. **Don't let metadata live in a README.** v1's README drifted within
   months. v2: metadata in tables; build script enforces.
3. **Don't let `dim_year` drift from the fact table.** v1's `dim_year`
   missed 5 school years. v2: `dim_year` built from the union of fact
   tables.
4. **Don't accept undocumented columns.** v1's `pct_enrollment` had no
   schema documentation. v2: every column in `meta_column` with
   non-empty description, contract-enforced.
5. **Don't separate CAVEATS from data.** v1's `CAVEATS.md` was a
   floating document. v2: every caveat is a `meta_dataquality` row.
6. **Don't approximate `retrieval_date`.** v1 hardcoded `'2024-09-15'`
   as a post-hoc guess. v2: `download.py` writes `date.today()`
   automatically.
7. **Don't postpone build-time contracts.** v1's tests checked row
   counts but not metadata completeness. v2: `test_contract.py` fails
   the build if `meta_column` is incomplete.
8. **Don't load dimensions you might use later.** v1 loaded race, sex,
   EL, environment "in case". v2: race/sex/EL/environment are all v3.
9. **Don't define metrics in code.** v1 computed identification rate in
   five different chapter notebooks with subtly different filters. v2:
   `meta_metric` row + `v_identification_rate` view is the single
   canonical definition. Notebooks consume the view, not raw fact tables.

---

## 8. Verification checklist before tagging v2.0.0

- [ ] 13 OSEP files for SY 2012-13 through SY 2024-25 in `raw/osep/`, SHA-matching.
- [ ] NCES d24 Table 203.20 file in `raw/nces/`, SHA-matching.
- [ ] `meta_source` has 14 rows (13 OSEP + 1 NCES d24).
- [ ] `dim_disability` has exactly 13 categories + ALL (14 rows; no DEAF — §3.2).
- [ ] `dim_jurisdiction` has exactly 51 rows.
- [ ] `dim_year` equals `SELECT DISTINCT school_year` over both fact tables.
- [ ] `meta_column` covers every column in every user table.
- [ ] `meta_metric` has the single `identification_rate` row.
- [ ] All 18 pre-known issues from §5 are in `meta_dataquality`.
- [ ] `v_identification_rate` returns 12 distinct school years (SY 2012-13 to SY 2023-24).
- [ ] `pytest tests/` passes (test_contract + test_values + test_metric).
- [ ] `meta_db_version` has `v2.0.0` row with today's date.
- [ ] `README.md` points to `SPEC.md`.

## 9. Verification checklist before tagging v2.1.0

- [ ] 7 additional OSEP files for SY 2005-06 through SY 2011-12 in `raw/osep/`, SHA-matching.
- [ ] NCES d13 Table 203.20 file in `raw/nces/`, SHA-matching.
- [ ] `meta_source` has 22 rows (20 OSEP + 2 NCES).
- [ ] `fact_state_disability` covers 20 years.
- [ ] `fact_state_enrollment` covers 19 years.
- [ ] Pre-2012 OSEP columns with inferred meanings marked `status='pending'` in `meta_column`.
- [ ] `v_identification_rate` returns 19 distinct school years.
- [ ] All contract tests pass.
- [ ] `meta_db_version` has `v2.1.0` row.

---

## 10. Notes for the next session

1. **Hash verification first**: download URLs in `sources_manifest.json`
   were verified 2026-05-29. Re-verify hashes before trusting anything.
   OSEP files have not changed since v1; NCES files may have minor
   revisions in newer editions (this is expected, not a problem).

2. **No PDF parsing in v2**. If pre-2005 data feels necessary, that is
   v3.

3. **`meta_column`, `meta_source`, `meta_metric` are not optional.**
   They are part of the build contract. Skipping them "for now"
   reproduces v1's mistake.

4. **Definitional asymmetries belong in `meta_metric.asymmetries`,
   not in white paper prose**. The identification rate has known
   numerator/denominator asymmetries (ages 19-21 in numerator, PK-12 in
   denominator). These are now in the metadata, not hidden in chapter 1
   of a future white paper.

5. **The 19/20-year asymmetry between fact tables is intentional**.
   Do not "fix" it by trimming `fact_state_disability` to 19 years.
   Disability counts for SY 2024-25 are valid data; only the rate is
   uncomputable.

6. **Annual refresh** is the only routine maintenance. Anything else
   is a deliberate decision and a new version tag.

---

## Appendix A: sources_manifest.json structure

```
{
  "schema_version": "1.1",
  "verified_on": "2026-05-29",
  "osep_618_files": [
    {
      "school_year": "2005-06",
      "era": "pre_2012",
      "url": "https://data.ed.gov/.../bchildcount2005.csv",
      "sha256": "33547aef..."
    },
    ... 20 entries
  ],
  "nces_enrollment_files": [
    {
      "source_class": "NCES_DIGEST",
      "table": "203.20",
      "edition": "Digest 2013 (d13)",
      "years_used_in_v2": ["2005-06", "2006-07", "2007-08", "2008-09", "2009-10", "2010-11"],
      "url": "https://nces.ed.gov/programs/digest/d13/tables/xls/tabn203.20.xls",
      "sha256": "e8019e10..."
    },
    ... 2 entries
  ],
  "coverage_notes": {
    "disability_counts": "SY 2005-06 through SY 2024-25 (20 years)",
    "enrollment_denominator": "SY 2005-06 through SY 2023-24 (19 years)",
    "identification_rate": "Computable for 19 years. SY 2024-25 pending d25 (December 2025)."
  }
}
```

If hash verification fails against the manifest, OSEP/NCES has revised
the file — record as `meta_dataquality` row with
`issue_code='UPSTREAM_REVISION'` and proceed with the new file.
