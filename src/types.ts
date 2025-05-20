
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  features?: string[];
  inStock: boolean;
  trending?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface MockData {
  products: Product[];
}
