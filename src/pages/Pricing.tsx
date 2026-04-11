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
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6">
              Pricing? Not today.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
              Enjoy the full power of our AI financial engine for free — our way of saying thanks for being here early.
            </p>
            <Button variant="hero" size="xl" asChild>
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
