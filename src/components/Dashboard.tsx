import { useMemo } from 'react';
import { Invoice, Customer, ActiveScreen } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  AlertTriangle, 
  PlusCircle, 
  Settings2, 
  ChevronRight, 
  ShoppingBag, 
  IndianRupee 
} from 'lucide-react';

interface DashboardProps {
  invoices: Invoice[];
  customers: Customer[];
  onNavigate: (screen: ActiveScreen) => void;
}

export default function Dashboard({ invoices, customers, onNavigate }: DashboardProps) {
  // Current date reference: 2026-05-24
  const CURRENT_DATE_STR = '2026-05-24';

  const stats = useMemo(() => {
    // Today's total revenue (Paid + Partial invoices)
    const todayInvoices = invoices.filter(inv => inv.createdAt.startsWith(CURRENT_DATE_STR));
    const todayRevenue = todayInvoices.reduce((sum, inv) => {
      // In cloud kitchen billing, paid status is what determines recorded collection, 
      // but standard revenue calculation is grandTotal for bills cut today. Let's sum grandTotal.
      return sum + inv.grandTotal;
    }, 0);

    // This month's total revenue (May 2026)
    const monthInvoices = invoices.filter(inv => inv.createdAt.startsWith('2026-05'));
    const monthRevenue = monthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    // Unpaid/Partial bills count
    const unpaidBills = invoices.filter(inv => inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partial');

    return {
      todayRevenue,
      monthRevenue,
      unpaidCount: unpaidBills.length,
      totalCustomers: customers.length
    };
  }, [invoices, customers]);

  // Last 7 days chart data ending 2026-05-24
  const chartData = useMemo(() => {
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate dates from 2026-05-18 to 2026-05-24
    for (let i = 6; i >= 0; i--) {
      const d = new Date(2026, 4, 24 - i); // May is index 4
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      const dayInvoices = invoices.filter(inv => inv.createdAt.startsWith(dateStr));
      const dailyTotal = dayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

      data.push({
        dateLabel: `${months[d.getMonth()]} ${d.getDate()}`,
        amount: Math.round(dailyTotal)
      });
    }
    return data;
  }, [invoices]);

  // Top 5 selling menu items
  const topItems = useMemo(() => {
    const salesMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
    
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!salesMap[item.name]) {
          salesMap[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        salesMap[item.name].quantity += item.quantity;
        salesMap[item.name].revenue += item.quantity * item.price;
      });
    });

    return Object.values(salesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [invoices]);

  // Recent 5 invoices
  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [invoices]);

  const valueFormat = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 1
    }).format(val);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="dashboard_screen">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-cream-200 pb-4">
        <div>
          <h1 className="font-heading text-4xl text-saffron-700 font-bold tracking-tight">
            Carnatic Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm font-sans font-medium tracking-wide">
            Welcome back to Carnatic My House • Manage live orders and catalog billing
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
          <button 
            id="quick_new_bill"
            onClick={() => onNavigate('new-bill')}
            className="flex items-center gap-2 bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all duration-200 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            New GST Bill
          </button>
          <button 
            id="quick_manage_catalog"
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 border border-teal-500 text-teal-600 hover:bg-teal-50 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            Manage Catalog
          </button>
        </div>
      </div>

      {/* Financial Health Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Revenue */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs relative overflow-hidden" id="stat_today_revenue">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5">
            <TrendingUp className="w-32 h-32 text-saffron-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-semibold tracking-wider font-sans uppercase">Today's Revenue</span>
            <div className="bg-saffron-50 text-saffron-600 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {valueFormat(stats.todayRevenue)}
            </h3>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <span>● Live operating status</span>
            </p>
          </div>
        </div>

        {/* This Month's Revenue */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs relative overflow-hidden" id="stat_month_revenue">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5">
            <IndianRupee className="w-32 h-32 text-teal-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-semibold tracking-wider font-sans uppercase">This Month's Sales</span>
            <div className="bg-teal-50 text-teal-600 p-2 rounded-lg">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {valueFormat(stats.monthRevenue)}
            </h3>
            <p className="text-xs text-teal-600 mt-1 font-semibold">
              May 2026 Fiscal Cycle
            </p>
          </div>
        </div>

        {/* Unpaid Bills */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs relative overflow-hidden" id="stat_unpaid_bills">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-0.1">
            <AlertTriangle className="w-28 h-28 text-amber-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-semibold tracking-wider font-sans uppercase">Pending Payments</span>
            <div className={`p-2 rounded-lg ${stats.unpaidCount > 0 ? 'bg-amber-5 border border-amber-200 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {stats.unpaidCount} <span className="text-sm font-medium text-gray-500">bills</span>
            </h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">
              Requires payment tracking
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs relative overflow-hidden" id="stat_total_customers">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5">
            <Users className="w-32 h-32 text-gold-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs font-semibold tracking-wider font-sans uppercase">Signed Customers</span>
            <div className="bg-gold-50 text-gold-600 p-2 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">
              {stats.totalCustomers}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Retained in browser cache
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-cream-100 pb-4 mb-4">
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-900">7-Day Sales Trend</h3>
              <p className="text-xs text-gray-400 font-sans">Daily cumulative billing total including taxes & discounts</p>
            </div>
            <span className="text-xs font-bold text-saffron-600 bg-saffron-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Live
            </span>
          </div>
          <div className="h-72 w-full mt-2 font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4581A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C4581A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAECD8" />
                <XAxis dataKey="dateLabel" tickLine={false} style={{ fontSize: '11px', fill: '#6B7280' }} />
                <YAxis tickLine={false} style={{ fontSize: '11px', fill: '#6B7280' }} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #FAECD8', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#C4581A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top items tracker */}
        <div className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs flex flex-col">
          <div className="border-b border-cream-100 pb-4 mb-4">
            <h3 className="font-heading text-lg font-bold text-gray-900">Leaderboard</h3>
            <p className="text-xs text-gray-400 font-sans">Top 5 South Indian legacy dishes by volume</p>
          </div>
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {topItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No orders processed yet
              </div>
            ) : (
              topItems.map((item, index) => {
                const colors = ['bg-saffron-500', 'bg-teal-500', 'bg-gold-500', 'bg-saffron-400', 'bg-teal-400'];
                return (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-700 truncate max-w-[200px]" title={item.name}>
                        {index + 1}. {item.name}
                      </span>
                      <span className="text-gray-900 font-mono">
                        {item.quantity} portions (₹{item.revenue})
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-cream-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors[index % colors.length]}`}
                        style={{ 
                          width: `${Math.min(100, (item.quantity / (topItems[0]?.quantity || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent invoices list */}
      <div className="bg-white border border-cream-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900">Recent Generated Invoices</h3>
            <p className="text-xs text-gray-400 font-sans">Quick audit log of latest receipts</p>
          </div>
          <button 
            id="view_all_invoices"
            onClick={() => onNavigate('invoices')}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group cursor-pointer"
          >
            All Invoices
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-cream-100">
                <th className="px-6 py-3 font-medium">Invoice ID</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium text-right">Grand Total</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium">Payment Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50 text-sm">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No billing historical data found. Generate a bill first!
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => {
                  const statusColors = {
                    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
                    Partial: 'bg-amber-50 text-amber-700 border-amber-200'
                  };

                  return (
                    <tr key={inv.id} className="hover:bg-cream-50/20 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-medium text-saffron-700">{inv.id}</td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-gray-800">
                          {inv.customerName}
                        </div>
                        {inv.customerPhone && (
                          <div className="text-xs text-gray-400 font-mono">{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500 text-xs">
                        {new Date(inv.createdAt).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold font-mono text-gray-900">
                        {valueFormat(inv.grandTotal)}
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[inv.paymentStatus]}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-gray-600 font-medium">
                        {inv.paymentMode}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
