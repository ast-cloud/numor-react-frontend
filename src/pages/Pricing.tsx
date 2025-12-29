import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for small businesses just getting started",
    features: [
      "Up to 10 invoices/month",
      "Basic expense tracking",
      "Email support",
      "1 user account",
      "Basic reports",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "₹999",
    period: "/month",
    description: "Best for growing businesses with more needs",
    features: [
      "Unlimited invoices",
      "Advanced expense tracking",
      "AI-powered insights",
      "Priority support",
      "Up to 5 user accounts",
      "Custom reports",
      "CA Connect access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "₹2,499",
    period: "/month",
    description: "For large teams with advanced requirements",
    features: [
      "Everything in Professional",
      "Unlimited users",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Numor | Affordable AI Finance Solutions</title>
        <meta
          name="description"
          content="Choose the perfect plan for your business. Numor offers flexible pricing from free starter plans to enterprise solutions with AI-powered finance tools."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-16">
          {/* Header */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business. No hidden fees, cancel anytime.
            </p>
          </section>

          {/* Pricing Cards */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 flex flex-col ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-card"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link to="/signup">{plan.cta}</Link>
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ or Additional Info */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
            <p className="text-muted-foreground">
              Have questions?{" "}
              <Link to="/contact" className="text-primary hover:underline">
                Contact our sales team
              </Link>
            </p>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
