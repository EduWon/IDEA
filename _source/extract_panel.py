#!/usr/bin/env python3
"""Extract a compact JSON data panel from idea_db_v2.sqlite for the dashboard.

Every figure in the dashboard is reproducible from the queries below. The
output is a single JSON object embedded into the React dashboard so it is a
fully self-contained, dependency-free artifact (no network/db at runtime).

USAGE
-----
    python extract_panel.py [DB_PATH] [OUT_JSON]

Both arguments are optional:
  DB_PATH   path to idea_db_v2.sqlite
            (default: ../special_education_identification_2005-2025/_shared/idea_db_v2.sqlite
             relative to this script, i.e. the layout when this file lives in _source/)
  OUT_JSON  where to write the extracted JSON
            (default: ./panel.json next to this script)

Examples (run from the _source/ folder):
    python extract_panel.py
    python extract_panel.py "C:/Work/IDEA/special_education_identification_2005-2025/_shared/idea_db_v2.sqlite"
"""
import sqlite3, json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB = os.path.join(
    HERE, '..', 'special_education_identification_2005-2025', '_shared', 'idea_db_v2.sqlite')
DEFAULT_OUT = os.path.join(HERE, 'panel.json')

DB  = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB
OUT = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT

if not os.path.exists(DB):
    sys.exit(f"ERROR: database not found at:\n  {DB}\n"
             f"Pass the correct path as the first argument, e.g.\n"
             f'  python extract_panel.py "C:/Work/IDEA/special_education_identification_2005-2025/_shared/idea_db_v2.sqlite"')

print("Reading DB:", DB)
c = sqlite3.connect(DB)
cur = c.cursor()

def q(sql, args=()):
    return list(cur.execute(sql, args))

panel = {}

# ----------------------------------------------------------------------
# Dimensions
# ----------------------------------------------------------------------
panel['disabilities'] = {code: {'label': label, 'required': bool(req), 'added': added}
    for code, label, req, added, notes in q(
        "SELECT code,label,federal_required,federal_added_year,notes FROM dim_disability")}

panel['jurisdictions'] = {code: name for code, name in
    q("SELECT code,name FROM dim_jurisdiction ORDER BY name")}

panel['years'] = [y for (y,) in q("SELECT school_year FROM dim_year ORDER BY fall_year")]

panel['environments'] = {g: {'label': lab, 'tier': tier} for g, lab, tier in
    q("SELECT env_group,label,lre_tier FROM dim_environment")}

# ----------------------------------------------------------------------
# 1. National identification rate (Chapter 2) — 19 years SY2005-06..2023-24
#    rate is per-state aggregate of served/enrolled. SY2024-25 has counts
#    but no enrollment denominator -> no rate.
# ----------------------------------------------------------------------
nat = []
for yr, s, e in q("""SELECT school_year, SUM(n_served), SUM(n_enrolled)
                     FROM v_identification_rate GROUP BY school_year ORDER BY school_year"""):
    nat.append({'year': yr, 'served': s, 'enrolled': e, 'rate': round(100.0*s/e, 3)})
# add SY2024-25 served-only (ALL, age ALL)
served_2425 = q("""SELECT SUM(n_students) FROM fact_state_disability
                   WHERE school_year='2024-25' AND disability_code='ALL' AND age_band='ALL'""")[0][0]
nat.append({'year': '2024-25', 'served': served_2425, 'enrolled': None, 'rate': None})
panel['national_rate'] = nat

# ----------------------------------------------------------------------
# 2. National school-age (6-21) composition by disability category
#    (Chapter 3). 13 categories; sums reconcile to 6-21 ALL band.
# ----------------------------------------------------------------------
comp_codes = ['SLD','SLI','OHI','AUT','ID','ED','DD','MD','DB','HI','OI','TBI','VI']
comp = {}
for yr, code, n in q("""SELECT school_year, disability_code, SUM(n_students)
                        FROM fact_state_disability
                        WHERE age_band='6-21' AND disability_code!='ALL'
                        GROUP BY school_year, disability_code"""):
    comp.setdefault(yr, {})[code] = n
band_all = dict(q("""SELECT school_year, SUM(n_students) FROM fact_state_disability
                     WHERE age_band='6-21' AND disability_code='ALL' GROUP BY school_year"""))
panel['composition_6_21'] = [
    dict(year=yr, total=band_all[yr], **{cd: comp[yr].get(cd) for cd in comp_codes})
    for yr in sorted(comp)]

# ----------------------------------------------------------------------
# 3. National category COUNT index (Chapter 3) — 6-21 counts, indexed.
#    (stored as raw counts; dashboard computes index to first year)
# ----------------------------------------------------------------------
panel['category_counts_6_21'] = panel['composition_6_21']  # same source, reused

# ----------------------------------------------------------------------
# 4. Autism rate per 1,000 enrolled, school-age (Chapter 4) — national,
#    plus CDC ADDM external benchmark points.
# ----------------------------------------------------------------------
enroll_by_year = dict(q("""SELECT school_year, SUM(n_enrolled) FROM v_identification_rate
                           GROUP BY school_year"""))
aut_nat = []
for yr, n in q("""SELECT school_year, SUM(n_students) FROM fact_state_disability
                  WHERE age_band='6-21' AND disability_code='AUT'
                  GROUP BY school_year ORDER BY school_year"""):
    e = enroll_by_year.get(yr)
    aut_nat.append({'year': yr, 'count': n, 'per1000': round(1000.0*n/e, 3) if e else None})
panel['autism_rate'] = aut_nat
# CDC ADDM (per 1,000, 8-year-olds) external benchmark — cited in Ch.4
panel['cdc_addm'] = [
    {'year':'2005-06','per1000':9.0},   # 1 in 110 era approx for surveillance year
    {'year':'2007-08','per1000':11.3},  # 1 in 88
    {'year':'2009-10','per1000':14.7},  # 1 in 68 (2010 surveillance)
    {'year':'2011-12','per1000':14.6},
    {'year':'2013-14','per1000':16.8},  # 1 in 59
    {'year':'2015-16','per1000':18.5},
    {'year':'2017-18','per1000':23.0},  # 1 in 44 (2018 surveillance)
    {'year':'2019-20','per1000':27.6},  # 1 in 36 (2020 surveillance)
    {'year':'2021-22','per1000':32.2},  # 1 in 31 (2022 surveillance)
]

# Autism state dispersion, per 1,000 school-age, latest count year SY2024-25 & SY2023-24
def state_aut_per1000(yr):
    rows = []
    enr = dict(q("""SELECT state_code, n_total FROM fact_state_enrollment
                    WHERE school_year=?""", (yr,)))
    for st, n in q("""SELECT state_code, SUM(n_students) FROM fact_state_disability
                      WHERE school_year=? AND age_band='6-21' AND disability_code='AUT'
                      GROUP BY state_code""", (yr,)):
        e = enr.get(st)
        if e and n is not None:
            rows.append({'state': st, 'per1000': round(1000.0*n/e, 2)})
    return sorted(rows, key=lambda r: r['per1000'])
panel['autism_state_2023'] = state_aut_per1000('2023-24')

# ----------------------------------------------------------------------
# 5. Cross-state identification rate (Chapter 5) — latest rate year 2023-24
#    plus full time series for persistence/trajectory.
# ----------------------------------------------------------------------
state_rate_latest = []
for st, s, e in q("""SELECT state_code, n_served, n_enrolled FROM v_identification_rate
                     WHERE school_year='2023-24'""" ):
    if e and s is not None:
        state_rate_latest.append({'state': st, 'rate': round(100.0*s/e, 2)})
panel['state_rate_2023'] = sorted(state_rate_latest, key=lambda r: r['rate'])

# Full state-rate time series (for trajectory/persistence)
sr_ts = {}
for yr, st, s, e in q("""SELECT school_year, state_code, n_served, n_enrolled
                         FROM v_identification_rate"""):
    if e and s is not None:
        sr_ts.setdefault(st, {})[yr] = round(100.0*s/e, 2)
panel['state_rate_ts'] = sr_ts

# ----------------------------------------------------------------------
# 6. LRE inclusion (Chapter 6) — national inclusion_80 rate over time;
#    exclude SY2019-20 (34/51 states missing -> incomplete denom).
# ----------------------------------------------------------------------
incl_nat = []
for yr, inc, tot in q("""SELECT school_year, SUM(n_inside_80), SUM(n_total_school_age)
                         FROM v_lre_inclusion WHERE disability_code='ALL'
                         GROUP BY school_year ORDER BY school_year"""):
    excl = (yr == '2019-20')
    incl_nat.append({'year': yr, 'inclusion80': round(100.0*inc/tot, 2) if tot else None,
                     'excluded': excl})
panel['inclusion_national'] = incl_nat

# Inclusion by disability category, latest complete year SY2024-25
incl_cat = []
for code, inc, tot in q("""SELECT disability_code, SUM(n_inside_80), SUM(n_total_school_age)
                           FROM v_lre_inclusion
                           WHERE school_year='2024-25' AND disability_code!='ALL'
                           GROUP BY disability_code"""):
    if tot:
        incl_cat.append({'code': code, 'inclusion80': round(100.0*inc/tot, 1)})
panel['inclusion_by_category_2024'] = sorted(incl_cat, key=lambda r: -r['inclusion80'])

# Environment full distribution national (stacked), school-age, by year
env_dist = {}
for yr, eg, n in q("""SELECT school_year, env_group, SUM(n_students)
                      FROM fact_state_environment
                      WHERE disability_code='ALL'
                      GROUP BY school_year, env_group"""):
    env_dist.setdefault(yr, {})[eg] = n
panel['env_distribution'] = [dict(year=yr, **env_dist[yr]) for yr in sorted(env_dist)]

# ----------------------------------------------------------------------
# 7. COVID decomposition (Chapter 7) — served vs enrolled indexed to 2018-19.
# ----------------------------------------------------------------------
covid = []
base_s = base_e = None
for row in nat:
    if row['rate'] is None:  # skip 2024-25 (no enrollment)
        continue
    if row['year'] == '2018-19':
        base_s, base_e = row['served'], row['enrolled']
for row in nat:
    if row['enrolled'] is None: continue
    covid.append({'year': row['year'],
                  'served_idx': round(100.0*row['served']/base_s, 2),
                  'enrolled_idx': round(100.0*row['enrolled']/base_e, 2),
                  'rate': row['rate']})
panel['covid_index'] = covid

# YoY component change (log-change *100 ~ pct)
import math
yoy = []
prev = None
for row in nat:
    if row['enrolled'] is None: continue
    if prev:
        dS = round(100.0*(math.log(row['served'])-math.log(prev['served'])), 2)
        dE = round(100.0*(math.log(row['enrolled'])-math.log(prev['enrolled'])), 2)
        yoy.append({'year': row['year'], 'dS': dS, 'dE': dE, 'dR': round(dS-dE, 2)})
    prev = row
panel['covid_yoy'] = yoy

# ----------------------------------------------------------------------
# 8. Data-quality ledger (Chapter 1) + coverage
# ----------------------------------------------------------------------
panel['dq'] = [dict(year=y, state=st, disability=d, issue=ic, severity=sev, description=desc)
    for y, st, d, ic, sev, desc in q("""SELECT school_year,state_code,disability_code,
        issue_code,severity,description FROM meta_dataquality""")]

# coverage / row counts
panel['row_counts'] = {name: q(f'SELECT COUNT(*) FROM "{name}"')[0][0]
    for (name,) in q("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}

# Coverage matrix: rows per fact table per year
cov = {}
for tbl in ['fact_state_disability','fact_state_enrollment','fact_state_environment']:
    cov[tbl] = dict(q(f"SELECT school_year, COUNT(*) FROM {tbl} GROUP BY school_year"))
panel['coverage'] = cov

# meta source list (Chapter colophon)
panel['sources'] = [dict(id=sid, cls=cls, desc=desc, year=sy, url=url)
    for sid, cls, desc, sy, url in q("""SELECT source_id,source_class,description,school_year,url
        FROM meta_source ORDER BY source_id""")]

# metric definition
panel['metric'] = [dict(id=m[0], desc=m[1], formula=m[6], unit=m[7],
                        coverage=m[10], asymmetries=m[11], notes=m[12])
    for m in q("SELECT * FROM meta_metric")]

# db version
panel['db_version'] = q("SELECT version, applied_on, notes FROM meta_db_version ORDER BY applied_on DESC LIMIT 1")

out = json.dumps(panel, separators=(',', ':'), ensure_ascii=False)
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(out)
print("Wrote:", OUT, "(", len(out), "bytes )")
print("keys:", list(panel.keys()))
print("national_rate last:", panel['national_rate'][-2], panel['national_rate'][-1])
print("state_rate_2023 extremes:", panel['state_rate_2023'][0], panel['state_rate_2023'][-1])
print("autism_state extremes:", panel['autism_state_2023'][0], panel['autism_state_2023'][-1])
print("inclusion_by_category:", panel['inclusion_by_category_2024'][:3], '...', panel['inclusion_by_category_2024'][-2:])
print("dq count:", len(panel['dq']))
print()
print("Next: paste this JSON into idea_dashboard_v2.jsx as `const PANEL = <json>;`,")
print("then rebuild index.html. (Ask Claude to rebuild if unsure.)")
