# Codebase Concerns

**Analysis Date:** 2026-01-28

## Starter Template Debt

**Unmodified Create-Next-App Template:**
- Issue: Codebase is a default bootstrapped Next.js project with placeholder content and no real application logic
- Files: `app/page.tsx`, `app/layout.tsx`, `next.config.ts`
- Impact: The application contains hardcoded links to Vercel documentation, template instructions, and no actual business functionality. Any future development must start by replacing all placeholder content.
- Fix approach: Remove template content from `app/page.tsx` and `app/layout.tsx`. Replace with actual application pages and layouts. This should be done early before any real feature development.

## Metadata and Branding Issues

**Outdated Application Metadata:**
- Issue: Metadata in `app/layout.tsx` references default placeholder values ("Create Next App")
- Files: `app/layout.tsx` (line 12: `title: "Create Next App"`)
- Impact: Incorrect metadata will be visible in browser tabs, search engine results, and social media previews. Users will see generic Next.js template information instead of the actual application name.
- Fix approach: Replace metadata values in `app/layout.tsx` with correct application title and description before deployment.

## Image and Asset References

**Placeholder SVG Assets:**
- Issue: Application loads default Next.js and Vercel logos from `public/` directory
- Files: `app/page.tsx` (lines using `src="/next.svg"` and `src="/vercel.svg"`)
- Impact: Assets are hardcoded and will not be available if the project is renamed or rebranded. Links in page point to external Vercel domains which is not appropriate for a production application.
- Fix approach: Replace placeholder images with actual application assets. Remove all external template links and replace with application-specific content.

## Configuration Minimalism

**Empty Next.js Configuration:**
- Issue: `next.config.ts` contains only a comment with no actual configuration
- Files: `next.config.ts`
- Impact: No security headers, redirects, image optimization rules, or environment-specific configurations are defined. This will become problematic as the application grows.
- Fix approach: Add necessary Next.js configurations for image optimization, security headers, rewrites, and other production concerns as features are developed.

## Incomplete Environment Setup

**No Environment Configuration:**
- Issue: No `.env.local` or `.env.example` file exists
- Files: Missing from project root
- Impact: No documented environment variables for developers. As soon as the application needs API keys, database URLs, or feature flags, developers will have no reference for what variables are required.
- Fix approach: Create `.env.example` documenting all required environment variables before adding any backend integration code.

## Path Alias Confusion

**Broad Path Alias Configuration:**
- Issue: `tsconfig.json` defines `@/*` to resolve to root directory
- Files: `tsconfig.json` (lines 34-36)
- Impact: The alias `@/*` can resolve to almost any file in the project, creating ambiguity. This is overly broad compared to common convention of pointing to a specific `src/` or `lib/` directory.
- Fix approach: Update tsconfig.json to use more specific paths like `@/components/*`, `@/lib/*`, `@/utils/*` as the project structure emerges.

## Zero Test Coverage

**No Testing Infrastructure:**
- Issue: No test files, test configuration, or testing framework is set up
- Files: None; missing entire test directory
- Impact: The codebase cannot be validated for correctness. As features are added, there is no way to ensure they work as intended or prevent regressions.
- Fix approach: Add testing framework (Jest or Vitest) with test configuration. Establish testing patterns early before business logic accumulates.

## Missing Security Configuration

**No Security Headers or CSP:**
- Issue: No security headers or Content Security Policy defined
- Files: `next.config.ts` is empty where headers should be defined
- Impact: Application will be vulnerable to XSS, clickjacking, and other header-based attacks in production.
- Fix approach: Add security headers to `next.config.ts` including Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, and Content-Security-Policy.

## TypeScript Strictness

**TypeScript Configuration Loose for New Project:**
- Issue: While `strict: true` is enabled, the tsconfig has `skipLibCheck: true` and resolveJsonModule without strict JSON typing
- Files: `tsconfig.json`
- Impact: Type safety gaps may develop as external libraries are added, since library types are not checked. JSON imports are untyped.
- Fix approach: Consider if `skipLibCheck` can be removed, and add typed JSON imports. This is appropriate to revisit once the project stabilizes.

## Unused Dependencies

**Potential Unused Dependencies:**
- Issue: Multiple dev dependencies added by create-next-app (@types packages, tailwindcss tools) but minimal code to verify they're all necessary
- Files: `package.json`
- Impact: Increases build size and supply chain risk without clear benefit. Harder to identify which packages are actually needed.
- Fix approach: As the project develops, audit which dev dependencies are actually used. Remove unnecessary ones.

## Build and Output Directories

**No Build Output Configuration:**
- Issue: Default Next.js build outputs to `.next/` which is gitignored
- Files: `.gitignore` (ignores `.next/`, `/out/`, `/build/`)
- Impact: Multiple build directories could accumulate confusion. If environment-specific builds are needed, configuration will be required.
- Fix approach: Document the build output strategy in README. Ensure CI/CD is configured to use the same build directory.

---

*Concerns audit: 2026-01-28*
