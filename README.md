# Special-Education Identification in the United States

A statistical companion to IDEA Section 618 reporting and the NCES Digest.

**Live site:** [https://eduwon.github.io/IDEA/](https://eduwon.github.io/IDEA/)

## About

A reproducible panel of U.S. special-education enrollment from IDEA Section 618 reporting and
the NCES Digest. National identification rates run from 1976; state-level cross-tabulations
begin between 2005 and 2012 depending on the dimension; all series run through 2024–25.

Developed at the request of **Won G. Kim**, Associate Professor,
[Texas A&M International University, College of Education](https://www.tamiu.edu/coedu/index.shtml).

## Citation

Following the [CRediT taxonomy](https://credit.niso.org/):

> Kim, Won G. (Conceptualization, Supervision), & Choi, Pilsun (Data curation,
> Software, Methodology, Visualization). (2026). *Special-Education Identification
> in the United States: A statistical companion to IDEA Section 618* (Edition May 2026)
> [Data dashboard]. Texas A&M International University, College of Education.
> https://eduwon.github.io/IDEA/

Short form:

> Kim, Won G., & Choi, Pilsun. (2026). *Special-Education Identification in the United States*
> [Data dashboard]. https://eduwon.github.io/IDEA/

## Contents

`index.html` is a self-contained statistical companion organised in 15 tabs:

| Tab | Topic |
|---|---|
| Overview | Drop-cap intro, headline figures |
| §I–III | National curve, composition shifts, per-category trajectories |
| §IV–VI | Geography, state-level disability composition, multi-state trajectories |
| §VII–IX | Sex asymmetries, race & ethnicity, English learners |
| §X–XI | Educational environment (LRE), age profile |
| §XII–XIII | Data-quality inventory, coverage matrix |
| §XIV | Colophon & sources |
| §XV | References & further reading |

## Data access

The site is **derived from but does not include** the underlying SQLite panel. The data
is built from public U.S. federal sources and is reproducible end-to-end from those sources:

- **OSEP IDEA Section 618** child-count files
- **NCES Digest 2023**, Tables 204.30 (national series), 204.70 (state rates),
  203.20 (denominators)

The database itself is not publicly distributed. For research access, contact the authors
via the [TAMIU College of Education](https://www.tamiu.edu/coedu/index.shtml).

## Files in this repository

| File                  | Description                                            |
|-----------------------|--------------------------------------------------------|
| `index.html`          | Self-contained dashboard (~920 KB; React/Recharts inlined) |
| `idea_dashboard.jsx`  | React/JSX source (pre-compilation input)               |
| `README.md`           | This file                                              |
| `.nojekyll`           | Disables Jekyll processing on GitHub Pages             |

---

© 2026 Won G. Kim and Pilsun Choi. All rights reserved.
For inquiries about reuse, please contact the authors.
