export type Product = {
  _id: string;          
  name: string;
  description: string;
  price: number;
  inStock: number;
  image?: string;
  HSNC_code?: string;
  metadata?: {
    color?: string[];
    size?: string[];
    brand?: string[];
    colorvalues?: string[];
    sizevalues?: string[];
    brandvalues?: string[];
  };
  ISBillingAvailable: boolean;
};


export type LineItem = {
  productId: string
  name: string
  price: number
  qty: number
  hsnCode?: string
}

export type SellerInfo = {
  shopName: string
  gstNumber: string
  address: string
  phone: string
  logo?: string // Optional logo URL or base64
}

export type BuyerInfo = {
  name: string
  address: string
  phone: string
  gstNumber?: string // Optional GST number
}

export type Bill = {
  id: string
  name: string // Buyer name (changed from bill name)
  vehicleNumber?: string
  delivery?: string // Delivery details
  buyerInfo?: BuyerInfo // Buyer information
  items: LineItem[]
  gst: boolean
  cgstSgst: boolean // If true, split GST into CGST and SGST (9% each)
  isDebit: boolean
  debitAmount: number | null // null means full debit, number means partial debit
}

export type SavedBillStatus = "completed" | "due" | "draft"

export type SavedBill = {
  id: string // MongoDB _id for API calls
  billId?: string // Custom billId (BLI00001) for display
  name: string // Buyer name
  vehicleNumber?: string
  delivery?: string // Delivery details
  buyerInfo?: BuyerInfo // Buyer information
  items: (LineItem & { gstRate?: number })[]
  total: number
  dueAmount: number
  status: SavedBillStatus
  createdAt: string
}
