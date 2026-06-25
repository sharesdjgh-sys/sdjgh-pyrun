import { animationQueue } from "./animation-queue";

export const robotApi = {
  move(steps: number = 1) {
    if (typeof steps !== "number" || isNaN(steps)) {
      throw new Error("steps는 숫자여야 합니다.");
    }
    if (steps < 1 || steps > 20) {
      throw new Error("steps는 1에서 20 사이여야 합니다.");
    }
    animationQueue.push({ type: "move", params: { steps } });
  },

  turn(direction: string) {
    if (direction !== "left" && direction !== "right") {
      throw new Error('direction은 "left" 또는 "right"여야 합니다.');
    }
    animationQueue.push({ type: "turn", params: { direction } });
  },

  jump() {
    animationQueue.push({ type: "jump", params: {} });
  },

  say(text: unknown) {
    // 숫자가 들어올 수도 있으므로 문자열로 변환하여 처리해 줍니다.
    const textStr = String(text);
    if (textStr.length > 100) {
      throw new Error("텍스트는 100자 이내여야 합니다.");
    }
    animationQueue.push({ type: "say", params: { text: textStr } });
  },

  emotion(feeling: string) {
    const validFeelings = ["happy", "sad", "angry", "surprised"];
    if (!validFeelings.includes(feeling)) {
      throw new Error('emotion은 "happy", "sad", "angry", "surprised" 중 하나여야 합니다.');
    }
    animationQueue.push({ type: "emotion", params: { feeling } });
  },

  dance() {
    animationQueue.push({ type: "dance", params: {} });
  },

  size(scale: number = 1.0) {
    if (typeof scale !== "number" || isNaN(scale)) {
      throw new Error("scale은 숫자여야 합니다.");
    }
    if (scale < 0.5 || scale > 3.0) {
      throw new Error("scale은 0.5에서 3.0 사이여야 합니다.");
    }
    animationQueue.push({ type: "size", params: { scale } });
  },

  draw(shape: string) {
    const validShapes = ["circle", "square", "star", "triangle", "heart", "diamond"];
    if (!validShapes.includes(shape)) {
      throw new Error('shape는 "circle", "square", "star", "triangle", "heart", "diamond" 중 하나여야 합니다.');
    }
    animationQueue.push({ type: "draw", params: { shape } });
  },

  clone() {
    animationQueue.push({ type: "clone", params: {} });
  },

  bounce(times: unknown = 1) {
    const n = Math.min(Math.max(Math.floor(Number(times) || 1), 1), 5);
    for (let i = 0; i < n; i++) {
      animationQueue.push({ type: "jump", params: {} });
    }
  },

  spin() {
    animationQueue.push({ type: "spin", params: {} });
  },

  shake() {
    animationQueue.push({ type: "shake", params: {} });
  },

  clear() {
    animationQueue.push({ type: "clear", params: {} });
  },
};
