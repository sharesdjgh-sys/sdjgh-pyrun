"use client";

import { useEffect } from "react";

const FEEDBACK_DURATION_MS = 260;

export default function InteractionFeedback() {
  useEffect(() => {
    const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

    const acknowledgeClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;

      if (button.dataset.clickFeedback === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      const previousTimer = timers.get(button);
      if (previousTimer) clearTimeout(previousTimer);

      button.dataset.clickFeedback = "true";
      const timer = setTimeout(() => {
        delete button.dataset.clickFeedback;
        timers.delete(button);
      }, FEEDBACK_DURATION_MS);
      timers.set(button, timer);
    };

    document.addEventListener("click", acknowledgeClick, { capture: true });
    return () => document.removeEventListener("click", acknowledgeClick, { capture: true });
  }, []);

  return null;
}
