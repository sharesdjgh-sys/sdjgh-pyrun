export interface ConceptExample {
  nameKo: string;
  nameEn: string;
  exampleCode: string;
  explanation: string;
  practiceCode: string;
}

export type CurriculumItem = {
  nameKo: string;
  nameEn: string;
  explanation: string;
  exampleCode: string;
  practiceCode: string;
};

export const CONCEPT_EXAMPLES: Record<number, ConceptExample> = {
  0: {
    nameKo: "Robot API 소개",
    nameEn: "robot_api_intro",
    exampleCode: `import robot

# 🤖 파이썬으로 로봇을 움직여보자!

# ① 말하기
robot.say("안녕! 나는 AI 로봇이야!")

# ② 감정 표현 - happy / sad / angry / surprised
for feeling in ["happy", "sad", "angry", "surprised"]:
    robot.emotion(feeling)
    robot.say(feeling + "!")

# ③ 이동 & 방향 전환
robot.emotion("happy")
robot.say("이동 시작!")
robot.move(3)
robot.turn("left")
robot.move(2)

# ④ 점프 & 바운스
robot.say("점프!")
robot.jump()
robot.say("바운스!")
robot.bounce(3)

# ⑤ 회전 & 흔들기
robot.say("빙글빙글!")
robot.spin()
robot.say("흔들흔들!")
robot.shake()

# ⑥ 크기 변경
robot.say("크게!")
robot.size(2.5)
robot.say("작게!")
robot.size(0.5)
robot.size(1.0)

# ⑦ 도형 그리기 & 지우기
robot.say("그림 그리기!")
robot.clear()
for shape in ["circle", "star", "heart", "diamond", "square", "triangle"]:
    robot.draw(shape)

# ⑧ 복제
robot.say("복제!")
robot.clone()
robot.clone()

# ⑨ 댄스 타임!
robot.say("다 같이 댄스!")
robot.dance()
robot.say("Robot API 완전 정복!")`,
    explanation: "robot 모듈로 로봇을 자유자재로 움직여봐요! move, say, emotion, dance 등 다양한 명령으로 재미있는 코드를 만들 수 있어요.",
    practiceCode: `# Robot API 자유 놀이터!
# 아래 명령어들을 조합해서 나만의 로봇 공연을 만들어보세요.
#
# 사용 가능한 명령:
#   robot.say("텍스트")          말하기
#   robot.emotion("happy/sad/angry/surprised")  감정
#   robot.move(칸수)             이동 (1~20)
#   robot.turn("left"/"right")  방향 전환
#   robot.jump()                점프
#   robot.bounce(횟수)          바운스 (1~5)
#   robot.spin()                360° 회전
#   robot.shake()               흔들기
#   robot.size(배율)            크기 변경 (0.5~3.0)
#   robot.draw("circle/square/triangle/star/heart/diamond")  도형
#   robot.clear()               도형 지우기
#   robot.clone()               복제 (최대 5개)
#   robot.dance()               댄스

import robot

# 여기에 자유롭게 코드를 작성하세요!
robot.say("나만의 로봇 공연 시작!")

# 힌트: for문으로 반복하면 더 재미있어요!
for i in range(3):
    robot.bounce(1)
    robot.say(f"{i+1}번째 바운스!")

robot.dance()`,
  },
  1: {
    nameKo: "출력",
    nameEn: "print",
    exampleCode: `import robot

robot.say("뭐든 출력할 수 있어!")

print(123)
robot.say("숫자 123!")

print("안녕하세요")
robot.say("문자열도!")
robot.emotion("happy")

멍 = "멍" * 3
print("강아지가", 멍)
robot.say(f"강아지가 {멍}")
robot.bounce(2)

calc = 1 + 2
print("1 + 2 =", calc)
robot.say(f"1+2={calc}!")
robot.spin()
robot.say("print 마스터!")`,
    explanation: "print()는 괄호 안의 값을 화면에 출력합니다. 쉼표(,)로 여러 값을, *(곱셈)으로 반복을 출력할 수 있어요.",
    practiceCode: `# 문제: 아래 출력 결과가 정확히 나오도록 코드를 완성하세요.
#
# 출력 결과:
#   안녕 안녕 안녕
#   사과 + 바나나
#   3 * 4 = 12

import robot

# "안녕"을 3번 반복 출력 (hint: * 사용)
print("안녕" * 3)

# "사과"와 "바나나"를 + 기호로 이어 출력 (hint: + 사용)
print("사과" + " + " + "바나나")

# "3 * 4 = "와 3*4 계산 결과를 함께 출력
print("3 * 4 =", 3 * 4)

robot.say("출력 완성!")
robot.emotion("happy")`,
  },
  2: {
    nameKo: "변수",
    nameEn: "variable",
    exampleCode: `import robot

name = "홍길동"
robot.say(f"이름 저장: {name}!")
robot.emotion("happy")
print("이름:", name)

score = 95
robot.say(f"점수 저장: {score}점!")
robot.move(score // 20)
print("점수:", score)

doubled = score * 2
print("2배:", doubled)
robot.say(f"{score}×2={doubled}!")
robot.bounce(2)

msg = f"{name}의 점수는 {score}점!"
print(msg)
robot.spin()
robot.dance()
robot.say(msg)`,
    explanation: "변수는 값을 저장하는 이름표입니다. =으로 값을 할당하고, f-string(f\"...\")으로 변수 값을 문자열 안에 넣을 수 있어요.",
    practiceCode: `# 문제: 변수를 만들어 나를 소개하는 코드를 완성하세요.
# 조건:
#   1. subject 변수에 좋아하는 과목 이름(문자열)을 저장하세요
#   2. grade 변수에 학년(숫자)을 저장하세요
#   3. f-string으로 "나는 _학년이고, _ 과목을 좋아해!" 형태로 출력하세요

import robot

subject = "정보"   # 원하는 과목으로 바꿔보세요
grade = 1          # 학년으로 바꿔보세요

print(f"나는 {grade}학년이고, {subject} 과목을 좋아해!")

robot.say(f"{subject} 최고!")
robot.emotion("happy")`,
  },
  3: {
    nameKo: "산술 연산자",
    nameEn: "arithmetic_operator",
    exampleCode: `import robot

a = 7
b = 3
robot.say(f"a={a}, b={b}")

print("a + b =", a + b)
robot.say(f"{a}+{b}={a+b}!")
robot.move(a + b)

print("a - b =", a - b)
robot.say(f"{a}-{b}={a-b}")

print("a * b =", a * b)
robot.say(f"{a}×{b}={a*b}!")
robot.size(round(a / b, 1))

print("a // b =", a // b)
print("a % b =", a % b)
robot.say(f"몫:{a//b} 나머지:{a%b}")
robot.bounce(a % b)

print("a ** b =", a ** b)
robot.say(f"{a}^{b}={a**b}!")
robot.spin()`,
    explanation: "+, -, *, /는 기본 사칙연산, //(몫), %(나머지), **(거듭제곱)도 자주 씁니다.",
    practiceCode: `# 문제: 가로 5, 세로 3인 직사각형의 넓이와 둘레를 계산하세요.
# 조건:
#   - 넓이(area) = width * height
#   - 둘레(perimeter) = (width + height) * 2
#   - 넓이와 둘레를 print()로 출력하고, 로봇을 넓이만큼 이동시키세요

import robot

width = 5
height = 3

area = width * height
perimeter = (width + height) * 2

print("넓이:", area)
print("둘레:", perimeter)

robot.move(area)
robot.say(f"넓이는 {area}!")`,
  },
  4: {
    nameKo: "비교 연산자",
    nameEn: "comparison_operator",
    exampleCode: `import robot

a = 7
b = 3
robot.say(f"{a}과 {b} 비교!")

print("a == b:", a == b)
robot.say(f"{a}=={b}? {a==b}")
robot.shake()

print("a != b:", a != b)
robot.say(f"{a}!={b}? {a!=b}")
robot.bounce(1)

print("a > b:", a > b)
robot.say(f"{a}>{b}? {a>b}")

print("a < b:", a < b)
robot.say(f"{a}<{b}? {a<b}")

if a > b:
    robot.emotion("happy")
    robot.say(f"{a}이 더 크다!")
    robot.jump()

print("apple < banana:", "apple" < "banana")
robot.say("알파벳 순 비교!")
robot.spin()`,
    explanation: "비교 연산자는 두 값을 비교해 True 또는 False를 반환합니다. ==은 '같다', !=은 '다르다'를 의미해요.",
    practiceCode: `# 문제: score를 기준값과 비교하는 코드를 완성하세요.
# 조건:
#   - score = 75, target = 80 으로 설정하세요
#   - score >= target 결과를 result 변수에 저장하세요
#   - True이면 로봇이 기뻐하고, False이면 슬퍼하게 하세요

import robot

score = 75
target = 80

result = score >= target
print("80점 이상?:", result)
print("score == target:", score == target)
print("score != target:", score != target)

if result:
    robot.emotion("happy")
    robot.say("목표 달성!")
else:
    robot.emotion("sad")
    robot.say(f"{target - score}점 부족해!")`,
  },
  5: {
    nameKo: "할당 연산자",
    nameEn: "assignment_operator",
    exampleCode: `import robot

hp = 100
robot.size(hp / 50)
robot.say(f"HP: {hp}!")
print("시작:", hp)

hp -= 30
robot.size(hp / 50)
robot.emotion("sad")
robot.say(f"피해! HP: {hp}")
robot.shake()
print("피해 후:", hp)

hp += 20
robot.size(hp / 50)
robot.emotion("happy")
robot.say(f"회복! HP: {hp}")
robot.bounce(2)
print("회복 후:", hp)

hp *= 2
robot.size(min(hp / 50, 3.0))
robot.say(f"강화! HP: {hp}!")
robot.spin()
robot.dance()
print("최종:", hp)`,
    explanation: "+=, -=, *=, /= 는 변수에 연산 후 결과를 다시 저장하는 복합 할당 연산자입니다.",
    practiceCode: `# 문제: 로봇 체력(hp)을 복합 할당 연산자로 관리하세요.
# 조건:
#   - hp = 100 으로 시작
#   - 적에게 맞아 hp가 30 감소 (hp -= 30)
#   - 아이템을 먹어 hp가 20 증가 (hp += 20)
#   - 배율 아이템으로 hp가 2배 (hp *= 2)
#   - 각 단계마다 hp를 출력하고, 최종 hp를 로봇이 말하게 하세요

import robot

hp = 100
print("시작 HP:", hp)

hp -= 30
print("피해 후 HP:", hp)

hp += 20
print("회복 후 HP:", hp)

hp *= 2
print("배율 후 HP:", hp)

robot.say(f"최종 HP: {hp}!")
if hp >= 100:
    robot.emotion("happy")
else:
    robot.emotion("sad")`,
  },
  6: {
    nameKo: "논리 연산자",
    nameEn: "logical_operator",
    exampleCode: `import robot

a = 6
robot.say(f"a = {a}")

result1 = a % 2 == 0
print(f"{a}은 2의 배수:", result1)
robot.say(f"2의 배수? {result1}")
robot.bounce(1) if result1 else robot.shake()

result2 = a % 3 == 0
print(f"{a}은 3의 배수:", result2)
robot.say(f"3의 배수? {result2}")
robot.bounce(1) if result2 else robot.shake()

result3 = a % 4 == 0
print(f"{a}은 4의 배수:", result3)
robot.say(f"4의 배수? {result3}")

both = result1 and result2
print("2의배수 and 3의배수:", both)
robot.say(f"둘 다? {both}")

if both:
    robot.emotion("happy")
    robot.say(f"{a}은 6의 배수!")
    robot.spin()
    robot.dance()`,
    explanation: "and(그리고), or(또는), not(반전) 으로 여러 조건을 조합할 수 있습니다.",
    practiceCode: `# 문제: 놀이터 입장 조건을 판단하는 코드를 완성하세요.
# 조건:
#   - is_weekend = True (주말이면 True)
#   - is_raining = False (비가 오면 True)
#   - 주말이고(and) 비가 오지 않을(not) 때만 놀이터 입장 가능
#   - can_enter 변수에 입장 가능 여부를 저장하세요

import robot

is_weekend = True
is_raining = False

can_enter = is_weekend and not is_raining

print("주말:", is_weekend)
print("비 여부:", is_raining)
print("입장 가능?:", can_enter)

if can_enter:
    robot.say("야호! 놀이터 가자!")
    robot.dance()
else:
    robot.say("오늘은 집에 있자...")
    robot.emotion("sad")`,
  },
  7: {
    nameKo: "숫자형",
    nameEn: "number_type",
    exampleCode: `import robot
import math
import random

rand_val = random.randint(1, 5)
print("랜덤 정수:", rand_val)
robot.say(f"랜덤: {rand_val}!")
robot.move(rand_val)

result = abs(-12.34)
print("절대값:", result)
robot.say(f"|-12.34|={result}")
robot.bounce(1)

ceil_val = math.ceil(3.14)
print("올림:", ceil_val)
robot.say(f"올림 3.14→{ceil_val}")

floor_val = math.floor(3.99)
print("내림:", floor_val)
robot.say(f"내림 3.99→{floor_val}")

rand_emotion = random.choice(["happy", "surprised", "sad"])
robot.emotion(rand_emotion)
robot.say(f"감정: {rand_emotion}!")
robot.spin()`,
    explanation: "abs(), round(), int()는 내장 함수, math.ceil()/floor()은 math 모듈, random.randint()는 random 모듈을 사용합니다.",
    practiceCode: `# 문제: 원의 넓이와 둘레를 계산하세요.
# 조건:
#   - math.pi (파이 값 3.14159...)를 사용하세요
#   - radius = 5 로 설정하세요
#   - 넓이 = math.pi * radius ** 2
#   - 둘레 = 2 * math.pi * radius
#   - round()로 소수점 2자리까지 반올림해서 출력하세요

import robot
import math

radius = 5

area = math.pi * radius ** 2
perimeter = 2 * math.pi * radius

print("원의 넓이:", round(area, 2))
print("원의 둘레:", round(perimeter, 2))
print("파이 값:", math.pi)

robot.move(radius)
robot.say(f"반지름 {radius}인 원!")`,
  },
  8: {
    nameKo: "문자형",
    nameEn: "string_type",
    exampleCode: `import robot

text = "파이썬 코딩"
robot.say(f"원본: {text}")
print("전체:", text)

first = text[0]
print("첫 글자:", first)
robot.say(f"첫 글자: {first}!")
robot.bounce(1)

sliced = text[0:3]
print("앞 3글자:", sliced)
robot.say(f"슬라이싱: {sliced}!")
robot.move(3)

last = text[-2:]
print("뒤 2글자:", last)
robot.say(f"뒤 2글자: {last}!")
robot.jump()

name = "앨리스"
age = 30
msg = f"{name}는 {age}살"
print(msg)
robot.say(msg)
robot.emotion("happy")
robot.spin()`,
    explanation: "문자열은 인덱스([0], [-1])로 글자를 꺼내거나, 슬라이싱([2:4])으로 일부를 잘라낼 수 있습니다.",
    practiceCode: `# 문제: 문자열 슬라이싱과 포매팅을 사용해보세요.
# 조건:
#   - sentence = "파이썬은 재미있다" 로 설정하세요
#   - 첫 3글자만 출력하세요 (슬라이싱 [0:3])
#   - 마지막 3글자만 출력하세요 (슬라이싱 [-3:])
#   - f-string으로 "첫 글자: _" 형태로 출력하세요

import robot

sentence = "파이썬은 재미있다"

first3 = sentence[0:3]
last3 = sentence[-3:]

print("첫 3글자:", first3)
print("마지막 3글자:", last3)
print(f"첫 글자: {sentence[0]}")
print(f"글자 수: {len(sentence)}")

robot.say(last3)
robot.emotion("happy")`,
  },
  9: {
    nameKo: "리스트",
    nameEn: "list",
    exampleCode: `import robot

subjects = ["국어", "영어", "수학", "정보"]
scores = [85, 92, 78, 100]

robot.say("과목별 점수 발표!")
robot.clear()

for i in range(len(subjects)):
    print(f"{subjects[i]}: {scores[i]}점")
    robot.say(f"{subjects[i]}: {scores[i]}점!")
    if scores[i] >= 90:
        robot.emotion("happy")
        robot.bounce(1)
        robot.draw("star")
    elif scores[i] >= 80:
        robot.move(1)
        robot.draw("circle")
    else:
        robot.emotion("sad")
        robot.shake()

best = max(scores)
print("최고점:", best)
robot.say(f"최고점 {best}점!")
robot.emotion("happy")
robot.dance()`,
    explanation: "리스트는 여러 값을 순서대로 저장합니다. 인덱스로 값을 꺼내고, for문으로 모든 요소를 순회할 수 있어요.",
    practiceCode: `# 문제: 친구들의 점수 리스트를 만들어 최고점을 찾으세요.
# 조건:
#   - names = ["민준", "서연", "지호", "하은"]
#   - scores = [88, 95, 72, 91]
#   - for문으로 순회하며 로봇이 매번 이름과 점수를 말하게 하세요
#   - 90점 이상이면 로봇이 bounce, 아니면 move(1)

import robot

names = ["민준", "서연", "지호", "하은"]
scores = [88, 95, 72, 91]

for i in range(len(names)):
    print(f"{names[i]}: {scores[i]}점")
    robot.say(f"{names[i]}: {scores[i]}!")
    if scores[i] >= 90:
        robot.emotion("happy")
        robot.bounce(1)
    else:
        robot.move(1)

best = max(scores)
print("최고 점수:", best)
robot.say(f"최고점 {best}점!")
robot.dance()`,
  },
  10: {
    nameKo: "불리언",
    nameEn: "boolean",
    exampleCode: `import robot

print("bool(1):", bool(1))
robot.say(f"1은 참? {bool(1)}")
robot.bounce(1)

print("bool(0):", bool(0))
robot.say(f"0은 참? {bool(0)}")
robot.shake()

print("bool(''):", bool(""))
robot.say(f"빈 문자열은 참? {bool('')}")

isDoorOpen = False
isUserHasKey = True
robot.say("문이 잠겼어...")
robot.emotion("sad")
robot.shake()

can_enter = not isDoorOpen and isUserHasKey
print("입장 가능:", can_enter)
robot.say(f"입장 가능? {can_enter}")

if can_enter:
    robot.emotion("happy")
    robot.say("열쇠로 입장!")
    robot.spin()
    robot.dance()
    robot.draw("star")`,
    explanation: "불리언은 True(참) 또는 False(거짓)만 가집니다. bool()로 다른 자료형을 불리언으로 변환할 수 있어요.",
    practiceCode: `# 문제: 게임 캐릭터 상태를 불리언으로 관리하세요.
# 조건:
#   - is_alive = True (생존), has_weapon = False (무기 소지)
#   - can_attack = is_alive and has_weapon
#   - 각 변수의 자료형을 type()으로 출력하세요
#   - can_attack 결과에 따라 로봇이 다르게 반응하게 하세요

import robot

is_alive = True
has_weapon = False

can_attack = is_alive and has_weapon

print("is_alive 자료형:", type(is_alive))
print("생존:", is_alive)
print("무기 소지:", has_weapon)
print("공격 가능?:", can_attack)

if can_attack:
    robot.say("공격!")
    robot.emotion("happy")
else:
    robot.say("무기가 없어!")
    robot.emotion("sad")`,
  },
  11: {
    nameKo: "조건문",
    nameEn: "conditional",
    exampleCode: `import robot

score = 85
robot.say(f"점수: {score}점!")
print("점수:", score)

if score >= 90:
    print("A등급")
    robot.say("A등급! 완벽!")
    robot.emotion("happy")
    robot.spin()
    robot.dance()
    robot.draw("star")
    robot.draw("star")
elif score >= 80:
    print("B등급")
    robot.say("B등급! 잘했어!")
    robot.emotion("happy")
    robot.jump()
    robot.bounce(2)
    robot.draw("circle")
elif score >= 70:
    print("C등급")
    robot.say("C등급! 조금만!")
    robot.emotion("surprised")
    robot.bounce(1)
else:
    print("D등급")
    robot.say("더 노력하자!")
    robot.emotion("sad")
    robot.shake()

print("합격 여부:", "합격" if score >= 60 else "불합격")
robot.say("채점 완료!")`,
    explanation: "if/elif/else로 조건에 따라 다른 코드를 실행합니다. 조건이 True인 블록만 실행돼요.",
    practiceCode: `# 문제: 신호등 색상에 따라 로봇이 다르게 행동하도록 하세요.
# 조건:
#   - "red": 멈추고 "정지!" 출력
#   - "yellow": 준비 감정 표현 후 "준비!" 출력
#   - "green": 앞으로 2칸 이동 후 "출발!" 출력
#   - 다른 색: "모르는 색이야!" 출력
# color 값을 바꿔가며 테스트해보세요!

import robot

color = "green"   # "red", "yellow", "green" 으로 바꿔보세요

print("현재 신호:", color)

if color == "red":
    robot.emotion("sad")
    robot.shake()
    robot.say("정지!")
elif color == "yellow":
    robot.emotion("surprised")
    robot.bounce(2)
    robot.say("준비!")
elif color == "green":
    robot.emotion("happy")
    robot.move(2)
    robot.draw("circle")
    robot.say("출발!")
else:
    robot.shake()
    robot.say("모르는 색이야!")`,
  },
  12: {
    nameKo: "for 반복문",
    nameEn: "for_loop",
    exampleCode: `import robot

robot.say("for문 시작!")
robot.clear()

for i in range(1, 6):
    label = "짝수" if i % 2 == 0 else "홀수"
    print(f"{i}번째: {label}")
    robot.say(f"{i}: {label}")
    robot.move(1)
    if i % 2 == 0:
        robot.draw("circle")
    else:
        robot.draw("star")
        robot.bounce(1)

robot.say("카운트다운!")
for i in range(3, 0, -1):
    print(f"{i}...")
    robot.say(str(i))

robot.spin()
robot.say("완료!")
robot.dance()`,
    explanation: "for문은 반복 횟수가 정해진 반복에 씁니다. range(시작, 끝, 간격)으로 반복 범위를 설정해요.",
    practiceCode: `# 문제: for문으로 구구단 한 단을 출력하세요.
# 조건:
#   - dan = 3 으로 설정 (원하는 단으로 바꿔도 됩니다)
#   - range(1, 10)으로 1~9까지 반복
#   - "3 x 1 = 3" 형태로 출력 + 로봇이 매번 결과를 말하게 하세요

import robot

dan = 3

for i in range(1, 10):
    print(f"{dan} x {i} = {dan * i}")
    robot.say(f"{dan}x{i}={dan*i}")

robot.say(f"{dan}단 완성!")
robot.dance()`,
  },
  13: {
    nameKo: "while 반복문",
    nameEn: "while_loop",
    exampleCode: `import robot

num = 1
robot.say("2의 거듭제곱!")
robot.clear()

count = 0
while num <= 64:
    print(num)
    robot.say(str(num))
    robot.move(1)
    if count % 2 == 0:
        robot.draw("diamond")
    else:
        robot.draw("circle")
    num *= 2
    count += 1

print("최종:", num)
robot.say(f"64 초과! {num}!")
robot.emotion("surprised")
robot.spin()
robot.dance()`,
    explanation: "while문은 조건이 참인 동안 계속 반복합니다. break로 즉시 탈출할 수 있어요.",
    practiceCode: `# 문제: while문으로 1부터 시작해 누적 합이 50을 넘을 때까지 더하세요.
# 조건:
#   - total = 0, num = 1 로 시작
#   - total <= 50 인 동안 num을 더하고, num은 1씩 증가
#   - 매 반복마다 로봇이 현재 합계를 말하게 하세요

import robot

total = 0
num = 1

while total <= 50:
    total += num
    robot.say(f"+{num}={total}")
    num += 1

print("누적 합:", total)
print("마지막 숫자:", num - 1)

robot.say(f"합계 {total}!")
robot.dance()`,
  },
  14: {
    nameKo: "함수",
    nameEn: "function",
    exampleCode: `import robot

def greet(name):
    msg = f"안녕, {name}님!"
    robot.say(msg)
    robot.emotion("happy")
    robot.bounce(1)
    return msg

def score_grade(score):
    if score >= 90:
        grade = "A"
    elif score >= 80:
        grade = "B"
    else:
        grade = "C"
    robot.say(f"{score}점→{grade}등급!")
    return grade

def celebrate():
    robot.spin()
    robot.dance()
    robot.draw("star")

print(greet("홍길동"))
print(greet("이순신"))

print("85점→", score_grade(85))
print("92점→", score_grade(92))

robot.say("함수 완성!")
celebrate()`,
    explanation: "함수는 반복되는 코드를 묶어 이름을 붙인 것입니다. def로 정의하고, return으로 값을 돌려줘요.",
    practiceCode: `# 문제: 두 숫자를 받아 합과 평균을 반환하는 함수를 완성하세요.
# 조건:
#   - add(a, b): a + b를 반환
#   - average(a, b): (a + b) / 2를 반환
#   - add(7, 3)과 average(7, 3)을 호출해 결과를 출력하세요

import robot

def add(a, b):
    return a + b

def average(a, b):
    return (a + b) / 2

result_add = add(7, 3)
result_avg = average(7, 3)

print("7 + 3 =", result_add)
print("(7 + 3) / 2 =", result_avg)

robot.say(f"평균은 {result_avg}!")`,
  },
  15: {
    nameKo: "클래스",
    nameEn: "class",
    exampleCode: `import robot

class Pet:
    def __init__(self, name, mood):
        self.name = name
        self.mood = mood
        robot.say(f"{name} 생성!")
        robot.emotion(mood)

    def introduce(self):
        msg = f"나는 {self.name}!"
        print(msg)
        robot.say(msg)

    def play(self):
        robot.bounce(2)
        robot.draw("heart")
        robot.say(f"{self.name} 놀자!")

p1 = Pet("바둑이", "happy")
p1.introduce()
p1.play()

robot.clone()

p2 = Pet("나비", "surprised")
p2.introduce()
p2.play()

print(f"{p1.name}과 {p2.name}!")
robot.say("둘이 사이좋게!")
robot.dance()`,
    explanation: "클래스는 속성(변수)과 행동(메서드)을 묶은 설계도입니다. __init__은 객체 생성 시 자동 호출돼요.",
    practiceCode: `# 문제: 학생(Student) 클래스를 완성하세요.
# 조건:
#   - __init__(self, name, grade, score): 이름, 학년, 점수를 속성으로 저장
#   - introduce(self): "이름: _, 학년: _, 점수: _" 형태로 출력
#   - is_pass(self): score >= 60이면 True 반환
#   - Student("홍길동", 1, 85)로 인스턴스 생성 후 테스트하세요

import robot

class Student:
    def __init__(self, name, grade, score):
        self.name = name
        self.grade = grade
        self.score = score

    def introduce(self):
        print(f"이름: {self.name}, 학년: {self.grade}, 점수: {self.score}")

    def is_pass(self):
        return self.score >= 60

student1 = Student("홍길동", 1, 85)
student1.introduce()

if student1.is_pass():
    robot.say(f"{student1.name} 합격!")
    robot.emotion("happy")
else:
    robot.say(f"{student1.name} 불합격...")
    robot.emotion("sad")`,
  },
  16: {
    nameKo: "모듈",
    nameEn: "module",
    exampleCode: `import robot
import random
import math

lotto = sorted(random.sample(range(1, 46), 6))
print("로또:", lotto)
robot.say(f"로또: {lotto[0]}, {lotto[1]}, {lotto[2]}...")
robot.emotion("happy")

rand_steps = random.randint(1, 4)
robot.say(f"랜덤 이동: {rand_steps}칸!")
robot.move(rand_steps)

pi_val = round(math.pi, 3)
print("파이:", pi_val)
robot.say(f"π = {pi_val}")
robot.bounce(1)

sqrt_val = math.sqrt(16)
print("√16 =", sqrt_val)
robot.say(f"√16 = {sqrt_val}")

rand_size = round(random.uniform(0.8, 2.0), 1)
robot.size(rand_size)
robot.say(f"크기 {rand_size}배!")
robot.spin()
robot.dance()`,
    explanation: "모듈은 기능이 담긴 파일입니다. import로 불러오고, as로 별칭을 붙일 수 있어요.",
    practiceCode: `# 문제: random 모듈로 로또 번호를 생성하는 코드를 완성하세요.
# 조건:
#   - random.sample(range(1,46), 6)으로 1~45 사이 6개를 뽑으세요
#   - sorted()로 오름차순 정렬하세요
#   - math.factorial(6)도 출력해보세요 (6! = 720)
#   - 로봇이 결과를 말하게 하세요

import robot
import random
import math

lotto = random.sample(range(1, 46), 6)
lotto_sorted = sorted(lotto)

print("로또 번호:", lotto_sorted)
print("6! =", math.factorial(6))

robot.say("로또 당첨 기원!")
robot.dance()`,
  },
};

export const BADGE_METADATA = [
  { conceptId: 0, nameKo: "Robot API", iconName: "Bot", colorClass: "text-purple-500" },
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

export const TOTAL_CONCEPTS = BADGE_METADATA.length;

export const CONCEPT_EXAMPLES_LV2: Record<number, { nameKo: string; nameEn: string; explanation: string; exampleCode: string; practiceCode: string }> = {
  17: {
    nameKo: "숫자형 심화",
    nameEn: "number_advanced",
    explanation: "int(정수), float(실수), complex(복소수) 타입과 type()으로 자료형을 확인합니다. 산술 연산자로 다양한 계산을 할 수 있어요.",
    exampleCode: `import robot

a = 5
b = 3.14
c = 2 + 3j

robot.say(f"int: {a}")
print("type(a):", type(a).__name__)
robot.bounce(1)

robot.say(f"float: {b}")
print("type(b):", type(b).__name__)
robot.move(1)

robot.say(f"complex: {c}")
print("type(c):", type(c).__name__)

ops = [("+", a+3), ("**2", a**2), ("//3", a//3), ("%3", a%3)]
for label, result in ops:
    print(f"{a}{label} = {result}")
    robot.say(f"{a}{label}={result}")

robot.spin()
robot.say("숫자형 완성!")`,
    practiceCode: `# 문제: 세 수 a=10, b=3, c=2.5를 이용한 계산
# 조건:
#   - 각 변수의 자료형을 type()으로 출력하세요
#   - a를 b로 나눈 몫(//), 나머지(%)를 출력하세요
#   - a ** c (10의 2.5승)를 계산하고 출력하세요
#   - 로봇이 a % b 값만큼 이동하게 하세요

import robot

a = 10
b = 3
c = 2.5

print("a 자료형:", type(a))
print("b 자료형:", type(b))
print("c 자료형:", type(c))

print("10 // 3 =", a // b)
print("10 % 3 =", a % b)
print("10 ** 2.5 =", a ** c)

robot.move(a % b)
robot.say(f"10 % 3 = {a % b}")`,
  },
  18: {
    nameKo: "문자형 심화",
    nameEn: "string_advanced",
    explanation: "이스케이프 코드(\\n, \\t), 문자열 메서드(count, find, strip, replace, split, upper, lower)로 문자열을 자유롭게 다룹니다.",
    exampleCode: `import robot

a = "Python is the best choice"
robot.say("문자열 메서드 시작!")

result = a.find('b')
print("find('b'):", result)
robot.say(f"'b' 위치: {result}")
robot.move(1)

upper = a.upper()
print("upper:", upper[:10] + "...")
robot.say("대문자로!")
robot.bounce(1)

replaced = a.replace("Python", "파이썬")
print("replace:", replaced[:12])
robot.say(replaced[:12])

words = a.split()
print("단어 수:", len(words))
robot.say(f"단어 {len(words)}개!")

b = "   hello   "
stripped = b.strip()
print("strip:", f"'{stripped}'")
robot.say(f"공백 제거: '{stripped}'")
robot.spin()`,
    practiceCode: `# 문제: 문자열 메서드를 활용해보세요.
# 조건:
#   - sentence = "life is too short, you need python"
#   - 대문자로 변환해서 출력하세요
#   - "python"을 "파이썬"으로 바꿔서 출력하세요
#   - 공백으로 나눈 단어 수를 출력하세요 (hint: len(sentence.split()))
#   - 로봇이 단어 수를 말하게 하세요

import robot

sentence = "life is too short, you need python"

print("대문자:", sentence.upper())
print("치환:", sentence.replace("python", "파이썬"))

words = sentence.split()
print("단어 수:", len(words))

robot.say(f"단어가 {len(words)}개!")
robot.emotion("happy")`,
  },
  19: {
    nameKo: "리스트 심화",
    nameEn: "list_advanced",
    explanation: "append(추가), extend(연결), sort(정렬), reverse(뒤집기), insert(삽입), remove(삭제), pop(꺼내기) 메서드로 리스트를 자유롭게 조작합니다.",
    exampleCode: `import robot

a = [3, 1, 4, 1, 5, 9, 2, 6]
robot.say(f"리스트: {a}")
print("원본:", a)

a.append(7)
robot.say(f"append(7) → {a[-3:]}..")
print("append:", a)

a.sort()
robot.say("정렬 완료!")
print("sort:", a)
robot.bounce(2)

a.reverse()
robot.say("뒤집기!")
print("reverse:", a)

popped = a.pop()
robot.say(f"pop → {popped}")
print("pop:", popped, "남은:", a)

robot.say(f"최솟값: {min(a)}, 최댓값: {max(a)}")
robot.spin()
robot.dance()`,
    practiceCode: `# 문제: 리스트 메서드를 사용해서 점수를 관리하세요.
# 조건:
#   - scores = [85, 92, 78, 95, 88] 로 시작하세요
#   - 점수 70을 추가(append)하세요
#   - 오름차순 정렬(sort)하세요
#   - 첫 번째 요소를 꺼내고(pop(0)) 출력하세요
#   - 최종 리스트와 최고점(max)을 출력하세요

import robot

scores = [85, 92, 78, 95, 88]

scores.append(70)
scores.sort()

lowest = scores.pop(0)
print("제거된 점수:", lowest)
print("최종 점수:", scores)
print("최고점:", max(scores))

robot.say(f"최고점 {max(scores)}점!")
robot.dance()`,
  },
  20: {
    nameKo: "튜플",
    nameEn: "tuple",
    explanation: "튜플은 한 번 만들면 변경할 수 없는(불변) 리스트입니다. 괄호()로 만들고, 값을 바꾸려 하면 오류가 납니다.",
    exampleCode: `import robot

t1 = (1, 2, 3)
t2 = ('a', 'b', 'c')

robot.say(f"튜플 t1: {t1}")
print("t1:", t1)
robot.bounce(1)

robot.say(f"t1[0]={t1[0]}")
print("t1[0]:", t1[0])
robot.move(1)

a, b, c = t1
robot.say(f"언패킹! a={a}, b={b}, c={c}")
print("언패킹:", a, b, c)
robot.bounce(2)

combined = t1 + (4, 5)
print("t1+(4,5):", combined)
robot.say(f"연결: {combined}")

def min_max(lst):
    return min(lst), max(lst)

result = min_max([3, 1, 4, 1, 5, 9])
print("최솟값, 최댓값:", result)
robot.say(f"min={result[0]}, max={result[1]}")
robot.spin()`,
    practiceCode: `# 문제: 튜플을 활용하세요.
# 조건:
#   - coords = (3, 5) 로 x, y 좌표를 튜플로 저장하세요
#   - 언패킹으로 x, y에 각각 저장하세요
#   - x + y 값을 출력하세요
#   - 두 수의 합과 곱을 동시에 반환하는 함수 calc(a, b)를 만드세요
#   - calc(x, y) 결과를 출력하고 로봇이 합을 말하게 하세요

import robot

coords = (3, 5)
x, y = coords

print("x:", x, "y:", y)
print("x + y:", x + y)

def calc(a, b):
    return a + b, a * b

result = calc(x, y)
print("합:", result[0], "곱:", result[1])

robot.say(f"합은 {result[0]}!")
robot.move(result[0] % 4 + 1)`,
  },
  21: {
    nameKo: "딕셔너리",
    nameEn: "dictionary",
    explanation: "딕셔너리는 key:value 쌍으로 데이터를 저장합니다. 순서 없이 key로 빠르게 검색할 수 있어 API 데이터에 자주 사용됩니다.",
    exampleCode: `import robot

person = {'name': '홍길동', 'age': 17, 'score': 95}
robot.say("딕셔너리 순회!")

for key, value in person.items():
    print(f"{key}: {value}")
    robot.say(f"{key}: {value}")
    robot.bounce(1)

person['grade'] = 1
robot.say(f"grade 추가: {person['grade']}")
print("추가 후:", person)

missing = person.get('email', '없음')
print("email:", missing)
robot.say(f"email? {missing}")
robot.shake()

print("'name' in person:", 'name' in person)
robot.say(f"name 있어? {('name' in person)}")
robot.spin()`,
    practiceCode: `# 문제: 딕셔너리로 학생 성적표를 만드세요.
# 조건:
#   - 딕셔너리 student에 name, korean, math, english 키를 추가하세요
#   - 세 과목의 평균을 계산해서 'avg' 키에 저장하세요
#   - 모든 항목을 출력하세요
#   - 로봇이 평균 점수를 말하게 하세요

import robot

student = {
    'name': '김철수',
    'korean': 88,
    'math': 92,
    'english': 85,
}

student['avg'] = (student['korean'] + student['math'] + student['english']) / 3

for key, value in student.items():
    print(f"{key}: {value}")

robot.say(f"평균 {student['avg']:.1f}점!")
robot.emotion("happy")`,
  },
  22: {
    nameKo: "세트",
    nameEn: "set",
    explanation: "세트(집합)는 중복 없는 값들의 모음입니다. 교집합(&), 합집합(|), 차집합(-)으로 집합 연산을 할 수 있습니다.",
    exampleCode: `import robot

s1 = {1, 2, 3, 4, 5, 6}
s2 = {4, 5, 6, 7, 8, 9}
robot.say(f"s1={s1}, s2={s2}")

inter = s1 & s2
print("교집합:", inter)
robot.say(f"교집합: {inter}")
robot.bounce(1)

union = s1 | s2
print("합집합:", union)
robot.say(f"합집합 {len(union)}개!")
robot.move(1)

diff = s1 - s2
print("차집합:", diff)
robot.say(f"s1만: {diff}")

nums = [1, 2, 2, 3, 3, 3, 4]
unique = set(nums)
print("중복 제거:", unique)
robot.say(f"중복 제거! {len(nums)}→{len(unique)}개")
robot.spin()
robot.dance()`,
    practiceCode: `# 문제: 세트로 반 학생 취미를 분석하세요.
# 조건:
#   - class_a = {"독서", "게임", "축구", "요리"}
#   - class_b = {"게임", "음악", "축구", "그림"}
#   - 두 반 공통 취미(교집합)를 출력하세요
#   - 전체 취미 종류(합집합)를 출력하세요
#   - A반에만 있는 취미(차집합)를 출력하세요
#   - 로봇이 공통 취미 개수를 말하게 하세요

import robot

class_a = {"독서", "게임", "축구", "요리"}
class_b = {"게임", "음악", "축구", "그림"}

common = class_a & class_b
total = class_a | class_b
only_a = class_a - class_b

print("공통 취미:", common)
print("전체 취미:", total)
print("A반만:", only_a)

robot.say(f"공통 취미 {len(common)}개!")
robot.dance()`,
  },
  23: {
    nameKo: "변수와 복사",
    nameEn: "variable_copy",
    explanation: "변수는 객체의 주소를 가리킵니다. 리스트를 그냥 대입하면 주소를 공유해서 같이 변합니다. 독립적인 복사본을 만들려면 슬라이싱이나 copy()를 사용하세요.",
    exampleCode: `import robot

a = [1, 2, 3]
b = a
b.append(4)

print("대입 후 a:", a)
print("대입 후 b:", b)
robot.say(f"같은 객체! a={a}")
robot.emotion("surprised")
robot.shake()

a = [1, 2, 3]
c = a[:]
c.append(5)

print("복사 후 a:", a)
print("복사 후 c:", c)
robot.say(f"독립 복사본!")
robot.emotion("happy")
robot.bounce(2)

print("a is b:", a is b)
print("a is c:", a is c)
robot.say(f"a is c? {a is c}")
robot.spin()`,
    practiceCode: `# 문제: 대입과 복사의 차이를 확인하세요.
# 조건:
#   - original = [10, 20, 30] 을 만드세요
#   - shared = original 로 대입하고, shared에 40을 추가한 뒤 original도 출력하세요
#   - copied = original[:] 로 복사하고, copied에 50을 추가한 뒤 original도 출력하세요
#   - 두 경우가 어떻게 다른지 확인하세요

import robot

original = [10, 20, 30]

# 대입
shared = original
shared.append(40)
print("대입 후 original:", original)  # 같이 변함

# 복사
original = [10, 20, 30]  # 초기화
copied = original[:]
copied.append(50)
print("복사 후 original:", original)  # 변하지 않음
print("복사본:", copied)

robot.say("대입 vs 복사 차이 확인!")`,
  },
  24: {
    nameKo: "조건문 심화",
    nameEn: "conditional_advanced",
    explanation: "in/not in으로 포함 여부를 확인하고, pass로 빈 블록을 만들고, 조건부 표현식(삼항 연산)으로 한 줄로 조건을 처리합니다.",
    exampleCode: `import robot

pocket = ['paper', 'handphone', 'money']
card = True

robot.say("주머니 확인!")
if 'money' in pocket:
    robot.emotion("happy")
    robot.say("돈이 있어!")
    robot.bounce(2)
else:
    robot.emotion("sad")
    robot.say("돈이 없어!")
    robot.shake()

if 'money' in pocket or card:
    robot.say("이동 수단 OK!")
    robot.move(2)
    robot.draw("circle")

score = 85
grade = "합격" if score >= 60 else "불합격"
print(f"점수 {score}: {grade}")
robot.say(f"{score}점→{grade}!")
if grade == "합격":
    robot.spin()
    robot.dance()`,
    practiceCode: `# 문제: in/not in과 조건부 표현식을 활용하세요.
# 조건:
#   - fruits = ["사과", "바나나", "포도", "딸기"]
#   - "망고"가 fruits에 있는지 확인하고 결과를 출력하세요
#   - "바나나"가 있으면 "있어요!", 없으면 "없어요!"를 조건부 표현식으로 출력하세요
#   - temperature = 25 가 15 이상 30 미만이면 "쾌적", 아니면 "불쾌"를 출력하세요
#   - 로봇이 쾌적 여부를 말하게 하세요

import robot

fruits = ["사과", "바나나", "포도", "딸기"]

print("망고 있나?", "망고" in fruits)
result = "있어요!" if "바나나" in fruits else "없어요!"
print("바나나:", result)

temperature = 25
comfort = "쾌적" if 15 <= temperature < 30 else "불쾌"
print(f"{temperature}도: {comfort}")

robot.say(comfort)
if comfort == "쾌적":
    robot.emotion("happy")
else:
    robot.emotion("sad")`,
  },
  25: {
    nameKo: "for 반복문 심화",
    nameEn: "for_advanced",
    explanation: "중첩 for문으로 2차원 반복을, continue로 특정 값을 건너뛰고, 리스트 내포(list comprehension)로 반복을 한 줄로 표현합니다.",
    exampleCode: `import robot

robot.say("홀수 출력!")
for i in range(1, 11):
    if i % 2 == 0:
        continue
    print(i, end=" ")
    robot.say(str(i))
    robot.bounce(1)
print()

robot.say("구구단 2단~3단!")
for i in range(2, 4):
    for j in range(1, 6):
        result = i * j
        print(f"{i}×{j}={result}", end="  ")
        robot.say(f"{i}×{j}={result}")
    print()

squares = [n**2 for n in range(1, 6)]
print("제곱:", squares)
robot.say(f"제곱: {squares}")
robot.dance()`,
    practiceCode: `# 문제: 리스트 내포와 for문을 사용하세요.
# 조건:
#   - 1~20 중 3의 배수를 리스트 내포로 만드세요
#   - for문으로 순회하며 로봇이 매번 값을 말하고 bounce 하게 하세요
#   - 마지막에 2배 리스트를 만들고 로봇이 댄스하게 하세요

import robot

multiples_of_3 = [n for n in range(1, 21) if n % 3 == 0]
print("3의 배수:", multiples_of_3)

robot.clear()
for n in multiples_of_3:
    robot.say(str(n))
    robot.bounce(1)

doubled = [n * 2 for n in multiples_of_3]
print("2배:", doubled)

robot.say(f"총 {len(multiples_of_3)}개!")
robot.dance()`,
  },
  26: {
    nameKo: "while 반복문 심화",
    nameEn: "while_advanced",
    explanation: "break로 반복문을 즉시 탈출하고, continue로 현재 회차를 건너뜁니다. while True 패턴으로 조건 기반 반복을 제어합니다.",
    exampleCode: `import robot

coffee = 5
count = 0
robot.say("커피 자판기!")

while True:
    count += 1
    coffee -= 1
    print(f"{count}번째. 남은 커피: {coffee}개")
    robot.say(f"커피 {coffee}개 남음")
    robot.move(1)
    if coffee == 0:
        robot.emotion("sad")
        robot.say("커피 소진!")
        robot.shake()
        break

a = 0
robot.say("홀수만 출력!")
while a < 10:
    a += 1
    if a % 2 == 0:
        continue
    print(a, end=" ")
    robot.say(str(a))
    robot.bounce(1)
print()

robot.spin()
robot.dance()`,
    practiceCode: `# 문제: break와 continue를 활용하세요.
# 조건:
#   - 1부터 시작해서 5의 배수가 나오면 break
#   - 매 숫자마다 로봇이 값을 말하고, 5의 배수 발견 시 shake + 중단
#   - 마지막에 합계를 출력하고 dance

import robot

i = 0
total = 0
while True:
    i += 1
    if i % 5 == 0:
        print(f"5의 배수 {i} 발견! 중단")
        robot.say(f"{i}! 멈춰!")
        robot.shake()
        break
    total += i
    print(f"+{i} (합계:{total})")
    robot.say(str(i))
    robot.bounce(1)

print(f"합계: {total}")
robot.say(f"합계 {total}!")
robot.dance()`,
  },
  27: {
    nameKo: "함수 심화",
    nameEn: "function_advanced",
    explanation: "*args로 개수가 변하는 인수를, **kwargs로 키워드 인수를 받습니다. lambda는 간단한 함수를 한 줄로 쓰는 방법이고, global로 함수 안에서 전역 변수를 수정합니다.",
    exampleCode: `import robot

def add_many(*args):
    result = sum(args)
    robot.say(f"합계: {result}!")
    return result

print("합:", add_many(1, 2, 3, 4, 5))
robot.bounce(1)

def print_info(**kwargs):
    for k, v in kwargs.items():
        print(f"  {k}: {v}")
        robot.say(f"{k}={v}")
        robot.move(1)

print_info(name="홍길동", age=17, score=95)

square = lambda x: x ** 2
nums = [1, 2, 3, 4, 5]
squares = list(map(square, nums))
print("제곱:", squares)
robot.say(f"제곱: {squares}")
robot.bounce(2)

score = 0
def score_up():
    global score
    score += 10
    robot.say(f"점수+10={score}!")
    robot.bounce(1)

score_up()
score_up()
score_up()
print("점수:", score)
robot.dance()`,
    practiceCode: `# 문제: *args, lambda, global을 활용하세요.
# 조건:
#   - average(*args): 인수들의 평균을 반환하는 함수를 만드세요
#   - average(80, 90, 85, 95)를 호출하고 출력하세요
#   - lambda로 두 수 중 큰 값을 반환하는 함수 bigger를 만드세요
#   - bigger(7, 3)을 호출하고 출력하세요
#   - 전역 변수 level = 1을 만들고 level_up() 함수로 1씩 증가시키세요

import robot

def average(*args):
    return sum(args) / len(args)

print("평균:", average(80, 90, 85, 95))

bigger = lambda a, b: a if a > b else b
print("큰 수:", bigger(7, 3))

level = 1
def level_up():
    global level
    level += 1

level_up()
level_up()
level_up()
print("레벨:", level)

robot.say(f"레벨 {level}!")
robot.size(level * 0.3)`,
  },
  28: {
    nameKo: "클래스 심화",
    nameEn: "class_advanced",
    explanation: "상속으로 기존 클래스를 확장하고, 메서드 오버라이딩으로 부모 기능을 재정의합니다. 클래스 변수는 모든 인스턴스가 공유합니다.",
    exampleCode: `import robot

class Character:
    species = "인간"

    def __init__(self, name, hp):
        self.name = name
        self.hp = hp
        robot.say(f"{name} 생성! HP:{hp}")
        robot.emotion("happy")

    def attack(self):
        robot.say(f"{self.name}: 공격!")
        robot.bounce(1)

class Warrior(Character):
    def __init__(self, name):
        super().__init__(name, hp=200)

    def attack(self):
        robot.say(f"{self.name}: 강타!")
        robot.spin()

class Archer(Character):
    def __init__(self, name):
        super().__init__(name, hp=120)

    def attack(self):
        robot.say(f"{self.name}: 발사!")
        robot.jump()

w = Warrior("전사")
a = Archer("궁수")

w.attack()
robot.clone()
a.attack()

Character.species = "영웅"
print("전사 species:", w.species)
robot.say(f"모두 {w.species}!")
robot.dance()`,
    practiceCode: `# 문제: Animal 클래스를 상속해서 Dog, Cat을 만드세요.
# 조건:
#   - Animal(name, sound): name, sound 속성 + speak() 메서드
#   - speak()는 "이름: 소리~" 형태로 출력
#   - Dog는 Animal 상속, speak()를 오버라이딩해서 "멍멍!"으로 끝나게
#   - Cat은 Animal 상속, speak()를 오버라이딩해서 "야옹!"으로 끝나게
#   - Dog("바둑이"), Cat("나비") 인스턴스 생성 후 speak() 호출

import robot

class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def speak(self):
        print(f"{self.name}: {self.sound}~")

class Dog(Animal):
    def __init__(self, name):
        super().__init__(name, "멍")

    def speak(self):
        print(f"{self.name}: 멍멍!")

class Cat(Animal):
    def __init__(self, name):
        super().__init__(name, "야옹")

    def speak(self):
        print(f"{self.name}: 야옹!")

dog = Dog("바둑이")
cat = Cat("나비")

dog.speak()
cat.speak()

robot.say(f"{dog.name}와 {cat.name}!")
robot.clone()`,
  },
  29: {
    nameKo: "예외 처리",
    nameEn: "exception_handling",
    explanation: "try/except로 오류를 잡아 프로그램이 멈추지 않게 합니다. else는 오류가 없을 때, finally는 항상 실행됩니다. raise로 직접 오류를 발생시킬 수도 있습니다.",
    exampleCode: `import robot

robot.say("예외 처리 시작!")

try:
    result = 4 / 0
except ZeroDivisionError as e:
    print("오류:", e)
    robot.emotion("sad")
    robot.say(f"오류 발생! {e}")
    robot.shake()

robot.emotion("happy")
robot.say("계속 실행됨!")
robot.bounce(1)

a = [1, 2, 3]
try:
    print(a[10])
except IndexError as e:
    print("인덱스 오류:", e)
    robot.emotion("surprised")
    robot.say("인덱스 오류!")
    robot.shake()

try:
    x = int("123")
    robot.say(f"변환 성공: {x}!")
    robot.bounce(2)
except ValueError:
    robot.say("변환 실패!")
finally:
    print("finally 실행!")
    robot.say("finally!")

robot.spin()
robot.dance()`,
    practiceCode: `# 문제: try/except를 활용해서 안전한 나눗셈 함수를 만드세요.
# 조건:
#   - safe_divide(a, b): b가 0이면 ZeroDivisionError를 처리하고 None 반환
#   - safe_divide(10, 2)와 safe_divide(10, 0) 각각 호출
#   - 리스트 items = [1, 2, 3]에서 items[5]를 IndexError로 처리
#   - try/else/finally 구조를 모두 사용하세요

import robot

def safe_divide(a, b):
    try:
        result = a / b
    except ZeroDivisionError:
        print(f"{a} / {b}: 0으로 나눌 수 없음")
        return None
    else:
        print(f"{a} / {b} = {result}")
        return result
    finally:
        print("safe_divide 실행 완료")

safe_divide(10, 2)
print()
safe_divide(10, 0)

print()
items = [1, 2, 3]
try:
    print(items[5])
except IndexError as e:
    print("인덱스 오류:", e)
    robot.emotion("sad")

robot.say("예외 처리 완료!")
robot.emotion("happy")`,
  },
  30: {
    nameKo: "내장 함수와 표준 라이브러리",
    nameEn: "builtin_library",
    explanation: "filter(), map(), zip() 같은 내장 함수와 lambda를 조합하면 강력한 데이터 처리가 가능합니다. datetime, math 등 표준 라이브러리도 활용해봐요.",
    exampleCode: `import robot
import math
import random

nums = [1, -3, 2, 0, -5, 6]
positives = list(filter(lambda x: x > 0, nums))
print("양수:", positives)
robot.say(f"양수 {len(positives)}개!")
robot.bounce(1)

doubled = list(map(lambda x: x*2, positives))
print("2배:", doubled)
robot.say(f"2배: {doubled}")
robot.move(1)

names = ["민준", "서연", "지호"]
scores = [88, 95, 72]
robot.say("점수 발표!")
for name, score in zip(names, scores):
    print(f"{name}: {score}")
    robot.say(f"{name}: {score}!")
    robot.bounce(1)

gcd = math.gcd(60, 100, 80)
print("최대공약수:", gcd)
robot.say(f"gcd={gcd}")

lotto = sorted(random.sample(range(1, 46), 6))
print("로또:", lotto)
robot.say(f"로또: {lotto[0]},{lotto[1]},{lotto[2]}...")
robot.spin()
robot.dance()`,
    practiceCode: `# 문제: filter, map, zip을 활용하세요.
# 조건:
#   - scores = [45, 82, 67, 91, 38, 76, 88]
#   - filter로 60점 이상만 추출하세요
#   - map으로 합격자 점수에 +3 보너스를 추가하세요
#   - names = ["가", "나", "다", "라", "마", "바", "사"]와 zip으로 묶어 출력하세요
#   - math.gcd(48, 18)을 계산하고 로봇이 말하게 하세요

import robot
import math

scores = [45, 82, 67, 91, 38, 76, 88]
names = ["가", "나", "다", "라", "마", "바", "사"]

passing = list(filter(lambda x: x >= 60, scores))
print("합격자 점수:", passing)

bonused = list(map(lambda x: x + 3, passing))
print("보너스 적용:", bonused)

for name, score in zip(names, scores):
    status = "합격" if score >= 60 else "불합격"
    print(f"{name}: {score}점 → {status}")

gcd = math.gcd(48, 18)
print("최대공약수:", gcd)

robot.say(f"최대공약수는 {gcd}!")
robot.dance()`,
  },
};

export const BADGE_METADATA_LV2 = [
  { conceptId: 17, nameKo: "숫자형 마스터", iconName: "Binary", colorClass: "text-blue-600" },
  { conceptId: 18, nameKo: "문자형 마스터", iconName: "FileText", colorClass: "text-purple-600" },
  { conceptId: 19, nameKo: "리스트 마스터", iconName: "ListChecks", colorClass: "text-green-600" },
  { conceptId: 20, nameKo: "튜플 마스터", iconName: "Parentheses", colorClass: "text-orange-600" },
  { conceptId: 21, nameKo: "딕셔너리 마스터", iconName: "BookOpen", colorClass: "text-red-600" },
  { conceptId: 22, nameKo: "세트 마스터", iconName: "Layers", colorClass: "text-teal-600" },
  { conceptId: 23, nameKo: "변수복사 마스터", iconName: "Copy", colorClass: "text-indigo-600" },
  { conceptId: 24, nameKo: "조건문 마스터", iconName: "GitBranch", colorClass: "text-pink-600" },
  { conceptId: 25, nameKo: "for심화 마스터", iconName: "Repeat", colorClass: "text-emerald-600" },
  { conceptId: 26, nameKo: "while심화 마스터", iconName: "RefreshCcw", colorClass: "text-lime-600" },
  { conceptId: 27, nameKo: "함수심화 마스터", iconName: "Braces", colorClass: "text-violet-600" },
  { conceptId: 28, nameKo: "클래스심화 마스터", iconName: "Network", colorClass: "text-amber-600" },
  { conceptId: 29, nameKo: "예외처리 마스터", iconName: "ShieldAlert", colorClass: "text-red-700" },
  { conceptId: 30, nameKo: "라이브러리 마스터", iconName: "Library", colorClass: "text-sky-600" },
];

export const UNIT_GROUPS_LV1 = [
  { label: "로봇 소개", icon: "Bot",        color: "#7B5CF0", ids: [0] },
  { label: "자료형",   icon: "Layers",      color: "#0D9488", ids: [1, 2, 7, 8, 9, 10] },
  { label: "연산자",   icon: "Calculator",  color: "#D97706", ids: [3, 4, 5, 6] },
  { label: "제어문",   icon: "GitBranch",   color: "#2563EB", ids: [11, 12, 13] },
  { label: "함수/클래스", icon: "Braces",   color: "#DB2777", ids: [14, 15, 16] },
];

export const UNIT_GROUPS_LV2 = [
  { label: "자료형(심화)",      icon: "Layers",     color: "#0D9488", ids: [17, 18, 19, 20, 21, 22, 23] },
  { label: "제어문(심화)",      icon: "GitBranch",  color: "#2563EB", ids: [24, 25, 26] },
  { label: "함수/클래스(심화)", icon: "Braces",     color: "#DB2777", ids: [27, 28] },
  { label: "예외처리/라이브러리", icon: "ShieldAlert", color: "#DC2626", ids: [29, 30] },
];
