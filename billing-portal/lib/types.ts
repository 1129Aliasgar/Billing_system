export type Product = {
  _id: string;          
  name: string;
  description: string;
  price: number;
  inStock: number;
  image?: string;
  metadata?: {
    color?: string[];
    size?: string[];
    brand?: string[];
  };
  ISBillingAvailable: boolean;
};


export type LineItem = {
  productId: string
  name: string
  price: number
  qty: number
}

export type Bill = {
  id: string
  name: string
  items: LineItem[]
  gst: boolean
}
