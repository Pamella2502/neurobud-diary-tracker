import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import neurobudLogo from "@/assets/neurobud-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Daily Tracking",
      description: "Comprehensive tracking of sleep, mood, nutrition, medications, activities, and crises",
      icon: "📊",
    },
    {
      title: "Progress Analytics",
      description: "Visual charts and insights to understand patterns and progress over time",
      icon: "📈",
    },
    {
      title: "Secure & Private",
      description: "Your data is encrypted and never shared. Complete privacy for your family",
      icon: "🔒",
    },
  ];

  const pricingFeatures = [
    "Unlimited daily tracking",
    "Multiple children profiles",
    "Progress analytics & charts",
    "PDF report generation",
    "Secure cloud backup",
    "Priority email support",
  ];

  return (
    <div className="min-h-screen bg-gradient-calm">
      {/* Header */}
      <header 
        className="bg-card/80 backdrop-blur-sm shadow-soft sticky top-0 z-50"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img 
                src={neurobudLogo} 
                alt="NeuroBud Logo - Autism Diary and Progress Tracker" 
                className="w-12 h-12 rounded-2xl shadow-card" 
              />
              <span className="ml-3 text-2xl font-bold text-foreground">NeuroBud</span>
            </div>
            <Button 
              onClick={() => navigate("/auth")} 
              className="shadow-soft"
              aria-label="Start your free trial of NeuroBud"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Track Your Child's Progress with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">NeuroBud</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            The comprehensive autism diary that helps you monitor sleep, mood, nutrition, medications,
            activities, and more. Make data-driven decisions for your child's development.
          </p>
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 shadow-card w-full sm:w-auto"
            >
              Start 3-Day Free Trial
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-background to-secondary border border-border shadow-card hover:shadow-lg transition-all duration-300"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto bg-card rounded-3xl shadow-card overflow-hidden border border-border">
            <div className="p-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-foreground">Monthly Plan</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-6xl font-extrabold text-foreground">$19.99</span>
                  <span className="ml-2 text-xl text-muted-foreground">/month</span>
                </div>
                <p className="mt-4 text-muted-foreground">Start with 3-day free trial</p>
              </div>
              <div className="mt-8">
                <ul className="space-y-4">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center mr-3">
                        <Check className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => navigate("/auth")}
                className="mt-8 w-full text-lg py-6 shadow-card"
                size="lg"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 NeuroBud Autism Diary. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}