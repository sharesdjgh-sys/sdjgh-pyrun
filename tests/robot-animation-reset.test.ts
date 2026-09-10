import test from "node:test";
import assert from "node:assert/strict";
import { leftLegVariants, rightLegVariants } from "../components/robot/robotAnimations";
import type { RobotState } from "../types";

const restStates: RobotState[] = ["idle", "talking", "headShake", "celebrating", "error", "spinning", "shaking"];

for (const [side, variants] of [["left", leftLegVariants], ["right", rightLegVariants]] as const) {
  test(`${side} robot leg explicitly resets after walking or jumping`, () => {
    for (const state of restStates) {
      assert.deepEqual(variants[state], {
        rotate: 0,
        transition: { duration: .18, ease: "easeOut" },
      }, `${state} must cancel the previous leg rotation without repeating`);
    }
  });
}
