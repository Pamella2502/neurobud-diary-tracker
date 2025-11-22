import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, RefreshCw } from "lucide-react";

export default function CheckEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

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
                variant="outline"
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
                    Resend verification email
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
