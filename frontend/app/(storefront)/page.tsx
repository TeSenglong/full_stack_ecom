import HomePage from "@/components/home/HomePage";
import { getProducts } from "@/lib/api/products";
import type { ShowcaseProduct } from "@/types/product";
import { unstable_rethrow } from "next/navigation";

export default function Page() {
  const productsPromise: Promise<ShowcaseProduct[]> = getProducts()
    .then((data) =>
      data.map((item) => {
        const salePrice = item.discountPrice != null && item.discountPrice < item.price
          ? item.discountPrice
          : item.price;
        const hasDiscount = salePrice < item.price;

        return {
          id: String(item.id),
          name: item.name,
          detail:
            item.description || "Discover this item in our current catalog.",
          price: salePrice,
          originalPrice: hasDiscount ? item.price : undefined,
          rating: item.averageRating,
          reviews: item.reviewCount,
          badge: hasDiscount ? "Sale" : undefined,
          imageUrl:
            item.imageUrl ??
            "https://placehold.co/600x600/FBF9F6/14213D?text=Product",
          stockQuantity: item.stockQuantity,
          category:
            typeof item.category === "object"
              ? item.category.name
              : item.category,
        };
      }),
    )
    .catch((error) => {
      unstable_rethrow(error);
      console.error("Unable to load products from the backend:", error);
      return [];
    });

  return <HomePage productsPromise={productsPromise} />;
}
