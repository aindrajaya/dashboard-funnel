import { NodeType } from './types';
import { 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle 
} from 'lucide-react';

export const NODE_CONFIG = {
  [NodeType.SALES]: {
    label: 'Sales Page',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'bg-[#a5d8ff] border-gray-900 text-gray-900', // Pastel Blue
    handleColor: 'bg-blue-500',
    description: 'Entry point',
    maxOutgoing: 1,
  },
  [NodeType.ORDER]: {
    label: 'Order Page',
    icon: <CreditCard className="w-5 h-5" />,
    color: 'bg-[#bac8ff] border-gray-900 text-gray-900', // Pastel Indigo
    handleColor: 'bg-indigo-500',
    description: 'Checkout',
    maxOutgoing: Infinity,
  },
  [NodeType.UPSELL]: {
    label: 'Upsell',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'bg-[#b2f2bb] border-gray-900 text-gray-900', // Pastel Green
    handleColor: 'bg-green-500',
    description: 'Extra offer',
    maxOutgoing: Infinity,
  },
  [NodeType.DOWNSELL]: {
    label: 'Downsell',
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'bg-[#ffc9c9] border-gray-900 text-gray-900', // Pastel Red/Orange
    handleColor: 'bg-orange-500',
    description: 'Lower offer',
    maxOutgoing: Infinity,
  },
  [NodeType.THANK_YOU]: {
    label: 'Thank You',
    icon: <CheckCircle className="w-5 h-5" />,
    color: 'bg-[#e9ecef] border-gray-900 text-gray-900', // Pastel Gray
    handleColor: 'bg-slate-500',
    description: 'Completion',
    maxOutgoing: 0,
  },
};

export const LOCAL_STORAGE_KEY = 'cartpanda_funnel_state_v1';
export const SNAP_GRID: [number, number] = [20, 20];

export const MOCK_INITIAL_DATA = {
  nodes: [
    {
      id: 'sales-1',
      type: 'custom',
      position: { x: 250, y: 50 },
      data: { label: 'Sales Page', type: NodeType.SALES },
    },
    {
      id: 'order-1',
      type: 'custom',
      position: { x: 250, y: 200 },
      data: { label: 'Order Page', type: NodeType.ORDER },
    },
    {
      id: 'upsell-1',
      type: 'custom',
      position: { x: 100, y: 350 },
      data: { label: 'Upsell 1', type: NodeType.UPSELL },
    },
    {
      id: 'thank-you-1',
      type: 'custom',
      position: { x: 400, y: 350 },
      data: { label: 'Thank You', type: NodeType.THANK_YOU },
    },
    {
      id: 'thank-you-2',
      type: 'custom',
      position: { x: 100, y: 500 },
      data: { label: 'Thank You (VIP)', type: NodeType.THANK_YOU },
    }
  ],
  edges: [
    { id: 'e1-2', source: 'sales-1', target: 'order-1', type: 'smoothstep', animated: false, style: { strokeDasharray: '5,5' } },
    { id: 'e2-3', source: 'order-1', target: 'upsell-1', type: 'smoothstep', animated: false, style: { strokeDasharray: '5,5' } },
    { id: 'e2-4', source: 'order-1', target: 'thank-you-1', type: 'smoothstep', animated: false, style: { strokeDasharray: '5,5' } },
    { id: 'e3-5', source: 'upsell-1', target: 'thank-you-2', type: 'smoothstep', animated: false, style: { strokeDasharray: '5,5' } },
  ],
  nodeCounters: {
    [NodeType.SALES]: 1,
    [NodeType.ORDER]: 1,
    [NodeType.UPSELL]: 1,
    [NodeType.DOWNSELL]: 0,
    [NodeType.THANK_YOU]: 2,
  }
};