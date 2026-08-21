"use client";

import React, { type ComponentProps } from "react";

type ReloadButtonProps = Omit<ComponentProps<"button">, "onClick">;

export default function ReloadButton({ children = "다시 시도", ...props }: ReloadButtonProps) {
  const [reloading, setReloading] = React.useState(false);

  return (
    <button
      {...props}
      type={props.type ?? "button"}
      disabled={reloading || props.disabled}
      aria-busy={reloading}
      onClick={() => {
        if (reloading) return;
        setReloading(true);
        window.location.reload();
      }}
    >
      {reloading ? "다시 불러오는 중..." : children}
    </button>
  );
}
