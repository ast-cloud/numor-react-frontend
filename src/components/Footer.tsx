import { Mail, Phone, MapPin, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="py-12 border-t border-border/50 bg-secondary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-base">N</span>
              </div>
              <span className="font-display text-lg font-bold text-foreground">Numor</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              AI-powered finance management for small and medium businesses.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-primary/20 transition-colors">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Integrations", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Security", "Compliance"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024 Numor. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2 h-8 px-3"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-xs">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span className="text-xs">Dark Mode</span>
                </>
              )}
            </Button>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>Made with ❤️ in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
