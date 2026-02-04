# Cartpanda Front-end Engineer - Architecture Approach

## Executive Summary

This document outlines a production-ready architecture for both the Upsell Funnel Builder (Part 1) and Modern Dashboard Architecture (Part 2) that emphasizes:

- **Clean UX with accessibility-first design**
- **Modular, scalable code architecture**
- **Team-friendly patterns and conventions**
- **Pragmatic choices that balance speed with quality**

---

## Part 1: Upsell Funnel Builder - Technical Architecture

### Tech Stack Selection

**Core Framework:**

- **React 18.3+** with **TypeScript 5.x** (strict mode)
- **Vite** for blazing-fast dev experience and optimized builds
- **React Flow 11.x** for graph visualization (battle-tested, accessible, extensible)

**Styling & UI:**

- **Tailwind CSS** with custom design tokens
- **Radix UI** primitives for accessible components (dialog, dropdown, tooltip)
- **Lucide React** for consistent iconography

**State Management:**

- **Zustand** for global funnel state (lightweight, no boilerplate)
- **React Flow's internal state** for canvas interactions
- **localStorage** with versioned schema for persistence

**Development Tools:**

- **ESLint + Prettier** with team configs
- **Vitest** for unit tests
- **Playwright** for E2E drag-and-drop flows
- **TypeScript strict mode** for type safety

### Project Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── FunnelCanvas.tsx         # Main canvas wrapper
│   │   ├── CustomNode.tsx            # Base node component
│   │   ├── CustomEdge.tsx            # Arrow/edge rendering
│   │   └── MiniMap.tsx               # Optional minimap
│   ├── palette/
│   │   ├── NodePalette.tsx           # Left sidebar
│   │   └── DraggableNodeType.tsx    # Palette items
│   ├── toolbar/
│   │   ├── Toolbar.tsx               # Top controls
│   │   └── ValidationPanel.tsx      # Funnel validation
│   └── ui/
│       ├── Button.tsx                # Accessible button
│       ├── Dialog.tsx                # Import/export modal
│       └── Toast.tsx                 # Notifications
├── hooks/
│   ├── useFunnelState.ts            # Zustand store
│   ├── usePersistence.ts            # localStorage logic
│   └── useNodeValidation.ts         # Business rules
├── lib/
│   ├── nodeTypes.ts                 # Node type definitions
│   ├── validation.ts                # Funnel validation rules
│   └── export.ts                    # JSON import/export
├── types/
│   └── funnel.ts                    # TypeScript interfaces
└── App.tsx
```

### State Architecture

**Zustand Store Pattern:**

```typescript
// useFunnelState.ts
interface FunnelState {
  nodes: Node[];
  edges: Edge[];
  nodeCounter: Record<NodeType, number>;

  // Actions
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (id: string) => void;
  validateFunnel: () => ValidationResult;
  exportJSON: () => string;
  importJSON: (json: string) => void;
  reset: () => void;
}
```

**Key Design Decisions:**

1. **Separation of Concerns:**
   - Canvas rendering → React Flow
   - Business logic → Zustand store
   - Persistence → Custom hook with versioning
   - Validation → Pure functions

2. **Node Auto-Incrementing:**

   ```typescript
   // Automatic labeling: "Upsell 1", "Upsell 2", etc.
   const nodeCounter = {
     upsell: 0,
     downsell: 0,
     // Reset on delete or import
   };
   ```

3. **Edge Validation:**
   - Real-time validation as edges are created
   - Visual warnings (yellow/red borders) for invalid states
   - "Thank You" nodes reject outgoing connections
   - Non-blocking warnings for flexibility

### Component Architecture

**CustomNode Component:**

```typescript
interface NodeData {
  type: 'sales' | 'order' | 'upsell' | 'downsell' | 'thank-you';
  label: string;
  icon: LucideIcon;
  buttonText: string;
  isValid: boolean;
  warnings: string[];
}

// Accessible, keyboard-navigable
const CustomNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      role="article"
      aria-label={`${data.label} node`}
      className={cn(
        "rounded-lg border-2 bg-white shadow-md",
        selected && "ring-2 ring-blue-500",
        !data.isValid && "border-yellow-500"
      )}
    >
      {/* Icon, label, button preview */}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
});
```

### Accessibility Implementation

**WCAG 2.1 AA Compliance:**

1. **Keyboard Navigation:**
   - Tab through nodes in DOM order
   - Arrow keys to move selected node
   - Enter to connect nodes
   - Delete key to remove nodes/edges
   - Escape to cancel operations

2. **Screen Reader Support:**
   - Semantic HTML (`<article>`, `<nav>`, `<main>`)
   - ARIA labels for canvas regions
   - Live region announcements: "Node added: Upsell 1"
   - Edge descriptions: "Connection from Sales Page to Order Page"

3. **Visual Accessibility:**
   - 4.5:1 contrast ratios
   - Focus indicators (2px ring)
   - Color is not the only indicator (icons + text)
   - Reduced motion support via `prefers-reduced-motion`

4. **Drag-and-Drop Fallbacks:**
   - Alternative: Click palette item → Click canvas to place
   - Keyboard-only connection mode

### Performance Optimizations

1. **React.memo** for nodes (prevent re-renders)
2. **Virtualization** for node palette if > 20 items
3. **Debounced localStorage** saves (300ms)
4. **Lazy loading** for import/export dialogs
5. **Canvas viewport culling** via React Flow

### Persistence Strategy

**Versioned Schema:**

```typescript
interface FunnelSchema {
  version: 1;
  lastModified: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  metadata: {
    name?: string;
    createdAt: string;
  };
}

// Migration path for future versions
function migrate(data: any): FunnelSchema {
  if (data.version === 1) return data;
  // Handle v0 → v1 migration
}
```

**Export/Import:**

- JSON download with filename `funnel-${timestamp}.json`
- Import validates schema before applying
- Error handling with user-friendly messages
- Backup current state before import

### Testing Strategy

**Unit Tests (Vitest):**

- Validation logic (90% coverage)
- Node counter increment
- Edge rules enforcement
- JSON serialization

**Integration Tests:**

- Zustand store actions
- Node creation flow
- Connection validation

**E2E Tests (Playwright):**

- Drag node from palette to canvas
- Connect two nodes
- Export and re-import funnel
- Keyboard-only navigation

---

## Part 2: Modern Dashboard Architecture

### High-Level Architecture

**Framework & Build:**

- **Next.js 14+** (App Router) for SSR, routing, and performance
- **TypeScript** with strict mode
- **Turborepo** for monorepo structure (if multiple apps needed)

**Styling System:**

- **Tailwind CSS** with custom design system tokens
- **Shadcn/ui** components (copy-paste, full control, accessible)
- **CVA (Class Variance Authority)** for component variants

**Data Layer:**

- **TanStack Query v5** for server state
- **Zustand** for client state (filters, UI preferences)
- **Zod** for runtime validation
- **tRPC** or **GraphQL** for type-safe API layer

---

### 1. Architecture: Structure & Organization

#### Route Structure (Next.js App Router)

```
app/
├── (dashboard)/
│   ├── layout.tsx                    # Shared dashboard shell
│   ├── funnels/
│   │   ├── page.tsx                  # Funnels list
│   │   ├── [id]/
│   │   │   ├── page.tsx              # Funnel detail
│   │   │   └── edit/page.tsx         # Funnel editor
│   │   └── _components/              # Feature-scoped components
│   │       ├── FunnelTable.tsx
│   │       ├── FunnelFilters.tsx
│   │       └── FunnelStats.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── _components/
│   ├── customers/
│   ├── analytics/
│   └── settings/
├── api/                              # API routes (if needed)
└── _components/                      # App-wide components
    └── ui/                           # Design system primitives
```

#### Feature Module Pattern

Each domain (funnels, orders, customers) owns:

- **Routes** (`/funnels/*`)
- **Components** (`_components/`)
- **Queries/Mutations** (`queries.ts`, `mutations.ts`)
- **Types** (`types.ts`)
- **Business logic** (`utils.ts`, `hooks.ts`)

**Benefits:**

- Clear ownership boundaries
- Easy to code-split
- New engineers know exactly where to add features
- Prevents cross-domain spaghetti

---

### 2. Design System: Consistency at Scale

#### Build vs Buy Decision

**Choice: Hybrid approach with Shadcn/ui**

**Why:**

- Full control (components live in codebase)
- Built on Radix UI (battle-tested accessibility)
- Tailwind-first (no CSS-in-JS runtime cost)
- Easy to customize without fighting abstractions

**Alternative Considered:**

- MUI/Chakra: Too heavy, theme overrides painful
- Headless UI: Good, but Radix has better DX

#### Design Token System

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(var(--primary-50))',
          // ... scale to 950
        },
        // Semantic tokens
        success: 'hsl(var(--success))',
        destructive: 'hsl(var(--destructive))',
      },
      spacing: {
        // 4px base, consistent scale
      },
      typography: {
        // Type scale: xs, sm, base, lg, xl, 2xl...
      },
    },
  },
};
```

**CSS Variables for Theming:**

```css
:root {
  --primary-500: 220 90% 56%;
  --radius: 0.5rem;
  /* Easy to swap for dark mode or white-label */
}

[data-theme='dark'] {
  --primary-500: 220 90% 66%;
}
```

#### Component Library Structure

```
src/components/ui/
├── button.tsx                        # Base button (CVA variants)
├── data-table.tsx                    # Reusable table with sorting/pagination
├── form/
│   ├── input.tsx
│   ├── select.tsx
│   └── date-picker.tsx
├── feedback/
│   ├── alert.tsx
│   ├── toast.tsx
│   └── skeleton.tsx
└── layout/
    ├── card.tsx
    └── page-header.tsx
```

**Enforcement:**

- **Storybook** for component documentation
- **Chromatic** for visual regression testing
- **ESLint rule**: Ban inline styles, enforce design tokens
- **PR template**: "Does this use design system components?"

---

### 3. Data Fetching & State Management

#### Server State: TanStack Query

**Query Organization:**

```typescript
// features/funnels/queries.ts
export const funnelQueries = {
  all: () => ['funnels'] as const,
  lists: () => [...funnelQueries.all(), 'list'] as const,
  list: (filters: FunnelFilters) => [...funnelQueries.lists(), filters] as const,
  details: () => [...funnelQueries.all(), 'detail'] as const,
  detail: (id: string) => [...funnelQueries.details(), id] as const,
};

// Usage in component
const { data, isLoading, error } = useQuery({
  queryKey: funnelQueries.list(filters),
  queryFn: () => api.funnels.list(filters),
  staleTime: 5 * 60 * 1000, // 5 min
});
```

**Optimistic Updates:**

```typescript
const { mutate } = useMutation({
  mutationFn: api.funnels.update,
  onMutate: async (updated) => {
    await queryClient.cancelQueries(funnelQueries.detail(id));
    const previous = queryClient.getQueryData(funnelQueries.detail(id));
    queryClient.setQueryData(funnelQueries.detail(id), updated);
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(funnelQueries.detail(id), context.previous);
  },
});
```

#### Client State: Zustand

**Use for UI-only state:**

- Table filters/sorts/pagination
- Modal open/closed
- Sidebar collapsed
- User preferences (saved to localStorage)

```typescript
// stores/tableStore.ts
interface TableState {
  filters: Record<string, any>;
  sort: { field: string; direction: 'asc' | 'desc' };
  pagination: { page: number; pageSize: number };

  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
}

// Persist to URL params for shareability
useEffect(() => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => params.set(k, v));
  router.push(`?${params}`);
}, [filters]);
```

#### Loading States Pattern

**Unified Skeleton Component:**

```typescript
// Every list view uses consistent loading state
function FunnelList() {
  const { data, isLoading } = useQuery(funnelQueries.list(filters));

  if (isLoading) return <FunnelTableSkeleton rows={10} />;
  if (error) return <ErrorState retry={() => refetch()} />;
  if (!data.length) return <EmptyState action="Create Funnel" />;

  return <FunnelTable data={data} />;
}
```

**Progressive Enhancement:**

- Show stale data while refetching (TanStack Query default)
- Skeleton screens match final layout
- Error boundaries catch unexpected failures

---

### 4. Performance Strategy

#### Bundle Optimization

**Code Splitting:**

```typescript
// Route-based splitting (Next.js automatic)
// Dynamic imports for heavy components
const ChartComponent = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Client-only if needed
});
```

**Barrel Export Avoidance:**

```typescript
// ❌ Bad: Imports entire module
import { Button } from '@/components';

// ✅ Good: Direct import
import { Button } from '@/components/ui/button';
```

#### Runtime Performance

**Memoization Strategy:**

```typescript
// Expensive calculations
const sortedData = useMemo(() => sortFunnels(data, sort), [data, sort]);

// Callbacks passed to children
const handleDelete = useCallback((id: string) => deleteMutation.mutate(id), [deleteMutation]);
```

**Virtualization for Large Lists:**

```typescript
// @tanstack/react-virtual for 1000+ row tables
const rowVirtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => tableRef.current,
  estimateSize: () => 50,
  overscan: 5,
});
```

#### Instrumentation & Monitoring

**Performance Metrics:**

```typescript
// Web Vitals tracking
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics({ name, delta, id }) {
  analytics.track('web-vital', { name, delta, id });
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
```

**Custom Metrics:**

- Table render time (mark/measure)
- API response time (TanStack Query devtools)
- User flow timings (funnel creation start → success)

**Monitoring Stack:**

- **Sentry** for error tracking
- **Vercel Analytics** or **Plausible** for page views
- **TanStack Query DevTools** in dev mode
- **React DevTools Profiler** for render bottlenecks

---

### 5. Developer Experience & Team Scalability

#### Onboarding Engineers

**Day 1 Experience:**

1. **README with Quick Start:**

   ```bash
   pnpm install
   pnpm dev
   # Dashboard opens at localhost:3000
   ```

2. **Interactive Tutorial:**
   - "Add your first feature" guide
   - Create a new dashboard page step-by-step
   - Points to example PRs

3. **Architecture Decision Records (ADRs):**
   ```
   docs/architecture/
   ├── 001-why-nextjs-app-router.md
   ├── 002-tanstack-query-over-swr.md
   └── 003-feature-folder-structure.md
   ```

#### Enforced Conventions

**Linting & Formatting:**

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@tanstack/eslint-plugin-query/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": ["@/components", "../../../*"]
      }
    ],
    "@tanstack/query/exhaustive-deps": "error"
  }
}
```

**Pre-commit Hooks (Husky):**

```bash
#!/bin/sh
pnpm lint-staged
pnpm type-check
pnpm test --related --passWithNoTests
```

**PR Template:**

```markdown
## What changed?

[Description]

## Checklist

- [ ] Component added to Storybook
- [ ] Accessible (keyboard nav, screen reader tested)
- [ ] Mobile-responsive
- [ ] Error states handled
- [ ] Loading states handled
- [ ] Tests added (if logic > 20 LOC)

## Design System

- [ ] Uses existing components OR
- [ ] New component approved in design review
```

#### Component Guidelines

**Creation Tiers:**

1. **Use existing component** (80% of cases)
2. **Extend existing with variant** (15%)
3. **Create new primitive** (5%, requires approval)

**File Template Generator:**

```bash
pnpm generate:component DataTable
# Creates:
# - components/ui/data-table.tsx
# - components/ui/data-table.stories.tsx
# - components/ui/data-table.test.tsx
```

#### Preventing Inconsistency

**Automated Checks:**

- **Chromatic**: Catch visual regressions
- **ESLint**: No inline styles, use tokens
- **TypeScript**: Strict mode catches prop mismatches

**Human Review:**

- "Design system" label on PRs touching UI
- Dedicated design system owner reviews
- Monthly "UI audit" to find one-offs

---

### 6. Testing Strategy

#### Testing Pyramid

```
         /\
        /E2E\         10% - Critical user flows
       /------\
      /Integr.\      30% - Component + API interactions
     /----------\
    /   Unit     \   60% - Business logic, utils, hooks
   /--------------\
```

#### Unit Tests (Vitest)

**What to Test:**

- Pure functions (validation, formatters, calculations)
- Custom hooks (useTableFilters, usePermissions)
- Utility modules

```typescript
// lib/validation.test.ts
describe('validateFunnel', () => {
  it('allows valid funnel flow', () => {
    expect(validateFunnel(validFunnel)).toHaveNoErrors();
  });

  it('rejects Thank You node with outgoing edges', () => {
    expect(validateFunnel(invalidFunnel)).toMatchObject({
      errors: [{ node: 'thank-you-1', reason: 'no-outgoing' }],
    });
  });
});
```

**Skip:**

- UI components (covered by Storybook + Chromatic)
- Next.js routing (integration tests)

#### Integration Tests (React Testing Library)

**What to Test:**

- Data fetching + UI updates
- Form submission flows
- Multi-component interactions

```typescript
// features/funnels/FunnelList.test.tsx
it('filters funnels by status', async () => {
  const { getByRole, findByText } = render(<FunnelList />);

  await waitFor(() => expect(screen.getByText('Funnel 1')).toBeInTheDocument());

  await userEvent.click(getByRole('combobox', { name: 'Status' }));
  await userEvent.click(getByText('Active'));

  expect(await findByText('Active Funnel')).toBeInTheDocument();
  expect(screen.queryByText('Draft Funnel')).not.toBeInTheDocument();
});
```

**Mock API:**

- MSW (Mock Service Worker) for realistic network layer
- Shared fixtures in `mocks/data/funnels.ts`

#### E2E Tests (Playwright)

**Critical Paths Only:**

- ✅ Create funnel → Add pages → Publish
- ✅ View order → Refund → Verify email sent
- ✅ Login → Navigate to analytics → Export CSV
- ❌ Every button click (too brittle)

**Parallel Execution:**

```typescript
// playwright.config.ts
export default {
  workers: 4,
  projects: [
    { name: 'Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile', use: { ...devices['iPhone 13'] } },
  ],
};
```

#### Minimum Testing Requirements

**Before PR Merge:**

- Unit tests for new business logic
- Integration test if new feature > 1 component
- E2E test if critical user flow

**CI Pipeline:**

```yaml
# .github/workflows/test.yml
- name: Unit + Integration
  run: pnpm test --coverage
- name: E2E (Chromatic)
  run: pnpm chromatic
- name: E2E (Playwright)
  run: pnpm playwright test
```

---

### 7. Release & Quality Assurance

#### Feature Flags

**LaunchDarkly or Vercel Flags:**

```typescript
// lib/featureFlags.ts
import { useFlag } from '@launchdarkly/react-client-sdk';

function Analytics() {
  const newChartsEnabled = useFlag('new-charts-ui');

  return newChartsEnabled ? <NewCharts /> : <LegacyCharts />;
}
```

**Use Cases:**

- Gradual rollout (5% → 50% → 100%)
- A/B testing
- Kill switch for broken features
- Team-only preview features

#### Staged Rollouts

**Deployment Strategy:**

1. **Preview Deploy** (Vercel/Netlify)
   - Every PR gets URL
   - QA team tests before merge

2. **Staging Environment**
   - Merge to `main` → auto-deploy
   - Mirrors production data (anonymized)
   - Final smoke tests

3. **Production Canary**
   - Deploy to 5% of users
   - Monitor error rates (Sentry)
   - Auto-rollback if > 1% error spike

4. **Full Production**
   - Gradual increase to 100%
   - Monitor metrics for 24h

#### Error Monitoring & Alerting

**Sentry Integration:**

```typescript
// app/layout.tsx
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter out known issues
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
});
```

**Alerts:**

- Slack notification if error rate > 1%
- PagerDuty for P0 incidents (checkout broken)
- Weekly digest of top errors

#### Ship Fast but Safe

**Speed Mechanisms:**

- Feature flags (decouple deploy from release)
- Automated testing (CI passes = safe to merge)
- Trunk-based development (small, frequent PRs)

**Safety Nets:**

- Required PR reviews (1 approver minimum)
- Automated accessibility checks (axe-core in CI)
- Performance budgets (Lighthouse CI fails if LCP > 2.5s)
- Canary deployments with auto-rollback

**Incident Response:**

```
1. Detect (Sentry alert)
2. Mitigate (rollback or feature flag off)
3. Fix (root cause patch)
4. Postmortem (blameless, document learnings)
```

---

## Tradeoffs & Future Improvements

### Part 1 (Funnel Builder)

**Intentionally Skipped (MVP Focus):**

- Complex undo/redo (would use Immer + history stack)
- Real-time collaboration (would use Yjs/Liveblocks)
- Advanced validation (circular dependencies, unreachable nodes)
- Custom node styling/themes

**Next Iterations:**

- Node grouping/containers
- Templates (pre-built funnel patterns)
- Analytics overlay (show conversion rates on nodes)
- Mobile-responsive touch gestures

### Part 2 (Dashboard)

**Pragmatic Decisions:**

- **Shadcn/ui over MUI**: Control > convenience
- **TanStack Query over Redux**: Server state is 90% of state
- **Playwright over Cypress**: Better DX, faster execution
- **Monolith over microservices**: Team < 20 engineers

**Scale Inflection Points:**

- **10+ engineers**: Add Turborepo monorepo
- **100K+ users**: Add CDN caching, edge functions
- **Multi-tenant**: Add row-level security, tenant isolation
- **White-label**: Extract theme system to runtime config

---

## Accessibility Commitment (WCAG 2.1 AA)

### Non-Negotiables

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Screen Reader**: Semantic HTML, ARIA labels, live regions
3. **Color Contrast**: 4.5:1 text, 3:1 UI components
4. **Focus Management**: Visible focus rings, logical tab order
5. **Motion**: Respect `prefers-reduced-motion`

### Testing Process

- **Automated**: axe-core in CI (catches 30-40% of issues)
- **Manual**: NVDA/JAWS testing for critical flows
- **User Testing**: Periodic sessions with assistive tech users

### Component Checklist

```typescript
// All components must pass:
✅ Keyboard operable (Tab, Enter, Escape, Arrow keys)
✅ Screen reader announces state changes
✅ Focus indicator visible (outline or ring)
✅ Color not sole indicator (icon + text)
✅ Touch targets ≥ 44x44px
✅ Form labels programmatically associated
✅ Error messages accessible
```

---

## Conclusion

This architecture is designed to:

- **Scale gracefully** from 1 to 50 engineers
- **Ship fast** without sacrificing quality
- **Stay maintainable** through clear conventions
- **Be accessible** to all users

The key is **balance**: Use proven tools (React Flow, TanStack Query), enforce patterns (feature folders, design system), but stay pragmatic (don't over-engineer, iterate based on real needs).

**Success metrics after 6 months:**

- New engineer ships first feature in < 3 days
- 95% of PRs use design system components
- Zero P0 accessibility regressions
- Dashboard perceived performance < 2s (LCP)
- Zero "big rewrites" needed

---

**Questions or want to discuss tradeoffs?** Happy to dive deeper into any section.
