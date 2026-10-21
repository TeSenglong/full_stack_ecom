import "server-only";

export {
  getProductById,
  getProductCatalog,
  getProductPage,
  getProducts,
} from "@/lib/api/product-api/queries";
export type { ProductPageFilters } from "@/lib/api/product-api/queries";
export {
  createProduct,
  createProductWithImage,
  deleteProduct,
  updateProduct,
} from "@/lib/api/product-api/mutations";
