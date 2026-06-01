-- 결정 2: v_identification_rate 를 주수준/전국집계 2개 + 하위호환 별칭으로 분리.
-- 정본은 _shared/rebuild_views.sql. 두 파일을 항상 동기 유지할 것.

-- (1) 주수준: 기존 로직과 동일. 분자(n_served) NULL이면 pct도 NULL.
--     주별 조회는 반드시 WHERE pct_identified IS NOT NULL 로 필터.
-- view: v_identification_rate_state
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
-- view: v_identification_rate_national
CREATE VIEW v_identification_rate_national AS
SELECT
    school_year,
    SUM(n_served)                            AS total_served,
    SUM(n_enrolled)                          AS total_enrolled,
    100.0 * SUM(n_served) / SUM(n_enrolled)  AS pct_identified,
    COUNT(*)                                 AS n_states_included
FROM v_identification_rate_state
WHERE n_served IS NOT NULL
GROUP BY school_year;

-- (3) 하위호환 별칭: 기존 노트북의 FROM v_identification_rate 주별 조회 유지.
--     신규 코드는 _state / _national 을 명시적으로 사용할 것.
-- view: v_identification_rate
CREATE VIEW v_identification_rate AS
SELECT * FROM v_identification_rate_state;

-- view: v_lre_inclusion
CREATE VIEW v_lre_inclusion AS
SELECT
    school_year,
    state_code,
    disability_code,
    SUM(CASE WHEN env_group='inside_80_plus' THEN n_students ELSE 0 END) AS n_inside_80,
    SUM(COALESCE(n_students,0))                                          AS n_total_school_age,
    CASE WHEN SUM(COALESCE(n_students,0)) > 0
         THEN 100.0 * SUM(CASE WHEN env_group='inside_80_plus' THEN n_students ELSE 0 END)
                    / SUM(COALESCE(n_students,0))
         ELSE NULL END                                                   AS inclusion_80_rate
FROM fact_state_environment
GROUP BY school_year, state_code, disability_code;

