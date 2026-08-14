import test from "node:test";
import assert from "node:assert/strict";
import {
  CONCEPT_EXAMPLES,
  CONCEPT_EXAMPLES_LV2,
  CONCEPT_EXAMPLES_LV3,
} from "../lib/curriculum";
import {
  createStudentPracticeTemplate,
  extractExpectedOutput,
  isExactExpectedOutput,
} from "../lib/practice-template";

test("robot API introduction spaces drawing examples across the stage", () => {
  const code = CONCEPT_EXAMPLES[0].exampleCode;
  const drawCalls = code.match(/robot\.draw\(/g) ?? [];

  assert.equal(drawCalls.length, 6);
  assert.match(code, /robot\.draw\("circle"\)[\s\S]*robot\.move\(2\)[\s\S]*robot\.draw\("star"\)/);
  assert.match(code, /robot\.draw\("diamond"\)[\s\S]*robot\.move\(2\)[\s\S]*robot\.draw\("square"\)/);
});

test("robot API introduction speaks before changing emotion", () => {
  const code = CONCEPT_EXAMPLES[0].exampleCode;

  assert.match(code, /for feeling[\s\S]*robot\.say\(feeling \+ "!"\)\n    robot\.emotion\(feeling\)/);
  assert.match(code, /robot\.say\("이동 시작!"\)\nrobot\.emotion\("happy"\)/);
  assert.doesNotMatch(code, /robot\.emotion\(feeling\)\n    robot\.say\(feeling \+ "!"\)/);
});

test("print practice output matches Python string operations", () => {
  const code = CONCEPT_EXAMPLES[1].practiceCode;
  const starter = createStudentPracticeTemplate(code);

  assert.match(starter, /#-----------------------------------------\n# \[출력 결과\]\n# 안녕안녕안녕\n# 사과바나나/);
  assert.match(code, /print\("안녕" \* 3\)/);
  assert.match(code, /print\("사과" \+ "바나나"\)/);
  assert.doesNotMatch(code, /사과 \+ 바나나/);
});

test("conditional example checks the variable that stores the collision target", () => {
  const code = CONCEPT_EXAMPLES[11].exampleCode;

  assert.match(code, /other = "도착지점"/);
  assert.match(code, /if other == "바닥":/);
  assert.doesNotMatch(code, /if abc ==/);
});

test("advanced examples keep explanations aligned with Python behavior", () => {
  assert.doesNotMatch(CONCEPT_EXAMPLES_LV2[21].explanation, /순서 없이/);
  assert.doesNotMatch(CONCEPT_EXAMPLES_LV2[23].explanation, /주소/);
  assert.match(CONCEPT_EXAMPLES_LV2[30].exampleCode, /가장 짧은 데이터가 끝나면 종료/);
});

test("data-analysis examples avoid self-correlation and hidden negative R-squared values", () => {
  const correlation = CONCEPT_EXAMPLES_LV3[32].practiceCode;
  const regression = CONCEPT_EXAMPLES_LV3[38].exampleCode;

  assert.match(correlation, /drop\('Survived'\)/);
  assert.match(correlation, /\.abs\(\)\.sort_values\(ascending=False\)/);
  assert.match(regression, /drop\(columns=\['Fare', 'Survived'\]\)/);
  assert.doesNotMatch(regression, /plt\.ylim\(0, 1\)/);
});

test("scale-sensitive classifiers use StandardScaler pipelines", () => {
  const classificationPractice = CONCEPT_EXAMPLES_LV3[39].practiceCode;
  const comparison = CONCEPT_EXAMPLES_LV3[40].exampleCode;

  assert.match(classificationPractice, /make_pipeline\(/);
  assert.match(classificationPractice, /StandardScaler\(\)/);
  assert.match(comparison, /'KNN':\s+make_pipeline\(/);
  assert.match(comparison, /'SVM':\s+make_pipeline\(/);
});

test("boxplots map numeric category values through explicit hue variables", () => {
  const code = CONCEPT_EXAMPLES_LV3[35].exampleCode;

  assert.match(code, /hue='Survived'/);
  assert.match(code, /palette=\{0:/);
  assert.match(code, /hue='Pclass'/);
  assert.match(code, /palette=\{1:/);
});

test("every level 2 and level 3 practice includes a visible output guide", () => {
  const items = [
    ...Object.values(CONCEPT_EXAMPLES_LV2),
    ...Object.values(CONCEPT_EXAMPLES_LV3),
  ];

  for (const item of items) {
    const starter = createStudentPracticeTemplate(item.practiceCode);
    assert.match(starter, /#-----------------------------------------\n# \[출력 결과\]/);
    assert.ok(extractExpectedOutput(starter), `${item.nameEn} output guide is missing`);
  }
});

test("data-dependent level 3 output guides do not trigger exact text matching", () => {
  for (const item of Object.values(CONCEPT_EXAMPLES_LV3)) {
    const expected = extractExpectedOutput(item.practiceCode);
    if (!expected) assert.fail(`${item.nameEn} output guide is missing`);
    assert.equal(isExactExpectedOutput(expected), false, item.nameEn);
  }
});

test("encoding practice uses a student-friendly travel category", () => {
  const encoding = CONCEPT_EXAMPLES_LV3[37];

  assert.match(encoding.exampleCode, /TravelType/);
  assert.match(encoding.practiceCode, /여행 유형 매핑/);
  assert.doesNotMatch(encoding.exampleCode, /\bSex\b/);
  assert.doesNotMatch(encoding.practiceCode, /\bSex\b/);
});
