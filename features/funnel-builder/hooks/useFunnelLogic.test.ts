import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFunnelLogic } from './useFunnelLogic';
import { NodeType } from '../../../types';
import { AllTheProviders } from '../../../src/test/test-utils';

describe('useFunnelLogic', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });
  it('initializes with empty nodes and edges', () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('adds a new node with timestamp-based ID', () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toContain('sales');
    const nodeData = result.current.nodes[0]?.data as { type: NodeType };
    expect(nodeData.type).toBe(NodeType.SALES);
  });

  it('increments node counter for multiple nodes', () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
      result.current.addNode(NodeType.ORDER, { x: 200, y: 200 });
      result.current.addNode(NodeType.UPSELL, { x: 300, y: 300 });
    });

    expect(result.current.nodes).toHaveLength(3);
  });

  it('validates funnel structure', () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    if (!result.current) {
      throw new Error('Hook did not initialize');
    }

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Validation should identify issues (dead-end node)
    expect(result.current.validationIssues.length).toBeGreaterThan(0);
  });

  it('supports undo functionality', async () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    if (!result.current) {
      throw new Error('Hook did not initialize');
    }

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Wait for history to update (debounced)
    await new Promise((resolve) => setTimeout(resolve, 600));

    expect(result.current.nodes).toHaveLength(1);

    act(() => {
      result.current.undo();
    });

    expect(result.current.nodes).toHaveLength(0);
  });

  it('supports redo functionality', async () => {
    const { result } = renderHook(() => useFunnelLogic(), { wrapper: AllTheProviders });

    if (!result.current) {
      throw new Error('Hook did not initialize');
    }

    // Add a node
    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Wait for history to update (debounced)
    await new Promise((resolve) => setTimeout(resolve, 600));

    const initialLength = result.current.nodes.length;
    expect(initialLength).toBeGreaterThan(0);

    // Undo
    act(() => {
      result.current.undo();
    });

    const afterUndo = result.current.nodes.length;
    expect(afterUndo).toBeLessThan(initialLength);

    // Redo
    act(() => {
      result.current.redo();
    });

    expect(result.current.nodes).toHaveLength(initialLength);
  });
});
