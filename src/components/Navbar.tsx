import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Collections", href: "#categories" },
  { label: "New Arrivals", href: "#new-arrivals" },
  { label: "Sale", href: "#sale" },
  { label: "Custom Design", href: "#custom" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-luxury"
          : "bg-transparent"
      }`}
    >
      {/* Sale banner */}
      <div className="bg-maroon-gradient overflow-hidden">
        <div className="animate-marquee whitespace-nowrap py-1.5">
          <span className="font-ui text-xs tracking-[0.3em] uppercase text-primary-foreground mx-8">
            ✦ Limited Collection — Flat 30% Off on Banarasi Silk ✦
          </span>
          <span className="font-ui text-xs tracking-[0.3em] uppercase text-primary-foreground mx-8">
            ✦ Free Shipping on Orders Above ₹2,999 ✦
          </span>
          <span className="font-ui text-xs tracking-[0.3em] uppercase text-primary-foreground mx-8">
            ✦ Limited Collection — Flat 30% Off on Banarasi Silk ✦
          </span>
          <span className="font-ui text-xs tracking-[0.3em] uppercase text-primary-foreground mx-8">
            ✦ Free Shipping on Orders Above ₹2,999 ✦
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <img src={logo} alt="Virasat" className="h-14 w-auto" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-ui text-sm tracking-[0.15em] uppercase text-foreground/80 hover:text-accent transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="text-foreground/70 hover:text-accent transition-colors">
              <Search size={20} />
            </button>
            <button
              className="text-foreground/70 hover:text-accent transition-colors"
              onClick={() => navigate(user ? (isAdmin ? "/admin" : "/dashboard") : "/auth")}
            >
              <User size={20} />
            </button>
            <button className="text-foreground/70 hover:text-accent transition-colors relative">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-ui font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-lg border-t border-border"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="font-ui text-sm tracking-[0.15em] uppercase text-foreground/80 hover:text-accent py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
