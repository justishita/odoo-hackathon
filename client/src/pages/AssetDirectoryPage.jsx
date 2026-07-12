import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Plus, Filter, Grid3X3, List, Tag, 
  CheckCircle2, Clock, Wrench, AlertCircle, ChevronRight, 
  Download, Edit2, Trash2, X, Loader2, Calendar, User, Building 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLE = {
  Available:   { badge:'badge-success', dot:'bg-emerald-500', icon: CheckCircle2 },
  Allocated:   { badge:'badge-info',    dot:'bg-blue-500',    icon: Clock },
  Maintenance: { badge:'badge-warning', dot:'bg-amber-500',   icon: Wrench },
  Retired:     { badge:'badge-neutral', dot:'bg-slate-400',   icon: AlertCircle },
};

const COND_STYLE = { New:'badge-success', Good:'badge-info', Fair:'badge-warning', Poor:'badge-danger' };

export default function AssetDirectoryPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'asset_manager');

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [cat, setCat] = useState('');
  const [view, setView] = useState('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetToDelete, setAssetToDelete] = useState(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [category, setCategory] = useState('');
  const [assetStatus, setAssetStatus] = useState('Available');
  const [condition, setCondition] = useState('Good');
  const [value, setValue] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [department, setDepartment] = useState('');
  const [allocatedTo, setAllocatedTo] = useState('');
  const [customFieldValues, setCustomFieldValues] = useState({});

  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch functions
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (status) params.status = status;
      if (cat) params.category = cat;

      const res = await axiosInstance.get('/assets', { params });
      if (res.data?.success) {
        setAssets(res.data.data.assets);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchUsers = async () => {
    if (!canManage) return;
    try {
      const res = await axiosInstance.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data.users);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, status, cat]);

  // Initial lookup data load
  useEffect(() => {
    fetchCategories();
    fetchDepartments();
    fetchUsers();
  }, []);

  // Modal Open Handlers
  const handleOpenRegisterModal = () => {
    setFormError('');
    setEditingAsset(null);
    setName('');
    setSerialNumber('');
    setCategory('');
    setAssetStatus('Available');
    setCondition('Good');
    setValue('');
    setPurchaseDate('');
    setDepartment('');
    setAllocatedTo('');
    setCustomFieldValues({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset) => {
    setFormError('');
    setEditingAsset(asset);
    setName(asset.name);
    setSerialNumber(asset.serialNumber);
    setCategory(asset.category?._id || asset.category || '');
    setAssetStatus(asset.status || 'Available');
    setCondition(asset.condition || 'Good');
    setValue(asset.value || '');
    setPurchaseDate(asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '');
    setDepartment(asset.department?._id || asset.department || '');
    setAllocatedTo(asset.allocatedTo?._id || asset.allocatedTo || '');
    setCustomFieldValues(asset.customFieldValues || {});
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (asset, e) => {
    e.stopPropagation();
    setAssetToDelete(asset);
    setIsDeleteModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAsset(null);
  };

  // Category Selector Change Handler to initialize custom fields
  const handleCategoryChange = (catId) => {
    setCategory(catId);
    const selectedCat = categories.find(c => c._id === catId);
    
    // Build blank values object for dynamic fields
    const initialFields = {};
    if (selectedCat && selectedCat.customFields) {
      selectedCat.customFields.forEach(f => {
        initialFields[f.label] = editingAsset?.customFieldValues?.[f.label] || '';
      });
    }
    setCustomFieldValues(initialFields);
  };

  const handleCustomFieldChange = (label, val) => {
    setCustomFieldValues(prev => ({
      ...prev,
      [label]: val
    }));
  };

  // Form Submit Handler (Register / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    if (!name.trim()) {
      setFormError('Asset name is required');
      setSubmitLoading(false);
      return;
    }
    if (!serialNumber.trim()) {
      setFormError('Serial Number is required');
      setSubmitLoading(false);
      return;
    }
    if (!category) {
      setFormError('Please select a category');
      setSubmitLoading(false);
      return;
    }

    const payload = {
      name: name.trim(),
      serialNumber: serialNumber.trim(),
      category,
      status: assetStatus,
      condition,
      value: value ? Number(value) : 0,
      purchaseDate: purchaseDate || null,
      department: department || null,
      allocatedTo: allocatedTo || null,
      customFieldValues
    };

    try {
      let res;
      if (editingAsset) {
        res = await axiosInstance.put(`/assets/${editingAsset._id}`, payload);
      } else {
        res = await axiosInstance.post('/assets', payload);
      }

      if (res.data?.success) {
        handleCloseModal();
        fetchAssets();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please check your fields.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete Action Handler
  const handleDelete = async () => {
    if (!assetToDelete) return;
    setSubmitLoading(true);
    try {
      const res = await axiosInstance.delete(`/assets/${assetToDelete._id}`);
      if (res.data?.success) {
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
        fetchAssets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    } finally {
      setSubmitLoading(false);
    }
  };

  // CSV Export Action
  const handleExport = () => {
    const headers = ['Serial Number', 'Name', 'Category', 'Status', 'Condition', 'Value', 'Purchase Date', 'Department', 'Allocated To', 'Custom Fields'];
    const rows = assets.map(a => [
      a.serialNumber,
      a.name,
      a.category?.name || '—',
      a.status,
      a.condition,
      a.value ? `$${a.value}` : '$0',
      a.purchaseDate ? new Date(a.purchaseDate).toLocaleDateString() : '—',
      a.department?.name || '—',
      a.allocatedTo?.name || '—',
      JSON.stringify(a.customFieldValues || {})
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AssetFlow_Assets_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCategoryData = categories.find(c => c._id === category);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Package className="h-6 w-6 text-amber-500" /> Asset Directory
          </h1>
          <p className="page-subtitle">Browse and manage all registered organisational assets</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="btn-secondary gap-2 text-xs px-3.5 py-2">
            <Download className="h-4 w-4" /> Export
          </button>
          {canManage && (
            <button onClick={handleOpenRegisterModal} className="btn-primary gap-2 text-xs px-3.5 py-2">
              <Plus className="h-4 w-4" /> Register Asset
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total Assets',    value:assets.length,                                  color:'text-slate-800', bg:'bg-slate-50',   border:'border-slate-200' },
          { label:'Available',       value:assets.filter(a=>a.status==='Available').length, color:'text-emerald-700', bg:'bg-emerald-50', border:'border-emerald-200' },
          { label:'Allocated',       value:assets.filter(a=>a.status==='Allocated').length, color:'text-blue-700',    bg:'bg-blue-50',    border:'border-blue-200' },
          { label:'In Maintenance',  value:assets.filter(a=>a.status==='Maintenance').length,color:'text-amber-700',  bg:'bg-amber-50',   border:'border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold ${s.color} tabular-nums`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name or serial..."
            className="input pl-10" />
        </div>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="input w-auto min-w-[140px]">
          <option value="">All Statuses</option>
          {['Available','Allocated','Maintenance','Retired'].map(s=><option key={s}>{s}</option>)}
        </select>
        <select value={cat} onChange={e=>setCat(e.target.value)} className="input w-auto min-w-[150px]">
          <option value="">All Categories</option>
          {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
          <button onClick={()=>setView('grid')} className={`p-2 rounded-lg transition-all ${view==='grid' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Grid3X3 className="h-4 w-4" /></button>
          <button onClick={()=>setView('list')} className={`p-2 rounded-lg transition-all ${view==='list' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading assets from repository...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : assets.length === 0 ? (
        <div className="p-16 border border-slate-200 rounded-2xl text-center bg-white">
          <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No assets registered yet</p>
          <p className="text-slate-400 text-xs mt-1">Get started by clicking the "Register Asset" button</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((a, i) => {
            const S = STATUS_STYLE[a.status] || STATUS_STYLE.Available;
            return (
              <div key={a._id} onClick={() => canManage && handleOpenEditModal(a)} className="card-glow p-5 flex flex-col gap-3 group card-reveal cursor-pointer" style={{ animationDelay:`${i*50}ms` }}>
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl bg-amber-50 border border-amber-100`}>
                    <Package className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`badge ${S.badge} text-2xs`}><span className={`h-1.5 w-1.5 rounded-full ${S.dot}`} />{a.status}</span>
                    {canManage && (
                      <button 
                        onClick={(e) => handleOpenDeleteModal(a, e)} 
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm leading-tight group-hover:text-amber-500 transition-colors">{a.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{a.serialNumber}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={`badge ${COND_STYLE[a.condition]} text-2xs`}>{a.condition}</span>
                  <span className="text-xs font-bold text-slate-700">${a.value}</span>
                </div>
                <div className="flex flex-col gap-1 text-2xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Tag className="h-3 w-3 text-slate-400" />{a.category?.name || 'Uncategorized'}
                  </div>
                  {a.department && (
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3 text-slate-400" />{a.department?.name}
                    </div>
                  )}
                  {a.allocatedTo && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />{a.allocatedTo?.name}
                    </div>
                  )}
                </div>
                
                {/* Custom fields values visualization */}
                {a.customFieldValues && Object.keys(a.customFieldValues).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-2xs text-slate-500">
                    {Object.entries(a.customFieldValues).map(([label, val]) => (
                      val ? (
                        <span key={label} className="inline-flex gap-1">
                          <span className="font-semibold text-slate-400">{label}:</span>
                          <span className="text-slate-600 truncate max-w-[80px]">{val}</span>
                        </span>
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Department</th>
                <th>Allocated To</th>
                <th>Value</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const S = STATUS_STYLE[a.status] || STATUS_STYLE.Available;
                return (
                  <tr key={a._id} className="group cursor-pointer" onClick={() => canManage && handleOpenEditModal(a)}>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800">{a.name}</p>
                        <p className="text-xs font-mono text-slate-400">{a.serialNumber}</p>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral text-2xs">{a.category?.name || '—'}</span></td>
                    <td><span className={`badge ${S.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${S.dot}`} />{a.status}</span></td>
                    <td><span className={`badge ${COND_STYLE[a.condition]}`}>{a.condition}</span></td>
                    <td className="text-slate-500">{a.department?.name || '—'}</td>
                    <td className="text-slate-500">{a.allocatedTo?.name || '—'}</td>
                    <td className="font-bold text-slate-700">${a.value}</td>
                    {canManage && (
                      <td onClick={(e)=>e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenEditModal(a)} className="p-1 text-slate-400 hover:text-amber-500 transition-colors"><Edit2 className="h-4 w-4" /></button>
                          <button onClick={(e) => handleOpenDeleteModal(a, e)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Register / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-lg">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-500" />
                {editingAsset ? 'Edit Asset Details' : 'Register New Asset'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body max-h-[70vh] overflow-y-auto scrollbar-thin">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="label">Asset Name *</label>
                    <input value={name} onChange={e=>setName(e.target.value)}
                      placeholder="e.g. MacBook Pro 14 inch" className="input" required />
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="label">Serial Number / Asset Tag *</label>
                    <input value={serialNumber} onChange={e=>setSerialNumber(e.target.value)}
                      placeholder="e.g. LT-10922" className="input" required />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="label">Category *</label>
                    <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="input" required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="label">Value (USD)</label>
                    <input type="number" value={value} onChange={e=>setValue(e.target.value)}
                      placeholder="e.g. 1500" className="input" />
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="label">Condition</label>
                    <select value={condition} onChange={e=>setCondition(e.target.value)} className="input">
                      {['New', 'Good', 'Fair', 'Poor'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="label">Status</label>
                    <select value={assetStatus} onChange={e=>setAssetStatus(e.target.value)} className="input">
                      {['Available', 'Allocated', 'Maintenance', 'Retired'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="label">Purchase Date</label>
                    <input type="date" value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)}
                      className="input" />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="label">Department Assignment</label>
                    <select value={department} onChange={e=>setDepartment(e.target.value)} className="input">
                      <option value="">None</option>
                      {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                  </div>

                  {/* Allocated To */}
                  <div>
                    <label className="label">Allocated Employee</label>
                    <select value={allocatedTo} onChange={e=>setAllocatedTo(e.target.value)} className="input">
                      <option value="">None</option>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
                    </select>
                  </div>
                </div>

                {/* Dynamic Category Custom Fields */}
                {selectedCategoryData?.customFields?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Specific Custom Fields</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedCategoryData.customFields.map((field) => (
                        <div key={field.label}>
                          <label className="label">{field.label}</label>
                          <input
                            type={field.fieldType === 'number' ? 'number' : field.fieldType === 'date' ? 'date' : 'text'}
                            value={customFieldValues[field.label] || ''}
                            onChange={(e) => handleCustomFieldChange(field.label, e.target.value)}
                            className="input"
                            placeholder={`Enter ${field.label}...`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn-secondary text-xs px-3.5 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading} className="btn-primary text-xs px-3.5 py-2">
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-sm">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Delete Asset
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="modal-body">
              <p className="text-slate-600 text-sm">
                Are you sure you want to delete asset <strong className="text-slate-800">"{assetToDelete?.name}"</strong> ({assetToDelete?.serialNumber})? This operation cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="btn-secondary text-xs px-3.5 py-2">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={submitLoading} className="btn-danger text-xs px-3.5 py-2">
                {submitLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
