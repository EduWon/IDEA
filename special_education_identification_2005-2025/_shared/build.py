"""Build idea_db v2.0.0 (Phase 1: post-2012 OSEP + NCES d24). SPEC §6."""
from __future__ import annotations

import datetime
import glob
import json
import os
import sqlite3

import download
from loaders import (common, jurisdictions, nces_203_20, osep_environment,
                     osep_post_2012, osep_pre_2012)

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "processed", "idea_db_v2.sqlite")
MANIFEST = json.load(open(os.path.join(HERE, "sources_manifest.json")))

NCES_D13_YEARS = ["2005-06","2006-07","2007-08","2008-09","2009-10","2010-11"]
NCES_D24_YEARS = ["2011-12","2012-13","2013-14","2014-15","2015-16","2016-17",
                  "2017-18","2018-19","2019-20","2020-21","2021-22","2022-23","2023-24"]

# issue #16: AZ MD SY2024-25 anomaly -> impute prior-year (2023-24) values
IMPUTATIONS = {
    ("2024-25", "AZ", "MD", "6-21"): 1792,
    ("2024-25", "AZ", "MD", "3-5"): 0,
}
# issue #14: Iowa reports ALL only from SY2019-20
NONCAT = {(sy, "IA") for sy in ["2019-20","2020-21","2021-22","2022-23","2023-24","2024-25"]}


def apply_schema(con):
    for f in sorted(glob.glob(os.path.join(HERE, "schema", "*.sql"))):
        con.executescript(open(f).read())


def populate_dims(con, dis_rows, enr_rows):
    DIS = [("ALL","All Disabilities",1,1975),("AUT","Autism",1,1990),
           ("DB","Deaf-blindness",1,1975),("DD","Developmental delay",1,1997),
           ("ED","Emotional disturbance",1,1975),("HI","Hearing impairment",1,1975),
           ("ID","Intellectual disability",1,1975),("MD","Multiple disabilities",1,1975),
           ("OI","Orthopedic impairment",1,1975),("OHI","Other health impairment",1,1975),
           ("SLD","Specific learning disability",1,1975),("SLI","Speech or language impairment",1,1975),
           ("TBI","Traumatic brain injury",1,1990),("VI","Visual impairment",1,1975)]
    # Reporting-vs-statutory notes (OSEP §618 reporting frame != 34 CFR 300.8).
    # HI subsumes Deafness (no standalone Deafness field in §618); DD is a
    # noncategorical, state-discretionary classification reported as a line item.
    DIS_NOTES = {
        "HI": ("Reporting category (OSEP Section 618), not the statutory eligibility "
               "category. IDEA (34 CFR 300.8) defines Deafness and Hearing impairment "
               "as distinct categories, but the Section 618 child-count files carry no "
               "separate Deafness label; deaf students are reported within this single "
               "HI count. Audit of all 20 source files (SY2005-06..SY2024-25): zero "
               "standalone Deafness occurrences, all states, all years."),
        "DD": ("Reporting category (OSEP Section 618), not a statutory eligibility "
               "category. Developmental delay is a noncategorical option states may "
               "apply to children ages 3-9 at their discretion (34 CFR 300.8(b)); OSEP "
               "nonetheless reports it as a distinct child-count line item and this "
               "dataset loads it as such."),
    }
    con.executemany("INSERT INTO dim_disability VALUES (?,?,?,?,?)",
                    [(c,l,fr,fy,DIS_NOTES.get(c)) for c,l,fr,fy in DIS])
    con.executemany("INSERT INTO dim_jurisdiction VALUES (?,?,?)",
                    [(c,n,f) for c,n,f in jurisdictions.JURISDICTIONS])
    # dim_year = UNION of both fact tables (SPEC §4.3, contract #10)
    years = sorted({r["school_year"] for r in dis_rows}
                   | {r["school_year"] for r in enr_rows})
    con.executemany("INSERT INTO dim_year VALUES (?,?)",
                    [(sy, int(sy[:4])) for sy in years])


def populate_meta_source(con, dl_results):
    for r in dl_results:
        con.execute(
            "INSERT INTO meta_source (source_id,source_class,description,school_year,"
            "edition,url,retrieval_date,raw_file_path,sha256,doc_url,notes) "
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            (r["source_id"], r["source_class"],
             f"{r['source_class']} {r.get('school_year') or r.get('edition')}",
             r["school_year"], r["edition"], r["url"], r["retrieval_date"],
             r["raw_file_path"], r["sha256"], None, None))


def populate_meta_dataquality(con):
    rows = [
        ("2024-25","AZ","MD","ANOMALY_IMPUTED","block",
         "MD 6-21 jumped 1,792 (2023-24) -> 34,953 (2024-25); implausible. "
         "Imputed prior-year value per SPEC §4.1a branch 4.",
         "OSEP bchildcountandedenvironment2024-25.csv: AZ MD Age5(SchoolAge)-21=34953"),
    ]
    for sy in ["2019-20","2020-21","2021-22","2022-23","2023-24","2024-25"]:
        rows.append((sy,"IA",None,"NONCATEGORICAL","info",
                     "Iowa reports All Disabilities only (no 13-category breakdown).",
                     "OSEP IA rows: only 'All Disabilities' present"))
    for sy, st in [("2014-15","WY"),("2017-18","ME"),("2017-18","VT"),("2020-21","LA")]:
        rows.append((sy,st,None,"AGE_BAND_SUPPRESSED","warn",
                     "OSEP suppressed the entire 6-21 age group ('*' data-quality marker); "
                     "ALL is NULL (incomplete numerator), excluded from identification rate.",
                     "OSEP Total, Age 6-21 row = '*' for all environments"))
    # Dataset-wide: §618 reporting categories vs IDEA statutory categories.
    rows.append((None,None,None,"REPORTING_VS_STATUTORY","info",
        "The 13 disability categories are OSEP Section 618 Child Count reporting "
        "categories, which do not coincide with the IDEA statutory eligibility "
        "categories (34 CFR 300.8). (1) HI subsumes Deafness: the statute lists "
        "Deafness and Hearing impairment separately, but Section 618 has no "
        "standalone Deafness field (audit of all 20 source files: zero occurrences, "
        "all states/years). (2) DD is reported as a distinct line item despite being "
        "a noncategorical, state-discretionary classification for ages 3-9, not a "
        "statutory eligibility category. Analyses requiring deaf/hard-of-hearing "
        "disaggregation, or strict alignment to 34 CFR 300.8 (e.g. cross-national "
        "mapping), should treat the Section 618 reporting frame as the operative "
        "definition and not assume statutory equivalence.",
        "34 CFR 300.8; OSEP IDEA Section 618 Child Count file audit"))
    con.executemany(
        "INSERT INTO meta_dataquality (school_year,state_code,disability_code,"
        "issue_code,severity,description,source_ref) VALUES (?,?,?,?,?,?,?)", rows)


def populate_meta_metric(con):
    con.execute(
        "INSERT INTO meta_metric VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
        ("identification_rate",
         "Share of public PK-12 enrollment served under IDEA Part B (ages 3-21).",
         "OSEP §618 Child Count (disability_code=ALL, age_band=ALL)",
         "disability_code='ALL' AND age_band='ALL'",
         "NCES Digest 203.20 PK-12 fall membership", "all public schools",
         "100 * n_served / n_enrolled", "percent", "ages 3-21", "PK-12",
         "SY 2012-13..2023-24 at v2.0.0 (12 years)",
         "(1) numerator ages 19-21 not in PK-12 denominator; (2) numerator includes "
         "parentally-placed private ISP children not in public denominator. Both UPWARD; "
         "not separately bounded. (3) 13 categories stable across window.",
         "Both (1) and (2) bias the rate slightly upward; treat as overestimate."))


def populate_meta_column(con):
    cols = {
      "dim_disability": {"code":"Canonical disability code","label":"Human-readable category name",
        "federal_required":"1 if a federal IDEA category","federal_added_year":"Year category entered federal reporting",
        "notes":"Free-text notes"},
      "dim_jurisdiction": {"code":"2-letter state/DC code","name":"Jurisdiction name","fips":"FIPS code"},
      "dim_year": {"school_year":"School year e.g. 2014-15","fall_year":"Fall calendar year"},
      "fact_state_disability": {"school_year":"School year","state_code":"Jurisdiction code",
        "disability_code":"Disability category (ALL = all)","age_band":"3-5 | 6-21 | ALL",
        "n_students":"IDEA Part B child count; NULL if suppressed/imputed-absent",
        "source_id":"FK to meta_source","dq_flag":"Data-quality marker"},
      "fact_state_enrollment": {"school_year":"School year","state_code":"Jurisdiction code",
        "n_total":"NCES PK-12 fall public enrollment","source_id":"FK to meta_source","dq_flag":"Data-quality marker"},
      "meta_source": {"source_id":"PK","source_class":"OSEP_618 | NCES_DIGEST","description":"Description",
        "school_year":"Per-year for OSEP","edition":"Digest edition for NCES","url":"Download URL",
        "retrieval_date":"ISO download date","raw_file_path":"Local raw path","sha256":"SHA-256 of raw file",
        "doc_url":"Documentation URL","notes":"Notes"},
      "meta_column": {"id":"PK","table_name":"Described table","column_name":"Described column",
        "description":"Column meaning","unit":"Unit","source_id":"Originating source","computation":"Derivation",
        "status":"verified | pending","notes":"Notes"},
      "meta_metric": {"metric_id":"PK","description":"Metric meaning","numerator_source":"Numerator source",
        "numerator_filter":"Numerator filter","denominator_source":"Denominator source",
        "denominator_filter":"Denominator filter","formula":"Formula","unit":"Unit",
        "age_scope_num":"Numerator age scope","age_scope_den":"Denominator age scope",
        "coverage":"Year coverage","asymmetries":"Numerator/denominator asymmetries","notes":"Notes"},
      "meta_dataquality": {"id":"PK","school_year":"Affected year","state_code":"Affected state",
        "disability_code":"Affected category","issue_code":"Issue code","severity":"block | warn | info",
        "description":"Issue description","source_ref":"Verbatim source reference"},
      "meta_db_version": {"version":"Version tag","applied_on":"ISO date","notes":"Notes"},
      "dim_environment": {"env_group":"Standard OSEP placement group","label":"Human-readable placement",
        "lre_tier":"most_inclusive | partial | separate_within | separate | other"},
      "fact_state_environment": {"school_year":"School year","state_code":"Jurisdiction code",
        "disability_code":"Disability category (ALL = all)","env_group":"FK to dim_environment",
        "n_students":"School-Age (6-21) count in this placement; NULL if suppressed",
        "source_id":"FK to meta_source","dq_flag":"Data-quality marker"},
    }
    rows=[]
    for t,cd in cols.items():
        for c,desc in cd.items():
            rows.append((t,c,desc,None,None,None,"verified",None))
    con.executemany("INSERT INTO meta_column (table_name,column_name,description,unit,"
                    "source_id,computation,status,notes) VALUES (?,?,?,?,?,?,?,?)", rows)


def main():
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    if os.path.exists(DB):
        os.remove(DB)

    dl = download.download_all("all")
    osep_pre = {}
    osep_post = {}
    nces_files = {}
    for r in dl:
        if r["source_class"] == "OSEP_618":
            (osep_pre if int(r["school_year"][:4]) < 2012 else osep_post)[
                r["school_year"]] = r["raw_file_path"]
        else:
            tag = "d13" if "d13" in (r["edition"] or "") else "d24"
            nces_files[tag] = r["raw_file_path"]

    dis_rows = []
    for sy, path in sorted(osep_pre.items()):
        sid = f"osep_618_{sy[:4]}_{sy[5:]}"
        dis_rows.extend(osep_pre_2012.load(path, sid, sy))
    for sy, path in sorted(osep_post.items()):
        sid = f"osep_618_{sy[:4]}_{sy[5:]}"
        dis_rows.extend(osep_post_2012.load(path, sid, sy))

    # branch 4 imputation (post-2012 only), then synthesize ALL cells
    dis_rows, touched = common.apply_imputations(dis_rows, IMPUTATIONS)
    dis_rows = common.synthesize_all_cells(dis_rows, noncat_state_years=NONCAT,
                                           force_derive=touched)

    # NCES enrollment: d13 (2005-06..2010-11) + d24 (2011-12..2023-24)
    enr_rows = []
    enr_rows.extend(nces_203_20.load(nces_files["d13"], "nces_d13_203_20", NCES_D13_YEARS))
    enr_rows.extend(nces_203_20.load(nces_files["d24"], "nces_d24_203_20", NCES_D24_YEARS))

    # v3 LRE / environment (post-2012 only, School Age 6-21)
    env_rows = []
    for sy, path in sorted(osep_post.items()):
        sid = f"osep_618_{sy[:4]}_{sy[5:]}"
        env_rows.extend(osep_environment.load(path, sid, sy))

    con = sqlite3.connect(DB)
    con.execute("PRAGMA foreign_keys=ON")
    apply_schema(con)
    populate_dims(con, dis_rows, enr_rows)
    populate_meta_column(con)
    populate_meta_source(con, dl)
    populate_meta_dataquality(con)
    populate_meta_metric(con)

    con.executemany(
        "INSERT OR REPLACE INTO fact_state_disability "
        "(school_year,state_code,disability_code,age_band,n_students,source_id,dq_flag) "
        "VALUES (?,?,?,?,?,?,?)",
        [(r["school_year"],r["state_code"],r["disability_code"],r["age_band"],
          r["n_students"],r["source_id"],r["dq_flag"]) for r in dis_rows])
    con.executemany(
        "INSERT OR REPLACE INTO fact_state_enrollment "
        "(school_year,state_code,n_total,source_id,dq_flag) VALUES (?,?,?,?,?)",
        [(r["school_year"],r["state_code"],r["n_total"],r["source_id"],r["dq_flag"])
         for r in enr_rows])

    con.executemany("INSERT INTO dim_environment VALUES (?,?,?)",
                    osep_environment.DIM_ENVIRONMENT)
    con.executemany(
        "INSERT OR REPLACE INTO fact_state_environment "
        "(school_year,state_code,disability_code,env_group,n_students,source_id,dq_flag) "
        "VALUES (?,?,?,?,?,?,?)",
        [(r["school_year"],r["state_code"],r["disability_code"],r["env_group"],
          r["n_students"],r["source_id"],r["dq_flag"]) for r in env_rows])

    today = datetime.date.today().isoformat()
    con.executemany("INSERT INTO meta_db_version VALUES (?,?,?)", [
        ("v2.0.0", today, "Phase 1: OSEP post-2012 + NCES d24 (12-year rate)"),
        ("v2.1.0", today, "Phase 2: full 20-year OSEP + NCES d13+d24 (19-year rate)"),
        ("v3.0.0", today, "Phase 3: LRE/environment (School Age 6-21, post-2012)"),
    ])
    con.commit()

    nf = con.execute("SELECT COUNT(*) FROM fact_state_disability").fetchone()[0]
    ne = con.execute("SELECT COUNT(*) FROM fact_state_enrollment").fetchone()[0]
    nv = con.execute("SELECT COUNT(DISTINCT school_year) FROM v_identification_rate").fetchone()[0]
    print(f"fact_state_disability rows: {nf}")
    print(f"fact_state_enrollment rows: {ne}")
    print(f"v_identification_rate distinct school_years: {nv} (expect 19)")
    con.close()


if __name__ == "__main__":
    main()
