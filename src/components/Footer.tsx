import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";

const quickLinks = [
  { label: "Premium Sarees", to: "/shop?category=banarasi-silk" },
  { label: "Premium Kurtis", to: "/shop?category=designer-kurtis" },
  { label: "360° View Styles", to: "/360-view-styles" },
  { label: "New Arrivals", to: "/shop?sort=newest" },
  { label: "Custom Design", to: "/custom-design" },
];

const customerCareLinks = [
  { label: "Track Order", to: "/track-order" },
  { label: "Returns & Refunds", to: "/returns-and-refunds" },
  { label: "Size Guide", to: "/size-guide" },
  { label: "Custom Design", to: "/custom-design" },
  { label: "Contact Us", to: "/contact-us" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Shipping Info", to: "/shipping-info" },
];

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({ title: "Enter your email first" });
      return;
    }

    toast({
      title: "Thanks for joining",
      description: "You can wire this form to your preferred newsletter flow next.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <img src={logo} alt="Virasat" className="h-16 w-auto mb-4 brightness-200" />
            </Link>
            <p className="font-body text-sm" style={{ color: "hsl(var(--cream-dark))" }}>
              Heritage woven in every thread. Premium sarees and kurtis curated for a richer, more luxurious storefront.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Quick Links
            </h4>
            {quickLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block font-body text-sm mb-3 hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.7)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Help */}
          <div>
            <h4 className="font-ui text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Customer Care
            </h4>
            {customerCareLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block font-body text-sm mb-3 hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.7)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-ui text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Stay Connected
            </h4>
            <p className="font-body text-sm mb-4" style={{ color: "hsl(var(--cream-dark) / 0.7)" }}>
              Get exclusive access to new collections and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="flex-1 px-4 py-3 bg-transparent font-ui text-xs tracking-wider"
                style={{ border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--cream))" }}
              />
              <button type="submit" className="px-6 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-gold-dark transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-ui text-xs tracking-wider" style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>
            © 2026 Virasat. All rights reserved. Made with love in Varanasi.
          </p>
          <div className="flex gap-6">
            {legalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="font-ui text-xs tracking-wider hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.5)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
