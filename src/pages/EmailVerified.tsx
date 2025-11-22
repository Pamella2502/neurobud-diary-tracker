import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";

export default function EmailVerified() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Clear pending verification email from localStorage
    localStorage.removeItem('pending_verification_email');
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-card animate-in zoom-in duration-500">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        <Card className="mt-8 shadow-card border-border animate-in slide-in-from-bottom duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Email verified!</CardTitle>
            <CardDescription className="text-base">
              Your account has been successfully verified.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to dashboard in {countdown} second{countdown !== 1 ? "s" : ""}...
              </p>
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Go to dashboard now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
