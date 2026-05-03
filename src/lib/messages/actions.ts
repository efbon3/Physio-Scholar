"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { writeAuditEntry } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

/**
 * Server actions for the weak_student_messages table (migration
 * 20260517). Two operations:
 *
 *   - sendMessageAction: HOD or admin → student. Body is required.
 *   - markMessageReadAction: student stamps read_at on a message
 *     they received.
 *
 * RLS does the actual gating; these actions check the caller upfront
 * so the failure mode for an unauthorised caller is a readable error
 * rather than a silent zero-row insert.
 */

export type MessageResult = { status: "ok"; id?: string } | { status: "error"; message: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const BODY_SCHEMA = z
  .string()
  .trim()
  .min(1, "Message body is required")
  .max(2000, "Message is too long");

/**
 * HOD / admin sends a message to a student. The caller and student
 * must share an institution (RLS enforces; this action checks early
 * to give a readable error). sender_id pins to auth.uid() so the
 * client can't impersonate.
 */
export async function sendMessageAction(recipientId: string, body: string): Promise<MessageResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Messages are unavailable in this environment." };
  }
  if (!UUID_RE.test(recipientId)) {
    return { status: "error", message: "Invalid recipient id." };
  }
  const parsedBody = BODY_SCHEMA.safeParse(body);
  if (!parsedBody.success) {
    return {
      status: "error",
      message: parsedBody.error.issues[0]?.message ?? "Invalid message body.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { data: caller } = await supabase
    .from("profiles")
    .select("role, is_admin, institution_id")
    .eq("id", user.id)
    .single();
  const callerRole = caller?.role ?? "student";
  const isApprover = Boolean(caller?.is_admin) || callerRole === "hod";
  if (!isApprover) {
    return { status: "error", message: "Only HOD or admin can message students." };
  }
  if (!caller?.institution_id) {
    return {
      status: "error",
      message: "Your profile is not linked to an institution.",
    };
  }

  const { data: recipient } = await supabase
    .from("profiles")
    .select("institution_id")
    .eq("id", recipientId)
    .single();
  if (!recipient || recipient.institution_id !== caller.institution_id) {
    return {
      status: "error",
      message: "Recipient must belong to your institution.",
    };
  }

  const { data, error } = await supabase
    .from("weak_student_messages")
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      institution_id: caller.institution_id,
      body: parsedBody.data,
    })
    .select("id")
    .single();
  if (error) {
    return { status: "error", message: `Could not send: ${error.message}` };
  }

  void writeAuditEntry({
    action: "message.send",
    target_type: "weak_student_messages",
    target_id: data.id,
    details: { recipient_id: recipientId },
  });

  revalidatePath(`/faculty/students/${recipientId}`);
  revalidatePath("/today");
  return { status: "ok", id: data.id };
}

/**
 * Student marks one of their inbox messages as read. The DB-level
 * trigger from migration 20260517 pins every other column back to
 * OLD, so this update can ONLY flip read_at — no body / sender
 * tampering possible.
 */
export async function markMessageReadAction(messageId: string): Promise<MessageResult> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "error", message: "Messages are unavailable in this environment." };
  }
  if (!UUID_RE.test(messageId)) {
    return { status: "error", message: "Invalid message id." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Please sign in." };

  const { error } = await supabase
    .from("weak_student_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("recipient_id", user.id);
  if (error) {
    return { status: "error", message: `Could not mark read: ${error.message}` };
  }

  revalidatePath("/today");
  return { status: "ok", id: messageId };
}
