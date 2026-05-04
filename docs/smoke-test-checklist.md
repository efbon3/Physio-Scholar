# Smoke test checklist — Faculty Platform + module tweaks

Walk this top to bottom in a browser. Each item is one click-through; tick when verified. The order matters — later items depend on data created earlier.

Production URL: https://physio-scholar.vercel.app

---

## 0. Prerequisites (admin)

Sign in as the admin (your account). Then on `/admin`:

- [ ] **Attendance codes seeded.** Open `/admin/attendance`. Add at least:
  - `P` / Present / counts toward total
  - `A` / Absent / counts toward total
  - `EX` / Excused / does NOT count toward total
- [ ] **Grade thresholds saved.** On the same page, the default A/B/C/D rows are present; tap Save once just to confirm the form works.
- [ ] **Attendance threshold saved.** Same page — confirm the 75% default sticks.
- [ ] **At least one batch exists.** `/admin/batches`. Add "Pilot 2026 Year 1" or similar with year of study = 1.
- [ ] **At least one department exists.** `/admin/departments`. Add "Physiology". Set HOD when you have one.

## 1. User roles round-trip

- [ ] On `/admin/users` open one of your test accounts. The role dropdown shows **Student / Faculty / DEO / HOD / Admin**.
- [ ] Set one test account to **Faculty**. Reload — `/admin/users/[id]` reflects the change. The flag `is_faculty` should be true on the row.
- [ ] Set another test account to **DEO**. Same reload check.
- [ ] Set a third to **HOD** with department = Physiology. Reload.
- [ ] Set a fourth to **Student** with batch = Pilot 2026 Year 1.

---

## 2. Faculty surfaces (sign in as the Faculty test user)

- [ ] `/faculty` shows the Faculty hub. Cohort + Assignments + Announcements + Schedule + Per-student tiles all visible.
- [ ] **Create assignment.** `/faculty/assignments` → fill title + max_marks 100 + paste a Google Form URL → Submit. Row lands as **Draft**.
- [ ] Click "Submit for review". Status flips to **Pending HOD**.
- [ ] **Create announcement.** `/faculty/announcements` → title + body → Submit for review. Status **Pending HOD**.
- [ ] **Create class session.** `/faculty/schedule` → topic, future date, duration, batch. Save. Status **Draft**, lifecycle **Scheduled**. Click "Submit for review" → **Pending HOD**.
- [ ] **PDF download** button visible top-right on each list page. Click — print dialog opens. Cancel.

## 3. HOD review (sign in as the HOD test user)

- [ ] `/faculty` shows **HOD** label and an Approval queue tile with count = 3.
- [ ] `/faculty/approvals` lists three sections: Assignments (1), Announcements (1), Class schedule (1).
- [ ] On the assignment row: leave comment "looks good", click **Approve**. Row vanishes from queue.
- [ ] On the announcement: click **Request changes** with comment "shorten the title". Row vanishes.
- [ ] On the class session: click **Approve**. Row vanishes.
- [ ] Tile count on `/faculty` drops to 0 (or refresh).

## 4. DEO surfaces (sign in as the DEO test user)

- [ ] `/faculty` shows **DEO** label. Tiles are **Marks entry / Announcements / Schedule & attendance** (no Assignments authoring, no Cohort, no Per-student).
- [ ] **Create class session as DEO** at `/faculty/schedule`. Status lands as **Draft**. Submit for review.
- [ ] **Sign back in as HOD**, approve the DEO's session. Sign back as DEO — the row now shows **Approved**.

## 5. Marks entry round-trip (faculty or DEO)

- [ ] On the **approved** assignment, click "Enter marks →". Roster appears sorted by **roll number** (numeric-aware). Type marks for at least 2 students. Save. Confirmation appears.
- [ ] Reload — the marks persist.

## 6. Attendance round-trip (faculty or DEO)

- [ ] On an **approved** class session, click "Take attendance →". Roster appears with dropdowns. Click "Mark all unmarked as P". Change one student to **A**. Save. Confirmation.
- [ ] Reload — the codes persist.

## 7. Student surfaces (sign in as the Student test user)

- [ ] `/today` shows: greeting, "What would you like to study today?" with **★ Bookmarks** link, queue count, motivational quote.
- [ ] **Tiles**: Upcoming goals, Where you're slipping, Faculty homework, **My attendance**, **My marks**.
- [ ] **My attendance** shows the count for the session you marked — e.g. 1/1 or 0/1 depending on what you marked.
- [ ] **My marks** shows the assignment you graded with marks/max + percent + letter grade.
- [ ] **Click "Full report card →"** on My marks tile. `/me/marks` opens with a row per graded assignment + an Overall total.
- [ ] **Click "★ Bookmarks"** on /today header. `/me/bookmarks` opens; says "No bookmarks yet."
- [ ] **Inbox card** appears if HOD has sent any direct messages (skip if none).
- [ ] **Announcements card** lists the approved announcement with **Posted at <date+time>** (only after HOD approves it post-changes).
- [ ] **Faculty assignment URL link**: on the FacultyHomeworkCard tile, the assignment shows "Open assignment →" linking to the Google Form. Click — opens in a new tab.

## 8. Mechanism content surfaces (still student)

- [ ] `/systems` lists chapters. Click into one (e.g. Cardiac cycle).
- [ ] Chapter page shows the four reading layers + "Test yourself" button. Top-right has a **Download PDF** button.
- [ ] Tap "Test yourself" → MCQ. Answer one question.
- [ ] On reveal: **★ next to stem** + **"Report this card"** link both visible. Tap ★ — turns gold (filled). Tap again — outline.
- [ ] Tap "Report this card" → form opens with reason picker + notes. Cancel.
- [ ] Continue session, change format → fill-blank — same star + flag affordance.
- [ ] Same for descriptive.
- [ ] Tap a star to bookmark. Go to `/me/bookmarks` — the saved card appears with a stem snippet + chapter link.
- [ ] Open the chapter via the link, take a test, tap the star to **un**bookmark — `/me/bookmarks` is empty again.

## 9. Content flag round-trip

- [ ] As student: tap "Report this card" on a question → submit with reason "Stem is unclear".
- [ ] Sign in as **admin**. `/admin/flags` lists the flag. Click resolve → resolved or rejected.

## 10. PDF surfaces (any role)

- [ ] On each of these, the "Download PDF" button opens the print dialog. Save one as PDF and confirm the file is legible (no nav, no buttons, black-on-white):
  - [ ] `/me/marks` (student)
  - [ ] `/me/bookmarks` (student)
  - [ ] `/faculty/assignments/[id]/marks` (faculty)
  - [ ] `/faculty/schedule/[id]/attendance` (faculty)
  - [ ] `/faculty/schedule` (faculty)
  - [ ] `/faculty/assignments` (faculty)
  - [ ] `/faculty/announcements` (faculty)
  - [ ] `/(app)/systems/[system]/[mechanism]` (any)

## 11. Edit-after-approval re-review

- [ ] As faculty: open an **approved** assignment, edit the title. Save. The row should snap back to **Pending HOD** (the trigger does this automatically).
- [ ] Same test for an **approved** class session (edit topic).
- [ ] HOD sees both back in the queue.

## 12. Admin nav

- [ ] `/admin` header lists every admin tab + Faculty hub + Assignments + Schedule + Announcements + Approvals + Students.
- [ ] Each link routes correctly.

---

## Known gaps (won't be tested)

- **PWA / offline** — not built yet. App requires connectivity.
- **Phone / OTP / Google Sign-In** — V1.5+, email-password only.
- **Concurrent session detection / watermark** — not wired.
- **Privacy policy / ToS / DPDPA UI** — DB schema present, surfaces not built.

## What to file

If anything fails, note **page**, **action**, **expected**, **actual**, and (if applicable) the browser console error. The fastest fixes come from a screenshot + the Vercel runtime logs URL.
