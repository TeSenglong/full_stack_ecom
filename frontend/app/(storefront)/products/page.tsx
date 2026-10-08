import type { Metadata } from "next";
import { unstable_rethrow } from "next/navigation";
import ProductsCatalog from "@/components/products/ProductsCatalog";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import type { Product } from "@/types/product";

export const metadata: Metadata = {
  title: "The Collection | MOHAORI",
  description: "Explore the complete MOHAORI collection of considered objects for modern living.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    sort?: string | string[];
  }>;
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  let products: Product[] = [];
  let categoryOptions: string[] = [];
  let loadError = false;

  await Promise.all([
    getProducts()
      .then((data) => {
        products = data;
      })
      .catch((error) => {
        unstable_rethrow(error);
        console.error("Unable to load the product catalog:", error);
        loadError = true;
      }),
    getCategories()
      .then((data) => {
        categoryOptions = data.map((category) => category.name);
      })
      .catch((error) => {
        unstable_rethrow(error);
        console.error("Unable to load product filter categories:", error);
      }),
  ]);

  return (
    <ProductsCatalog
      products={products}
      categoryOptions={categoryOptions}
      initialSearch={firstValue(query.q) ?? ""}
      initialCategory={firstValue(query.category) ?? "all"}
      initialSort={firstValue(query.sort) ?? "featured"}
      loadError={loadError}
    />
  );
}
