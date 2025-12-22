import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-10">
                Last updated: January 2024
              </p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Numor's services, you accept and agree to be bound by these 
                    Terms of Service. If you do not agree to these terms, please do not use our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    2. Description of Service
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Numor provides AI-powered financial management tools for small and medium businesses, 
                    including invoicing, expense tracking, financial insights, and CA connection services. 
                    We reserve the right to modify or discontinue any aspect of the service at any time.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    3. User Accounts
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You are responsible for maintaining the confidentiality of your account credentials 
                    and for all activities that occur under your account. You must immediately notify us 
                    of any unauthorized use of your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    4. User Conduct
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You agree not to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Use the service for any unlawful purpose</li>
                    <li>Upload false or misleading financial information</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    5. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content, features, and functionality of the Numor service are owned by Numor and 
                    are protected by intellectual property laws. You may not copy, modify, or distribute 
                    any part of our service without prior written consent.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    6. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Numor shall not be liable for any indirect, incidental, special, consequential, or 
                    punitive damages arising from your use of the service. Our total liability shall not 
                    exceed the amount paid by you for the service in the past twelve months.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    7. Changes to Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may revise these Terms of Service at any time. We will notify you of any material 
                    changes by posting the new terms on our website. Your continued use of the service 
                    after such changes constitutes acceptance of the new terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    8. Contact
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms of Service, please contact us at:<br />
                    Email: legal@numor.in<br />
                    Address: Bangalore, India
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
