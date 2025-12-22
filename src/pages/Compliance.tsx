import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileCheck, Scale, Building, Globe } from "lucide-react";

const Compliance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Scale className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Compliance
              </h1>
              <p className="text-lg text-muted-foreground">
                Numor is committed to maintaining the highest standards of regulatory compliance 
                to protect our users and their businesses.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-10">
              {/* Compliance Areas */}
              <div className="grid sm:grid-cols-2 gap-6">
                {[
                  {
                    icon: Building,
                    title: "GST Compliance",
                    desc: "Our invoicing system is fully compliant with Indian GST regulations, ensuring accurate tax calculations and reporting.",
                  },
                  {
                    icon: FileCheck,
                    title: "Accounting Standards",
                    desc: "We follow Indian Accounting Standards (Ind AS) and provide reports that meet statutory requirements.",
                  },
                  {
                    icon: Globe,
                    title: "Data Localization",
                    desc: "All Indian user data is stored within India in compliance with data localization requirements.",
                  },
                  {
                    icon: Scale,
                    title: "RBI Guidelines",
                    desc: "Our financial services adhere to Reserve Bank of India guidelines and regulations.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <item.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Regulatory Framework */}
              <div className="p-8 rounded-2xl bg-secondary/20 border border-border/50">
                <h2 className="text-xl font-display font-bold text-foreground mb-6">
                  Regulatory Framework
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Information Technology Act, 2000
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We comply with the IT Act and its amendments, including reasonable security practices 
                      and procedures for handling sensitive personal data.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Digital Personal Data Protection Act, 2023
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Numor is aligned with the DPDPA requirements for data collection, processing, 
                      and user consent management.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Companies Act, 2013
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Our financial reporting features support compliance with statutory requirements 
                      under the Companies Act.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="text-center p-8 rounded-2xl bg-primary/5 border border-primary/20">
                <h2 className="text-xl font-display font-bold text-foreground mb-3">
                  Compliance Inquiries
                </h2>
                <p className="text-muted-foreground mb-4">
                  For compliance-related questions or documentation requests, please contact our team.
                </p>
                <a 
                  href="mailto:compliance@numor.in" 
                  className="text-primary hover:underline font-medium"
                >
                  compliance@numor.in
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

export default Compliance;
