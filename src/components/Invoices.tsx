import { useState, useMemo } from 'react';
import { Invoice, BusinessSettings, ActiveScreen } from '../types';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  Trash2, 
  X, 
  CreditCard, 
  User, 
  Calendar, 
  FileSpreadsheet 
} from 'lucide-react';

interface InvoicesProps {
  invoices: Invoice[];
  businessSettings: BusinessSettings;
  onUpdateStatus: (invoiceId: string, newStatus: 'Paid' | 'Unpaid' | 'Partial') => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export default function Invoices({ 
  invoices, 
  businessSettings, 
  onUpdateStatus, 
  onDeleteInvoice, 
  onNavigate 
}: InvoicesProps) {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('All');

  // Selected Invoice for detail view/Receipt printing modal
  const [activeReceipt, setActiveReceipt] = useState<Invoice | null>(null);

  // Deletion confirmation trigger state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.customerPhone.includes(searchQuery);
      
      const matchStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
      const matchMode = paymentModeFilter === 'All' || inv.paymentMode === paymentModeFilter;
      
      return matchSearch && matchStatus && matchMode;
    });
  }, [invoices, searchQuery, statusFilter, paymentModeFilter]);

  // Handle printer action
  const handlePrint = () => {
    window.print();
  };

  const valueFormat = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  // GST rates tax summaries mapping relative to the active invoice
  const activeTaxBreakdown = useMemo(() => {
    if (!activeReceipt) return [];
    
    // Sum by rate (0%, 5%, 12%, 18%)
    const rates = [0, 5, 12, 18];
    const subtotal = activeReceipt.subtotal;
    const discountAmount = activeReceipt.discountAmount;

    return rates.map(rate => {
      // Find items at this rate
      const matchingItems = activeReceipt.items.filter(item => item.gstRate === rate);
      if (matchingItems.length === 0) return null;

      const itemTotal = matchingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const proportionalDiscount = subtotal > 0 ? (itemTotal / subtotal) * discountAmount : 0;
      const taxableAmount = Math.max(0, itemTotal - proportionalDiscount);
      const taxAmount = taxableAmount * (rate / 100);

      if (taxAmount === 0 && rate !== 0) return null;

      return {
        rate,
        taxableAmount,
        cgst: taxAmount / 2,
        sgst: taxAmount / 2,
        totalTax: taxAmount
      };
    }).filter(row => row !== null);
  }, [activeReceipt]);

  return (
    <div className="space-y-6 pb-20 animate-fade-in print_wrapper" id="invoices_screen">
      
      {/* Search and Filters grid */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-cream-200 pb-4 print:hidden">
        <div>
          <h1 className="font-heading text-3xl text-saffron-700 font-bold tracking-tight">
            Past Invoices
          </h1>
          <p className="text-gray-500 text-sm">Query, adjust, or print tax cash memos securely stored offline</p>
        </div>
      </div>

      {/* Control panel (filters+search) */}
      <div className="bg-white border border-cream-200 rounded-xl p-4 shadow-xs mt-4 flex flex-col lg:flex-row gap-4 print:hidden" id="invoices_controls">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            id="invoice_search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Invoice ID (CMH-XXXX), name, or phone number..."
            className="w-full pl-9 pr-4 py-2 border border-cream-200 rounded-lg text-sm bg-cream-50/20 focus:outline-hidden focus:ring-2 focus:ring-saffron-500/30"
          />
        </div>

        {/* Status drop */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase">Status:</span>
            <select
              id="invoice_status_filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-cream-200 rounded-lg text-xs bg-cream-50/10 font-medium"
            >
              <option value="All">All statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial Ledger</option>
            </select>
          </div>

          {/* Mode Drop */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold uppercase">Channel:</span>
            <select
              id="invoice_mode_filter"
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="p-1.5 border border-cream-200 rounded-lg text-xs bg-cream-50/10 font-medium"
            >
              <option value="All">All channels</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card POS</option>
              <option value="Online">Online Aggregations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Invoices list Table */}
      <div className="bg-white border border-cream-200 rounded-xl shadow-xs overflow-hidden print:hidden" id="invoices_table_container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-cream-100">
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Customer Detail</th>
                <th className="px-6 py-4 font-medium">Issued Date</th>
                <th className="px-6 py-4 font-medium text-right">Grand Total</th>
                <th className="px-6 py-4 font-medium text-center">Payment Status</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50 text-sm">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-sans">
                    No generated bills match your active filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const statusColors = {
                    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
                    Partial: 'bg-amber-50 text-amber-700 border-amber-200'
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-cream-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-saffron-700">{inv.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="text-xs text-gray-400 font-mono italic">{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {new Date(inv.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                        {valueFormat(inv.grandTotal)}
                        <span className="block text-[10px] text-gray-400 font-normal mt-0.5 uppercase tracking-wider font-sans">
                          via {inv.paymentMode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus]}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            id={`view_receipt_${inv.id}`}
                            onClick={() => setActiveReceipt(inv)}
                            className="bg-cream-100 hover:bg-cream-200/80 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            View Receipt
                          </button>

                          {inv.paymentStatus !== 'Paid' && (
                            <button
                              id={`mark_paid_${inv.id}`}
                              onClick={() => {
                                onUpdateStatus(inv.id, 'Paid');
                                // Also update visual in modal if active
                                if (activeReceipt?.id === inv.id) {
                                  setActiveReceipt(prev => prev ? { ...prev, paymentStatus: 'Paid' } : null);
                                }
                              }}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                              title="Settle balance completely"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Mark Paid
                            </button>
                          )}

                          {confirmDeleteId === inv.id ? (
                            <div className="flex items-center gap-1 border border-rose-200 bg-rose-50 p-1 rounded-lg">
                              <span className="text-[10px] text-rose-700 font-bold px-1 uppercase shrink-0">Confirm?</span>
                              <button
                                onClick={() => {
                                  onDeleteInvoice(inv.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="bg-rose-600 text-white rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-gray-500 font-bold px-1 text-[11px] hover:text-gray-800 cursor-pointer"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(inv.id)}
                              className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Invoice record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INVOICE DIALOG MODAL (PRINT FRIENDLY OVERLAY) */}
      {activeReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto px-4 py-8 print:absolute print:inset-0 print:bg-white print:p-0 print:m-0"
          id="receipt_detail_modal"
        >
          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-cream-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
            
            {/* Modal sticky controls header */}
            <div className="bg-cream-50/80 px-6 py-4 border-b border-cream-100 flex items-center justify-between print:hidden">
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-saffron-600" />
                GST Compliant Cash Memo
              </span>
              <div className="flex gap-3">
                <button
                  id="print_receipt_action"
                  onClick={handlePrint}
                  className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-1.5 px-4 rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Area Section */}
            <div className="overflow-y-auto p-8 font-sans print:overflow-visible print:p-0" id="print_receipt_body">
              
              {/* Receipt Header logo & identity */}
              <div className="flex justify-between items-start gap-4 border-b-2 border-saffron-700/40 pb-5">
                <div>
                  <h1 className="font-heading text-2xl font-black text-saffron-700 leading-tight">
                    {businessSettings.businessName}
                  </h1>
                  <p className="font-heading text-xs italic text-gold-600 tracking-wide mt-0.5">
                    {businessSettings.tagline}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium max-w-sm mt-2 whitespace-pre-line leading-relaxed">
                    {businessSettings.address}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium mt-1">
                    Phone: {businessSettings.phone} • Email: {businessSettings.email}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-lg font-mono font-bold tracking-tight text-gray-900 border border-gray-200 max-w-fit px-3 py-1 bg-cream-50/30 rounded-lg">
                    CASH MEMO
                  </span>
                  <div className="mt-3.5 text-[10px] font-mono text-gray-700 text-left space-y-0.5 border border-cream-100 p-2 bg-cream-50/10 rounded-md">
                    <div><span className="font-sans font-semibold text-gray-500">GSTIN:</span> <strong className="uppercase">{businessSettings.gstin}</strong></div>
                    <div><span className="font-sans font-semibold text-gray-500">FSSAI No:</span> <strong>{businessSettings.fssai}</strong></div>
                  </div>
                </div>
              </div>

              {/* Bill Details Block */}
              <div className="grid grid-cols-2 gap-6 py-4 text-[11px] border-b border-cream-100 leading-relaxed">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px] mb-1">Invoice Details</p>
                  <p className="text-gray-800 font-mono">Invoice Number: <strong className="text-saffron-700">{activeReceipt.id}</strong></p>
                  <p className="text-gray-600">Issued On: {new Date(activeReceipt.createdAt).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                  })}</p>
                  <p className="text-gray-600">Payment Status: <strong className="font-bold uppercase tracking-wider">{activeReceipt.paymentStatus}</strong></p>
                  <p className="text-gray-600">Settled Channel: <strong className="font-bold">{activeReceipt.paymentMode}</strong></p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wide text-[9px] mb-1">Customer Particulars</p>
                  {activeReceipt.customerId ? (
                    <>
                      <p className="text-gray-800 font-bold">{activeReceipt.customerName}</p>
                      {activeReceipt.customerPhone && <p className="text-gray-600">Tel: {activeReceipt.customerPhone}</p>}
                      {activeReceipt.customerGstin && <p className="text-teal-700 font-mono">GST: {activeReceipt.customerGstin}</p>}
                      {activeReceipt.customerAddress && <p className="text-gray-500">{activeReceipt.customerAddress}</p>}
                    </>
                  ) : (
                    <p className="text-gray-500 italic">Walk-In Consumer Account</p>
                  )}
                </div>
              </div>

              {/* Food items Table list */}
              <div className="py-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-gray-800 pb-2 text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                      <th className="py-1">Description of Dishes</th>
                      <th className="py-1 text-center w-12 bg-cream-50/20">Qty</th>
                      <th className="py-1 text-right w-20">Rate</th>
                      <th className="py-1 text-center w-16">GST%</th>
                      <th className="py-1 text-right w-24">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100 text-gray-800">
                    {activeReceipt.items.map((item, idx) => (
                      <tr key={idx} className="py-2 hover:bg-cream-50/10">
                        <td className="py-2.5 font-sans font-medium text-gray-900">{item.name}</td>
                        <td className="py-2.5 text-center font-mono font-bold bg-cream-50/20">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">{valueFormat(item.price)}</td>
                        <td className="py-2.5 text-center font-mono text-gray-500">{item.gstRate}%</td>
                        <td className="py-2.5 text-right font-mono font-bold">{valueFormat(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Settle calculations columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-400 py-4 text-xs font-sans">
                {/* Left: Notes or custom terms */}
                <div className="space-y-3">
                  {activeReceipt.notes && (
                    <div className="bg-cream-50/40 p-2.5 rounded-lg border border-cream-100 text-[10px] text-gray-600 italic">
                      <strong>Remarks / Instructions:</strong> {activeReceipt.notes}
                    </div>
                  )}
                  <div className="text-[9px] text-gray-400 space-y-0.5 leading-relaxed">
                    <p>• GST rates charged: 5% (Standard Restaurant Dosa/Idli), 12% (Biryani & Desserts), 18% (Grand Feast Meals).</p>
                    <p>• Inclusive of state food SGST & federal CGST taxes apportioned dynamically.</p>
                    <p>• Thank you for dining with us! Come back soon.</p>
                  </div>
                </div>

                {/* Right: Totals figures */}
                <div className="space-y-2 text-right">
                  <div className="flex justify-between text-gray-500">
                    <span>Menu Price Subtotal:</span>
                    <span className="font-mono text-gray-700">{valueFormat(activeReceipt.subtotal)}</span>
                  </div>
                  {activeReceipt.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold font-sans">
                      <span>Proportional Discount:</span>
                      <span className="font-mono">- {valueFormat(activeReceipt.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>Tax Levy CGST + SGST:</span>
                    <span className="font-mono text-gray-700">{valueFormat(activeReceipt.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-300 pt-2.5">
                    <span>Invoice Net Total (Rounded):</span>
                    <span className="font-mono text-saffron-700 text-base">{valueFormat(activeReceipt.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* GST Breakdown matrix summary */}
              {activeTaxBreakdown.length > 0 && (
                <div className="border-t border-cream-100 pt-4 mt-2">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Itemized Dynamic GST Levy Reconciliation</p>
                  <table className="w-full text-left border-collapse text-[9px] text-gray-500">
                    <thead>
                      <tr className="border-b border-cream-100 bg-cream-50/50">
                        <th className="p-1">Tax Slab</th>
                        <th className="p-1 text-right">Taxable Net Val</th>
                        <th className="p-1 text-right">CGST (Federal)</th>
                        <th className="p-1 text-right">SGST (State)</th>
                        <th className="p-1 text-right">Total Food Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100 font-mono">
                      {activeTaxBreakdown.map((row) => row && (
                        <tr key={row.rate}>
                          <td className="p-1 font-sans">{row.rate}% Slab</td>
                          <td className="p-1 text-right">{valueFormat(row.taxableAmount)}</td>
                          <td className="p-1 text-right">{valueFormat(row.cgst)}</td>
                          <td className="p-1 text-right">{valueFormat(row.sgst)}</td>
                          <td className="p-1 text-right font-bold text-gray-700">{valueFormat(row.totalTax)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Authentic Indian Kitchen Greetings Signet */}
              <div className="text-center mt-8 pt-5 border-t-2 border-dashed border-cream-200">
                <p className="font-heading text-sm font-bold text-saffron-600">~ Sree Annapoorna Prasannamyam ~</p>
                <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-wider">This is a system generated tax invoice and does not require an physical signature</p>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
