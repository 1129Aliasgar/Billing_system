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
    colorvalues?: string[];
    sizevalues?: string[];
    brandvalues?: string[];
  };
};
