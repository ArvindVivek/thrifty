# Technology Stack

**Analysis Date:** 2026-01-28

## Languages

**Primary:**
- TypeScript 5.x - Used throughout the application for type-safe development in React/Next.js
- JavaScript/JSX - Default language in Next.js ecosystem (via TypeScript)

**Secondary:**
- CSS - Styling via Tailwind CSS

## Runtime

**Environment:**
- Node.js - Runtime environment for Next.js server-side code

**Package Manager:**
- npm (assumed) - Based on package.json presence
- Lockfile: Not present in repository (likely gitignored)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework for production applications
- React 19.2.3 - UI library for component-based frontend
- React DOM 19.2.3 - React rendering for the DOM

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind CSS

**Build/Dev:**
- TypeScript 5.x - Language superset for static type checking
- ESLint 9.x - Code linting for quality and consistency
- eslint-config-next 16.1.6 - Next.js specific ESLint configuration

## Key Dependencies

**Critical:**
- next 16.1.6 - Server-side rendering, API routes, file-based routing, and production optimization
- react 19.2.3 - Component model and hooks for UI development
- react-dom 19.2.3 - DOM binding for React components

**Type Definitions:**
- @types/node ^20 - Node.js type definitions
- @types/react ^19 - React type definitions
- @types/react-dom ^19 - React DOM type definitions

**Development:**
- tailwindcss ^4 - Tailwind CSS processing
- @tailwindcss/postcss ^4 - PostCSS integration for Tailwind

## Configuration

**TypeScript:**
- Config file: `tsconfig.json`
- Target: ES2017
- Strict mode enabled
- Module resolution: bundler
- Path aliases configured: `@/*` maps to project root

**Build:**
- Config file: `next.config.ts`
- Currently minimal configuration (template state)

**Environment:**
- No .env files detected in repository
- Environment configuration: Not yet configured

## Platform Requirements

**Development:**
- Node.js (version not specified in .nvmrc - check with `node --version`)
- npm or yarn
- Modern code editor with TypeScript support (VS Code recommended)

**Production:**
- Deployment target: Vercel (suggested via Next.js template links)
- Compatible with any Node.js hosting environment
- Build command: `npm run build`
- Start command: `npm start`
- Dev command: `npm run dev`

---

*Stack analysis: 2026-01-28*
