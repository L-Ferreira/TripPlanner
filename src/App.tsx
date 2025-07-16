import { IOSInstallInstructions, PWAInstallPrompt } from './components/PWAInstallPrompt';
import TripPlanner from './components/TripPlanner';
import { SyncProvider } from './contexts/SyncContext';

function App() {
  return (
    <SyncProvider>
      <div className="min-h-screen bg-gray-50">
        <TripPlanner />
        <PWAInstallPrompt />
        <IOSInstallInstructions />
      </div>
    </SyncProvider>
  );
}

export default App;
