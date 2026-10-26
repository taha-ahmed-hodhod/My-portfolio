# PLAN.md — Taha Portfolio Upgrade

## Project

- Project name: `taha-portfolio-kimi`
- Backend and database: Supabase
- AI provider: OpenRouter
- Supabase MCP: Connected to the project, subject to the configured MCP permissions.
- Main objective: Build a premium, dynamic portfolio with a secure, maintainable administration dashboard.

## Core Principles

1. Inspect before implementing.
2. Preserve existing working features.
3. Use Supabase as the source of truth for portfolio content.
4. Secure database operations before exposing new public features.
5. Implement and verify features incrementally.
6. Avoid duplicating portfolio data in chatbot prompts or frontend constants.
7. Treat visual polish and functional correctness as equally important.

---

## Phase 0 — Repository and Database Audit

### Tasks

- [ ] Inspect the repository structure and framework.
- [ ] Inspect package scripts, dependencies, and deployment configuration.
- [ ] Identify existing public routes and dashboard routes.
- [ ] Review dashboard components and styling conventions.
- [ ] Inspect Supabase tables, relationships, indexes, RLS policies, and Storage buckets.
- [ ] Review existing authentication and administrative authorization.
- [ ] Identify how projects, categories, technologies, and experience are stored.
- [ ] Inspect the current OpenRouter chatbot and how it receives context.
- [ ] Inspect image uploads and project details rendering.
- [ ] Determine the existing Supabase Realtime configuration.
- [ ] Document missing capabilities and potential regressions.

### Acceptance Criteria

- The current architecture is documented.
- Existing data structures and reusable components are identified.
- Proposed schema changes are based on the actual database.
- No application behavior has been changed during the audit.

---

## Phase 1 — Dashboard Redesign

### Tasks

- [ ] Establish a consistent dashboard layout.
- [ ] Add a persistent sidebar containing the main administrative routes.
- [ ] Organize routes into logical sections.
- [ ] Add active navigation states and responsive sidebar behavior.
- [ ] Improve page headers, action buttons, forms, tables, and content cards.
- [ ] Add consistent loading, error, empty, and success states.
- [ ] Preserve existing route behavior where possible.
- [ ] Verify administrative access protection.

### Acceptance Criteria

- Administrators can navigate between management sections using the sidebar.
- The active route is clearly indicated.
- The layout works on desktop and mobile.
- Existing dashboard operations continue to work.
- Unauthorized users cannot perform administrative operations.

---

## Phase 2 — Categories and Technologies Management

### Project Categories

- [ ] Inspect the current category representation.
- [ ] Support creating new categories.
- [ ] Support editing existing categories.
- [ ] Support assigning and removing categories from projects.
- [ ] Handle duplicate names and invalid values.
- [ ] Define safe deletion or reassignment behavior.
- [ ] Ensure category changes are reflected in project filters and displays.

### Technology Icons

- [ ] Inspect how project technologies are currently stored.
- [ ] Add or extend technology management in the dashboard.
- [ ] Support technology names and approved icon identifiers or asset references.
- [ ] Allow administrators to assign technologies to projects.
- [ ] Render technology icons consistently in cards and project details.
- [ ] Provide fallbacks for unavailable icons.

### Acceptance Criteria

- Administrators can create and edit categories without code changes.
- Existing project-category associations remain intact.
- Technology names and icons are manageable through the dashboard.
- Invalid or unsupported icons do not break the interface.

---

## Phase 3 — Certificates Management and Carousel

### Tasks

- [ ] Define or adapt the certificate data model.
- [ ] Add certificate creation, editing, publication, and removal controls.
- [ ] Support certificate title, issuer, issue date, image, and optional verification URL.
- [ ] Optimize certificate images through the shared upload pipeline.
- [ ] Build a responsive certificate slider.
- [ ] Enable automatic sliding with a configurable interval.
- [ ] Add manual navigation and accessible interaction controls.
- [ ] Open certificate details when a certificate is selected.
- [ ] Pause or adapt automatic movement when appropriate.
- [ ] Respect reduced-motion preferences.

### Acceptance Criteria

- Published certificates appear in the public portfolio.
- The slider advances automatically and remains manually navigable.
- Selecting a certificate opens its details.
- Unpublished certificates are not visible publicly.
- Missing certificate images are handled gracefully.

---

## Phase 4 — Client Testimonials and Moderation

### Public Experience

- [ ] Add a testimonials section.
- [ ] Add a clear "Share Your Feedback" / "شاركنا رأيك" button.
- [ ] Build an accessible testimonial submission form.
- [ ] Validate name, feedback, and any optional fields.
- [ ] Create new submissions with pending status.
- [ ] Provide confirmation and error feedback after submission.

### Dashboard

- [ ] Add a testimonials management page.
- [ ] List submissions and their moderation statuses.
- [ ] Support approving and rejecting individual submissions.
- [ ] Add a setting to show or hide the public testimonials section.
- [ ] Display only approved testimonials when the section is enabled.

### Security

- [ ] Enforce moderation permissions through trusted database policies or server-side operations.
- [ ] Prevent public users from approving or editing other submissions.
- [ ] Add appropriate anti-spam and rate-limiting protections.
- [ ] Avoid exposing private moderation information.

### Acceptance Criteria

- Visitors can submit feedback without gaining administrative access.
- New submissions remain hidden until approved.
- Administrators can approve or reject feedback.
- Hiding the section removes it from the public experience.
- Unauthorized moderation operations are rejected.

---

## Phase 5 — Image Optimization and Upload UX

### Tasks

- [ ] Inspect the existing upload flow and Supabase Storage configuration.
- [ ] Implement an image-processing utility or appropriate image-processing service.
- [ ] Resize oversized images according to configurable dimension limits.
- [ ] Compress images while preserving visually acceptable quality.
- [ ] Use WebP or another appropriate format when compatible.
- [ ] Preserve transparency and handle unsupported formats safely.
- [ ] Display image previews in the dashboard.
- [ ] Replace raw URL text fields with a visual image picker or upload component where practical.
- [ ] Keep the storage path internally for rendering and updates.
- [ ] Handle replacement and deletion without breaking existing content.

### Acceptance Criteria

- Uploads are optimized before storage when applicable.
- Image quality remains visually acceptable at actual display sizes.
- Administrators can select and preview images without manually copying image URLs.
- Existing images continue to render.
- Failed uploads do not corrupt existing records or delete working assets.

### Important Distinction

Hiding the raw image URL from the dashboard is a UI requirement, not a requirement to remove the underlying asset reference. The application still needs a storage path, asset identifier, or URL to render the image.

---

## Phase 6 — Premium Portfolio UI and Project Details

### Tasks

- [ ] Establish a consistent visual system for typography, spacing, colors, borders, and surfaces.
- [ ] Improve project cards and hover interactions.
- [ ] Add subtle entrance animations and selected page transitions.
- [ ] Improve buttons, navigation interactions, and modal transitions.
- [ ] Optimize animations for performance.
- [ ] Respect reduced-motion preferences.
- [ ] Refactor project details presentation.
- [ ] Move the main project image to the beginning of the details view.
- [ ] Improve image aspect ratio, cropping, spacing, and visual hierarchy.
- [ ] Organize description, technologies, features, and links beneath the main image.
- [ ] Verify responsive behavior and keyboard accessibility.

### Acceptance Criteria

- The portfolio feels visually consistent and premium.
- Animations improve the experience without distracting from content.
- The project image is the first major visual element in project details.
- Details remain readable and attractive on mobile.
- Reduced-motion settings are respected.

---

## Phase 7 — Supabase Realtime Synchronization

### Tasks

- [ ] Verify the current Supabase Realtime configuration.
- [ ] Identify which public views should update automatically.
- [ ] Configure required tables for Realtime if appropriate.
- [ ] Subscribe to relevant insert, update, and delete events.
- [ ] Synchronize public project, category, technology, certificate, and testimonial views as applicable.
- [ ] Handle subscription cleanup and reconnection behavior.
- [ ] Avoid duplicate subscriptions and unnecessary full-page reloads.
- [ ] Preserve RLS and publication rules.

### Acceptance Criteria

- A successfully saved dashboard change appears in the relevant public view without a manual refresh, where Realtime is enabled.
- Changes are persisted in Supabase.
- Unpublished, pending, and private content remains hidden.
- Subscription failures do not break the rest of the application.

---

## Phase 8 — OpenRouter Chatbot with Live Portfolio Data

### Goal

Make the chatbot answer questions about current projects, skills, technologies, and experience using the actual published portfolio data stored in Supabase.

### Recommended Architecture

1. A visitor asks the chatbot a question.
2. The application sends the question to a trusted server-side endpoint.
3. The server identifies the relevant information needed to answer.
4. The server retrieves published portfolio data from Supabase.
5. The server constructs a bounded context containing only relevant fields.
6. The server calls OpenRouter with the visitor's question and retrieved context.
7. The chatbot returns a grounded answer.
8. Missing information is acknowledged instead of invented.

### Tasks

- [ ] Inspect the current OpenRouter integration and request flow.
- [ ] Identify the actual tables and fields containing projects, experience, technologies, and profile information.
- [ ] Implement server-side data retrieval using the existing framework.
- [ ] Filter out unpublished or unauthorized content.
- [ ] Retrieve relevant records based on the question.
- [ ] Keep OpenRouter and privileged Supabase credentials on the server.
- [ ] Restrict database access to specific, validated operations.
- [ ] Validate user input and apply appropriate rate limits.
- [ ] Add safe fallbacks for missing data and provider failures.
- [ ] Test questions about newly added and recently edited projects.
- [ ] Verify that changing portfolio content does not require editing chatbot prompts manually.

### Acceptance Criteria

- The chatbot can answer questions using current published projects and experience.
- Adding or editing database content updates future chatbot answers without duplicating that content in source code.
- The chatbot does not expose unpublished information or privileged credentials.
- Unsupported answers are handled gracefully.

### Important Design Decision

Do not assume that Supabase MCP automatically gives the deployed chatbot database access. MCP is a development integration unless a runtime MCP connection is explicitly configured.

The production chatbot should have its own controlled server-side retrieval path. It can use the same Supabase project without exposing MCP credentials or privileged keys to visitors.

A vector database or embeddings are optional. Start with direct queries and metadata filtering if the portfolio is small. Add semantic retrieval only if the amount or complexity of information justifies it.

---

## Phase 9 — Integration, Testing, and Release

### Tasks

- [ ] Run linting and type checks where configured.
- [ ] Run relevant unit and integration tests.
- [ ] Verify the production build.
- [ ] Test dashboard authentication and administrative operations.
- [ ] Test RLS and public versus private data access.
- [ ] Test project, category, and technology CRUD operations.
- [ ] Test certificate publication and automatic sliding.
- [ ] Test testimonial submission and moderation.
- [ ] Test optimized image uploads and replacements.
- [ ] Test Realtime updates across dashboard and public views.
- [ ] Test chatbot responses after adding or editing database records.
- [ ] Test responsive layouts and reduced-motion behavior.
- [ ] Document environment variables and deployment requirements.
- [ ] Verify database migrations and deployment readiness.

### Acceptance Criteria

- The production build succeeds.
- Critical workflows pass their relevant tests.
- Security-sensitive database operations are verified.
- No secrets are committed.
- Remaining issues and manual deployment steps are documented.

---

## Recommended Implementation Order

1. Repository and database audit.
2. Dashboard foundation and sidebar.
3. Categories and technology management.
4. Image upload optimization.
5. Certificates management.
6. Testimonials and moderation.
7. Project details and premium UI.
8. Supabase Realtime.
9. OpenRouter chatbot data retrieval.
10. Integration testing and release.

The implementation order may be adjusted after the audit reveals dependencies in the existing codebase.

## Final Delivery Checklist

- [x] `AGENTS.md` reflects the actual project conventions.
- [x] `PLAN.md` reflects verified architecture and implementation status.
- [x] Database migrations are version-controlled in `supabase/migrations/`.
- [x] Existing data and working routes are preserved.
- [x] All new public and administrative flows have appropriate security and RLS.
- [x] Every completed feature has been tested (Vitest, TypeScript, Vite build).
- [x] Testimonials toggle strictly controls "Share Your Feedback" button.
- [x] Global Settings panel includes granular switches for all portfolio sections.
- [x] Certificates section features smooth continuous right-to-left marquee without sliders.
- [x] Chatbot completely restyled to pure Teal / Turquoise luxury aesthetic.
- [x] Administrative Dashboard completely redesigned into luxury Bento architecture (`ui-ux-pro-max`).
- [x] Pinned sticky sidebar with grouped clusters, live counters, and mobile drawer.
- [x] Topbar with OS-aware shortcut (`⌘K` / `Ctrl+K`), live search filter, and reviews notifications popover.
- [x] Real monthly telemetry growth chart built with `Chart.js` canvas and Supabase timestamps.
- [x] Decoupled Admin i18n dictionary (`src/adminI18n.ts`) with runtime Arabic / English switching and RTL/LTR support.
- [x] Full accessibility with keyboard focus rings, Escape key modal dismiss, and reduced-motion support.
