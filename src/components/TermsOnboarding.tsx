import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TermsOnboardingProps {
  userId: string;
}

export default function TermsOnboarding({ userId }: TermsOnboardingProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  const handleAcceptTerms = async () => {
    if (!agreedToTerms) {
      alert("You must agree to the Terms & Privacy Policy to use NeuroBud.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          agreed_to_terms: true,
          terms_agreed_at: new Date().toISOString(),
          terms_version: "1.0",
        })
        .eq("id", userId);

      if (error) throw error;

      window.location.reload();
    } catch (error: any) {
      console.error("Error accepting terms:", error);
      alert("Error accepting terms: " + error.message);
      setLoading(false);
    }
  };

  const TermsContent = () => (
    <div className="prose prose-sm max-w-none bg-card p-6 rounded-lg border border-border max-h-96 overflow-y-auto">
      <h3 className="text-foreground">📄 Terms of Service & Privacy Policy</h3>
      <p className="text-muted-foreground">
        <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
      </p>

      <Alert className="mb-4">
        <AlertDescription className="text-sm">
          <strong>Required Action:</strong> You must accept these terms to continue using NeuroBud Autism Diary.
        </AlertDescription>
      </Alert>

      <h4 className="text-foreground">1. Acceptance of Terms</h4>
      <p className="text-muted-foreground">
        By using NeuroBud Autism Diary, you agree to comply with these Terms of Service and our Privacy Policy.
      </p>

      <h4 className="text-foreground">2. Service Description</h4>
      <p className="text-muted-foreground">
        NeuroBud is a digital diary for parents/guardians of autistic children to track daily behaviors and progress.
      </p>

      <h4 className="text-foreground">3. Subscription & Billing</h4>
      <p className="text-muted-foreground">
        • 3-day free trial, then $19.99/month
        <br />
        • Cancel anytime during trial
        <br />• No refunds for partial periods
      </p>

      <h4 className="text-foreground">4. Data Privacy & Security</h4>
      <p className="text-muted-foreground">
        • Your data is encrypted and never sold
        <br />
        • We use industry-standard security measures
        <br />• Data stored in US servers
      </p>

      <h4 className="text-foreground">5. Medical Disclaimer</h4>
      <Alert variant="destructive">
        <AlertDescription className="text-sm">
          <strong>⚠️ IMPORTANT:</strong> NeuroBud is NOT a medical device. We do NOT provide medical advice, diagnosis,
          or treatment. Always consult healthcare professionals for medical decisions.
        </AlertDescription>
      </Alert>

      <div className="mt-6 p-4 bg-muted rounded">
        <p className="text-sm text-foreground">
          <strong>By agreeing, you confirm that:</strong>
          <br />
          • You have read and understood these terms
          <br />
          • You are at least 18 years old
          <br />
          • You are a parent/guardian of an autistic child
          <br />
          • You reside in the United States
          <br />• You understand this is not a medical device
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card rounded-2xl shadow-card border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-card">
                <span className="text-white font-bold text-2xl">N</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground">Welcome to NeuroBud!</h1>
            <p className="text-muted-foreground text-center mt-2">
              Before you continue, please review and accept our Terms & Privacy Policy
            </p>
          </div>

          <div className="p-6">
            {showTerms ? (
              <TermsContent />
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Terms & Privacy Policy</h3>
                <p className="text-muted-foreground">Please review our terms before continuing</p>
              </div>
            )}

            <div className="mt-6 bg-accent/10 border border-accent/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree-terms-onboarding"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-1"
                />
                <label htmlFor="agree-terms-onboarding" className="block text-sm text-foreground cursor-pointer">
                  <span className="font-semibold">I HAVE READ AND AGREE TO THE TERMS & PRIVACY POLICY</span>
                  <p className="text-destructive text-xs mt-1 font-semibold">
                    ✓ Required to continue - Legal Clickwrap Agreement
                  </p>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowTerms(!showTerms)} className="flex-1">
                {showTerms ? "Hide Terms" : "Show Terms"}
              </Button>
              <Button onClick={handleAcceptTerms} disabled={!agreedToTerms || loading} className="flex-1">
                {loading ? "Processing..." : "Accept & Continue"}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Cancel and Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
