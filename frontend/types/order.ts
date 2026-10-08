export interface CheckoutRequest {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  productImageUrl: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderPage {
  page: number;
  content: Order[];
  size: number;
  totalContents: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
