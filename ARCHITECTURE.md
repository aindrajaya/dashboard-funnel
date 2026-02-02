# Architecture Proposal: Cartpanda Dashboard & Funnel Builder

## 1. Executive Summary
This document outlines a strategy to build a scalable, high-performance admin dashboard for Cartpanda. The goal is to support multiple engineering teams, maintain high velocity, and ensure WCAG accessibility compliance without accumulating technical debt.

## 2. Technical Stack Strategy

### Core Framework
*   **Next.js (App Router)**: Chosen for its superior performance (Server Components), automatic code splitting, and robust routing. It solves the "blank white screen" issue of SPAs by streaming HTML immediately.
*   **TypeScript (Strict Mode)**: Non-negotiable for enterprise scale to catch errors at build time.

### State Management
*   **Server State**: **TanStack Query (React Query)**. 90% of dashboard state is data fetching. This library handles caching, deduping, and background refetching out of the box.
*   **Client State**: **Zustand**. For complex interactive UI like the Funnel Builder. It is lighter than Redux and doesn't require wrapping the app in Providers, preventing "Context Hell".

### Styling & Design System
*   **Tailwind CSS + Class Variance Authority (CVA)**. Tailwind allows rapid iteration. CVA creates type-safe reusable components (e.g., `<Button variant="primary" size="lg" />`).
*   **Radix UI**: Headless primitives for accessible interactive components (Dialogs, Dropdowns, Tooltips). We style them with Tailwind, ensuring accessibility logic (keyboard nav, focus management) is outsourced to the library.

### Testing
*   **Unit**: **Vitest** (faster than Jest).
*   **E2E**: **Playwright**. It is more reliable than Cypress for modern web apps and handles multiple tabs/frames better.

## 3. Scalability & Code Organization

To support multiple engineers shipping in parallel, I propose a **Domain-Driven Feature Directory Structure**.

### Structure
Instead of grouping by type (`src/components`, `src/hooks`), we group by **Business Domain**:

```
src/
├── app/                  # Next.js Routes
├── features/             # Business Logic Domains
│   ├── funnels/          # Funnel Domain
│   │   ├── components/   # Funnel-specific UI
│   │   ├── hooks/        # Funnel logic
│   │   ├── api/          # API endpoints for funnels
│   │   └── types.ts
│   ├── orders/
│   ├── analytics/
│   └── shared/           # Logic shared between features
├── design-system/        # Dumb UI Components (Button, Card, Input)
└── lib/                  # Utilities (formatting, validation)
```

**Why this works**:
1.  **Colocation**: Everything needed to change the "Funnel" feature is in one folder.
2.  **Ownership**: Team A can own `features/funnels` while Team B owns `features/analytics`.
3.  **Refactoring**: It is easier to delete or rewrite a feature if it isn't scattered across 10 folders.

## 4. Accessibility (WCAG 2.1 AA)

Accessibility is not an afterthought; it is part of the definition of done.

1.  **Semantic HTML**: Use `<main>`, `<nav>`, `<aside>`, `<button>` correctly.
2.  **Keyboard Navigation**: The Funnel Builder nodes must be selectable via Tab and movable via Arrow Keys (React Flow supports this).
3.  **Testing**:
    *   **Linting**: `eslint-plugin-jsx-a11y`.
    *   **CI/CD**: Run `axe-core` checks in the build pipeline.

## 5. Preventing "Big Rewrites"

The "Big Rewrite" usually happens when code is tightly coupled.

1.  **API Abstraction**: Do not call `fetch` directly in components. Use a typed API layer (or generated hooks via Orval/TanStack Query). If the backend changes from REST to GraphQL, only the API layer changes, not the UI.
2.  **Component Interface Stability**: Props for Design System components should be stable. Use Slot pattern to allow flexibility without adding 50 boolean props (`hasIcon`, `isRed`, `isLarge`).

## 6. Developer Experience (DX)

1.  **Storybook**: All Design System components must be documented in Storybook. This serves as the source of truth for designers and devs.
2.  **Trunk-Based Development**: Small, short-lived branches. Feature flags (using something like LaunchDarkly or a simple internal provider) allow merging code early without exposing incomplete features to users.

---

## Trade-offs in this Test Submission
*   **CSS**: Used raw Tailwind classes for speed. In a real app, I would abstract common patterns (like card styles) into reusable components earlier.
*   **Validation**: Implemented basic orphan detection. Complex cycle detection (A->B->A) was omitted for simplicity but would be handled via a generic graph traversal algorithm in `useFunnelLogic`.
