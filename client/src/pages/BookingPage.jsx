import React, { useState, useEffect } from 'react';
import { 
  CalendarRange, Plus, Clock, User, Package, CheckCircle2, 
  XCircle, AlertCircle, Loader2, X, MapPin 
} from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLE = {
  Confirmed: { badge:'badge-success', icon: CheckCircle2, dot:'bg-emerald-500' },
  Pending:   { badge:'badge-warning', icon: AlertCircle,  dot:'bg-amber-500' },
  Cancelled: { badge:'badge-danger',  icon: XCircle,      dot:'bg-red-500' },
  Completed: { badge:'badge-neutral', icon: CheckCircle2, dot:'bg-slate-400' },
};

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const HOURS = Array.from({ length: 9 }, (_, i) => `${i + 9}:00`);

export default function BookingPage() {
  const { hasRole } = useAuth();
  const canApprove = hasRole('admin', 'asset_manager', 'department_head');

  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [view, setView] = useState('list');
  const [filter, setFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [room, setRoom] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');

  const [formError, setFormError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/bookings');
      if (res.data?.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all assets for dropdown
  const loadAssets = async () => {
    try {
      const res = await axiosInstance.get('/assets');
      if (res.data?.success) {
        setAssets(res.data.data.assets);
      }
    } catch (err) {
      console.error('Failed to load assets', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenModal = () => {
    setFormError('');
    setAssetId('');
    setRoom('');
    // Default start/end dates to current datetime
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const startStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    const endStr = new Date(now.getTime() + 2 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    
    setStartDate(startStr);
    setEndDate(endStr);
    setPurpose('');
    loadAssets();
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
      setFormError('Please select an asset to book');
      setSubmitLoading(false);
      return;
    }
    if (!startDate || !endDate) {
      setFormError('Please select both start and end times');
      setSubmitLoading(false);
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setFormError('End time must be after the start time');
      setSubmitLoading(false);
      return;
    }
    if (!purpose.trim()) {
      setFormError('Please specify the booking purpose');
      setSubmitLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.post('/bookings', {
        asset: assetId,
        room,
        startDate,
        endDate,
        purpose
      });
      if (res.data?.success) {
        setIsModalOpen(false);
        fetchBookings();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit booking');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setSubmitLoading(true);
    try {
      const res = await axiosInstance.patch(`/bookings/${id}/status`, { status });
      if (res.data?.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setSubmitLoading(false);
    }
  };

  const filtered = bookings.filter(b => !filter || b.status === filter);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-purple-600" /> Booking Manager
          </h1>
          <p className="page-subtitle">Schedule and manage resource bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-0.5">
            {['list','calendar'].map(v => (
              <button key={v} onClick={()=>setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${view===v ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={handleOpenModal} className="btn-primary gap-2 text-sm">
            <Plus className="h-4 w-4" /> New Booking
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {['','Confirmed','Pending','Completed','Cancelled'].map(s => (
          <button key={s} onClick={()=>setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter===s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {s || 'All'} {s && `(${bookings.filter(b=>b.status===s).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-slate-400 text-sm">Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : view === 'list' ? (
        <div className="space-y-3">
          {filtered.map((b, i) => {
            const S = STATUS_STYLE[b.status] || STATUS_STYLE.Pending;
            const StatusIcon = S.icon;
            
            const startFmt = b.startDate ? new Date(b.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '—';
            const endFmt = b.endDate ? new Date(b.endDate).toLocaleTimeString([], { timeStyle: 'short' }) : '—';

            return (
              <div key={b._id} className="card-glow p-5 grid sm:grid-cols-[1fr_auto] gap-4 group cursor-pointer card-reveal"
                style={{ animationDelay:`${i*60}ms` }}>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{b.asset?.name || 'Deleted Resource'}</p>
                      <p className="text-xs text-slate-400">
                        {b.room ? `${b.room} · ` : ''} <span className="font-mono text-3xs">{b.asset?.serialNumber || '—'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-600">{b.user?.name || 'Deleted User'}</span> 
                      {b.user?.department?.name && ` · ${b.user.department.name}`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {startFmt} — {endFmt}
                    </span>
                  </div>
                  {b.purpose && <p className="text-xs text-slate-400 italic">"{b.purpose}"</p>}
                </div>
                <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2">
                  <span className={`badge ${S.badge}`}>
                    <StatusIcon className="h-3 w-3" />
                    {b.status}
                  </span>
                  {b.status === 'Pending' && canApprove && (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleUpdateStatus(b._id, 'Confirmed')}
                        disabled={submitLoading}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <span className="text-slate-300">·</span>
                      <button 
                        onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                        disabled={submitLoading}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400 font-medium">No bookings match this filter.</div>
          )}
        </div>
      ) : (
        /* Calendar grid */
        <div className="card overflow-hidden bg-white">
          <div className="p-4 border-b border-slate-100 bg-slate-50/60">
            <p className="text-sm font-bold text-slate-700">Live Weekly Booking Schedule</p>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-8 border-b border-slate-100">
                <div className="p-3 text-xs font-bold text-slate-400 border-r border-slate-100" />
                {DAYS.map(d => (
                  <div key={d} className="p-3 text-xs font-bold text-center text-slate-600 border-r border-slate-100 last:border-0">{d}</div>
                ))}
              </div>
              {HOURS.map(h => (
                <div key={h} className="grid grid-cols-8 border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                  <div className="p-2 text-2xs text-slate-400 font-mono border-r border-slate-100 flex items-start pt-2">{h}</div>
                  {DAYS.map((d, di) => {
                    const booking = bookings.find(b => {
                      if (!b.startDate || b.status === 'Cancelled') return false;
                      const dateObj = new Date(b.startDate);
                      const dayIndex = dateObj.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
                      const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
                      const bHour = dateObj.getHours();
                      return bHour === parseInt(h) && di === adjustedDayIndex;
                    });
                    return (
                      <div key={d} className="p-1 border-r border-slate-50 last:border-0 min-h-[50px] flex items-center justify-center">
                        {booking && (
                          <div className="w-full rounded-lg bg-indigo-50 border border-indigo-100 p-1.5 overflow-hidden">
                            <p className="text-[10px] font-bold text-indigo-700 truncate">{booking.asset?.name}</p>
                            <p className="text-[9px] text-indigo-500 truncate">{booking.user?.name?.split(' ')[0]}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-panel max-w-md">
            <div className="modal-header">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-purple-500" />
                Book Resource / Asset
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

                {/* Resource Selector */}
                <div>
                  <label className="label">Resource / Asset *</label>
                  <select value={assetId} onChange={e=>setAssetId(e.target.value)} className="input" required>
                    <option value="">Select Resource</option>
                    {assets.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.serialNumber})</option>
                    ))}
                  </select>
                </div>

                {/* Location / Room */}
                <div>
                  <label className="label">Room / Location</label>
                  <input value={room} onChange={e=>setRoom(e.target.value)}
                    placeholder="e.g. Conference Room A" className="input" />
                </div>

                {/* Start & End Date Time */}
                <div>
                  <label className="label">Start Time *</label>
                  <input type="datetime-local" value={startDate} onChange={e=>setStartDate(e.target.value)}
                    className="input" required />
                </div>

                <div>
                  <label className="label">End Time *</label>
                  <input type="datetime-local" value={endDate} onChange={e=>setEndDate(e.target.value)}
                    className="input" required />
                </div>

                {/* Purpose */}
                <div>
                  <label className="label">Purpose of Booking *</label>
                  <textarea value={purpose} onChange={e=>setPurpose(e.target.value)} rows="3"
                    placeholder="e.g. Client presentation, team workshop..." className="input py-2 resize-none" required />
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
                      Booking...
                    </>
                  ) : (
                    'Submit Request'
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
