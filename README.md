# Cartpanda Funnel Builder

A modern, accessible upsell funnel builder built as part of Cartpanda's Front-end Engineer Practical Test. This application demonstrates production-ready React architecture with a focus on accessibility, performance, and developer experience.

## 🎯 Project Overview

This funnel builder allows users to create and visualize upsell funnels through an intuitive drag-and-drop interface. Users can:

- **Drag & Drop**: Create funnel nodes from a palette onto a visual canvas
- **Connect Pages**: Link different funnel steps with visual connections
- **Validate Logic**: Real-time validation ensures funnel integrity
- **Export/Import**: Save and load funnel configurations as JSON
- **Accessibility**: Full keyboard navigation and screen reader support

## 🏗️ Architecture

### Tech Stack

- **React 18.3+** with **TypeScript 5.x** (strict mode)
- **Vite** for fast development and optimized builds
- **React Flow 11.x** for graph visualization and interactions
- **Tailwind CSS 3.4+** for utility-first styling and responsive design
- **react-hot-toast** for accessible notifications
- **Lucide React** for consistent iconography
- **Vitest** for unit and integration testing
- **Storybook** for component documentation

### Project Structure

```
src/
├── components/
│   └── ui/                    # Reusable UI components
│       └── Button.tsx
├── features/
│   └── funnel-builder/        # Funnel builder feature
│       ├── FunnelCanvas.tsx   # Main canvas component
│       ├── components/        # Feature-specific components
│       │   ├── CustomNode.tsx
│       │   ├── Sidebar.tsx
│       │   └── ValidationPanel.tsx
│       └── hooks/             # Business logic hooks
│           └── useFunnelLogic.ts
├── constants.tsx              # Application constants
├── types.ts                   # TypeScript type definitions
└── App.tsx                    # Root component
```

### Design Principles

1. **Feature-Based Organization**: Code is organized by business domain rather than file type
2. **Accessibility First**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
3. **Type Safety**: Strict TypeScript with comprehensive type definitions
4. **Component Composition**: Reusable, composable components following atomic design principles
5. **Performance Optimized**: Efficient rendering with React.memo and proper state management
6. **Mobile-First Responsive**: Adaptive UI that works seamlessly across all device sizes
7. **Progressive Enhancement**: Core functionality works everywhere, enhanced features for capable devices

## 🎨 UI/UX Approach

### Design System

The application uses a **sketchy, hand-drawn aesthetic** that combines professionalism with approachability:

- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Custom Theme**: Architects Daughter font for a friendly, creative feel
- **Consistent Borders**: 2px solid borders with 3px shadows for depth
- **Color Palette**: Sky blue accents (#0ea5e9) with neutral grays and semantic colors

### Toast Notification System

Instead of disruptive browser alerts, we use **react-hot-toast** with custom styling:

```typescript
// Success, error, and info notifications
showToast.success('Funnel saved successfully!');
showToast.error('Cannot delete the only node');

// Confirmation dialogs with Promise-based API
const confirmed = await showToast.confirm('Are you sure you want to clear the canvas?');
```

**Benefits:**

- Non-blocking user experience
- Consistent visual language
- Accessible with ARIA live regions
- Smooth animations and auto-dismiss

### Responsive Design

#### Mobile-First Approach

The application adapts intelligently across device sizes with a **768px breakpoint**:

**Desktop (≥768px):**

- Sidebar visible by default
- All control panels visible
- Optimal for drag-and-drop interactions
- Multi-panel layout with ample whitespace

**Mobile/Tablet (<768px):**

- Panels hidden by default to maximize canvas space
- Toggle buttons for sidebar, toolbar, controls, and minimap
- Collapsible Funnel Health panel
- Strategic button placement for thumb accessibility

#### Dynamic Panel Positioning

Smart positioning ensures UI elements never overlap:

```typescript
// Panels adjust based on Funnel Health state
const bottomOffset = isHealthExpanded
  ? 'calc(4rem + 180px)' // Health panel open
  : '4rem'; // Health panel closed

// All panels shift consistently (120px) when health expands
```

**Key Features:**

- Smooth CSS transitions (300ms)
- Consistent spacing maintained across states
- One-handed mobile operation
- Prevents accidental taps on canvas

#### Responsive UI Components

1. **Top Bar (Mobile)**
   - Title: "Cartpanda Funnel Builder"
   - Sidebar toggle (left)
   - Toolbar toggle (right)

2. **Floating Buttons (Right Side)**
   - Zoom controls toggle
   - Minimap toggle
   - Positioned for easy thumb access
   - Dynamic offset based on health panel state

3. **Zoom Controls**
   - Full controls on desktop (+, -, fit view, lock/unlock)
   - Simplified on mobile (+ and - only)
   - Hides undo/redo buttons on small screens

4. **MiniMap**
   - Centered above Funnel Health
   - Toggleable on mobile
   - Maintains position when health panel expands

5. **Funnel Health Panel**
   - Always visible (key information)
   - Collapsible on mobile to save space
   - ChevronUp/Down icon for expand/collapse
   - Pushes other panels up when expanded

## ⚡ Performance Optimizations

### Rendering Efficiency

1. **React.memo**: Prevents unnecessary re-renders of pure components

   ```typescript
   const CustomNode = React.memo<CustomNodeProps>(({ data }) => {
     // Component only re-renders when data changes
   });
   ```

2. **useCallback**: Memoizes event handlers to prevent child re-renders

   ```typescript
   const onNodesChange = useCallback((changes) => {
     setNodes((nds) => applyNodeChanges(changes, nds));
   }, []);
   ```

3. **Efficient State Updates**: Functional updates prevent stale closures
   ```typescript
   setNodes((prevNodes) => [...prevNodes, newNode]);
   ```

### React Flow Optimizations

- **Virtualization**: React Flow only renders visible nodes
- **Connection Validation**: Prevents invalid connections at interaction level
- **Smooth Animations**: CSS transforms for 60fps interactions
- **Optimized Minimap**: Simplified rendering for overview

### CSS Performance

1. **Tailwind CSS Purging**: Removes unused styles in production

   ```javascript
   // tailwind.config.js
   content: [
     './index.html',
     './src/**/*.{js,ts,jsx,tsx}',
     './features/**/*.{js,ts,jsx,tsx}',
     './components/**/*.{js,ts,jsx,tsx}',
   ];
   ```

2. **CSS Transitions**: Hardware-accelerated animations

   ```css
   transition-all duration-300 ease-in-out
   ```

3. **Conditional Rendering**: Only render visible components
   ```typescript
   {isMobile ? <MobileControls /> : <DesktopControls />}
   ```

### Load Time Optimizations

- **Code Splitting**: Vite automatically splits vendor chunks
- **Tree Shaking**: Removes unused code from bundles
- **Asset Optimization**: Compressed and minified production builds
- **Lazy Loading**: Load components on demand (future enhancement)

### Memory Management

- **Event Listener Cleanup**: Remove listeners in useEffect cleanup

  ```typescript
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  ```

- **Debounced Saves**: Prevent excessive localStorage writes
- **Proper Unmounting**: Clean up timers and subscriptions

## 📱 Responsive Features Detail

### Adaptive UI Elements

| Element       | Desktop                  | Tablet     | Mobile                 |
| ------------- | ------------------------ | ---------- | ---------------------- |
| Sidebar       | Always visible           | Toggle     | Toggle                 |
| Toolbar       | Always visible           | Toggle     | Toggle                 |
| Zoom Controls | Full (4 buttons)         | Full       | Simplified (2 buttons) |
| MiniMap       | Always visible           | Toggle     | Toggle                 |
| Funnel Health | Expanded                 | Expanded   | Collapsible            |
| Canvas        | Full width minus sidebar | Full width | Full width             |

### Touch Interactions

- **Tap Targets**: Minimum 44x44px for accessibility
- **Drag & Drop**: Touch-optimized with React Flow
- **Pinch to Zoom**: Native canvas zoom (via React Flow)
- **Swipe Gestures**: Future enhancement for panel toggles

### Breakpoint Strategy

```typescript
// Single breakpoint for simplicity
const MOBILE_BREAKPOINT = 768; // px

// Auto-detect and update
const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);
```

**Why 768px?**

- Industry standard tablet/desktop breakpoint
- Covers majority of mobile devices in portrait
- Aligns with Tailwind's `md:` breakpoint
- Simplifies maintenance (fewer breakpoints = less complexity)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cartpanda-funnel-builder
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173) to see the application.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run storybook` - Start Storybook component explorer
- `npm run build-storybook` - Build Storybook for deployment

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub:**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the Vite framework

3. **Configure (Optional):**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

### GitHub Actions CI/CD

The project includes a complete CI/CD pipeline that runs on every push:

1. **Code Quality Checks:**
   - ESLint validation
   - Prettier format checking
   - TypeScript type checking

2. **Testing:**
   - Unit tests
   - Coverage reporting

3. **Build:**
   - Production build verification

4. **Deployment:**
   - Preview deployments for pull requests
   - Production deployment on main branch

**Setup GitHub Secrets** (for automatic deployment):

```
VERCEL_TOKEN          # From Vercel account settings
VERCEL_ORG_ID         # From Vercel project settings
VERCEL_PROJECT_ID     # From Vercel project settings
```

## 📱 Features & Usage

### Node Types

The funnel builder supports five types of nodes:

1. **Sales Page** - Entry point for the funnel
2. **Order Page** - Product purchase page
3. **Upsell** - Additional product offers
4. **Downsell** - Alternative product offers
5. **Thank You** - Confirmation and completion page

### How to Use

1. **Create Nodes**: Drag node types from the left sidebar onto the canvas
2. **Connect Nodes**: Click and drag from one node's handle to another to create connections
3. **Validate**: The validation panel shows any issues with your funnel structure
4. **Export**: Save your funnel as JSON for later use
5. **Import**: Load previously saved funnel configurations

### Keyboard Navigation

The application is fully accessible via keyboard:

- **Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and connections
- **Arrow Keys**: Move selected nodes (when implemented)
- **Escape**: Cancel current operation

## 🎨 Design System

### Accessibility Features

- **WCAG 2.1 AA Compliant**: Meets accessibility standards
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full functionality without mouse
- **High Contrast**: Accessible color combinations (4.5:1 minimum)
- **Focus Management**: Clear focus indicators and logical tab order
- **Live Regions**: Toast notifications announce to screen readers
- **Touch Targets**: Minimum 44x44px for mobile accessibility

### Visual Design

- **Sketchy Aesthetic**: Hand-drawn feel with Architects Daughter font
- **Consistent Borders**: 2px solid borders with 3px shadows throughout
- **Sky Blue Accents**: Primary color (#0ea5e9) for interactive elements
- **Semantic Colors**: Red for errors, green for success, blue for info
- **Responsive Layout**: Fluid design that adapts to any screen size
- **Visual Feedback**: Clear states for hover, focus, active, and disabled
- **Smooth Transitions**: 300ms animations for state changes
- **Consistent Iconography**: Lucide React icons throughout

### Color Palette

```css
/* Primary Colors */
--primary: #0ea5e9 (Sky Blue) --primary-hover: #0284c7 --primary-active: #0369a1
  /* Semantic Colors */ --success: #10b981 (Green) --error: #ef4444 (Red) --warning: #f59e0b (Amber)
  --info: #3b82f6 (Blue) /* Neutrals */ --background: #ffffff --surface: #f9fafb --border: #d1d5db
  --text: #111827 --text-secondary: #6b7280;
```

## 🔧 Development

### Code Quality

- **TypeScript Strict Mode**: Full type safety
- **Component-Driven Development**: Modular, reusable components
- **Performance Optimizations**: React.memo and efficient rendering
- **Modern React Patterns**: Hooks, functional components, and composition

### State Management

- **Local State**: React useState for component-specific state
- **Derived State**: Calculate from existing state rather than duplicating
- **Business Logic**: Custom hooks (useFunnelLogic) for funnel operations
- **Persistence**: localStorage for saving funnel state across sessions
- **Validation**: Real-time funnel integrity checking with visual feedback
- **Responsive State**: Window resize detection for adaptive UI
- **Panel State**: Independent toggle states for each mobile panel

### State Architecture

```typescript
// Component State (UI-specific)
const [isMobile, setIsMobile] = useState(false);
const [showSidebar, setShowSidebar] = useState(!isMobile);
const [isHealthExpanded, setIsHealthExpanded] = useState(!isMobile);

// Business Logic State (via custom hook)
const {
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  validationErrors,
  addNode,
  deleteNode,
  exportFunnel,
  importFunnel,
  clearCanvas,
} = useFunnelLogic();

// Derived State (computed from existing state)
const hasErrors = validationErrors.length > 0;
const nodeCount = nodes.length;
```

## 🧪 Technical Decisions

### Why React Flow?

- **Battle-tested**: Mature library with excellent accessibility support
- **Extensible**: Easy to customize nodes and interactions
- **Performance**: Optimized for large graphs with virtualization
- **Touch Support**: Works seamlessly on mobile and tablet devices
- **Community**: Active development and comprehensive documentation
- **TypeScript**: Full type definitions included

### Why Vite?

- **Fast Development**: Instant hot reload (< 100ms) and quick startup
- **Modern Bundling**: ESM-first with optimized production builds
- **TypeScript Support**: Built-in TypeScript processing without configuration
- **Plugin Ecosystem**: Extensive plugin availability
- **Build Performance**: 10-100x faster than traditional bundlers

### Why Tailwind CSS?

- **Utility-First**: Rapid UI development without context switching
- **Performance**: Purges unused CSS for minimal bundle size
- **Responsive**: Mobile-first breakpoints built-in
- **Consistent**: Design tokens prevent arbitrary values
- **DX**: IntelliSense support in VS Code
- **Maintainable**: Changes are localized to components

### Why react-hot-toast?

- **Accessible**: ARIA live regions for screen reader support
- **Lightweight**: Only 3.5kb gzipped
- **Customizable**: Full control over styling and behavior
- **Promise-based**: Async confirm dialogs with clean API
- **Smooth Animations**: Hardware-accelerated transitions
- **No Dependencies**: Works with any styling solution

### Why Vitest?

- **Vite-native**: Shares configuration with dev environment
- **Fast**: Runs tests in parallel with instant feedback
- **Compatible**: Jest-compatible API for easy migration
- **TypeScript**: First-class TypeScript support
- **Coverage**: Built-in coverage reporting with c8

### Architecture Benefits

1. **Scalability**: Feature-based structure supports team collaboration
2. **Maintainability**: Clear separation of concerns and single responsibility
3. **Testability**: Isolated components and business logic
4. **Accessibility**: Built-in support for keyboard navigation and screen readers
5. **Performance**: Optimized rendering and efficient state management
6. **Mobile-First**: Responsive design from the ground up
7. **Developer Experience**: Fast feedback loops and modern tooling

## 📋 Future Enhancements

### Planned Features

- **Advanced Validation**: Cycle detection and complex business rules
- **Undo/Redo**: Full action history with keyboard shortcuts (Cmd+Z/Cmd+Shift+Z)
- **Templates**: Pre-built funnel templates for common use cases
- **Analytics Integration**: Performance metrics and user behavior tracking
- **Multi-language**: i18n support for global markets
- **Real-time Collaboration**: Multiple users editing simultaneously with WebSockets
- **Export Options**: PDF, PNG, and SVG exports of funnel diagrams
- **Custom Themes**: User-selectable color schemes and visual styles

### Performance Roadmap

- **Virtual Scrolling**: Handle 1000+ nodes without performance degradation
- **Web Workers**: Offload validation and complex calculations
- **Progressive Web App**: Offline support and installability
- **Service Worker**: Cache funnel data for instant loads
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP images with fallbacks

### Accessibility Roadmap

- **Keyboard Shortcuts**: Customizable hotkeys for power users
- **Screen Reader Optimization**: Enhanced ARIA descriptions
- **High Contrast Mode**: System preference detection
- **Reduced Motion**: Respect prefers-reduced-motion
- **Voice Control**: Voice command support for hands-free operation

## 🤝 Contributing

This project follows modern React development practices:

1. **TypeScript**: All components must have proper type definitions
2. **Accessibility**: New features must maintain WCAG 2.1 AA compliance
3. **Testing**: Unit tests for business logic and integration tests for user flows
4. **Performance**: Consider rendering optimization for new features

## 📚 Documentation

- [Architecture Approach](./cartpanda-approach.md) - Detailed architectural decisions
- [Project Architecture](./ARCHITECTURE.md) - Technical implementation details
- [Cartpanda Architecture](./cartpanda-architecture.md) - Full system design

## 📄 License

This project is part of Cartpanda's technical assessment.

---

Built with ❤️ for Cartpanda's Front-end Engineer role.
