import { db } from "./db";
import {
  products,
  priceHistory,
  type Product,
  type PriceHistory,
  type InsertProduct,
  type InsertPriceHistory
} from "@shared/schema";
import { eq, ilike } from "drizzle-orm";

export interface IStorage {
  searchProducts(query?: string): Promise<Product[]>;
  getPriceHistory(productId: number): Promise<PriceHistory[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory>;
  getProduct(id: number): Promise<Product | undefined>;
}

export class DatabaseStorage implements IStorage {
  async searchProducts(query?: string): Promise<Product[]> {
    if (!query) {
      return await db.select().from(products);
    }
    return await db.select().from(products).where(ilike(products.name, `%${query}%`));
  }

  async getPriceHistory(productId: number): Promise<PriceHistory[]> {
    return await db.select()
      .from(priceHistory)
      .where(eq(priceHistory.productId, productId))
      .orderBy(priceHistory.date);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async addPriceHistory(history: InsertPriceHistory): Promise<PriceHistory> {
    const [newHistory] = await db.insert(priceHistory).values(history).returning();
    return newHistory;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
}

export const storage = new DatabaseStorage();
