"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { exportMyDataAction, requestAccountDeletionAction } from "./privacy-actions";

/**
 * Privacy & data panel. Two affordances:
 *
 *   - Export my data: hits exportMyDataAction, materialises the JSON
 *     into a Blob, triggers a download. The filename includes the
 *     ISO date so multiple exports don't clobber each other in the
 *     downloads folder.
 *   - Request account deletion: shows a confirm step (the action is
 *     irreversible from the user's perspective — they sign out + the
 *     deletion is queued). Two-step pattern, no native confirm() so
 *     the dialog text is fully reviewable.
 *
 * Errors render inline rather than via a toast; the panel is small
 * and the user is reading the surrounding copy anyway.
 */
export function PrivacyPanel() {
  const [isExporting, startExport] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleExport() {
    setExportError(null);
    startExport(async () => {
      const result = await exportMyDataAction();
      if (result.status === "error") {
        setExportError(result.message);
        return;
      }
      const json = JSON.stringify(result.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `physio-scholar-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Slight delay before revoke so Safari finishes the download.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const result = await requestAccountDeletionAction();
      if (result.status === "error") {
        setDeleteError(result.message);
        return;
      }
      // On success the action redirects — control doesn't return here.
    });
  }

  return (
    <section
      aria-label="Privacy and data"
      className="border-border flex flex-col gap-6 rounded-md border p-5"
    >
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-medium">Privacy &amp; data</h2>
        <p className="text-muted-foreground text-sm">
          Your rights under DPDPA: you own the data you generate. Download a copy any time, or ask
          us to erase it.
        </p>
      </header>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Export my data</h3>
        <p className="text-muted-foreground text-xs">
          Downloads a JSON file containing your profile, every review you&apos;ve rated, your
          per-card scheduling state, content flags you&apos;ve raised, and your personal calendar
          events.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleExport} disabled={isExporting} variant="outline" size="sm">
            {isExporting ? "Preparing…" : "Download JSON"}
          </Button>
          {exportError ? (
            <p className="text-destructive text-xs" role="alert">
              {exportError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Delete my account</h3>
        <p className="text-muted-foreground text-xs">
          Requesting deletion signs you out and queues your data for permanent removal. We process
          pending deletions on a regular cadence; you can re-sign-up afterwards but your history
          will be gone.
        </p>
        {confirmDelete ? (
          <div className="border-destructive/50 bg-destructive/5 flex flex-col gap-2 rounded-md border p-3">
            <p className="text-sm">
              Are you sure? This is irreversible once we process the deletion.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleDelete} disabled={isDeleting} variant="destructive" size="sm">
                {isDeleting ? "Requesting…" : "Yes, delete my account"}
              </Button>
              <Button
                onClick={() => setConfirmDelete(false)}
                variant="outline"
                size="sm"
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </div>
            {deleteError ? (
              <p className="text-destructive text-xs" role="alert">
                {deleteError}
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <Button onClick={() => setConfirmDelete(true)} variant="outline" size="sm">
              Request deletion…
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
