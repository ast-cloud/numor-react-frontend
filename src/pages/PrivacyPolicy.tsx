import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-10">
                Last updated: January 2024
              </p>

              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    1. Information We Collect
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, 
                    use our services, or contact us for support. This may include your name, email address, 
                    phone number, business information, and financial data you choose to share with us.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    2. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-2">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Develop new products and services</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    3. Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal 
                    data against unauthorized access, alteration, disclosure, or destruction. This includes 
                    encryption, secure servers, and regular security assessments.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    4. Data Sharing
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We do not sell your personal information. We may share your information with third-party 
                    service providers who perform services on our behalf, such as payment processing and 
                    data analysis, subject to confidentiality obligations.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    5. Your Rights
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    You have the right to access, correct, or delete your personal information. You may also 
                    object to or restrict certain processing of your data. To exercise these rights, please 
                    contact us at privacy@numor.in.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-display font-semibold text-foreground mb-3">
                    6. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us at:<br />
                    Email: privacy@numor.in<br />
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

export default PrivacyPolicy;
