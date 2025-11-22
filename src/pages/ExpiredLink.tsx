import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Mail, Loader2, XCircle, ArrowRight } from "lucide-react";

export default function ExpiredLink() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const errorType = searchParams.get("type") || "expired"; // expired, invalid, or used
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const getErrorContent = () => {
    switch (errorType) {
      case "invalid":
        return {
          title: "Invalid verification link",
          icon: <XCircle className="w-12 h-12 text-destructive" />,
          description: "This verification link is not valid or has been corrupted.",
          details: "The link you clicked may be incomplete or incorrect. This can happen if the email was forwarded or the link was modified.",
        };
      case "used":
        return {
          title: "Link already used",
          icon: <AlertTriangle className="w-12 h-12 text-yellow-600" />,
          description: "This verification link has already been used.",
          details: "Your email has already been verified. You can sign in to your account now.",
        };
      default: // expired
        return {
          title: "Verification link expired",
          icon: <AlertTriangle className="w-12 h-12 text-destructive" />,
          description: "This verification link has expired after 1 hour.",
          details: "For security reasons, verification links are only valid for 1 hour after being sent. Don't worry - you can request a new verification email below.",
        };
    }
  };

  const content = getErrorContent();

  const handleRequestNewLink = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to receive a new verification link.",
        variant: "destructive",
      });
      navigate("/auth");
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

      toast({
        title: "New email sent!",
        description: "Check your inbox for the new verification link.",
      });

      navigate(`/check-email?email=${encodeURIComponent(email)}`);
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
        <div className="flex justify-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-destructive/80 to-destructive rounded-2xl flex items-center justify-center shadow-card">
            {content.icon}
          </div>
        </div>

        <Card className="mt-8 shadow-card border-border animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-destructive">{content.title}</CardTitle>
            <CardDescription className="text-base mt-2">
              {content.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Details */}
            <Alert variant="destructive" className="border-destructive/50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-1">What happened?</p>
                <p className="text-sm">{content.details}</p>
              </AlertDescription>
            </Alert>

            {/* Solutions Section */}
            <div className="bg-muted p-5 rounded-lg space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-primary" />
                What to do next:
              </h3>

              {errorType === "used" ? (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>Your account is already active and ready to use</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Click "Go to login" below to sign in</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>Use your email and password to access your account</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">1.</span>
                    <span>
                      {email ? "Click the button below to receive a new verification email" : "Return to the signup page and enter your email"}
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">2.</span>
                    <span>Check your inbox for the new verification link</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="font-semibold text-foreground">3.</span>
                    <span>Click the link within 1 hour to verify your account</span>
                  </p>
                </div>
              )}
            </div>

            {/* Email Display */}
            {email && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-semibold text-foreground">{email}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {errorType === "used" ? (
                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Go to login
                </Button>
              ) : (
                <>
                  {email ? (
                    <Button 
                      className="w-full" 
                      onClick={handleRequestNewLink}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending new link...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send new verification email
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => navigate("/auth")}>
                      Return to signup
                    </Button>
                  )}
                </>
              )}

              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate("/auth")}
              >
                {errorType === "used" ? "Already have an account? Sign in" : "Go to login page"}
              </Button>
            </div>

            {/* Help Section */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Still having trouble? Check your spam folder or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
