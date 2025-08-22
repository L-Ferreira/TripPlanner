import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IOSInstallInstructions, PWAInstallPrompt } from './components/PWAInstallPrompt';
import TripPlanner from './components/TripPlanner';
import { SyncProvider } from './contexts/SyncContext';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Force Portuguese as default if no language is set
    if (!localStorage.getItem('i18nextLng')) {
      i18n.changeLanguage('pt');
    }
  }, [i18n]);

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
