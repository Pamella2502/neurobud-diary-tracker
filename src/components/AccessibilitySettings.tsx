import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Contrast, Type, Zap } from 'lucide-react';

export const AccessibilitySettings = () => {
  const { settings, toggleHighContrast, setFontSize, toggleReducedMotion } = useAccessibility();

  const fontSizes = [
    { value: 'small', label: 'Small', size: 'text-sm' },
    { value: 'medium', label: 'Medium', size: 'text-base' },
    { value: 'large', label: 'Large', size: 'text-lg' },
    { value: 'extra-large', label: 'Extra Large', size: 'text-xl' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accessibility Settings</CardTitle>
        <CardDescription>
          Customize the app to meet your accessibility needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* High Contrast Mode */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Contrast className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base">
                High Contrast Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.highContrast}
            onCheckedChange={toggleHighContrast}
            aria-label="Toggle high contrast mode"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Type className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <Label className="text-base">Font Size</Label>
          </div>
          <div 
            className="grid grid-cols-2 gap-2" 
            role="group" 
            aria-label="Font size options"
          >
            {fontSizes.map(({ value, label, size }) => (
              <Button
                key={value}
                variant={settings.fontSize === value ? 'default' : 'outline'}
                onClick={() => setFontSize(value)}
                className={size}
                aria-pressed={settings.fontSize === value}
                aria-label={`Set font size to ${label}`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-base">
                Reduce Motion
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.reducedMotion}
            onCheckedChange={toggleReducedMotion}
            aria-label="Toggle reduced motion"
          />
        </div>
      </CardContent>
    </Card>
  );
};
