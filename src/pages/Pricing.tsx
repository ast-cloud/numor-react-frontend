import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - Numor | Free AI Finance Tools</title>
        <meta
          name="description"
          content="Enjoy the full power of Numor's AI financial engine for free. No hidden fees, no trials — just powerful tools for your business."
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-start justify-center px-4 pt-28 pb-16 md:pt-32">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-4">
              Pricing? Not today.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              Enjoy the full power of our AI financial engine for free — our way of saying thanks for being here early.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Start Growing for $0</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
