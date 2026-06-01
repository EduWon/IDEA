-- rebuild_views.sql
-- 결정 2: v_identification_rate 를 주수준/전국집계 2개 + 하위호환 별칭으로 분리.
-- schema/02_views.sql 의 기존 v_identification_rate 정의를 이 블록으로 교체.
-- (재빌드 없이 기존 DB에 즉시 적용하려면 이 파일을 sqlite3 .read 로 실행)

DROP VIEW IF EXISTS v_identification_rate;
DROP VIEW IF EXISTS v_identification_rate_state;
DROP VIEW IF EXISTS v_identification_rate_national;

-- (1) 주수준: 기존 로직과 동일. 분자(n_served) NULL이면 pct도 NULL.
--     주별 조회는 반드시 WHERE pct_identified IS NOT NULL 로 필터.
CREATE VIEW v_identification_rate_state AS
SELECT
    d.school_year,
    d.state_code,
    d.n_students                       AS n_served,
    e.n_total                          AS n_enrolled,
    100.0 * d.n_students / e.n_total   AS pct_identified
FROM fact_state_disability d
JOIN fact_state_enrollment e
  ON d.school_year = e.school_year
 AND d.state_code  = e.state_code
WHERE d.disability_code = 'ALL'
  AND d.age_band        = 'ALL';

-- (2) 전국집계: 핵심은 WHERE n_served IS NOT NULL.
--     분자 없는 주는 행째로 제외 → 그 주 분모도 SUM에서 자동 제외.
--     "분자만 빠지고 분모는 남는" 비대칭이 구조적으로 불가능.
--     n_states_included 로 그 해 비율이 몇 개 주 기준인지 노출.
CREATE VIEW v_identification_rate_national AS
SELECT
    school_year,
    SUM(n_served)                           AS total_served,
    SUM(n_enrolled)                          AS total_enrolled,
    100.0 * SUM(n_served) / SUM(n_enrolled)  AS pct_identified,
    COUNT(*)                                 AS n_states_included
FROM v_identification_rate_state
WHERE n_served IS NOT NULL
GROUP BY school_year;

-- (3) 하위호환 별칭: 기존 노트북의 FROM v_identification_rate 주별 조회 유지.
--     신규 코드는 _state / _national 을 명시적으로 사용할 것.
CREATE VIEW v_identification_rate AS
SELECT * FROM v_identification_rate_state;
