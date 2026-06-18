import { db } from "./index";
import { concepts, badges } from "./schema";

const CONCEPTS_DATA = [
  { id: 1, nameKo: "출력", nameEn: "print", orderIndex: 1, description: "print() 함수로 화면에 값을 출력합니다." },
  { id: 2, nameKo: "변수", nameEn: "variable", orderIndex: 2, description: "변수에 값을 저장하고 사용합니다." },
  { id: 3, nameKo: "산술 연산자", nameEn: "arithmetic_operator", orderIndex: 3, description: "+, -, *, /, //, %, ** 연산자를 사용합니다." },
  { id: 4, nameKo: "비교 연산자", nameEn: "comparison_operator", orderIndex: 4, description: "==, !=, >, <, >=, <= 연산자로 값을 비교합니다." },
  { id: 5, nameKo: "할당 연산자", nameEn: "assignment_operator", orderIndex: 5, description: "+=, -=, *=, /= 연산자로 값을 변경합니다." },
  { id: 6, nameKo: "논리 연산자", nameEn: "logical_operator", orderIndex: 6, description: "and, or, not 연산자로 조건을 결합합니다." },
  { id: 7, nameKo: "숫자형", nameEn: "number_type", orderIndex: 7, description: "int, float, math 모듈로 숫자를 다룹니다." },
  { id: 8, nameKo: "문자형", nameEn: "string_type", orderIndex: 8, description: "문자열 슬라이싱, 포매팅을 사용합니다." },
  { id: 9, nameKo: "리스트", nameEn: "list", orderIndex: 9, description: "리스트로 여러 값을 묶어 관리합니다." },
  { id: 10, nameKo: "불리언", nameEn: "boolean", orderIndex: 10, description: "True/False 값과 bool() 함수를 사용합니다." },
  { id: 11, nameKo: "조건문", nameEn: "conditional", orderIndex: 11, description: "if/elif/else로 조건에 따라 실행합니다." },
  { id: 12, nameKo: "for 반복문", nameEn: "for_loop", orderIndex: 12, description: "for 문으로 정해진 횟수만큼 반복합니다." },
  { id: 13, nameKo: "while 반복문", nameEn: "while_loop", orderIndex: 13, description: "while 문으로 조건이 참인 동안 반복합니다." },
  { id: 14, nameKo: "함수", nameEn: "function", orderIndex: 14, description: "def로 함수를 정의하고 반복 사용합니다." },
  { id: 15, nameKo: "클래스", nameEn: "class", orderIndex: 15, description: "class로 객체를 정의하고 상속합니다." },
  { id: 16, nameKo: "모듈", nameEn: "module", orderIndex: 16, description: "import로 외부 모듈을 불러와 사용합니다." },
];

const BADGES_DATA = [
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

async function seed() {
  console.log("Seeding concepts...");
  for (const concept of CONCEPTS_DATA) {
    await db
      .insert(concepts)
      .values(concept)
      .onConflictDoNothing();
  }

  console.log("Seeding badges...");
  for (const badge of BADGES_DATA) {
    await db
      .insert(badges)
      .values(badge)
      .onConflictDoNothing();
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
