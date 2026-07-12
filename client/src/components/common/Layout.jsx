import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, Package, ArrowLeftRight,
  CalendarRange, Wrench, ClipboardCheck, BarChart3,
  Bell, LogOut, User, Menu, X, Zap, ChevronRight,
  Settings, Search, HelpCircle, ChevronDown, Sparkles,
} from 'lucide-react';

/* ─── Config ─────────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Administration',
    items: [
      { name: 'Org Setup', path: '/organization', icon: Building2, roles: ['admin'], badge: 'Admin' },
      { name: 'Assets',    path: '/assets',        icon: Package },
    ],
  },
  {
    label: 'Operations',
    items: [
      { name: 'Allocation',   path: '/allocations', icon: ArrowLeftRight },
      { name: 'Booking',      path: '/bookings',    icon: CalendarRange },
      { name: 'Maintenance',  path: '/maintenance', icon: Wrench },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { name: 'Audit',   path: '/audits',   icon: ClipboardCheck },
      { name: 'Reports', path: '/reports',  icon: BarChart3, roles: ['admin','asset_manager','department_head'] },
    ],
  },
];

const ROLE_STYLES = {
  admin:           { badge:'bg-red-50 text-red-600 border-red-200',         dot:'bg-red-500',    grad:'from-red-500 to-rose-600',        label:'Admin' },
  asset_manager:   { badge:'bg-amber-50 text-amber-700 border-amber-200',   dot:'bg-amber-500',  grad:'from-amber-500 to-orange-600',    label:'Asset Manager' },
  department_head: { badge:'bg-orange-50 text-orange-700 border-orange-200',dot:'bg-orange-500', grad:'from-orange-500 to-amber-600',    label:'Dept Head' },
  employee:        { badge:'bg-slate-100 text-slate-600 border-slate-200',  dot:'bg-slate-400',  grad:'from-slate-500 to-slate-600',     label:'Employee' },
};

const NOTIFS = [
  { id:1, title:'Asset #LT-042 overdue',          sub:'Laptop assigned to Jay Chen expired 2 days ago',    time:'2h',  color:'bg-red-500',    dot:'bg-red-100' },
  { id:2, title:'Maintenance scheduled',           sub:'AC Unit in Room 3B is due for service tomorrow',    time:'5h',  color:'bg-amber-500',  dot:'bg-amber-100' },
  { id:3, title:'New allocation request',          sub:'Sarah Doe requested a projector for next week',     time:'1d',  color:'bg-orange-500', dot:'bg-orange-100' },
  { id:4, title:'Audit report ready',              sub:'Q2 asset audit report has been generated',          time:'2d',  color:'bg-emerald-500',dot:'bg-emerald-100' },
];

/* ─── Helpers ────────────────────────────────────────── */
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');

const AV_GRADS = [
  'from-amber-500 to-orange-600',
  'from-orange-500 to-red-500',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-yellow-500 to-amber-600',
];
const avatarGrad = (name = '') => AV_GRADS[(name.charCodeAt(0) || 0) % AV_GRADS.length];

/* ─── Avatar ─────────────────────────────────────────── */
const Avatar = ({ user, size = 'md' }) => {
  const sz = { sm:'h-7 w-7 text-xs', md:'h-9 w-9 text-sm', lg:'h-11 w-11 text-base' }[size];
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br ${avatarGrad(user?.name)} flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 select-none`}>
      {user?.name ? getInitials(user.name) : <User className="h-4 w-4" />}
    </div>
  );
};

/* ─── Live Clock ─────────────────────────────────────── */
const LiveClock = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span className="text-xs font-mono text-slate-400 tabular-nums hidden xl:block">
      {t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
};

/* ─── NavItem ─────────────────────────────────────────── */
const NavItem = ({ item, collapsed, onClick }) => {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      className={({ isActive }) => [
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white nav-active-glow'
          : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/80',
        collapsed ? 'justify-center' : '',
      ].join(' ')}
    >
      {({ isActive }) => (
        <>
          {/* Active left accent bar */}
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/60 rounded-full" />
          )}

          <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${
            isActive ? 'drop-shadow-sm' : 'group-hover:scale-110 group-hover:text-amber-500'
          }`} />

          {!collapsed && (
            <>
              <span className="truncate flex-1">{item.name}</span>
              {item.badge && !isActive && (
                <span className="text-2xs font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-500 border border-red-100">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />}
            </>
          )}

          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0">
              <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
                {item.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
              </div>
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

/* ─── Sidebar content ─────────────────────────────────── */
const SidebarContent = ({ user, collapsed, roleStyle, filteredGroups, onProfileClick }) => (
  <div className="flex flex-col h-full">

    {/* Logo */}
    <div className={`flex h-16 items-center border-b border-slate-100/80 flex-shrink-0 ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
      <Link to="/" className="flex items-center gap-3 group">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-glow flex-shrink-0 overflow-hidden">
          {/* shine */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/15" />
          <Zap className="relative z-10 h-5 w-5 text-white drop-shadow" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block text-[15px] font-extrabold text-slate-800 tracking-tight leading-none">AssetFlow</span>
            <span className="block text-2xs font-semibold text-slate-400 tracking-widest uppercase mt-0.5">Enterprise</span>
          </div>
        )}
      </Link>
    </div>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto scrollbar-thin">
      {filteredGroups.map((group) => (
        <div key={group.label}>
          {!collapsed ? (
            <p className="px-3 mb-1 text-2xs font-bold text-slate-400/80 uppercase tracking-widest select-none">
              {group.label}
            </p>
          ) : (
            <div className="h-px bg-slate-100 mx-1 mb-2" />
          )}
          <div className="space-y-0.5">
            {group.items.map(item => <NavItem key={item.path} item={item} collapsed={collapsed} />)}
          </div>
        </div>
      ))}
    </nav>

    {/* Help button */}
    {!collapsed && (
      <div className="px-4 mb-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-700 text-xs font-semibold hover:from-amber-100 hover:to-orange-100 transition-all duration-200 group">
          <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
          <span>What's new?</span>
          <span className="ml-auto badge badge-warning py-0">v1.0</span>
        </button>
      </div>
    )}

    {/* User footer */}
    <div className={`p-3 border-t border-slate-100/80 bg-gradient-to-b from-transparent to-slate-50/60 flex-shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
      {collapsed ? (
        <Avatar user={user} />
      ) : (
        <button
          onClick={onProfileClick}
          className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200/80 hover:shadow-sm transition-all duration-200 group text-left"
        >
          <Avatar user={user} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user?.name || '—'}</p>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-bold border mt-0.5 ${roleStyle.badge}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${roleStyle.dot} animate-pulse`} />
              {roleStyle.label}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </button>
      )}
    </div>
  </div>
);

/* ─── Main Layout ─────────────────────────────────────── */
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [mobileOpen,       setMobileOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifOpen,        setNotifOpen]        = useState(false);
  const [profileOpen,      setProfileOpen]      = useState(false);
  const [searchOpen,       setSearchOpen]       = useState(false);
  const [unread,           setUnread]           = useState(3);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const searchRef  = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setSearchOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close mobile menu on route change + page scroll to top
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut: Cmd/Ctrl+K → focus search
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const filteredGroups = NAV_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(item => !item.roles || (user && item.roles.includes(user.role))),
  })).filter(g => g.items.length > 0);

  const roleStyle  = ROLE_STYLES[user?.role] || ROLE_STYLES.employee;
  const currentPage = NAV_GROUPS.flatMap(g => g.items).find(i =>
    i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path)
  );

  const sidebarProps = {
    user, collapsed: sidebarCollapsed, roleStyle, filteredGroups,
    onProfileClick: () => { setProfileOpen(true); setNotifOpen(false); },
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-slate-100 shadow-sidebar flex-shrink-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-[68px]' : 'w-64'}`}>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile Overlay + Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 w-72 bg-white h-full shadow-2xl flex flex-col animate-slide-in-left">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent {...{ ...sidebarProps, collapsed: false }} />
          </div>
        </div>
      )}

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Topbar ── */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between bg-white border-b border-slate-100 px-4 md:px-6 gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all md:hidden flex-shrink-0"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex-shrink-0"
              title={sidebarCollapsed ? 'Expand' : 'Collapse'}
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
              <span className="text-slate-400 font-medium">AssetFlow</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
              <span className="font-bold text-slate-700 truncate">{currentPage?.name || 'Page'}</span>
            </nav>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <LiveClock />

            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all text-sm group"
              >
                <Search className="h-4 w-4 group-hover:text-indigo-500 transition-colors" />
                <span className="text-xs font-medium">Search...</span>
                <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-2xs font-mono rounded-md bg-slate-100 text-slate-400 border border-slate-200">⌘K</kbd>
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-slate-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-500" />
                      <input
                        autoFocus
                        className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                        placeholder="Search assets, people, docs..."
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-2">Quick links</p>
                    {[
                      { icon: Package,   label: 'All Assets',       path: '/assets' },
                      { icon: ArrowLeftRight, label: 'Allocations', path: '/allocations' },
                      { icon: BarChart3, label: 'Reports',          path: '/reports' },
                    ].map(({ icon: I, label, path }) => (
                      <Link key={path} to={path} onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 transition-colors text-sm font-medium">
                        <I className="h-4 w-4 text-slate-400" />
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-2xs font-bold text-white ring-2 ring-white">
                    {unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 w-84 w-[340px] bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                    <div>
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      <span className="ml-2 badge badge-indigo">{unread} new</span>
                    </div>
                    <button onClick={() => setUnread(0)} className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
                    {NOTIFS.map((n, i) => (
                      <button key={n.id}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50 text-left transition-colors group ${i < unread ? 'bg-indigo-50/30' : ''}`}
                      >
                        <div className={`mt-0.5 h-8 w-8 rounded-xl ${n.dot} flex items-center justify-center flex-shrink-0`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${n.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 truncate">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{n.sub}</p>
                        </div>
                        <span className="text-2xs text-slate-400 flex-shrink-0 mt-1">{n.time}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
                    <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                      View all notifications →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                <Avatar user={user} size="sm" />
                <span className="hidden sm:block text-sm font-bold text-slate-700 max-w-[96px] truncate group-hover:text-indigo-700 transition-colors">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-all group-hover:rotate-180 duration-200" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden animate-scale-in">
                  <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center text-base font-extrabold shadow-inner-light flex-shrink-0`}>
                        {user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold truncate">{user?.name}</p>
                        <p className="text-xs text-white/70 truncate max-w-[150px] mt-0.5">{user?.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-2xs font-bold bg-white/20 border border-white/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          {roleStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {[
                      { icon: User,        label: 'My Profile' },
                      { icon: Settings,    label: 'Settings' },
                      { icon: HelpCircle,  label: 'Help & Support' },
                    ].map(({ icon: I, label }) => (
                      <button key={label}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors group">
                        <I className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors group"
                    >
                      <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto bg-slate-50 scrollbar-thin">
          <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8 animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
