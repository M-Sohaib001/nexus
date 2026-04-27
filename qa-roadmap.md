# Nexus Platform - Comprehensive QA Roadmap

This document outlines an exhaustive, end-to-end quality assurance roadmap designed to validate the Nexus platform for immediate production deployment. It covers all core workflows, security boundaries, and edge cases.

## Phase 1: Infrastructure & Environment Setup
- [ ] **Clean Build Verification:** Run `npm run build` and ensure there are no compilation errors, type errors, or unhandled warnings.
- [ ] **Environment Variables:** Verify that all required environment variables are set in the production environment (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CLOUDINARY_URL`, etc.).
- [ ] **Database Migrations:** Ensure all Supabase SQL schemas and RLS policies are applied successfully on the production database.

## Phase 2: Authentication & Role Selection
- [ ] **Sign Up Flow:** Create a new user account. Verify that the user is immediately redirected to the role selection onboarding step (`/onboarding/role-select`).
- [ ] **Role Assignment (Student):** Select the "Student" role. Verify redirection to the student dashboard and that a corresponding row is created in the `students` table.
- [ ] **Role Assignment (Company):** Select the "Company Official" role. Verify redirection to the company dashboard and that a corresponding row is created in the `companies` table.
- [ ] **Login Flow:** Log out and log back in. Verify routing directs the user to their respective dashboard based on their assigned role.
- [ ] **Route Protection:** Attempt to access a `/company/*` route as a student, and a `/student/*` route as a company official. Verify that the middleware correctly blocks access and redirects to the appropriate dashboard.

## Phase 3: Student Workflows
- [ ] **Profile Management:** Update the student profile (name, degree, bio, graduation year). Verify the data saves successfully and persists on reload.
- [ ] **Resume Upload (Cloudinary):** Upload a PDF resume. Verify the progress indicator works, the file uploads successfully, and the URL is saved to the database.
- [ ] **Resume Parsing (Optional):** If PDF parsing is active, verify that skills and projects are extracted and populated into the respective fields.
- [ ] **Resume Deletion:** Remove the uploaded resume. Verify the UI updates and the `resume_url` is set to null in the database.
- [ ] **FYP Management:** Create, edit, and delete a Final Year Project. Verify validation rules (required fields) and optimistic UI updates.
- [ ] **Secondary Projects:** Add multiple projects, test GitHub and Live URLs, and verify they appear correctly on the public profile.
- [ ] **Professional Experience:** Add experiences with "Present" end dates and specific end dates. Verify chronological ordering.
- [ ] **Public Profile (QR Code):** Access the public student profile via the unique `[qr_token]`. Verify all data (FYP, projects, skills, resume link) renders correctly for an unauthenticated user.

## Phase 4: Company Workflows
- [ ] **Company Profile:** Update the company details (name, industry, logo, website). Verify data persistence.
- [ ] **Job Posting Creation:** Navigate to `/company/jobs/new`. Create a new job posting with requirements and location. Verify it appears in the active jobs list.
- [ ] **Job Posting Management:** Edit an existing job posting. Verify the changes are saved.
- [ ] **Student Discovery:** Access `/company/discover`. Use filters (Graduation Year, Availability, Tech Skill, AI-Native) and verify the talent grid updates accurately.
- [ ] **Interest Signaling:** "Signal" a student profile. Verify the state changes to "Bookmarked" and the signal is recorded in the `interest_signals` table.

## Phase 5: Application & CRM Interactions
- [ ] **Student Applying:** Log in as a student. Browse available jobs in `/student/jobs`. Click "Initiate Application" and submit an optional cover letter. Verify the status updates to "Application Submitted".
- [ ] **Company Reviewing Apps:** Log in as the company that posted the job. View the job details. Verify the student's application appears in the candidate applications list.
- [ ] **Application Status Updates:** As the company, change the application status (e.g., pending -> reviewed -> accepted). Verify the state persists.
- [ ] **CRM Board Navigation:** Navigate to `/company/crm`. Verify that students who have applied or have been signaled appear on the CRM board.
- [ ] **Realtime Conversation Cards:** Open a candidate's conversation card. Update the candidate tag (e.g., "STRONG FIT") and add a private note. Open a second browser window with the same company account and verify the note/tag updates in real-time (via Supabase Subscriptions).

## Phase 6: Security & Access Control (RLS)
- [ ] **Data Isolation (Students):** Ensure a student cannot modify or delete another student's FYPs or projects via API/Server actions.
- [ ] **Data Isolation (Companies):** Ensure a company cannot modify or delete another company's job postings or conversation notes.
- [ ] **Conversations View:** Verify the `conversations_public` view correctly enforces the `security_invoker = true` policy, preventing cross-user data leakage.
- [ ] **Job Application Integrity:** Ensure students can only apply to a job once and cannot alter their application status.

## Phase 7: UI/UX & Responsive Design
- [ ] **Mobile Responsiveness:** Test all major views (Dashboards, Discovery Grid, Public Profile, Job Portal) on mobile viewports. Ensure there is no horizontal scrolling and tap targets are accessible.
- [ ] **Loading States:** Verify that skeleton loaders or spinners appear during data fetches or mutations (especially on resume upload and job application).
- [ ] **Error Boundaries:** Intentionally trigger an error (e.g., invalid URL or failed action) and ensure the application degrades gracefully using the custom error boundaries.
- [ ] **Typography & Aesthetics:** Confirm the monospace font, uppercase styling, and cyberpunk aesthetic remain consistent across all new and existing components.

## Final Sign-Off
Once all items above are checked and verified without issues, the codebase is cleared for final production deployment.
