import { notFound, unstable_rethrow } from "next/navigation";
import ProductDetails from "@/components/products/ProductDetails";
import { getProductById } from "@/lib/api/products";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product;

  try {
    product = await getProductById(id);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof Error && error.message.includes("(404)")) {
      notFound();
    }
    throw error;
  }

  return <ProductDetails product={product} />;
}
