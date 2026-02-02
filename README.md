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
- **Lucide React** for consistent iconography
- **Modern CSS** with responsive design principles

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
- **High Contrast**: Accessible color combinations
- **Focus Management**: Clear focus indicators and logical tab order

### Visual Design

- **Clean Interface**: Minimal, professional design
- **Responsive Layout**: Works on desktop and tablet devices
- **Visual Feedback**: Clear states for hover, focus, and active elements
- **Consistent Iconography**: Lucide React icons throughout

## 🔧 Development

### Code Quality

- **TypeScript Strict Mode**: Full type safety
- **Component-Driven Development**: Modular, reusable components
- **Performance Optimizations**: React.memo and efficient rendering
- **Modern React Patterns**: Hooks, functional components, and composition

### State Management

- **Local State**: React useState for component-specific state
- **Business Logic**: Custom hooks for funnel operations
- **Persistence**: localStorage for saving funnel state
- **Validation**: Real-time funnel integrity checking

## 🧪 Technical Decisions

### Why React Flow?

- **Battle-tested**: Mature library with excellent accessibility support
- **Extensible**: Easy to customize nodes and interactions
- **Performance**: Optimized for large graphs with virtualization
- **Community**: Active development and comprehensive documentation

### Why Vite?

- **Fast Development**: Instant hot reload and quick startup
- **Modern Bundling**: ESM-first with optimized production builds
- **TypeScript Support**: Built-in TypeScript processing
- **Plugin Ecosystem**: Extensive plugin availability

### Architecture Benefits

1. **Scalability**: Feature-based structure supports team collaboration
2. **Maintainability**: Clear separation of concerns and single responsibility
3. **Testability**: Isolated components and business logic
4. **Accessibility**: Built-in support for keyboard navigation and screen readers
5. **Performance**: Optimized rendering and efficient state management

## 📋 Future Enhancements

- **Advanced Validation**: Cycle detection and complex business rules
- **Undo/Redo**: Action history with keyboard shortcuts
- **Templates**: Pre-built funnel templates
- **Analytics Integration**: Performance metrics and user behavior tracking
- **Multi-language**: Internationalization support
- **Real-time Collaboration**: Multiple users editing simultaneously

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
