import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";

import ProductSearch from "@/components/products/ProductSearch";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "Search | MOHAORI",
  description: "Search the MOHAORI product collection.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = await searchParams;
  const initialQuery = Array.isArray(query.q) ? query.q[0] : query.q ?? "";
  let products: Product[] = [];
  let loadError = false;

  try {
    products = await getProducts();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to load products for search:", error);
    loadError = true;
  }

  return (
    <ProductSearch
      key={initialQuery}
      products={products}
      initialQuery={initialQuery}
      loadError={loadError}
    />
  );
}
