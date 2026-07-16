<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AI Agent Coding Guidelines

Welcome, AI Agent! This guide outlines the technology stack, project architecture, conventions, and critical safety rules for this codebase. Please read it thoroughly before writing any code.

---

## 1. Project Overview & Tech Stack

This project is built using:
- **Framework**: Next.js 16.2.6 (React 19, App Router)
- **Database & Auth**: Supabase (via PostgreSQL and `@supabase/ssr`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) & Vanilla CSS
- **UI Components**: shadcn/ui (`base-nova` style with `@supabase` component registry)
- **AI Integrations**: Firebase Genkit (`genkit` & `@genkit-ai/*`) and Vercel AI SDK (`ai`)

---

## 2. Next.js 16 & React 19 Standards

- **Read Version-Matched Docs**: Before any Next.js work, refer to the documentation in `node_modules/next/dist/docs/` for accurate API references.
- **Client-Side Navigation**: If fixing slow client-side navigations, Suspense alone is not enough. You must also export `unstable_instant` from the route. Refer to `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` for details.
- **Async APIs**: Note that in Next.js 16 / React 19, headers and cookies APIs are asynchronous. Always use `await cookies()` and `await headers()`.
- **RSC vs Client Components**: Use React Server Components (RSC) by default. Annotate files with `"use client"` only when incorporating interactive client hooks (e.g., `useState`, `useEffect`, `useActionState`).

---

## 3. Supabase Integration Rules

- **No Global Client Instances (Fluid Compute)**: Especially important if using Fluid compute: Don't put the server Supabase client in a global variable. Always create a new client within each function when using it (via `createClient()` from `@/lib/supabase/server`).
- **Middleware/Proxy Authentication**:
  - Do not run any code between `createServerClient` and `supabase.auth.getClaims()`. Intermediate operations can cause users to be randomly logged out.
  - You **must** return the `supabaseResponse` object as is from the middleware. If creating a new response via `NextResponse.next({ request })`, you must copy cookies over:
    `myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())`
- **User Session & Claims**: Retrieve user session data and roles via `supabase.auth.getClaims()`. Do not rely on deprecated user methods.
- **Security & Schema**:
  - Row Level Security (RLS) **must** be enabled for all new database tables.
  - All migrations and database schema modifications must be placed inside the `supabase/migrations/` directory.

---

## 4. shadcn/ui & Styling Rules

- **Component Ownership**: shadcn components are local code, not npm dependencies.
  - To install or update a component, run: `pnpm dlx shadcn@latest add <component>`
  - Never try to direct install them via `npm install` / `pnpm add`.
- **Theme & Colors**:
  - The styling system uses Tailwind CSS v4 and is defined via OKLCH color tokens in [globals.css](file:///Users/vinothkannans/Projects/Base/supanext/app/globals.css).
  - Use semantic color tokens (e.g., `bg-primary`, `text-muted-foreground`, `border-border`) instead of hardcoding raw HEX/RGB/HSL colors.
- **Composition over Modification**:
  - Prefer using built-in shadcn variants (e.g., `variant="outline"`, `size="sm"`) before overriding styles manually.
  - Always merge conditional classes using the `cn()` helper from `@/lib/utils`.
- **Layout Spacing**: Do not use legacy spacing classes like `space-x-*` or `space-y-*`. Use modern flexbox or grid layouts with the `gap-*` property.

---

## 5. Firebase Genkit & AI Systems

- **AI SDK**: Integrates Vercel AI SDK (`ai` and `@ai-sdk/react`) along with Genkit.
- **Session Preservation**: State and snapshots for Genkit session stores are managed via `SupabaseSessionStore` in [supabase-session-store.ts](file:///Users/vinothkannans/Projects/Base/supanext/lib/genkit/supabase-session-store.ts). Keep snapshots saved securely under user-scoped auth claims.

---

## 6. Coding Practices

- **TypeScript**: Always write clean, strongly-typed TypeScript.
- **Import Aliases**: Keep imports clean and organized using the aliases configured in `components.json`:
  - Component files: `@/components/*` or `@/components/ui/*`
  - Utility functions: `@/lib/utils`
  - Client/Middleware helpers: `@/lib/*`
- **Linting**: Ensure all changes conform to ESLint standards. Run `pnpm lint` to verify your changes.

