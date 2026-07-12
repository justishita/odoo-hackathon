import React, { useState, useEffect } from 'react';
import { 
  Wrench, Plus, Clock, CheckCircle2, AlertCircle, 
  ChevronRight, Filter, Loader2, X, AlertTriangle, Info, User 
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const PRIORITY_STYLE = {
  Critical: { badge:'badge-danger',  icon:'🔴' },
  High:     { badge:'badge-warning', icon:'🟠' },
  Medium:   { badge:'badge-indigo',  icon:'🟡' },
  Low:      { badge:'badge-neutral', icon:'⚪' },
};

const STATUS_STYLE = {
  'Open':        { badge:'badge-warning', dot:'bg-amber-500' },
  'In Progress': { badge:'badge-info',    dot:'bg-blue-500' },
  'Resolved':    { badge:'badge-success', dot:'bg-emerald-500' },
  'Closed':      { badge:'badge-neutral', dot:'bg-slate-400' },
};

const COLUMNS = ['Open','In Progress','Resolved'];

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'asset_manager');

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Form Fields State
  const [assetId, setAssetId] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Open');
  const [assigneeId, setAssigneeId] = useState('');
  const [eta, setEta] = useState('');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/maintenance');
      if (res.data?.success) {
        setTickets(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets and users for dropdowns
  const loadAssetsAndUsers = async () => {
    try {
      const assetsRes = await axiosInstance.get('/assets');
      if (assetsRes.data?.success) {
        setAssets(assetsRes.data.data.assets);
      }

      const usersRes = await axiosInstance.get('/users');
      if (usersRes.data?.success) {
        setUsers(usersRes.data.data.users);
      }
    } catch (err) {
      console.error('Failed to load assets or employees', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenRegisterModal = () => {
    setFormError('');
    setEditingTicket(null);
    setAssetId('');
    setIssue('');
    setPriority('Medium');
    setStatus('Open');
    setAssigneeId('');
    setEta('');
    setNotes('');
    loadAssetsAndUsers();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ticket) => {
    setFormError('');
    setEditingTicket(ticket);
    setAssetId(ticket.asset?._id || ticket.asset || '');
    setIssue(ticket.issue);
    setPriority(ticket.priority);
    setStatus(ticket.status);
    setAssigneeId(ticket.assignee?._id || ticket.assignee || '');
    setEta(ticket.eta ? ticket.eta.split('T')[0] : '');
    setNotes(ticket.notes || '');
    loadAssetsAndUsers();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTicket(null);
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
    if (!issue.trim()) {
      setFormError('Please describe the issue');
      setSubmitLoading(false);
      return;
    }

    const payload = {
      asset: assetId,
      issue: issue.trim(),
      priority,
      status,
      assignee: assigneeId || null,
      eta: eta || null,
      notes: notes.trim(),
    };

    try {
      let res;
      if (editingTicket) {
        res = await axiosInstance.put(`/maintenance/${editingTicket._id}`, payload);
      } else {
        res = await axiosInstance.post('/maintenance', payload);
      }

      if (res.data?.success) {
        handleCloseModal();
        fetchTickets();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please check your inputs.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter tickets client-side
  const filtered = tickets.filter(t =>
    (t.asset?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.asset?.serialNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.issue || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Wrench className="h-6 w-6 text-amber-500" /> Maintenance
          </h1>
          <p className="page-subtitle">Track and resolve asset maintenance requests</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
            {['kanban','list'].map(v => (
              <button key={v} onClick={()=>setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${view===v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>
          {canManage && (
            <button onClick={handleOpenRegisterModal} className="btn-primary gap-2 text-sm">
              <Plus className="h-4 w-4" /> New Ticket
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total',       value:tickets.length,                                        bg:'bg-slate-50',   border:'border-slate-200',   text:'text-slate-800' },
          { label:'Open',        value:tickets.filter(t=>t.status==='Open').length,            bg:'bg-amber-50',   border:'border-amber-200',   text:'text-amber-700' },
          { label:'In Progress', value:tickets.filter(t=>t.status==='In Progress').length,     bg:'bg-blue-50',    border:'border-blue-200',    text:'text-blue-700' },
          { label:'Resolved',    value:tickets.filter(t=>t.status==='Resolved').length,        bg:'bg-emerald-50', border:'border-emerald-200', text:'text-emerald-700' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} ${s.border} border rounded-2xl p-4`}>
            <p className={`text-2xl font-extrabold tabular-nums ${s.text}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search toolbar */}
      <div className="relative max-w-md">
        <AlertTriangle className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} 
          placeholder="Search by asset name, serial, or issue..." className="input pl-10" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading tickets...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : view === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {COLUMNS.map(col => {
            const S = STATUS_STYLE[col] || STATUS_STYLE.Open;
            const columnTickets = filtered.filter(t => t.status === col);
            return (
              <div key={col} className="bg-slate-100/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${S.dot}`} />
                    <span className="text-sm font-bold text-slate-700">{col}</span>
                  </div>
                  <span className="badge badge-neutral text-2xs">{columnTickets.length}</span>
                </div>
                
                {columnTickets.map((t, i) => {
                  const P = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium;
                  const etaDate = t.eta ? new Date(t.eta).toLocaleDateString() : 'None';
                  return (
                    <div key={t._id} onClick={() => canManage && handleOpenEditModal(t)} 
                      className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-2.5 hover:shadow-md transition-all cursor-pointer group card-reveal"
                      style={{ animationDelay:`${i*60}ms` }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-amber-500 transition-colors">{t.asset?.name || 'Deleted Asset'}</p>
                        <span className={`badge ${P.badge} text-2xs flex-shrink-0`}>{t.priority}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{t.issue}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-2xs">{t.asset?.serialNumber}</span>
                        {t.eta && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />ETA {etaDate}</span>
                        )}
                      </div>
                      
                      {t.assignee ? (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-2xs flex items-center justify-center font-bold">
                            {t.assignee.name?.[0]}
                          </div>
                          <span className="text-xs text-slate-500">{t.assignee.name}</span>
                        </div>
                      ) : (
                        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-2xs">
                          <span className="text-slate-400 italic">Unassigned</span>
                          {canManage && <span className="text-indigo-600 font-semibold group-hover:underline">+ Assign</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {columnTickets.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium rounded-xl border-2 border-dashed border-slate-200">
                    No tickets in {col}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View Table */
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => {
                const P = PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.Medium;
                const S = STATUS_STYLE[t.status] || STATUS_STYLE.Open;
                return (
                  <tr key={t._id} className="group cursor-pointer" onClick={() => canManage && handleOpenEditModal(t)}>
                    <td>
                      <div>
                        <p className="font-bold text-slate-800">{t.asset?.name || 'Deleted Asset'}</p>
                        <p className="text-xs font-mono text-slate-400">{t.asset?.serialNumber}</p>
                      </div>
                    </td>
                    <td className="text-slate-500 max-w-xs truncate">{t.issue}</td>
                    <td><span className={`badge ${P.badge}`}>{t.priority}</span></td>
                    <td><span className={`badge ${S.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${S.dot}`}/>{t.status}</span></td>
                    <td className="text-slate-500 text-xs">{t.assignee?.name || 'Unassigned'}</td>
                    <td className="text-slate-500 text-xs">{t.eta ? new Date(t.eta).toLocaleDateString() : '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 font-medium">No tickets match search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Register / Edit Ticket Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                {editingTicket ? 'Update Ticket details' : 'Create Maintenance Ticket'}
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

                {/* Asset selector */}
                <div>
                  <label className="label">Asset with Issue *</label>
                  <select value={assetId} onChange={e=>setAssetId(e.target.value)} disabled={!!editingTicket} className="input" required>
                    <option value="">Select Asset</option>
                    {assets.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                    ))}
                  </select>
                </div>

                {/* Issue Description */}
                <div>
                  <label className="label">Issue Description *</label>
                  <textarea value={issue} onChange={e=>setIssue(e.target.value)} rows="3"
                    placeholder="Describe what needs repair or servicing..." className="input py-2 resize-none" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Priority */}
                  <div>
                    <label className="label">Priority</label>
                    <select value={priority} onChange={e=>setPriority(e.target.value)} className="input">
                      {['Low','Medium','High','Critical'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Status (Only show when editing) */}
                  <div>
                    <label className="label">Ticket Status</label>
                    <select value={status} onChange={e=>setStatus(e.target.value)} disabled={!editingTicket} className="input">
                      {['Open','In Progress','Resolved','Closed'].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Assignee */}
                  <div>
                    <label className="label">Technician Assignment</label>
                    <select value={assigneeId} onChange={e=>setAssigneeId(e.target.value)} className="input">
                      <option value="">None / Unassigned</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>{u.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* ETA */}
                  <div>
                    <label className="label">Estimated Resolution (ETA)</label>
                    <input type="date" value={eta} onChange={e=>setEta(e.target.value)} className="input" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="label">Servicing Notes</label>
                  <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="2"
                    placeholder="Add progress details, costs, or vendor names..." className="input py-2 resize-none" />
                </div>
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
                    'Save Ticket'
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
