# Coding Conventions

**Analysis Date:** 2026-01-28

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `page.tsx`, `layout.tsx`)
- Configuration files: lowercase with dots (e.g., `eslint.config.mjs`, `next.config.ts`, `postcss.config.mjs`)
- CSS modules: `globals.css` for global styles
- Type imports: `import type { TypeName } from "module"` for type-only imports (see `app/layout.tsx`)

**Functions:**
- React functional components: PascalCase (e.g., `Home`, `RootLayout`)
- Function parameters: camelCase (e.g., `children`, `className`)
- Font configuration functions: PascalCase constructors (e.g., `Geist`, `Geist_Mono`)

**Variables:**
- Constants: camelCase (e.g., `geistSans`, `geistMono`, `metadata`, `nextConfig`)
- CSS class names: kebab-case with Tailwind utility classes (e.g., `bg-zinc-50`, `dark:bg-black`)
- Inline styles: use Tailwind classes, not inline style objects

**Types:**
- Type annotations: Use `type` keyword for type-only declarations (e.g., `type { Metadata }` from Next.js)
- React component props: Use `Readonly<{ ... }>` wrapper for immutability (see `app/layout.tsx`)
- HTML/DOM types: Implicit through React type definitions

## Code Style

**Formatting:**
- ESLint with Next.js preset configuration
- Config location: `eslint.config.mjs`
- No Prettier detected; formatting delegated to ESLint
- Lines use semicolons at statement endings
- Quotes: Double quotes for JSX attributes and strings

**Linting:**
- Tool: ESLint 9.x with flat config format
- Configuration file: `/Users/arvind/Documents/Hackathons/Cloud9 x JetBrains 2026/thrifty/eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`
- Key rules: Core Web Vitals best practices and TypeScript strict checking

## Import Organization

**Order:**
1. External library imports (`next/*`, `react/*`, etc.)
2. Type imports using `import type { ... }` pattern
3. Relative imports (CSS, local modules)

**Pattern Examples:**
```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// app/page.tsx
import Image from "next/image";
```

**Path Aliases:**
- Alias defined in `tsconfig.json`: `@/*` maps to `./*`
- Currently not actively used in source files
- Available for future use in component imports

## Error Handling

**Patterns:**
- No error handling detected in current source files
- React Error Boundary pattern available through Next.js but not yet implemented
- Server-side errors handled at framework level by Next.js
- Client-side errors rely on browser error logging

## Logging

**Framework:** Not detected; no logging framework configured

**Patterns:**
- No structured logging in current codebase
- Browser console available for client-side debugging
- Server-side logging would use Node.js console by default

## Comments

**When to Comment:**
- File headers: Not used in current codebase
- Component documentation: Not currently used
- Complex logic: No complex logic to comment

**JSDoc/TSDoc:**
- Not detected in current codebase
- No parameter documentation found
- Type system provides documentation through TypeScript

## Function Design

**Size:**
- Functions kept small: `Home()` is 61 lines (DOM-heavy)
- `RootLayout()` is 14 lines (minimal logic)

**Parameters:**
- React components receive single props object
- Props destructured in function signature
- Use `Readonly<T>` for type safety: `Readonly<{ children: React.ReactNode }>`

**Return Values:**
- Components return JSX elements
- Type: `React.ReactNode` for flexible content

## Module Design

**Exports:**
- Default exports for page/layout components: `export default function ComponentName() { ... }`
- Named exports for utilities (not yet used)
- Type exports using `export type` pattern (not yet in source files)

**Barrel Files:**
- Not detected in current codebase
- Could be implemented in `lib/` or `utils/` directories for future feature exports

## Component Patterns

**React Components:**
- Use functional components only (no class components)
- Server Components by default in Next.js 16 app directory
- Metadata exported as constant: `export const metadata: Metadata = { ... }`
- Layout components wrap children with `{children}` prop

**Styling:**
- Tailwind CSS utility classes exclusively
- BEM-like structure through class composition
- Dark mode support via `dark:` prefix utilities
- Responsive design via `sm:`, `md:` breakpoint prefixes

---

*Convention analysis: 2026-01-28*
