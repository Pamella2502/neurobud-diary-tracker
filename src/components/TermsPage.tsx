import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Lock, AlertTriangle } from "lucide-react";

export function TermsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service & Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8">
          {/* Terms of Service */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground text-sm">
                  By accessing and using NeuroBud Autism Diary ("Service"), you agree to comply with these Terms of
                  Service and our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Service Description</h3>
                <p className="text-muted-foreground text-sm">
                  NeuroBud Autism Diary is a microSaaS (web application) developed for parents and legal guardians of
                  autistic children in the United States. Its purpose is to facilitate family routine through recording
                  and monitoring daily information related to behavior and other aspects of development. NeuroBud is a
                  digital support diary, not a medical system. It serves only to organize and visualize records entered
                  by the user.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Eligibility</h3>
                <p className="text-muted-foreground text-sm">
                  • Be at least 18 years of age
                  <br />
                  • Reside in the United States
                  <br />• Be a parent or legal guardian of an autistic child
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">4. Subscription and Billing</h3>
                <p className="text-muted-foreground text-sm">
                  <strong>Free Trial Period</strong>
                  <br />
                  • 3 days free trial
                  <br />
                  • Automatic conversion to paid plan on the 4th day
                  <br />
                  • Cancellation possible before trial ends
                  <br />• ⚠️ If user does not cancel before the end of free trial period, charge will be automatically
                  processed without right to refund for the first month after trial.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5 text-primary" />
                Privacy Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2">1. Information Collected</h3>
                <p className="text-muted-foreground text-sm">
                  • Personal: guardian's name, email, timezone, and child's name and age
                  <br />
                  • Behavioral: sleep, mood, nutrition, medication, activities, crises, and other behavior records
                  <br />• Technical: IP, browser, device and usage patterns
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">2. Data Usage</h3>
                <p className="text-muted-foreground text-sm">
                  • Operate and maintain the Service
                  <br />
                  • Generate progress reports and charts
                  <br />
                  • Improve experience and features
                  <br />
                  • Customer support
                  <br />• Legal compliance
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">3. Data Security</h3>
                <p className="text-muted-foreground text-sm">
                  • Data encrypted in transit and at rest
                  <br />
                  • Servers located primarily in the USA
                  <br />• Regular audits and access control
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Important Disclaimers */}
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-warning" />
                Important Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-warning/10 border-warning/30">
                <AlertDescription>
                  <h3 className="font-semibold mb-1 text-foreground">Medical Disclaimer</h3>
                  <p className="text-muted-foreground text-sm">
                    NeuroBud Autism Diary is not a medical device and does not provide medical advice, diagnosis, or
                    treatment. Always consult healthcare professionals for medical decisions.
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="bg-accent/10 border-accent/30">
                <AlertDescription>
                  <h3 className="font-semibold mb-1 text-foreground">Medication Records</h3>
                  <p className="text-muted-foreground text-sm">
                    💊 Information displayed about medications or effects is based solely and exclusively on records
                    entered by the user. NeuroBud does not monitor, recommend, or remind about medication use and is
                    not responsible for errors, omissions, or consequences resulting from user annotations.
                  </p>
                </AlertDescription>
              </Alert>

              <Alert className="bg-destructive/10 border-destructive/30">
                <AlertDescription>
                  <h3 className="font-semibold mb-1 text-foreground">Limitation of Liability</h3>
                  <p className="text-muted-foreground text-sm">
                    NeuroBud and its creator shall not be liable for any direct, indirect, or consequential damages
                    resulting from technical errors, bugs, temporary malfunctions, or system updates, provided such
                    occurrences are not intentional and are corrected within reasonable time.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <div className="text-center py-8">
            <p className="text-muted-foreground">
              By using NeuroBud Autism Diary, you confirm that you have read, understood, and fully agree with these
              Terms and Policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}