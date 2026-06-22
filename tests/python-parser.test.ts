import test from "node:test";
import assert from "node:assert/strict";
import { parsePython } from "../lib/python-parser";

test("AST parser detects real syntax and ignores comments and strings", () => {
  const result = parsePython('# print(1)\nmessage = "if while import math"\nprint(message)');
  assert.equal(result.syntaxValid, true);
  assert.deepEqual(result.concepts.map((item) => item.conceptId), [1, 2]);
});

test("robot import is not treated as the module lesson", () => {
  assert.equal(parsePython("import robot\nrobot.jump()").concepts.some((item) => item.conceptId === 16), false);
  assert.equal(parsePython("import random\nprint(random.randint(1, 2))").concepts.some((item) => item.conceptId === 16), true);
});

test("AST parser detects control flow, function and class", () => {
  const code = "class Pet:\n  def move(self):\n    for i in range(2):\n      if i > 0:\n        print(i)\n";
  const ids = new Set(parsePython(code).concepts.map((item) => item.conceptId));
  for (const id of [1, 4, 11, 12, 14, 15]) assert.equal(ids.has(id), true, `missing ${id}`);
});
