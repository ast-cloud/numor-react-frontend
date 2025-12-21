import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import DashboardIcon from "./vectors/DashboardIcon";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">AI-Powered Finance for SMBs</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 animate-slide-up">
              Your finances,{" "}
              <span className="text-gradient">simplified</span>{" "}
              with AI
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              Manage invoices, track expenses, get AI insights, and connect with expert accountants — all in one powerful platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <Button variant="hero" size="xl" className="group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutline" size="xl" className="group">
                <Play className="w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 pt-8 border-t border-border/30 animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' }}>
              <p className="text-sm text-muted-foreground mb-4">Trusted by growing businesses</p>
              <div className="flex items-center gap-8 justify-center lg:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-xs text-muted-foreground">SMBs Onboarded</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">₹10Cr+</p>
                  <p className="text-xs text-muted-foreground">Invoices Processed</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">50+</p>
                  <p className="text-xs text-muted-foreground">Expert CAs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right content - Dashboard Preview */}
          <div className="relative animate-scale-in delay-200" style={{ opacity: 0, animationFillMode: 'forwards' }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl transform scale-90" />
              
              {/* Dashboard illustration */}
              <div className="relative bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card">
                <DashboardIcon className="w-full h-auto" />
                
                {/* Floating cards */}
                <div className="absolute -top-4 -right-4 bg-card rounded-xl border border-border/50 p-4 shadow-card animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-lg">💡</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AI Insight</p>
                      <p className="text-sm font-medium text-foreground">Expenses ↓ 15%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card rounded-xl border border-border/50 p-4 shadow-card animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">CA</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expert Available</p>
                      <p className="text-sm font-medium text-foreground">Book in 2 clicks</p>
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
