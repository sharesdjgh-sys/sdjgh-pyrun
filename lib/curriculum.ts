export interface ConceptExample {
  nameKo: string;
  nameEn: string;
  exampleCode: string;
  explanation: string;
}

export const CONCEPT_EXAMPLES: Record<number, ConceptExample> = {
  1: {
    nameKo: "출력",
    nameEn: "print",
    exampleCode: `import robot

print("안녕하세요!")
robot.say("안녕하세요!")

print("반갑습니다!")
robot.emotion("happy")`,
    explanation: "print()와 robot.say() 함수로 텍스트를 출력해봅니다.",
  },
  2: {
    nameKo: "변수",
    nameEn: "variable",
    exampleCode: `import robot

name = "홍길동"
score = 95

robot.say(f"이름은 {name}이고 점수는 {score}점!")
print("이름:", name)
print("점수:", score)`,
    explanation: "변수에 값을 할당하고 로봇 대사에서 사용해봅니다.",
  },
  3: {
    nameKo: "산술 연산자",
    nameEn: "arithmetic_operator",
    exampleCode: `import robot

a = 3
b = 2

# 연산 결과(5)만큼 이동하고 춤을 춥니다
result = a + b
print("a + b =", result)

robot.move(result)
robot.dance()`,
    explanation: "+, -, *, / 등 연산 기호의 결과를 로봇 모션으로 관찰합니다.",
  },
  4: {
    nameKo: "비교 연산자",
    nameEn: "comparison_operator",
    exampleCode: `import robot

score = 90
target = 80

is_higher = score > target
print("통과 여부:", is_higher)

if is_higher:
    robot.emotion("happy")
    robot.jump()
else:
    robot.emotion("sad")`,
    explanation: "크기 비교 연산(>, <, == 등) 결과를 로봇의 표정으로 표현합니다.",
  },
  5: {
    nameKo: "할당 연산자",
    nameEn: "assignment_operator",
    exampleCode: `import robot

steps = 0
steps += 3
print("1차 이동:", steps)
robot.move(steps)

steps -= 2
print("2차 이동:", steps)
robot.turn("left")
robot.move(steps)`,
    explanation: "+=, -= 등을 사용해 로봇의 누적 이동 거리를 제어합니다.",
  },
  6: {
    nameKo: "논리 연산자",
    nameEn: "logical_operator",
    exampleCode: `import robot

is_weekend = True
has_homework = False

# 주말이고 숙제가 없으면 춤을 춥니다
can_play = is_weekend and not has_homework
print("놀 수 있나요?:", can_play)

if can_play:
    robot.say("신난다!")
    robot.dance()
else:
    robot.emotion("sad")`,
    explanation: "and, or, not 논리 조합에 따라 로봇을 다르게 행동하게 만듭니다.",
  },
  7: {
    nameKo: "숫자형",
    nameEn: "number_type",
    exampleCode: `import robot
import random

# random 모듈을 사용하여 1~5 사이의 정수를 뽑습니다
rand_steps = random.randint(1, 5)
print("랜덤 칸수:", rand_steps)

robot.move(rand_steps)
robot.jump()`,
    explanation: "랜덤으로 정수를 생성해 로봇의 무작위 이동을 유도합니다.",
  },
  8: {
    nameKo: "문자형",
    nameEn: "string_type",
    exampleCode: `import robot

text = "파이썬 코딩 놀이터"
# 문자열 슬라이싱을 이용해 앞 3글자("파이썬")만 추출합니다
head = text[0:3]
print("추출 문자열:", head)

robot.say(head)
robot.emotion("happy")`,
    explanation: "문자열 조작 결과를 로봇이 말풍선으로 읽게 해봅니다.",
  },
  9: {
    nameKo: "리스트",
    nameEn: "list",
    exampleCode: `import robot

shapes = ["circle", "square", "triangle"]

# 리스트에 있는 도형 형태를 차례로 순회하며 그립니다
for shape in shapes:
    robot.draw(shape)
    robot.move(1)

robot.say("완성!")`,
    explanation: "리스트 자료형에 담긴 요소들로 로봇의 행동 패턴을 차례로 지시합니다.",
  },
  10: {
    nameKo: "불리언",
    nameEn: "boolean",
    exampleCode: `import robot

is_happy = True

if is_happy:
    robot.emotion("happy")
    robot.jump()
    robot.say("행복해!")
else:
    robot.emotion("sad")`,
    explanation: "참(True)과 거짓(False) 판별 결과로 로봇 상태를 변경합니다.",
  },
  11: {
    nameKo: "조건문",
    nameEn: "conditional",
    exampleCode: `import robot

score = 85
if score >= 90:
    robot.emotion("happy")
    robot.jump()
    robot.say("A등급! 최고야!")
elif score >= 80:
    robot.emotion("happy")
    robot.say("B등급! 잘했어!")
else:
    robot.emotion("sad")
    robot.say("더 힘내자!")`,
    explanation: "값의 범위 분기점(if/elif/else)을 만들고 로봇의 감정을 분기합니다.",
  },
  12: {
    nameKo: "for 반복문",
    nameEn: "for_loop",
    exampleCode: `import robot

# 4번 반복하면서 전진하고 별을 그립니다
for i in range(4):
    robot.move(1)
    robot.draw("star")

robot.say("별 4개 완료!")
robot.dance()`,
    explanation: "for 루프를 통해 반복적인 로봇 움직임과 드로잉을 간결하게 표현합니다.",
  },
  13: {
    nameKo: "while 반복문",
    nameEn: "while_loop",
    exampleCode: `import robot

count = 0
# count가 3보다 작은 동안 계속 반복합니다
while count < 3:
    robot.move(1)
    robot.draw("circle")
    count += 1

robot.say("동그라미 3개 끝!")`,
    explanation: "조건 만족 조건문(while)을 써서 로봇을 반복 이동 및 드로잉 시킵니다.",
  },
  14: {
    nameKo: "함수",
    nameEn: "function",
    exampleCode: `import robot

# 매개변수를 받는 도형 그리기 함수를 정의합니다
def move_and_draw(shape, steps):
    robot.move(steps)
    robot.draw(shape)

# 여러 번 재사용해 함수를 실행합니다
move_and_draw("square", 2)
move_and_draw("circle", 2)
robot.say("도형 2개 완료!")`,
    explanation: "로봇 행동의 묶음을 함수로 만들고 간편하게 호출해 재사용합니다.",
  },
  15: {
    nameKo: "클래스",
    nameEn: "class",
    exampleCode: `import robot

class Pet:
    def __init__(self, name):
        self.name = name

    def introduce(self):
        robot.say(f"내 이름은 {self.name}!")

dog = Pet("바둑이")
dog.introduce()

# 클래스로 인스턴스(객체)를 만드는 과정을 로봇 복제로 시각화해봅니다
robot.clone()`,
    explanation: "클래스로부터 여러 로봇(객체)을 생성하는 개념을 실습해봅니다.",
  },
  16: {
    nameKo: "모듈",
    nameEn: "module",
    exampleCode: `import robot
import random

# random 모듈의 choice 함수를 이용합니다
random_scale = random.choice([0.7, 1.2, 1.8])
print("크기 배율:", random_scale)

robot.size(random_scale)
robot.say(f"크기가 {random_scale}배가 되었어!")`,
    explanation: "외부 파이썬 모듈의 다양한 함수를 불러와 로봇에 적용해봅니다.",
  },
};

export const BADGE_METADATA = [
  { conceptId: 1, nameKo: "출력 마스터", iconName: "Terminal", colorClass: "text-green-500" },
  { conceptId: 2, nameKo: "변수 마스터", iconName: "Variable", colorClass: "text-blue-500" },
  { conceptId: 3, nameKo: "연산 마스터", iconName: "Calculator", colorClass: "text-yellow-500" },
  { conceptId: 4, nameKo: "비교 마스터", iconName: "Scale", colorClass: "text-orange-500" },
  { conceptId: 5, nameKo: "할당 마스터", iconName: "Equal", colorClass: "text-amber-500" },
  { conceptId: 6, nameKo: "논리 마스터", iconName: "GitBranch", colorClass: "text-red-500" },
  { conceptId: 7, nameKo: "숫자 마스터", iconName: "Hash", colorClass: "text-teal-500" },
  { conceptId: 8, nameKo: "문자 마스터", iconName: "Type", colorClass: "text-cyan-500" },
  { conceptId: 9, nameKo: "리스트 마스터", iconName: "List", colorClass: "text-sky-500" },
  { conceptId: 10, nameKo: "논리값 마스터", iconName: "ToggleLeft", colorClass: "text-violet-500" },
  { conceptId: 11, nameKo: "조건 마스터", iconName: "GitMerge", colorClass: "text-pink-500" },
  { conceptId: 12, nameKo: "for 마스터", iconName: "RotateCcw", colorClass: "text-emerald-500" },
  { conceptId: 13, nameKo: "while 마스터", iconName: "RefreshCw", colorClass: "text-lime-500" },
  { conceptId: 14, nameKo: "함수 마스터", iconName: "FunctionSquare", colorClass: "text-indigo-500" },
  { conceptId: 15, nameKo: "클래스 마스터", iconName: "Boxes", colorClass: "text-purple-500" },
  { conceptId: 16, nameKo: "모듈 마스터", iconName: "Package", colorClass: "text-orange-600" },
];
