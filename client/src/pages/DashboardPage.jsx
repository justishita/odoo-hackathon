import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package, Users, Wrench, Calendar, TrendingUp, TrendingDown,
  ArrowRight, Activity, Clock, AlertTriangle, CheckCircle2,
  Zap, BarChart3, ChevronRight, RefreshCw, Building2,
  ArrowLeftRight, ClipboardCheck,
} from 'lucide-react';

/* ─── Animated counter hook ─────────────────────────── */
const useCounter = (target, duration = 1400, delay = 0) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setVal(Math.floor(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return val;
};

/* ─── Sparkline (inline SVG mini-chart) ─────────────── */
const Sparkline = ({ data, color = '#6366f1', height = 36 }) => {
  const w = 120, h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(' ')} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${color.replace('#','')})`} />
      <polyline points={polyline} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* last dot */}
      <circle cx={pts[pts.length-1].split(',')[0]} cy={pts[pts.length-1].split(',')[1]} r="3" fill={color} />
    </svg>
  );
};

/* ─── Radial progress ring ──────────────────────────── */
const RadialRing = ({ pct, color, size = 72, stroke = 6, label, sublabel }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
          <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.2,0.64,1)' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-extrabold text-slate-800 tabular-nums leading-none">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-bold text-slate-700 text-center">{label}</p>
      {sublabel && <p className="text-2xs text-slate-400 text-center">{sublabel}</p>}
    </div>
  );
};

/* ─── Bar chart ─────────────────────────────────────── */
const BarChart = ({ data, color = '#6366f1' }) => {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div className="w-full relative rounded-t-sm overflow-hidden" style={{ height: '48px' }}>
            <div
              className="absolute bottom-0 w-full rounded-t-sm bar-fill transition-all group-hover:opacity-80"
              style={{
                height: `${(d.value / max) * 100}%`,
                background: color,
                animationDelay: `${i * 80}ms`,
              }}
            />
          </div>
          <span className="text-2xs text-slate-400 font-medium leading-none">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Data ──────────────────────────────────────────── */
const STATS = [
  {
    key: 'available', label: 'Available Assets', value: 128,
    icon: Package, color: 'emerald',
    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-100',
    trend: +8.2, sparkData: [80,95,88,105,98,115,128],
    sparkColor: '#10b981', path: '/assets',
    badge: 'Ready', badgeStyle: 'badge-success',
  },
  {
    key: 'allocated', label: 'Assets Allocated', value: 45,
    icon: ArrowLeftRight, color: 'blue',
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
    borderColor: 'border-blue-100',
    trend: +3.1, sparkData: [30,28,35,40,38,42,45],
    sparkColor: '#3b82f6', path: '/allocations',
    badge: 'Active', badgeStyle: 'badge-info',
  },
  {
    key: 'maintenance', label: 'In Maintenance', value: 7,
    icon: Wrench, color: 'amber',
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600',
    borderColor: 'border-amber-100',
    trend: -12.5, sparkData: [12,10,8,11,9,8,7],
    sparkColor: '#f59e0b', path: '/maintenance',
    badge: 'Today', badgeStyle: 'badge-warning',
  },
  {
    key: 'bookings', label: 'Active Bookings', value: 12,
    icon: Calendar, color: 'indigo',
    iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
    borderColor: 'border-indigo-100',
    trend: +18.0, sparkData: [5,7,9,8,10,11,12],
    sparkColor: '#6366f1', path: '/bookings',
    badge: 'Open', badgeStyle: 'badge-indigo',
  },
];

const WEEKLY_BARS = [
  { label:'M', value:12 }, { label:'T', value:18 }, { label:'W', value:14 },
  { label:'T', value:22 }, { label:'F', value:16 }, { label:'S', value:8 }, { label:'S', value:6 },
];

const ACTIVITY = [
  { id:1, user:'Priya Sharma',    action:'allocated',  subject:'MacBook Pro #LT-042',        time:'2 min ago', dot:'bg-blue-500',    avatar:'PS' },
  { id:2, user:'Rahul Gupta',     action:'booked',     subject:'Projector for Room B3',       time:'15 min ago',dot:'bg-indigo-500',  avatar:'RG' },
  { id:3, user:'Aditya Mehta',    action:'reported',   subject:'AC Unit maintenance request', time:'1h ago',    dot:'bg-amber-500',  avatar:'AM' },
  { id:4, user:'Sneha Patel',     action:'returned',   subject:'iPad Pro #TB-017',            time:'2h ago',    dot:'bg-emerald-500',avatar:'SP' },
  { id:5, user:'Vikram Singh',    action:'requested',  subject:'Standing Desk for Eng Floor', time:'4h ago',    dot:'bg-purple-500', avatar:'VS' },
  { id:6, user:'System',          action:'flagged',    subject:'Asset #CH-008 overdue',       time:'6h ago',    dot:'bg-red-500',    avatar:'SY' },
];

const QUICK_ACTIONS = [
  { label:'Register Asset',    icon: Package,        path:'/assets',        color:'from-indigo-500 to-indigo-600' },
  { label:'New Allocation',    icon: ArrowLeftRight, path:'/allocations',   color:'from-blue-500 to-blue-600' },
  { label:'Book Resource',     icon: Calendar,       path:'/bookings',      color:'from-purple-500 to-purple-600' },
  { label:'Maintenance Log',   icon: Wrench,         path:'/maintenance',   color:'from-amber-500 to-orange-500' },
  { label:'Org Setup',         icon: Building2,      path:'/organization',  color:'from-emerald-500 to-teal-500' },
  { label:'Run Audit',         icon: ClipboardCheck, path:'/audits',        color:'from-rose-500 to-pink-600' },
];

/* ─── Animated background orbs ─────────────────────── */
const BgOrbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div className="orb-1 absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)' }} />
    <div className="orb-2 absolute bottom-0 -left-24 w-[500px] h-[500px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />
    <div className="orb-3 absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full"
      style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />
  </div>
);

/* ─── Stat Card ─────────────────────────────────────── */
const StatCard = ({ stat, index }) => {
  const count = useCounter(stat.value, 1200, index * 120);
  const Icon = stat.icon;
  const isPositive = stat.trend >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  return (
    <Link to={stat.path}
      className={`card-glow group relative overflow-hidden p-5 flex flex-col gap-3 card-reveal cursor-pointer`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${stat.iconBg} ${stat.borderColor} border transition-transform duration-300 group-hover:scale-110`}>
          <Icon className={`h-5 w-5 ${stat.iconColor}`} />
        </div>
        <span className={`text-xs font-semibold ${stat.badgeStyle} badge`}>{stat.badge}</span>
      </div>

      {/* Value */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900 tabular-nums leading-none count-appear">
            {count}
          </span>
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            <TrendIcon className="h-3.5 w-3.5" />
            {Math.abs(stat.trend)}%
          </span>
        </div>
        <p className="text-sm text-slate-500 mt-0.5 font-medium">{stat.label}</p>
      </div>

      {/* Sparkline */}
      <div className="mt-auto">
        <Sparkline data={stat.sparkData} color={stat.sparkColor} />
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
        <ArrowRight className={`h-4 w-4 ${stat.iconColor}`} />
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
        style={{ background: `radial-gradient(circle at bottom right, ${stat.sparkColor}08 0%, transparent 60%)` }} />
    </Link>
  );
};

/* ─── Main Dashboard ────────────────────────────────── */
const DashboardPage = () => {
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-7 relative">
      <BgOrbs />

      {/* ── Hero header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-glow animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-24 -top-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -right-8 top-8 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute right-32 -bottom-16 w-60 h-60 rounded-full bg-purple-500/20" />
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize:'24px 24px' }} />
          {/* beam */}
          <div className="beam-sweep absolute inset-0" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-indigo-200/80 text-sm font-medium">{greeting},</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">Online</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {firstName}! 👋
            </h1>
            <p className="text-sm text-indigo-200/70 mt-1 max-w-sm">
              Here's your asset management overview for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time filter */}
            <div className="flex bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 p-1 gap-0.5">
              {['24h','7d','30d','90d'].map(t => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${timeFilter===t ? 'bg-white text-indigo-700 shadow-sm' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-all">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat, i) => <StatCard key={stat.key} stat={stat} index={i} />)}
      </div>

      {/* ── Middle row: Bar chart + System health ── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Weekly activity chart */}
        <div className="lg:col-span-2 card p-6 animate-fade-in-up" style={{ animationDelay:'0.3s' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                Weekly Activity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Asset operations this week</p>
            </div>
            <span className="badge badge-indigo">96 total</span>
          </div>
          <BarChart data={WEEKLY_BARS} color="#6366f1" />
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            {[
              { label: 'Allocations', value: '22', color: 'bg-indigo-500' },
              { label: 'Bookings',    value: '34', color: 'bg-purple-500' },
              { label: 'Maintenance', value: '18', color: 'bg-amber-500' },
              { label: 'Returns',     value: '22', color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <span className="text-xs font-bold text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System health */}
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay:'0.35s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              System Health
            </h3>
            <span className="badge badge-success">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <RadialRing pct={89} color="#10b981" label="Utilization" sublabel="Assets in use" />
            <RadialRing pct={94} color="#6366f1" label="Compliance" sublabel="Audit score" />
            <RadialRing pct={72} color="#f59e0b" label="Maintenance" sublabel="On schedule" />
            <RadialRing pct={98} color="#3b82f6" label="Uptime"    sublabel="System SLA" />
          </div>
        </div>
      </div>

      {/* ── Bottom row: Activity feed + Quick actions ── */}
      <div className="grid gap-5 lg:grid-cols-5">

        {/* Activity feed */}
        <div className="lg:col-span-3 card p-6 animate-fade-in-up" style={{ animationDelay:'0.4s' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              Live Activity Feed
            </h3>
            <Link to="/audits" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="space-y-0 divide-y divide-slate-50">
            {ACTIVITY.map((a, i) => (
              <div key={a.id}
                className="flex items-start gap-3 py-3 hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Avatar */}
                <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${i % 2 === 0 ? 'from-indigo-100 to-purple-100' : 'from-blue-100 to-cyan-100'} flex items-center justify-center text-xs font-bold text-slate-700 flex-shrink-0`}>
                  {a.avatar}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 leading-snug">
                    <span className="font-bold text-slate-800">{a.user}</span>
                    {' '}<span className="text-slate-500">{a.action}</span>{' '}
                    <span className="font-semibold text-slate-700">{a.subject}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${a.dot}`} />
                    <span className="text-xs text-slate-400">{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-2 card p-6 animate-fade-in-up" style={{ animationDelay:'0.45s' }}>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
            <Zap className="h-4 w-4 text-amber-500" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map(({ label, icon: I, path, color }) => (
              <Link key={path} to={path}
                className={`group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${color} text-white text-center hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
                <I className="relative z-10 h-5 w-5 drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />
                <span className="relative z-10 text-xs font-bold leading-tight text-center">{label}</span>
              </Link>
            ))}
          </div>

          {/* Alert banner */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">3 assets overdue</p>
              <p className="text-2xs text-amber-600 mt-0.5">Review pending returns in Allocation</p>
            </div>
            <Link to="/allocations" className="ml-auto flex-shrink-0">
              <ChevronRight className="h-4 w-4 text-amber-500 hover:text-amber-700 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
