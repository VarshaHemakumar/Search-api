import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  currentPrice: decimal("current_price").notNull(),
  image: text("image"),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  price: decimal("price").notNull(),
  date: timestamp("date").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertPriceHistorySchema = createInsertSchema(priceHistory).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertPriceHistory = z.infer<typeof insertPriceHistorySchema>;
