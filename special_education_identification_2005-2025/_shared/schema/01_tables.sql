-- table: dim_disability
CREATE TABLE dim_disability (
    code               TEXT PRIMARY KEY,
    label              TEXT NOT NULL,
    federal_required   INTEGER NOT NULL,
    federal_added_year INTEGER NOT NULL,
    notes              TEXT
);

-- table: dim_environment
CREATE TABLE dim_environment (
    env_group   TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    lre_tier    TEXT NOT NULL    -- most_inclusive | partial | separate_within | separate | other
);

-- table: dim_jurisdiction
CREATE TABLE dim_jurisdiction (
    code       TEXT PRIMARY KEY,    -- 'TX', 'CA', 'DC'
    name       TEXT NOT NULL,
    fips       TEXT NOT NULL
);

-- table: dim_year
CREATE TABLE dim_year (
    school_year  TEXT PRIMARY KEY,
    fall_year    INTEGER NOT NULL
);

-- table: fact_state_disability
CREATE TABLE fact_state_disability (
    school_year       TEXT NOT NULL,    -- e.g. '2014-15'
    state_code        TEXT NOT NULL,    -- 'TX', 'CA', 'DC'
    disability_code   TEXT NOT NULL,
    age_band          TEXT NOT NULL,    -- '3-5' | '6-21' | 'ALL'
    n_students        INTEGER,          -- NULL if suppressed
    source_id         TEXT NOT NULL,    -- FK -> meta_source.source_id
    dq_flag           TEXT,             -- DERIVED_AGE_ALL | DERIVED_DIS_ALL
                                        -- | ALL_NONCATEGORICAL | ALL_EXCLUDES_BLOCKED | ...
    PRIMARY KEY (school_year, state_code, disability_code, age_band)
);

-- table: fact_state_enrollment
CREATE TABLE fact_state_enrollment (
    school_year       TEXT NOT NULL,    -- '2014-15'
    state_code        TEXT NOT NULL,    -- 'TX', 'CA', 'DC'
    n_total           INTEGER NOT NULL, -- PK-12 fall membership, all public schools
    source_id         TEXT NOT NULL,    -- 'nces_d13_203_20' | 'nces_d24_203_20'
    dq_flag           TEXT,             -- e.g. 'IMPUTED_PK'
    PRIMARY KEY (school_year, state_code)
);

-- table: fact_state_environment
CREATE TABLE fact_state_environment (
    school_year      TEXT NOT NULL,
    state_code       TEXT NOT NULL,
    disability_code  TEXT NOT NULL,
    env_group        TEXT NOT NULL,
    n_students       INTEGER,          -- NULL if suppressed
    source_id        TEXT NOT NULL,
    dq_flag          TEXT,
    PRIMARY KEY (school_year, state_code, disability_code, env_group)
);

-- table: meta_column
CREATE TABLE meta_column (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name   TEXT NOT NULL,
    column_name  TEXT NOT NULL,
    description  TEXT NOT NULL,           -- non-empty enforced by test_contract #1
    unit         TEXT,
    source_id    TEXT,
    computation  TEXT,
    status       TEXT NOT NULL,           -- 'verified' | 'pending'
    notes        TEXT,
    UNIQUE(table_name, column_name)
);

-- table: meta_dataquality
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

-- table: meta_db_version
CREATE TABLE meta_db_version (
    version    TEXT PRIMARY KEY,
    applied_on TEXT NOT NULL,
    notes      TEXT
);

-- table: meta_metric
CREATE TABLE meta_metric (
    metric_id           TEXT PRIMARY KEY,
    description         TEXT NOT NULL,
    numerator_source    TEXT NOT NULL,
    numerator_filter    TEXT,
    denominator_source  TEXT NOT NULL,
    denominator_filter  TEXT,
    formula             TEXT NOT NULL,
    unit                TEXT NOT NULL,
    age_scope_num       TEXT NOT NULL,
    age_scope_den       TEXT NOT NULL,
    coverage            TEXT NOT NULL,
    asymmetries         TEXT,             -- both (1) and (2) are UPWARD biases (defect-1)
    notes               TEXT
);

-- table: meta_source
CREATE TABLE meta_source (
    source_id        TEXT PRIMARY KEY,    -- explicit in sources_manifest.json (defect-5)
    source_class     TEXT NOT NULL,       -- 'OSEP_618' | 'NCES_DIGEST'
    description      TEXT NOT NULL,
    school_year      TEXT,                -- per-year for OSEP; NULL for NCES (multi-year)
    edition          TEXT,                -- 'Digest 2024' for NCES; NULL for OSEP
    url              TEXT NOT NULL,
    retrieval_date   TEXT NOT NULL,       -- ISO date when downloaded (date.today())
    raw_file_path    TEXT NOT NULL,
    sha256           TEXT NOT NULL,
    doc_url          TEXT,
    notes            TEXT
);

