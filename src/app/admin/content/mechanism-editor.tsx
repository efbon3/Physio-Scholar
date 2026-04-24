"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createMechanismAction, updateMechanismAction } from "./actions";

type Mode = "create" | "update";

type Props = {
  mode: Mode;
  initialMarkdown: string;
  initialStatus: string;
  expectedId?: string;
};

/**
 * Single-textarea editor for a mechanism markdown file.
 *
 * Left side: the markdown source (frontmatter + body). Right side: a
 * live preview of the body (we skip frontmatter because it's YAML, not
 * markdown). Status dropdown controls whether the row is visible to
 * learners.
 *
 * Full parsing + schema validation happens server-side on submit via
 * the action. Errors come back in the `result` state and render
 * inline so the admin can correct and re-save without losing the
 * textarea contents.
 */
export function MechanismEditor({ mode, initialMarkdown, initialStatus, expectedId }: Props) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [status, setStatus] = useState(initialStatus);
  const [result, setResult] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const bodyOnly = useMemo(() => stripFrontmatter(markdown), [markdown]);

  return (
    <form
      action={(formData) => {
        setResult(null);
        setOk(null);
        startTransition(async () => {
          const action = mode === "create" ? createMechanismAction : updateMechanismAction;
          const response = await action(formData);
          if (response.status === "error") {
            setResult(response.message);
          } else {
            setOk(`Saved "${response.id}" successfully.`);
          }
        });
      }}
      className="flex flex-col gap-4"
    >
      {expectedId ? <input type="hidden" name="expected_id" value={expectedId} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border-input bg-background rounded-md border px-3 py-1.5 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="review">In review</option>
          <option value="published">Published</option>
          <option value="retired">Retired</option>
        </select>
        <p className="text-muted-foreground text-xs">
          Only <span className="font-medium">Published</span> rows are visible to learners.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="markdown">
            Markdown source
          </label>
          <textarea
            id="markdown"
            name="markdown"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            rows={36}
            className="border-input bg-background rounded-md border px-3 py-2 font-mono text-xs leading-6"
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Preview</p>
          <div className="border-input bg-muted/20 rounded-md border p-4 text-sm leading-7 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-medium [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-medium [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyOnly}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Saving…" : mode === "create" ? "Save new mechanism" : "Save changes"}
        </button>
        <Link
          href="/admin/content"
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
        >
          Cancel
        </Link>
        {result ? <span className="text-destructive text-xs">{result}</span> : null}
        {ok ? <span className="text-xs text-emerald-600">{ok}</span> : null}
      </div>
    </form>
  );
}

/**
 * Strip a YAML frontmatter block for the preview. The actual server-side
 * parser uses gray-matter; here we just want to keep the preview on the
 * body. Works for any `---\n…\n---` header.
 */
function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\n[\s\S]*?\n---\n?/);
  if (!match) return raw;
  return raw.slice(match[0].length);
}
