import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Numor - AI-Powered Finance for SMBs | Smart Invoicing & CA Connect</title>
        <meta 
          name="description" 
          content="Numor simplifies business finances with AI-powered invoicing, expense tracking, smart insights, and instant access to certified accountants. Start your free trial today." 
        />
        <meta name="keywords" content="AI finance, SMB accounting, invoice management, expense tracking, CA connect, business finance app" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
