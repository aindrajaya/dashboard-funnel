import { FunnelCanvas } from './features/funnel-builder/FunnelCanvas';
import { QueryProvider } from './src/providers/QueryProvider';
import { ErrorBoundary } from './src/providers/ErrorBoundary';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <FunnelCanvas />
        <Toaster />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
