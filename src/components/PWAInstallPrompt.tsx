import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>App Installed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            NeuroBud is installed and ready to use offline!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Card className="border-primary/20 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <CardTitle>Install NeuroBud</CardTitle>
        </div>
        <CardDescription>
          Install NeuroBud on your device for quick access and offline use
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="text-primary">✓</span> Works offline
          </p>
          <p className="flex items-center gap-2">
            <span className="text-primary">✓</span> Fast loading
          </p>
          <p className="flex items-center gap-2">
            <span className="text-primary">✓</span> Home screen access
          </p>
          <p className="flex items-center gap-2">
            <span className="text-primary">✓</span> Full screen experience
          </p>
        </div>
        <Button onClick={handleInstallClick} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
};
