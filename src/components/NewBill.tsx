import { useState, useMemo } from 'react';
import { CatalogItem, Customer, Invoice, InvoiceItem, ActiveScreen } from '../types';
import { 
  User, 
  UserPlus, 
  UserCheck, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Tag, 
  CreditCard, 
  Save, 
  ChevronLeft, 
  AlertCircle 
} from 'lucide-react';

interface NewBillProps {
  catalog: CatalogItem[];
  customers: Customer[];
  onSaveInvoice: (newInvoice: Invoice, newCustomer?: Customer) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export default function NewBill({ catalog, customers, onSaveInvoice, onNavigate }: NewBillProps) {
  // Step 1: Customer Selection state
  const [customerMode, setCustomerMode] = useState<'walkin' | 'existing' | 'new'>('walkin');
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Fields
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Step 2: Add Items state
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [cart, setCart] = useState<{ item: CatalogItem; quantity: number }[]>([]);

  // Step 3: Payment details state
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Online'>('UPI');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>('Paid');
  const [notes, setNotes] = useState('');

  // Notifications or errors
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    catalog.forEach(item => cats.add(item.category));
    return ['All', ...Array.from(cats)];
  }, [catalog]);

  // Filtered available items
  const filteredItems = useMemo(() => {
    return catalog.filter(item => {
      if (!item.available) return false;
      
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(itemSearchQuery.toLowerCase());
      
      return matchCat && matchSearch;
    });
  }, [catalog, activeCategory, itemSearchQuery]);

  // Filtered customers list
  const filteredCustomers = useMemo(() => {
    if (!searchCustomerQuery.trim()) return [];
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchCustomerQuery.toLowerCase()) || 
      c.phone.includes(searchCustomerQuery)
    );
  }, [customers, searchCustomerQuery]);

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, entry) => sum + (entry.item.price * entry.quantity), 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    }
    return discountValue;
  }, [subtotal, discountType, discountValue]);

  const calculations = useMemo(() => {
    if (subtotal === 0) return { gst: 0, grandTotal: 0 };

    // Calculate proportional discount per item to perform precise itemized GST mapping
    let totalGst = 0;
    
    cart.forEach(entry => {
      const lineSubtotal = entry.item.price * entry.quantity;
      const lineProportionalDiscount = (lineSubtotal / subtotal) * discountAmount;
      const taxableLineAmount = Math.max(0, lineSubtotal - lineProportionalDiscount);
      const lineGst = taxableLineAmount * (entry.item.gstRate / 100);
      totalGst += lineGst;
    });

    const calculatedGrand = Math.max(0, (subtotal - discountAmount) + totalGst);

    return {
      gst: totalGst,
      grandTotal: calculatedGrand
    };
  }, [cart, subtotal, discountAmount]);

  // Cart operations
  const addToCart = (item: CatalogItem) => {
    setCart(prev => {
      const existing = prev.find(entry => entry.item.id === item.id);
      if (existing) {
        return prev.map(entry => entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, increment: boolean) => {
    setCart(prev => {
      return prev.map(entry => {
        if (entry.item.id === itemId) {
          const newQty = increment ? entry.quantity + 1 : entry.quantity - 1;
          return { ...entry, quantity: Math.max(1, newQty) };
        }
        return entry;
      }).filter(entry => entry.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(entry => entry.item.id !== itemId));
  };

  const handleCreateBill = () => {
    if (cart.length === 0) {
      setErrorMsg("Cannot generate bill with an empty cart. Please add at least one dish.");
      return;
    }

    let billCustomerName = "Walk-in Customer";
    let billCustomerPhone = "";
    let billCustomerGstin = "";
    let billCustomerAddress = "";
    let newCustObject: Customer | undefined = undefined;

    if (customerMode === 'existing') {
      if (!selectedCustomer) {
        setErrorMsg("Please select an existing customer from the search list.");
        return;
      }
      billCustomerName = selectedCustomer.name;
      billCustomerPhone = selectedCustomer.phone;
      billCustomerGstin = selectedCustomer.gstin;
      billCustomerAddress = selectedCustomer.address;
    } else if (customerMode === 'new') {
      if (!newCustName.trim()) {
        setErrorMsg("Please provide a name for the new customer.");
        return;
      }
      if (!newCustPhone.trim()) {
        setErrorMsg("Please provide a phone number for the new customer.");
        return;
      }
      // Create new customer registry object
      newCustObject = {
        id: `cust-${Date.now()}`,
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        gstin: newCustGstin.trim().toUpperCase(),
        address: newCustAddress.trim(),
        createdAt: new Date().toISOString()
      };
      billCustomerName = newCustObject.name;
      billCustomerPhone = newCustObject.phone;
      billCustomerGstin = newCustObject.gstin;
      billCustomerAddress = newCustObject.address;
    }

    // Prepare Invoice items
    const invoiceItems: InvoiceItem[] = cart.map(entry => ({
      itemId: entry.item.id,
      name: entry.item.name,
      price: entry.item.price,
      gstRate: entry.item.gstRate,
      quantity: entry.quantity
    }));

    // Unique sequential mock ID
    const randomSuffix = String(Math.floor(Math.random() * 9000) + 1000); 
    const invoiceId = `CMH-2526-${randomSuffix}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      customerId: customerMode === 'existing' ? selectedCustomer?.id || null : (customerMode === 'new' ? newCustObject?.id || null : null),
      customerName: billCustomerName,
      customerPhone: billCustomerPhone,
      customerGstin: billCustomerGstin,
      customerAddress: billCustomerAddress,
      items: invoiceItems,
      discountType,
      discountValue,
      subtotal,
      gstAmount: calculations.gst,
      discountAmount,
      grandTotal: calculations.grandTotal,
      paymentMode,
      paymentStatus,
      notes,
      createdAt: new Date().toISOString()
    };

    // Save and redirect
    onSaveInvoice(newInvoice, newCustObject);
    onNavigate('invoices');
  };

  const valueFormat = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="new_bill_screen">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-cream-200 pb-4">
        <div className="flex items-center gap-3">
          <button 
            id="back_to_dashboard"
            onClick={() => onNavigate('dashboard')}
            className="p-1.5 rounded-lg border border-cream-200 text-gray-500 hover:bg-cream-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-heading text-3xl text-saffron-700 font-bold tracking-tight">
              Create GST Bill
            </h1>
            <p className="text-gray-500 text-sm">Issue and print invoices in under 60 seconds</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 flex items-center gap-2" id="billing_error_alert">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{errorMsg}</p>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-500 hover:text-red-700 px-2 font-bold cursor-pointer">×</button>
        </div>
      )}

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: STEP 1 Customer & STEP 2 Add Items (3 spans) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* STEP 1: CUSTOMER SELECTION */}
          <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 tracking-wide uppercase font-sans">
              Step 1: Pick / Registered customer
            </h3>
            
            {/* Mode Selector pills */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-cream-50 rounded-lg mb-4">
              <button 
                id="mode_walkin"
                type="button"
                onClick={() => {
                  setCustomerMode('walkin');
                  setSelectedCustomer(null);
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  customerMode === 'walkin' 
                    ? 'bg-white text-saffron-700 shadow-xs border border-saffron-100' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Walk-in
              </button>
              <button 
                id="mode_existing"
                type="button"
                onClick={() => {
                  setCustomerMode('existing');
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  customerMode === 'existing' 
                    ? 'bg-white text-saffron-700 shadow-xs border border-saffron-100' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Existing
              </button>
              <button 
                id="mode_new"
                type="button"
                onClick={() => {
                  setCustomerMode('new');
                  setSelectedCustomer(null);
                  setErrorMsg(null);
                }}
                className={`py-2 px-3 rounded-md text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  customerMode === 'new' 
                    ? 'bg-white text-saffron-700 shadow-xs border border-saffron-100' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add New
              </button>
            </div>

            {/* Walk-in View */}
            {customerMode === 'walkin' && (
              <div className="bg-cream-50/50 border border-dashed border-cream-200 rounded-lg p-3 text-center text-xs text-gray-500">
                Billing as <strong>Unregistered Walk-in Customer</strong>. No billing details logged.
              </div>
            )}

            {/* Search Existing Customer View */}
            {customerMode === 'existing' && (
              <div className="space-y-3" id="existing_customer_zone">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    id="search_customer_input"
                    type="text"
                    value={searchCustomerQuery}
                    onChange={(e) => setSearchCustomerQuery(e.target.value)}
                    placeholder="Search by customer name or phone..."
                    className="w-full pl-9 pr-4 py-2 border border-cream-200 rounded-lg text-sm bg-cream-50/20 focus:outline-hidden focus:ring-2 focus:ring-saffron-500/30"
                  />
                </div>

                {/* Dropdown list of results */}
                {searchCustomerQuery && filteredCustomers.length > 0 && (
                  <div className="border border-cream-200 bg-white rounded-lg max-h-40 overflow-y-auto divide-y divide-cream-100 shadow-sm">
                    {filteredCustomers.map(cust => (
                      <button
                        key={cust.id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setSearchCustomerQuery('');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-cream-50 flex justify-between items-center text-xs text-gray-700 font-medium cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-gray-900">{cust.name}</div>
                          <div className="text-gray-400 font-mono">{cust.phone}</div>
                        </div>
                        {cust.gstin && (
                          <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded-sm font-mono uppercase">
                            GST: {cust.gstin}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searchCustomerQuery && filteredCustomers.length === 0 && (
                  <p className="text-xs text-amber-600 font-medium">No customers found matching that query.</p>
                )}

                {selectedCustomer ? (
                  <div className="bg-saffron-50/70 border border-saffron-100 p-3.5 rounded-lg flex justify-between items-center">
                    <div className="text-xs">
                      <p className="font-bold text-saffron-800">Selected Customer:</p>
                      <p className="font-bold text-gray-900 mt-1">{selectedCustomer.name}</p>
                      <p className="text-gray-500 font-mono mt-0.5">{selectedCustomer.phone}</p>
                      {selectedCustomer.gstin && (
                        <p className="text-teal-700 font-mono mt-0.5">GSTIN: {selectedCustomer.gstin}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Please search and select a customer database match</p>
                )}
              </div>
            )}

            {/* Add New Customer View */}
            {customerMode === 'new' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="new_customer_fields_zone">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name *</label>
                  <input 
                    id="new_cust_name"
                    type="text"
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-cream-50/20 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number *</label>
                  <input 
                    id="new_cust_phone"
                    type="tel"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="10-digit number"
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-cream-50/20 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">GSTIN (Optional)</label>
                  <input 
                    id="new_cust_gstin"
                    type="text"
                    value={newCustGstin}
                    onChange={(e) => setNewCustGstin(e.target.value)}
                    placeholder="29AADCC9012F1Z4"
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-cream-50/20 focus:outline-hidden font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Address (Optional)</label>
                  <input 
                    id="new_cust_address"
                    type="text"
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    placeholder="Bangalore suburb"
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-cream-50/20 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: ADD ITEMS (MENU SELECTOR) */}
          <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase font-sans tracking-wide">
                Step 2: Add legacy items
              </h3>
              
              {/* Search Menu */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                <input 
                  id="search_menu_input"
                  type="text"
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  placeholder="Search coffee, dosa..."
                  className="w-full sm:w-48 pl-8 pr-3 py-1.5 border border-cream-200 rounded-lg text-[11px] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category tabs scroll */}
            <div className="flex gap-1 overflow-x-auto pb-3 scrollbar-none border-b border-cream-100">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                    activeCategory === cat 
                      ? 'bg-saffron-500 border-saffron-500 text-white shadow-xs' 
                      : 'border-cream-200 hover:border-cream-300 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 mt-4 max-h-[360px] overflow-y-auto p-1">
              {filteredItems.map(item => {
                // Check if in cart to show badge
                const cartQty = cart.find(entry => entry.item.id === item.id)?.quantity || 0;

                return (
                  <div 
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="relative bg-cream-50/30 border border-cream-200 hover:border-saffron-300 hover:bg-cream-100/30 p-3 rounded-lg flex flex-col justify-between transition-all duration-200 cursor-pointer text-left group"
                  >
                    {cartQty > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-saffron-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                        {cartQty}
                      </span>
                    )}
                    <div>
                      <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-sm uppercase font-sans">
                        {item.category}
                      </span>
                      <h4 className="font-semibold text-xs text-gray-900 mt-1 min-h-[32px] line-clamp-2">
                        {item.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-cream-100">
                      <span className="font-mono text-xs font-bold text-gray-800">
                        ₹{item.price}
                      </span>
                      <span className="text-[9px] text-gray-400 font-mono">
                        GST: {item.gstRate}%
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-gray-400">
                  No match found in current catalog category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Cart, STEP 3 calculations, payment info & CTA (2 spans) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Running Order Cart list */}
          <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs flex flex-col h-[580px] justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-cream-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-saffron-600" />
                  <h3 className="font-heading text-base font-bold text-gray-900">
                    Running Order Panel
                  </h3>
                </div>
                <span className="bg-cream-100 text-gray-700 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {cart.length} unique
                </span>
              </div>

              {/* Cart item rows */}
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-10 text-xs text-gray-400 font-sans">
                    Cart is empty. Tap items on the left to queue dishes.
                  </div>
                ) : (
                  cart.map(entry => (
                    <div key={entry.item.id} className="flex items-center justify-between bg-cream-50/20 p-2 border border-cream-100 rounded-lg text-xs gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-800 truncate" title={entry.item.name}>
                          {entry.item.name}
                        </div>
                        <div className="text-gray-400 font-mono text-[10px] mt-0.5">
                          ₹{entry.item.price} each • GST {entry.item.gstRate}%
                        </div>
                      </div>

                      {/* Quantity tools */}
                      <div className="flex items-center bg-white border border-cream-200 rounded-md shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.item.id, false)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-cream-100 font-bold font-mono text-sm cursor-pointer"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold font-mono text-center min-w-[20px] text-[11px]">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(entry.item.id, true)}
                          className="px-2 py-0.5 text-gray-500 hover:bg-cream-100 font-bold font-mono text-sm cursor-pointer"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(entry.item.id)}
                        className="p-1 px-1.5 text-rose-500 hover:bg-rose-50 rounded-md shrink-0 cursor-pointer"
                        title="Delete line"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Discounts */}
            <div className="border-t border-cream-100 pt-4 mt-4 space-y-4">
              
              {/* Discount inputs */}
              <div className="bg-cream-50/50 p-2.5 rounded-lg border border-cream-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gold-500" />
                    Apply Discount:
                  </span>
                  <div className="flex border border-cream-200 rounded-md overflow-hidden text-[10px] bg-white">
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('flat');
                        setDiscountValue(0);
                      }}
                      className={`px-2.5 py-0.5 font-bold border-r border-cream-100 cursor-pointer ${discountType === 'flat' ? 'bg-saffron-500 text-white' : 'text-gray-500'}`}
                    >
                      Flat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountType('percentage');
                        setDiscountValue(0);
                      }}
                      className={`px-2.5 py-0.5 font-bold cursor-pointer ${discountType === 'percentage' ? 'bg-saffron-500 text-white' : 'text-gray-500'}`}
                    >
                      %
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    id="discount_val_input"
                    type="number"
                    min="0"
                    placeholder="Discount amount"
                    value={discountValue === 0 ? '' : discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full p-1.5 border border-cream-200 rounded-md bg-white text-xs text-right font-mono"
                  />
                  <span className="text-xs font-bold text-gray-500">
                    {discountType === 'flat' ? 'INR' : '%'}
                  </span>
                </div>
              </div>

              {/* Payment Mode status */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Payment Mode</label>
                  <select
                    id="payment_mode_select"
                    value={paymentMode}
                    onChange={(e: any) => setPaymentMode(e.target.value)}
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-white text-gray-800"
                  >
                    <option value="UPI">UPI (GPay/PhonePe)</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Card">Visa/Mastercard POS</option>
                    <option value="Online">Online Aggregations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Status Badge</label>
                  <select
                    id="payment_status_select"
                    value={paymentStatus}
                    onChange={(e: any) => setPaymentStatus(e.target.value)}
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-white text-gray-800"
                  >
                    <option value="Paid">Fully Paid</option>
                    <option value="Unpaid">Unpaid / Credit</option>
                    <option value="Partial">Partial Ledger</option>
                  </select>
                </div>
              </div>

              {/* Billing Note Field */}
              <div>
                <input 
                  id="billing_notes_input"
                  type="text"
                  placeholder="Notes (e.g., Table 4, fast kitchen delivery, sugarfree Filter Coffee)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-cream-200 rounded-lg text-[11px] placeholder:text-gray-400"
                />
              </div>

              {/* Pricing breakdown summary */}
              <div className="border-t border-cream-100 pt-3 space-y-1.5 font-sans">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cart Items Subtotal:</span>
                  <span className="font-mono text-gray-700">{valueFormat(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-600 font-medium">
                    <span>Discount Applied:</span>
                    <span className="font-mono">- {valueFormat(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Cumulative CGST + SGST:</span>
                  <span className="font-mono text-gray-700">{valueFormat(calculations.gst)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-cream-100 pt-2">
                  <span>Grand Total (Net):</span>
                  <span className="font-mono text-saffron-700">{valueFormat(calculations.grandTotal)}</span>
                </div>
              </div>

              {/* Invoice Generation CTA Button */}
              <button
                id="generate_invoice_button"
                type="button"
                onClick={handleCreateBill}
                className="w-full bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-white py-3 px-4 rounded-xl font-bold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                disabled={cart.length === 0}
              >
                <Save className="w-4 h-4" />
                Save & Generate Invoice
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
