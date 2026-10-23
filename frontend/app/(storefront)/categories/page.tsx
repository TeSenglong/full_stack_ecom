import type { Metadata } from "next";
import { Suspense } from "react";
import CategoriesCatalogData from "@/components/categories/CategoriesCatalogData";
import CategoriesCatalogLoading from "@/components/categories/CategoriesCatalogLoading";
import CategoriesPageLayout from "@/components/categories/CategoriesPageLayout";

export const metadata: Metadata = {
  title: "Categories | MOHAORI",
  description: "Browse every MOHAORI product category and find the collection that fits your everyday.",
};

export default function CategoriesPage() {
  return (
    <CategoriesPageLayout>
      <Suspense fallback={<CategoriesCatalogLoading />}>
        <CategoriesCatalogData />
      </Suspense>
    </CategoriesPageLayout>
  );
}
