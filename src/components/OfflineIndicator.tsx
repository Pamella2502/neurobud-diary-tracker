import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5">
      <Alert variant={isOnline ? 'default' : 'destructive'}>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertDescription>
            {isOnline ? 'Back online' : 'You are offline'}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};
