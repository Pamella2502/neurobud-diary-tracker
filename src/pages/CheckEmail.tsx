import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, RefreshCw, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(EXPIRATION_TIME);
  const [startTime] = useState(Date.now());
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = EXPIRATION_TIME - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        clearInterval(interval);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (timeRemaining / EXPIRATION_TIME) * 100;
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage > 50) return "bg-green-500";
    if (percentage > 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  const isWarningTime = () => {
    return timeRemaining < 15 * 60 * 1000 && !isExpired; // Less than 15 minutes
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email not found. Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-verified`,
        },
      });

      if (error) throw error;

      // Reset timer
      window.location.reload();

      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-card">
            <Mail className="w-10 h-10 text-white" />
          </div>
        </div>

        <Card className="mt-8 shadow-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer Section */}
            <div className={`bg-gradient-to-br ${isExpired ? 'from-destructive/10 to-destructive/20' : isWarningTime() ? 'from-yellow-500/10 to-yellow-500/20' : 'from-primary/10 to-accent/20'} p-6 rounded-xl border ${isExpired ? 'border-destructive/30' : isWarningTime() ? 'border-yellow-500/30' : 'border-primary/30'} animate-fade-in`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${isExpired ? 'text-destructive animate-pulse' : isWarningTime() ? 'text-yellow-600 animate-pulse' : 'text-primary'}`} />
                  <span className="font-semibold text-sm">
                    {isExpired ? 'Link Expired' : 'Link expires in'}
                  </span>
                </div>
                <span className={`text-2xl font-bold tabular-nums ${isExpired ? 'text-destructive' : isWarningTime() ? 'text-yellow-600' : 'text-primary'}`}>
                  {isExpired ? '0:00' : formatTime(timeRemaining)}
                </span>
              </div>
              
              {/* Custom Progress Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary mb-2">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                {isExpired ? 'Please request a new verification link below' : 'Verification link is valid for 1 hour'}
              </p>
            </div>

            {/* Warning Alert */}
            {isWarningTime() && !isExpired && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10 animate-fade-in">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  Your verification link will expire soon. Please verify your email or request a new link.
                </AlertDescription>
              </Alert>
            )}

            {/* Expired Alert */}
            {isExpired && (
              <Alert variant="destructive" className="animate-fade-in">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your verification link has expired. Click below to receive a new verification email.
                </AlertDescription>
              </Alert>
            )}

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground space-y-2">
              <p className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Open your email inbox</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Click the verification link in the email</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">3.</span>
                <span>You'll be redirected to start using NeuroBud</span>
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                variant={isExpired ? "default" : "outline"}
                className="w-full"
                onClick={handleResendEmail}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isExpired ? 'Send new verification email' : 'Resend verification email'}
                  </>
                )}
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => navigate("/auth")}>
                Back to login
              </Button>
            </div>

            <div className="pt-4 text-center text-xs text-muted-foreground">
              <p>Didn't receive the email? Check your spam folder.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
