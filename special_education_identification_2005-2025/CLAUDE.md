# CLAUDE.md — IDEA 특수교육 식별률 DB 보강 작업

## 프로젝트 개요
`special_education_identification_2005-2025` 프로젝트의 `idea_db_v2.sqlite`(SQLite)와
8개 장(章) 노트북을 보강한다. DB는 OSEP §618 Part B Child Count(분자)와
NCES Digest Table 203.20 공립 등록 수(분모)로 IDEA 식별률을 계산한다.

빌드 파이프라인:
- `_shared/schema/*.sql` → 테이블·view DDL (executescript로 적용)
- `_shared/build.py` → DB 생성 (dim/fact/meta 적재)
- `_shared/migrate_*.py` → 사후 마이그레이션 (원장 갱신 등)
- `chapterN/*_analysis.ipynb` → DB를 읽어 figure 생성

> ⚠️ DB를 직접 패치하지 말 것. 모든 수정은 schema/*.sql, build.py,
> 또는 migrate_*.py에 박아야 다음 빌드에서 유지된다.

## 진단 결과 (2026-06-01 점검, 확정)

### 문제 1 — 전국 비율 하향 편향 (핵심)
ch1 cell5, ch2 cell3, ch5 cell7이 view를 우회해 raw 테이블을 직접 SUM한다:
```sql
SELECT school_year, SUM(d.n_students) served, SUM(e.n_total) enroll
FROM fact_state_disability d JOIN fact_state_enrollment e ON ...
WHERE disability_code='ALL' AND age_band='ALL' GROUP BY school_year
```
`SUM(n_students)`는 분자 NULL 주를 건너뛰지만 `SUM(n_total)`은 그 주 분모를
더한다 → 분자만 빠지고 분모는 남는 비대칭 → 전국 비율이 실제보다 낮음.
영향: Figure 1.1, 2.1, 5.2 모두 편향됨. 편향 크기(검증값):

| year    | naive(편향) | correct | 편향(%p) |
|---------|------------|---------|---------|
| 2016-17 | 13.10      | 13.42   | -0.31   |
| 2017-18 | 13.14      | 13.69   | -0.54   |
| 2018-19 | 13.83      | 14.07   | -0.24   |
| 2019-20 | 13.93      | 14.17   | -0.24   |
(2017-18이 최대: WI+NE+MN+VT+ME 겹침)

### 문제 2 — 분자 NULL + 분모 생존 16건
전국 합산을 오염시키는 (year, state) 16건. 밴드별 진단:

| year-state | 3-5 | 6-21 | 패턴 |
|-----------|-----|------|------|
| VT 2007-08 | NULL | NULL | 양밴드 |
| VT 2008-09 | NULL | NULL | 양밴드 |
| WY 2012-13 | NULL | 값 | 유아밴드 |
| WY 2013-14 | NULL | 값 | 유아밴드 |
| NE 2016-17 | NULL | 값 | 유아밴드 |
| WI 2016-17 | NULL | NULL | 양밴드(OSEP 억제) |
| ME 2017-18 | 값 | NULL | 학령기(원장有) |
| MN 2017-18 | NULL | 값 | 유아밴드 |
| VT 2017-18 | 값 | NULL | 학령기(원장有) |
| WI 2017-18 | NULL | NULL | 양밴드(OSEP 억제) |
| WI 2018-19 | NULL | NULL | 양밴드(OSEP 억제) |
| WI 2019-20 | NULL | NULL | 양밴드(OSEP 억제) |
| LA 2020-21 | 값 | NULL | 학령기(원장有) |
| LA 2021-22 | NULL | 값 | 유아밴드 |
| NM 2023-24 | NULL | NULL | 양밴드 |

기존 원장(meta_dataquality) 12행 중 16건과 매칭되는 건 4건뿐
(WY 2014-15, ME 2017-18, VT 2017-18, LA 2020-21).
※ WY 2014-15는 16건 목록에 없음(별개). 16건 중 12건이 원장에 미설명.

### 문제 3 — 텍사스 상한 / COVID 맥락 미인코딩
TX 식별률 U자(2005-06 11.21% → 2013-14 8.61% → 2023-24 14.01%)는
TEA 8.5% 식별 상한(2004–2017, 2018 OSEP IDEA 위반 판정)의 산물이나
DB에는 정상값으로만 저장. ch5 본문·fig5_2는 다루지만 원장엔 없음.
COVID(ch7)도 동일.

### 문제 4 — 2024-25 분모 누락 = 의도된 설계 (수정 대상 아님)
build.py가 NCES d24를 2011-12..2023-24만 적재(NCES 2024-25 미발표).
분자는 2024-25까지 있으나 식별률은 19년(2005-06..2023-24)으로 한정.
build.py 라인 262 `expect 19`가 이를 명문화. → 그대로 두되 명시만.

## 작업 항목 (결정 확정)

### 결정 1: 2024-25 → 현행 유지 + 명시
원장에 INFO 행으로 "분모 미발표 → 식별률 19년 한정" 기록.

### 결정 2: view 2개 분리 + 노트북 교체
- `v_identification_rate_state` (주수준, 기존 로직)
- `v_identification_rate_national` (분자 NULL 주 분모째 제외 + n_states_included)
- `v_identification_rate` → _state 별칭으로 하위호환 유지
- ch1 cell5 / ch2 cell3 / ch5 cell7의 직접-SUM을 _national 조회로 교체
- figure에 "N개 주 기준(억제 주 제외)" 주석 추가

### 결정 3: 원장 보강 (16건 전부 + TX/COVID), issue_code로 출처 구분
- 구조 검출형(OSEP가 데이터에 명시): 기존 코드 사용
  - `OSEP_STATE_SUPPRESSED` (양밴드 NULL: WI 3건, VT 2건, NM 1건)
  - `AGE_BAND_SUPPRESSED` (한쪽 밴드 NULL: 기존 코드 재사용)
- 외부 맥락형(외부 근거 필요, 데이터엔 흔적 없음): 신규 분리
  - `STATE_POLICY_CAP` (TX 상한) — severity=info, source_ref에 외부근거 명시
  - `EXOGENOUS_SHOCK` (COVID) — severity=info
- ⚠️ 외부맥락형은 값에 NULL/플래그가 없으므로 severity=info로 두되
  description에 "외부 증거 기반, 데이터가 인증하지 않음" 문구 필수.

## 실행 순서
1. `_shared/schema/`가 zip에 누락됨 → DB에서 `.schema` 추출해 복원
   (recover_schema.py 참조). 특히 view DDL.
2. schema의 view 정의를 _state/_national/별칭 3개로 교체.
3. `migrate_dataquality_v3.py` 실행 → 원장 보강(아래 스크립트).
4. ch1/ch2/ch5 노트북 SUM 블록 교체 후 재실행 → fig 갱신.
5. `validate.py` 실행 → 회귀 테스트 통과 확인.
6. git: 브랜치 `fix/denominator-asymmetry`에서 작업, 커밋 분리.

## 검증 완료 (2026-06-01, DB 복사본에서 실행)
초안 3종을 실제 idea_db_v2.sqlite 복사본에 적용 → validate.py 8/8 PASS.
전국 비율 before/after (편향 제거 확인):

| year    | before  | after   | diff    | states |
|---------|---------|---------|---------|--------|
| 2016-17 | 13.1044 | 13.4182 | +0.3138 | 49     |
| 2017-18 | 13.1412 | 13.6850 | +0.5438 | 47     |
| 2018-19 | 13.8347 | 14.0733 | +0.2386 | 50     |
| 2019-20 | 13.9289 | 14.1675 | +0.2386 | 50     |
| 2022-23 | 15.1676 | 15.1676 | +0.0000 | 51     |

원장: 15행 추가 → 27행. 16건 편향행 전부 설명됨.

> 참고: rebuild_views.sql 적용은 `sqlite3 db < rebuild_views.sql` 또는
> Python `con.executescript(open('rebuild_views.sql').read())` 둘 다 가능.
> sqlite3 CLI가 없는 환경에서는 Python executescript 방식을 쓸 것.

## 회귀 테스트 (validate.py가 검사)
- [ ] _national view: 16건 분자NULL 주가 분모합에서 제외됨
- [ ] WI 2016-17~2019-20 전국비율이 +0.24~0.54%p 상향됨
- [ ] _state view: WI는 여전히 pct_identified=NULL (주별은 불변)
- [ ] n_states_included: 억제연도 < 51, 정상연도 = 51
- [ ] 원장: 16건 편향행 전부 매칭되는 설명행 존재
- [ ] 2024-25: 분자 있고 분모 없음, 식별률 NULL (현행 유지 확인)
- [ ] TX U자: STATE_POLICY_CAP 행 존재, severity=info

## 데이터 사실 메모 (변경 금지)
- 분모 monetary 아님, 단위는 학생 수(명)
- 분자 N은 3–21세(19–21 전환 + 사립ISP 포함) → PK-12 분모 대비 상향편의
- NCES d13|d24 seam = 2011-12 (vintage seam, 추세 해석 주의)
- 5세 재분류 break = 2020-21 (FFY 2020)
- 13개는 OSEP 보고범주, 법정범주(34 CFR §300.8) 아님 (HI⊇Deafness, DD 비범주)

## 완료: figure 미용 종합 패스 (커밋 97b2ef8)
4개 figure(fig1.1/2.1/2.2/5.2)의 억제-주 Note를 그림에서 제거하고
각 장 본문의 figure 아래 이탤릭 캡션으로 이동해 처리.
- fig2.1 하단 Note가 x축 라벨/제목과 겹침 → 해결: Note를 그림에서 본문
  캡션으로 이동(ax.text 제거), 노트북 재실행.
- fig1.1 동일 패턴 → 해결: 동일하게 Note 제거, 기존 캡션에 한 문장 덧붙임.
- fig5.2 캡era 텍스트+OSEP 화살표에 Note까지 더해 빽빽 → 해결: Note 제거로
  여유 확보, 본문 캡션으로 이동(텍사스는 주수준이라 불영향 명시).
- chapter2.md §2.6 summary 긴 줄 → 해결: ~76자 폭으로 reflow.
- (덤) 패스 중 발견한 chapter1.md fig1.1 캡션 stale 15.7→15.8% 정정(커밋 526e3d5).
