export interface BusinessSettings {
  businessName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  fssai: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  gstRate: number; // 0, 5, 12, 18
  available: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  gstin: string;
  address: string;
  createdAt: string;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  price: number;
  gstRate: number;
  quantity: number;
}

export interface Invoice {
  id: string; // CMH-2526-0001
  customerId: string | null; // null for Walk-in Customer
  customerName: string;
  customerPhone: string;
  customerGstin: string;
  customerAddress: string;
  items: InvoiceItem[];
  discountType: 'flat' | 'percentage';
  discountValue: number;
  subtotal: number;
  gstAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Online';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  notes: string;
  createdAt: string; // ISO timestamp
}

export type ActiveScreen = 'dashboard' | 'new-bill' | 'invoices' | 'catalog' | 'customers' | 'settings';
