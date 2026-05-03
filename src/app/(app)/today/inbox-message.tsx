"use client";

import { useState, useTransition } from "react";

import { markMessageReadAction } from "@/lib/messages/actions";

/**
 * One row in the student inbox card. Shows sender name + body + sent
 * time. Unread rows have a "Mark as read" button that calls the
 * server action; on success the row dims itself optimistically.
 */
export function InboxMessage({
  id,
  senderName,
  sentAt,
  body,
  initiallyRead,
}: {
  id: string;
  senderName: string;
  sentAt: string;
  body: string;
  initiallyRead: boolean;
}) {
  const [read, setRead] = useState(initiallyRead);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <li
      className={`flex flex-col gap-1 rounded-md border p-3 text-sm ${
        read
          ? "border-input bg-muted/40 opacity-80"
          : "border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/40"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-foreground text-sm font-medium">From: {senderName}</p>
        <p className="text-muted-foreground text-[10px]">{new Date(sentAt).toLocaleString()}</p>
      </div>
      <p className="whitespace-pre-wrap">{body}</p>
      {!read ? (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await markMessageReadAction(id);
                if (result.status === "ok") {
                  setRead(true);
                } else {
                  setError(result.message);
                }
              });
            }}
            className="text-muted-foreground hover:bg-muted rounded-md border px-2 py-0.5 text-xs disabled:opacity-50"
          >
            {pending ? "Marking…" : "Mark as read"}
          </button>
          {error ? (
            <span role="alert" className="text-destructive text-xs">
              {error}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
