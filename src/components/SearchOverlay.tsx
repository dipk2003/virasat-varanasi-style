import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  fabric: string | null;
  images: string[] | null;
  category?: { name: string; slug: string } | null;
}

const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, fabric, images, category:categories(name, slug)")
        .eq("is_active", true)
        .or(`name.ilike.%${q}%,fabric.ilike.%${q}%,description.ilike.%${q}%`)
        .limit(8);
      setResults((data as any[]) || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const goToProduct = (slug: string) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const goToShop = () => {
    onClose();
    navigate(`/shop`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/80 backdrop-blur-md z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-[60] pt-20 pb-8 px-4"
          >
            <div className="max-w-2xl mx-auto">
              {/* Search Input */}
              <div className="relative mb-6">
                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--gold))" }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search kurtis, fabrics, collections..."
                  className="w-full pl-16 pr-14 py-5 bg-background/95 backdrop-blur-sm border border-border font-body text-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent transition-colors"
                  onKeyDown={(e) => { if (e.key === "Escape") onClose(); if (e.key === "Enter" && results.length > 0) goToProduct(results[0].slug); }}
                />
                <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Results */}
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-background/95 backdrop-blur-sm border border-border max-h-[60vh] overflow-y-auto">
                    {results.map((item, i) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => goToProduct(item.slug)}
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/10 transition-colors text-left border-b border-border last:border-0"
                      >
                        {item.images?.[0] && (
                          <img src={item.images[0]} alt={item.name} className="w-14 h-18 object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-sm text-foreground truncate">{item.name}</p>
                          <p className="font-ui text-[10px] tracking-wider text-muted-foreground">
                            {item.category?.name} {item.fabric && `• ${item.fabric}`}
                          </p>
                        </div>
                        <span className="font-ui text-sm text-foreground flex-shrink-0">₹{item.price.toLocaleString("en-IN")}</span>
                        <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                      </motion.button>
                    ))}
                    <button onClick={goToShop} className="w-full py-3 text-center font-ui text-xs tracking-wider text-accent hover:bg-accent/10 transition-colors">
                      View all results →
                    </button>
                  </motion.div>
                ) : query.trim() ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                    <p className="font-display text-lg" style={{ color: "hsl(var(--cream))" }}>No results found</p>
                    <p className="font-body text-sm mt-1" style={{ color: "hsl(var(--cream-dark) / 0.6)" }}>Try a different search term</p>
                  </motion.div>
                ) : (
                  <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                    <p className="font-ui text-xs tracking-[0.2em] uppercase" style={{ color: "hsl(var(--gold-light))" }}>Popular searches</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {["Banarasi Silk", "Cotton", "Festive", "Chiffon", "Designer"].map((tag) => (
                        <button key={tag} onClick={() => setQuery(tag)} className="px-4 py-2 border font-ui text-xs tracking-wider hover:border-accent hover:text-accent transition-colors" style={{ borderColor: "hsl(var(--gold) / 0.3)", color: "hsl(var(--cream-dark))" }}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
