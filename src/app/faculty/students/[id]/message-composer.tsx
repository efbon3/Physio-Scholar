"use client";

import { useState, useTransition } from "react";

import { sendMessageAction } from "@/lib/messages/actions";

/**
 * HOD / admin composer for write-once student messages. Renders only
 * when the page server component decides the caller is allowed
 * (role='hod' or admin). Single textarea + send button; on success
 * the textarea clears and a confirmation appears.
 */
export function MessageComposer({
  recipientId,
  recipientName,
}: {
  recipientId: string;
  recipientName: string;
}) {
  const [body, setBody] = useState("");
  const [feedback, setFeedback] = useState<
    { kind: "ok"; text: string } | { kind: "error"; text: string } | null
  >(null);
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-label="Send a direct message"
      className="border-input flex flex-col gap-3 rounded-md border p-4 text-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-medium">Message {recipientName}</h2>
        <p className="text-muted-foreground text-xs">
          Direct, write-once. The student sees this on their dashboard until they mark it read. They
          can&apos;t reply — use class hours or email for that.
        </p>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={pending}
        rows={4}
        maxLength={2000}
        placeholder="e.g. Your attendance for the past month is below 75% — let's set up a time to talk."
        className="border-input bg-background min-h-24 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
        aria-label="Message body"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={pending || body.trim().length === 0}
          onClick={() => {
            setFeedback(null);
            startTransition(async () => {
              const result = await sendMessageAction(recipientId, body);
              if (result.status === "ok") {
                setBody("");
                setFeedback({ kind: "ok", text: "Sent." });
              } else {
                setFeedback({ kind: "error", text: result.message });
              }
            });
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        {feedback ? (
          <span
            role={feedback.kind === "ok" ? "status" : "alert"}
            className={
              feedback.kind === "ok" ? "text-xs text-emerald-600" : "text-destructive text-xs"
            }
          >
            {feedback.text}
          </span>
        ) : null}
      </div>
    </section>
  );
}
