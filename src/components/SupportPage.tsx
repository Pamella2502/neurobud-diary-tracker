import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Clock, Globe, AlertTriangle } from "lucide-react";

export function SupportPage() {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "Can I edit records from previous days?",
      answer:
        "No, by design for data accuracy. Records are locked after 11:58PM of each day to ensure data integrity. This is a conscious decision to maintain the reliability of records.",
    },
    {
      question: "How do I change my timezone?",
      answer:
        "For data security, timezone changes require verification. Email support@neurobud.com with: (1) Current timezone, (2) New desired timezone. We process within 24-72 hours.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "Go to Settings → Subscription → Manage Subscription. Cancellation is immediate and you maintain access until the end of the paid period. There are no partial refunds.",
    },
    {
      question: "Can I add more than one child?",
      answer:
        "Yes! Go to 'My Kids' → '+ Add Child'. Each child has separate records. The subscription covers all children in the same family.",
    },
    {
      question: "Can the app help with real-time crises?",
      answer:
        "No. NeuroBud is a diary for retrospective recording and analysis. In emergencies, contact healthcare professionals. We are not a medical device.",
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Support</h1>
        <p className="text-muted-foreground mb-8">Get help with NeuroBud Autism Diary</p>

        {/* Contact Information */}
        <Card className="shadow-card border-border mb-8">
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <Mail className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-muted-foreground">support@neurobud.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <p className="font-medium text-foreground">Response Time</p>
                <p className="text-muted-foreground">Within 24 to 72 business hours</p>
              </div>
            </div>
            <div className="flex items-start">
              <Globe className="h-6 w-6 text-primary mr-4 mt-1" />
              <div>
                <p className="font-medium text-foreground">Business Hours</p>
                <p className="text-muted-foreground">Eastern Standard Time (EST)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="shadow-card border-border mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-border rounded-lg overflow-hidden">
                <button
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <span className="text-muted-foreground text-xl">{activeFAQ === index ? "−" : "+"}</span>
                </button>
                {activeFAQ === index && (
                  <div className="p-4 border-t border-border bg-muted/30">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert className="bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="ml-2 text-foreground">
            <strong>Important Notice:</strong> NeuroBud Autism Diary does not replace evaluation or monitoring by
            healthcare professionals. All information entered in the application is provided by the user.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}