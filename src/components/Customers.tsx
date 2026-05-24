import React, { useState, useMemo } from 'react';
import { Customer, Invoice, ActiveScreen } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  MapPin, 
  Phone, 
  Tag, 
  Calendar, 
  TrendingUp, 
  X, 
  DollarSign, 
  ListOrdered,
  AlertCircle
} from 'lucide-react';

interface CustomersProps {
  customers: Customer[];
  invoices: Invoice[];
  onAddCustomer: (newCust: Customer) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export default function Customers({ customers, invoices, onAddCustomer, onNavigate }: CustomersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustDetail, setSelectedCustDetail] = useState<Customer | null>(null);

  // Form registration states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGstin, setFormGstin] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      totalCount: customers.length,
      returningCount: customers.filter(c => {
        const matchingInvoices = invoices.filter(inv => inv.customerId === c.id);
        return matchingInvoices.length > 1;
      }).length
    };
  }, [customers, invoices]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [customers, searchQuery]);

  // Compute stats for each customer (orders count, total spent, unpaid count)
  const customerAnalytics = useMemo(() => {
    const analytics: { 
      [id: string]: { ordersCount: number; totalSpent: number; unpaidCount: number; latestDate: string } 
    } = {};

    customers.forEach(c => {
      const matchInvoices = invoices.filter(inv => inv.customerId === c.id);
      const ordersCount = matchInvoices.length;
      const totalSpent = matchInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
      const unpaidCount = matchInvoices.filter(inv => inv.paymentStatus === 'Unpaid').length;
      const latestDate = matchInvoices.length > 0 
        ? matchInvoices.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : '';
      
      analytics[c.id] = { ordersCount, totalSpent, unpaidCount, latestDate };
    });

    return analytics;
  }, [customers, invoices]);

  // Invoice history for the selected customer detail modal
  const selectedCustomerInvoices = useMemo(() => {
    if (!selectedCustDetail) return [];
    return invoices
      .filter(inv => inv.customerId === selectedCustDetail.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedCustDetail, invoices]);

  // Total calculated metrics for detailed customer summary
  const selectedCustomerAggregate = useMemo(() => {
    if (!selectedCustDetail) return null;
    const items = invoices.filter(inv => inv.customerId === selectedCustDetail.id);
    const totalSpent = items.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const unpaidSum = items.filter(inv => inv.paymentStatus === 'Unpaid').reduce((sum, inv) => sum + inv.grandTotal, 0);
    const partialSum = items.filter(inv => inv.paymentStatus === 'Partial').reduce((sum, inv) => sum + inv.grandTotal, 0);
    
    return {
      totalSpent,
      ordersCount: items.length,
      debtSum: unpaidSum + (partialSum * 0.4) // Proportional approximation
    };
  }, [selectedCustDetail, invoices]);

  // Save new customer
  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg("Customer name is required.");
      return;
    }
    if (!formPhone.trim()) {
      setErrorMsg("Phone number is required.");
      return;
    }
    // Simple check for duplicates
    if (customers.some(c => c.phone.trim() === formPhone.trim())) {
      setErrorMsg("A customer with this phone number is already registered.");
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: formName.trim(),
      phone: formPhone.trim(),
      gstin: formGstin.trim().toUpperCase(),
      address: formAddress.trim(),
      createdAt: new Date().toISOString()
    };

    onAddCustomer(newCust);
    setIsFormOpen(false);

    // Reset inputs
    setFormName('');
    setFormPhone('');
    setFormGstin('');
    setFormAddress('');
  };

  const valueFormat = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="customers_screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-cream-200 pb-4">
        <div>
          <h1 className="font-heading text-3xl text-saffron-700 font-bold tracking-tight">
            Customer Directory
          </h1>
          <p className="text-gray-500 text-sm">Review profile ledger histories, billing frequency, and GST credentials</p>
        </div>
        
        <button
          id="trigger_register_customer"
          onClick={() => {
            setErrorMsg(null);
            setIsFormOpen(true);
          }}
          className="mt-4 md:mt-0 flex items-center gap-1.5 bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Customer summary analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="customers_stats">
        <div className="bg-white border border-cream-200 rounded-lg p-5 flex items-center gap-4">
          <div className="p-3 bg-saffron-50 text-saffron-600 rounded-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Registers</p>
            <p className="text-2xl font-bold text-gray-900 font-mono mt-0.5">{stats.totalCount}</p>
          </div>
        </div>

        <div className="bg-white border border-cream-200 rounded-lg p-5 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Loyal Customers (2+ bills)</p>
            <p className="text-2xl font-bold text-teal-700 font-mono mt-0.5">{stats.returningCount}</p>
          </div>
        </div>

        <div className="bg-white border border-cream-200 rounded-lg p-5 flex items-center gap-4">
          <div className="p-3 bg-gold-50 text-gold-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Operating Status</p>
            <p className="text-base font-bold text-gray-900 mt-1 uppercase tracking-wide">Cache Secured</p>
          </div>
        </div>
      </div>

      {/* Search Bar filter */}
      <div className="bg-white border border-cream-200 rounded-xl p-4 shadow-xs" id="customers_search_zone">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            id="customer_directory_search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within customer database by name, phone numbers, or cities..."
            className="w-full pl-9 pr-4 py-2 border border-cream-200 rounded-lg text-sm bg-cream-50/20 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Grid listing customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="customers_cards_grid">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white border border-cream-200 p-12 text-center rounded-xl text-gray-400 text-sm">
            No registered customers found. Create a customer or generate a billing form to save one automatically.
          </div>
        ) : (
          filteredCustomers.map(cust => {
            const analytical = customerAnalytics[cust.id] || { ordersCount: 0, totalSpent: 0, unpaidCount: 0, latestDate: '' };
            return (
              <div 
                key={cust.id}
                className="bg-white border border-cream-200 hover:border-saffron-300 rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-cream-100 pb-3 mb-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-gray-950 truncate max-w-[180px]">{cust.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-mono">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {cust.phone}
                      </div>
                    </div>
                    {cust.gstin && (
                      <span className="text-[9px] bg-teal-50 border border-teal-100 text-teal-700 font-mono px-2 py-0.5 rounded-sm uppercase font-bold shrink-0">
                        GST: {cust.gstin.slice(0, 5)}...
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs font-sans text-gray-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {cust.address || <span className="italic text-gray-300">No registered address</span>}
                    </p>
                    <p className="flex items-center gap-1.5 text-gray-500 font-mono text-[10px]">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Joined: {new Date(cust.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="border-t border-cream-100 pt-3.5 mt-4 flex items-center justify-between">
                  <div className="text-left font-sans text-xs">
                    <span className="text-gray-400 block text-[9px] font-bold uppercase">Frequencies</span>
                    <strong className="text-gray-900 font-mono">{analytical.ordersCount} tickets</strong>
                  </div>
                  
                  <div className="text-right font-sans text-xs">
                    <span className="text-gray-400 block text-[9px] font-bold uppercase">Total spent</span>
                    <strong className="text-saffron-600 font-mono">{valueFormat(analytical.totalSpent)}</strong>
                  </div>

                  <button
                    id={`open_cust_btn_${cust.id}`}
                    onClick={() => setSelectedCustDetail(cust)}
                    className="p-1.5 bg-cream-50 hover:bg-cream-150 text-gray-600 hover:text-gray-900 rounded-lg transition-colors cursor-pointer"
                    title="View Analytics Profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL VIEW LEDGER MODAL */}
      {selectedCustDetail && selectedCustomerAggregate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8" id="customer_detail_modal">
          <div className="bg-white rounded-xl max-w-4xl w-full border border-cream-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-cream-50/80 px-6 py-4 border-b border-cream-100 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-saffron-600" />
                  Profile Customer Ledger & Records
                </h3>
              </div>
              <button 
                onClick={() => setSelectedCustDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-cream-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split layout in Modal */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Business Bio cards (1 span) */}
              <div className="space-y-4">
                <div className="bg-cream-50/30 border border-cream-100 rounded-lg p-4 space-y-4">
                  <div>
                    <h4 className="font-heading text-xl font-bold text-gray-950">{selectedCustDetail.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">DB Registry ID: {selectedCustDetail.id}</p>
                  </div>

                  <div className="space-y-2 text-xs text-gray-700">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Tel Call</span>
                      <strong className="font-mono text-gray-900 block mt-0.5">{selectedCustDetail.phone}</strong>
                    </div>

                    {selectedCustDetail.gstin && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">GSTIN Register</span>
                        <strong className="font-mono text-teal-700 block mt-0.5 uppercase">{selectedCustDetail.gstin}</strong>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Base Locale</span>
                      <p className="mt-0.5 leading-relaxed">{selectedCustDetail.address || "Unspecified residence"}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Fractions Tracked since</span>
                      <p className="mt-0.5 font-mono text-[11px] text-gray-500">
                        {new Date(selectedCustDetail.createdAt).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analytical Stats in list */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-cream-200 bg-white p-3 rounded-lg text-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Total Spent</span>
                    <strong className="text-base text-gray-900 font-mono mt-0.5 block">{valueFormat(selectedCustomerAggregate.totalSpent)}</strong>
                  </div>
                  <div className="border border-cream-200 bg-white p-3 rounded-lg text-center">
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Frequency</span>
                    <strong className="text-base text-gray-900 font-mono mt-0.5 block">{selectedCustomerAggregate.ordersCount} times</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Invoices frequency history index (2 spans) */}
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-heading text-base font-bold text-gray-900 flex items-center gap-1.5 border-b border-cream-100 pb-2">
                  <ListOrdered className="w-4 h-4 text-teal-500" />
                  Historical Cash Memos issued
                </h4>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {selectedCustomerInvoices.length === 0 ? (
                    <p className="text-center py-12 text-xs text-gray-400 italic">No historical cash memos generated for this profile.</p>
                  ) : (
                    selectedCustomerInvoices.map(inv => {
                      const statusColors = {
                        Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        Unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
                        Partial: 'bg-amber-50 text-amber-700 border-amber-200'
                      };

                      return (
                        <div 
                          key={inv.id}
                          className="border border-cream-200 rounded-lg p-3.5 hover:bg-cream-50/10 flex justify-between items-center text-xs gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-saffron-700 text-sm">{inv.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColors[inv.paymentStatus]}`}>
                                {inv.paymentStatus}
                              </span>
                            </div>
                            <p className="text-gray-400 font-mono text-[10px]">
                              {new Date(inv.createdAt).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                            <p className="text-gray-500 text-[10px] truncate max-w-[240px]">
                              {inv.items.map(it => `${it.name} x${it.quantity}`).join(', ')}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-gray-400 block text-[9px] font-bold uppercase">Grand Net</span>
                            <strong className="text-gray-900 font-mono text-sm">{valueFormat(inv.grandTotal)}</strong>
                            <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{inv.paymentMode}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* REGISTER FORM DRAWER MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" id="register_customer_modal">
          <div className="bg-white rounded-xl max-w-md w-full border border-cream-200 shadow-xl overflow-hidden animate-fade-in-up">
            <div className="bg-cream-50/80 px-5 py-4 border-b border-cream-100 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-gray-900">
                Register Customer Profile
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="p-5 space-y-4 text-xs font-semibold">
              
              {errorMsg && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Name *</label>
                <input 
                  id="form_cust_name"
                  type="text"
                  required
                  placeholder="e.g., Sundararajan Swamy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone Number *</label>
                <input 
                  id="form_cust_phone"
                  type="tel"
                  required
                  placeholder="10-digit mobile"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GSTIN Identification (Optional)</label>
                <input 
                  id="form_cust_gstin"
                  type="text"
                  placeholder="e.g., 29AABBB8888C1Z4"
                  value={formGstin}
                  onChange={(e) => setFormGstin(e.target.value)}
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Residential Address (Optional)</label>
                <input 
                  id="form_cust_address"
                  type="text"
                  placeholder="e.g., Malleswaram, 8th across road"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs"
                />
              </div>

              <div className="border-t border-cream-100 pt-4 flex gap-3 justify-end text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  id="submit_register_cust_btn"
                  type="submit"
                  className="bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  Register Profile
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
