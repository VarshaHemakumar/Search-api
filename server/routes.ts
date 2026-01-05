import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { subDays, format } from "date-fns";

async function seedDatabase() {
  const existing = await storage.searchProducts();
  if (existing.length === 0) {
    const testProducts = [
      { name: "Sony WH-1000XM5", price: "398.00", rating: 4.8, reviewCount: 1250, vendor: "Amazon", sellerType: "official", inStock: true, discontinued: false, url: "https://amazon.com/sony-wh1000xm5" },
      { name: "Dell XPS 13", price: "999.00", rating: 4.5, reviewCount: 850, vendor: "Best Buy", sellerType: "official", inStock: true, discontinued: false, url: "https://bestbuy.com/dell-xps-13" },
      { name: "Samsung Galaxy S24", price: "799.99", rating: 4.2, reviewCount: 2100, vendor: "Walmart", sellerType: "official", inStock: true, discontinued: false, url: "https://walmart.com/samsung-s24" },
      { name: "Apple MacBook Air M3", price: "1099.00", rating: 3.8, reviewCount: 650, vendor: "Amazon", sellerType: "official", inStock: true, discontinued: false, url: "https://amazon.com/macbook-air-m3" },
      { name: "Logitech MX Master 3S", price: "99.00", rating: 3.6, reviewCount: 1500, vendor: "Target", sellerType: "official", inStock: true, discontinued: false, url: "https://target.com/logitech-mx" },
      { name: "Kindle Paperwhite", price: "139.99", rating: 3.2, reviewCount: 4500, vendor: "Amazon", sellerType: "official", inStock: true, discontinued: false, url: "https://amazon.com/kindle" },
      { name: "Razer DeathAdder V3", price: "69.99", rating: 2.8, reviewCount: 300, vendor: "Best Buy", sellerType: "official", inStock: true, discontinued: false, url: "https://bestbuy.com/razer" },
      { name: "Bose QuietComfort", price: "349.00", rating: 3.0, reviewCount: 1200, vendor: "Walmart", sellerType: "official", inStock: true, discontinued: false, url: "https://walmart.com/bose" },
      { name: "Cheap Generic Buds", price: "19.99", rating: 4.1, reviewCount: 50, vendor: "Amazon", sellerType: "third-party", inStock: true, discontinued: false, url: "https://amazon.com/generic-buds" },
      { name: "Old iPad Air 2", price: "150.00", rating: 4.4, reviewCount: 2000, vendor: "Target", sellerType: "official", inStock: false, discontinued: true, url: "https://target.com/ipad-air-2" },
    ];

    for (const p of testProducts) {
      const created = await storage.createProduct(p as any);
      const basePrice = parseFloat(p.price);
      
      // Pattern 3: FAKE DISCOUNT (product_id ends in 3)
      if (created.id.toString().endsWith('3')) {
        for (let i = 90; i > 1; i--) {
          await storage.addPriceHistory({ 
            productId: created.id, 
            price: (basePrice * 0.81).toFixed(2), // Original $649 equivalent
            date: subDays(new Date(), i) 
          });
        }
        await storage.addPriceHistory({ 
          productId: created.id, 
          price: (basePrice).toFixed(2), // Jumped to $799 equivalent
          date: subDays(new Date(), 1) 
        });
        await storage.addPriceHistory({ 
          productId: created.id, 
          price: (basePrice * 0.81).toFixed(2), // Back to "sale"
          date: new Date() 
        });
      } else {
        // Standard fluctuations
        for (let i = 90; i >= 0; i--) {
          const fluctuation = (Math.random() * 0.1 - 0.05) * basePrice;
          await storage.addPriceHistory({
            productId: created.id,
            price: (basePrice + fluctuation).toFixed(2),
            date: subDays(new Date(), i)
          });
        }
      }
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  seedDatabase();

  app.get(api.products.search.path, async (req, res) => {
    try {
      const q = req.query.query as string;
      const products = await storage.searchProducts(q);
      
      res.json({
        products: products.map(p => ({
          id: p.id.toString(),
          name: p.name,
          price: parseFloat(p.price as string),
          rating: p.rating,
          review_count: p.reviewCount,
          vendor: p.vendor,
          seller_type: p.sellerType,
          in_stock: p.inStock,
          discontinued: p.discontinued,
          url: p.url
        })),
        total_results: products.length
      });
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.products.history.path, async (req, res) => {
    try {
      const input = api.products.history.input.parse(req.query);
      const id = parseInt(input.product_id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const history = await storage.getPriceHistory(id);
      const prices = history.map(h => parseFloat(h.price as string));
      
      const lowest = Math.min(...prices);
      const highest = Math.max(...prices);
      const average = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      let fakeDiscount = false;
      let manipulationDetails = "No price manipulation detected.";
      
      if (input.product_id.endsWith('3')) {
        fakeDiscount = true;
        manipulationDetails = "Price was artificially inflated by 23% 24 hours ago before being placed 'on sale' at the previous regular price.";
      }

      let authorized = true;
      if (input.product_id.endsWith('4')) {
        authorized = false;
      }

      const trend = prices[prices.length - 1] > prices[0] ? "increasing" : (prices[prices.length - 1] < prices[0] ? "decreasing" : "stable");

      res.json({
        product_id: input.product_id,
        price_history: history.map(h => ({
          date: format(h.date, "yyyy-MM-dd"),
          price: parseFloat(h.price as string)
        })),
        lowest_price_90days: lowest,
        highest_price_90days: highest,
        average_price: parseFloat(average.toFixed(2)),
        fake_discount_detected: fakeDiscount,
        price_manipulation_details: manipulationDetails,
        authorized_retailer: authorized,
        deal_quality_score: fakeDiscount ? 2 : (authorized ? 9 : 4),
        price_trend: trend
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product_id" });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
