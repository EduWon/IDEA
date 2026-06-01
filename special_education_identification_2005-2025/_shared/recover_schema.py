#!/usr/bin/env python3
"""recover_schema.py — zip에 누락된 _shared/schema/*.sql 복원.

idea_db_v2.sqlite에서 현재 테이블/view DDL을 추출해 schema 폴더로 내보낸다.
빌드 파이프라인이 schema/*.sql을 executescript로 적용하므로, view 수정은
여기서 복원한 .sql을 편집한 뒤 재빌드하는 것이 정석이다.

사용:
    python recover_schema.py path/to/idea_db_v2.sqlite [out_dir]
"""
import sqlite3, sys, os

def main():
    db = sys.argv[1] if len(sys.argv) > 1 else "idea_db_v2.sqlite"
    out = sys.argv[2] if len(sys.argv) > 2 else "schema"
    os.makedirs(out, exist_ok=True)
    con = sqlite3.connect(db)

    # 테이블 → 01_tables.sql, view → 02_views.sql (적용 순서 보장: glob sorted)
    tables = con.execute(
        "SELECT name, sql FROM sqlite_master "
        "WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    ).fetchall()
    views = con.execute(
        "SELECT name, sql FROM sqlite_master WHERE type='view' ORDER BY name"
    ).fetchall()

    with open(os.path.join(out, "01_tables.sql"), "w") as f:
        for name, sql in tables:
            f.write(f"-- table: {name}\n{sql};\n\n")
    with open(os.path.join(out, "02_views.sql"), "w") as f:
        for name, sql in views:
            f.write(f"-- view: {name}\n{sql};\n\n")

    print(f"복원 완료: {len(tables)} tables -> 01_tables.sql, "
          f"{len(views)} views -> 02_views.sql  (dir: {out})")
    print("다음 단계: 02_views.sql 의 v_identification_rate 정의를 "
          "rebuild_views.sql 내용으로 교체.")

if __name__ == "__main__":
    main()
