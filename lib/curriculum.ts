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
  1: {
    nameKo: "출력",
    nameEn: "print",
    exampleCode: `import robot

# 숫자, 실수, 문자열 출력
print(123)
print(456.789)
print("안녕하세요")

# 콤마(,)로 여러 값 출력, *로 반복
print("강아지가", "멍" * 3)
print("1 + 2 =", 1 + 2)

robot.say("print()로 뭐든 출력해봐!")
robot.emotion("happy")`,
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
score = 95

print("이름:", name)
print("점수:", score)
print("2배 점수:", score * 2)
print(name, "씨의 점수는", score, "점입니다.")

robot.say(f"이름은 {name}이고 점수는 {score}점!")`,
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

print("a + b =", a + b)    # 덧셈: 10
print("a - b =", a - b)    # 뺄셈: 4
print("a * b =", a * b)    # 곱셈: 21
print("a / b =", a / b)    # 나눗셈: 2.333...
print("a ** b =", a ** b)  # 거듭제곱: 343
print("a // b =", a // b)  # 몫: 2
print("a % b =", a % b)    # 나머지: 1

robot.move(a + b)
robot.say(f"7 + 3 = {a + b}!")`,
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

print("a == b:", a == b)   # 같다
print("a != b:", a != b)   # 다르다
print("a > b:", a > b)     # 크다
print("a < b:", a < b)     # 작다
print("a >= b:", a >= b)   # 크거나 같다
print("a <= b:", a <= b)   # 작거나 같다

# 문자열 비교 (알파벳 순)
print("apple < banana:", "apple" < "banana")

if a > b:
    robot.emotion("happy")
    robot.say(f"{a} > {b} 이므로 참(True)!")`,
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

a = 0
print("시작:", a)

a = a + 7
print("a = a + 7 →", a)

a += 2      # a = a + 2
print("a += 2 →", a)
a -= 3      # a = a - 3
print("a -= 3 →", a)
a *= 4      # a = a * 4
print("a *= 4 →", a)
a /= 6      # a = a / 6
print("a /= 6 →", a)

robot.say(f"최종값: {a}")`,
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

print("a % 2 == 0:", a % 2 == 0)  # True (2의 배수)
print("a % 3 == 0:", a % 3 == 0)  # True (3의 배수)
print("a % 4 == 0:", a % 4 == 0)  # False (4의 배수 아님)

print("2의배수 and 3의배수:", a % 2 == 0 and a % 3 == 0)  # True
print("2의배수 and 4의배수:", a % 2 == 0 and a % 4 == 0)  # False
print("2의배수 or 4의배수:", a % 2 == 0 or a % 4 == 0)    # True
print("not (2의배수):", not (a % 2 == 0))                  # False

if a % 2 == 0 and a % 3 == 0:
    robot.say(f"{a}은 2와 3의 공배수!")
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

print("절대값:", abs(-12.34))
print("올림:", math.ceil(3.14))
print("내림:", math.floor(3.14))
print("반올림:", round(3.1415926535, 2))
print("실수→정수:", int(12.34))
print("문자→정수:", int("123"))

rand_val = random.randint(1, 5)
print("랜덤 정수(1~5):", rand_val)
print("랜덤 실수(0~1):", round(random.random(), 3))

robot.move(rand_val)
robot.say(f"랜덤으로 {rand_val}칸 이동!")`,
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

text = "안녕하세요"
print("전체:", text)
print("첫 글자:", text[0])
print("뒤에서 두번째:", text[-2])
print("3~4번째:", text[2:4])
print("중간:", text[1:-1])

name = "앨리스"
age = 30
print("% 방식:", "이름은 %s이고 나이는 %d입니다." % (name, age))
print("format():", "이름은 {}이고 나이는 {}입니다.".format(name, age))
print("f-string:", f"이름은 {name}이고 나이는 {age}입니다.")

robot.say(f"{text[0:3]}!")`,
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

subject = ["국어", "영어", "수학", "정보"]
score = [95, 87, 91, 100]

print("과목:", subject)
print("점수:", score)
print("정보 인덱스:", subject.index("정보"))
print("첫번째 점수:", score[0])
print("정보 점수:", score[subject.index("정보")])
print("리스트 길이:", len(subject))

for title in subject:
    print(title, ":", score[subject.index(title)])

robot.say(f"총 {len(subject)}과목!")`,
    explanation: "리스트는 여러 값을 순서대로 저장합니다. 인덱스로 값을 꺼내고, for문으로 모든 요소를 순회할 수 있어요.",
    practiceCode: `# 문제: 친구들의 점수 리스트를 만들어 최고점을 찾으세요.
# 조건:
#   - names = ["민준", "서연", "지호", "하은"]
#   - scores = [88, 95, 72, 91]
#   - for문으로 각 이름과 점수를 "민준: 88점" 형태로 출력하세요
#   - max()로 최고 점수를 구하고, 로봇이 말하게 하세요

import robot

names = ["민준", "서연", "지호", "하은"]
scores = [88, 95, 72, 91]

for i in range(len(names)):
    print(f"{names[i]}: {scores[i]}점")

best = max(scores)
print("최고 점수:", best)

robot.say(f"최고점은 {best}점!")
robot.dance()`,
  },
  10: {
    nameKo: "불리언",
    nameEn: "boolean",
    exampleCode: `import robot

print(True)
print(False)
print(3 > 2)
print(bool(1))
print(bool(0))
print(bool("a"))
print(bool(""))

isDoorOpen = False
isUserHasKey = True

print("자료형:", type(isDoorOpen))
print("문 열림:", isDoorOpen)
print("키 소유:", isUserHasKey)
print("문 열리고 키 있음:", isDoorOpen and isUserHasKey)
print("문 안열리고 키 있음:", not isDoorOpen and isUserHasKey)

if not isDoorOpen and isUserHasKey:
    robot.say("열쇠로 문을 열어!")
    robot.emotion("happy")`,
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
print("점수:", score)

if score >= 90:
    print("A등급")
    robot.emotion("happy")
    robot.jump()
    robot.say("A등급! 최고야!")
elif score >= 80:
    print("B등급")
    robot.emotion("happy")
    robot.say("B등급! 잘했어!")
elif score >= 70:
    print("C등급")
    robot.say("C등급! 조금만 더!")
else:
    print("D등급")
    robot.emotion("sad")
    robot.say("더 노력하자!")`,
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

if color == "red":
    robot.say("정지!")
    robot.emotion("sad")
elif color == "yellow":
    robot.say("준비!")
    robot.emotion("happy")
elif color == "green":
    robot.move(2)
    robot.say("출발!")
else:
    robot.say("모르는 색이야!")`,
  },
  12: {
    nameKo: "for 반복문",
    nameEn: "for_loop",
    exampleCode: `import robot

# 1~10 홀짝 판별
for num in range(1, 11):
    if num % 2 == 0:
        print(num, "은 짝수")
    else:
        print(num, "은 홀수")

# 역순 카운트다운
for i in range(5, 0, -1):
    print(i)
robot.say("발사!")
robot.dance()`,
    explanation: "for문은 반복 횟수가 정해진 반복에 씁니다. range(시작, 끝, 간격)으로 반복 범위를 설정해요.",
    practiceCode: `# 문제: for문으로 구구단 한 단을 출력하세요.
# 조건:
#   - dan = 3 으로 설정 (원하는 단으로 바꿔도 됩니다)
#   - range(1, 10)으로 1~9까지 반복
#   - "3 x 1 = 3" 형태로 출력하세요
#   - 완료 후 로봇이 댄스하게 하세요

import robot

dan = 3

for i in range(1, 10):
    print(f"{dan} x {i} = {dan * i}")

robot.say(f"{dan}단 완성!")
robot.dance()`,
  },
  13: {
    nameKo: "while 반복문",
    nameEn: "while_loop",
    exampleCode: `import robot

num = 2
goal = 1000

while True:
    print(num)
    if num > goal:
        break
    num *= 2

print("반복 끝!")
print(goal, "보다 크면서 가장 작은 2의 거듭제곱:", num)

robot.say(f"2를 계속 곱해서 {num}!")
robot.dance()`,
    explanation: "while문은 조건이 참인 동안 계속 반복합니다. break로 즉시 탈출할 수 있어요.",
    practiceCode: `# 문제: while문으로 1부터 시작해 누적 합이 50을 넘을 때까지 더하세요.
# 조건:
#   - total = 0, num = 1 로 시작
#   - total <= 50 인 동안 num을 더하고, num은 1씩 증가
#   - 완료 후 total과 마지막 num을 출력하고 로봇이 말하게 하세요

import robot

total = 0
num = 1

while total <= 50:
    total += num
    num += 1

print("누적 합:", total)
print("마지막 숫자:", num - 1)

robot.say(f"합계: {total}!")
robot.dance()`,
  },
  14: {
    nameKo: "함수",
    nameEn: "function",
    exampleCode: `import robot

def say(num):
    print(num, "번 손님, 안녕하세요.")

say(1)
say(2)
say(3)

def greet(name):
    return f"안녕하세요, {name}님!"

print(greet("홍길동"))
print(greet("이순신"))

def score_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    else:
        return "C"

result = score_grade(85)
robot.say(f"85점은 {result}등급!")`,
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

class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print("Woof!")

my_dog1 = Dog("Buddy", "Golden Retriever")
my_dog2 = Dog("Coco", "Poodle")

print(my_dog1.name, my_dog1.breed)
print(my_dog2.name, my_dog2.breed)
my_dog1.bark()
my_dog2.bark()

robot.say(f"{my_dog1.name}이 짖어!")
robot.clone()`,
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
import math
import random
import keyword as k

print("파이:", math.pi)
print("팩토리얼(5!):", math.factorial(5))
print("제곱근:", math.sqrt(16))

print("랜덤 정수(1~10):", random.randint(1, 10))
print("로또 6개:", random.sample(range(1, 46), 6))

print("파이썬 예약어 수:", len(k.kwlist))

rand_move = random.randint(1, 4)
robot.move(rand_move)
robot.say(f"랜덤으로 {rand_move}칸 이동!")`,
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

# 세 가지 숫자 자료형
a = 5         # int (정수)
b = 3.14      # float (실수)
c = 2 + 3j    # complex (복소수)

print("a:", a, "→ 자료형:", type(a))
print("b:", b, "→ 자료형:", type(b))
print("c:", c, "→ 자료형:", type(c))

# 산술 연산
print("5 + 3 =", a + 3)
print("5 ** 2 =", a ** 2)  # 거듭제곱
print("5 // 2 =", a // 2)  # 몫
print("5 % 2 =", a % 2)    # 나머지

robot.say(f"5의 제곱은 {a**2}!")
robot.move(a % 3 + 1)`,
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

# 이스케이프 코드
print("첫째 줄\\n둘째 줄")      # \\n: 줄바꿈
print("이름\\t나이")             # \\t: 탭

a = "Python is the best choice"

# 문자열 메서드
print("find('b'):", a.find('b'))         # 처음 나오는 위치
print("count('e'):", a.count('e'))       # 개수 세기
print("upper:", a.upper())               # 대문자
print("replace:", a.replace("Python", "파이썬"))  # 치환
print("split:", a.split())               # 공백으로 나누기

b = "   hello   "
print("strip:", b.strip())               # 양쪽 공백 제거

robot.say("문자열 마스터!")
robot.emotion("happy")`,
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
print("원본:", a)

a.append(7)          # 맨 뒤에 추가
print("append(7):", a)

a.sort()             # 오름차순 정렬
print("sort:", a)

a.reverse()          # 역순
print("reverse:", a)

a.insert(0, 100)     # 0번 위치에 100 삽입
print("insert(0,100):", a)

a.remove(1)          # 첫 번째 1 삭제
print("remove(1):", a)

popped = a.pop()     # 마지막 요소 꺼내기
print("pop:", popped, "→ 남은 리스트:", a)

robot.say(f"리스트 길이: {len(a)}")`,
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

# 튜플 정의
t1 = (1, 2, 3)
t2 = ('a', 'b', 'c')
t3 = (1,)          # 요소가 1개일 때는 쉼표 필요

print("t1:", t1)
print("t2:", t2)
print("t3:", t3)
print("t1[0]:", t1[0])     # 인덱싱
print("t1+t2:", t1 + (4, 5))  # 튜플 더하기

# 튜플 언패킹
a, b, c = t1
print("언패킹:", a, b, c)

# 여러 값을 반환하는 함수는 튜플로 반환됨
def min_max(lst):
    return min(lst), max(lst)

result = min_max([3, 1, 4, 1, 5, 9])
print("최솟값, 최댓값:", result)

robot.say(f"최댓값은 {result[1]}!")`,
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

print("이름:", person['name'])
print("나이:", person['age'])
print("keys:", list(person.keys()))
print("values:", list(person.values()))
print("items:", list(person.items()))

# 값 추가 및 수정
person['grade'] = 1
person['score'] = 98
print("수정 후:", person)

# get() - 없는 key도 안전하게 접근
print("email:", person.get('email', '없음'))

# in 으로 key 확인
print("'name' in person:", 'name' in person)

robot.say(f"{person['name']}의 점수: {person['score']}!")`,
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

print("s1:", s1)
print("s2:", s2)
print("교집합:", s1 & s2)    # 공통 원소
print("합집합:", s1 | s2)    # 모든 원소
print("차집합:", s1 - s2)    # s1에만 있는 원소

# 중복 제거에 활용
numbers = [1, 2, 2, 3, 3, 3, 4]
unique = set(numbers)
print("중복 제거:", unique)

# 메서드
s = {1, 2, 3}
s.add(4)
print("add(4):", s)
s.remove(2)
print("remove(2):", s)

robot.say(f"교집합: {s1 & s2}")`,
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

# 대입 - 같은 주소 공유
a = [1, 2, 3]
b = a              # b는 a와 같은 리스트를 가리킴
b.append(4)
print("a:", a)     # a도 변함!
print("b:", b)
print("같은 객체?", a is b)

# 슬라이싱으로 복사 - 독립적인 새 리스트
a = [1, 2, 3]
c = a[:]           # 전체 슬라이싱 = 복사
c.append(4)
print("a:", a)     # a는 그대로
print("c:", c)
print("같은 객체?", a is c)

# copy 모듈 사용
from copy import copy
d = copy(a)
d.append(5)
print("a:", a)
print("d:", d)

robot.say("복사 완료!")`,
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

# in / not in 으로 포함 여부 확인
if 'money' in pocket:
    print("돈이 있다!")
    robot.emotion("happy")
else:
    print("돈이 없다!")
    robot.emotion("sad")

# 여러 조건 조합
card = True
if 'money' in pocket or card:
    print("교통수단 이용 가능")
    robot.move(2)

# pass - 빈 블록
if 'ticket' in pocket:
    pass  # 나중에 처리할 것
else:
    print("티켓이 없어요")

# 조건부 표현식 (삼항 연산)
score = 85
grade = "합격" if score >= 60 else "불합격"
print(f"점수 {score}: {grade}")
robot.say(grade)`,
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

# continue - 특정 값 건너뛰기
print("홀수만 출력:")
for i in range(1, 11):
    if i % 2 == 0:
        continue
    print(i, end=" ")
print()

# 중첩 for - 구구단 일부
print("2단~3단:")
for i in range(2, 4):
    for j in range(1, 6):
        print(f"{i}×{j}={i*j}", end="  ")
    print()

# 리스트 내포 (list comprehension)
numbers = [1, 2, 3, 4, 5]
squares = [n ** 2 for n in numbers]
print("제곱:", squares)

evens = [n for n in range(1, 11) if n % 2 == 0]
print("짝수:", evens)

robot.say(f"짝수 개수: {len(evens)}")
robot.dance()`,
    practiceCode: `# 문제: 리스트 내포와 중첩 for문을 사용하세요.
# 조건:
#   - 1~20 중 3의 배수를 리스트 내포로 만들어 출력하세요
#   - 위 리스트의 각 요소를 2배 한 새 리스트를 만드세요
#   - for문으로 i=1~3, j=1~3인 (i, j) 쌍을 모두 출력하세요
#   - 로봇이 3의 배수 개수를 말하게 하세요

import robot

multiples_of_3 = [n for n in range(1, 21) if n % 3 == 0]
print("3의 배수:", multiples_of_3)

doubled = [n * 2 for n in multiples_of_3]
print("2배:", doubled)

for i in range(1, 4):
    for j in range(1, 4):
        print(f"({i},{j})", end=" ")
    print()

robot.say(f"3의 배수 {len(multiples_of_3)}개!")
robot.dance()`,
  },
  26: {
    nameKo: "while 반복문 심화",
    nameEn: "while_advanced",
    explanation: "break로 반복문을 즉시 탈출하고, continue로 현재 회차를 건너뜁니다. while True 패턴으로 조건 기반 반복을 제어합니다.",
    exampleCode: `import robot

# break - 특정 조건에서 즉시 탈출
coffee = 5
count = 0
while True:
    count += 1
    coffee -= 1
    print(f"{count}번째 커피 제공. 남은 커피: {coffee}개")
    if coffee == 0:
        print("커피 소진!")
        break

# continue - 특정 조건 건너뛰기
print("\\n홀수만:")
n = 0
while n < 10:
    n += 1
    if n % 2 == 0:
        continue
    print(n, end=" ")
print()

# 1부터 더해서 100 넘는 순간 출력
total = 0
num = 1
while total <= 100:
    total += num
    num += 1
print(f"\\n합계가 100을 처음 넘은 값: {total} (num={num-1})")

robot.say(f"합계 {total}!")
robot.dance()`,
    practiceCode: `# 문제: break와 continue를 활용하세요.
# 조건:
#   - 1부터 시작해서 5의 배수가 나오면 break로 멈추세요
#   - break 전까지의 숫자와 합을 출력하세요
#   - 1~20에서 3의 배수는 continue로 건너뛰고 나머지를 출력하세요

import robot

# break 문제
i = 0
total = 0
while True:
    i += 1
    if i % 5 == 0:
        print(f"5의 배수 {i} 발견! 중단")
        break
    total += i
    print(i, end=" ")
print(f"\\nbreak 전 합계: {total}")

# continue 문제
print("\\n3의 배수 제외:")
n = 0
while n < 20:
    n += 1
    if n % 3 == 0:
        continue
    print(n, end=" ")
print()

robot.say(f"합계: {total}")`,
  },
  27: {
    nameKo: "함수 심화",
    nameEn: "function_advanced",
    explanation: "*args로 개수가 변하는 인수를, **kwargs로 키워드 인수를 받습니다. lambda는 간단한 함수를 한 줄로 쓰는 방법이고, global로 함수 안에서 전역 변수를 수정합니다.",
    exampleCode: `import robot

# *args - 여러 인수를 튜플로 받기
def add_many(*args):
    return sum(args)

print("합:", add_many(1, 2, 3))
print("합:", add_many(1, 2, 3, 4, 5))

# **kwargs - 키워드 인수를 딕셔너리로 받기
def print_info(**kwargs):
    for k, v in kwargs.items():
        print(f"  {k}: {v}")

print_info(name="홍길동", age=17, score=95)

# lambda - 한 줄 함수
square = lambda x: x ** 2
print("3의 제곱:", square(3))

nums = [3, 1, 4, 1, 5, 9]
print("최댓값:", max(nums, key=lambda x: x))
print("정렬:", sorted(nums, key=lambda x: -x))

# global
score = 0
def score_up():
    global score
    score += 10

score_up()
score_up()
print("점수:", score)

robot.say(f"점수: {score}점!")`,
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

# 부모 클래스
class Character:
    species = "인간"  # 클래스 변수 (모든 인스턴스 공유)

    def __init__(self, name, hp):
        self.name = name
        self.hp = hp

    def attack(self):
        print(f"{self.name}: 공격!")

# 자식 클래스 - 상속
class Warrior(Character):
    def __init__(self, name):
        super().__init__(name, hp=200)  # 부모 생성자 호출

    def attack(self):  # 메서드 오버라이딩
        print(f"{self.name}: 강력한 일격!")

class Archer(Character):
    def __init__(self, name):
        super().__init__(name, hp=120)

    def attack(self):
        print(f"{self.name}: 화살 발사!")

w = Warrior("전사")
a = Archer("궁수")

print(w.species, w.name, w.hp)
print(a.species, a.name, a.hp)
w.attack()
a.attack()

Character.species = "영웅"  # 클래스 변수 변경
print("전사 species:", w.species)
print("궁수 species:", a.species)

robot.say(f"{w.name} HP: {w.hp}")
robot.clone()`,
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

# 기본 try/except
try:
    result = 10 / 0
except ZeroDivisionError as e:
    print("오류 발생:", e)

# 여러 오류 처리
a = [1, 2, 3]
try:
    print(a[10])
    print(10 / 0)
except IndexError as e:
    print("인덱스 오류:", e)
except ZeroDivisionError as e:
    print("0 나누기 오류:", e)

# else, finally
try:
    x = int("123")
except ValueError:
    print("숫자가 아닙니다")
else:
    print("변환 성공:", x)
finally:
    print("항상 실행됨")

# 사용자 정의 예외
class ScoreError(Exception):
    def __str__(self):
        return "점수는 0~100 사이여야 합니다"

def check_score(s):
    if not 0 <= s <= 100:
        raise ScoreError()
    return s

try:
    check_score(150)
except ScoreError as e:
    print(e)
    robot.emotion("sad")

check_score(85)
robot.say("점수 정상!")
robot.emotion("happy")`,
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
from datetime import date

# filter - 조건에 맞는 것만 추출
nums = [1, -3, 2, 0, -5, 6]
positives = list(filter(lambda x: x > 0, nums))
print("양수만:", positives)

# map - 모든 요소에 함수 적용
doubled = list(map(lambda x: x * 2, positives))
print("2배:", doubled)

# zip - 두 리스트를 묶기
names = ["민준", "서연", "지호"]
scores = [88, 95, 72]
for name, score in zip(names, scores):
    print(f"{name}: {score}점")

# math
print("최대공약수:", math.gcd(60, 100, 80))
print("π:", round(math.pi, 4))

# random
print("로또:", sorted(random.sample(range(1, 46), 6)))

# date
d1 = date(2025, 3, 1)
d2 = date(2025, 6, 25)
print("D-day:", (d2 - d1).days, "일")

robot.say("라이브러리 활용 완료!")
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
  { label: "자료형", emoji: "📦", ids: [1, 2, 7, 8, 9, 10] },
  { label: "연산자", emoji: "🔢", ids: [3, 4, 5, 6] },
  { label: "제어문", emoji: "🔀", ids: [11, 12, 13] },
  { label: "함수/클래스", emoji: "⚙️", ids: [14, 15, 16] },
];

export const UNIT_GROUPS_LV2 = [
  { label: "자료형(심화)", emoji: "📦", ids: [17, 18, 19, 20, 21, 22, 23] },
  { label: "제어문(심화)", emoji: "🔀", ids: [24, 25, 26] },
  { label: "함수/클래스(심화)", emoji: "⚙️", ids: [27, 28] },
  { label: "예외처리/라이브러리", emoji: "🛡️", ids: [29, 30] },
];
