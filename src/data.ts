import { CatalogItem, Customer, Invoice, BusinessSettings } from './types';

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Carnatic Military Hotel",
  tagline: "Authentic Legacy of South Indian Grand Kitchens",
  address: "Near Sree Kanteerava Stadium, Kasturba Road, Bengaluru, Karnataka 560001",
  phone: "080-22241108",
  email: "billing@cmhkitchens.com",
  gstin: "29AADCC9012F1Z4",
  fssai: "11224999000342"
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Anjali Rao",
    phone: "9845012345",
    gstin: "29AABCA1234F1Z0",
    address: "Indiranagar, Bengaluru",
    createdAt: "2026-05-15T12:00:00Z"
  },
  {
    id: "cust-2",
    name: "Siddharth Nair",
    phone: "9123456789",
    gstin: "",
    address: "Koramangala, Bengaluru",
    createdAt: "2026-05-18T14:30:00Z"
  },
  {
    id: "cust-3",
    name: "Meenakshi Iyengar",
    phone: "9448098765",
    gstin: "29AAEIY8800B1ZS",
    address: "Malleswaram, Bengaluru",
    createdAt: "2026-05-19T09:15:00Z"
  },
  {
    id: "cust-4",
    name: "Karthik Subramanian",
    phone: "9880123456",
    gstin: "29AAKSub5560D1ZF",
    address: "Jayanagar, Bengaluru",
    createdAt: "2026-05-20T11:45:00Z"
  },
  {
    id: "cust-5",
    name: "Venkatesh Prasad",
    phone: "9844055221",
    gstin: "",
    address: "Basavanagudi, Bengaluru",
    createdAt: "2026-05-21T18:20:00Z"
  }
];

export const INITIAL_CATALOG: CatalogItem[] = [
  // Dosa (9 items)
  { id: "item-1", name: "Carnatic Plain Dosa", category: "Dosa", price: 80, gstRate: 5, available: true },
  { id: "item-2", name: "Legacy Ghee Masala Dosa", category: "Dosa", price: 110, gstRate: 5, available: true },
  { id: "item-3", name: "Mysore Spiced Masala Dosa", category: "Dosa", price: 120, gstRate: 5, available: true },
  { id: "item-4", name: "Kara Kara Podi Dosa", category: "Dosa", price: 115, gstRate: 5, available: true },
  { id: "item-5", name: "Open Butter Masala Dosa", category: "Dosa", price: 130, gstRate: 5, available: true },
  { id: "item-6", name: "Fluffy Set Dosa (Sagu-Chutney)", category: "Dosa", price: 90, gstRate: 5, available: true },
  { id: "item-7", name: "Royal Cheese Chilli Dosa", category: "Dosa", price: 140, gstRate: 5, available: true },
  { id: "item-8", name: "Golden Crisp Rava Dosa", category: "Dosa", price: 100, gstRate: 5, available: true },
  { id: "item-9", name: "Onion Rava Masala Dosa", category: "Dosa", price: 130, gstRate: 5, available: true },

  // Idli & Vada (6 items)
  { id: "item-10", name: "Steamed Button Idli (10 Pcs)", category: "Idli & Vada", price: 75, gstRate: 5, available: true },
  { id: "item-11", name: "Muddha Sambar Idli (2 Pcs)", category: "Idli & Vada", price: 70, gstRate: 5, available: true },
  { id: "item-12", name: "Crispy Medu Vada (2 Pcs)", category: "Idli & Vada", price: 75, gstRate: 5, available: true },
  { id: "item-13", name: "Heritage Rava Idli (With Ghee)", category: "Idli & Vada", price: 85, gstRate: 5, available: true },
  { id: "item-14", name: "Kanchipuram Spiced Idli", category: "Idli & Vada", price: 90, gstRate: 5, available: true },
  { id: "item-15", name: "Express Idli-Vada Combo (2+1)", category: "Idli & Vada", price: 95, gstRate: 5, available: true },

  // Uttapam (3 items)
  { id: "item-16", name: "Spicy Onion Tomato Uttapam", category: "Uttapam", price: 110, gstRate: 5, available: true },
  { id: "item-17", name: "Coconut Gunpowder Uttapam", category: "Uttapam", price: 120, gstRate: 5, available: true },
  { id: "item-18", name: "Traditional Mix Veg Uttapam", category: "Uttapam", price: 115, gstRate: 5, available: true },

  // Meals & Rice (5 items)
  { id: "item-19", name: "Bisi Bele Bath (Served with Boondi)", category: "Meals & Rice", price: 110, gstRate: 5, available: true },
  { id: "item-20", name: "Saffron Lemon Rice", category: "Meals & Rice", price: 95, gstRate: 5, available: true },
  { id: "item-21", name: "Traditional Curd Rice", category: "Meals & Rice", price: 85, gstRate: 5, available: true },
  { id: "item-22", name: "Chettinad Spicy Vegetable Biryani", category: "Meals & Rice", price: 175, gstRate: 12, available: true },
  { id: "item-23", name: "Carnatic  Special Grand Thali", category: "Meals & Rice", price: 240, gstRate: 18, available: true },

  // Desserts (2 items)
  { id: "item-24", name: "Saffron Pineapple Kesari Bath", category: "Desserts", price: 80, gstRate: 12, available: true },
  { id: "item-25", name: "Elaneer Payasam (Tender Coconut)", category: "Desserts", price: 110, gstRate: 12, available: true },

  // Beverages (3 items)
  { id: "item-26", name: "Metropolitan Filter Coffee", category: "Beverages", price: 40, gstRate: 5, available: true },
  { id: "item-27", name: "Ginger Cardamom Spiced Tea", category: "Beverages", price: 35, gstRate: 5, available: true }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: "CMH-2526-0001",
    customerId: "cust-1",
    customerName: "Anjali Rao",
    customerPhone: "9845012345",
    customerGstin: "29AABCA1234F1Z0",
    customerAddress: "Indiranagar, Bengaluru",
    items: [
      { itemId: "item-2", name: "Legacy Ghee Masala Dosa", price: 110, gstRate: 5, quantity: 2 },
      { itemId: "item-26", name: "Metropolitan Filter Coffee", price: 40, gstRate: 5, quantity: 2 }
    ],
    discountType: "flat",
    discountValue: 20,
    subtotal: 300,
    gstAmount: 15, // 5% of 300
    discountAmount: 20,
    grandTotal: 295, // 300 + 15 - 20
    paymentMode: "UPI",
    paymentStatus: "Paid",
    notes: "Regular customer, requested extra chutney",
    createdAt: "2026-05-18T13:15:00Z"
  },
  {
    id: "CMH-2526-0002",
    customerId: "cust-2",
    customerName: "Siddharth Nair",
    customerPhone: "9123456789",
    customerGstin: "",
    customerAddress: "Koramangala, Bengaluru",
    items: [
      { itemId: "item-5", name: "Open Butter Masala Dosa", price: 130, gstRate: 5, quantity: 3 },
      { itemId: "item-15", name: "Express Idli-Vada Combo (2+1)", price: 95, gstRate: 5, quantity: 1 },
      { itemId: "item-27", name: "Ginger Cardamom Spiced Tea", price: 35, gstRate: 5, quantity: 4 }
    ],
    discountType: "percentage",
    discountValue: 10,
    subtotal: 625, // 390 + 95 + 140
    gstAmount: 31.25,
    discountAmount: 62.50,
    grandTotal: 593.75, // 625 + 31.25 - 62.5
    paymentMode: "Cash",
    paymentStatus: "Paid",
    notes: "",
    createdAt: "2026-05-19T19:40:00Z"
  },
  {
    id: "CMH-2526-0003",
    customerId: "cust-3",
    customerName: "Meenakshi Iyengar",
    customerPhone: "9448098765",
    customerGstin: "29AAEIY8800B1ZS",
    customerAddress: "Malleswaram, Bengaluru",
    items: [
      { itemId: "item-23", name: "Carnatic  Special Grand Thali", price: 240, gstRate: 18, quantity: 4 },
      { itemId: "item-25", name: "Elaneer Payasam (Tender Coconut)", price: 110, gstRate: 12, quantity: 4 }
    ],
    discountType: "flat",
    discountValue: 100,
    subtotal: 1400, // 960 + 440
    gstAmount: 225.60, // 960*0.18 (172.80) + 440*0.12 (52.80)
    discountAmount: 100,
    grandTotal: 1525.60,
    paymentMode: "Card",
    paymentStatus: "Partial",
    notes: "Paid token amount of 500, rest due next week",
    createdAt: "2026-05-21T14:22:00Z"
  },
  {
    id: "CMH-2526-0004",
    customerId: "cust-4",
    customerName: "Karthik Subramanian",
    customerPhone: "9880123456",
    customerGstin: "29AAKSub5560D1ZF",
    customerAddress: "Jayanagar, Bengaluru",
    items: [
      { itemId: "item-22", name: "Chettinad Spicy Vegetable Biryani", price: 175, gstRate: 12, quantity: 6 },
      { itemId: "item-25", name: "Elaneer Payasam (Tender Coconut)", price: 110, gstRate: 12, quantity: 6 },
      { itemId: "item-26", name: "Metropolitan Filter Coffee", price: 40, gstRate: 5, quantity: 6 }
    ],
    discountType: "percentage",
    discountValue: 15,
    subtotal: 1950, // 1050 + 660 + 240
    gstAmount: 217.20, // 1710 * 0.12 (205.20) + 240 * 0.05 (12)
    discountAmount: 292.50,
    grandTotal: 1874.70,
    paymentMode: "Online",
    paymentStatus: "Paid",
    notes: "Kitty party order, packed feedback cards",
    createdAt: "2026-05-22T21:05:00Z"
  },
  {
    id: "CMH-2526-0005",
    customerId: null,
    customerName: "Walk-in Customer",
    customerPhone: "",
    customerGstin: "",
    customerAddress: "",
    items: [
      { itemId: "item-12", name: "Crispy Medu Vada (2 Pcs)", price: 75, gstRate: 5, quantity: 2 },
      { itemId: "item-26", name: "Metropolitan Filter Coffee", price: 40, gstRate: 5, quantity: 2 }
    ],
    discountType: "flat",
    discountValue: 0,
    subtotal: 230,
    gstAmount: 11.50,
    discountAmount: 0,
    grandTotal: 241.50,
    paymentMode: "UPI",
    paymentStatus: "Paid",
    notes: "",
    createdAt: "2026-05-23T11:59:00Z"
  },
  {
    id: "CMH-2526-0006",
    customerId: "cust-5",
    customerName: "Venkatesh Prasad",
    customerPhone: "9844055221",
    customerGstin: "",
    customerAddress: "Basavanagudi, Bengaluru",
    items: [
      { itemId: "item-3", name: "Mysore Spiced Masala Dosa", price: 120, gstRate: 5, quantity: 3 },
      { itemId: "item-13", name: "Heritage Rava Idli (With Ghee)", price: 85, gstRate: 5, quantity: 2 },
      { itemId: "item-16", name: "Spicy Onion Tomato Uttapam", price: 110, gstRate: 5, quantity: 1 }
    ],
    discountType: "flat",
    discountValue: 30,
    subtotal: 640, // 360 + 170 + 110
    gstAmount: 32.00,
    discountAmount: 30,
    grandTotal: 642.00,
    paymentMode: "UPI",
    paymentStatus: "Unpaid",
    notes: "Home delivery. To be paid on delivery tomorrow",
    createdAt: "2026-05-24T09:30:00Z"
  }
];
