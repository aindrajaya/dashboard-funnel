import { Edge, Node } from 'reactflow';

export enum NodeType {
  SALES = 'sales',
  ORDER = 'order',
  UPSELL = 'upsell',
  DOWNSELL = 'downsell',
  THANK_YOU = 'thank_you',
}

export interface FunnelNodeData {
  label: string;
  type: NodeType;
  isInvalid?: boolean;
}

export type FunnelNode = Node<FunnelNodeData>;

export interface ValidationIssue {
  nodeId: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface FunnelState {
  nodes: FunnelNode[];
  edges: Edge[];
  nodeCounters: Record<NodeType, number>;
}

export interface SavedFunnel extends FunnelState {
  version: number;
  updatedAt: string;
}