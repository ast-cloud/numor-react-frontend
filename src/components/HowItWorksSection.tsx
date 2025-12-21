import { Upload, Brain, UserCheck, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload & Manage",
    description: "Upload invoices and receipts. Our OCR technology automatically extracts all the data you need.",
    color: "from-primary/40 to-primary/20",
  },
  {
    number: "02",
    icon: Brain,
    title: "AI Analyzes",
    description: "Our AI processes your financial data, generates insights, and answers your questions in real-time.",
    color: "from-primary/50 to-primary/25",
  },
  {
    number: "03",
    icon: UserCheck,
    title: "Connect & Grow",
    description: "Need expert help? Book a session with a certified accountant in just a few clicks.",
    color: "from-primary/60 to-primary/30",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 relative overflow-hidden bg-secondary/20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <ArrowRight className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Simple Process</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            How <span className="text-gradient">Numor</span> works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Get started in minutes. No complex setup, just smart financial management.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative group"
              >
                {/* Card */}
                <div className="relative bg-gradient-card rounded-xl border border-border/50 p-6 text-center hover:border-primary/40 transition-all duration-500 hover:shadow-glow">
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center border-2 border-background`}>
                      <span className="text-[10px] font-bold text-primary-foreground">{index + 1}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 pt-2">
                    <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
