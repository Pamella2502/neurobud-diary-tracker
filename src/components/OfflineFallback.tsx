import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OfflineFallbackProps {
  onRetry?: () => void;
  message?: string;
}

export const OfflineFallback = ({ onRetry, message }: OfflineFallbackProps) => {
  return (
    <div 
      className="flex items-center justify-center min-h-[400px] p-4"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <WifiOff className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>
          </div>
          <CardTitle className="text-center">You're Offline</CardTitle>
          <CardDescription className="text-center">
            {message || "This content requires an internet connection. Please check your network and try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">What you can do:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>View previously loaded data</li>
              <li>Make changes (they'll sync when online)</li>
              <li>Access offline-available features</li>
            </ul>
          </div>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="w-full"
              aria-label="Retry connection"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
