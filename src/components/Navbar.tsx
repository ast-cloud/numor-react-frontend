import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-base">N</span>
            </div>
            <span className="font-display text-lg font-bold text-foreground">Numor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link to="/ca" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              For Financial Experts
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sm h-8" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" size="sm" className="text-sm h-8" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-3">
              <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5">
                Features
              </a>
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5">
                How it Works
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5">
                Pricing
              </Link>
              <Link to="/ca" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5">
                For Financial Experts
              </Link>
              <div className="flex flex-col gap-2 pt-3">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button variant="hero" size="sm" className="w-full" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
