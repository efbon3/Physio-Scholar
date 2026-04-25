"use client";

import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

import { saveProfileAction, setAvatarPathAction } from "./actions";
import { AvatarCropper, type CroppedAvatar } from "./avatar-cropper";

type Snapshot = {
  email: string | null;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phone: string;
  rollNumber: string;
  avatarUrl: string | null;
};

type Feedback = { kind: "ok"; message: string } | { kind: "error"; message: string } | null;

type Props = {
  snapshot: Snapshot;
  /** When true, the form is rendered but inputs are disabled (CI / preview). */
  readOnly?: boolean;
  readOnlyMessage?: string;
  /** Authenticated user id — used to scope the avatar's storage path. */
  userId?: string;
};

/**
 * Client form for the learner's personal details. Server action
 * handles validation + persistence; the avatar cropper handles its
 * own upload-then-action flow because the binary blob can't sail
 * through `useTransition` cleanly.
 *
 * DOB visibility: the input is rendered for the owner. The privacy
 * policy is "DOB visible only to admin and self." Admin tooling (J6)
 * displays it on user-detail pages; nothing else surfaces DOB. We
 * note this expectation in the helper text below the input so the
 * learner knows what they're sharing.
 */
export function ProfileForm({ snapshot, readOnly = false, readOnlyMessage, userId }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(snapshot.avatarUrl);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [savePending, startSaveTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);

  async function handleAvatarApply(cropped: CroppedAvatar) {
    if (!userId) return;
    setAvatarPending(true);
    setFeedback(null);
    try {
      const supabase = createClient();
      const path = `${userId}/${cropped.filename}`;
      const upload = await supabase.storage.from("avatars").upload(path, cropped.blob, {
        contentType: "image/jpeg",
        upsert: true,
        cacheControl: "3600",
      });
      if (upload.error) {
        setFeedback({ kind: "error", message: `Upload failed: ${upload.error.message}` });
        return;
      }
      const result = await setAvatarPathAction(path);
      if (result.status === "error") {
        setFeedback({ kind: "error", message: result.message });
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Cache-bust by appending a versioned query so the <img> updates
      // even when the storage path is reused for a fresh upload.
      setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
      setFeedback({ kind: "ok", message: "Photo updated." });
    } finally {
      setAvatarPending(false);
    }
  }

  async function handleAvatarRemove() {
    if (!userId) return;
    setAvatarPending(true);
    setFeedback(null);
    try {
      const result = await setAvatarPathAction(null);
      if (result.status === "error") {
        setFeedback({ kind: "error", message: result.message });
        return;
      }
      setAvatarUrl(null);
      setFeedback({ kind: "ok", message: "Photo removed." });
    } finally {
      setAvatarPending(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="text-muted-foreground text-sm tracking-widest uppercase">Profile</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Your details</h1>
        <p className="text-muted-foreground text-sm">
          Visible to you and to your administrators. Nothing here is shown to other learners.
        </p>
        {snapshot.email ? (
          <p className="text-muted-foreground text-xs">
            Signed in as <span className="font-medium">{snapshot.email}</span>
          </p>
        ) : null}
      </header>

      {readOnly && readOnlyMessage ? (
        <p className="border-border bg-muted/40 rounded-md border p-3 text-sm">{readOnlyMessage}</p>
      ) : null}

      {!readOnly ? (
        <AvatarCropper
          initialAvatarUrl={avatarUrl}
          pending={avatarPending}
          onApply={handleAvatarApply}
          onRemove={avatarUrl ? handleAvatarRemove : undefined}
        />
      ) : null}

      <form
        action={(formData) => {
          setFeedback(null);
          startSaveTransition(async () => {
            const result = await saveProfileAction(formData);
            if (result.status === "ok") {
              setFeedback({ kind: "ok", message: result.message ?? "Saved." });
            } else {
              setFeedback({ kind: "error", message: result.message });
            }
          });
        }}
        className="flex flex-col gap-5"
      >
        <Field
          label="Full name"
          name="full_name"
          defaultValue={snapshot.fullName}
          disabled={readOnly}
        />
        <Field
          label="Date of birth"
          name="date_of_birth"
          type="date"
          defaultValue={snapshot.dateOfBirth}
          helper="Visible only to you and to your administrators."
          disabled={readOnly}
        />
        <Field
          label="Roll number"
          name="roll_number"
          defaultValue={snapshot.rollNumber}
          helper="Whatever your institution uses — letters, digits, dots, dashes are all fine."
          disabled={readOnly}
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          defaultValue={snapshot.phone}
          disabled={readOnly}
        />
        <TextArea
          label="Address"
          name="address"
          defaultValue={snapshot.address}
          disabled={readOnly}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={savePending || readOnly}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
            data-testid="profile-save"
          >
            {savePending ? "Saving…" : "Save changes"}
          </button>
          {feedback ? (
            <span
              role="status"
              className={
                feedback.kind === "ok" ? "text-xs text-emerald-600" : "text-destructive text-xs"
              }
            >
              {feedback.message}
            </span>
          ) : null}
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  helper,
  disabled,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  helper?: string;
  disabled?: boolean;
}) {
  const id = `profile-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        className="border-input bg-background h-10 rounded-md border px-3 text-sm outline-none focus:ring-2 disabled:opacity-50"
      />
      {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  disabled,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const id = `profile-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        rows={3}
        className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 disabled:opacity-50"
      />
    </div>
  );
}
