import { useState, useEffect } from 'react';
import { 
  ActiveScreen, 
  CatalogItem, 
  Customer, 
  Invoice, 
  BusinessSettings 
} from './types';
import { 
  INITIAL_BUSINESS_SETTINGS, 
  INITIAL_CATALOG, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVOICES 
} from './data';
import Dashboard from './components/Dashboard';
import NewBill from './components/NewBill';
import Invoices from './components/Invoices';
import Catalog from './components/Catalog';
import Customers from './components/Customers';
import Settings from './components/Settings';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Receipt, 
  MenuSquare, 
  UsersRound, 
  SlidersHorizontal, 
  Menu, 
  X,
  MapPin,
  UtensilsCrossed
} from 'lucide-react';

export default function App() {
  // Navigation
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Deep Core States
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(INITIAL_BUSINESS_SETTINGS);
  const [catalog, setCatalog] = useState<CatalogItem[]>(INITIAL_CATALOG);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // Stage 1: Load states from LocalStorage under custom keys on component mount
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('cmh_settings_v1');
      const storedCatalog = localStorage.getItem('cmh_catalog_v1');
      const storedCustomers = localStorage.getItem('cmh_customers_v1');
      const storedInvoices = localStorage.getItem('cmh_invoices_v1');

      if (storedSettings) setBusinessSettings(JSON.parse(storedSettings));
      if (storedCatalog) setCatalog(JSON.parse(storedCatalog));
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
    } catch (e) {
      console.error("Critical: localized parsing failed. Resetting fallback seeds", e);
    }
  }, []);

  // Stage 2: Synchronize State updates directly into physical localStorage
  const saveSettingsToStorage = (settingsObj: BusinessSettings) => {
    setBusinessSettings(settingsObj);
    localStorage.setItem('cmh_settings_v1', JSON.stringify(settingsObj));
  };

  const saveCatalogToStorage = (catalogArray: CatalogItem[]) => {
    setCatalog(catalogArray);
    localStorage.setItem('cmh_catalog_v1', JSON.stringify(catalogArray));
  };

  const saveCustomersToStorage = (customersArray: Customer[]) => {
    setCustomers(customersArray);
    localStorage.setItem('cmh_customers_v1', JSON.stringify(customersArray));
  };

  const saveInvoicesToStorage = (invoicesArray: Invoice[]) => {
    setInvoices(invoicesArray);
    localStorage.setItem('cmh_invoices_v1', JSON.stringify(invoicesArray));
  };

  // State mutators for individual screens
  // 1. SAVE/CREATE SYSTEM INVOICE
  const handleSaveInvoice = (newInvoice: Invoice, newCustomer?: Customer) => {
    // Append invoice
    const updatedInvoices = [newInvoice, ...invoices];
    saveInvoicesToStorage(updatedInvoices);

    // If a brand new customer registry was created inline during billing
    if (newCustomer) {
      const updatedCustomers = [newCustomer, ...customers];
      saveCustomersToStorage(updatedCustomers);
    }
  };

  // 2. UPDATE PAST INVOICE STATUS LIQUIDATIONS
  const handleUpdateInvoiceStatus = (invoiceId: string, newStatus: 'Paid' | 'Unpaid' | 'Partial') => {
    const updated = invoices.map(inv => inv.id === invoiceId ? { ...inv, paymentStatus: newStatus } : inv);
    saveInvoicesToStorage(updated);
  };

  // 3. DELETE INVOICE RECORD
  const handleDeleteInvoice = (invoiceId: string) => {
    const filtered = invoices.filter(inv => inv.id !== invoiceId);
    saveInvoicesToStorage(filtered);
  };

  // 4. ADD CATALOG DISH
  const handleAddCatalogItem = (item: CatalogItem) => {
    const updated = [item, ...catalog];
    saveCatalogToStorage(updated);
  };

  // 5. UPDATE CATALOG DISH
  const handleUpdateCatalogItem = (item: CatalogItem) => {
    const updated = catalog.map(c => c.id === item.id ? item : c);
    saveCatalogToStorage(updated);
  };

  // 6. DELETE CATALOG DISH
  const handleDeleteCatalogItem = (itemId: string) => {
    const updated = catalog.filter(c => c.id !== itemId);
    saveCatalogToStorage(updated);
  };

  // 7. SPECIFIC MENU RESET
  const handleResetCatalog = () => {
    saveCatalogToStorage(INITIAL_CATALOG);
  };

  // 8. ADD REGISTERED CUSTOMER DIRECT
  const handleAddCustomerDirect = (cust: Customer) => {
    const updated = [cust, ...customers];
    saveCustomersToStorage(updated);
  };

  // 9. CRITICAL HARD WIPE REDO SYSTEM RESET
  const handleResetAllData = () => {
    localStorage.removeItem('cmh_settings_v1');
    localStorage.removeItem('cmh_catalog_v1');
    localStorage.removeItem('cmh_customers_v1');
    localStorage.removeItem('cmh_invoices_v1');

    setBusinessSettings(INITIAL_BUSINESS_SETTINGS);
    setCatalog(INITIAL_CATALOG);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);

    setActiveScreen('dashboard');
  };

  // Navigation schema definitions
  const menuList = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-bill', label: 'Create Bill', icon: PlusCircle },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'catalog', label: 'Menu Catalog', icon: MenuSquare },
    { id: 'customers', label: 'Customer Ledger', icon: UsersRound },
    { id: 'settings', label: 'Settings', icon: SlidersHorizontal },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream-50" id="cmh_root_container">
      
      {/* 1. SIDEBAR NAVIGATION PANELS (DESKTOP) */}
      <aside className="w-64 bg-white border-r border-cream-200 flex flex-col justify-between shrink-0 sticky top-0 h-screen print:hidden hidden md:flex" id="desktop_navbar">
        <div className="flex flex-col flex-1">
          {/* Header Identity banner */}
          <div className="p-6 border-b border-cream-100 flex items-center gap-3">
            <div className="bg-saffron-500 text-white p-2 rounded-xl shadow-xs">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-heading font-black text-saffron-700 tracking-tight text-sm leading-tight uppercase">
                Carnatic Military Hotel
              </h1>
              <p className="text-[10px] text-gold-600 font-bold uppercase tracking-wider font-heading leading-none mt-1">
                My House
              </p>
            </div>
          </div>

          {/* Menu items tabs */}
          <nav className="p-4 space-y-1" id="desktop_nav_links">
            {menuList.map(item => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`nav_${item.id}`}
                  onClick={() => setActiveScreen(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-saffron-50 border border-saffron-100 text-saffron-700 shadow-2xs' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-cream-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-saffron-500' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer details */}
        <div className="p-4 border-t border-cream-100 bg-cream-50/30 text-[9px] text-gray-400 space-y-1.5 font-sans leading-relaxed">
          <div className="flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-gray-300" />
            <span className="truncate">{businessSettings.businessName}</span>
          </div>
          <div>GSTIN: <strong>{businessSettings.gstin || "N/A"}</strong></div>
          <div>FSSAI: <strong>{businessSettings.fssai || "N/A"}</strong></div>
          <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-saffron-600/70 font-semibold uppercase tracking-wider">
            <span>SaaS client v1.0</span>
            <span>● Offline</span>
          </div>
        </div>
      </aside>

      {/* 2. COLLAPSIBLE TOP HEADER (MOBILE/TABLET ONLY) */}
      <header className="md:hidden bg-white border-b border-cream-200 px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 print:hidden" id="mobile_navbar">
        <div className="flex items-center gap-2.5">
          <div className="bg-saffron-500 text-white p-1.5 rounded-lg">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-heading font-black text-saffron-700 text-xs uppercase leading-tight">Carnatic Military Hotel</h1>
            <p className="text-[8px] text-gold-600 font-bold uppercase tracking-wider leading-none font-heading">My House</p>
          </div>
        </div>

        <button 
          id="toggle_mobile_menu"
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-1 text-gray-500 hover:text-gray-800 border border-cream-250 bg-cream-50/50 rounded-lg cursor-pointer"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Collapsed mobile lists */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 top-[52px] z-30 bg-black/40 print:hidden" onClick={() => setIsMobileNavOpen(false)}>
          <div className="bg-white border-b border-cream-200 p-4 space-y-1 shadow-md" onClick={(e) => e.stopPropagation()}>
            {menuList.map(item => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;

              return (
                <button
                  key={item.id}
                  id={`mobile_nav_${item.id}`}
                  onClick={() => {
                    setActiveScreen(item.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-saffron-50 border border-saffron-100 text-saffron-700 shadow-2xs' 
                      : 'text-gray-500 hover:text-gray-800 hover:bg-cream-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-saffron-500' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CORE VIEW MAIN ROUTER MODULES */}
      <main className="flex-1 p-5 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden print:p-0 print:m-0 print:bg-white print:max-w-none print:w-full print:block" id="app_view_container">
        
        {activeScreen === 'dashboard' && (
          <Dashboard 
            invoices={invoices}
            customers={customers}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'new-bill' && (
          <NewBill 
            catalog={catalog}
            customers={customers}
            onSaveInvoice={handleSaveInvoice}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'invoices' && (
          <Invoices 
            invoices={invoices}
            businessSettings={businessSettings}
            onUpdateStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'catalog' && (
          <Catalog 
            catalog={catalog}
            onAddCatalogItem={handleAddCatalogItem}
            onUpdateCatalogItem={handleUpdateCatalogItem}
            onDeleteCatalogItem={handleDeleteCatalogItem}
            onResetCatalog={handleResetCatalog}
          />
        )}

        {activeScreen === 'customers' && (
          <Customers 
            customers={customers}
            invoices={invoices}
            onAddCustomer={handleAddCustomerDirect}
            onNavigate={setActiveScreen}
          />
        )}

        {activeScreen === 'settings' && (
          <Settings 
            businessSettings={businessSettings}
            catalog={catalog}
            customers={customers}
            invoices={invoices}
            onUpdateSettings={saveSettingsToStorage}
            onResetAllData={handleResetAllData}
          />
        )}

      </main>

    </div>
  );
}
