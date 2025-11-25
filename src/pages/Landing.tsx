import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import neurobudLogo from "@/assets/neurobud-logo.png";
import { memo } from "react";

const Landing = memo(function Landing() {
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
                width="48"
                height="48"
                loading="eager"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" aria-labelledby="hero-heading">
        <div className="text-center">
          <h1 id="hero-heading" className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
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
              aria-label="Start your 3-day free trial of NeuroBud"
            >
              Start 3-Day Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 w-full sm:w-auto"
              aria-label="Learn more about NeuroBud features"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-card py-20 shadow-soft" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="features-heading" className="text-4xl font-bold text-center text-foreground mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
            {features.map((feature, index) => (
              <article
                key={index}
                className="text-center p-8 rounded-2xl bg-gradient-to-br from-background to-secondary border border-border shadow-card hover:shadow-lg transition-all duration-300"
                role="listitem"
              >
                <div className="text-5xl mb-4" aria-hidden="true">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="pricing-heading" className="sr-only">Pricing Plans</h2>
          <div className="max-w-md mx-auto bg-card rounded-3xl shadow-card overflow-hidden border border-border">
            <div className="p-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-foreground">Monthly Plan</h3>
                <div className="mt-4 flex items-baseline justify-center">
                  <span className="text-6xl font-extrabold text-foreground" aria-label="19 dollars and 99 cents">$19.99</span>
                  <span className="ml-2 text-xl text-muted-foreground">/month</span>
                </div>
                <p className="mt-4 text-muted-foreground">Start with 3-day free trial</p>
              </div>
              <div className="mt-8">
                <h4 className="sr-only">Plan Features</h4>
                <ul className="space-y-4" role="list">
                  {pricingFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div 
                        className="h-6 w-6 rounded-full bg-success/20 flex items-center justify-center mr-3"
                        aria-hidden="true"
                      >
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
                aria-label="Start your free trial - only 19.99 per month after trial"
              >
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} NeuroBud. All rights reserved.</p>
          <p className="mt-2 text-sm">Helping families track autism development with care and precision.</p>
        </div>
      </footer>
    </div>
  );
});

export default Landing;