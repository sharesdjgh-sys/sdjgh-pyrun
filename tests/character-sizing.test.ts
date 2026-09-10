import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import RobotCharacter from "../components/robot/RobotCharacter";
import DogCharacter from "../components/robot/DogCharacter";
import { robotApi } from "../lib/robot-api";
import { animationQueue } from "../lib/animation-queue";

// Next compiles preserved JSX automatically; the node/tsx test runner uses classic JSX.
Object.assign(globalThis, { React });

for (const [name, Character] of [["robot", RobotCharacter], ["dog", DogCharacter]] as const) {
  test(`${name} renders small and large SVGs proportionally without double scaling`, () => {
    for (const scale of [.5, 1, 2.5, 3]) {
      for (const direction of ["left", "right"] as const) {
        const markup = renderToStaticMarkup(createElement(Character, { state: "idle", scale, direction, size: 184 }));
        const root = markup.match(/^<div[^>]+>/)?.[0] ?? "";
        const svg = markup.match(/<svg[^>]+>/)?.[0] ?? "";
        assert.ok(svg.includes(`width="${184 * scale}"`));
        assert.ok(svg.includes(`height="${226 * scale}"`));
        assert.ok(svg.includes('preserveAspectRatio="xMidYMax meet"'));
        assert.ok(root.includes(`transform:scaleX(${direction === "left" ? -1 : 1})`));
        assert.ok(!root.includes("scale("), "user scale must not also apply through CSS");
        assert.ok(root.includes("width:184px;height:226px"), "stage layout anchor stays unchanged");
      }
    }
  });
}

test("robot.size queues shrink, enlarge and reset values without changing their scale", () => {
  animationQueue.clear();
  try {
    for (const scale of [.5, 2.5, 3, 1]) robotApi.size(scale);
    assert.deepEqual(animationQueue.get(), [.5, 2.5, 3, 1].map(scale => ({ type: "size", params: { scale } })));
    for (const invalid of [.49, 3.01, NaN, Infinity, -Infinity]) assert.throws(() => robotApi.size(invalid));
  } finally { animationQueue.clear(); }
});
