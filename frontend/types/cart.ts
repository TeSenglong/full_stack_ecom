export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  stockQuantity: number;
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export const EMPTY_CART: CartSummary = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};
