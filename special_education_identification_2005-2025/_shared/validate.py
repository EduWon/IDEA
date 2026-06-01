#!/usr/bin/env python3
"""validate.py — 보강 후 회귀 테스트. CLAUDE.md 체크리스트를 코드화.
사용:  python validate.py path/to/idea_db_v2.sqlite
모든 항목 PASS 여야 한다. 하나라도 FAIL이면 비정상 종료(exit 1).
"""
import sqlite3, sys

BIAS = [("2007-08","VT"),("2008-09","VT"),("2012-13","WY"),("2013-14","WY"),
        ("2016-17","NE"),("2016-17","WI"),("2017-18","ME"),("2017-18","MN"),
        ("2017-18","VT"),("2017-18","WI"),("2018-19","WI"),("2019-20","WI"),
        ("2020-21","LA"),("2021-22","LA"),("2023-24","NM")]

def main():
    db = sys.argv[1] if len(sys.argv) > 1 else "idea_db_v2.sqlite"
    con = sqlite3.connect(db); cur = con.cursor()
    fails = []
    def check(name, ok, detail=""):
        print(("PASS" if ok else "FAIL"), "-", name, ("" if ok else f"  >> {detail}"))
        if not ok: fails.append(name)

    # T1: 세 view 존재
    views = {r[0] for r in cur.execute(
        "SELECT name FROM sqlite_master WHERE type='view'")}
    check("T1 세 view 존재",
          {"v_identification_rate_state","v_identification_rate_national",
           "v_identification_rate"} <= views, views)

    # T2: _state 에서 WI 억제연도 pct=NULL (주별 불변)
    rows = cur.execute(
        "SELECT pct_identified FROM v_identification_rate_state "
        "WHERE state_code='WI' AND school_year IN "
        "('2016-17','2017-18','2018-19','2019-20')").fetchall()
    check("T2 WI 주별 pct 전부 NULL", all(r[0] is None for r in rows), rows)

    # T3: _national 에서 분자NULL 16건 분모가 제외됨 (n_states_included < 51)
    sup = cur.execute(
        "SELECT school_year, n_states_included FROM v_identification_rate_national "
        "WHERE school_year IN ('2016-17','2017-18','2018-19','2019-20')").fetchall()
    check("T3 억제연도 포함 주 수 < 51", all(n < 51 for _, n in sup), sup)

    # T4: 정상연도(예: 2022-23) 포함 주 수 = 51
    r = cur.execute("SELECT n_states_included FROM v_identification_rate_national "
                    "WHERE school_year='2022-23'").fetchone()
    check("T4 정상연도 51개 주", r and r[0] == 51, r)

    # T5: WI 전국비율이 상향 (편향 제거). 2018-19 correct≈14.07
    r = cur.execute("SELECT pct_identified FROM v_identification_rate_national "
                    "WHERE school_year='2018-19'").fetchone()
    check("T5 2018-19 전국비율 ≈14.07 (편향제거)",
          r and abs(r[0]-14.0733) < 0.01, r)

    # T6: 16건 전부 원장 설명 존재
    miss = [(sy,st) for sy,st in BIAS if not cur.execute(
        "SELECT 1 FROM meta_dataquality WHERE IFNULL(school_year,'')=? "
        "AND IFNULL(state_code,'')=? AND issue_code IN "
        "('OSEP_STATE_SUPPRESSED','AGE_BAND_SUPPRESSED')",(sy,st)).fetchone()]
    check("T6 16건 전부 원장 설명", not miss, miss)

    # T7: TX 상한 행 존재 + severity=info (외부맥락)
    r = cur.execute("SELECT severity FROM meta_dataquality "
                    "WHERE state_code='TX' AND issue_code='STATE_POLICY_CAP'").fetchone()
    check("T7 TX STATE_POLICY_CAP info", r and r[0]=='info', r)

    # T8: 2024-25 분모 없음 + 식별률 NULL (현행 유지)
    r = cur.execute("SELECT pct_identified FROM v_identification_rate_national "
                    "WHERE school_year='2024-25'").fetchone()
    check("T8 2024-25 식별률 미산출(현행 유지)", r is None, r)

    con.close()
    print()
    if fails:
        print(f"실패 {len(fails)}건:", fails); sys.exit(1)
    print("전체 PASS")

if __name__ == "__main__":
    main()
