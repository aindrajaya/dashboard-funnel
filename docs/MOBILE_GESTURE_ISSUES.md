# Mobile Gesture Issues - feat/mobile-gesture Branch

## 🔴 Main Issues

### 1. **React Flow Gesture Conflicts**

```tsx
panOnDrag={true}
zoomOnPinch={true}
panOnScroll={false}
```

**Problem**: `panOnDrag={true}` means any drag gesture pans the canvas, which conflicts with:

- Dragging nodes to reposition them
- Selecting nodes
- Creating connections between nodes

**Impact**: Users can't move nodes or create connections on mobile because drag gestures pan the canvas instead.

**Fix**: Should be `panOnDrag={[1, 2]}` (pan only with middle/right mouse, or use `panOnScroll={true}` for touch)

---

### 2. **Node Selection on Mobile**

**Problem**: No touch-friendly way to select nodes. Desktop uses click, but mobile needs:

- Tap to select
- Long press for context menu
- Double tap for editing

**Current**: Only basic tap works, no feedback or multi-select support.

---

### 3. **Edge Creation on Mobile**

**Problem**: Creating connections requires dragging from handles, which is:

- Conflicts with canvas panning
- Hard to hit small touch targets (handles are tiny)
- No visual feedback for valid connection points

**Fix Needed**:

- Increase handle touch targets to 44px minimum
- Add connection mode toggle button
- Show connection hints

---

### 4. **Node Deletion on Mobile**

**Status**: ✅ **IMPLEMENTED**

**Solution**: Long-press context menu

- Press and hold on any node for 500ms
- Context menu appears with Delete and Rename options
- Haptic feedback on long-press (if device supports it)
- Menu auto-closes on outside tap
- Deletes node and all connected edges

**Implementation**: [NodeContextMenu.tsx](../features/funnel-builder/components/NodeContextMenu.tsx) + [CustomNode.tsx](../features/funnel-builder/components/CustomNode.tsx#L24-L55)

---

### 5. **Controls Panel Spacing Issues**

```tsx
style={{ bottom: isHealthExpanded ? 'calc(1rem + 140px)' : 'calc(1rem + 70px)' }}
```

**Problem**: Fixed pixel calculations don't account for:

- Different screen heights
- Safe area insets (iPhone notch)
- Keyboard appearance
- Landscape orientation

---

### 6. **Missing Touch Gestures**

**Current**: Partial support:

- ✅ Pinch to zoom (enabled in ReactFlow)
- ✅ Two-finger pan (enabled in ReactFlow)
- ✅ Long press (shows context menu with delete/rename)
- ❌ One-finger pan (currently pans canvas, should select/move nodes)
- ❌ Double tap (no quick actions)

**Note**: Long-press gesture implemented with 500ms delay, haptic feedback, and movement cancellation (>10px movement cancels long-press).

---

### 7. **Small Touch Targets**

```tsx
<button className="p-2">
  {' '}
  // Only 8px padding
  <svg className="h-5 w-5" /> // 20px icon = ~36px total
</button>
```

**Problem**: Apple/Google recommend 44px minimum touch targets. Current buttons are too small.

---

### 8. **No Visual Touch Feedback**

**Missing**:

- Active state animations when tapping
- Ripple effects
- Haptic feedback
- Loading states

---

### 9. **Performance Issues**

**Problems**:

- All nodes re-render on every interaction
- No virtualization for large funnels
- Heavy shadows and animations slow touch response
- No debouncing on resize/orientation changes

---

### 10. **Minimap Placement Conflicts**

```tsx
className={isHealthExpanded ? '!bottom-[240px]' : '!bottom-[120px]'}
```

**Problem**: Minimap overlaps with:

- Controls panel when expanded
- Health panel content
- Small screens get crowded

---

## 🎯 Priority Fixes

### High Priority (Breaks Core Functionality)

1. ✅ ~~Fix `panOnDrag` to allow node dragging~~ (Will implement next)
2. ✅ **DONE** - Add proper delete mechanism (long-press context menu)
3. ✅ Make handles larger (44px touch targets)
4. ✅ Fix gesture conflicts (pan vs select vs drag)

### Medium Priority (UX Issues)

5. Add connection mode toggle
6. Implement long-press context menu
7. Fix spacing calculations with safe areas
8. Add visual touch feedback

### Low Priority (Enhancements)

9. Add haptic feedback
10. Optimize rendering performance
11. Add swipe gestures
12. Better landscape support

---

## 🔧 Recommended Changes

### 1. Fix panOnDrag

```tsx
<ReactFlow
  panOnDrag={[1, 2]}  // Only pan with middle/right mouse
  panOnScroll={true}  // Pan with scroll/two-finger on mobile
  selectionOnDrag={false}  // Prevent accidental box selection
  // ... other props
>
```

### 2. Increase touch targets

```tsx
<button className="p-3">
  {' '}
  // 12px padding = 44px minimum
  <svg className="h-5 w-5" />
</button>
```

### 3. Add delete button to selected nodes

```tsx
{
  selectedNodes.length > 0 && (
    <button onClick={deleteSelected} className="...">
      <Trash2 />
    </button>
  );
}
```

### 4. Connection mode toggle

```tsx
const [connectionMode, setConnectionMode] = useState(false);

<button onClick={() => setConnectionMode(!connectionMode)}>
  {connectionMode ? 'Done' : 'Connect Nodes'}
</button>;
```

### 5. Safe area spacing

```tsx
// Use CSS env() for safe areas
style={{
  bottom: `calc(env(safe-area-inset-bottom) + ${isHealthExpanded ? '140px' : '70px'})`
}}
```

### 6. Larger node handles

```tsx
// In CustomNode.tsx
.react-flow__handle {
  width: 44px;
  height: 44px;
  @media (min-width: 768px) {
    width: 16px;
    height: 16px;
  }
}
```

### 7. Add active states

```tsx
<button className="p-3 transition-transform active:scale-95 active:bg-gray-200">
  <svg className="h-5 w-5" />
</button>
```

---

## 📝 Implementation Checklist

- [ ] Fix `panOnDrag` configuration
- [ ] Increase all button touch targets to 44px
- [x] **DONE** - Add delete button for selected nodes (long-press context menu)
- [x] **DONE** - Add rename option in context menu
- [ ] Implement connection mode toggle
- [ ] Add safe area insets support
- [ ] Increase node handle sizes on mobile
- [ ] Add active/pressed states to all buttons
- [x] **DONE** - Implement long-press context menu
- [ ] Add visual feedback for all interactions
- [ ] Optimize re-renders with React.memo
- [ ] Test on actual iOS and Android devices
- [ ] Verify accessibility (VoiceOver/TalkBack)

---

## 🧪 Testing Scenarios

### Must Test on Real Devices

1. **Node Dragging**: Can you move nodes around?
2. **Connection Creation**: Can you connect two nodes?
3. **Node Selection**: Can you select a node with tap?
4. **Canvas Panning**: Can you pan the canvas with two fingers?
5. **Zoom**: Does pinch-to-zoom work smoothly?
6. **Node Deletion**: Can you delete a selected node?
7. **Controls Panel**: Do buttons respond to taps?
8. **Sidebar**: Can you tap to add nodes?
9. **Safe Areas**: Does UI respect iPhone notch/Android gesture bar?
10. **Landscape**: Does layout work in landscape mode?

### Device Coverage

- [ ] iPhone 15 Pro (iOS 17+)
- [ ] iPhone SE (small screen)
- [ ] Samsung Galaxy S24 (Android 14+)
- [ ] iPad Pro (tablet layout)
- [ ] Chrome DevTools mobile emulation

---

**Status**: This branch needs the above fixes before merging to main.

**Last Updated**: February 3, 2026
