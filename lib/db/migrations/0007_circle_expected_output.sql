UPDATE "concepts"
SET "practice_code" = replace(
  "practice_code",
  '#   - round()로 소수점 2자리까지 반올림해서 출력하세요',
  E'#   - round()로 소수점 2자리까지 반올림해서 출력하세요\n#\n# 출력 결과:\n# 원의 넓이: 78.54\n# 원의 둘레: 31.42'
)
WHERE "source_concept_id" = 7
  AND "practice_code" LIKE '%# 문제: 원의 넓이와 둘레를 계산하세요.%'
  AND "practice_code" NOT LIKE '%# 원의 넓이: 78.54%';

UPDATE "concepts"
SET "practice_code" = replace(
  "practice_code",
  E'print("파이 값:", math.pi)\n',
  ''
)
WHERE "source_concept_id" = 7
  AND "practice_code" LIKE '%# 문제: 원의 넓이와 둘레를 계산하세요.%';
