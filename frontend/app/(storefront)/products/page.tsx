import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsCatalogData, { type ProductsSearchParams } from "@/components/products/ProductsCatalogData";
import ProductsCatalogLoading from "@/components/products/ProductsCatalogLoading";
import ProductsPageLayout from "@/components/products/ProductsPageLayout";

export const metadata: Metadata = {
  title: "The Collection | MOHAORI",
  description: "Explore the complete MOHAORI collection of considered objects for modern living.",
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductsSearchParams>;
}) {
  return (
    <ProductsPageLayout>
      <Suspense fallback={<ProductsCatalogLoading />}>
        <ProductsCatalogData searchParams={searchParams} />
      </Suspense>
    </ProductsPageLayout>
  );
}
