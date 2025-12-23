import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardIcon from "./vectors/DashboardIcon";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-60 h-60 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">AI-Powered Finance for SMBs</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 animate-slide-up">
              Your finances,{" "}
              <span className="text-gradient">simplified</span>{" "}
              with AI
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              Manage invoices, track expenses, get AI insights, and connect with expert accountants — all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <Button variant="hero" size="lg" className="group" asChild>
                <Link to="/signup">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="group">
                <Play className="w-4 h-4" />
                Watch Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-6 border-t border-border/30 animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-xs text-muted-foreground mb-3">Trusted by growing businesses</p>
              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">500+</p>
                  <p className="text-[10px] text-muted-foreground">SMBs Onboarded</p>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">₹10Cr+</p>
                  <p className="text-[10px] text-muted-foreground">Invoices Processed</p>
                </div>
                <div className="w-px h-8 bg-border/50" />
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">50+</p>
                  <p className="text-[10px] text-muted-foreground">Expert CAs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right content - Dashboard Preview */}
          <div className="relative animate-scale-in delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/15 rounded-2xl blur-3xl transform scale-90" />
              
              {/* Dashboard illustration */}
              <div className="relative bg-gradient-card rounded-xl border border-border/50 p-4 shadow-card">
                <DashboardIcon className="w-full h-auto" />
                
                {/* Floating cards */}
                <div className="absolute -top-3 -right-3 bg-card rounded-lg border border-border/50 p-3 shadow-card animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">💡</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">AI Insight</p>
                      <p className="text-xs font-medium text-foreground">Expenses ↓ 15%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-3 bg-card rounded-lg border border-border/50 p-3 shadow-card animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs font-bold">CA</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Expert Available</p>
                      <p className="text-xs font-medium text-foreground">Book in 2 clicks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
