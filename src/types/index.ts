export interface ProductVariant {
  color?: string;
  size?: string;
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  images: string[];
  tag: string;
  desc: string;
  stock: number;
  material?: string;
  occasion?: string[];
  variants?: ProductVariant[];
  whatsapp?: string;
  category: string;
  subcategory: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
}

export type PaymentMethod = 'card' | 'upi' | 'cod';
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customer: OrderForm;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  createdAt: string;
}
