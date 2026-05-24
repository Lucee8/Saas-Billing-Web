import React, { useState, useMemo } from 'react';
import { CatalogItem } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle 
} from 'lucide-react';

interface CatalogProps {
  catalog: CatalogItem[];
  onAddCatalogItem: (item: CatalogItem) => void;
  onUpdateCatalogItem: (item: CatalogItem) => void;
  onDeleteCatalogItem: (itemId: string) => void;
  onResetCatalog: () => void;
}

export default function Catalog({ 
  catalog, 
  onAddCatalogItem, 
  onUpdateCatalogItem, 
  onDeleteCatalogItem,
  onResetCatalog
}: CatalogProps) {
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Modal / Sliding panel state for Add/Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);

  // Form Field States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Dosa');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formGstRate, setFormGstRate] = useState<number>(5);
  const [formAvailable, setFormAvailable] = useState(true);

  // Deletion helper state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  
  // Local error state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stats
  const stats = useMemo(() => {
    const total = catalog.length;
    const active = catalog.filter(i => i.available).length;
    const inactive = total - active;
    
    const categoriesSet = new Set<string>();
    catalog.forEach(item => categoriesSet.add(item.category));

    return {
      total,
      active,
      inactive,
      categoriesCount: categoriesSet.size
    };
  }, [catalog]);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set<string>();
    catalog.forEach(item => cats.add(item.category));
    return ['All', ...Array.from(cats)];
  }, [catalog]);

  // Unique categories for form selection
  const formCategories = useMemo(() => {
    const cats = new Set<string>();
    catalog.forEach(item => cats.add(item.category));
    return Array.from(cats);
  }, [catalog]);

  // Filtered menu catalog list
  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchCat && matchSearch;
    });
  }, [catalog, activeCategory, searchQuery]);

  // Open editor for creating new item
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Dosa');
    setFormPrice(0);
    setFormGstRate(5);
    setFormAvailable(true);
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  // Open editor for editing item
  const handleOpenEdit = (item: CatalogItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormGstRate(item.gstRate);
    setFormAvailable(item.available);
    setErrorMsg(null);
    setIsEditorOpen(true);
  };

  // Save changes
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim()) {
      setErrorMsg("Dish item name is required.");
      return;
    }
    if (formPrice < 0) {
      setErrorMsg("Price cannot be a negative value.");
      return;
    }

    if (editingItem) {
      // Modify existing item
      const updated: CatalogItem = {
        ...editingItem,
        name: formName.trim(),
        category: formCategory.trim(),
        price: formPrice,
        gstRate: formGstRate,
        available: formAvailable
      };
      onUpdateCatalogItem(updated);
    } else {
      // Create new item
      const newItem: CatalogItem = {
        id: `item-${Date.now()}`,
        name: formName.trim(),
        category: formCategory.trim(),
        price: formPrice,
        gstRate: formGstRate,
        available: formAvailable
      };
      onAddCatalogItem(newItem);
    }

    setIsEditorOpen(false);
  };

  // Inline Toggling for available value
  const handleToggleAvailable = (item: CatalogItem) => {
    onUpdateCatalogItem({
      ...item,
      available: !item.available
    });
  };

  const valueFormat = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in" id="catalog_screen">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-cream-200 pb-4">
        <div>
          <h1 className="font-heading text-3xl text-saffron-700 font-bold tracking-tight">
            Menu Catalog Configuration
          </h1>
          <p className="text-gray-500 text-sm font-sans">
            Add dishes, configure tax bracket allocations, and command kitchen stockavailability
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
          <button
            id="reset_catalog_demo_action"
            onClick={() => {
              if (window.confirm("Restore menu catalog back to the original 27 preloaded South Indian food items? This ignores current additions.")) {
                onResetCatalog();
              }
            }}
            className="text-xs text-gray-500 hover:text-gray-800 bg-cream-100 hover:bg-cream-200 border border-cream-200 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
          >
            Reset Demo Menu
          </button>
          
          <button
            id="add_new_catalog_item"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-saffron-500 hover:bg-saffron-600 text-white px-4 py-2 rounded-lg font-semibold text-xs shadow-sm transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Statistics Section Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="catalog_stats">
        <div className="bg-white border border-cream-200 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Dishes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 font-mono">{stats.total}</p>
        </div>
        <div className="bg-white border border-cream-200 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Currently Available</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{stats.active}</p>
        </div>
        <div className="bg-white border border-cream-200 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of Stock</p>
          <p className="text-2xl font-bold text-rose-500 mt-1 font-mono">{stats.inactive}</p>
        </div>
        <div className="bg-white border border-cream-200 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Categories</p>
          <p className="text-2xl font-bold text-teal-600 mt-1 font-mono">{stats.categoriesCount}</p>
        </div>
      </div>

      {/* Control panel & categories */}
      <div className="bg-white border border-cream-200 rounded-xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search menu */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            id="catalog_search_input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog items by name or category..."
            className="w-full pl-9 pr-4 py-2 border border-cream-200 rounded-lg text-sm bg-cream-50/20 focus:outline-hidden"
          />
        </div>

        {/* Categories Tab Scroll */}
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold font-sans transition-colors cursor-pointer shrink-0 ${
                activeCategory === cat 
                  ? 'bg-teal-600 text-white border-b border-teal-700' 
                  : 'bg-cream-50 text-gray-600 hover:text-gray-900 border border-cream-200 hover:border-cream-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Catalog Cards/Table Grid */}
      <div className="bg-white border border-cream-200 rounded-xl shadow-xs overflow-hidden" id="catalog_table_container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50/50 text-gray-500 text-[11px] font-bold uppercase tracking-wider border-b border-cream-100">
                <th className="px-6 py-4 font-medium">Item Details</th>
                <th className="px-6 py-4 font-medium">Category Group</th>
                <th className="px-6 py-4 font-medium text-right">Standard Rate</th>
                <th className="px-6 py-4 font-medium text-center">GST Slab</th>
                <th className="px-6 py-4 font-medium text-center">Available Stock</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-50 text-sm text-gray-700">
              {filteredCatalog.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    No active dishes matching your criteria. Add one!
                  </td>
                </tr>
              ) : (
                filteredCatalog.map(item => (
                  <tr key={item.id} className={`hover:bg-cream-50/10 transition-colors ${!item.available ? 'opacity-65' : ''}`}>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-gray-900">{item.name}</span>
                        {!item.available && (
                          <span className="ml-2 inline-flex items-center text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded-sm font-bold uppercase">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                      {valueFormat(item.price)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-medium text-gray-500">
                      {item.gstRate}% GST
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.available}
                            onChange={() => handleToggleAvailable(item)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-505 bg-gray-300 peer-checked:bg-emerald-500"></div>
                          <span className="ml-2 text-xs font-semibold text-gray-600 w-12 text-left">
                            {item.available ? 'In Stock' : 'OOS'}
                          </span>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          id={`edit_item_${item.id}`}
                          onClick={() => handleOpenEdit(item)}
                          className="bg-cream-100 hover:bg-cream-200 p-1.5 rounded-lg text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {confirmDeleteId === item.id ? (
                          <div className="flex items-center gap-1 border border-rose-200 bg-rose-50 p-1 rounded-lg">
                            <span className="text-[10px] text-rose-700 font-bold px-1 uppercase shrink-0">Confirm?</span>
                            <button
                              onClick={() => {
                                onDeleteCatalogItem(item.id);
                                setConfirmDeleteId(null);
                              }}
                              className="bg-rose-600 text-white rounded px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-gray-500 font-bold px-1 text-[11px] cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="text-gray-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT SLIDING MODAL DIALOG PANEL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" id="catalog_editor_modal">
          <div className="bg-white rounded-xl max-w-md w-full border border-cream-200 shadow-xl overflow-hidden animate-fade-in-up">
            <div className="bg-cream-50/80 px-5 py-4 border-b border-cream-100 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-gray-900">
                {editingItem ? 'Edit Dish Details' : 'Add Legacy Dish'}
              </h3>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-cream-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              
              {errorMsg && (
                <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              {/* Dish Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dish Name *</label>
                <input 
                  id="form_item_name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Ghee Podi Onion Uttapam"
                  className="w-full p-2.5 border border-cream-200 rounded-lg text-xs"
                />
              </div>

              {/* Category Group */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category Group</label>
                  <select
                    id="form_item_category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-white text-gray-800"
                  >
                    <option value="Dosa">Dosa Specials</option>
                    <option value="Idli & Vada">Idli & Vada</option>
                    <option value="Uttapam">Uttapam</option>
                    <option value="Breakfast">Breakfast Specials</option>
                    <option value="Meals & Rice">Meals & Rice</option>
                    <option value="Desserts">Tithi/Desserts</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Custom Category</label>
                  <input 
                    id="form_item_custom_category"
                    type="text"
                    placeholder="Or type new..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Price & GST */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Standard Price (INR) *</label>
                  <input 
                    id="form_item_price"
                    type="number"
                    min="0"
                    required
                    value={formPrice === 0 ? '' : formPrice}
                    onChange={(e) => setFormPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="₹120"
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">GST Tax Bracket</label>
                  <select
                    id="form_item_gstrate"
                    value={formGstRate}
                    onChange={(e) => setFormGstRate(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-cream-200 rounded-lg text-xs bg-white text-gray-800"
                  >
                    <option value="0">0% (Nil/Fresh Grocery)</option>
                    <option value="5">5% (Standard Restaurant)</option>
                    <option value="12">12% (Packaged Sweets)</option>
                    <option value="18">18% (Luxury Meals)</option>
                  </select>
                </div>
              </div>

              {/* Availability toggler */}
              <div className="flex items-center justify-between p-2.5 bg-cream-50/50 rounded-lg border border-cream-100">
                <div>
                  <p className="text-xs font-bold text-gray-700">Available immediately in billing?</p>
                  <p className="text-[10px] text-gray-400">If toggled down, it hiding in new bills</p>
                </div>
                <input 
                  id="form_item_available"
                  type="checkbox"
                  checked={formAvailable}
                  onChange={(e) => setFormAvailable(e.target.checked)}
                  className="w-4 h-4 text-saffron-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="border-t border-cream-100 pt-4 flex gap-3 justify-end text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  id="save_item_record_btn"
                  type="submit"
                  className="bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Item Properties
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
