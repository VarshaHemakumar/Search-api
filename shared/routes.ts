import { z } from 'zod';
import { products, priceHistory } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  products: {
    search: {
      method: 'GET' as const,
      path: '/api/product-search',
      input: z.object({
        query: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          products: z.array(z.object({
            id: z.string(),
            name: z.string(),
            price: z.number(),
            rating: z.number(),
            review_count: z.number(),
            vendor: z.enum(["Amazon", "Walmart", "Target", "Best Buy"]),
            seller_type: z.enum(["official", "third-party"]),
            in_stock: z.boolean(),
            discontinued: z.boolean(),
            url: z.string(),
          })),
          total_results: z.number(),
        }),
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/price-history',
      input: z.object({
        product_id: z.string(),
      }),
      responses: {
        200: z.object({
          product_id: z.string(),
          price_history: z.array(z.object({
            date: z.string(),
            price: z.number(),
          })),
          lowest_price_90days: z.number(),
          highest_price_90days: z.number(),
          average_price: z.number(),
          fake_discount_detected: z.boolean(),
          price_manipulation_details: z.string(),
          authorized_retailer: z.boolean(),
          deal_quality_score: z.number(),
          price_trend: z.enum(["increasing", "decreasing", "stable"]),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
