import { useState } from "react";
import { useProductSearch } from "@/hooks/use-products";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailDialog } from "@/components/ProductDetailDialog";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { Input } from "@/components/ui/input";
import { Search, PackageOpen } from "lucide-react";
import { Product } from "@shared/schema";
import { useDebounce } from "@/hooks/use-debounce"; // We'll implement this simple hook inline or use standard approach

// Simple debounce hook implementation inline for this page
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      setIsDebouncing(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounceValue(searchTerm, 300);
  
  const { data: products, isLoading, isError } = useProductSearch(debouncedSearch);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header Section */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold font-display text-xl">
              P
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-primary">PriceTrack</span>
          </div>
          
          <CreateProductDialog />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero / Search Section */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary leading-tight">
            Track Prices.<br/>
            <span className="text-muted-foreground/80">Make Smarter Decisions.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Monitor product price history and trends with our minimalist tracking dashboard. 
            Never overpay again.
          </p>
          
          <div className="relative max-w-xl mx-auto mt-8 group">
            <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full group-hover:bg-primary/10 transition-all duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products..."
                className="w-full pl-12 pr-4 h-14 rounded-full border-2 border-border/60 bg-background shadow-sm text-lg focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold font-display text-primary">
              {searchTerm ? `Search Results` : `Recent Products`}
            </h2>
            <span className="text-sm text-muted-foreground font-medium">
              {products?.length || 0} items found
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-[360px] rounded-xl bg-secondary/40 animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20 text-destructive">
              <p>Failed to load products. Please try again later.</p>
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <PackageOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">No products found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or add a new product.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {products?.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => handleProductClick(product)} 
                />
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Detail Dialog */}
      <ProductDetailDialog 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
        product={selectedProduct} 
      />
    </div>
  );
}
