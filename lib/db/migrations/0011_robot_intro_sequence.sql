-- 기본 Robot API 소개 예제의 감정 표현 순서와 도형 배치를 개선한다.
-- 교사가 수정한 커리큘럼은 건드리지 않고, 기존 예제 조각이 그대로 남은 기본 커리큘럼만 갱신한다.

UPDATE "concepts" AS "unit"
SET "example_code" = replace(
  "unit"."example_code",
  E'for feeling in ["happy", "sad", "angry", "surprised"]:\n    robot.emotion(feeling)\n    robot.say(feeling + "!")',
  E'for feeling in ["happy", "sad", "angry", "surprised"]:\n    robot.say(feeling + "!")\n    robot.emotion(feeling)'
)
FROM "curriculum_sets" AS "curriculum"
WHERE "unit"."curriculum_id" = "curriculum"."id"
  AND "curriculum"."is_default" = true
  AND "curriculum"."owner_teacher_id" IS NULL
  AND "unit"."source_concept_id" = 0
  AND "unit"."example_code" LIKE '%robot.emotion(feeling)%robot.say(feeling + "!")%';

UPDATE "concepts" AS "unit"
SET "example_code" = replace(
  "unit"."example_code",
  E'robot.emotion("happy")\nrobot.say("이동 시작!")',
  E'robot.say("이동 시작!")\nrobot.emotion("happy")'
)
FROM "curriculum_sets" AS "curriculum"
WHERE "unit"."curriculum_id" = "curriculum"."id"
  AND "curriculum"."is_default" = true
  AND "curriculum"."owner_teacher_id" IS NULL
  AND "unit"."source_concept_id" = 0
  AND "unit"."example_code" LIKE '%robot.emotion("happy")%robot.say("이동 시작!")%';

UPDATE "concepts" AS "unit"
SET "example_code" = replace(
  "unit"."example_code",
  E'for shape in ["circle", "star", "heart", "diamond", "square", "triangle"]:\n    robot.draw(shape)',
  E'# draw()는 로봇의 현재 위치에 도형을 그려요.\n# 먼저 왼쪽 위로 이동한 뒤, 3개씩 두 줄로 그려봅시다.\nrobot.turn("left")\nrobot.move(4)\nrobot.turn("up")\nrobot.move(2)\n\nrobot.draw("circle")\nrobot.turn("right")\nrobot.move(2)\nrobot.draw("star")\nrobot.move(2)\nrobot.draw("heart")\n\nrobot.turn("down")\nrobot.move(2)\nrobot.draw("diamond")\nrobot.turn("left")\nrobot.move(2)\nrobot.draw("square")\nrobot.move(2)\nrobot.draw("triangle")\n\n# 마지막 도형을 가리지 않도록 아래로 이동해요.\nrobot.turn("down")\nrobot.move(2)'
)
FROM "curriculum_sets" AS "curriculum"
WHERE "unit"."curriculum_id" = "curriculum"."id"
  AND "curriculum"."is_default" = true
  AND "curriculum"."owner_teacher_id" IS NULL
  AND "unit"."source_concept_id" = 0
  AND "unit"."example_code" LIKE '%for shape in ["circle", "star", "heart", "diamond", "square", "triangle"]:%';
