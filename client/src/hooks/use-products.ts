import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertProduct } from "@shared/routes";

// ============================================
// PRODUCTS HOOKS
// ============================================

export function useProductSearch(query: string = "") {
  return useQuery({
    queryKey: [api.products.search.path, query],
    queryFn: async () => {
      // Pass 'q' as query parameter using URLSearchParams
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      
      const url = `${api.products.search.path}?${params.toString()}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      
      const data = await res.json();
      return api.products.search.responses[200].parse(data);
    },
  });
}

export function usePriceHistory(productId: number | undefined) {
  return useQuery({
    queryKey: [api.products.history.path, productId],
    enabled: !!productId,
    queryFn: async () => {
      if (!productId) return [];
      
      // The API expects productId as a query parameter
      const params = new URLSearchParams({ productId: productId.toString() });
      const url = `${api.products.history.path}?${params.toString()}`;
      
      const res = await fetch(url, { credentials: "include" });
      
      if (res.status === 404) return [];
      if (!res.ok) throw new Error("Failed to fetch history");
      
      const data = await res.json();
      return api.products.history.responses[200].parse(data);
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const validated = api.products.create.input.parse(data);
      
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.products.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create product");
      }
      
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate search query to show new product
      queryClient.invalidateQueries({ queryKey: [api.products.search.path] });
    },
  });
}
