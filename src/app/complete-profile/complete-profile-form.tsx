"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AvatarCropper, type CroppedAvatar } from "@/app/(app)/profile/avatar-cropper";
import { setAvatarPathAction } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

import { completeProfileAction } from "./actions";

type Snapshot = {
  fullName: string;
  nickname: string;
  phone: string;
  collegeName: string;
  rollNumber: string;
  dateOfBirth: string;
  address: string;
  avatarUrl: string | null;
};

type Feedback = { kind: "ok"; message: string } | { kind: "error"; message: string } | null;

type Props = {
  snapshot: Snapshot;
  /** Authenticated user id — used to scope the avatar's storage path. */
  userId: string;
};

/**
 * Profile-completion form. Collects the mandatory fields (name,
 * nickname, mobile, college, roll) plus optional DOB / address /
 * photo. Submitting calls completeProfileAction which stamps
 * profile_completed_at, after which the (app) layout's gate lets
 * the user through to /pending-approval (the next holding pattern).
 *
 * The avatar uses the same cropper as /profile — uploaded straight
 * to Supabase Storage, then setAvatarPathAction writes the URL back
 * onto the profile. We don't block submission on photo upload since
 * it's optional.
 */
export function CompleteProfileForm({ snapshot, userId }: Props) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(snapshot.avatarUrl);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [savePending, startSaveTransition] = useTransition();
  const [avatarPending, setAvatarPending] = useState(false);

  async function handleAvatarApply(cropped: CroppedAvatar) {
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
      setAvatarUrl(`${data.publicUrl}?v=${Date.now()}`);
      setFeedback({ kind: "ok", message: "Photo uploaded." });
    } finally {
      setAvatarPending(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarPending(true);
    setFeedback(null);
    try {
      const result = await setAvatarPathAction(null);
      if (result.status === "error") {
        setFeedback({ kind: "error", message: result.message });
        return;
      }
      setAvatarUrl(null);
    } finally {
      setAvatarPending(false);
    }
  }

  return (
    <form
      action={(formData) => {
        setFeedback(null);
        startSaveTransition(async () => {
          const result = await completeProfileAction(formData);
          if (result.status === "ok") {
            router.replace("/pending-approval");
          } else {
            setFeedback({ kind: "error", message: result.message });
          }
        });
      }}
      className="flex flex-col gap-6"
    >
      <fieldset className="flex flex-col gap-5">
        <legend className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Required
        </legend>

        <Field
          label="Full name"
          name="full_name"
          required
          autoComplete="name"
          defaultValue={snapshot.fullName}
          helper="As it appears on your roll list."
        />
        <Field
          label="Nickname"
          name="nickname"
          required
          autoComplete="nickname"
          defaultValue={snapshot.nickname}
          helper="What you'd like to be called day-to-day."
          maxLength={40}
        />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={snapshot.phone}
          helper="Used by admin if they need to reach you."
        />
        <Field
          label="Name of College"
          name="college_name"
          required
          autoComplete="organization"
          defaultValue={snapshot.collegeName}
          helper="Free text — your medical college / institution."
          maxLength={200}
        />
        <Field
          label="Roll number"
          name="roll_number"
          required
          defaultValue={snapshot.rollNumber}
          helper="Whatever your institution uses — letters, digits, dots, dashes are all fine."
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5">
        <legend className="text-muted-foreground text-sm font-medium tracking-widest uppercase">
          Optional
        </legend>

        <Field
          label="Date of birth"
          name="date_of_birth"
          type="date"
          defaultValue={snapshot.dateOfBirth}
          helper="Visible only to you and to your administrators."
        />
        <TextArea
          label="Permanent address"
          name="address"
          defaultValue={snapshot.address}
          helper="House / lane, town, district, PIN — whatever level of detail you'd like to share."
        />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-muted-foreground text-xs">
            Optional. Crops to a circle, scaled to 256×256.
          </p>
          <AvatarCropper
            initialAvatarUrl={avatarUrl}
            pending={avatarPending}
            onApply={handleAvatarApply}
            onRemove={avatarUrl ? handleAvatarRemove : undefined}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={savePending}>
          {savePending ? "Saving…" : "Save and continue"}
        </Button>
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
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  helper,
  required,
  autoComplete,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  helper?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}) {
  const id = `complete-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive ml-1">*</span> : null}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
      />
      {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  helper,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  helper?: string;
}) {
  const id = `complete-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        rows={3}
        className="border-input bg-background min-h-20 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
      />
      {helper ? <p className="text-muted-foreground text-xs">{helper}</p> : null}
    </div>
  );
}
