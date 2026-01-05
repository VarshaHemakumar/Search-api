import { Product } from "@shared/schema";
import { motion } from "framer-motion";
import { Tag, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <div 
        onClick={onClick}
        className="group relative cursor-pointer h-full flex flex-col bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
      >
        <div className="aspect-[4/3] w-full bg-secondary/30 relative overflow-hidden">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <Tag className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
              <ArrowUpRight className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-display font-semibold text-xl text-primary line-clamp-2 leading-tight group-hover:text-primary/80 transition-colors">
            {product.name}
          </h3>
          
          <div className="mt-auto pt-4 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Price</span>
              <span className="text-2xl font-bold font-display text-primary">
                ${Number(product.currentPrice).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
