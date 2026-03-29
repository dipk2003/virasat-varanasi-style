import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <img src={logo} alt="Virasat" className="h-16 w-auto mb-4 brightness-200" />
            <p className="font-body text-sm" style={{ color: "hsl(var(--cream-dark))" }}>
              Heritage woven in every thread. Premium sarees and kurtis curated for a richer, more luxurious storefront.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-ui text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Quick Links
            </h4>
            {["Premium Sarees", "Premium Kurtis", "360° View Styles", "New Arrivals", "Custom Design"].map((link) => (
              <a
                key={link}
                href="#"
                className="block font-body text-sm mb-3 hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.7)" }}
              >
                {link}
              </a>
            ))}
          </div>

          {/* Help */}
          <div>
            <h4 className="font-ui text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--gold))" }}>
              Customer Care
            </h4>
            {["Track Order", "Returns & Refunds", "Size Guide", "Custom Design", "Contact Us"].map((link) => (
              <a
                key={link}
                href="#"
                className="block font-body text-sm mb-3 hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.7)" }}
              >
                {link}
              </a>
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
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-3 bg-transparent font-ui text-xs tracking-wider"
                style={{ border: "1px solid hsl(var(--gold) / 0.3)", color: "hsl(var(--cream))" }}
              />
              <button className="px-6 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.15em] uppercase hover:bg-gold-dark transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="gold-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-ui text-xs tracking-wider" style={{ color: "hsl(var(--cream-dark) / 0.5)" }}>
            © 2026 Virasat. All rights reserved. Made with love in Varanasi.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Shipping Info"].map((link) => (
              <a
                key={link}
                href="#"
                className="font-ui text-xs tracking-wider hover:text-gold transition-colors"
                style={{ color: "hsl(var(--cream-dark) / 0.5)" }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
