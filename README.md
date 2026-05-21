# Special-Education Identification in the United States — A Statistical Companion

A reproducible panel of U.S. special-education enrollment from IDEA Section 618 reporting and
the NCES Digest. National identification rates run from 1976; state-level cross-tabulations
begin between 2005 and 2012 depending on the dimension; all series run through 2024–25.

**Live site:** [https://eduwon.github.io/IDEA/](https://eduwon.github.io/IDEA/)

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

## Data and reproducibility

The site is **derived from but does not include** the underlying SQLite panel
(`idea_db.tar.gz`). The data is built from public U.S. federal sources and is reproducible
end-to-end:

- **OSEP IDEA Section 618** child-count files
- **NCES Digest 2023**, Tables 204.30 (national series), 204.70 (state rates), 203.20 (denominators)

The build is deterministic; a master content hash gates regeneration. The hash for the
edition published on this site is `7a32f2ac…91fc88`.

To inspect the data itself, request access to the source database separately or rebuild it
from the original federal files using the Section 618 ETL described in the project
documentation.

## Files in this repository

| File                  | Description                                            |
|-----------------------|--------------------------------------------------------|
| `index.html`          | Self-contained dashboard (~924 KB; React/Recharts inlined) |
| `idea_dashboard.jsx`  | React/JSX source (pre-compilation input)               |
| `README.md`           | This file                                              |
| `.nojekyll`           | Disables Jekyll processing on GitHub Pages             |

## Building from source

```bash
npm install @babel/core @babel/preset-react
node build.js
```

(`build.js` strips ES6 imports, replaces with UMD globals, runs Babel, and inlines the
result into `index.html` along with React, ReactDOM, prop-types, and Recharts UMD bundles.)

## License

- **Code**: MIT
- **Data**: derived from public U.S. federal sources (NCES, OSEP); not subject to U.S. copyright.

## Citation

> *Special-Education Identification in the United States — A Statistical Companion*,
> idea_db edition, May 2026.
