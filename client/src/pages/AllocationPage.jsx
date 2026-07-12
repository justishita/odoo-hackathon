import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, Plus, Search, User, Package, Calendar, 
  CheckCircle2, Clock, XCircle, ChevronRight, Loader2, AlertCircle, X, FileText 
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  Active:   'badge-success',
  Overdue:  'badge-danger',
  Returned: 'badge-neutral',
  Pending:  'badge-warning',
};

const STATUS_DOT = { Active:'bg-emerald-500', Overdue:'bg-red-500', Returned:'bg-slate-400', Pending:'bg-amber-500' };

export default function AllocationPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'asset_manager');

  const [allocations, setAllocations] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(''); // 'Active', 'Overdue', 'Returned', ''

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [userId, setUserId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch Allocations
  const fetchAllocations = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/allocations');
      if (res.data?.success) {
        setAllocations(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch allocations');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Available Assets and Users for allocation dropdown
  const loadAllocationDropdowns = async () => {
    try {
      const assetsRes = await axiosInstance.get('/assets', { params: { status: 'Available' } });
      if (assetsRes.data?.success) {
        setAvailableAssets(assetsRes.data.data.assets);
      }
      
      const usersRes = await axiosInstance.get('/users');
      if (usersRes.data?.success) {
        setUsers(usersRes.data.data.users);
      }
    } catch (err) {
      console.error('Failed to load lookup data for allocations modal', err);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // Filter allocations client-side
  const filtered = allocations.filter(a => {
    const matchesSearch = 
      (a.asset?.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (a.asset?.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.user?.name || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = !filter || a.status === filter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals dynamically
  const counts = {
    All: allocations.length,
    Active: allocations.filter(a => a.status === 'Active').length,
    Overdue: allocations.filter(a => a.status === 'Overdue').length,
    Returned: allocations.filter(a => a.status === 'Returned').length,
  };

  const handleOpenModal = () => {
    setFormError('');
    setAssetId('');
    setUserId('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setNotes('');
    loadAllocationDropdowns();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    if (!assetId) {
      setFormError('Please select an asset');
      setSubmitLoading(false);
      return;
    }
    if (!userId) {
      setFormError('Please select an employee');
      setSubmitLoading(false);
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please provide both start and end dates');
      setSubmitLoading(false);
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setFormError('End date cannot be earlier than start date');
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/allocations', {
        asset: assetId,
        user: userId,
        startDate,
        endDate,
        notes
      });
      if (res.data?.success) {
        setIsModalOpen(false);
        fetchAllocations();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create allocation');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleMarkReturned = async (allocationId) => {
    if (!window.confirm('Are you sure you want to mark this asset as returned?')) return;
    setSubmitLoading(true);
    try {
      const res = await axiosInstance.put(`/allocations/${allocationId}/return`);
      if (res.data?.success) {
        fetchAllocations();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to return asset');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" /> Allocations
          </h1>
          <p className="page-subtitle">Track asset assignments across your organisation</p>
        </div>
        {canManage && (
          <button onClick={handleOpenModal} className="btn-primary gap-2 text-sm">
            <Plus className="h-4 w-4" /> New Allocation
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(counts).map(([label, value]) => (
          <button key={label} onClick={() => setFilter(label === 'All' ? '' : label)}
            className={`p-4 rounded-2xl border text-left transition-all hover:shadow-md ${
              (filter === label || (label === 'All' && !filter))
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-glow-sm'
                : 'bg-white border-slate-200 hover:border-indigo-200'
            }`}>
            <p className={`text-2xl font-extrabold tabular-nums ${(filter === label || (label === 'All' && !filter)) ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            <p className={`text-xs font-medium mt-0.5 ${(filter === label || (label === 'All' && !filter)) ? 'text-indigo-200' : 'text-slate-500'}`}>{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search asset or person..." className="input pl-10" />
      </div>

      {/* Loader & Error states */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-slate-400 text-sm">Loading allocations...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          <ArrowLeftRight className="h-8 w-8 mx-auto mb-3 text-slate-300" />
          <p className="font-medium">No allocations match your search</p>
        </div>
      ) : (
        /* Cards List */
        <div className="space-y-3">
          {filtered.map((a, i) => (
            <div key={a._id} className="card-glow p-5 flex flex-col sm:flex-row sm:items-center gap-4 group card-reveal"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{a.asset?.name || 'Deleted Asset'}</p>
                  <p className="text-xs font-mono text-slate-400">{a.asset?.serialNumber || '—'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {a.user?.name ? a.user.name.split(' ').map(w=>w[0]).join('') : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{a.user?.name || 'Deleted User'}</p>
                  <p className="text-xs text-slate-400">{a.department?.name || '—'}</p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {a.startDate ? a.startDate.split('T')[0] : '—'} → {a.endDate ? a.endDate.split('T')[0] : '—'}
                </span>
              </div>
              
              <div className="flex items-center justify-between sm:justify-start gap-4 flex-shrink-0">
                <span className={`badge ${STATUS_BADGE[a.status] || 'badge-neutral'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[a.status] || 'bg-slate-400'}`} />
                  {a.status}
                </span>
                
                {/* Days remaining badge */}
                {a.status === 'Active' && a.daysLeft !== undefined && a.daysLeft <= 14 && a.daysLeft >= 0 && (
                  <span className="badge badge-warning text-2xs">{a.daysLeft}d left</span>
                )}
                {a.status === 'Overdue' && a.daysLeft !== undefined && (
                  <span className="badge badge-danger text-2xs">{Math.abs(a.daysLeft)}d overdue</span>
                )}

                {/* Return Asset Action Button */}
                {canManage && (a.status === 'Active' || a.status === 'Overdue') && (
                  <button 
                    onClick={() => handleMarkReturned(a._id)}
                    className="btn-secondary text-2xs px-2.5 py-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                  >
                    Return Asset
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Allocation Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <div className="modal-header bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
                New Asset Allocation
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Asset Dropdown */}
                <div>
                  <label className="label">Available Asset *</label>
                  <select value={assetId} onChange={e=>setAssetId(e.target.value)} className="input" required>
                    <option value="">Select Asset</option>
                    {availableAssets.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.name} ({a.serialNumber}) — {a.condition}
                      </option>
                    ))}
                  </select>
                  {availableAssets.length === 0 && (
                    <p className="text-2xs text-amber-600 mt-1">No "Available" assets in directory. Register or free up an asset first.</p>
                  )}
                </div>

                {/* User Dropdown */}
                <div>
                  <label className="label">Allocate To Employee *</label>
                  <select value={userId} onChange={e=>setUserId(e.target.value)} className="input" required>
                    <option value="">Select Employee</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date *</label>
                    <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="input" required />
                  </div>
                  <div>
                    <label className="label">End Date *</label>
                    <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="input" required />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Allocation Notes</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="3"
                    placeholder="Provide details about the assignment..." className="input py-2 resize-none" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn-secondary text-xs px-3.5 py-2">
                  Cancel
                </button>
                <button type="submit" disabled={submitLoading || availableAssets.length === 0} className="btn-primary text-xs px-3.5 py-2">
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Allocating...
                    </>
                  ) : (
                    'Allocate Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
