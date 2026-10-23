import HomePage from "@/components/home/HomePage";
import { getCategories } from "@/lib/api/categories";
import { getProducts } from "@/lib/api/products";
import type { Category, ProductPage } from "@/types/product";
import { unstable_rethrow } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
}) {
  const query = await searchParams;
  const rawCategory = Array.isArray(query.category) ? query.category[0] : query.category;
  const selectedCategory = rawCategory?.trim() || "all";
  const rawPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(rawPage ?? "1");
  const requestedPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const productsPromise: Promise<ProductPage | null> = getProducts(
    requestedPage - 1,
    10,
    {
      category: selectedCategory === "all" ? undefined : selectedCategory,
      sort: "newest",
    },
  ).catch((error) => {
    unstable_rethrow(error);
    console.error("Unable to load products from the backend:", error);
    return null;
  });

  const categoriesPromise: Promise<Category[]> = getCategories().catch((error) => {
    unstable_rethrow(error);
    console.error("Unable to load home categories from the backend:", error);
    return [];
  });

  return (
    <HomePage
      productsPromise={productsPromise}
      categoriesPromise={categoriesPromise}
      selectedCategory={selectedCategory}
      requestedPage={requestedPage}
    />
  );
}
