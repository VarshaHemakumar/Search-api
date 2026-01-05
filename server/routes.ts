import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { products } from "@shared/schema";

async function seedDatabase() {
  const existing = await storage.searchProducts();
  if (existing.length === 0) {
    const p1 = await storage.createProduct({
      name: "Vintage Camera",
      description: "A classic film camera in excellent condition.",
      currentPrice: "149.99",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
    });
    await storage.addPriceHistory({ productId: p1.id, price: "199.99", date: new Date("2025-01-01") });
    await storage.addPriceHistory({ productId: p1.id, price: "179.99", date: new Date("2025-03-15") });
    await storage.addPriceHistory({ productId: p1.id, price: "149.99", date: new Date("2025-06-01") });

    const p2 = await storage.createProduct({
      name: "Leather Satchel",
      description: "Handcrafted leather bag, perfect for daily use.",
      currentPrice: "89.50",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    });
    await storage.addPriceHistory({ productId: p2.id, price: "99.99", date: new Date("2025-02-01") });
    await storage.addPriceHistory({ productId: p2.id, price: "89.50", date: new Date("2025-04-20") });

    const p3 = await storage.createProduct({
      name: "Wireless Headphones",
      description: "Noise-cancelling headphones with 20h battery life.",
      currentPrice: "249.00",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    });
    await storage.addPriceHistory({ productId: p3.id, price: "299.00", date: new Date("2024-12-01") });
    await storage.addPriceHistory({ productId: p3.id, price: "249.00", date: new Date("2025-01-15") });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  seedDatabase();

  app.get(api.products.search.path, async (req, res) => {
    try {
      // Manual parse or via schema if complex, here query param 'q' is optional
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const results = await storage.searchProducts(q);
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.products.history.path, async (req, res) => {
    try {
      const input = api.products.history.input.parse(req.query);
      const history = await storage.getPriceHistory(input.productId);
      res.json(history);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
           message: err.errors[0].message,
           field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.')
        });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  return httpServer;
}
