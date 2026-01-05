import { pgTable, text, serial, decimal, timestamp, boolean, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  rating: doublePrecision("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  vendor: text("vendor", { enum: ["Amazon", "Walmart", "Target", "Best Buy"] }).notNull(),
  sellerType: text("seller_type", { enum: ["official", "third-party"] }).notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  discontinued: boolean("discontinued").notNull().default(false),
  url: text("url").notNull(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
