/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { useCartStore } from '../../../store/useCartStore';
import { useUIStore } from '../../../store/useUIStore';
import { formatCurrency } from '../../../lib/formatters';
import { ROUTES } from '../../../config/routes';
import { cn } from '../../../lib/cn';
import { Role } from '../../../types';
import { 
  ShoppingBag, Search, User as UserIcon, Heart, Bell, LogOut, 
  Menu, X, Sparkles, Store, Settings, Package, Percent, 
  ListOrdered, Users, ArrowRight, ShieldCheck, Clipboard
} from 'lucide-react';
import { Button, Avatar, Badge } from '../../ui';

// ==========================================
// 1. NAVBAR
// ==========================================
export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartItems = useCartStore((s) => s.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistProductIds = useUIStore((s) => s.wishlistProductIds);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = useUIStore((s) => s.toasts); // Using active toasts/mock alerts

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/95 backdrop-blur-md" id="app-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black text-lg tracking-tighter">S</div>
          <span className="font-sans font-bold text-lg tracking-tight text-neutral-900">StyleHub</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
          <InputWrapper icon={<Search className="w-4 h-4 text-neutral-400" />}>
            <input
              type="text"
              placeholder="Search vintage leather, denim trucker jackets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 h-10 pl-10 pr-4 rounded-xl border border-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
            />
          </InputWrapper>
        </form>

        {/* Global Catalog Navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-neutral-500">
          <Link to={ROUTES.PRODUCTS} className={location.pathname === ROUTES.PRODUCTS ? 'text-neutral-900' : 'hover:text-neutral-900 transition-colors'}>Design catalog</Link>
          <Link to={`${ROUTES.PRODUCTS}?category=cat_outerwear`} className="hover:text-neutral-900 transition-colors">Outerwear</Link>
          <Link to={`${ROUTES.PRODUCTS}?category=cat_denim`} className="hover:text-neutral-900 transition-colors">Denim</Link>
        </nav>

        {/* Actions Menu */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <Link to={ROUTES.CUSTOMER_WISHLIST} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors relative" title="Wishlist">
            <Heart className="w-5.5 h-5.5" />
            {wishlistProductIds.length > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 w-5 h-5 flex p-0 items-center justify-center text-[10px] skeleton-badge">
                {wishlistProductIds.length}
              </Badge>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to={ROUTES.CART} className="p-2 text-neutral-500 hover:text-neutral-900 transition-colors relative mr-1" title="Shopping Cart">
            <ShoppingBag className="w-5.5 h-5.5" />
            {cartCount > 0 && (
              <Badge variant="default" className="absolute -top-1 -right-1 w-5 h-5 flex p-0 items-center justify-center text-[10px] bg-neutral-900 text-white">
                {cartCount}
              </Badge>
            )}
          </Link>

          {/* User Auth Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 focus:outline-none py-1 cursor-pointer">
                <Avatar fallback={`${user.first_name} ${user.last_name}`} size="sm" src={user.avatar_url} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-neutral-100 bg-white p-2 shadow-lg z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-neutral-50">
                    <p className="text-xs font-semibold text-neutral-500">Account Role: {user.role}</p>
                    <p className="text-sm font-bold text-neutral-800 line-clamp-1">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-neutral-400 line-clamp-1">{user.email}</p>
                  </div>
                  <div className="py-1">
                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link to={ROUTES.CUSTOMER_ORDERS} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg">
                          <ListOrdered className="w-4 h-4" /> My Orders
                        </Link>
                        <Link to={ROUTES.CUSTOMER_PROFILE} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg">
                          <UserIcon className="w-4 h-4" /> Edit Profile
                        </Link>
                      </>
                    )}
                    {user.role === 'VENDOR' && (
                      <Link to={ROUTES.VENDOR_DASHBOARD} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg">
                        <Store className="w-4 h-4" /> Vendor Dashboard
                      </Link>
                    )}
                    {user.role === 'ADMIN' && (
                      <Link to={ROUTES.ADMIN_DASHBOARD} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg">
                        <ShieldCheck className="w-4 h-4" /> Admin Console
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-neutral-50 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate(ROUTES.HOME);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.LOGIN)}>Sign In</Button>
              <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)}>Register</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Input Wrapper utility inside nav
const InputWrapper: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
  <div className="relative w-full flex items-center">
    <div className="absolute left-3.5 flex items-center pointer-events-none">{icon}</div>
    {children}
  </div>
);

// ==========================================
// 2. FOOTER
// ==========================================
export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-400 py-12 border-t border-neutral-800" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-neutral-900 font-extrabold text-lg">S</div>
            <span className="font-sans font-bold text-lg tracking-tight text-white">StyleHub</span>
          </div>
          <p className="text-xs leading-relaxed max-w-sm text-neutral-400">
            A premium full-stack multi-vendor apparel platform enabling designers, boutiques, and consumers to discover bespoke collection pieces.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">Boutique Catalog</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li><Link to={`${ROUTES.PRODUCTS}?category=cat_outerwear`} className="hover:text-white">Leather Jackets</Link></li>
            <li><Link to={`${ROUTES.PRODUCTS}?category=cat_denim`} className="hover:text-white">Classic Denim</Link></li>
            <li><Link to={`${ROUTES.PRODUCTS}?category=cat_footwear`} className="hover:text-white">Heritage Boots</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 font-mono">My Account</h4>
          <ul className="flex flex-col gap-2 text-xs">
            <li><Link to={ROUTES.LOGIN} className="hover:text-white">Sign In Account</Link></li>
            <li><Link to={ROUTES.REGISTER} className="hover:text-white">Boutique Registration</Link></li>
            <li><Link to={ROUTES.CUSTOMER_ORDERS} className="hover:text-white">Order Track System</Link></li>
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Fashion Letter</h4>
          <p className="text-xs text-neutral-400">Receive flash curation news, discounts, and store drops directly.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-neutral-800 h-9 px-3 rounded-lg text-xs text-white border border-transparent focus:outline-none focus:border-neutral-700"
            />
            <Button size="sm">Join</Button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2026 StyleHub Fashion Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-white">Terms of Use</span>
          <span className="cursor-pointer hover:text-white">Privacy Policy</span>
        </div>
      </div>
    </footer>
  );
};

// ==========================================
// 3. VENDOR SIDEBAR
// ==========================================
export const VendorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useAuthStore((s) => s.store);
  
  const menuItems = [
    { label: 'Overview Dashboard', icon: <Sparkles className="w-4 h-4" />, path: ROUTES.VENDOR_DASHBOARD },
    { label: 'Catalog Products', icon: <Package className="w-4 h-4" />, path: ROUTES.VENDOR_PRODUCTS },
    { label: 'Purchases Orders', icon: <ListOrdered className="w-4 h-4" />, path: ROUTES.VENDOR_ORDERS },
    { label: 'Revenue Analytics', icon: <Percent className="w-4 h-4" />, path: ROUTES.VENDOR_ANALYTICS },
    { label: 'Boutique Settings', icon: <Settings className="w-4 h-4" />, path: ROUTES.VENDOR_STORE_SETTINGS },
  ];

  return (
    <aside className="w-64 border-r border-neutral-100 bg-neutral-50/50 p-4 pt-6 h-screen flex flex-col justify-between" id="vendor-sidebar">
      <div className="flex flex-col gap-6">
        {/* Store Profile card */}
        <div className="p-3 border border-neutral-150 rounded-xl bg-white flex items-center gap-3">
          <Avatar fallback={store?.name || 'V'} src={store?.logo_url} size="sm" />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-neutral-800 line-clamp-1">{store?.name || 'My Boutique'}</h4>
            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm font-semibold border border-amber-100">Approved Boutique</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                  active 
                    ? 'bg-neutral-900 text-white shadow-xs' 
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-neutral-200/60 pt-4 flex flex-col gap-2">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-800 px-3 py-1">➔ Back to Marketplace</Link>
      </div>
    </aside>
  );
};

// ==========================================
// 4. ADMIN SIDEBAR
// ==========================================
export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Control Overview', icon: <Sparkles className="w-4 h-4" />, path: ROUTES.ADMIN_DASHBOARD },
    { label: 'Boutique Request Approvals', icon: <Store className="w-4 h-4" />, path: ROUTES.ADMIN_VENDORS },
    { label: 'Register Users Accounts', icon: <Users className="w-4 h-4" />, path: ROUTES.ADMIN_USERS },
    { label: 'Platform Catalogs', icon: <Package className="w-4 h-4" />, path: ROUTES.ADMIN_PRODUCTS },
    { label: 'System Sales records', icon: <ListOrdered className="w-4 h-4" />, path: ROUTES.ADMIN_ORDERS },
    { label: 'Coupons Management', icon: <Percent className="w-4 h-4" />, path: ROUTES.ADMIN_COUPONS },
    { label: 'Secured Audit Logs', icon: <Clipboard className="w-4 h-4" />, path: ROUTES.ADMIN_AUDIT_LOGS },
  ];

  return (
    <aside className="w-64 border-r border-neutral-100 bg-neutral-900 text-neutral-400 p-4 pt-6 h-screen flex flex-col justify-between" id="admin-sidebar">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-neutral-900 font-extrabold text-md">A</div>
          <span className="font-bold text-white tracking-tight">Admin Console</span>
        </div>

        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                  active 
                    ? 'bg-neutral-800 text-white' 
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-neutral-800 pt-4 flex flex-col gap-2">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white px-3 py-1">➔ Launch Public Store</Link>
      </div>
    </aside>
  );
};

// ==========================================
// 5. CUSTOMER SIDEBAR
// ==========================================
export const CustomerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'My Order History', icon: <ListOrdered className="w-4 h-4" />, path: ROUTES.CUSTOMER_ORDERS },
    { label: 'Saved Wishlist', icon: <Heart className="w-4 h-4" />, path: ROUTES.CUSTOMER_WISHLIST },
    { label: 'Shipping Addresses', icon: <Store className="w-4 h-4" />, path: ROUTES.CUSTOMER_ADDRESSES },
    { label: 'Security Profile', icon: <UserIcon className="w-4 h-4" />, path: ROUTES.CUSTOMER_PROFILE },
    { label: 'System Settings', icon: <Settings className="w-4 h-4" />, path: ROUTES.CUSTOMER_SETTINGS },
  ];

  return (
    <aside className="w-64 border-r border-neutral-100 bg-white p-4 pt-6 h-screen flex flex-col justify-between" id="customer-sidebar">
      <div className="flex flex-col gap-6">
        <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono px-3">buyer settings</h3>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left',
                  active 
                    ? 'bg-neutral-900 text-white shadow-xs' 
                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

// ==========================================
// 6. PROTECTED ROUTE
// ==========================================
export interface ProtectedRouteProps {
  children?: React.ReactElement;
  allowedRoles?: Role[];
  requiredVendorStatus?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requiredVendorStatus }) => {
  const user = useAuthStore((s) => s.user);
  const vendor = useAuthStore((s) => s.vendor);
  const showToast = useUIStore((s) => s.showToast);

  if (!user) {
    // Standard react-router logic
    return <NavigateToLogin />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-neutral-25">
        <div className="font-mono text-xs text-rose-500 mb-2">● UNAUTHORIZED ACCESS</div>
        <h1 className="text-lg font-bold text-neutral-800 mb-4">You lack necessary Role privileges</h1>
        <Button onClick={() => window.location.href = ROUTES.HOME}>Marketplace Main</Button>
      </div>
    );
  }

  // Vendor approvals checks
  if (user.role === 'VENDOR' && vendor && (vendor.status !== 'APPROVED' || (requiredVendorStatus === 'APPROVED' && vendor.status !== 'APPROVED'))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-neutral-25">
        <div className="font-mono text-xs text-amber-500 mb-2">● APPROVAL PENDING</div>
        <h1 className="text-lg font-bold text-neutral-800 mb-2">Your Boutique Profile Under Review</h1>
        <p className="text-xs text-neutral-550 max-w-sm mb-6">Our design team verifies storefront listings within 24 working hours of submission.</p>
        <Button onClick={() => window.location.href = ROUTES.HOME}>Marketplace Main</Button>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

const NavigateToLogin: React.FC = () => {
  React.useEffect(() => {
    window.location.href = ROUTES.LOGIN;
  }, []);
  return null;
};

// ==========================================
// 7. PAGE WRAPPER
// ==========================================
export const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="animate-fade-in w-full min-h-screen flex flex-col pt-0 transition-opacity duration-300">
      {children}
    </div>
  );
};
