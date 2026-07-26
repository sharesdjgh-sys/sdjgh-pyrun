-- Level 1 연습문제의 출력 예시를 동일한 프레임 형식으로 안내한다.
UPDATE "concepts"
SET "practice_code" = replace(
  "practice_code",
  E'#\n# 출력 결과:\n#   안녕안녕안녕\n#   사과바나나\n#   3 * 4 = 12',
  E'##############\n# 출력 결과:\n# 안녕안녕안녕\n# 사과바나나\n# 3 * 4 = 12\n##############'
)
WHERE "source_concept_id" = 1;

-- 0007에서 추가한 숫자형 문제의 기존 비프레임 출력 블록을 먼저 제거한다.
UPDATE "concepts"
SET "practice_code" = replace(
  "practice_code",
  E'\n#\n# 출력 결과:\n# 원의 넓이: 78.54\n# 원의 둘레: 31.42',
  ''
)
WHERE "source_concept_id" = 7
  AND "practice_code" NOT LIKE '%##############%';

WITH "expected_outputs" ("source_id", "anchor", "output_block") AS (
  VALUES
    (
      2,
      '#   3. f-string으로 "나는 _학년이고, _ 과목을 좋아해!" 형태로 출력하세요',
      E'##############\n# 출력 결과:\n# 나는 1학년이고, 정보 과목을 좋아해!\n##############'
    ),
    (
      3,
      '#   - 넓이와 둘레를 print()로 출력하고, 로봇을 넓이만큼 이동시키세요',
      E'##############\n# 출력 결과:\n# 넓이: 15\n# 둘레: 16\n##############'
    ),
    (
      4,
      '#   - True이면 로봇이 기뻐하고, False이면 슬퍼하게 하세요',
      E'##############\n# 출력 결과:\n# 80점 이상?: False\n# score == target: False\n# score != target: True\n##############'
    ),
    (
      5,
      '#   - 각 단계마다 hp를 출력하고, 최종 hp를 로봇이 말하게 하세요',
      E'##############\n# 출력 결과:\n# 시작 HP: 100\n# 피해 후 HP: 70\n# 회복 후 HP: 90\n# 배율 후 HP: 180\n##############'
    ),
    (
      6,
      '#   - can_enter 변수에 입장 가능 여부를 저장하세요',
      E'##############\n# 출력 결과:\n# 주말: True\n# 비 여부: False\n# 입장 가능?: True\n##############'
    ),
    (
      7,
      '#   - round()로 소수점 2자리까지 반올림해서 출력하세요',
      E'##############\n# 출력 결과:\n# 원의 넓이: 78.54\n# 원의 둘레: 31.42\n##############'
    ),
    (
      8,
      '#   - f-string으로 "첫 글자: _" 형태로 출력하세요',
      E'##############\n# 출력 결과:\n# 첫 3글자: 파이썬\n# 마지막 3글자: 미있다\n# 첫 글자: 파\n# 글자 수: 9\n##############'
    ),
    (
      9,
      '#   - 90점 이상이면 로봇이 bounce, 아니면 move(1)',
      E'##############\n# 출력 결과:\n# 민준: 88점\n# 서연: 95점\n# 지호: 72점\n# 하은: 91점\n# 최고 점수: 95\n##############'
    ),
    (
      10,
      '#   - can_attack 결과에 따라 로봇이 다르게 반응하게 하세요',
      E'##############\n# 출력 결과:\n# is_alive 자료형: <class ''bool''>\n# 생존: True\n# 무기 소지: False\n# 공격 가능?: False\n##############'
    ),
    (
      11,
      '# color 값을 바꿔가며 테스트해보세요!',
      E'##############\n# 출력 결과:\n# 현재 신호: green\n# 출발!\n##############'
    ),
    (
      12,
      '#   - "3 x 1 = 3" 형태로 출력 + 로봇이 매번 결과를 말하게 하세요',
      E'##############\n# 출력 결과:\n# 3 x 1 = 3\n# 3 x 2 = 6\n# 3 x 3 = 9\n# 3 x 4 = 12\n# 3 x 5 = 15\n# 3 x 6 = 18\n# 3 x 7 = 21\n# 3 x 8 = 24\n# 3 x 9 = 27\n##############'
    ),
    (
      13,
      '#   - 매 반복마다 로봇이 현재 합계를 말하게 하세요',
      E'##############\n# 출력 결과:\n# 누적 합: 55\n# 마지막 숫자: 10\n##############'
    ),
    (
      14,
      '#   - add(7, 3)과 average(7, 3)을 호출해 결과를 출력하세요',
      E'##############\n# 출력 결과:\n# 7 + 3 = 10\n# (7 + 3) / 2 = 5.0\n##############'
    ),
    (
      15,
      '#   - Student("홍길동", 1, 85)로 인스턴스 생성 후 테스트하세요',
      E'##############\n# 출력 결과:\n# 이름: 홍길동, 학년: 1, 점수: 85\n##############'
    ),
    (
      16,
      '#   - 로봇이 결과를 말하게 하세요',
      E'##############\n# 출력 결과:\n# 로또 번호: [실행할 때마다 달라지는 1~45 사이 숫자 6개]\n# 6! = 720\n##############'
    )
)
UPDATE "concepts" AS "concept"
SET "practice_code" = replace(
  "concept"."practice_code",
  "expected"."anchor",
  "expected"."anchor" || E'\n' || "expected"."output_block"
)
FROM "expected_outputs" AS "expected"
WHERE "concept"."source_concept_id" = "expected"."source_id"
  AND "concept"."practice_code" LIKE '%' || "expected"."anchor" || '%'
  AND "concept"."practice_code" NOT LIKE '%##############%';

-- 출력 예시와 모순되지 않도록 선택값을 고정하고 실제 print()도 수행한다.
UPDATE "concepts"
SET "practice_code" = replace(
  replace(
    replace(
      replace(
        "practice_code",
        '#   1. subject 변수에 좋아하는 과목 이름(문자열)을 저장하세요',
        '#   1. subject = "정보"로 저장하세요'
      ),
      '#   2. grade 변수에 학년(숫자)을 저장하세요',
      '#   2. grade = 1로 저장하세요'
    ),
    'subject = "정보"   # 원하는 과목으로 바꿔보세요',
    'subject = "정보"'
  ),
  'grade = 1          # 학년으로 바꿔보세요',
  'grade = 1'
)
WHERE "source_concept_id" = 2;

UPDATE "concepts"
SET "practice_code" = replace(
  "practice_code",
  '#   - dan = 3 으로 설정 (원하는 단으로 바꿔도 됩니다)',
  '#   - dan = 3 으로 설정'
)
WHERE "source_concept_id" = 12;

UPDATE "concepts"
SET "practice_code" = replace(
  replace(
    replace(
      replace(
        replace(
          replace(
            "practice_code",
            '# color 값을 바꿔가며 테스트해보세요!',
            '#   - color = "green"으로 설정하세요'
          ),
          'color = "green"   # "red", "yellow", "green" 으로 바꿔보세요',
          'color = "green"'
        ),
        'if color == "red":',
        E'if color == "red":\n    print("정지!")'
      ),
      'elif color == "yellow":',
      E'elif color == "yellow":\n    print("준비!")'
    ),
    'elif color == "green":',
    E'elif color == "green":\n    print("출발!")'
  ),
  'else:',
  E'else:\n    print("모르는 색이야!")'
)
WHERE "source_concept_id" = 11
  AND "practice_code" NOT LIKE '%print("출발!")%';
