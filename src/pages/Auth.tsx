import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && !agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "You MUST read and agree to the Terms & Privacy Policy to create an account.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      } else {
        const redirectUrl = `${window.location.origin}/email-verified`;
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              timezone,
              agreed_to_terms: true,
              terms_agreed_at: new Date().toISOString(),
              terms_version: "1.0",
            },
          },
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: userError } = await supabase.from("users").insert([
            {
              id: authData.user.id,
              email: authData.user.email!,
              timezone: timezone,
              agreed_to_terms: true,
              terms_agreed_at: new Date().toISOString(),
              terms_version: "1.0",
              subscription_status: "trial",
            },
          ]);

          if (userError) throw userError;
        }

        // Save email for error recovery
        localStorage.setItem('pending_verification_email', email);

        // Redirect to check email page
        navigate(`/check-email?email=${encodeURIComponent(email)}`);
      }
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: "Check your email to reset your password.",
      });
      setIsForgotPassword(false);
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

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const TermsModal = () => (
    <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms & Privacy Policy</DialogTitle>
        </DialogHeader>

        <div className="prose prose-sm max-w-none">
          <Alert className="mb-6">
            <AlertDescription>
              <strong>Important:</strong> By creating an account, you agree to our Terms of Service and Privacy Policy.
              Please read carefully before proceeding.
            </AlertDescription>
          </Alert>

          <h3>📄 Terms of Service</h3>
          <p>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing and using NeuroBud Autism Diary ("Service"), you agree to comply with these Terms of Service
            and our Privacy Policy.
          </p>

          <h4>2. Service Description</h4>
          <p>
            NeuroBud Autism Diary is a microSaaS developed for parents and legal guardians of autistic children in the
            United States.
          </p>

          <h4>3. Subscription & Billing</h4>
          <p>
            <strong>Free Trial:</strong> 3-day free trial with automatic conversion to paid plan ($19.99/month) on the
            4th day.
          </p>
          <p>
            <strong>Cancellation:</strong> You may cancel before trial ends. No refunds for partial periods.
          </p>

          <h4>4. Data Privacy</h4>
          <p>Your data is encrypted and never shared with third parties. We implement industry-standard security measures.</p>

          <h3>🔒 Privacy Policy</h3>

          <h4>1. Information Collected</h4>
          <p>We collect only necessary information for service operation:</p>
          <ul>
            <li>Parent/guardian email and timezone</li>
            <li>Child's name and age</li>
            <li>Behavioral records (sleep, mood, nutrition, etc.)</li>
          </ul>

          <h4>2. Data Usage</h4>
          <p>Your data is used solely to:</p>
          <ul>
            <li>Operate and maintain the Service</li>
            <li>Generate progress reports and analytics</li>
            <li>Provide customer support</li>
          </ul>

          <h4>3. Data Security</h4>
          <p>All data is encrypted in transit and at rest. Servers are located in the United States.</p>

          <Alert variant="destructive" className="mt-6">
            <AlertDescription>
              <h4 className="font-semibold mb-2">⚠️ Important Medical Disclaimer</h4>
              <p className="text-sm">
                NeuroBud Autism Diary is NOT a medical device and does NOT provide medical advice, diagnosis, or
                treatment. Always consult healthcare professionals for medical decisions. We do not monitor or remind
                about medications.
              </p>
            </AlertDescription>
          </Alert>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>By checking the agreement box, you confirm that:</strong>
              <br />
              • You have read and understood these Terms & Privacy Policy
              <br />
              • You agree to be bound by these terms
              <br />
              • You are at least 18 years old
              <br />
              • You are a parent/guardian of an autistic child
              <br />• You reside in the United States
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-card">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
          {isForgotPassword ? "Reset password" : isLogin ? "Welcome back" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-muted-foreground">
          {isForgotPassword ? "Enter your email to receive the reset link" : isLogin ? "Sign in to continue tracking" : "Start your 3-day free trial"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-card sm:rounded-2xl sm:px-10 border border-border">
          <form className="space-y-6" onSubmit={isForgotPassword ? handleForgotPassword : handleAuth}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!isForgotPassword && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="mt-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password (min. 6 characters)"
                />
                {isLogin && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary-hover underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    type="text"
                    readOnly
                    className="mt-1 bg-muted cursor-not-allowed"
                    value={timezone}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Detected automatically. This ensures accurate daily record tracking.
                  </p>
                </div>

                <Alert className="border-accent/20 bg-accent/10">
                  <AlertDescription>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="agree-terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor="agree-terms" className="block text-sm text-foreground cursor-pointer">
                        <span className="font-semibold">I HAVE READ AND AGREE TO THE TERMS & PRIVACY POLICY</span>
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="ml-1 text-primary hover:text-primary-hover underline"
                        >
                          (click to read)
                        </button>
                        <p className="text-destructive text-xs mt-1 font-semibold">
                          ✓ Required to create account - This protects both you and us legally
                        </p>
                      </label>
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert variant="destructive">
                  <AlertDescription className="text-xs">
                    <strong>Legal Acknowledgement:</strong> By checking this box, you confirm you have read,
                    understood, and voluntarily agree to be bound by all terms and conditions. This constitutes a
                    legally binding "Clickwrap Agreement".
                  </AlertDescription>
                </Alert>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading || (!isLogin && !isForgotPassword && !agreedToTerms)}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isForgotPassword ? "Send reset link" : isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          {!isForgotPassword && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 text-center">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                Back to login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => navigate("/")}>
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>

      <TermsModal />
    </div>
  );
}