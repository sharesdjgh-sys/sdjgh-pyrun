import test from "node:test";
import assert from "node:assert/strict";
import {
  characterFacing,
  cloneAnimationState,
  placeRobotClone,
  type StagePoint,
} from "../lib/robot-stage-layout";

test("robot clones spread around the original instead of overlapping", () => {
  const origin = { x: 0, y: 0 };
  const clones: StagePoint[] = [];

  for (let i = 0; i < 5; i += 1) {
    clones.push(placeRobotClone(origin, clones));
  }

  assert.equal(new Set(clones.map((clone) => `${clone.x},${clone.y}`)).size, 5);
  for (const clone of clones) {
    assert.ok(Math.hypot(clone.x - origin.x, clone.y - origin.y) >= 60);
  }
});

test("the first two robot clones appear to the left and right of the original", () => {
  const origin = { x: 0, y: 0 };
  const leftClone = placeRobotClone(origin, []);
  const rightClone = placeRobotClone(origin, [leftClone]);

  assert.deepEqual(leftClone, { x: -65, y: 0 });
  assert.deepEqual(rightClone, { x: 65, y: 0 });
});

test("robot clone positions stay visible near stage edges", () => {
  const clone = placeRobotClone({ x: 170, y: 120 }, []);

  assert.ok(clone.x >= -150 && clone.x <= 150);
  assert.ok(clone.y >= -95 && clone.y <= 95);
});

test("vertical movement keeps characters upright", () => {
  assert.equal(characterFacing("up"), "right");
  assert.equal(characterFacing("down"), "right");
  assert.equal(characterFacing("left"), "left");
  assert.equal(characterFacing("right"), "right");
});

test("robot clones join the shared dance without copying movement animations", () => {
  assert.equal(cloneAnimationState("celebrating"), "celebrating");
  assert.equal(cloneAnimationState("walking"), "idle");
  assert.equal(cloneAnimationState("jumping"), "idle");
  assert.equal(cloneAnimationState("spinning"), "idle");
});
