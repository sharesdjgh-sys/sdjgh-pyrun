"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { type ComponentProps, type ReactNode } from "react";

type PendingLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  children: ReactNode;
  pendingLabel?: ReactNode;
};

export default function PendingLink({
  children,
  pendingLabel = "이동 중...",
  className,
  onClick,
  href,
  ...props
}: PendingLinkProps) {
  const [pending, setPending] = React.useState(false);
  const pathname = usePathname();
  const hrefPath = typeof href === "string" ? href.split(/[?#]/, 1)[0] : null;
  const isCurrentPage = hrefPath === pathname && typeof href === "string" && !href.includes("?") && !href.includes("#");

  React.useEffect(() => setPending(false), [pathname]);

  React.useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(false), 10000);
    return () => window.clearTimeout(timer);
  }, [pending]);

  return (
    <Link
      {...props}
      href={href}
      className={["pending-navigation-link", className, pending ? "is-navigating" : ""].filter(Boolean).join(" ")}
      aria-busy={pending}
      aria-disabled={pending}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
        if (isCurrentPage) {
          event.preventDefault();
          return;
        }
        if (!event.defaultPrevented) setPending(true);
      }}
    >
      {pending ? pendingLabel : children}
    </Link>
  );
}
