export interface ConceptExample {
  nameKo: string;
  nameEn: string;
  exampleCode: string;
  explanation: string;
  practiceCode: string;
}

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
