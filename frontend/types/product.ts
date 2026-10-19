export interface Category {
  id: number;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface NewCategory {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  imageUrl?: string;
  brand?: string;
  releaseDate?: string | null;
  active?: boolean;
  averageRating?: number;
  reviewCount?: number;
  category?: Category | string;
}

export interface ShowcaseProduct {
  id: string | number;
  name: string;
  detail?: string;
  price: number;
  originalPrice?: number;
  rating?: number | null;
  reviews?: number;
  imageUrl: string;
  category?: string;
  stockQuantity?: number;
  badge?: { label: string; bg?: string; fg?: string } | string;
}

export interface ProductPage {
  page: number;
  content: Product[];
  size: number;
  totalContents: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ProductCatalog {
  products: ProductPage;
  categories: string[];
}

export interface NewProduct {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number | null;
  stockQuantity: number;
  imageUrl?: string;
  brand?: string;
  releaseDate?: string;
  categoryId: number;
}
