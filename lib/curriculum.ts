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

# draw()는 로봇의 현재 위치에 도형을 그려요.
# 먼저 왼쪽 위로 이동한 뒤, 3개씩 두 줄로 그려봅시다.
robot.turn("left")
robot.move(4)
robot.turn("up")
robot.move(2)

robot.draw("circle")
robot.turn("right")
robot.move(2)
robot.draw("star")
robot.move(2)
robot.draw("heart")

robot.turn("down")
robot.move(2)
robot.draw("diamond")
robot.turn("left")
robot.move(2)
robot.draw("square")
robot.move(2)
robot.draw("triangle")

# 마지막 도형을 가리지 않도록 아래로 이동해요.
robot.turn("down")
robot.move(2)

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
#   robot.turn("left"/"right"/"up"/"down")  방향 전환
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

# print() 함수 - 괄호 안의 내용을 화면에 출력합니다.

# 숫자 출력
print(123)        # 정수 출력
print(456.789)    # 실수 출력
print(12 - 4)     # 수식이 있으면 계산 결과를 출력합니다.
print(12 / 4)
print(10 / 3)

# 문자열 출력 (글자는 따옴표로 감쌉니다)
print("안녕하세요")
print('고양이가 "야옹"')   # 따옴표를 출력하려면 "와 '를 번갈아 씁니다.
print("~!@#$%^&*()_+|;:")  # 따옴표를 제외한 특수기호는 그대로 출력됩니다.

# 콤마(,)와 곱셈(*) 활용
print("강아지가", "멍" * 5)  # 콤마는 값을 이어 출력, *는 문자열을 반복합니다.

robot.say("print 완전 정복!")
robot.emotion("happy")`,
    explanation: "print()는 괄호 안의 값을 화면에 출력합니다. 쉼표(,)로 여러 값을, *(곱셈)으로 반복을 출력할 수 있어요.",
    practiceCode: `# 문제: 아래 출력 결과가 정확히 나오도록 코드를 완성하세요.
##############
# 출력 결과:
# 안녕안녕안녕
# 사과바나나
# 3 * 4 = 12
##############

import robot

# "안녕"을 3번 반복 출력 (hint: * 사용)
print("안녕" * 3)

# "사과"와 "바나나"를 + 연산자로 이어 출력 (hint: + 사용)
print("사과" + "바나나")

# "3 * 4 = "와 3*4 계산 결과를 함께 출력
print("3 * 4 =", 3 * 4)

robot.say("출력 완성!")
robot.emotion("happy")`,
  },
  2: {
    nameKo: "변수",
    nameEn: "variable",
    exampleCode: `import robot

# 변수 - 값을 저장하는 이름표입니다.
# 변수명 = 값  형태로 값을 할당합니다.

score = 95   # 변수 score를 만들고 값 95를 할당합니다.
print(score)
print("점수", score)                       # 쉼표(,)로 문자열과 변수를 이어 출력합니다.
print("2배 하면", score * 2, "점입니다.")

name = "홍길동"   # 문자열도 변수에 저장할 수 있습니다.
print(name)
print("이름:", name)
print(name, "씨의 이름은", name, "입니다.")

# f-string: 문자열 안에 변수 값을 직접 넣는 방법
msg = f"{name}의 점수는 {score}점!"
print(msg)

robot.say(f"안녕, {name}님!")
robot.emotion("happy")`,
    explanation: "변수는 값을 저장하는 이름표입니다. =으로 값을 할당하고, f-string(f\"...\")으로 변수 값을 문자열 안에 넣을 수 있어요.",
    practiceCode: `# 문제: 변수를 만들어 나를 소개하는 코드를 완성하세요.
# 조건:
#   1. subject = "정보"로 저장하세요
#   2. grade = 1로 저장하세요
#   3. f-string으로 "나는 _학년이고, _ 과목을 좋아해!" 형태로 출력하세요
##############
# 출력 결과:
# 나는 1학년이고, 정보 과목을 좋아해!
##############

import robot

subject = "정보"
grade = 1

print(f"나는 {grade}학년이고, {subject} 과목을 좋아해!")

robot.say(f"{subject} 최고!")
robot.emotion("happy")`,
  },
  3: {
    nameKo: "산술 연산자",
    nameEn: "arithmetic_operator",
    exampleCode: `import robot

# 산술 연산자 - 수학적 계산을 수행합니다.
a = 7   # 변수 a에 7을 할당
b = 3   # 변수 b에 3을 할당

print("a =", a)
print("b =", b)
print("a + b =", a + b)   # 덧셈 연산자: 7 + 3 = 10
print("a - b =", a - b)   # 뺄셈 연산자: 7 - 3 = 4
print("a * b =", a * b)   # 곱셈 연산자: 7 * 3 = 21
print("a / b =", a / b)   # 나눗셈 연산자: 7 / 3 = 2.333...
print("a ** b =", a ** b) # 거듭제곱 연산자: 7의 3제곱 = 343
print("a // b =", a // b) # 몫 연산자(정수 나눗셈): 7 // 3 = 2
print("a % b =", a % b)   # 나머지 연산자: 7 % 3 = 1

robot.say(f"몫:{a // b}, 나머지:{a % b}!")
robot.emotion("happy")`,
    explanation: "+, -, *, /는 기본 사칙연산, //(몫), %(나머지), **(거듭제곱)도 자주 씁니다.",
    practiceCode: `# 문제: 가로 5, 세로 3인 직사각형의 넓이와 둘레를 계산하세요.
# 조건:
#   - 넓이(area) = width * height
#   - 둘레(perimeter) = (width + height) * 2
#   - 넓이와 둘레를 print()로 출력하고, 로봇을 넓이만큼 이동시키세요
##############
# 출력 결과:
# 넓이: 15
# 둘레: 16
##############

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

# 비교 연산자 - 두 값을 비교해 True(참) 또는 False(거짓)를 반환합니다.
a = 7   # 변수 a에 7을 할당
b = 3   # 변수 b에 3을 할당

print("a =", a)
print("b =", b)
print("a == b:", a == b)   # 같다(equal to): False
print("a != b:", a != b)   # 같지 않다(not equal to): True
print("a > b:", a > b)     # 크다(greater than): True
print("a < b:", a < b)     # 작다(less than): False
print("a >= b:", a >= b)   # 크거나 같다(greater than or equal to): True
print("a <= b:", a <= b)   # 작거나 같다(less than or equal to): False

# 문자열도 비교할 수 있습니다 (앞에서부터 한 글자씩 사전식으로 비교합니다)
print("apple < banana:", "apple" < "banana")     # True
print("apple < applepie:", "apple" < "applepie") # 앞부분이 같으면 더 짧은 문자열이 작습니다: True

robot.say(f"{a}이 {b}보다 크다? {a > b}")
robot.emotion("happy")`,
    explanation: "비교 연산자는 두 값을 비교해 True 또는 False를 반환합니다. ==은 '같다', !=은 '다르다'를 의미해요.",
    practiceCode: `# 문제: score를 기준값과 비교하는 코드를 완성하세요.
# 조건:
#   - score = 75, target = 80 으로 설정하세요
#   - score >= target 결과를 result 변수에 저장하세요
#   - True이면 로봇이 기뻐하고, False이면 슬퍼하게 하세요
##############
# 출력 결과:
# 80점 이상?: False
# score == target: False
# score != target: True
##############

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

# 할당 연산자 - 변수에 값을 저장합니다.
a = 0   # 변수 a에 0을 할당
print("a =", a)

a = a + 7   # a의 현재 값에 7을 더해서 다시 저장
print("a =", a)

# 복합 할당 연산자: 변수에 연산 후 결과를 다시 저장합니다.
a += 2    # a = a + 2 와 같습니다
print(a)
a -= 3    # a = a - 3
print(a)
a *= 4    # a = a * 4
print(a)
a /= 6    # a = a / 6
print(a)

robot.say(f"최종 a = {a}")
robot.emotion("happy")`,
    explanation: "+=, -=, *=, /= 는 변수에 연산 후 결과를 다시 저장하는 복합 할당 연산자입니다.",
    practiceCode: `# 문제: 로봇 체력(hp)을 복합 할당 연산자로 관리하세요.
# 조건:
#   - hp = 100 으로 시작
#   - 적에게 맞아 hp가 30 감소 (hp -= 30)
#   - 아이템을 먹어 hp가 20 증가 (hp += 20)
#   - 배율 아이템으로 hp가 2배 (hp *= 2)
#   - 각 단계마다 hp를 출력하고, 최종 hp를 로봇이 말하게 하세요
##############
# 출력 결과:
# 시작 HP: 100
# 피해 후 HP: 70
# 회복 후 HP: 90
# 배율 후 HP: 180
##############

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

# 논리 연산자 - 여러 조건을 조합합니다.
a = 6

print("a % 2 == 0:", a % 2 == 0)   # 2의 배수인가? True
print("a % 3 == 0:", a % 3 == 0)   # 3의 배수인가? True
print("a % 4 == 0:", a % 4 == 0)   # 4의 배수인가? False

# and: 두 조건이 모두 참일 때만 True
print("2의배수 and 3의배수:", a % 2 == 0 and a % 3 == 0)   # True
print("2의배수 and 4의배수:", a % 2 == 0 and a % 4 == 0)   # False

# or: 두 조건 중 하나라도 참이면 True
print("2의배수 or 3의배수:", a % 2 == 0 or a % 3 == 0)     # True
print("2의배수 or 4의배수:", a % 2 == 0 or a % 4 == 0)     # True

# not: 참/거짓 값을 반전시킵니다
print("not(2의배수):", not(a % 2 == 0))   # False

robot.say(f"{a}은 2와 3의 배수? {a % 2 == 0 and a % 3 == 0}")
robot.emotion("happy")`,
    explanation: "and(그리고), or(또는), not(반전) 으로 여러 조건을 조합할 수 있습니다.",
    practiceCode: `# 문제: 놀이터 입장 조건을 판단하는 코드를 완성하세요.
# 조건:
#   - is_weekend = True (주말이면 True)
#   - is_raining = False (비가 오면 True)
#   - 주말이고(and) 비가 오지 않을(not) 때만 놀이터 입장 가능
#   - can_enter 변수에 입장 가능 여부를 저장하세요
##############
# 출력 결과:
# 주말: True
# 비 여부: False
# 입장 가능?: True
##############

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

# 숫자형 - 내장 함수와 math, random 모듈을 활용합니다.

print("1. 절대값:", abs(-12.34))             # 절대값 계산
print("2. 올림:", math.ceil(3.14))           # 소수점 올림
print("3. 내림:", math.floor(3.14))          # 소수점 내림
print("4. 반올림:", round(3.1415926535, 2))  # 소수점 2자리까지 반올림

print("5. 실수를 정수로:", int(12.34))        # 실수 → 정수 변환
print("6. 문자열을 정수로:", int("123"))       # 문자열 → 정수 변환

# random 모듈: 난수(무작위 수) 생성
print("7. 랜덤 정수(1~5):", random.randint(1, 5))              # 1~5 사이 정수
print("8. 랜덤 실수(0~1):", random.random())                    # 0~1 사이 실수
print("9. 랜덤(0~100, 10씩):", random.randrange(0, 100, 10))   # 0,10,20,...중 랜덤

# math 모듈: 수학 함수
print("10. 1 라디안을 각도로:", math.degrees(1))    # 라디안 → 각도
print("11. 90 각도를 라디안으로:", math.radians(90)) # 각도 → 라디안

robot.say(f"랜덤: {random.randint(1, 10)}!")
robot.emotion("happy")`,
    explanation: "abs(), round(), int()는 내장 함수, math.ceil()/floor()은 math 모듈, random.randint()는 random 모듈을 사용합니다.",
    practiceCode: `# 문제: 원의 넓이와 둘레를 계산하세요.
# 조건:
#   - math.pi (파이 값 3.14159...)를 사용하세요
#   - radius = 5 로 설정하세요
#   - 넓이 = math.pi * radius ** 2
#   - 둘레 = 2 * math.pi * radius
#   - round()로 소수점 2자리까지 반올림해서 출력하세요
##############
# 출력 결과:
# 원의 넓이: 78.54
# 원의 둘레: 31.42
##############

import robot
import math

radius = 5

area = math.pi * radius ** 2
perimeter = 2 * math.pi * radius

print("원의 넓이:", round(area, 2))
print("원의 둘레:", round(perimeter, 2))

robot.move(radius)
robot.say(f"반지름 {radius}인 원!")`,
  },
  8: {
    nameKo: "문자형",
    nameEn: "string_type",
    exampleCode: `import robot

# 문자형(문자열) - 글자들의 모음입니다.
# 인덱스:  [0] [1] [2] [3] [4]
#          안   녕   하   세   요
# 뒤에서: [-5] [-4] [-3] [-2] [-1]

text1 = "안녕하세요"
print("1.", text1)                       # 문자열 전체 출력
print("2. 첫 글자:", text1[0])            # 인덱스 0 = 첫 번째 글자
print("3. 뒤에서 두 번째:", text1[-2])    # 음수 인덱스 = 뒤에서부터

print("4. 3~4번째:", text1[2:4])          # 슬라이싱: 인덱스 2부터 4 미만
print("5. 중간 부분:", text1[1:-1])       # 1번 인덱스부터 마지막 전까지

# 여러 줄 문자열은 따옴표 3개(""")를 사용합니다.
text2 = """6. 동해물과 백두산이
마르고 닳도록
하느님이 보우하사
우리 나라 만세"""
print(text2)

print("7. 이것은\\n한줄씩\\n줄바꿈")    # \\n = 줄바꿈
print("8. 이것은\\t탭으로\\t띄우기")   # \\t = 탭 간격

print("9. 문자열", "더하기")            # 콤마로 이어 출력
print("10. 문자열 " + "더하기")         # + 연산자로 문자열 연결
print("11. 문자열 " + "복제 " * 5)      # * 연산자로 문자열 반복

# 문자열 포매팅 3가지 방법
print("12. 이름은 %s이고, 나이는 %d입니다." % ("홍길동", 19))
name = "앨리스"
age = 30
print("13. format 방식: {}이고, 나이는 {}입니다.".format(name, age))
print(f"14. f-string 방식: {name}이고, 나이는 {age}입니다.")  # 가장 현대적

robot.say(f"첫 글자는 {text1[0]}!")`,
    explanation: "문자열은 인덱스([0], [-1])로 글자를 꺼내거나, 슬라이싱([2:4])으로 일부를 잘라낼 수 있습니다.",
    practiceCode: `# 문제: 문자열 슬라이싱과 포매팅을 사용해보세요.
# 조건:
#   - sentence = "파이썬은 재미있다" 로 설정하세요
#   - 첫 3글자만 출력하세요 (슬라이싱 [0:3])
#   - 마지막 3글자만 출력하세요 (슬라이싱 [-3:])
#   - f-string으로 "첫 글자: _" 형태로 출력하세요
##############
# 출력 결과:
# 첫 3글자: 파이썬
# 마지막 3글자: 미있다
# 첫 글자: 파
# 글자 수: 9
##############

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

# 리스트 - 여러 값을 순서대로 저장합니다.
subject = ["국어", "영어", "수학", "정보"]   # 과목명 리스트 생성
score = [95, 87, 91, 100]                     # 점수 리스트 생성

print("1. 과목:", subject)
print("2. 점수:", score)
print("3. '정보' 인덱스 번호:", subject.index("정보"))    # 값의 인덱스 찾기
print("4. 점수 첫 번째 항목:", score[0])                   # 인덱스로 값 꺼내기
print("5. 정보 과목 점수:", score[subject.index("정보")])  # 인덱스를 활용

print("6. 리스트 길이:", len(subject))        # len() = 항목 개수
print("7. 리스트 합치기:", subject + score)   # + 연산자로 리스트 연결

# for문으로 리스트의 모든 항목을 순서대로 처리합니다.
print("8. 리스트 반복")
for title in subject:
    print(title, ":", score[subject.index(title)])

robot.say(f"총 {len(subject)}개 과목!")
robot.emotion("happy")`,
    explanation: "리스트는 여러 값을 순서대로 저장합니다. 인덱스로 값을 꺼내고, for문으로 모든 요소를 순회할 수 있어요.",
    practiceCode: `# 문제: 친구들의 점수 리스트를 만들어 최고점을 찾으세요.
# 조건:
#   - names = ["민준", "서연", "지호", "하은"]
#   - scores = [88, 95, 72, 91]
#   - for문으로 순회하며 로봇이 매번 이름과 점수를 말하게 하세요
#   - 90점 이상이면 로봇이 bounce, 아니면 move(1)
##############
# 출력 결과:
# 민준: 88점
# 서연: 95점
# 지호: 72점
# 하은: 91점
# 최고 점수: 95
##############

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

# 불리언(boolean) - True(참) 또는 False(거짓) 두 가지 값만 가집니다.
print(True)            # 불리언 값 True 출력
print(3 > 2)           # 비교 연산 결과: True
print(bool(1))         # 0이 아닌 숫자는 True
print(bool("a"))       # 비어있지 않은 문자열은 True
print(6 % 2 == 0 and 6 % 3 == 0)   # 6이 2와 3의 공배수인지 확인

# 불리언 변수 활용 예시
isDoorOpen = False      # 문이 열려 있는지 여부
isUserHasKey = True     # 열쇠를 가지고 있는지 여부

print("자료형:", type(isDoorOpen))     # type() 으로 자료형 확인
print("문 열림 여부:", isDoorOpen)
print("열쇠 소지 여부:", isUserHasKey)
print("문 열리고, 열쇠 있음:", isDoorOpen and isUserHasKey)
print("문 안 열리고, 열쇠 있음:", not isDoorOpen and isUserHasKey)  # not = 반전

robot.say(f"입장 가능? {not isDoorOpen and isUserHasKey}")
robot.emotion("happy")`,
    explanation: "불리언은 True(참) 또는 False(거짓)만 가집니다. bool()로 다른 자료형을 불리언으로 변환할 수 있어요.",
    practiceCode: `# 문제: 게임 캐릭터 상태를 불리언으로 관리하세요.
# 조건:
#   - is_alive = True (생존), has_weapon = False (무기 소지)
#   - can_attack = is_alive and has_weapon
#   - 각 변수의 자료형을 type()으로 출력하세요
#   - can_attack 결과에 따라 로봇이 다르게 반응하게 하세요
##############
# 출력 결과:
# is_alive 자료형: <class 'bool'>
# 생존: True
# 무기 소지: False
# 공격 가능?: False
##############

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

# 조건문 - 조건에 따라 다른 코드를 실행합니다.

# if / else 기본 구조
score = 2
print("1. 점수:", score)

if score >= 3:
    print("2. 3점 이상으로 성공입니다. 엔딩화면으로 이동합니다.")
else:
    print("2. 3점 미만으로 실패입니다. 게임을 재시작합니다.")

# if / elif / else 구조 (여러 조건을 순서대로 확인합니다)
other = "도착지점"

print("1. 충돌 가능 오브젝트: 바닥, 도착지점, 장애물")
print("2. 충돌한 대상:", other)

if other == "바닥":
    print("3. 바닥에 떨어지면 탈락입니다. 게임을 재시작합니다.")
elif other == "도착지점":   # elif = else if (앞의 조건이 거짓일 때 확인)
    print("3. 도착지점에 도착했습니다. 게임을 종료합니다.")
else:
    print("3. 여기에는 아무것도 없습니다.")

robot.say(f"점수: {score}점!")
robot.emotion("sad" if score < 3 else "happy")`,
    explanation: "if/elif/else로 조건에 따라 다른 코드를 실행합니다. 조건이 True인 블록만 실행돼요.",
    practiceCode: `# 문제: 신호등 색상에 따라 로봇이 다르게 행동하도록 하세요.
# 조건:
#   - "red": 멈추고 "정지!" 출력
#   - "yellow": 준비 감정 표현 후 "준비!" 출력
#   - "green": 앞으로 2칸 이동 후 "출발!" 출력
#   - 다른 색: "모르는 색이야!" 출력
#   - color = "green"으로 설정하세요
##############
# 출력 결과:
# 현재 신호: green
# 출발!
##############

import robot

color = "green"

print("현재 신호:", color)

if color == "red":
    print("정지!")
    robot.emotion("sad")
    robot.shake()
    robot.say("정지!")
elif color == "yellow":
    print("준비!")
    robot.emotion("surprised")
    robot.bounce(2)
    robot.say("준비!")
elif color == "green":
    print("출발!")
    robot.emotion("happy")
    robot.move(2)
    robot.draw("circle")
    robot.say("출발!")
else:
    print("모르는 색이야!")
    robot.shake()
    robot.say("모르는 색이야!")`,
  },
  12: {
    nameKo: "for 반복문",
    nameEn: "for_loop",
    exampleCode: `import robot

# for 반복문 - 반복 횟수가 정해진 경우에 사용합니다.
# range(시작, 끝): 시작부터 끝-1 까지 정수를 순서대로 만듭니다.

for num in range(1, 11):   # 1부터 10까지 반복
    if num % 2 == 0:       # 2로 나누어 떨어지면 짝수
        print(num, "은 짝수입니다.")
    else:
        print(num, "은 홀수입니다.")

robot.say("1부터 10까지 완료!")
robot.emotion("happy")
robot.bounce(2)`,
    explanation: "for문은 반복 횟수가 정해진 반복에 씁니다. range(시작, 끝, 간격)으로 반복 범위를 설정해요.",
    practiceCode: `# 문제: for문으로 구구단 한 단을 출력하세요.
# 조건:
#   - dan = 3 으로 설정
#   - range(1, 10)으로 1~9까지 반복
#   - "3 x 1 = 3" 형태로 출력 + 로봇이 매번 결과를 말하게 하세요
##############
# 출력 결과:
# 3 x 1 = 3
# 3 x 2 = 6
# 3 x 3 = 9
# 3 x 4 = 12
# 3 x 5 = 15
# 3 x 6 = 18
# 3 x 7 = 21
# 3 x 8 = 24
# 3 x 9 = 27
##############

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

# while 반복문 - 조건이 참인 동안 계속 반복합니다.
# 반복 조건이 동적이거나 불확실할 때 사용합니다.

num = 2
goal = 1000

while True:   # 조건이 항상 참이므로 break를 만날 때까지 반복합니다.
    print(num)
    if num > goal:
        break         # 반복문을 즉시 탈출합니다.
    num *= 2          # num을 2배로 늘립니다.

print("반복이 끝났습니다.")
print(goal, "보다 크면서 가장 작은 2의 제곱수는", num, "입니다.")

robot.say(f"{goal}보다 큰 2의 제곱: {num}")
robot.emotion("surprised")`,
    explanation: "while문은 조건이 참인 동안 계속 반복합니다. break로 즉시 탈출할 수 있어요.",
    practiceCode: `# 문제: while문으로 1부터 시작해 누적 합이 50을 넘을 때까지 더하세요.
# 조건:
#   - total = 0, num = 1 로 시작
#   - total <= 50 인 동안 num을 더하고, num은 1씩 증가
#   - 매 반복마다 로봇이 현재 합계를 말하게 하세요
##############
# 출력 결과:
# 누적 합: 55
# 마지막 숫자: 10
##############

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

# 함수 - 특정한 작업을 반복해서 수행하기 위해 사용합니다.
# def 함수이름(매개변수):  형태로 정의합니다.

def say():
    print("안녕하세요.")

say()   # 함수 호출
say()
say()

def say2(num):   # 매개변수가 있는 함수
    print(num, "번 손님, 안녕하세요.")

say2(1)
say2(1 + 1)
say2(9 / 3)

def say4(a, b):
    return a + b   # return: 결과값을 반환합니다.

result = say4(1, 4)
print("1 + 4 =", result)

# 전역 변수(global) - 함수 안에서 함수 밖의 변수를 수정할 때 사용합니다.
score = 0
print("점수:", score)

def score_up():
    global score      # 함수 밖의 score 변수를 사용하겠다는 선언
    score += 1
    print("점수 증가:", score)

def score_reset():
    global score
    score = 0
    print("점수 초기화:", score)

score_up()
score_up()
score_reset()
score_up()

robot.say(f"최종 점수: {score}")
robot.emotion("happy")`,
    explanation: "함수는 반복되는 코드를 묶어 이름을 붙인 것입니다. def로 정의하고, return으로 값을 돌려줘요.",
    practiceCode: `# 문제: 두 숫자를 받아 합과 평균을 반환하는 함수를 완성하세요.
# 조건:
#   - add(a, b): a + b를 반환
#   - average(a, b): (a + b) / 2를 반환
#   - add(7, 3)과 average(7, 3)을 호출해 결과를 출력하세요
##############
# 출력 결과:
# 7 + 3 = 10
# (7 + 3) / 2 = 5.0
##############

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

# 클래스 - 속성(변수)과 행동(메서드)을 묶은 설계도입니다.

class Dog:
    def __init__(self, name, breed):   # 생성자: 객체 생성 시 자동으로 호출됩니다.
        self.name = name    # self. 으로 인스턴스 변수를 설정합니다.
        self.breed = breed

    def bark(self):         # 메서드: 클래스 내부의 함수입니다.
        print("Woof!")

my_dog1 = Dog("Buddy", "Golden Retriever")   # 인스턴스(객체) 생성
my_dog2 = Dog("Coco", "Poodle")

print(my_dog1.name, my_dog1.breed)   # 속성 접근
print(my_dog2.name, my_dog2.breed)
my_dog1.bark()   # 메서드 호출
my_dog2.bark()

# 상속 - 기존 클래스의 기능을 물려받아 확장합니다.
class Character:
    def __init__(self, name, hp, power, attack_speed, attack_range):
        self.name = name
        self.hp = hp
        self.power = power
        self.attack_speed = attack_speed
        self.attack_range = attack_range
        self.is_alive = True

    def attack(self):
        print(f"{self.name} 공격!")

class Warrior(Character):   # Character 클래스를 상속
    def __init__(self, name):
        super().__init__(name, hp=100, power=80, attack_speed=70, attack_range=20)  # 부모 클래스 생성자 호출

    def attack(self):       # 메서드 오버라이딩: 부모 메서드를 재정의합니다.
        print(f"{self.name}: 돌격!")

class Archer(Character):
    def __init__(self, name):
        super().__init__(name, hp=50, power=30, attack_speed=30, attack_range=80)

    def attack(self):
        print(f"{self.name}: 발사!")

warrior1 = Warrior("도끼병")
archer1 = Archer("궁수")

print(f"{warrior1.name}: 체력 {warrior1.hp}, 공격력 {warrior1.power}")
print(f"{archer1.name}: 체력 {archer1.hp}, 공격력 {archer1.power}")

warrior1.attack()
archer1.attack()

robot.say(f"{warrior1.name}과 {archer1.name} 등장!")`,
    explanation: "클래스는 속성(변수)과 행동(메서드)을 묶은 설계도입니다. __init__은 객체 생성 시 자동 호출돼요.",
    practiceCode: `# 문제: 학생(Student) 클래스를 완성하세요.
# 조건:
#   - __init__(self, name, grade, score): 이름, 학년, 점수를 속성으로 저장
#   - introduce(self): "이름: _, 학년: _, 점수: _" 형태로 출력
#   - is_pass(self): score >= 60이면 True 반환
#   - Student("홍길동", 1, 85)로 인스턴스 생성 후 테스트하세요
##############
# 출력 결과:
# 이름: 홍길동, 학년: 1, 점수: 85
##############

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

# 모듈 - 파이썬 코드를 논리적으로 묶어서 관리하는 파일(.py)입니다.
# 표준 모듈: 파이썬에 기본 내장된 모듈
# 외부 모듈: 다른 개발자가 만든 모듈 (pip install 로 설치)
# 사용자 정의 모듈: 직접 만든 모듈

# import 모듈명 as 별칭 - as로 짧은 별칭을 붙일 수 있습니다.
import keyword as k
print(k.kwlist)   # 파이썬 예약어 목록 출력

# from 모듈명 import 기능 - 특정 기능만 가져옵니다.
from keyword import kwlist
print(kwlist)     # 모듈명 없이 바로 사용 가능

# os 모듈 - 운영체제 관련 기능
import os
print(os.getcwd())   # 현재 작업 디렉토리 출력

# random 모듈 - 난수 생성
import random
print(random.random())         # 0~1 사이 실수
print(random.randint(1, 5))    # 1~5 사이 정수

# math 모듈 - 수학 함수
import math
print(math.pi)                 # 원주율 π 값
print(math.factorial(5))       # 5! = 120

# 실습: 로또 번호 생성기
lotto = []
while True:
    temp = random.random()
    temp = temp * 100
    if temp >= 1 and temp < 46:
        lotto.append(int(temp))
        lotto = set(lotto)   # 중복 제거
        lotto = list(lotto)
    if len(lotto) == 6:
        break
print(lotto)

# 더 간결한 방법
print(random.sample(range(1, 46), 6))   # 1~45 사이 숫자 6개 무작위 선택

robot.say("모듈 완전 정복!")
robot.dance()`,
    explanation: "모듈은 기능이 담긴 파일입니다. import로 불러오고, as로 별칭을 붙일 수 있어요.",
    practiceCode: `# 문제: random 모듈로 로또 번호를 생성하는 코드를 완성하세요.
# 조건:
#   - random.sample(range(1,46), 6)으로 1~45 사이 6개를 뽑으세요
#   - sorted()로 오름차순 정렬하세요
#   - math.factorial(6)도 출력해보세요 (6! = 720)
#   - 로봇이 결과를 말하게 하세요
##############
# 출력 결과:
# 로또 번호: [실행할 때마다 달라지는 1~45 사이 숫자 6개]
# 6! = 720
##############

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

# 숫자형의 3가지 종류
a = 5        # int: 정수형
b = 3.14     # float: 부동 소수점형
c = 2 + 3j   # complex: 복소수형

print("a:", type(a))   # <class 'int'>
print("b:", type(b))   # <class 'float'>
print(type(c))          # <class 'complex'>

# 사칙 연산
a = 5
b = 2
print(a + b)    # 더하기: 7
print(a - b)    # 빼기: 3
print(a * b)    # 곱하기: 10
print(a / b)    # 나누기: 2.5
print(a ** b)   # 제곱: 25
print(a // b)   # 나눗셈 몫: 2
print(a % b)    # 나눗셈 나머지: 1

robot.say(f"a:{type(a).__name__}, b:{type(b).__name__}")
robot.emotion("happy")`,
    practiceCode: `# 문제: 세 수 a=10, b=3, c=2.5를 이용한 계산
# 조건:
#   - 각 변수의 자료형을 type()으로 출력하세요
#   - a를 b로 나눈 몫(//), 나머지(%)를 출력하세요
#   - a ** c (10의 2.5승)를 계산하고 출력하세요
#   - 로봇이 a % b 값만큼 이동하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# a 자료형: <class 'int'>
# b 자료형: <class 'int'>
# c 자료형: <class 'float'>
# 10 // 3 = 3
# 10 % 3 = 1
# 10 ** 2.5 = 316.22776601683796
#-----------------------------------------

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

# 이스케이프 코드
print("First line \\n Second line")   # \\n = 줄바꿈
print("First \\t Second")              # \\t = 탭
print("Backslash: \\\\")               # \\\\ = 백슬래시
print('It\\'s a sunny day')            # \\' = 작은따옴표

# 문자열 노하우
print("python" * 2)       # 문자열 반복
print("=" * 50)            # 줄 만들기

a = "life is too short live powerful"
print(len(a))              # len()으로 글자 수 구하기

# 문자열 슬라이싱
g = "Python Programming"
print(g[0:6])              # 'Python'
print(g[:15])              # 앞에서 15글자
print(g[15:])              # 16번째부터 끝까지
print(g[0:18:2])           # 한 글자씩 건너뛰며 슬라이싱 (스텝 사용)

# 문자열 메서드
a = "Python is the best choice"
print(a.find('b'))         # 'b'가 처음 나오는 위치 반환 (없으면 -1)
print(a.count('t'))        # 't'의 개수

a = "     hi     "
print(a.strip())           # 양쪽 공백 제거
print(a.lstrip())          # 왼쪽 공백 제거
print(a.rstrip())          # 오른쪽 공백 제거

a = "Life is too short"
print(a.replace("Life", "Your leg"))   # 특정 문자열 치환

a = "Life! is too short"
print(a.split())           # 공백으로 나누기
print(a.split('!'))        # '!'로 나누기

print("hello world".upper())      # 대문자로
print("HELLO WORLD".lower())      # 소문자로
print("hello world".capitalize()) # 첫 글자만 대문자
print("hello world".title())      # 각 단어의 첫 글자 대문자

robot.say("문자열 메서드 완성!")`,
    practiceCode: `# 문제: 문자열 메서드를 활용해보세요.
# 조건:
#   - sentence = "life is too short, you need python"
#   - 대문자로 변환해서 출력하세요
#   - "python"을 "파이썬"으로 바꿔서 출력하세요
#   - 공백으로 나눈 단어 수를 출력하세요 (hint: len(sentence.split()))
#   - 로봇이 단어 수를 말하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# 대문자: LIFE IS TOO SHORT, YOU NEED PYTHON
# 치환: life is too short, you need 파이썬
# 단어 수: 7
#-----------------------------------------

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

# 이중 리스트 (리스트 안에 리스트)
a = [1, 2, 3, ['a', 'b', 'c']]
print(a[3])         # 네 번째 요소(리스트): ['a', 'b', 'c']
print(a[-1][-2])    # 마지막 리스트의 뒤에서 두 번째 요소: 'b'

# 리스트 슬라이싱
a = [1, 2, 3, 4, 5]
print(a[0:2])       # 0번부터 2번 전까지: [1, 2]

# 리스트 메서드
a = [1, 2, 3]
a.append([4, 5])    # append: 리스트 마지막에 요소 추가
print(a)            # [1, 2, 3, [4, 5]]

a = [1, 2, 3]
a.extend([4, 5])    # extend: 리스트 뒤에 리스트를 연결
print(a)            # [1, 2, 3, 4, 5]

a = ['a', 'c', 'b']
a.sort()            # sort: 오름차순 정렬
print(a)            # ['a', 'b', 'c']

a = ['a', 'c', 'b']
a.reverse()         # reverse: 리스트를 역순으로 뒤집기
print(a)            # ['b', 'c', 'a']

a = [1, 2, 3]
a.insert(0, 4)      # insert(위치, 값): 특정 위치에 삽입
print(a)            # [4, 1, 2, 3]

a = [1, 2, 3, 1, 2, 3]
a.remove(3)         # remove: 처음으로 나오는 값을 삭제
print(a)            # [1, 2, 1, 2, 3]

a = [1, 2, 3]
a.pop()             # pop: 마지막 요소를 삭제하고 반환
print(a)            # [1, 2]

robot.say("리스트 메서드 완성!")`,
    practiceCode: `# 문제: 리스트 메서드를 사용해서 점수를 관리하세요.
# 조건:
#   - scores = [85, 92, 78, 95, 88] 로 시작하세요
#   - 점수 70을 추가(append)하세요
#   - 오름차순 정렬(sort)하세요
#   - 첫 번째 요소를 꺼내고(pop(0)) 출력하세요
#   - 최종 리스트와 최고점(max)을 출력하세요

import robot

#-----------------------------------------
# [출력 결과]
# 제거된 점수: 70
# 최종 점수: [78, 85, 88, 92, 95]
# 최고점: 95
#-----------------------------------------

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

# 튜플 - 한 번 만들면 변경할 수 없는(불변) 자료형입니다.
t1 = (5, 4, 6, 7, 9)
t2 = (1,)              # 요소가 1개일 때는 반드시 쉼표를 붙여야 합니다.
t3 = (1, 2, 3)         # 리스트는 [], 튜플은 ()로 만듭니다.
t4 = 1, 2, 3           # 괄호()를 생략해도 튜플로 정의됩니다.
t5 = ('a', 'b', ('ab', 'cd'))  # 중첩 튜플도 가능합니다.

# 튜플은 요소를 변경할 수 없습니다.
# t1[0] = 1  # 이 코드는 TypeError 오류를 발생시킵니다.

# 튜플 연산 (리스트와 동일)
t1 = (1, 2, 'a', 'b')
t2 = (3, 4)
print(t1 + t2)    # 튜플 연결: (1, 2, 'a', 'b', 3, 4)
print(t1 * 2)     # 튜플 반복: (1, 2, 'a', 'b', 1, 2, 'a', 'b')

# 언패킹 - 튜플 값을 여러 변수에 한 번에 대입합니다.
(a, b) = ('python', 'life')
print(a)   # python
print(b)   # life

robot.say("튜플은 불변!")
robot.emotion("happy")`,
    practiceCode: `# 문제: 튜플을 활용하세요.
# 조건:
#   - coords = (3, 5) 로 x, y 좌표를 튜플로 저장하세요
#   - 언패킹으로 x, y에 각각 저장하세요
#   - x + y 값을 출력하세요
#   - 두 수의 합과 곱을 동시에 반환하는 함수 calc(a, b)를 만드세요
#   - calc(x, y) 결과를 출력하고 로봇이 합을 말하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# x: 3 y: 5
# x + y: 8
# 합: 8 곱: 15
#-----------------------------------------

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
    explanation: "딕셔너리는 key:value 쌍을 삽입 순서대로 저장하며, key로 값을 빠르게 검색할 수 있어 API 데이터에 자주 사용됩니다.",
    exampleCode: `import robot

# 딕셔너리 - key:value 대응 관계를 나타내는 자료형입니다.
# key를 통해 value를 빠르게 검색할 수 있어 API 데이터에 자주 사용됩니다.

# 딕셔너리 정의와 추가
a = {1: 'a'}
a[2] = 'b'       # key 2에 value 'b' 추가
print(a)

# 딕셔너리 메서드
a = {'name': 'pey', 'phone': '010-9999-1234', 'birth': '1118'}
print(a.keys())    # key 목록만 반환
print(a.values())  # value 목록만 반환
print(a.items())   # (key, value) 쌍을 튜플로 반환
print(a.get('name'))   # key에 대응하는 value 반환 (없으면 None)

# 딕셔너리 안에 key가 있는지 확인
print('name' in a)    # True
print('email' in a)   # False

# items()로 key, value 동시에 순회하기
for key, value in a.items():
    print(f"{key}: {value}")

robot.say("딕셔너리 완성!")`,
    practiceCode: `# 문제: 딕셔너리로 학생 성적표를 만드세요.
# 조건:
#   - 딕셔너리 student에 name, korean, math, english 키를 추가하세요
#   - 세 과목의 평균을 계산해서 'avg' 키에 저장하세요
#   - 모든 항목을 출력하세요
#   - 로봇이 평균 점수를 말하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# name: 김철수
# korean: 88
# math: 92
# english: 85
# avg: 88.33333333333333
#-----------------------------------------

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

# 집합(set) - 중복을 허용하지 않는 순서 없는 자료형입니다.
s2 = set([1, 2, 3])
print(s2)   # 원소: 1, 2, 3 (출력 순서는 달라질 수 있음)

# 교집합, 합집합, 차집합 (연산자 사용)
s1 = set([1, 2, 3, 4, 5, 6])
s2 = set([4, 5, 6, 7, 8, 9])
print(s1 & s2)   # 교집합 원소: 4, 5, 6
print(s1 | s2)   # 합집합 원소: 1, 2, 3, 4, 5, 6, 7, 8, 9
print(s1 - s2)   # 차집합 원소: 1, 2, 3

# 메서드로도 같은 결과를 얻을 수 있습니다.
print(s1.intersection(s2))   # 교집합
print(s1.union(s2))           # 합집합
print(s1.difference(s2))      # 차집합

# 집합 메서드
s1 = set([1, 2, 3])
s1.add(4)           # 값 1개 추가
print(s1)           # 원소: 1, 2, 3, 4 (출력 순서는 달라질 수 있음)
s1.update([5, 6])   # 값 여러 개 추가
print(s1)           # 원소: 1, 2, 3, 4, 5, 6 (출력 순서는 달라질 수 있음)
s1.remove(2)        # 특정 값 제거
print(s1)           # 원소: 1, 3, 4, 5, 6 (출력 순서는 달라질 수 있음)

robot.say("집합 연산 완성!")`,
    practiceCode: `# 문제: 세트로 반 학생 취미를 분석하세요.
# 조건:
#   - class_a = {"독서", "게임", "축구", "요리"}
#   - class_b = {"게임", "음악", "축구", "그림"}
#   - 두 반 공통 취미(교집합)를 출력하세요
#   - 전체 취미 종류(합집합)를 출력하세요
#   - A반에만 있는 취미(차집합)를 출력하세요
#   - 로봇이 공통 취미 개수를 말하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# 공통 취미: [실행할 때마다 순서가 달라질 수 있는 게임, 축구 집합]
# 전체 취미: [실행할 때마다 순서가 달라질 수 있는 6개 취미 집합]
# A반만: [실행할 때마다 순서가 달라질 수 있는 독서, 요리 집합]
#-----------------------------------------

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
    explanation: "변수는 객체를 참조합니다. 리스트를 그냥 대입하면 같은 객체를 공유해서 같이 변합니다. 독립적인 복사본을 만들려면 슬라이싱이나 copy()를 사용하세요.",
    exampleCode: `import robot

# 변수는 메모리에 저장된 객체를 참조합니다.
a = [1, 2, 3]
print(id(a))   # id()로 객체의 고유한 식별자 확인

# 대입 - 같은 객체를 가리킵니다.
a = [1, 2, 3]
b = a            # 변수 a를 그대로 b에 대입했습니다.
print(id(a), id(b))   # 두 변수의 객체 식별자가 동일합니다.
print(b is a)          # True: a와 b는 같은 객체를 참조합니다.

b.append(4)      # b를 수정하면 a도 함께 변합니다!
print("a:", a)   # [1, 2, 3, 4]
print("b:", b)   # [1, 2, 3, 4]

# 복사 (슬라이싱) - 독립적인 새 객체를 만듭니다.
a = [1, 2, 3]
c = a[:]         # 리스트 전체를 슬라이싱하여 복사합니다.
print(id(a), id(c))   # 두 변수의 객체 식별자가 다릅니다.
c.append(4)
print("a:", a)   # [1, 2, 3] - 변하지 않음
print("c:", c)   # [1, 2, 3, 4]

# copy 모듈을 사용해도 복사할 수 있습니다.
from copy import copy
a = [1, 2, 3]
d = copy(a)
print(d is a)   # False: 서로 다른 객체입니다.

# 튜플을 이용한 변수 동시 할당
(x, y) = ('python', 'life')
print(x)   # python
print(y)   # life

robot.say("대입 vs 복사 확인!")`,
    practiceCode: `# 문제: 대입과 복사의 차이를 확인하세요.
# 조건:
#   - original = [10, 20, 30] 을 만드세요
#   - shared = original 로 대입하고, shared에 40을 추가한 뒤 original도 출력하세요
#   - copied = original[:] 로 복사하고, copied에 50을 추가한 뒤 original도 출력하세요
#   - 두 경우가 어떻게 다른지 확인하세요

import robot

#-----------------------------------------
# [출력 결과]
# 대입 후 original: [10, 20, 30, 40]
# 복사 후 original: [10, 20, 30]
# 복사본: [10, 20, 30, 50]
#-----------------------------------------

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

# 조건문 심화 - in/not in, pass, 조건부 표현식

# in/not in 연산자: 포함 여부 확인
pocket = ['paper', 'handphone']
card = True

if 'money' in pocket:
    print("택시를 타고가라")
elif card:                     # elif: 앞의 조건이 거짓일 때 다음 조건 확인
    print("카드 내고 택시타라")
else:
    print("걸어가라")

# not in 연산자
if 1 not in [1, 2, 3]:
    pass           # pass: 아무것도 하지 않는 명령어 (빈 블록을 채울 때 사용)
else:
    print("걸어가라")

# and/or를 활용한 조건문
money = 2000
card = 0
if money >= 3000 or card:   # or: 하나라도 참이면 참
    print("택시를 타고 가라")
else:
    print("걸어가라")

# 조건문 한 줄 작성
if 'money' in pocket: pass
else: print("카드를 꺼내라")

# 조건부 표현식 (삼항 연산자)
# 참일 때 값 if 조건 else 거짓일 때 값
score = 85
grade = "합격" if score >= 60 else "불합격"
print(f"점수 {score}점: {grade}")

robot.say(grade)
robot.emotion("happy" if score >= 60 else "sad")`,
    practiceCode: `# 문제: in/not in과 조건부 표현식을 활용하세요.
# 조건:
#   - fruits = ["사과", "바나나", "포도", "딸기"]
#   - "망고"가 fruits에 있는지 확인하고 결과를 출력하세요
#   - "바나나"가 있으면 "있어요!", 없으면 "없어요!"를 조건부 표현식으로 출력하세요
#   - temperature = 25 가 15 이상 30 미만이면 "쾌적", 아니면 "불쾌"를 출력하세요
#   - 로봇이 쾌적 여부를 말하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# 망고 있나? False
# 바나나: 있어요!
# 25도: 쾌적
#-----------------------------------------

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

# for문 기본 (리스트 순회)
test_list = ['one', 'two', 'three']
for i in test_list:
    print(i)

# 리스트와 튜플을 이중으로 사용하기
a = [(1, 2), (3, 4), (5, 6)]
for (first, last) in a:
    print(first + last)   # 3, 7, 11

# for문으로 합격/불합격 판정
marks = [90, 25, 67, 45, 80]
number = 0
for mark in marks:
    number = number + 1
    if mark >= 60:
        print("%d번 학생은 합격입니다." % number)
    else:
        print("%d번 학생은 불합격입니다." % number)

# continue - 현재 반복을 건너뛰고 다음 반복으로 이동합니다.
for mark in marks:
    if mark < 60:
        continue   # 60점 미만이면 아래 print를 건너뜁니다.
    print("합격!")

# 이중 for문 (구구단 출력)
for i in range(2, 4):        # 2단, 3단
    for j in range(1, 6):    # 1~5까지
        print(i * j, end=' ')
    print('')

# 리스트 내포 (list comprehension) - for문을 한 줄로 표현합니다.
a = [1, 2, 3, 4]
result = [num * 3 for num in a]                         # 각 요소에 3을 곱한 리스트
print(result)

result = [num * 3 for num in a if num % 2 == 0]         # 짝수만 3을 곱한 리스트
print(result)

robot.say("for 심화 완성!")`,
    practiceCode: `# 문제: 리스트 내포와 for문을 사용하세요.
# 조건:
#   - 1~20 중 3의 배수를 리스트 내포로 만드세요
#   - for문으로 순회하며 로봇이 매번 값을 말하고 bounce 하게 하세요
#   - 마지막에 2배 리스트를 만들고 로봇이 댄스하게 하세요

import robot

#-----------------------------------------
# [출력 결과]
# 3의 배수: [3, 6, 9, 12, 15, 18]
# 2배: [6, 12, 18, 24, 30, 36]
#-----------------------------------------

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

# 기본 while문
treeHit = 0
while treeHit < 10:
    treeHit = treeHit + 1
    print("나무를 %d번 찍었습니다." % treeHit)
    if treeHit == 10:
        print("나무 넘어갑니다.")

# break - 반복문을 즉시 탈출합니다.
coffee = 5
money = 300
while money:
    print("돈을 받았으니 커피를 줍니다.")
    coffee = coffee - 1
    print("남은 커피의 양은 %d개입니다." % coffee)
    if coffee == 0:
        print("커피가 다 떨어졌습니다. 판매를 중지합니다.")
        break   # while문을 즉시 빠져나옵니다.

# continue - 현재 반복을 건너뛰고 처음으로 돌아갑니다.
a = 0
while a < 10:
    a = a + 1
    if a % 2 == 0:
        continue   # 짝수이면 아래 print를 건너뜁니다.
    print(a)       # 홀수만 출력됩니다.

robot.say("while 심화 완성!")`,
    practiceCode: `# 문제: break와 continue를 활용하세요.
# 조건:
#   - 1부터 시작해서 5의 배수가 나오면 break
#   - 매 숫자마다 로봇이 값을 말하고, 5의 배수 발견 시 shake + 중단
#   - 마지막에 합계를 출력하고 dance

import robot

#-----------------------------------------
# [출력 결과]
# +1 (합계:1)
# +2 (합계:3)
# +3 (합계:6)
# +4 (합계:10)
# 5의 배수 5 발견! 중단
# 합계: 10
#-----------------------------------------

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

# *args - 입력값의 수가 변하는 함수 (가변 인수)
# *args: 입력값을 몇 개든 받아 튜플로 모읍니다.
def add_many(*args):
    result = 0
    for i in args:
        result = result + i
    return result

print(add_many(1, 2, 3, 4, 5, 6, 7, 8, 9, 10))   # 55

# **kwargs - key=value 형태의 가변 인수
# **kwargs: key=value 형태 입력값을 딕셔너리로 모읍니다.
def print_kwargs(**kwargs):
    for k in kwargs.keys():
        if k == "name":
            print("당신의 이름은: " + kwargs[k])

print_kwargs(name="pooh", age=3, species="bear")

# 함수의 반환값이 여러 개이면 튜플로 묶어서 반환됩니다.
def add_and_mul(a, b):
    return a + b, a * b   # 합과 곱을 동시에 반환

print(add_and_mul(1, 2))      # (3, 2) - 튜플로 반환
print(add_and_mul(1, 2)[0])   # 3  - 합
print(add_and_mul(1, 2)[1])   # 2  - 곱

# lambda - 간단한 함수를 한 줄로 표현합니다.
# 사용법: 변수명 = lambda 매개변수: 반환식
add = lambda a, b: a + b
print(add(3, 4))   # 7

# 리스트 안에서도 lambda를 사용할 수 있습니다.
mylist = [lambda a, b: a + b, lambda a, b: a * b]
print(mylist[0](1, 2))   # 3  (더하기)
print(mylist[1](2, 4))   # 8  (곱하기)

# global - 함수 안에서 전역 변수를 수정합니다.
a = 1
def vartest():
    global a   # 함수 밖의 변수 a를 직접 사용하겠다는 선언
    a = a + 1

vartest()
print(a)   # 2

robot.say("함수 심화 완성!")`,
    practiceCode: `# 문제: *args, lambda, global을 활용하세요.
# 조건:
#   - average(*args): 인수들의 평균을 반환하는 함수를 만드세요
#   - average(80, 90, 85, 95)를 호출하고 출력하세요
#   - lambda로 두 수 중 큰 값을 반환하는 함수 bigger를 만드세요
#   - bigger(7, 3)을 호출하고 출력하세요
#   - 전역 변수 level = 1을 만들고 level_up() 함수로 1씩 증가시키세요

import robot

#-----------------------------------------
# [출력 결과]
# 평균: 87.5
# 큰 수: 7
# 레벨: 4
#-----------------------------------------

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

# 생성자 __init__을 사용하면 객체 생성과 동시에 값을 설정할 수 있습니다.
class FourCal:
    def __init__(self, first, second):   # 생성자: 객체 생성 시 자동 호출
        self.one = first    # 객체변수 one에 first 할당
        self.two = second   # 객체변수 two에 second 할당

    def add(self):
        return self.one + self.two

    def mul(self):
        return self.one * self.two

    def div(self):
        if self.two == 0:
            return "Cannot divide by zero"
        return self.one / self.two

a = FourCal(6, 7)    # 생성자 덕분에 바로 값 설정 가능
print("add:", a.add())   # 13
print("mul:", a.mul())   # 42

# 상속 - 기존 클래스를 변경하지 않고 기능을 추가합니다.
class MoreFourCal(FourCal):   # FourCal 클래스를 상속받습니다.
    def pow(self):
        return self.one ** self.two   # 거듭제곱 기능 추가

b = MoreFourCal(4, 2)
print("pow:", b.pow())   # 16 (부모의 add, mul, div도 사용 가능!)

# 메서드 오버라이딩 - 부모 클래스의 메서드를 재정의합니다.
class SafeFourCal(MoreFourCal):
    def div(self):            # 부모의 div를 안전하게 재정의
        if self.two == 0:
            return 0          # 0으로 나누면 에러 대신 0을 반환
        return self.one / self.two

c = SafeFourCal(4, 0)
print("safe div:", c.div())   # 0 (에러 없이 안전하게 처리)

# 클래스 변수 - 모든 인스턴스가 공유하는 변수입니다.
class Family:
    lastname = "김"   # 클래스 변수

print(Family.lastname)   # 클래스 이름으로 직접 접근
a = Family()
print(a.lastname)        # 객체를 통해서도 접근 가능

Family.lastname = "박"   # 클래스 변수 변경 시 모든 인스턴스에 즉시 반영됩니다.
b = Family()
print(b.lastname)        # "박"

robot.say("클래스 심화 완성!")`,
    practiceCode: `# 문제: Animal 클래스를 상속해서 Dog, Cat을 만드세요.
# 조건:
#   - Animal(name, sound): name, sound 속성 + speak() 메서드
#   - speak()는 "이름: 소리~" 형태로 출력
#   - Dog는 Animal 상속, speak()를 오버라이딩해서 "멍멍!"으로 끝나게
#   - Cat은 Animal 상속, speak()를 오버라이딩해서 "야옹!"으로 끝나게
#   - Dog("바둑이"), Cat("나비") 인스턴스 생성 후 speak() 호출

import robot

#-----------------------------------------
# [출력 결과]
# 바둑이: 멍멍!
# 나비: 야옹!
#-----------------------------------------

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

# 예외 처리 - 오류가 발생해도 프로그램이 멈추지 않게 합니다.
# try: 오류가 발생할 수 있는 구문
# except: 오류 발생 시 실행
# else: 오류가 없을 때 실행
# finally: 오류 여부와 관계없이 무조건 마지막에 실행

# try/except 기본 사용
try:
    4 / 0
except ZeroDivisionError as e:   # 0으로 나누는 오류 처리
    print(e)   # division by zero

# 여러 종류의 오류 처리하기
try:
    a = [1, 2]
    print(a[3])   # IndexError 발생
    4 / 0         # ZeroDivisionError 발생 (위에서 이미 오류가 발생하므로 실행 안 됨)
except ZeroDivisionError as e:
    print("0으로 나눌 수 없습니다.")
except IndexError as e:
    print("인덱싱 할 수 없습니다.")   # IndexError가 먼저 발생하므로 이것이 출력됩니다.

# try/else/finally 구조
try:
    result = 10 / 2
except ZeroDivisionError:
    print("오류 발생!")
else:
    print("오류 없음! 결과:", result)   # 오류가 없을 때만 실행
finally:
    print("항상 실행됩니다.")           # 오류 여부와 관계없이 항상 실행

# raise - 오류를 의도적으로 발생시킵니다.
class MyError(Exception):
    def __str__(self):
        return "허용되지 않는 별명입니다."

def say_nick(nick):
    if nick == '바보':
        raise MyError()   # MyError를 강제 발생
    print(nick)

try:
    say_nick("천사")
    say_nick("바보")
except MyError as e:
    print(e)

robot.say("예외 처리 완성!")`,
    practiceCode: `# 문제: try/except를 활용해서 안전한 나눗셈 함수를 만드세요.
# 조건:
#   - safe_divide(a, b): b가 0이면 ZeroDivisionError를 처리하고 None 반환
#   - safe_divide(10, 2)와 safe_divide(10, 0) 각각 호출
#   - 리스트 items = [1, 2, 3]에서 items[5]를 IndexError로 처리
#   - try/else/finally 구조를 모두 사용하세요

import robot

#-----------------------------------------
# [출력 결과]
# 10 / 2 = 5.0
# safe_divide 실행 완료
# 10 / 0: 0으로 나눌 수 없음
# safe_divide 실행 완료
# 인덱스 오류: list index out of range
#-----------------------------------------

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

# 내장 함수 - 파이썬에 기본으로 내장된 함수들입니다.

# filter(함수, 데이터): 함수 조건을 만족하는 데이터만 필터링합니다.
def positive(x):
    return x > 0   # 양수만 통과

print(list(filter(positive, [1, -3, 2, 0, -5, 6])))   # [1, 2, 6]

# map(함수, 데이터): 함수를 데이터의 각 요소에 적용합니다.
def two_times(x):
    return x * 2

print(list(map(two_times, [1, 2, 3, 4])))   # [2, 4, 6, 8]

# lambda와 함께 쓰면 더 간결합니다.
print(list(map(lambda x: x * 2, [1, 2, 3, 4])))          # [2, 4, 6, 8]
print(list(filter(lambda x: x > 0, [1, -3, 2, 0, -5, 6])))  # [1, 2, 6]

# zip: 여러 데이터의 같은 위치 요소를 묶으며, 가장 짧은 데이터가 끝나면 종료합니다.
print(list(zip([1, 2, 3], [4, 5, 6])))   # [(1,4), (2,5), (3,6)]
print(list(zip("abc", "def")))            # [('a','d'), ('b','e'), ('c','f')]

# 표준 라이브러리
import math
import random

print(math.gcd(60, 100, 80))   # 최대공약수: 20

print(random.random())          # 0~1 사이 실수
print(random.randint(1, 10))    # 1~10 사이 정수

data = [1, 2, 3, 4, 5]
print(random.choice(data))         # 리스트에서 무작위로 하나 선택
print(random.sample(data, 3))      # 리스트에서 3개 무작위 선택 (중복 없음)

robot.say("내장 함수 완성!")
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

#-----------------------------------------
# [출력 결과]
# 합격자 점수: [82, 67, 91, 76, 88]
# 보너스 적용: [85, 70, 94, 79, 91]
# 가: 45점 → 불합격
# 나: 82점 → 합격
# 다: 67점 → 합격
# 라: 91점 → 합격
# 마: 38점 → 불합격
# 바: 76점 → 합격
# 사: 88점 → 합격
# 최대공약수: 6
#-----------------------------------------

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

// ── Lv.3 데이터 분석 ──────────────────────────────────────────────────────────

export const CONCEPT_EXAMPLES_LV3: Record<number, CurriculumItem> = {
  31: {
    nameKo: "데이터 탐색",
    nameEn: "Data Exploration",
    explanation: "load_data()로 CSV 파일을 불러오고 head(), info(), describe()로 데이터의 구조와 통계를 파악해요.",
    exampleCode: `import pandas as pd

# 데이터 불러오기
df = load_data('titanic')

# 크기 확인
print(f"행: {df.shape[0]}개, 열: {df.shape[1]}개")

# 처음 5행 출력
print("\\n=== 처음 5행 ===")
print(df.head().to_string())

# 데이터 타입 및 결측치
print("\\n=== 컬럼 정보 ===")
df.info()

# 기술 통계량
print("\\n=== 기술 통계량 ===")
print(df.describe())
`,
    practiceCode: `import pandas as pd

# 🎯 도전! 아래 질문에 답해보세요.
df = load_data('titanic')

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 출력]
# 데이터 크기: (891, 12)
# 결측치: Age 177개, Cabin 687개, Embarked 2개 (나머지 0개)
# 나이 평균: 29.7
# 나이 최대: 80.0
#-----------------------------------------

# Q1. 데이터는 총 몇 행 몇 열인가요?
print("데이터 크기:", ___.___)

# Q2. 각 컬럼의 결측치는 몇 개인가요?
print("결측치:\\n", ___.___.___)

# Q3. 'Age' 컬럼의 평균과 최댓값은 얼마인가요?
print("나이 평균:", round(df['Age'].___(), 1))
print("나이 최대:", df['Age'].___())
`,
  },
  32: {
    nameKo: "상관관계 분석",
    nameEn: "Correlation Analysis",
    explanation: "변수 간의 상관계수를 계산하고 히트맵으로 시각화해요. 1에 가까울수록 양의 상관, -1에 가까울수록 음의 상관입니다.",
    exampleCode: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = load_data('titanic')

# 수치형 컬럼만 선택
numeric_df = df.select_dtypes(include=['number'])

print("=== 상관관계 행렬 ===")
print(numeric_df.corr().round(2).to_string())

# 히트맵 시각화
plt.figure(figsize=(8, 6))
sns.heatmap(
    numeric_df.corr(),
    annot=True, cmap='coolwarm',
    fmt='.2f', center=0, square=True,
    cbar_kws={'label': '상관계수'}
)
plt.title('변수 간 상관관계 히트맵')
plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

df = load_data('titanic')
numeric_df = df.select_dtypes(include=['number'])

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 출력]
# Survived와 각 숫자 열의 상관계수
# [그래프] Blues 색상의 상관관계 히트맵
#-----------------------------------------

# Q1. 'Survived' 자신을 제외하고 가장 연관성이 큰 변수는?
corr = numeric_df.corr()
survived_corr = corr['Survived'].drop('Survived')
order = survived_corr.abs().sort_values(ascending=False).index
print("Survived 상관계수:\\n", survived_corr.loc[order])

# Q2. 히트맵 색상을 'Blues'로 바꿔서 그려보세요
plt.figure(figsize=(8, 6))
sns.heatmap(
    numeric_df.corr(),
    annot=True, cmap=___,   # 'Blues'로 수정
    fmt='.2f', center=0, square=True
)
plt.title('상관관계 히트맵')
plt.tight_layout()
plt.show()
`,
  },
  33: {
    nameKo: "히스토그램",
    nameEn: "Histogram",
    explanation: "데이터의 분포를 히스토그램으로 시각화해요. bins 값을 조절해 막대 개수를 바꿀 수 있어요.",
    exampleCode: `import pandas as pd
import matplotlib.pyplot as plt

df = load_data('titanic')

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# 나이 분포
df['Age'].dropna().plot(
    kind='hist', bins=20, ax=axes[0],
    color='#7B5CF0', edgecolor='white', alpha=0.8
)
axes[0].set_title('나이 분포')
axes[0].set_xlabel('나이')
axes[0].set_ylabel('인원')

# 요금 분포
df['Fare'].plot(
    kind='hist', bins=30, ax=axes[1],
    color='#18C99A', edgecolor='white', alpha=0.8
)
axes[1].set_title('요금 분포')
axes[1].set_xlabel('요금')
axes[1].set_ylabel('인원')

plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
import matplotlib.pyplot as plt

df = load_data('titanic')

# 🎯 객실 등급(Pclass)별 요금(Fare) 분포를 히스토그램으로 그려보세요
# 힌트: Pclass 1, 2, 3을 각각 필터링 후 overlapping histogram

fig, ax = plt.subplots(figsize=(8, 5))

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 그래프]
# 1·2·3등급의 요금 분포가 겹쳐진 히스토그램
#-----------------------------------------

for pclass, color in zip([1, 2, 3], ['#7B5CF0', '#18C99A', '#FF5C8A']):
    df[df['Pclass'] == pclass]['Fare'].plot(
        kind='hist', bins=___, ax=ax,
        color=color, alpha=0.5, label=f'{pclass}등급'
    )

ax.set_title('객실 등급별 요금 분포')
ax.set_xlabel('요금')
ax.legend()
plt.tight_layout()
plt.show()
`,
  },
  34: {
    nameKo: "산점도",
    nameEn: "Scatter Plot",
    explanation: "두 수치형 변수의 관계를 산점도로 시각화해요. 색상을 통해 범주형 변수도 함께 표현할 수 있어요.",
    exampleCode: `import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

df = load_data('titanic')
df = df.dropna(subset=['Age', 'Fare'])

# 생존 여부에 따라 색상 구분
colors = df['Survived'].map({0: '#FF5C8A', 1: '#7B5CF0'})

plt.figure(figsize=(8, 5))
plt.scatter(df['Age'], df['Fare'], c=colors, alpha=0.5, s=30)
plt.title('나이 vs 요금 (색상: 생존여부)')
plt.xlabel('나이')
plt.ylabel('요금')
plt.legend(handles=[
    mpatches.Patch(color='#FF5C8A', label='사망'),
    mpatches.Patch(color='#7B5CF0', label='생존'),
])
plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

df = load_data('titanic')
df = df.dropna(subset=['Age', 'Fare'])

# 🎯 객실 등급(Pclass)에 따라 색상을 다르게 산점도를 그려보세요
#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 그래프]
# 나이와 요금의 관계를 객실 등급별 색상으로 구분한 산점도
#-----------------------------------------

color_map = {1: '#7B5CF0', 2: '#18C99A', 3: '#FF5C8A'}
colors = df['Pclass'].map(___)

plt.figure(figsize=(8, 5))
plt.scatter(df['Age'], df['Fare'], c=colors, alpha=0.5, s=30)
plt.title('나이 vs 요금 (색상: 객실등급)')
plt.xlabel('나이')
plt.ylabel('요금')
plt.legend(handles=[
    mpatches.Patch(color=c, label=f'{p}등급')
    for p, c in color_map.items()
])
plt.tight_layout()
plt.show()
`,
  },
  35: {
    nameKo: "박스플롯과 이상치",
    nameEn: "Boxplot & Outliers",
    explanation: "박스플롯으로 데이터 분포와 이상치를 확인해요. IQR 방법으로 이상치를 탐지하고 처리할 수 있어요.",
    exampleCode: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

df = load_data('titanic')

fig, axes = plt.subplots(1, 2, figsize=(10, 5))

sns.boxplot(
    data=df, x='Survived', y='Age',
    hue='Survived',
    palette={0: '#FF5C8A', 1: '#7B5CF0'},
    legend=False, ax=axes[0]
)
axes[0].set_title('생존 여부별 나이')
axes[0].set_xlabel('0=사망  1=생존')

sns.boxplot(
    data=df, x='Pclass', y='Fare',
    hue='Pclass',
    palette={1: '#FFC23C', 2: '#7B5CF0', 3: '#18C99A'},
    legend=False, ax=axes[1]
)
axes[1].set_title('객실 등급별 요금')
plt.tight_layout()
plt.show()

# IQR 이상치 탐지
col = df['Fare']
Q1, Q3 = col.quantile(0.25), col.quantile(0.75)
IQR = Q3 - Q1
outliers = df[(col < Q1 - 1.5*IQR) | (col > Q3 + 1.5*IQR)]
print(f"Fare 이상치: {len(outliers)}개 (전체의 {len(outliers)/len(df)*100:.1f}%)")
`,
    practiceCode: `import pandas as pd
import numpy as np

df = load_data('titanic')

# 🎯 Age 컬럼의 이상치를 IQR 방법으로 탐지하고
#    Winsorization(경계값으로 대체)을 적용해보세요

col = df['Age'].dropna()

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 출력]
# 하한: -6.7, 상한: 64.8
# 이상치 개수: 11개
# 원본 최댓값: 80.0
# 처리 후 최댓값: 64.8125
#-----------------------------------------

Q1 = col.quantile(___)   # 1사분위수
Q3 = col.quantile(___)   # 3사분위수
IQR = Q3 - Q1

lower = Q1 - 1.5 * IQR
upper = Q3 + 1.5 * IQR

print(f"하한: {lower:.1f}, 상한: {upper:.1f}")
print(f"이상치 개수: {((col < lower) | (col > upper)).sum()}개")

# Winsorization 적용
df['Age_clean'] = df['Age'].clip(lower=lower, upper=upper)
print(f"\\n원본 최댓값: {df['Age'].max()}")
print(f"처리 후 최댓값: {df['Age_clean'].max()}")
`,
  },
  36: {
    nameKo: "결측치 처리",
    nameEn: "Missing Value Handling",
    explanation: "isnull()로 결측치를 확인하고 fillna()로 채우거나 dropna()로 제거해요. 평균·중앙값·최빈값 중 상황에 맞는 방법을 선택하세요.",
    exampleCode: `import pandas as pd

df = load_data('titanic')

# 결측치 현황
print("=== 결측치 개수 ===")
print(df.isnull().sum())

print("\\n=== 결측치 비율(%) ===")
print((df.isnull().sum() / len(df) * 100).round(1))

# 결측치 처리
df_clean = df.copy()

# 중앙값으로 채우기 (수치형)
df_clean['Age'] = df_clean['Age'].fillna(df_clean['Age'].median())

# 최빈값으로 채우기 (범주형)
df_clean['Embarked'] = df_clean['Embarked'].fillna(
    df_clean['Embarked'].mode()[0]
)

# 결측치가 너무 많으면 컬럼 삭제
df_clean = df_clean.drop(columns=['Cabin'])

print("\\n=== 처리 후 결측치 ===")
print(df_clean.isnull().sum())
`,
    practiceCode: `import pandas as pd

df = load_data('titanic')
df_clean = df.copy()

# 🎯 아래 조건에 맞게 결측치를 처리해보세요

# Q1. Age 결측치를 평균값으로 채우세요 (힌트: .mean())
df_clean['Age'] = df_clean['Age'].fillna(___)

# Q2. Embarked 결측치를 최빈값으로 채우세요
df_clean['Embarked'] = df_clean['Embarked'].fillna(___)

# Q3. Cabin 컬럼은 결측치가 너무 많아요. 삭제해보세요
df_clean = df_clean.drop(columns=___)

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 출력]
# Cabin 열이 제거되고, 나머지 모든 열의 결측치가 0
#-----------------------------------------

print("처리 후 결측치:")
print(df_clean.isnull().sum())
`,
  },
  37: {
    nameKo: "인코딩",
    nameEn: "Encoding",
    explanation: "문자형 데이터를 숫자로 변환하는 인코딩이에요. 이진 범주형엔 Label Encoding, 다중 범주형엔 One-Hot Encoding을 사용해요.",
    exampleCode: `import pandas as pd
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df_enc = df[['Survived', 'Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']].copy()
df_enc['Age'] = df_enc['Age'].fillna(df_enc['Age'].median())
df_enc['Embarked'] = df_enc['Embarked'].fillna('S')
df_enc['TravelType'] = ((df_enc['SibSp'] + df_enc['Parch']) > 0).map({
    True: '가족 동반',
    False: '혼자'
})

# Label Encoding (이진: 가족 동반/혼자)
le = LabelEncoder()
df_enc['TravelType'] = le.fit_transform(df_enc['TravelType'])
print("여행 유형 매핑:", dict(zip(le.classes_, le.transform(le.classes_))))

# One-Hot Encoding (다중: 승선항)
df_enc = pd.get_dummies(df_enc, columns=['Embarked'], drop_first=True, dtype=int)

print("\\n=== 인코딩 완료 ===")
print(df_enc.head().to_string())
print("\\n컬럼:", df_enc.columns.tolist())
`,
    practiceCode: `import pandas as pd
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df_enc = df[['Survived', 'Pclass', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked']].copy()
df_enc['Age'] = df_enc['Age'].fillna(df_enc['Age'].median())
df_enc['Embarked'] = df_enc['Embarked'].fillna('S')
df_enc['TravelType'] = ((df_enc['SibSp'] + df_enc['Parch']) > 0).map({
    True: '가족 동반',
    False: '혼자'
})

#-----------------------------------------
# [출력 결과]
# [데이터에 따라 달라질 수 있는 출력]
# 여행 유형 매핑: {'가족 동반': 0, '혼자': 1}
# 인코딩 완료 컬럼: Survived, Pclass, Age, SibSp, Parch, Fare, TravelType, Embarked_Q, Embarked_S
#-----------------------------------------

# 🎯 TravelType 컬럼을 Label Encoding 하세요
le = ___()
df_enc['TravelType'] = le.fit_transform(___)
print("여행 유형 매핑:", dict(zip(le.classes_, le.transform(le.classes_))))

# 🎯 Embarked 컬럼을 One-Hot Encoding 하세요
df_enc = pd.get_dummies(df_enc, columns=___, drop_first=True, dtype=int)

print("인코딩 후 컬럼:", df_enc.columns.tolist())
`,
  },
  38: {
    nameKo: "회귀 분석",
    nameEn: "Regression",
    explanation: "연속형 값을 예측하는 회귀 분석이에요. 선형 회귀, 결정 트리, 랜덤 포레스트 회귀 모델을 비교해봐요.",
    exampleCode: `import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

# 요금(Fare) 예측: 생존 결과는 예측 입력에서 제외
X = df.drop(columns=['Fare', 'Survived'])
y = df['Fare']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

models = {
    '선형 회귀': LinearRegression(),
    '결정 트리': DecisionTreeRegressor(random_state=42),
    '랜덤 포레스트': RandomForestRegressor(n_estimators=100, random_state=42),
}

scores = {}
for name, m in models.items():
    m.fit(X_train, y_train)
    scores[name] = r2_score(y_test, m.predict(X_test))
    print(f"{name} R²: {scores[name]:.4f}")

plt.figure(figsize=(7, 4))
plt.bar(scores.keys(), scores.values(), color=['#7B5CF0', '#18C99A', '#FF5C8A'])
plt.title('회귀 모델 R² 비교')
plt.ylabel('R² Score')
plt.axhline(0, color='black', linewidth=0.8)
plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

#-----------------------------------------
# [출력 결과]
# [데이터와 라이브러리 버전에 따라 달라질 수 있는 출력]
# MAE: 약 20.81
# R²: 약 0.3999
#-----------------------------------------

# 🎯 Survived(생존여부)를 제외한 나머지로 Fare(요금)를 예측해보세요
X = df.drop(columns=[___, ___])   # 'Fare', 'Survived' 제거
y = df['Fare']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = LinearRegression()
model.fit(___, ___)   # 훈련

y_pred = model.predict(___)   # 예측

print(f"MAE: {mean_absolute_error(y_test, y_pred):.2f}")
print(f"R²: {r2_score(y_test, y_pred):.4f}")
`,
  },
  39: {
    nameKo: "분류 분석",
    nameEn: "Classification",
    explanation: "범주를 예측하는 분류 분석이에요. 거리 기반 KNN과 SVM에는 StandardScaler로 특성의 단위를 맞추고, 결정 트리·랜덤 포레스트와 결과를 비교해봐요.",
    exampleCode: `import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

X = df.drop(columns=['Survived'])
y = df['Survived']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

rf = RandomForestClassifier(n_estimators=100, random_state=42)
rf.fit(X_train, y_train)
y_pred = rf.predict(X_test)

print(f"랜덤 포레스트 정확도: {accuracy_score(y_test, y_pred):.4f}")

plt.figure(figsize=(5, 4))
sns.heatmap(
    confusion_matrix(y_test, y_pred),
    annot=True, fmt='d', cmap='Purples'
)
plt.title('Confusion Matrix')
plt.xlabel('예측값')
plt.ylabel('실제값')
plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

X = df.drop(columns=['Survived'])
y = df['Survived']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

#-----------------------------------------
# [출력 결과]
# [데이터와 라이브러리 버전에 따라 달라질 수 있는 출력]
# KNN 정확도: 약 0.8156
# 분류 리포트: precision, recall, f1-score, support
#-----------------------------------------

# 🎯 KNN 모델로 생존 여부를 예측해보세요 (n_neighbors=5)
model = make_pipeline(
    StandardScaler(),
    KNeighborsClassifier(n_neighbors=___)
)
model.fit(___, ___)
y_pred = model.predict(___)

print(f"KNN 정확도: {accuracy_score(y_test, y_pred):.4f}")
print("\\n분류 리포트:")
print(classification_report(y_test, y_pred))
`,
  },
  40: {
    nameKo: "모델 성능 비교",
    nameEn: "Model Comparison",
    explanation: "여러 분류 모델의 정확도를 한눈에 비교해요. 단위에 민감한 모델은 StandardScaler를 적용해 같은 조건에서 비교하고, 데이터에 맞는 모델을 찾아봐요.",
    exampleCode: `import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

X = df.drop(columns=['Survived'])
y = df['Survived']
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

models = {
    '로지스틱 회귀': make_pipeline(
        StandardScaler(), LogisticRegression(max_iter=200)
    ),
    '결정 트리':     DecisionTreeClassifier(random_state=42),
    '랜덤 포레스트': RandomForestClassifier(n_estimators=100, random_state=42),
    'KNN':           make_pipeline(
        StandardScaler(), KNeighborsClassifier(n_neighbors=5)
    ),
    'SVM':           make_pipeline(
        StandardScaler(), SVC(random_state=42)
    ),
}

results = {}
for name, m in models.items():
    m.fit(X_train, y_train)
    results[name] = accuracy_score(y_test, m.predict(X_test))
    print(f"{name}: {results[name]:.4f}")

colors = ['#7B5CF0', '#18C99A', '#FF5C8A', '#FFC23C', '#4F8EF7']
plt.figure(figsize=(9, 5))
plt.bar(results.keys(), results.values(), color=colors)
plt.ylim(0, 1)
plt.title('분류 모델 정확도 비교')
plt.ylabel('정확도 (Accuracy)')
plt.xticks(rotation=15)
plt.axhline(y=0.8, color='red', linestyle='--', alpha=0.5, label='0.8 기준선')
plt.legend()
plt.tight_layout()
plt.show()
`,
    practiceCode: `import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

df = load_data('titanic')
df = df.drop(columns=['PassengerId', 'Name', 'Ticket', 'Cabin'], errors='ignore')
df['Age'] = df['Age'].fillna(df['Age'].median())
df['Embarked'] = df['Embarked'].fillna('S')
df['Sex'] = LabelEncoder().fit_transform(df['Sex'])
df = pd.get_dummies(df, columns=['Embarked'], drop_first=True, dtype=int)
df = df.dropna()

X = df.drop(columns=['Survived'])
y = df['Survived']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# 🎯 n_estimators 값을 바꿔가며 랜덤 포레스트 성능을 비교해보세요
results = {}

#-----------------------------------------
# [출력 결과]
# [데이터와 라이브러리 버전에 따라 달라질 수 있는 출력]
# n_estimators=10: 약 0.7710
# n_estimators=50: 약 0.8156
# n_estimators=100: 약 0.8045
# n_estimators=200: 약 0.8156
# [그래프] n_estimators에 따른 정확도 변화
#-----------------------------------------

for n in [10, 50, 100, 200]:
    m = RandomForestClassifier(n_estimators=___, random_state=42)
    m.fit(X_train, y_train)
    results[f'n={n}'] = accuracy_score(y_test, m.predict(X_test))
    print(f"n_estimators={n}: {results[f'n={n}']:.4f}")

plt.figure(figsize=(7, 4))
plt.plot(list(results.keys()), list(results.values()), 'o-', color='#7B5CF0', linewidth=2)
plt.title('n_estimators에 따른 정확도 변화')
plt.ylabel('정확도')
plt.tight_layout()
plt.show()
`,
  },
};

export const BADGE_METADATA_LV3 = [
  { conceptId: 31, nameKo: "탐색가",     iconName: "Search",    colorClass: "text-teal-600" },
  { conceptId: 32, nameKo: "상관분석가", iconName: "BarChart2", colorClass: "text-indigo-600" },
  { conceptId: 33, nameKo: "시각화 I",   iconName: "BarChart2", colorClass: "text-violet-600" },
  { conceptId: 34, nameKo: "시각화 II",  iconName: "TrendingUp", colorClass: "text-blue-600" },
  { conceptId: 35, nameKo: "이상치 탐정", iconName: "AlertCircle", colorClass: "text-orange-600" },
  { conceptId: 36, nameKo: "정제사",     iconName: "Filter",    colorClass: "text-green-600" },
  { conceptId: 37, nameKo: "인코더",     iconName: "Binary",    colorClass: "text-cyan-600" },
  { conceptId: 38, nameKo: "회귀 분석가", iconName: "TrendingUp", colorClass: "text-rose-600" },
  { conceptId: 39, nameKo: "분류 전문가", iconName: "Cpu",       colorClass: "text-purple-600" },
  { conceptId: 40, nameKo: "ML 마스터",  iconName: "Award",     colorClass: "text-amber-600" },
];

export const UNIT_GROUPS_LV3 = [
  { label: "데이터 탐색",  icon: "BarChart2",   color: "#0D9488", ids: [31, 32] },
  { label: "시각화",       icon: "TrendingUp",  color: "#2563EB", ids: [33, 34, 35] },
  { label: "전처리",       icon: "Filter",      color: "#D97706", ids: [36, 37] },
  { label: "기계학습",     icon: "Cpu",         color: "#7B5CF0", ids: [38, 39, 40] },
];
