"use client";

import { useState, useCallback } from "react";
import type { ParseResult, RobotStateData } from "@/types";

export function useRobotState() {
  const [robotStateData, setRobotStateData] = useState<RobotStateData>({ state: "idle" });
  const [isAnimating, setIsAnimating] = useState(false);

  const playAnimation = useCallback((stateData: RobotStateData, duration: number = 2000) => {
    setRobotStateData(stateData);
    setIsAnimating(true);
    setTimeout(() => {
      setRobotStateData({ state: "idle" });
      setIsAnimating(false);
    }, duration);
  }, []);

  const deriveAndPlay = useCallback(
    (parseResult: ParseResult, isSuccess: boolean, speechText?: string) => {
      if (!isSuccess) {
        setRobotStateData({ state: "error", speechText });
        setIsAnimating(true);
        setTimeout(() => {
          setRobotStateData({ state: "talking", speechText });
        }, 1200);
        return;
      }

      const primary = parseResult.primaryConcept;
      if (!primary) {
        setRobotStateData({ state: "talking", speechText });
        return;
      }

      const queue: RobotStateData[] = [];

      switch (primary.conceptKey) {
        case "class": {
          const chars = (primary.details.characters as string[]) || [];
          queue.push({ state: "celebrating", classCharacters: chars as ("warrior" | "archer")[], speechText });
          break;
        }
        case "function":
          queue.push({ state: "jumping", speechText });
          break;
        case "for_loop": {
          const steps = Math.max(1, Math.min(10, (primary.details.rangeCount as number) || 3));
          queue.push({ state: "walking", steps, speechText });
          break;
        }
        case "while_loop":
          queue.push({ state: "walking", steps: 4, speechText });
          break;
        case "conditional":
          queue.push({ state: "jumping", speechText });
          break;
        case "print":
          queue.push({ state: "talking", speechText });
          break;
        case "variable": {
          const varName = primary.details.lastVarName as string;
          const varValue = primary.details.lastVarValue as string;
          queue.push({ state: "talking", variableName: varName, variableValue: varValue, speechText });
          break;
        }
        default:
          queue.push({ state: "talking", speechText });
      }

      if (queue.length > 0) {
        setRobotStateData(queue[0]);
        setIsAnimating(true);
        const dur = queue[0].state === "walking" ? 400 * (queue[0].steps || 3) + 500 : 2000;
        setTimeout(() => {
          setRobotStateData({ state: "talking", speechText });
          setTimeout(() => {
            setIsAnimating(false);
          }, 3000);
        }, dur);
      }
    },
    []
  );

  const celebrate = useCallback((speechText?: string) => {
    playAnimation({ state: "celebrating", speechText }, 3500);
  }, [playAnimation]);

  const reset = useCallback(() => {
    setRobotStateData({ state: "idle" });
    setIsAnimating(false);
  }, []);

  return { robotStateData, isAnimating, deriveAndPlay, celebrate, reset };
}
