import type { DetectedConcept, ParseResult } from "@/types";

function detectPrint(code: string): DetectedConcept | null {
  if (!/\bprint\s*\(/.test(code)) return null;
  const matches = code.match(/\bprint\s*\(/g) || [];
  return { conceptId: 1, conceptKey: "print", details: { callCount: matches.length } };
}

function detectVariable(code: string): DetectedConcept | null {
  const KEYWORDS = new Set([
    "if", "for", "while", "def", "class", "import", "return",
    "True", "False", "None", "and", "or", "not", "in", "is",
    "elif", "else", "try", "except", "with", "as", "from",
    "pass", "break", "continue", "global", "lambda", "yield",
  ]);
  const lines = code.split("\n");
  const varMatches: { name: string; value: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^\s*([a-zA-Z_가-힣]\w*)\s*=\s*(?![=])(.*)/);
    if (m && !KEYWORDS.has(m[1]) && !m[1].startsWith("__")) {
      varMatches.push({ name: m[1], value: m[2].trim() });
    }
  }
  if (varMatches.length === 0) return null;
  const last = varMatches[varMatches.length - 1];
  return {
    conceptId: 2,
    conceptKey: "variable",
    details: { varNames: varMatches.map((v) => v.name), lastVarName: last.name, lastVarValue: last.value },
  };
}

function detectArithmeticOperator(code: string): DetectedConcept | null {
  const ops: string[] = [];
  if (/\*\*/.test(code)) ops.push("**");
  if (/\/\//.test(code)) ops.push("//");
  if (/[^+\-*/%!<>=][\+][^=]/.test(code) || /^\s*[\+]/.test(code)) ops.push("+");
  if (/[^+\-*/%!<>=][\-][^=>\-]/.test(code)) ops.push("-");
  if (/[^*][*][^*=]/.test(code)) ops.push("*");
  if (/[^/][/][^/=]/.test(code)) ops.push("/");
  if (/[^%][%][^=]/.test(code)) ops.push("%");
  if (ops.length === 0) return null;
  return { conceptId: 3, conceptKey: "arithmetic_operator", details: { operators: ops } };
}

function detectComparisonOperator(code: string): DetectedConcept | null {
  const ops: string[] = [];
  if (/==/.test(code)) ops.push("==");
  if (/!=/.test(code)) ops.push("!=");
  if (/>=/.test(code)) ops.push(">=");
  if (/<=/.test(code)) ops.push("<=");
  if (/>(?!=)/.test(code)) ops.push(">");
  if (/<(?!=)/.test(code)) ops.push("<");
  if (ops.length === 0) return null;
  return { conceptId: 4, conceptKey: "comparison_operator", details: { operators: ops } };
}

function detectAssignmentOperator(code: string): DetectedConcept | null {
  const ops: string[] = [];
  if (/\+=/.test(code)) ops.push("+=");
  if (/-=/.test(code)) ops.push("-=");
  if (/\*=/.test(code)) ops.push("*=");
  if (/\/=/.test(code)) ops.push("/=");
  if (ops.length === 0) return null;
  return { conceptId: 5, conceptKey: "assignment_operator", details: { operators: ops } };
}

function detectLogicalOperator(code: string): DetectedConcept | null {
  const ops: string[] = [];
  if (/\band\b/.test(code)) ops.push("and");
  if (/\bor\b/.test(code)) ops.push("or");
  if (/\bnot\b/.test(code)) ops.push("not");
  if (ops.length === 0) return null;
  return { conceptId: 6, conceptKey: "logical_operator", details: { operators: ops } };
}

function detectNumberType(code: string): DetectedConcept | null {
  const usesMath = /\bmath\.\w+/.test(code);
  const usesRandom = /\brandom\.\w+/.test(code);
  const usesBuiltins = /\b(abs|round|int|float)\s*\(/.test(code);
  if (!usesMath && !usesRandom && !usesBuiltins) return null;
  return { conceptId: 7, conceptKey: "number_type", details: { usesMath, usesRandom } };
}

function detectStringType(code: string): DetectedConcept | null {
  const usesFormatting = /f"[^"]*\{|f'[^']*\{|\.format\s*\(|%\s*["'(]/.test(code);
  const usesSlicing = /\w+\[\s*[-\d:]+\s*\]/.test(code);
  if (!usesFormatting && !usesSlicing) return null;
  return { conceptId: 8, conceptKey: "string_type", details: { usesFormatting, usesSlicing } };
}

function detectList(code: string): DetectedConcept | null {
  const hasList = /\[[^\]]*\]/.test(code);
  const hasListMethod = /\.(append|index|sort|remove|pop|insert)\s*\(|\blen\s*\(/.test(code);
  if (!hasList && !hasListMethod) return null;
  return { conceptId: 9, conceptKey: "list", details: {} };
}

function detectBoolean(code: string): DetectedConcept | null {
  if (!/\bTrue\b|\bFalse\b|\bbool\s*\(/.test(code)) return null;
  return { conceptId: 10, conceptKey: "boolean", details: {} };
}

function detectConditional(code: string): DetectedConcept | null {
  if (!/^\s*if\s+.+:/m.test(code)) return null;
  const hasElif = /^\s*elif\s+/m.test(code);
  const hasElse = /^\s*else\s*:/m.test(code);
  const branchType = hasElif ? "if_elif_else" : hasElse ? "if_else" : "if_only";
  return { conceptId: 11, conceptKey: "conditional", details: { branchType } };
}

function detectForLoop(code: string): DetectedConcept | null {
  if (!/^\s*for\s+\w+\s+in\s+/m.test(code)) return null;
  let rangeCount: number | null = null;
  const rangeMatch = code.match(/range\s*\(\s*(\d+)\s*(?:,\s*(\d+)\s*)?\)/);
  if (rangeMatch) {
    if (rangeMatch[2] !== undefined) {
      rangeCount = Math.min(parseInt(rangeMatch[2]) - parseInt(rangeMatch[1]), 10);
    } else {
      rangeCount = Math.min(parseInt(rangeMatch[1]), 10);
    }
  }
  return { conceptId: 12, conceptKey: "for_loop", details: { rangeCount } };
}

function detectWhileLoop(code: string): DetectedConcept | null {
  if (!/^\s*while\s+/m.test(code)) return null;
  const hasBreak = /\bbreak\b/.test(code);
  return { conceptId: 13, conceptKey: "while_loop", details: { hasBreak } };
}

function detectFunction(code: string): DetectedConcept | null {
  const matches = code.match(/^\s*def\s+(\w+)\s*\(/gm);
  if (!matches) return null;
  const functionNames = matches.map((m) => m.replace(/^\s*def\s+/, "").replace(/\s*\(.*/, ""));
  const hasReturn = /\breturn\b/.test(code);
  const hasGlobal = /\bglobal\b/.test(code);
  return { conceptId: 14, conceptKey: "function", details: { functionNames, hasReturn, hasGlobal } };
}

function detectClass(code: string): DetectedConcept | null {
  const matches = code.match(/^\s*class\s+(\w+)\s*(?:\((\w+)\))?:/gm);
  if (!matches) return null;
  const classNames = matches.map((m) => {
    const nm = m.match(/class\s+(\w+)/);
    return nm ? nm[1] : "";
  }).filter(Boolean);
  const hasInheritance = /class\s+\w+\s*\(\w+\)/.test(code);
  const characters: ("warrior" | "archer")[] = [];
  for (const name of classNames) {
    if (/전사|warrior|Warrior/i.test(name)) characters.push("warrior");
    if (/궁수|archer|Archer/i.test(name)) characters.push("archer");
  }
  return {
    conceptId: 15,
    conceptKey: "class",
    details: { classNames, hasInheritance, characters },
  };
}

function detectModule(code: string): DetectedConcept | null {
  if (!/^\s*(import\s+\w+|from\s+\w+\s+import)/m.test(code)) return null;
  const imports = (code.match(/import\s+(\w+)/g) || []).map((m) => m.replace("import ", ""));
  return { conceptId: 16, conceptKey: "module", details: { moduleNames: imports } };
}

const PRIORITY_ORDER = [15, 14, 12, 11, 13, 1, 2, 8, 9, 16, 7, 6, 5, 4, 3, 10];

export function parsePython(code: string): ParseResult {
  const detectors = [
    detectPrint,
    detectVariable,
    detectArithmeticOperator,
    detectComparisonOperator,
    detectAssignmentOperator,
    detectLogicalOperator,
    detectNumberType,
    detectStringType,
    detectList,
    detectBoolean,
    detectConditional,
    detectForLoop,
    detectWhileLoop,
    detectFunction,
    detectClass,
    detectModule,
  ];

  const concepts: DetectedConcept[] = [];
  for (const detector of detectors) {
    const result = detector(code);
    if (result) concepts.push(result);
  }

  let primaryConcept: DetectedConcept | null = null;
  for (const pid of PRIORITY_ORDER) {
    const found = concepts.find((c) => c.conceptId === pid);
    if (found) {
      primaryConcept = found;
      break;
    }
  }

  return { concepts, primaryConcept };
}
