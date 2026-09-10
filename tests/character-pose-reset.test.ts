import test from "node:test";
import assert from "node:assert/strict";
import { withRestingPose, restingBodyPose } from "../components/robot/poseTransitions";
import { bodyVariants } from "../components/robot/robotAnimations";

test("idle rotation settles once instead of inheriting the repeating bob transition", () => {
  const idle = bodyVariants.idle as { rotate: number; transition: { repeat: number; rotate: { repeat: number; duration: number } } };
  assert.equal(idle.rotate, 0);
  assert.equal(idle.transition.repeat, Infinity);
  assert.equal(idle.transition.rotate.repeat, 0);
  assert.equal(idle.transition.rotate.duration, .18);
});

test("pose resets preserve action keyframes while clearing omitted transforms", () => {
  const walk = withRestingPose({ walking: { y: [0,-5,0], transition: { repeat: Infinity, duration: .5 } } }, restingBodyPose).walking as { rotate: number; scaleY: number; y: number[]; transition: { y?: unknown; scaleY: { repeat: number } } };
  assert.deepEqual(walk.y, [0,-5,0]);
  assert.equal(walk.rotate, 0);
  assert.equal(walk.scaleY, 1);
  assert.equal(walk.transition.y, undefined);
  assert.equal(walk.transition.scaleY.repeat, 0);
});
