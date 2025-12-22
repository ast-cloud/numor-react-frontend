import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, Target, Zap, Heart } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                About Numor
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're on a mission to simplify financial management for small and medium businesses across India. 
                By combining AI technology with intuitive design, we help businesses focus on growth, not paperwork.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              <div className="p-8 rounded-2xl bg-background border border-border/50">
                <Target className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize access to smart financial tools, making professional-grade accounting 
                  and insights accessible to every business, regardless of size.
                </p>
              </div>
              <div className="p-8 rounded-2xl bg-background border border-border/50">
                <Zap className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl font-display font-bold text-foreground mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To become India's most trusted AI-powered finance platform, empowering millions 
                  of SMBs to make smarter financial decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Our Values
              </h2>
              <p className="text-muted-foreground">
                The principles that guide everything we do
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Heart, title: "Customer First", desc: "Every decision starts with our users" },
                { icon: Zap, title: "Innovation", desc: "Pushing boundaries with AI technology" },
                { icon: Users, title: "Transparency", desc: "Building trust through openness" },
                { icon: Target, title: "Excellence", desc: "Striving for the best in everything" },
              ].map((value, idx) => (
                <div key={idx} className="text-center p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-4">
                Built by Passionate People
              </h2>
              <p className="text-muted-foreground mb-8">
                Our team combines expertise in finance, technology, and design to create 
                the best possible experience for SMBs.
              </p>
              <div className="inline-flex items-center gap-3 bg-background border border-border/50 rounded-full px-6 py-3">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">Based in India, serving globally</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
