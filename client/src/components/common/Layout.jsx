import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Package,
  ArrowLeftRight,
  CalendarRange,
  Wrench,
  ClipboardCheck,
  BarChart3,
  Bell,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Org Setup', path: '/organization', icon: Building2, roles: ['admin'] },
    { name: 'Assets', path: '/assets', icon: Package },
    { name: 'Allocation', path: '/allocations', icon: ArrowLeftRight },
    { name: 'Booking', path: '/bookings', icon: CalendarRange },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Audit', path: '/audits', icon: ClipboardCheck },
    { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'asset_manager', 'department_head'] },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50';
      case 'asset_manager':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50';
      case 'department_head':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  const formattedRole = (role) => {
    if (!role) return '';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800/80">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-slate-800/80">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-600/20">
              AF
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">AssetFlow</span>
          </Link>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile footer in sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
                {user?.name || 'Loading...'}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-2xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                {formattedRole(user?.role)}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/50 backdrop-blur-sm">
          <div className="relative flex w-full max-w-xs flex-col bg-white dark:bg-slate-950 p-6 animate-in slide-in-from-left duration-200">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 pb-6 border-b border-slate-200 dark:border-slate-800/80 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
                AF
              </div>
              <span className="text-xl font-bold tracking-tight">AssetFlow</span>
            </div>

            <nav className="flex-1 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/60'
                      }`
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold truncate">{user?.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {formattedRole(user?.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center space-x-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 shrink-0 items-center justify-between bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb Placeholder or Screen Title */}
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 hidden md:block">
              Enterprise Dashboard
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications Alert Bell (Placeholder for now) */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 transition-all">
              <Bell className="h-4 w-4" />
              {/* Badge */}
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            </button>

            {/* Logout button (Desktop) */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* View Router Outlet / children */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
