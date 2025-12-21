import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative bg-gradient-card rounded-2xl border border-primary/20 p-6 sm:p-10 lg:p-12 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-foreground">Start your free trial today</span>
            </div>

            {/* Headline */}
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Ready to transform your{" "}
              <span className="text-gradient">business finances?</span>
            </h2>

            {/* Subheadline */}
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl mx-auto">
              Join hundreds of SMBs who have simplified their accounting, gained AI insights, and connected with expert CAs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" className="group">
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutline" size="lg">
                Talk to Sales
              </Button>
            </div>

            {/* Trust indicators */}
            <p className="mt-6 text-xs text-muted-foreground">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
