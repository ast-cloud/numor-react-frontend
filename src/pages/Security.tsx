import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Server, Eye, CheckCircle } from "lucide-react";

const Security = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Security at Numor
              </h1>
              <p className="text-lg text-muted-foreground">
                Your financial data security is our top priority. Learn about the measures we take to protect your information.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {/* Security Features */}
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: Lock,
                    title: "End-to-End Encryption",
                    desc: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
                  },
                  {
                    icon: Server,
                    title: "Secure Infrastructure",
                    desc: "Our servers are hosted in SOC 2 compliant data centers with 24/7 monitoring.",
                  },
                  {
                    icon: Eye,
                    title: "Access Controls",
                    desc: "Role-based access controls ensure only authorized personnel can access sensitive data.",
                  },
                  {
                    icon: Shield,
                    title: "Regular Audits",
                    desc: "We conduct regular security audits and penetration testing to identify vulnerabilities.",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <feature.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Compliance */}
              <div className="p-8 rounded-2xl bg-secondary/20 border border-border/50">
                <h2 className="text-xl font-display font-bold text-foreground mb-6">
                  Compliance & Certifications
                </h2>
                <div className="space-y-4">
                  {[
                    "ISO 27001 certified information security management",
                    "GDPR compliant data processing practices",
                    "SOC 2 Type II compliance for data security",
                    "Regular third-party security assessments",
                    "PCI DSS compliant payment processing",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Report Vulnerability */}
              <div className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20">
                <h2 className="text-xl font-display font-bold text-foreground mb-3">
                  Report a Vulnerability
                </h2>
                <p className="text-muted-foreground mb-4">
                  Found a security issue? We appreciate responsible disclosure.
                </p>
                <a 
                  href="mailto:security@numor.in" 
                  className="text-primary hover:underline font-medium"
                >
                  security@numor.in
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Security;
