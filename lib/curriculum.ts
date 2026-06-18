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
    exampleCode: `print(123)
print("안녕하세요")
print("강아지가", "멍" * 3)
print("2 + 3 =", 2 + 3)`,
    explanation: "print() 함수로 화면에 값을 출력합니다.",
  },
  2: {
    nameKo: "변수",
    nameEn: "variable",
    exampleCode: `score = 95
name = "홍길동"
print("이름:", name)
print("점수:", score)
print("2배 하면", score * 2, "점입니다.")`,
    explanation: "변수에 값을 저장하고 다시 사용합니다.",
  },
  3: {
    nameKo: "산술 연산자",
    nameEn: "arithmetic_operator",
    exampleCode: `a = 7
b = 3
print("a + b =", a + b)
print("a - b =", a - b)
print("a * b =", a * b)
print("a / b =", a / b)
print("a ** b =", a ** b)
print("a // b =", a // b)
print("a % b =", a % b)`,
    explanation: "+, -, *, /, //, %, ** 연산자를 사용합니다.",
  },
  4: {
    nameKo: "비교 연산자",
    nameEn: "comparison_operator",
    exampleCode: `a = 7
b = 3
print("a == b:", a == b)
print("a != b:", a != b)
print("a > b:", a > b)
print("a < b:", a < b)
print("a >= b:", a >= b)
print("a <= b:", a <= b)`,
    explanation: "==, !=, >, <, >=, <= 연산자로 두 값을 비교합니다.",
  },
  5: {
    nameKo: "할당 연산자",
    nameEn: "assignment_operator",
    exampleCode: `a = 0
print("시작:", a)
a += 7
print("+=7 후:", a)
a -= 3
print("-=3 후:", a)
a *= 2
print("*=2 후:", a)
a /= 4
print("/=4 후:", a)`,
    explanation: "+=, -=, *=, /= 연산자로 값을 쉽게 변경합니다.",
  },
  6: {
    nameKo: "논리 연산자",
    nameEn: "logical_operator",
    exampleCode: `a = 6
print(a % 2 == 0)
print(a % 3 == 0)
print(a % 2 == 0 and a % 3 == 0)
print(a % 2 == 0 or a % 4 == 0)
print(not (a % 2 == 0))`,
    explanation: "and, or, not 연산자로 여러 조건을 결합합니다.",
  },
  7: {
    nameKo: "숫자형",
    nameEn: "number_type",
    exampleCode: `import math
import random

print("절대값:", abs(-12.34))
print("올림:", math.ceil(3.14))
print("내림:", math.floor(3.14))
print("반올림:", round(3.1415926535, 2))
print("랜덤 정수:", random.randint(1, 10))`,
    explanation: "math, random 모듈로 다양한 수학 연산을 합니다.",
  },
  8: {
    nameKo: "문자형",
    nameEn: "string_type",
    exampleCode: `text = "안녕하세요"
print(text[0])
print(text[-1])
print(text[1:4])

name = "앨리스"
age = 16
print(f"이름은 {name}이고, 나이는 {age}살입니다.")`,
    explanation: "문자열 인덱싱, 슬라이싱, f-string을 사용합니다.",
  },
  9: {
    nameKo: "리스트",
    nameEn: "list",
    exampleCode: `subject = ["국어", "영어", "수학", "정보"]
score = [95, 87, 91, 100]

print(subject)
print(score[0])
print(len(subject))

for title in subject:
    print(title, ":", score[subject.index(title)])`,
    explanation: "리스트로 여러 값을 묶고 반복문과 함께 사용합니다.",
  },
  10: {
    nameKo: "불리언",
    nameEn: "boolean",
    exampleCode: `print(True)
print(False)
print(bool(1))
print(bool(0))
print(bool("hello"))

isDoorOpen = False
isUserHasKey = True
print("문 열림:", isDoorOpen)
print("키 있음:", isUserHasKey)
print("들어갈 수 있나:", not isDoorOpen and isUserHasKey)`,
    explanation: "True/False 값으로 논리 상태를 표현합니다.",
  },
  11: {
    nameKo: "조건문",
    nameEn: "conditional",
    exampleCode: `score = 85
if score >= 90:
    print("A 등급")
elif score >= 80:
    print("B 등급")
elif score >= 70:
    print("C 등급")
else:
    print("D 등급")`,
    explanation: "if/elif/else로 조건에 따라 다른 코드를 실행합니다.",
  },
  12: {
    nameKo: "for 반복문",
    nameEn: "for_loop",
    exampleCode: `for num in range(1, 6):
    if num % 2 == 0:
        print(num, "은 짝수")
    else:
        print(num, "은 홀수")`,
    explanation: "for 문으로 정해진 횟수만큼 반복합니다.",
  },
  13: {
    nameKo: "while 반복문",
    nameEn: "while_loop",
    exampleCode: `num = 2
goal = 100

while True:
    print(num)
    if num > goal:
        break
    num *= 2

print("종료! 가장 작은 2의 제곱수:", num)`,
    explanation: "while 문으로 조건이 참인 동안 반복합니다.",
  },
  14: {
    nameKo: "함수",
    nameEn: "function",
    exampleCode: `def greet(name):
    print(name, "님 안녕하세요!")

def add(a, b):
    return a + b

greet("홍길동")
greet("이순신")

result = add(3, 7)
print("3 + 7 =", result)`,
    explanation: "def로 함수를 정의하고 여러 번 호출합니다.",
  },
  15: {
    nameKo: "클래스",
    nameEn: "class",
    exampleCode: `class Character:
    def __init__(self, name, hp, power):
        self.name = name
        self.hp = hp
        self.power = power

    def attack(self):
        print(f"{self.name} 공격!")

class Warrior(Character):
    def attack(self):
        print(f"{self.name}: 돌격!")

class Archer(Character):
    def attack(self):
        print(f"{self.name}: 발사!")

warrior = Warrior("도끼병", 100, 80)
archer = Archer("궁수", 50, 30)
warrior.attack()
archer.attack()`,
    explanation: "class로 객체를 정의하고 상속으로 기능을 확장합니다.",
  },
  16: {
    nameKo: "모듈",
    nameEn: "module",
    exampleCode: `import math
import random

print("원주율:", math.pi)
print("5! =", math.factorial(5))
print("제곱근:", math.sqrt(16))

lotto = random.sample(range(1, 46), 6)
lotto.sort()
print("로또 번호:", lotto)`,
    explanation: "import로 math, random 등 표준 모듈을 불러옵니다.",
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
