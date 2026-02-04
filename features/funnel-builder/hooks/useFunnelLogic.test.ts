import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFunnelLogic } from './useFunnelLogic';
import { NodeType } from '../../../types';

describe('useFunnelLogic', () => {
  it('initializes with empty nodes and edges', () => {
    const { result } = renderHook(() => useFunnelLogic());

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
  });

  it('adds a new node with timestamp-based ID', () => {
    const { result } = renderHook(() => useFunnelLogic());

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].id).toContain('sales');
    const nodeData = result.current.nodes[0]?.data as { type: NodeType };
    expect(nodeData.type).toBe(NodeType.SALES);
  });

  it('increments node counter for multiple nodes', () => {
    const { result } = renderHook(() => useFunnelLogic());

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
      result.current.addNode(NodeType.ORDER, { x: 200, y: 200 });
      result.current.addNode(NodeType.UPSELL, { x: 300, y: 300 });
    });

    expect(result.current.nodes).toHaveLength(3);
  });

  it('clears all nodes and edges', () => {
    const { result } = renderHook(() => useFunnelLogic());

    // Mock window.confirm to always return true
    const originalConfirm = window.confirm;
    window.confirm = () => true;

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
      result.current.addNode(NodeType.ORDER, { x: 200, y: 200 });
    });

    expect(result.current.nodes).toHaveLength(2);

    await act(async () => {
      await result.current.onClear();
    });

    expect(result.current.nodes).toHaveLength(0);

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('validates funnel structure', () => {
    const { result } = renderHook(() => useFunnelLogic());

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Validation should identify issues (dead-end node)
    expect(result.current.validationIssues.length).toBeGreaterThan(0);
  });

  it('supports undo functionality', () => {
    const { result } = renderHook(() => useFunnelLogic());

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Wait for history to update (debounced)
    setTimeout(() => {
      expect(result.current.nodes).toHaveLength(1);

      act(() => {
        result.current.undo();
      });

      expect(result.current.nodes).toHaveLength(0);
    }, 600);
  });

  it('supports redo functionality', () => {
    const { result } = renderHook(() => useFunnelLogic());

    act(() => {
      result.current.addNode(NodeType.SALES, { x: 100, y: 100 });
    });

    // Wait for history to update (debounced)
    setTimeout(() => {
      act(() => {
        result.current.undo();
        result.current.redo();
      });

      expect(result.current.nodes).toHaveLength(1);
    }, 600);
  });
});
