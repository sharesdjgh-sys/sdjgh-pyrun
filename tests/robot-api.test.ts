import test from "node:test";
import assert from "node:assert/strict";
import { robotApi } from "../lib/robot-api";
import { animationQueue } from "../lib/animation-queue";

test("robot API validates boundaries and queues valid commands", () => {
  animationQueue.clear();
  assert.throws(() => robotApi.move(0));
  assert.throws(() => robotApi.size(4));
  assert.throws(() => robotApi.turn("diagonal"));
  robotApi.turn("up");
  robotApi.move(2);
  robotApi.draw("star");
  assert.deepEqual(animationQueue.get().map((item) => item.type), ["turn", "move", "draw"]);
});
