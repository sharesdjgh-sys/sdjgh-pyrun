import { parser } from "@lezer/python";
import type { DetectedConcept, ParseResult } from "@/types";

interface AstNode {
  name: string;
  from: number;
  to: number;
}

function collectNodes(code: string): { nodes: AstNode[]; syntaxValid: boolean } {
  const tree = parser.parse(code);
  const cursor = tree.cursor();
  const nodes: AstNode[] = [];
  let syntaxValid = true;

  function visit() {
    nodes.push({ name: cursor.name, from: cursor.from, to: cursor.to });
    if (cursor.type.isError) syntaxValid = false;
    if (cursor.firstChild()) {
      do visit(); while (cursor.nextSibling());
      cursor.parent();
    }
  }

  visit();
  return { nodes, syntaxValid };
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function concept(conceptId: number, conceptKey: string, details: Record<string, unknown> = {}): DetectedConcept {
  return { conceptId, conceptKey, details };
}

const PRIORITY_ORDER = [15, 14, 12, 11, 13, 1, 2, 8, 9, 16, 7, 6, 5, 4, 3, 10];

export function parsePython(code: string): ParseResult {
  const { nodes, syntaxValid } = collectNodes(code);
  const textOf = (node: AstNode) => code.slice(node.from, node.to);
  const byName = (name: string) => nodes.filter((node) => node.name === name);
  const concepts: DetectedConcept[] = [];

  const calls = byName("CallExpression").map(textOf);
  const printCalls = calls.filter((text) => /^print\s*\(/.test(text));
  if (printCalls.length) concepts.push(concept(1, "print", { callCount: printCalls.length }));

  const assignments = byName("AssignStatement").map(textOf);
  const variables = assignments
    .map((text) => text.match(/^\s*([a-zA-Z_가-힣]\w*)\s*=(?!=)\s*([\s\S]*)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match));
  if (variables.length) {
    const last = variables.at(-1)!;
    concepts.push(concept(2, "variable", {
      varNames: variables.map((match) => match[1]),
      lastVarName: last[1],
      lastVarValue: last[2].trim(),
    }));
  }

  const arithmeticOps = unique(byName("ArithOp").map(textOf));
  if (arithmeticOps.length) concepts.push(concept(3, "arithmetic_operator", { operators: arithmeticOps }));

  const comparisonOps = unique(byName("CompareOp").map(textOf));
  if (comparisonOps.length) concepts.push(concept(4, "comparison_operator", { operators: comparisonOps }));

  const assignmentOps = unique(byName("UpdateOp").map(textOf));
  if (assignmentOps.length) concepts.push(concept(5, "assignment_operator", { operators: assignmentOps }));

  const expressionTexts = [...byName("BinaryExpression"), ...byName("UnaryExpression")].map(textOf);
  const logicalOps = unique(expressionTexts.flatMap((text) => ["and", "or", "not"].filter((op) => new RegExp(`\\b${op}\\b`).test(text))));
  if (logicalOps.length) concepts.push(concept(6, "logical_operator", { operators: logicalOps }));

  const imports = [...byName("ImportStatement"), ...byName("ImportFromStatement")].map(textOf);
  const usesMath = imports.some((text) => /\bmath\b/.test(text)) || calls.some((text) => /^math\./.test(text));
  const usesRandom = imports.some((text) => /\brandom\b/.test(text)) || calls.some((text) => /^random\./.test(text));
  const usesNumberBuiltin = calls.some((text) => /^(abs|round|int|float)\s*\(/.test(text));
  if (usesMath || usesRandom || usesNumberBuiltin) concepts.push(concept(7, "number_type", { usesMath, usesRandom }));

  const hasFormatString = byName("FormatString").length > 0 || calls.some((text) => /\.format\s*\(/.test(text));
  const hasStringSubscript = byName("SubscriptExpression").some((node) => {
    const text = textOf(node);
    return /\[[\s\d:-]+\]$/.test(text);
  });
  if (hasFormatString || hasStringSubscript) concepts.push(concept(8, "string_type", { usesFormatting: hasFormatString, usesSlicing: hasStringSubscript }));

  if (byName("ListExpression").length || calls.some((text) => /\.(append|index|sort|remove|pop|insert)\s*\(|^len\s*\(/.test(text))) {
    concepts.push(concept(9, "list"));
  }

  if (byName("Boolean").length || calls.some((text) => /^bool\s*\(/.test(text))) concepts.push(concept(10, "boolean"));

  const ifNodes = byName("IfStatement");
  if (ifNodes.length) {
    const text = ifNodes.map(textOf).join("\n");
    concepts.push(concept(11, "conditional", { branchType: /\belif\b/.test(text) ? "if_elif_else" : /\belse\b/.test(text) ? "if_else" : "if_only" }));
  }

  const forNodes = byName("ForStatement");
  if (forNodes.length) {
    const match = forNodes.map(textOf).join("\n").match(/range\s*\(\s*(\d+)(?:\s*,\s*(\d+))?/);
    const rangeCount = match ? Math.min(Math.max(0, Number(match[2] ?? match[1]) - Number(match[2] ? match[1] : 0)), 10) : null;
    concepts.push(concept(12, "for_loop", { rangeCount }));
  }

  const whileNodes = byName("WhileStatement");
  if (whileNodes.length) concepts.push(concept(13, "while_loop", { hasBreak: whileNodes.some((node) => /\bbreak\b/.test(textOf(node))) }));

  const functionNodes = byName("FunctionDefinition");
  if (functionNodes.length) {
    const texts = functionNodes.map(textOf);
    concepts.push(concept(14, "function", {
      functionNames: texts.map((text) => text.match(/^\s*def\s+(\w+)/)?.[1]).filter(Boolean),
      hasReturn: texts.some((text) => /\breturn\b/.test(text)),
      hasGlobal: texts.some((text) => /\bglobal\b/.test(text)),
    }));
  }

  const classNodes = byName("ClassDefinition");
  if (classNodes.length) {
    const texts = classNodes.map(textOf);
    const classNames = texts.map((text) => text.match(/^\s*class\s+(\w+)/)?.[1]).filter((name): name is string => Boolean(name));
    concepts.push(concept(15, "class", {
      classNames,
      hasInheritance: texts.some((text) => /^\s*class\s+\w+\s*\(/.test(text)),
      characters: classNames.flatMap((name) => /전사|warrior/i.test(name) ? ["warrior"] : /궁수|archer/i.test(name) ? ["archer"] : []),
    }));
  }

  const learningImports = imports.filter((text) => !/^\s*(?:from\s+robot\s+import|import\s+robot\s*$)/.test(text));
  if (learningImports.length) concepts.push(concept(16, "module", { moduleNames: learningImports }));

  const primaryConcept = PRIORITY_ORDER.map((id) => concepts.find((item) => item.conceptId === id)).find(Boolean) ?? null;
  return { concepts, primaryConcept, syntaxValid };
}
