import React, { useState } from 'react';
import { BusinessSettings, CatalogItem, Customer, Invoice } from '../types';
import { 
  Building2, 
  Save, 
  Download, 
  RefreshCcw, 
  Check, 
  AlertTriangle, 
  HelpCircle 
} from 'lucide-react';

interface SettingsProps {
  businessSettings: BusinessSettings;
  catalog: CatalogItem[];
  customers: Customer[];
  invoices: Invoice[];
  onUpdateSettings: (settings: BusinessSettings) => void;
  onResetAllData: () => void;
}

export default function Settings({ 
  businessSettings, 
  catalog,
  customers,
  invoices,
  onUpdateSettings, 
  onResetAllData 
}: SettingsProps) {
  // Local edit states
  const [name, setName] = useState(businessSettings.businessName);
  const [tagline, setTagline] = useState(businessSettings.tagline);
  const [address, setAddress] = useState(businessSettings.address);
  const [phone, setPhone] = useState(businessSettings.phone);
  const [email, setEmail] = useState(businessSettings.email);
  const [gstin, setGstin] = useState(businessSettings.gstin);
  const [fssai, setFssai] = useState(businessSettings.fssai);

  // Status updates indicators
  const [isSaved, setIsSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Save edits form
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Business name cannot be left blank.");
      return;
    }

    const updated: BusinessSettings = {
      businessName: name.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gstin: gstin.toUpperCase().trim(),
      fssai: fssai.trim()
    };

    onUpdateSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Raw Export Backup Download
  const handleExportBackup = () => {
    const backupObj = {
      exportedAt: new Date().toISOString(),
      platform: "CMH Billing Software v1.0",
      businessSettings,
      catalog,
      customers,
      invoices
    };

    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cmh_billing_export_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="settings_screen">
      
      {/* Page Header */}
      <div className="border-b border-cream-200 pb-4">
        <h1 className="font-heading text-3xl text-saffron-700 font-bold tracking-tight">
          System Settings
        </h1>
        <p className="text-gray-500 text-sm">Configure cash memo formats, FSSAI / GSTIN details, and perform database sanitizations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Business configuration details (2 spans) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSaveSettings} className="bg-white border border-cream-200 rounded-xl p-6 shadow-xs space-y-4">
            <h3 className="font-heading text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-cream-100 pb-2">
              <Building2 className="w-5 h-5 text-saffron-600" />
              Restaurant Particulars Form
            </h3>

            {isSaved && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg p-3.5 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Business details saved successfully to regional cache!
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3.5 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block mb-1">Kitchen / Restaurant Name *</label>
                <input 
                  id="settings_name_input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Carnatic My House"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900"
                />
              </div>

              {/* Tagline */}
              <div className="md:col-span-2">
                <label className="block mb-1">Tagline / Slogan</label>
                <input 
                  id="settings_tagline_input"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g., Legacy Taste of the South"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900 italic"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="block mb-1">Physical Kitchen Address</label>
                <input 
                  id="settings_address_input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street and PIN coordinates"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-1">Customer Care Phone</label>
                <input 
                  id="settings_phone_input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="080-XXXXXXXX"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1">Billing Support Email</label>
                <input 
                  id="settings_email_input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@kitchen.com"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block mb-1 text-teal-700">GSTIN Registration (Tax compliance)</label>
                <input 
                  id="settings_gstin_input"
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="29AADCCXXXXF1Z4"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-teal-800 font-mono uppercase"
                />
              </div>

              {/* FSSAI */}
              <div>
                <label className="block mb-1">FSSAI License Number</label>
                <input 
                  id="settings_fssai_input"
                  type="text"
                  value={fssai}
                  onChange={(e) => setFssai(e.target.value)}
                  placeholder="14-digit license number"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs text-gray-900 font-mono"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-cream-100 pt-4 flex justify-end">
              <button
                id="save_settings_btn"
                type="submit"
                className="bg-saffron-500 hover:bg-saffron-600 active:bg-saffron-700 text-white font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Business Profile
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Backup Export and Reset Tools (1 span) */}
        <div className="space-y-6">
          
          {/* Export card */}
          <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs flex flex-col justify-between min-h-[190px]">
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-950">Export JSON Backup</h3>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Download the complete customer profiles, full menu catalog, and historical cash logs as a secure, structured backup file.
              </p>
            </div>
            
            <button
              id="export_json_backup_btn"
              onClick={handleExportBackup}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Backup Archive
            </button>
          </div>

          {/* Reset Database card */}
          <div className="bg-white border border-cream-200 rounded-xl p-5 shadow-xs border-l-4 border-l-rose-500 flex flex-col justify-between min-h-[190px]">
            <div>
              <h4 className="font-heading text-lg font-bold text-rose-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Reset System Data
              </h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                Wipe clean all custom menus and receipts. Re-installs original 27 preloaded classic South Indian dishes and seed invoice registries.
              </p>
            </div>

            <button
              id="reset_entire_database_btn"
              onClick={() => {
                if (window.confirm("CRITICAL ACTION: Are you sure you wish to wipe current state, including added customers and bills, and reset to standard demo data? This cannot be undone.")) {
                  onResetAllData();
                }
              }}
              className="mt-4 w-full border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset Demo Seeds
            </button>
          </div>

          {/* Offline local storage details */}
          <div className="bg-cream-100/50 rounded-xl p-4 text-[10px] text-gray-500 flex gap-2 border border-cream-200">
            <HelpCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-700">Offline Standalone SaaS</p>
              <p className="mt-1 leading-relaxed">
                CMH Billing Software v1.0 utilizes client-side Browser storage exclusively. Clearing your browser cookies or storage cache will purge active invoices. Download a manual JSON backup frequently to prevent data loss.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
