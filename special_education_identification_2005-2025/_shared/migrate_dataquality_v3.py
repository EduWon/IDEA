#!/usr/bin/env python3
"""migrate_dataquality_v3.py — 원장(meta_dataquality) 보강.

결정 3: 분자 NULL+분모 생존 16건 전부 + 텍사스 상한 + COVID 를 원장에 인코딩.
issue_code 로 '구조 검출형'과 '외부 맥락형'을 구분한다.

  구조 검출형 (OSEP가 데이터에 명시적으로 억제/결측 처리):
    OSEP_STATE_SUPPRESSED   양밴드 모두 NULL (주 전체 억제)
    AGE_BAND_SUPPRESSED     한쪽 밴드만 NULL (기존 코드 재사용)
  외부 맥락형 (데이터엔 흔적 없음, 외부 증거로만 설명):
    STATE_POLICY_CAP        TX 식별 상한
    EXOGENOUS_SHOCK         COVID
    DENOMINATOR_UNPUBLISHED 2024-25 분모 미발표 (결정 1)

멱등(idempotent): (school_year, state_code, issue_code) 기준 중복 삽입 방지.
사용:  python migrate_dataquality_v3.py path/to/idea_db_v2.sqlite
"""
import sqlite3, sys

# 16건 편향행의 밴드 진단 (2026-06-01 점검 확정).
# band_pattern: 'both'=양밴드 NULL, 'ec'=유아(3-5)만 NULL, 'sa'=학령기(6-21)만 NULL
BIAS_ROWS = [
    ("2007-08", "VT", "both"),
    ("2008-09", "VT", "both"),
    ("2012-13", "WY", "ec"),
    ("2013-14", "WY", "ec"),
    ("2016-17", "NE", "ec"),
    ("2016-17", "WI", "both"),
    ("2017-18", "ME", "sa"),   # 기존 원장에 있음 → 스킵됨
    ("2017-18", "MN", "ec"),
    ("2017-18", "VT", "sa"),   # 기존 원장에 있음 → 스킵됨
    ("2017-18", "WI", "both"),
    ("2018-19", "WI", "both"),
    ("2019-20", "WI", "both"),
    ("2020-21", "LA", "sa"),   # 기존 원장에 있음 → 스킵됨
    ("2021-22", "LA", "ec"),
    ("2023-24", "NM", "both"),
]

# WI 4개 연도는 OSEP가 data quality concerns로 명시 억제(검증 출처).
WI_SUPPRESSED = {"2016-17", "2017-18", "2018-19", "2019-20"}

DESC = {
    "both_wi": (
        "OSEP suppressed Wisconsin's entire Child Count for data quality "
        "concerns (WISEdata system transition, 2016-17 onward). Both age "
        "bands NULL; ALL is NULL; excluded from identification rate. "
        "Verified in OSEP Fast Facts (SY2017-18, 2018-19, 2019-20)."),
    "both": (
        "Both age bands (3-5 and 6-21) suppressed by OSEP; age-ALL is NULL "
        "(incomplete numerator); excluded from identification rate."),
    "ec": (
        "Early-childhood band (3-5) suppressed; age-ALL set NULL per "
        "ALL_INCOMPLETE_BAND rule; excluded from identification rate."),
    "sa": (
        "School-age band (6-21) suppressed ('*' data-quality marker); "
        "age-ALL NULL; excluded from identification rate."),
}
SRC = "OSEP bchildcountandedenvironments CSV: data-quality marker / Fast Facts suppression note"


def already(cur, sy, st, code):
    q = ("SELECT 1 FROM meta_dataquality WHERE issue_code=? "
         "AND IFNULL(school_year,'')=IFNULL(?,'') "
         "AND IFNULL(state_code,'')=IFNULL(?,'')")
    return cur.execute(q, (code, sy, st)).fetchone() is not None


def ins(cur, sy, st, dis, code, sev, desc, src):
    if already(cur, sy, st, code):
        return 0
    cur.execute(
        "INSERT INTO meta_dataquality "
        "(school_year,state_code,disability_code,issue_code,severity,description,source_ref) "
        "VALUES (?,?,?,?,?,?,?)", (sy, st, dis, code, sev, desc, src))
    return 1


def main():
    db = sys.argv[1] if len(sys.argv) > 1 else "idea_db_v2.sqlite"
    con = sqlite3.connect(db)
    cur = con.cursor()
    added = 0

    # --- 구조 검출형: 16건 ---
    for sy, st, pat in BIAS_ROWS:
        if pat == "both":
            if st == "WI" and sy in WI_SUPPRESSED:
                code, desc = "OSEP_STATE_SUPPRESSED", DESC["both_wi"]
            else:
                code, desc = "OSEP_STATE_SUPPRESSED", DESC["both"]
        elif pat == "ec":
            code, desc = "AGE_BAND_SUPPRESSED", DESC["ec"]
        else:  # 'sa'
            code, desc = "AGE_BAND_SUPPRESSED", DESC["sa"]
        added += ins(cur, sy, st, None, code, "warn", desc, SRC)

    # --- 외부 맥락형: TX 상한 (외부 증거 기반, 데이터 미인증) ---
    added += ins(
        cur, None, "TX", None, "STATE_POLICY_CAP", "info",
        "Texas TEA imposed an ~8.5% special-education identification cap "
        "(c.2004-2017); identification rate fell to ~8.6% (SY2013-14) then "
        "recovered to ~14.0% (SY2023-24) after OSEP found an IDEA violation "
        "(2018). NOTE: this is an EXTERNAL-EVIDENCE attribution. The data "
        "store the low rate as a normal value with no NULL/flag; the DB does "
        "NOT certify the causal link. Cite external source.",
        "OSEP 2018 IDEA monitoring finding; Houston Chronicle 2016 reporting")

    # --- 외부 맥락형: COVID (ch7) ---
    added += ins(
        cur, None, None, None, "EXOGENOUS_SHOCK", "info",
        "COVID-19 disrupted SY2019-20/2020-21 enrollment and child-find "
        "operations; the rate inflection around 2019-20--2020-21 partly "
        "reflects denominator (enrollment) shifts, not identification "
        "behavior alone. EXTERNAL context; not certified by the data.",
        "NCES enrollment notes; ch7 analysis")

    # --- 결정 1: 2024-25 분모 미발표 ---
    added += ins(
        cur, "2024-25", None, None, "DENOMINATOR_UNPUBLISHED", "info",
        "NCES Digest Table 203.20 public enrollment not yet published for "
        "SY2024-25 at build time. Numerator (OSEP) is present but the "
        "identification rate is intentionally limited to 19 years "
        "(SY2005-06..SY2023-24). 2024-25 rate is NULL by design.",
        "build.py: NCES_D24_YEARS ends 2023-24; expect 19 distinct years")

    con.commit()
    n = cur.execute("SELECT COUNT(*) FROM meta_dataquality").fetchone()[0]
    print(f"추가된 행: {added}   원장 총 행수: {n}")

    # 검증: 16건 전부 매칭 설명행 존재?
    miss = []
    for sy, st, _ in BIAS_ROWS:
        q = ("SELECT 1 FROM meta_dataquality WHERE IFNULL(school_year,'')=? "
             "AND IFNULL(state_code,'')=? AND issue_code IN "
             "('OSEP_STATE_SUPPRESSED','AGE_BAND_SUPPRESSED')")
        if not cur.execute(q, (sy, st)).fetchone():
            miss.append((sy, st))
    print("미설명 잔존:", miss if miss else "없음 (16건 전부 설명됨)")


if __name__ == "__main__":
    main()
