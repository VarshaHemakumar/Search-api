import { Product } from "@shared/schema";
import { usePriceHistory } from "@/hooks/use-products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { ShoppingCart, TrendingUp } from "lucide-react";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const { data: history, isLoading } = usePriceHistory(product?.id);

  if (!product) return null;

  // Transform data for chart
  const chartData = history?.map(item => ({
    price: Number(item.price),
    date: item.date ? format(new Date(item.date), "MMM d") : "",
    fullDate: item.date ? format(new Date(item.date), "PPP") : "",
  })).reverse() || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border/50 shadow-2xl rounded-2xl gap-0">
        <div className="flex flex-col md:flex-row h-full max-h-[85vh] overflow-y-auto md:overflow-hidden">
          {/* Image Section - Left/Top */}
          <div className="w-full md:w-2/5 bg-secondary/30 relative h-64 md:h-auto min-h-[300px]">
            {product.image ? (
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-secondary">
                <ShoppingCart className="w-20 h-20 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </div>

          {/* Content Section - Right/Bottom */}
          <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
            <DialogHeader className="mb-6">
              <DialogTitle className="font-display text-3xl font-bold text-primary leading-tight">
                {product.name}
              </DialogTitle>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                {product.description}
              </p>
            </DialogHeader>

            <div className="space-y-6 flex-grow">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Current Price
                  </p>
                  <p className="text-4xl font-display font-bold text-primary">
                    ${Number(product.currentPrice).toFixed(2)}
                  </p>
                </div>
                {chartData.length > 1 && (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">Tracked Item</span>
                  </div>
                )}
              </div>

              <div className="flex-grow min-h-[250px] relative rounded-xl border border-border/50 bg-secondary/10 p-4">
                <h4 className="text-sm font-semibold mb-4 text-primary flex items-center gap-2">
                  Price History
                </h4>
                
                {isLoading ? (
                  <div className="w-full h-[200px] flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                          dx={-10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            boxShadow: 'var(--shadow-lg)'
                          }}
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          labelFormatter={(label, payload) => payload[0]?.payload?.fullDate || label}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    No price history available yet.
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-border/50 flex justify-end">
              <button 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
                onClick={() => onOpenChange(false)}
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
