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
        <main className="flex-1 flex items-start justify-center px-4 pt-28 pb-16 md:pt-32 relative overflow-hidden">
          {/* Subtle background financial graphics */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
            {/* Left side - bar chart */}
            <svg
              className="absolute left-[5%] top-[15%] w-48 h-48 md:w-72 md:h-72"
              viewBox="0 0 200 200"
              fill="none"
            >
              <rect x="20" y="120" width="20" height="60" rx="4" fill="hsl(var(--primary))" />
              <rect x="50" y="90" width="20" height="90" rx="4" fill="hsl(var(--primary))" />
              <rect x="80" y="60" width="20" height="120" rx="4" fill="hsl(var(--primary))" />
              <rect x="110" y="100" width="20" height="80" rx="4" fill="hsl(var(--primary))" />
              <rect x="140" y="40" width="20" height="140" rx="4" fill="hsl(var(--primary))" />
              <line x1="10" y1="180" x2="170" y2="180" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
              <line x1="10" y1="30" x2="10" y2="180" stroke="hsl(var(--foreground))" strokeWidth="1.5" />
            </svg>

            {/* Right side - line chart */}
            <svg
              className="absolute right-[5%] top-[20%] w-48 h-48 md:w-64 md:h-64"
              viewBox="0 0 200 160"
              fill="none"
            >
              <polyline
                points="10,120 40,100 70,110 100,60 130,80 160,30 190,50"
                stroke="hsl(var(--primary))"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="10,130 40,120 70,125 100,90 130,105 160,70 190,85"
                stroke="hsl(var(--foreground))"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 4"
              />
              <line x1="10" y1="140" x2="190" y2="140" stroke="hsl(var(--foreground))" strokeWidth="1" />
            </svg>

            {/* Bottom right - candlestick / growth arrow */}
            <svg
              className="absolute right-[8%] bottom-[8%] w-40 h-40 md:w-56 md:h-56"
              viewBox="0 0 200 160"
              fill="none"
            >
              {/* Candlesticks */}
              <line x1="30" y1="40" x2="30" y2="130" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <rect x="24" y="60" width="12" height="40" rx="2" fill="hsl(var(--primary))" />
              <line x1="70" y1="50" x2="70" y2="120" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <rect x="64" y="70" width="12" height="30" rx="2" fill="hsl(var(--foreground))" />
              <line x1="110" y1="30" x2="110" y2="110" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <rect x="104" y="45" width="12" height="35" rx="2" fill="hsl(var(--primary))" />
              <line x1="150" y1="20" x2="150" y2="100" stroke="hsl(var(--foreground))" strokeWidth="1" />
              <rect x="144" y="35" width="12" height="40" rx="2" fill="hsl(var(--primary))" />
            </svg>
          </div>

          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-glow pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto relative z-10">
            <h1 className="font-display text-2xl md:text-4xl font-bold text-muted-foreground mb-6">
              Pricing? Not today.
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mb-10 max-w-md mx-auto">
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
