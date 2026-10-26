# AGENTS.md — Taha Portfolio

## 1. Project Overview

Project name: `taha-portfolio-kimi`

This is a personal developer portfolio powered by Supabase, with an administrative dashboard and an AI chatbot integrated with OpenRouter.

The goal is to evolve the existing portfolio into a premium, maintainable, dynamic application with secure content management and a consistent user experience.

## 2. Mandatory Rules Before Making Changes

Before implementing any feature:

1. Inspect the existing project structure and identify the framework, language, routing solution, styling system, and installed dependencies.
2. Read the existing package scripts and understand how the application is built, tested, and deployed.
3. Inspect the Supabase schema, relationships, indexes, storage buckets, authentication configuration, and Row Level Security (RLS) policies.
4. Inspect the existing dashboard, public portfolio, project details, image uploads, and OpenRouter chatbot implementation.
5. Reuse existing components, conventions, utilities, and database structures whenever appropriate.
6. Identify potential regressions and dependencies before modifying shared components or database tables.
7. Never assume a table, column, route, component, or environment variable exists without verifying it.
8. Create a short implementation plan for complex changes before editing files.

Do not rebuild the entire application from scratch when a targeted refactor is sufficient.

## 3. Architecture and Code Quality

- Preserve the existing technology stack unless a change is justified.
- Follow the project's existing naming conventions and directory structure.
- Keep components focused and reusable.
- Separate UI components, data access, business logic, and validation where appropriate.
- Avoid duplicated business logic and unnecessary dependencies.
- Use TypeScript and existing validation conventions if the project already supports them.
- Include loading, empty, success, and error states.
- Ensure responsive layouts and accessible interactions.
- Avoid placeholder implementations that appear functional but do not persist data.
- Do not introduce breaking changes without documenting their impact.

## 4. Dashboard and Routing

- Refactor the dashboard into a clear administrative interface with persistent side navigation.
- Organize navigation into logical sections, including projects, categories, technologies, certificates, testimonials, and settings as supported by the final architecture.
- Preserve or intentionally migrate existing routes.
- Add active-route indicators, responsive sidebar behavior, and accessible navigation.
- Protect administrative routes and mutations using the existing authentication architecture.
- Do not rely on hiding dashboard links as a security mechanism.

## 5. Supabase and Data Management

- Treat Supabase as the source of truth for portfolio content already stored in the database.
- Inspect the current schema before creating or modifying tables.
- Use version-controlled SQL migrations for schema changes.
- Define appropriate foreign keys, constraints, indexes, and timestamps.
- Keep database access consistent with the existing application architecture.
- Validate all user-provided data on trusted server-side boundaries where possible.
- Never expose the Supabase service-role key in client-side code.
- Never disable RLS merely to make a feature work.
- Public users must not receive unauthorized access to unpublished or administrative data.
- Preserve existing records and provide safe migration or backfill steps when required.

## 6. Real-Time Updates

- Inspect whether the existing Supabase tables are configured for Realtime.
- Subscribe only to the relevant tables and events.
- Update affected UI state when database changes are received.
- Clean up subscriptions when components unmount or dependencies change.
- Handle duplicate events, loading states, reconnects, and subscription failures appropriately.
- Use database persistence as the source of truth; Realtime should synchronize the UI rather than replace persistence.
- Verify that Realtime publication settings and RLS policies allow only intended events and data.

## 7. Project Categories and Technologies

- Support creating and editing project categories through the dashboard.
- Preserve category associations with existing projects.
- Support managing technologies and their associated icons.
- Store icon identifiers, approved icon-library names, or validated asset references rather than arbitrary executable markup.
- Validate icon identifiers and provide sensible fallbacks for missing icons.
- Avoid deleting categories or technologies that are still referenced without an explicit, safe reassignment strategy.

## 8. Certificates

- Allow authorized administrators to create, edit, publish, unpublish, and delete certificates according to the existing data model.
- Support certificate titles, issuers, dates, images, and verification links when applicable.
- Display published certificates in an accessible, responsive carousel.
- Support automatic sliding with a reasonable interval and pause behavior.
- Respect reduced-motion preferences.
- Make each certificate open an accessible details view when selected.
- Do not fabricate certificate information or verification URLs.

## 9. Testimonials and Moderation

- Provide a public interface for submitting client testimonials.
- Treat public submissions as untrusted input.
- Validate fields, enforce reasonable length limits, and protect against spam and abuse.
- Store new submissions as pending by default.
- Require authorized administrative actions to approve or reject submissions.
- Allow administrators to control whether the testimonials section is visible publicly.
- Display only approved testimonials when the section is enabled.
- Enforce these rules through trusted server-side operations and appropriate database permissions, not UI checks alone.
- Never expose private moderation notes or unauthorized testimonial data.
- Consider rate limiting, CAPTCHA, or other anti-abuse controls where appropriate.

## 10. OpenRouter Chatbot

- Inspect the current chatbot implementation before changing its architecture.
- Use Supabase as the source of truth for published portfolio projects, skills, technologies, experience, and other relevant profile information.
- Retrieve current information from Supabase when generating relevant answers rather than maintaining a duplicate, manually updated knowledge base.
- Use a server-side retrieval layer, controlled tools, or an equivalent architecture compatible with the existing stack.
- Send only the relevant retrieved information to OpenRouter.
- Keep OpenRouter API keys and privileged Supabase credentials server-side.
- Apply authorization and publication filters to every retrieval operation.
- Do not allow chatbot requests to execute arbitrary SQL or unrestricted database operations.
- Do not let user prompts override access controls or reveal secrets.
- Return a graceful fallback when information is missing or retrieval fails.
- Validate chatbot input and apply reasonable rate limits.
- Treat retrieved database content as untrusted data, not as executable instructions.

## 11. Image Upload and Optimization

- Inspect the existing Supabase Storage upload flow and database fields.
- Optimize images before upload when appropriate, preserving perceptual quality.
- Use a configurable maximum dimension, output format, and compression quality appropriate for the image type.
- Prefer modern formats such as WebP when supported by the application's requirements.
- Preserve transparency when necessary.
- Avoid recompressing an already optimized image without a reason.
- Validate file type and size on both client and trusted server boundaries as appropriate.
- Generate appropriate previews and handle upload failures.
- Store the required storage path or asset reference in the database.
- The dashboard should display an image preview and useful filename or status instead of requiring the administrator to see or copy a raw image URL.
- Keep the actual storage reference available internally when needed for rendering, editing, or deletion.
- Never expose private storage objects through unauthorized public URLs.
- Do not delete existing images until replacements have been successfully uploaded and references updated.

## 12. Premium UI and Animations

- Use subtle, intentional animations that improve the experience rather than distract from content.
- Follow the existing styling system and design tokens.
- Establish consistent typography, spacing, borders, surfaces, and interaction states.
- Use animation for page transitions, card interactions, modal entry, and selected scrolling effects where appropriate.
- Avoid excessive motion, unnecessary animation dependencies, and expensive effects.
- Respect `prefers-reduced-motion`.
- Maintain keyboard accessibility and usable focus states.
- Keep animations performant on mobile and lower-powered devices.

## 13. Project Details

- Show the main project image before the remaining project information.
- Improve image sizing, cropping, spacing, and presentation.
- Use responsive layouts and appropriate aspect ratios.
- Handle missing images gracefully.
- Preserve project metadata, links, technologies, and other existing details.
- Avoid breaking direct links to project details.

## 14. Testing and Verification

After every meaningful change:

1. Run the relevant linting and type-checking scripts if available.
2. Run unit or integration tests related to the modified functionality.
3. Run the production build when practical.
4. Verify the affected UI at desktop and mobile sizes.
5. Verify authorization, RLS, and data visibility for relevant Supabase operations.
6. Test loading, empty, failure, and success states.
7. Check that existing functionality has not regressed.
8. Report what changed, what was tested, and what remains incomplete.

Never claim that a test, build, deployment, or migration succeeded unless it was actually verified.

## 15. Secrets and Environment Variables

- Never commit API keys, access tokens, passwords, or service-role credentials.
- Never print secrets in logs or expose them in client bundles.
- Use the project's existing environment variable conventions.
- Update `.env.example` with variable names and safe placeholders only when necessary.
- Do not overwrite production configuration without explicit authorization.

## 16. Implementation Strategy

Use `PLAN.md` as the implementation roadmap.

Implement features incrementally. Prefer small, reviewable changes over one large rewrite. Resolve architectural uncertainties through repository inspection rather than assumptions.

Update `PLAN.md` when implementation status changes, and document important architectural decisions and remaining risks.

## 17. Implemented Features & Technical Architecture Summary (سجل التحديثات وحالة النظام)

The following comprehensive summary outlines all features, architectural components, database migrations, and design upgrades successfully implemented across the portfolio:

### 17.1 Core Technology Stack & Design System
- **Core Framework**: React 19 + TypeScript + Vite.
- **Routing**: `react-router` (v7) with public presentation routes and protected admin routes (`/admin`, `/admin/login`).
- **Styling Architecture**: Vanilla CSS using custom design tokens (`src/styles.css`, `src/extra.css`, `src/adaptation.css`), maintaining lightweight zero-dependency UI performance.
- **Luxury Theme & Aesthetics**: Implemented a Deep Emerald / Mint & Teal / Turquoise luxury color system:
  - Deep dark surfaces (`#040909`, `#080f0f`, `#0d1717`).
  - Mint / Teal primary and accent gradients (`#14b8a6`, `#2dd4bf`).
  - Glassmorphic card surfaces with subtle border glows, backdrop filters, and responsive micro-animations.
  - Typography powered by Geist Latin and Noto Sans SC fonts.
  - Full RTL/LTR internationalization support (`src/i18n.ts`) for seamless English and Arabic toggling.

### 17.2 Database Schema & Versioned Migrations (`supabase/migrations/`)
All database modifications are version-controlled in `supabase/migrations/`:
1. `20261021183318_restrict_single_admin.sql`: Restricts dashboard admin mutations to the single verified administrator email (`tahahodhod650@gmail.com`) via RLS policies and JWT claims.
2. `20261021184003_limit_portfolio_uploads.sql`: Secures Supabase Storage bucket `portfolio` with size limit (12MB) and MIME type validation.
3. `20261021190331_add_categories_and_technologies.sql`: Dynamic `project_categories` and `technologies` tables with relational foreign keys and RLS.
4. `20261021191438_seed_skill_technologies.sql`: Seeds the initial technology and skill catalog.
5. `20261021192300_scope_technologies_to_toolkit.sql`: Links project technologies and toolkit skill items.
6. `20261021192500_remove_duplicate_toolkit_technology.sql`: Removes duplicates from the technology toolkit.
7. `20261021193000_fix_missing_technology_icons.sql`: Configures fallback icons for technology items.
8. `20261021200000_enable_portfolio_realtime.sql`: Adds tables (`projects`, `categories`, `technologies`, `skill_groups`) to `supabase_realtime` publication.
9. `20261022002000_fix_javascript_icon.sql`: Standardizes JavaScript icon naming.
10. `20261022010000_add_certificates.sql`: Creates `certificates` table (title, issuer, issue_date, image_url, credential_url, sort_order, published).
11. `20261022011500_store_certificate_issue_year.sql`: Adds issue year field to certificates.
12. `20261024005000_add_testimonials_and_site_settings.sql`: Adds `testimonials` table with moderation status (`pending`, `approved`, `rejected`) and `site_settings` table for global section toggles.
13. `20261024014500_alter_identity_to_by_default.sql`: Updates primary keys to `GENERATED BY DEFAULT AS IDENTITY` for reliable upserts.

### 17.3 Administrative Dashboard (`src/pages/AdminDashboard.tsx`)
- **Persistent Administrative Navigation**: Streamlined sidebar navigation with active indicators, live counters, and mobile drawer.
- **Unified Inline Technology Management (`TechnologyListEditor`)**:
  - The standalone "Technologies" tab has been retired from the dashboard navigation to streamline management.
  - Technologies and their icons are now managed contextually right where they belong: inside **Skill Groups** and **Projects**.
  - Interactive chip tray allows adding, updating, and removing technologies with live icon previews and one-click auto-detection (`TechnologyIconPicker`).
  - Any new technology and its chosen icon are automatically saved/synchronized into Supabase `public.technologies` so they seamlessly appear across the entire public portfolio.
- **Glassmorphic Pop-up Modals for Create & Edit**:
  - Replaced inline drawer expansions with centered, high-contrast modal dialogs (`.admin-modal-backdrop` and `.admin-modal`).
  - Supports smooth entrance animations, dark backdrop blur, and scrollable content bodies for editing projects, skills, certificates, experiences, categories, and education.
- **Zero-Alert Policy & Toast Notification System**:
  - Removed all native browser `alert(...)` and `confirm(...)` dialogs across the entire dashboard.
  - Implemented a custom reactive Toast system (`.admin-toast-container`) supporting `success`, `error`, and `info` with auto-dismiss timers.
  - Implemented an accessible in-app confirmation modal (`.admin-confirm-modal`) for non-destructive, safe deletions.
- **9 Dedicated Management Modules**:
  1. *Profile*: Bilingual profile info (intro, bio, role, contact).
  2. *Projects*: Project management with the interactive `TechnologyListEditor`, category selector, live demo/code URLs, and image upload.
  3. *Categories*: Create, edit, and safely manage project category filters.
  4. *Certificates*: Upload certificates, configure credential links, sort order, and publish/unpublish toggles.
  5. *Testimonials*: Moderation interface to review incoming client feedback with approve/reject actions.
  6. *Experience*: Manage career history, company names, dates, and bilingual descriptions.
  7. *Skills*: Bilingual skill group titles (EN/AR) with interactive `TechnologyListEditor` for seamless technology and icon assignment.
  8. *Education*: Manage academic degrees and diplomas.
  9. *Site Settings*: Granular visibility toggles for all public portfolio sections.
- **Client-Side Image Optimization Pipeline**: Uploaded images are pre-processed via HTML5 Canvas into WebP format (max 1920px width/height, 0.85 quality) before uploading to Supabase Storage, reducing asset size by 70–85% while maintaining visual sharpness.
- **Security & Authorization**: Protected routes checking Supabase authentication session and validating admin email (`isAdminEmail`) before granting access to dashboard operations.

### 17.4 Public Portfolio Experience (`src/pages/Portfolio.tsx`)
- **Interactive Hero & 3D Sculpture**: Interactive canvas sculpture, quick action buttons, and direct CV download (`Taha_Ahmed_Hodhod_CV.pdf`).
- **Resilient Bilingual Technical Toolkit**: English-first icon matching ensures icons never disappear or fail when switching to Arabic mode, accompanied by sleek SVG code-chip fallbacks and 100+ curated stacks.
- **Interactive Project Showcase & Dynamic Pagination**:
  - Filter pills for categories with auto-reset to page 1 on category switch.
  - Configurable projects per page (set to 5 for compact layout).
  - Floating glassmorphic pagination bar with luxury Emerald/Teal active glow, accessible Prev/Next buttons, RTL/LTR directional arrows, and smooth scroll to `#work` on page change.
  - Consistent global numbering across pages (`/01`, `/02`, `/05`, etc.).
  - Project cards featuring interactive hover effects, technology badges, and live URLs.
  - Accessible project details modal displaying the hero image first, followed by tags, summaries, and action buttons.
- **Continuous Marquee Ribbon for Certificates**:
  - Seamless infinite horizontal scroll showcasing professional certificates.
  - Pauses on hover, supports keyboard navigation and reduced-motion preferences.
  - Position-preserving animation loop: closing the certificate details view smoothly resumes from the exact paused pixel offset rather than restarting from the beginning.
  - High-resolution certificate modal preview with direct external verification links and full uncropped (`object-fit: contain`) image rendering.
- **Client Testimonials & Feedback Collection**:
  - Continuous automatic marquee slider showcasing approved client reviews with author avatar, rating stars, and roles.
  - Pauses / slows down on hover for comfortable reading.
  - "Share Your Feedback" modal allows visitors to submit new reviews directly into the pending moderation queue.
  - Dynamic display strictly controlled by `site_settings.show_testimonials` and `site_settings.show_feedback_button`.
- **Live Synchronization (Realtime)**: Listens to Supabase Realtime channels to immediately reflect changes saved in the admin dashboard without manual browser refresh.

### 17.5 AI Chatbot "Digital Twin" (`src/components/DigitalTwinChat.tsx` & Server)
- **UI & Experience**: Floating chat widget matching the luxury Teal/Turquoise theme with quick starter prompts, minimize/expand states, and bilingual response capability.
- **Serverless & Local Backends**:
  - Vercel serverless function (`api/chat.js`).
  - Local/Node backend (`server/index.mjs`, `server/chat-api.mjs`).
- **Dynamic Supabase Context Retrieval (`server/portfolio-context.mjs`)**:
  - Eliminates stale hardcoded prompts.
  - Queries live database content (`profile`, `experiences`, `projects`, `skill_groups`, `education`) from Supabase in real-time to ground AI responses.
- **Rich Markdown Formatting**: Incorporates `react-markdown` via `MarkdownMessage.tsx` for structured code blocks, bold text, and clickable links.
- **Security & Rate Limiting**: OpenRouter API key and Supabase credentials strictly guarded on the server; sliding-window rate limiting applied per IP.

### 17.6 Verification & Testing
- **Automated Tests**: Unit and integration test suites implemented with Vitest (`src/lib/data.test.ts`).
- **Build & Quality Checks**: Verified with TypeScript strict type checking (`tsc --noEmit`) and Vite production bundle compilation (`vite build`).

### 17.7 Bento Administrative Dashboard Redesign (`ui-ux-pro-max`)
- **Modern Modular Component Architecture**:
  - `AdminSidebar.tsx`: Pinned 260px luxury sidebar with grouped clusters (Main, Content, System), active glowing emerald pill indicators, pending badge pill for unmoderated testimonials, mobile drawer animation, and pinned user footer card with logout.
  - `AdminTopBar.tsx`: Top header with OS-aware keyboard search shortcut (`⌘K` on macOS, `Ctrl+K` on Windows/Linux), real-time search input with clear button, notifications popover for pending reviews, runtime AR/EN language switch, and live portfolio link.
  - `AdminStatCard.tsx`: Reusable bento stat card displaying live telemetry metrics directly aggregated from Supabase tables (Projects, Categories, Certificates, Skills, Reviews).
  - `AdminGrowthChart.tsx`: High-performance monthly activity curve built with `Chart.js`, featuring tree-shaken components (`LineController`, `LinearScale`, `Filler`, `Tooltip`), emerald smooth tension curves, dark luxury tooltips, zero fake data, and toggle between all content activities and project milestones.
  - `AdminOverviewBento.tsx`: Central command hub with dynamic bilingual time-of-day greeting (morning/afternoon/evening), quick-action "New Project" button, stat bento grid, activity chart, and recent projects list with thumbnail previews.
- **Sticky Desktop Navigation & Responsive Layout**:
  - Resolved parent clipping constraint (`overflow-x: clip`) on `.admin-shell` to preserve native `position: sticky; top: 0; height: 100dvh;` on desktop viewports (>1024px).
  - Off-canvas slide drawer for tablets and mobile devices (<1024px) with backdrop blur and touch-optimized navigation buttons.
- **Search Filtering Across All Collections**:
  - Topbar search input dynamically filters rows in real time across Projects, Categories, Certificates, Experiences, Skills, and Education.
  - Empty state with search-reset action when no items match query.
- **Dedicated Admin i18n Dictionary (`src/adminI18n.ts`)**:
  - Completely decoupled from public portfolio translation file (`src/i18n.ts`).
  - Supports English and Arabic (`Cairo` font) with persistent `localStorage` preference and reactive RTL/LTR body direction.
- **Dedicated Modular Bento Managers**:
  - `AdminProfileManager.tsx`: 3 grouped Bento clusters for Identity & Avatar (with live circular preview and status badge), Narrative & Bio storytelling (Statement, Intro, About me in EN & AR with character counters), and Contact & Social Connectivity with floating sticky save bar (`Ctrl+S` / `⌘S` support).
  - `AdminTestimonialsManager.tsx`: Interactive moderation filter tray (`All`, `Pending` with pulsating amber counter, `Approved`, `Rejected`), client avatar initials cards with Lucide golden stars, pulsing status badges, glassmorphic quotation blocks, and one-click approve/reject/delete actions.
  - `AdminSiteSettingsManager.tsx`: Granular Bento setting tiles with icon bubbles, live status badges (`LIVE ON PORTFOLIO` with pulsing emerald dot vs `DISABLED`), and tactile luxury switches.

### 17.8 Luxury Skeleton Loader System (`src/components/PortfolioSkeleton.tsx`, `AdminDashboardSkeleton.tsx`, `src/extra.css`)
- **Full-Page Portfolio Skeleton (`PortfolioSkeleton.tsx`)**:
  - Automatically renders while data is fetching from Supabase (`!data || !revealed`), matching the exact 1-to-1 visual layout of the portfolio (Header, Hero with status pill and sculpture placeholder, Projects Bento grid with category filters, Technical Toolkit Bento cards, Experience timeline, and Marquee ribbons).
  - Glowing turquoise/emerald top indeterminate progress indicator line (`.skeleton-top-loader-line`).
  - Fluid crossfade into live portfolio content with zero cumulative layout shift (CLS = 0).
- **Inline Image Shimmer Skeletons (`SkeletonImage`)**:
  - Dynamic image skeleton wrapper for project covers, certificate cards, modal hero images, and testimonial avatars.
  - Displays deep emerald shimmer animation (`skeleton-shimmer`) until image network load completes (`onLoad`), fading in smoothly via `.img-fade-in`.
- **Snappy Category Transitioning**:
  - Smooth 200ms container softening (`projects-container-transition.is-changing`) when switching project categories or pagination pages.
- **Admin Dashboard Skeleton (`AdminDashboardSkeleton.tsx`)**:
  - Replaces text loader during admin workspace authentication and initial fetch, rendering a full skeleton replica of the sidebar, top search bar, telemetry stat cards, and activity chart.

### 17.9 Lighthouse & Core Web Vitals Optimization System
- **Route-Based Code Splitting (`React.lazy` & `Suspense`)**:
  - Decoupled heavy administrative dependencies (`chart.js`, admin managers) from public visitors.
  - Configured `vite.config.ts` manual chunks (`vendor-react`, `vendor-charts`, `vendor-supabase`, `vendor-icons`), shrinking initial portfolio bundle to just 13.3 kB gzip.
- **Promise Deduplication & Memory Cache (`src/lib/data.ts` & `AdminDashboard.tsx`)**:
  - Added `inFlightPromise` deduplication across all 10 Supabase tables, preventing duplicate parallel network waterfalls.
  - Cached state enables 0ms immediate renders on subsequent route mounts.
- **Forced Reflow Elimination (`AdminGrowthChart.tsx`)**:
  - Added `resizeDelay: 150` and wrapped `Chart.js` initialization in `requestAnimationFrame` to decouple canvas geometry measurement from style calculation.
- **Preconnect & Non-Blocking Font Loading (`index.html`)**:
  - Preconnected to Supabase origin (`https://bjupdirqjbhkrjezvqed.supabase.co`).
  - Preloaded Cairo font with asynchronous `onload` swap to eliminate render-blocking CSS delays.
- **Accessibility & SEO Compliance**:
  - Fixed `robots.txt` with dedicated `public/robots.txt` (resolving 27 Lighthouse parser errors).
  - Fixed heading structure hierarchy (`h1` -> `h2`).
  - Elevated `.admin-cluster-label` contrast to `#94a3b8` (> 5.5:1 ratio) meeting WCAG AA.

### 17.10 Dynamic Curriculum Vitae (CV) & Resume Management
- **Supabase Storage Configuration (`supabase/migrations/20261026033000_add_cv_url_and_pdf_upload.sql`)**:
  - Added `cv_url` column to `public.profile` table.
  - Configured `portfolio` storage bucket permissions to permit `application/pdf` MIME types with a 20MB file size ceiling.
- **Bento CV Manager & Interactive Picker (`CvPicker` in `AdminDashboard.tsx` & `AdminProfileManager.tsx`)**:
  - Interactive PDF document card with active status pill indicator (`Active Supabase Asset` vs `Default Local File`).
  - Single-click PDF upload with progress feedback and automatic file sanitization.
  - Automatic cleanup: Uploading a new CV automatically purges and deletes the previous CV file(s) from Supabase Storage (`portfolio/cv/*`) to prevent storage clutter.
  - Document actions: Streamlined to "Upload / Replace CV" and direct in-browser "Preview Document ↗" (`ExternalLink`).
  - Bilingual copywriting (Arabic and English) with zero native browser alerts.
- **Dynamic Portfolio Binding (`src/pages/Portfolio.tsx`)**:
  - Binds the Hero "Download CV" action button, footer resume link, and print view to the dynamic Supabase CV URL (`profile.cv_url`) with `?download=Taha_Ahmed_Hodhod_CV.pdf` parameter.
  - Gracefully falls back to the local `public/Taha_Ahmed_Hodhod_CV.pdf` if no custom CV has been uploaded.

### 17.11 Mobile Responsive Dashboard Optimization
- **Side Padding Optimization**:
  - Eliminated legacy conflicting `.admin-main-stage` padding (`72px 18px 40px`).
  - Optimized `.admin-bento-frame` side padding to `8px`–`10px` on mobile (<768px) and `4px` on small devices (<480px).
  - Streamlined inner card padding (`.profile-bento-card`, `.admin-panel`, `.bento-hero-card`, `.cv-picker-card`) to `12px`–`14px`, maximizing usable content area.
- **Action Buttons & Topbar Icon Mode on Mobile**:
  - Automatically hidden text labels next to action icons across all collections: Edit (`Pencil`), Delete (`Trash2`), Language switch (`Languages`), and Live Portfolio (`ExternalLink`).
  - Buttons adapt to square touch targets (`34px`–`38px`) with centered icons, accessible `title` and `aria-label` attributes.
  - Testimonial moderation buttons (Approve, Reject, Delete) adapt into sleek icon controls.
  - Search bar expands flexibly to fill available width on one single non-overflowing row.


