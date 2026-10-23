import "server-only";

export {
  getAllProducts,
  getProductById,
  getProductCatalog,
  getProducts,
} from "@/lib/api/product-api/queries";
export type { ProductPageFilters } from "@/lib/api/product-api/queries";
export {
  createProduct,
  createProductWithImage,
  deleteProduct,
  updateProduct,
} from "@/lib/api/product-api/mutations";
