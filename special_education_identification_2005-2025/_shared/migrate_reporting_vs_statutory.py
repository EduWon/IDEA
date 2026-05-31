"""Add reporting-vs-statutory category documentation to idea_db.

Idempotent migration. Records the distinction between OSEP Section 618
reporting categories and IDEA statutory eligibility categories
(34 CFR 300.8) in three places:

  1. dim_disability.notes  -- HI and DD rows get a short caveat
  2. meta_dataquality      -- one info-severity row explaining the mismatch
  3. (SPEC text is updated separately, outside this script)

Safe to run more than once: each write checks for its own prior effect
before applying, so re-running does not duplicate rows or stack notes.

This script is for patching an *existing* dataset in place (e.g. one built
before this documentation was added). A fresh rebuild does not need it:
build.py already writes the same HI/DD notes (in populate_dims) and the
same REPORTING_VS_STATUTORY row (in populate_meta_dataquality).
"""
from __future__ import annotations

import sqlite3
import sys

HI_NOTE = (
    "Reporting category (OSEP Section 618), not the statutory eligibility "
    "category. IDEA (34 CFR 300.8) defines Deafness and Hearing impairment "
    "as distinct categories, but the Section 618 child-count files carry no "
    "separate Deafness label; deaf students are reported within this single "
    "HI count. Audit of all 20 source files (SY2005-06..SY2024-25): zero "
    "standalone Deafness occurrences, all states, all years."
)

DD_NOTE = (
    "Reporting category (OSEP Section 618), not a statutory eligibility "
    "category. Developmental delay is a noncategorical option states may "
    "apply to children ages 3-9 at their discretion (34 CFR 300.8(b)); OSEP "
    "nonetheless reports it as a distinct child-count line item and this "
    "dataset loads it as such."
)

DQ_ISSUE_CODE = "REPORTING_VS_STATUTORY"
DQ_SEVERITY = "info"
DQ_DESCRIPTION = (
    "The 13 disability categories are OSEP Section 618 Child Count reporting "
    "categories, which do not coincide with the IDEA statutory eligibility "
    "categories (34 CFR 300.8). (1) HI subsumes Deafness: the statute lists "
    "Deafness and Hearing impairment separately, but Section 618 has no "
    "standalone Deafness field (audit of all 20 source files: zero "
    "occurrences, all states/years). (2) DD is reported as a distinct line "
    "item despite being a noncategorical, state-discretionary classification "
    "for ages 3-9, not a statutory eligibility category. Analyses requiring "
    "deaf/hard-of-hearing disaggregation, or strict alignment to 34 CFR "
    "300.8 (e.g. cross-national mapping), should treat the Section 618 "
    "reporting frame as the operative definition and not assume statutory "
    "equivalence."
)
DQ_SOURCE_REF = "34 CFR 300.8; OSEP IDEA Section 618 Child Count file audit"


def migrate(con: sqlite3.Connection) -> None:
    cur = con.cursor()

    # 1. dim_disability.notes for HI and DD (overwrite to canonical text;
    #    idempotent because the text is fixed).
    cur.execute("UPDATE dim_disability SET notes=? WHERE code='HI'", (HI_NOTE,))
    cur.execute("UPDATE dim_disability SET notes=? WHERE code='DD'", (DD_NOTE,))

    # 2. meta_dataquality info row (dataset-wide: no state_code / school_year /
    #    disability_code). Insert only if absent.
    existing = cur.execute(
        "SELECT COUNT(*) FROM meta_dataquality WHERE issue_code=?",
        (DQ_ISSUE_CODE,),
    ).fetchone()[0]
    if existing == 0:
        cur.execute(
            "INSERT INTO meta_dataquality "
            "(school_year, state_code, disability_code, issue_code, severity, "
            " description, source_ref) VALUES (NULL, NULL, NULL, ?, ?, ?, ?)",
            (DQ_ISSUE_CODE, DQ_SEVERITY, DQ_DESCRIPTION, DQ_SOURCE_REF),
        )

    con.commit()


def verify(con: sqlite3.Connection) -> None:
    cur = con.cursor()
    hi = cur.execute("SELECT notes FROM dim_disability WHERE code='HI'").fetchone()[0]
    dd = cur.execute("SELECT notes FROM dim_disability WHERE code='DD'").fetchone()[0]
    n = cur.execute(
        "SELECT COUNT(*) FROM meta_dataquality WHERE issue_code=?",
        (DQ_ISSUE_CODE,),
    ).fetchone()[0]
    assert hi and hi.startswith("Reporting category"), "HI note missing"
    assert dd and dd.startswith("Reporting category"), "DD note missing"
    assert n == 1, f"expected exactly 1 {DQ_ISSUE_CODE} row, found {n}"
    print("verify OK: HI note, DD note, 1 meta_dataquality row")


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "idea_db_v2.sqlite"
    con = sqlite3.connect(path)
    migrate(con)
    migrate(con)  # second call proves idempotency
    verify(con)
    con.close()
    print(f"migration applied to {path}")
