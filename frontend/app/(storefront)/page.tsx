import HomePage from "@/components/home/HomePage";
import { getProducts } from "@/lib/api/products";
import type { ShowcaseProduct } from "@/types/product";
import { unstable_rethrow } from "next/navigation";

export default async function Page() {
  let products: ShowcaseProduct[] = [];

  try {
    const data = await getProducts();
    products = data.map((item) => ({
      id: String(item.id),
      name: item.name,
      detail: item.description || "Discover this item in our current catalog.",
      price: item.discountPrice ?? item.price,
      originalPrice: item.discountPrice != null ? item.price : undefined,
      rating: item.averageRating ?? 4.8,
      reviews: item.reviewCount ?? 0,
      badge: item.discountPrice != null ? "Sale" : undefined,
      imageUrl: item.imageUrl ?? "https://placehold.co/600x600/FBF9F6/14213D?text=Product",
      stockQuantity: item.stockQuantity,
      category:
        typeof item.category === "object" ? item.category.name : item.category,
    }));
  } catch (error) {
    unstable_rethrow(error);
    console.error("Unable to load products from the backend:", error);
  }

  return <HomePage products={products} />;
}
