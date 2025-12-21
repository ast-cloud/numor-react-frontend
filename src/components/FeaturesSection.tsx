import AccountingIcon from "./vectors/AccountingIcon";
import AIInsightsIcon from "./vectors/AIInsightsIcon";
import CAConnectIcon from "./vectors/CAConnectIcon";
import { FileText, Receipt, BarChart3, MessageSquare, Sparkles, Users, Calendar, Star } from "lucide-react";

const features = [
  {
    title: "Smart Invoicing",
    description: "Create branded invoices, upload PDFs with OCR auto-extraction, and send via email or WhatsApp.",
    icon: AccountingIcon,
    subFeatures: [
      { icon: FileText, text: "Branded Templates" },
      { icon: Receipt, text: "OCR Auto-Extract" },
    ],
    gradient: "from-primary/20 to-primary/5",
  },
  {
    title: "AI-Powered Insights",
    description: "Get intelligent answers about your finances through our AI chatbot and visual dashboards.",
    icon: AIInsightsIcon,
    subFeatures: [
      { icon: MessageSquare, text: "Financial Q&A" },
      { icon: Sparkles, text: "Smart Predictions" },
    ],
    gradient: "from-primary/30 to-primary/10",
  },
  {
    title: "CA Connect",
    description: "Instantly connect with certified accountants. Book sessions, pay securely, and get expert help.",
    icon: CAConnectIcon,
    subFeatures: [
      { icon: Users, text: "Expert Network" },
      { icon: Calendar, text: "Easy Booking" },
    ],
    gradient: "from-primary/20 to-primary/5",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-glow opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <BarChart3 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Powerful Features</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-gradient">manage finances</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            From invoicing to AI insights to expert consultations — Numor brings all your financial tools together.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-gradient-card rounded-xl border border-border/50 p-5 hover:border-primary/30 transition-all duration-500 hover:shadow-glow"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4">
                  <feature.icon className="w-24 h-24 mx-auto group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {/* Sub-features */}
                <div className="flex flex-wrap gap-2">
                  {feature.subFeatures.map((sub) => (
                    <div
                      key={sub.text}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-secondary/50 border border-border/50"
                    >
                      <sub.icon className="w-3 h-3 text-primary" />
                      <span className="text-xs text-muted-foreground">{sub.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional features list */}
        <div className="mt-12 lg:mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Receipt, title: "Expense Tracking", desc: "Auto-categorize with OCR" },
            { icon: BarChart3, title: "Cash Flow Charts", desc: "Visual monthly reports" },
            { icon: Star, title: "CA Reviews", desc: "Rate your consultations" },
            { icon: Sparkles, title: "Smart Alerts", desc: "AI-powered notifications" },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground mb-0.5">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
