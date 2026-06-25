export type RobotCommand =
  | { type: "move"; params: { steps: number } }
  | { type: "say"; params: { text: string } }
  | { type: "jump" | "dance" | "clone" | "spin" | "shake" | "clear"; params: Record<string, never> }
  | { type: "emotion"; params: { feeling: string } }
  | { type: "size"; params: { scale: number } }
  | { type: "turn"; params: { direction: string } }
  | { type: "draw"; params: { shape: string } };

let queue: RobotCommand[] = [];
const MAX_QUEUE_SIZE = 200;

export const animationQueue = {
  push(command: RobotCommand) {
    if (queue.length >= MAX_QUEUE_SIZE) {
      throw new Error(
        `로봇 명령이 너무 많이 실행되었습니다 (최대 ${MAX_QUEUE_SIZE}개). 코드가 무한 루프에 빠졌는지 확인해보세요!`
      );
    }
    queue.push(command);
  },

  clear() {
    queue = [];
  },

  get() {
    return [...queue];
  },

  size() {
    return queue.length;
  },
};
