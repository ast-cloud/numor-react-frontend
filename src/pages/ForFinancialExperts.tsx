import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, TrendingUp, Shield, Clock, CheckCircle2, ArrowRight } from "lucide-react";

const ForFinancialExperts = () => {
  const benefits = [
    {
      icon: Users,
      title: "Expand Your Client Base",
      description: "Connect with businesses actively seeking financial expertise and advisory services.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Practice",
      description: "Access a steady stream of qualified leads looking for professional financial guidance.",
    },
    {
      icon: Shield,
      title: "Verified Expert Status",
      description: "Stand out with our verification badge that builds trust with potential clients.",
    },
    {
      icon: Clock,
      title: "Flexible Engagement",
      description: "Choose your availability and work with clients on your own terms.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Create Your Profile",
      description: "Sign up and build your professional profile showcasing your expertise and credentials.",
    },
    {
      number: "02",
      title: "Get Verified",
      description: "Complete our verification process to earn the trusted expert badge.",
    },
    {
      number: "03",
      title: "Connect with Clients",
      description: "Start receiving client requests and grow your advisory practice.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
              For Financial Experts
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
              Partner with Numor to Grow Your Practice
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Join our network of trusted financial experts. Connect with businesses that need your expertise and build meaningful client relationships.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/expert-signup">
                  Apply as an Expert
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Why Partner with Numor?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide the platform and tools you need to focus on what you do best — advising clients.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{benefit.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started is simple. Follow these steps to join our expert network.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-5xl font-display font-bold text-primary/20 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Expert Requirements
            </h2>
            <p className="text-muted-foreground">
              We maintain high standards to ensure quality for our clients.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Certified Public Accountant (CA/CPA) or equivalent",
              "Minimum 3 years of professional experience",
              "Valid professional certifications",
              "Clean professional record",
              "Strong communication skills",
              "Commitment to client confidentiality",
            ].map((requirement, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border/50">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-foreground">{requirement}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to Join Our Network?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Take the first step towards growing your practice. Apply today and start connecting with clients who need your expertise.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/expert-signup">
              Apply Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ForFinancialExperts;
