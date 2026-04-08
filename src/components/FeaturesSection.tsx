import AccountingIcon from "./vectors/AccountingIcon";
import ExpenseTrackingIcon from "./vectors/ExpenseTrackingIcon";
import CAConnectIcon from "./vectors/CAConnectIcon";

const features = [
  {
    title: "Expense Tracking",
    description: "Track and categorize your expenses effortlessly with OCR auto-extraction and smart categorization.",
    icon: ExpenseTrackingIcon,
    gradient: "from-primary/20 to-primary/5",
  },
  {
    title: "Smart Invoicing",
    description: "Create branded invoices, upload PDFs with OCR auto-extraction, and send via email or WhatsApp.",
    icon: AccountingIcon,
    gradient: "from-primary/30 to-primary/10",
  },
  {
    title: "Finance Expert",
    description: "Instantly connect with certified accountants. Book sessions, pay securely, and get expert help.",
    icon: CAConnectIcon,
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
