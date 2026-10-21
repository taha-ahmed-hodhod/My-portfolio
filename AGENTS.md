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
