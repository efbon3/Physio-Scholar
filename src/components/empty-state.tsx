import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Visual primitive for "no data here yet" surfaces. Replaces the
 * scattered `<p className="text-muted-foreground text-sm">No X</p>`
 * one-liners across the app with a consistent block: an icon-style
 * decoration, headline, supporting copy, and optional CTAs.
 *
 * Designed to feel encouraging rather than apologetic — empty isn't
 * a failure, it's a starting point. The headline tells the learner
 * what they're looking at; the body sentence tells them why it's
 * empty *for them*; the actions tell them what to do next.
 *
 * Layout is dense enough to slot into a section without dominating
 * the page (max-w-md, centred, modest padding). The optional `tone`
 * prop just toggles the icon decoration's accent for surfaces where
 * a softer "informational" feel is preferable to the default.
 */
type EmptyStateAction = {
  label: string;
  href: string;
  /** "primary" for the suggested next step, "secondary" for alternates. */
  variant?: "primary" | "secondary";
};

export function EmptyState({
  icon,
  title,
  description,
  actions,
  tone = "default",
  className,
}: {
  /** Single character / emoji / element rendered in the decoration disc. */
  icon: ReactNode;
  title: string;
  description: ReactNode;
  actions?: readonly EmptyStateAction[];
  tone?: "default" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-border bg-muted/20 mx-auto flex w-full max-w-md flex-col items-center gap-3 rounded-md border p-6 text-center",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full text-xl",
          tone === "muted" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        {icon}
      </div>
      <h3 className="font-heading text-base font-medium">{title}</h3>
      <p className="text-muted-foreground text-sm leading-6">{description}</p>
      {actions && actions.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {actions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                buttonVariants({
                  variant: a.variant === "primary" ? "default" : "outline",
                  size: "sm",
                }),
              )}
            >
              {a.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
