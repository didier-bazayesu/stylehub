/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple robust Mock Client + Axios-compatible Wrapper
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import { 
  User, Product, Category, Order, Address, Coupon, Review, 
  Notification, AuditLog, Vendor, Store, OrderStatus, ProductStatus
} from '../types';

// Let's seed initial data if they don't already exist in localStorage.
// This allows the whole system to be fully populated with realistic high-end fashion items!

const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat_outerwear',
    name: 'Outerwear',
    slug: 'outerwear',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&h=400&fit=crop',
    children: [
      { id: 'cat_jackets', name: 'Leather Jackets', slug: 'leather-jackets', parent_id: 'cat_outerwear' },
      { id: 'cat_coats', name: 'Trench Coats', slug: 'trench-coats', parent_id: 'cat_outerwear' },
    ]
  },
  {
    id: 'cat_denim',
    name: 'Denim & Jeans',
    slug: 'denim',
    image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&h=400&fit=crop',
    children: [
      { id: 'cat_vintage_denim', name: 'Vintage Levi\'s', slug: 'vintage-levis', parent_id: 'cat_denim' },
      { id: 'cat_jackets_denim', name: 'Denim Jackets', slug: 'denim-jackets', parent_id: 'cat_denim' },
    ]
  },
  {
    id: 'cat_footwear',
    name: 'Footwear & Boots',
    slug: 'footwear',
    image_url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=400&h=400&fit=crop',
    children: [
      { id: 'cat_combat_boots', name: 'Combat Boots', slug: 'combat-boots', parent_id: 'cat_footwear' },
      { id: 'cat_sneakers', name: 'Retro Sneakers', slug: 'retro-sneakers', parent_id: 'cat_footwear' },
    ]
  }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prd_leather_jacket_90s',
    vendor_id: 'vnd_retro_threads',
    category_id: 'cat_jackets',
    name: '90s Oversized Heavy Leather Bomber',
    slug: '90s-heavy-leather-bomber',
    description: 'Perfectly broken-in heritage grade black cowhide leather jacket. Heavyweight profile with brass zippers, ribbed cuffs, and custom nylon lining. Found in Portland, Oregon.',
    base_price: 245.00,
    status: 'ACTIVE',
    is_featured: true,
    total_stock: 4,
    avg_rating: 4.9,
    review_count: 12,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img_lj1', product_id: 'prd_leather_jacket_90s', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&h=800&fit=crop', is_primary: true, display_order: 1 },
      { id: 'img_lj2', product_id: 'prd_leather_jacket_90s', url: 'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?q=80&w=600&h=800&fit=crop', is_primary: false, display_order: 2 }
    ],
    variants: [
      { id: 'vrt_lj_m', product_id: 'prd_leather_jacket_90s', sku: 'VRT-LJ-BLK-M', size: 'M', color: 'Vintage Black', price: 245.00, stock: 2 },
      { id: 'vrt_lj_l', product_id: 'prd_leather_jacket_90s', sku: 'VRT-LJ-BLK-L', size: 'L', color: 'Vintage Black', price: 245.00, stock: 2 }
    ]
  },
  {
    id: 'prd_levis_501_vintage',
    vendor_id: 'vnd_retro_threads',
    category_id: 'cat_vintage_denim',
    name: 'Vintage Levi\'s 501 Original Fit Jeans',
    slug: 'vintage-levis-501-original',
    description: 'Genuine vintage USA-made Levi\'s 501 jeans in a beautifully faded medium wash. Red tab, single stitch elements, natural whisker distressing at thighs.',
    base_price: 110.00,
    status: 'ACTIVE',
    is_featured: true,
    total_stock: 5,
    avg_rating: 4.7,
    review_count: 8,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img_lvn1', product_id: 'prd_levis_501_vintage', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600&h=800&fit=crop', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'vrt_lv_30', product_id: 'prd_levis_501_vintage', sku: 'VRT-501-M30', size: 'W30 L32', color: 'Faded Indigo', price: 110.00, stock: 2 },
      { id: 'vrt_lv_32', product_id: 'prd_levis_501_vintage', sku: 'VRT-501-M32', size: 'W32 L32', color: 'Faded Indigo', price: 110.00, stock: 3 }
    ]
  },
  {
    id: 'prd_military_combat_boots',
    vendor_id: 'vnd_retro_threads',
    category_id: 'cat_combat_boots',
    name: 'Stealth Black 8-Eye Combat Boots',
    slug: 'stealth-black-combat-boots',
    description: 'High-polish premium matte black leather combat boots with Goodyear welt construction, oil-resistant lug soles, and gunmetal steel eyelets.',
    base_price: 185.00,
    status: 'ACTIVE',
    is_featured: false,
    total_stock: 12,
    avg_rating: 4.6,
    review_count: 4,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img_bt1', product_id: 'prd_military_combat_boots', url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&h=800&fit=crop', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'vrt_bt_9', product_id: 'prd_military_combat_boots', sku: 'VRT-BT-BLK-09', size: 'US 9', color: 'Matte Black', price: 185.00, stock: 4 },
      { id: 'vrt_bt_10', product_id: 'prd_military_combat_boots', sku: 'VRT-BT-BLK-10', size: 'US 10', color: 'Matte Black', price: 185.00, stock: 5 },
      { id: 'vrt_bt_11', product_id: 'prd_military_combat_boots', sku: 'VRT-BT-BLK-11', size: 'US 11', color: 'Matte Black', price: 185.00, stock: 3 }
    ]
  },
  {
    id: 'prd_vintage_denim_jacket',
    vendor_id: 'vnd_retro_threads',
    category_id: 'cat_jackets_denim',
    name: 'Classic Trucker Denim Jacket',
    slug: 'classic-trucker-denim-jacket',
    description: 'Authentic medium-wash distressed trucker jacket featuring metallic buttons, point collar, chest button-flap pockets, and adjustable waist tabs.',
    base_price: 95.00,
    status: 'ACTIVE',
    is_featured: false,
    total_stock: 3,
    avg_rating: 4.8,
    review_count: 6,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    images: [
      { id: 'img_dj1', product_id: 'prd_vintage_denim_jacket', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=600&h=800&fit=crop', is_primary: true, display_order: 1 }
    ],
    variants: [
      { id: 'vrt_dj_m', product_id: 'prd_vintage_denim_jacket', sku: 'VRT-DJ-M', size: 'M', color: 'Medium Wash', price: 95.00, stock: 1 },
      { id: 'vrt_dj_l', product_id: 'prd_vintage_denim_jacket', sku: 'VRT-DJ-L', size: 'L', color: 'Medium Wash', price: 95.00, stock: 2 }
    ]
  }
];

const SEED_USERS: User[] = [
  { id: 'usr_customer', email: 'customer@stylehub.com', first_name: 'Jessica', last_name: 'Miller', phone: '+1 (555) 732-8491', role: 'CUSTOMER', is_verified: true, is_active: true, created_at: new Date().toISOString() },
  { id: 'usr_vendor', email: 'vendor@stylehub.com', first_name: 'Marcos', last_name: 'Chen', phone: '+1 (555) 912-3456', role: 'VENDOR', is_verified: true, is_active: true, created_at: new Date().toISOString() },
  { id: 'usr_admin', email: 'admin@stylehub.com', first_name: 'Arthur', last_name: 'Pendragon', role: 'ADMIN', is_verified: true, is_active: true, created_at: new Date().toISOString() }
];

const SEED_VENDORS = [
  { id: 'vnd_retro_threads', user_id: 'usr_vendor', status: 'APPROVED', business_name: 'Studio Retro Threads', business_email: 'retro.threads@stylehub.com', description: 'Handpicked curation of premium 90s vintage clothing.', created_at: new Date().toISOString() }
];

const SEED_STORES = [
  { id: 'str_retro_threads', vendor_id: 'vnd_retro_threads', name: 'Retro Threads', slug: 'retro-threads', logo_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=200&h=200&fit=crop', banner_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop', description: 'Curating the finest genuine vintage garments', is_active: true, created_at: new Date().toISOString() }
];

const SEED_COUPONS: Coupon[] = [
  { id: 'cp_welcome10', code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order: 50, uses_count: 22, is_active: true },
  { id: 'cp_retro50', code: 'RETRO50', discount_type: 'fixed', discount_value: 50, min_order: 200, uses_count: 5, is_active: true }
];

const SEED_ADDRESSES: Address[] = [
  { id: 'adr_1', user_id: 'usr_customer', full_name: 'Jessica Miller', phone: '+1 (555) 732-8491', line1: '402 Vintage Lane', line2: 'Apt 4B', city: 'Portland', state: 'OR', postal_code: '97201', country: 'United States', is_default: true }
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: 'not_1', user_id: 'usr_customer', type: 'SYSTEM', title: 'Welcome to StyleHub', message: 'Browse premium apparel from multiple vendors with secure checkout!', is_read: false, created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'not_2', user_id: 'usr_vendor', type: 'SYSTEM', title: 'Account Approved', message: 'Your store is active, start uploading your beautiful catalog items.', is_read: false, created_at: new Date(Date.now() - 100 * 60 * 1000).toISOString() },
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud_1', user_id: 'usr_admin', action: 'APPROVE_VENDOR', entity: 'Vendor', entity_id: 'vnd_retro_threads', new_value: { status: 'APPROVED' }, ip_address: '127.0.0.1', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }
];

// Seed Helper
function initializeLocalStorage() {
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.USERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.VENDORS)) {
    localStorage.setItem('stylehub_vendors', JSON.stringify(SEED_VENDORS));
  }
  if (!localStorage.getItem('stylehub_stores')) {
    localStorage.setItem('stylehub_stores', JSON.stringify(SEED_STORES));
  }
  if (!localStorage.getItem('stylehub_categories')) {
    localStorage.setItem('stylehub_categories', JSON.stringify(SEED_CATEGORIES));
  }
  if (!localStorage.getItem('stylehub_coupons')) {
    localStorage.setItem('stylehub_coupons', JSON.stringify(SEED_COUPONS));
  }
  if (!localStorage.getItem('stylehub_addresses')) {
    localStorage.setItem('stylehub_addresses', JSON.stringify(SEED_ADDRESSES));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem('stylehub_audit_logs')) {
    localStorage.setItem('stylehub_audit_logs', JSON.stringify(SEED_AUDIT_LOGS));
  }
}

// Ensure seeded
initializeLocalStorage();

// Database Accessors (emulates Firestore or SQL collections)
const getCollection = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCollection = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Response Type wrapper
export interface APIResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

// Custom mock response delay
const delayResponse = <T>(data: T, delay = 200): Promise<APIResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data,
      });
    }, delay);
  });
};

const delayFail = (code: string, message: string, delay = 200): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject({
        response: {
          status: 400,
          data: {
            success: false,
            error: { code, message }
          }
        }
      });
    }, delay);
  });
};

// Main API client
export const client = {
  get: async <T>(url: string): Promise<APIResponse<T>> => {
    console.log('[API GET]', url);
    const users = getCollection<User>(LOCAL_STORAGE_KEYS.USERS);
    const products = getCollection<Product>(LOCAL_STORAGE_KEYS.PRODUCTS).filter(p => !p.created_at.includes('stale_deleted')); // Soft delete mock
    const categories = getCollection<Category>('stylehub_categories');
    const vendors = getCollection<any>('stylehub_vendors');
    const stores = getCollection<any>('stylehub_stores');
    const orders = getCollection<Order>(LOCAL_STORAGE_KEYS.ORDERS);
    const notifications = getCollection<Notification>(LOCAL_STORAGE_KEYS.NOTIFICATIONS);
    const coupons = getCollection<Coupon>('stylehub_coupons');
    
    // Auth Profile
    if (url === '/auth/me') {
      return delayResponse<any>(null); // State managed by store
    }
    
    // Categories
    if (url === '/categories') {
      return delayResponse<any>(categories);
    }
    
    // Products
    if (url === '/products' || url.startsWith('/products?')) {
      return delayResponse<any>(products);
    }
    if (url === '/products/featured') {
      return delayResponse<any>(products.filter(p => p.is_featured));
    }
    if (url.startsWith('/products/')) {
      const slug = url.split('/').pop()?.split('?')[0];
      const prod = products.find(p => p.slug === slug || p.id === slug);
      if (prod) return delayResponse<any>(prod);
      return delayFail('PRODUCT_NOT_FOUND', 'This fashion piece was not found.');
    }

    // Stores / Vendors
    if (url.startsWith('/stores/')) {
      const parts = url.split('/');
      const slugOrId = parts[2]?.split('?')[0];
      const isProductsReq = parts[3]?.startsWith('products');
      
      const store = stores.find(s => s.slug === slugOrId || s.id === slugOrId);
      if (store) {
        if (isProductsReq) {
          const storeProducts = products.filter(p => p.vendor_id === store.vendor_id);
          return delayResponse<any>(storeProducts);
        }
        return delayResponse<any>(store);
      }
      return delayFail('STORE_NOT_FOUND', 'Target apparel boutique not found');
    }

    if (url === '/vendors/me') {
      const vnd = vendors[0]; // Active vendor mockup
      return delayResponse<any>(vnd);
    }
    if (url === '/vendors/me/stats') {
      const stats = {
        total_revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: orders.length,
        products: products.length,
        customers: 14 // Simulated count
      };
      return delayResponse<any>(stats);
    }

    // Address list
    if (url === '/users/addresses' || url === '/addresses') {
      const adr = getCollection<Address>('stylehub_addresses');
      return delayResponse<any>(adr);
    }

    // Order List
    if (url === '/orders') {
      return delayResponse<any>(orders);
    }
    if (url === '/orders/vendor') {
      return delayResponse<any>(orders);
    }
    if (url.startsWith('/orders/')) {
      const id = url.split('/').pop();
      const order = orders.find(o => o.id === id);
      if (order) return delayResponse<any>(order);
      return delayFail('ORDER_NOT_FOUND', 'Transaction history record not found.');
    }

    // Analytics Dashboard
    if (url.startsWith('/analytics/vendor')) {
      const overview = {
        revenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
        orders: orders.length,
        units_sold: orders.reduce((sum, o) => sum + o.items.reduce((acc, currentItem) => acc + currentItem.quantity, 0), 0)
      };
      return delayResponse<any>(overview);
    }

    // Notifications List
    if (url === '/notifications') {
      return delayResponse<any>(notifications);
    }

    // Admin Specific Lists
    if (url === '/admin/users' || url.startsWith('/api/admin/users')) {
      return delayResponse<any>(users);
    }
    if (url === '/admin/vendors') {
      return delayResponse<any>(vendors);
    }
    if (url === '/admin/products') {
      return delayResponse<any>(products);
    }
    if (url === '/admin/orders') {
      return delayResponse<any>(orders);
    }
    if (url === '/admin/coupons') {
      return delayResponse<any>(coupons);
    }
    if (url === '/admin/audit-logs') {
      const logs = getCollection<AuditLog>('stylehub_audit_logs');
      return delayResponse<any>(logs);
    }

    // Fallback Mock items or default empty success
    return delayResponse<any>({} as any);
  },

  post: async <T>(url: string, body: any): Promise<APIResponse<T>> => {
    console.log('[API POST]', url, body);
    
    // Auth Registration and Login simulation
    if (url === '/auth/login' || url === '/api/auth/login') {
      const users = getCollection<User>(LOCAL_STORAGE_KEYS.USERS);
      const user = users.find(u => u.email === body.email);
      if (user) {
        let vendor = null;
        let store = null;
        if (user.role === 'VENDOR') {
          vendor = getCollection<Vendor>('stylehub_vendors')[0] || null;
          store = getCollection<Store>('stylehub_stores')[0] || null;
        }
        return delayResponse<any>({
          access_token: 'dummy_jwt_access_token',
          user,
          vendor,
          store
        });
      }
      return delayFail('INVALID_CREDENTIALS', 'Email or password combination is incorrect');
    }

    if (url === '/auth/register') {
      const users = getCollection<User>(LOCAL_STORAGE_KEYS.USERS);
      if (users.find(u => u.email === body.email)) {
        return delayFail('EMAIL_ALREADY_EXISTS', 'A brand profile already exists with this email.');
      }
      const newUser: User = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone || '',
        role: 'CUSTOMER',
        is_verified: true,
        is_active: true,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      saveCollection(LOCAL_STORAGE_KEYS.USERS, users);
      return delayResponse<any>({ user: newUser, access_token: 'dummy_jwt_access_token' });
    }

    // Vendor Application
    if (url === '/vendors/apply') {
      const newVendor: Vendor = {
        id: `vnd_${Math.random().toString(36).substring(2, 9)}`,
        user_id: 'usr_customer', // Apply current mock customer
        status: 'PENDING',
        business_name: body.business_name,
        business_email: body.business_email,
        description: body.description,
        created_at: new Date().toISOString()
      };
      const vendors = getCollection<any>('stylehub_vendors');
      vendors.push(newVendor);
      saveCollection('stylehub_vendors', vendors);
      return delayResponse<any>(newVendor);
    }

    // Add Address
    if (url === '/addresses' || url === '/users/addresses') {
      const adrList = getCollection<Address>('stylehub_addresses');
      const newAddress: Address = {
        id: `adr_${Math.random().toString(36).substring(2, 9)}`,
        user_id: 'usr_customer',
        full_name: body.full_name,
        phone: body.phone,
        line1: body.line1,
        line2: body.line2 || '',
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country,
        is_default: !!body.is_default
      };
      
      if (newAddress.is_default) {
        adrList.forEach(a => a.is_default = false);
      }
      adrList.push(newAddress);
      saveCollection('stylehub_addresses', adrList);
      return delayResponse<any>(newAddress);
    }

    // Create Order Product
    if (url === '/orders') {
      const orders = getCollection<Order>(LOCAL_STORAGE_KEYS.ORDERS);
      const newOrder: Order = {
        id: `ord_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        user_id: 'usr_customer',
        address_id: body.address_id || 'adr_1',
        status: 'PENDING',
        subtotal: body.subtotal || 245.00,
        shipping_cost: body.shipping_cost || 0,
        discount: body.discount || 0,
        total: body.total || 245.00,
        coupon_code: body.coupon_code || '',
        items: body.items || [],
        notes: body.notes || '',
        created_at: new Date().toISOString()
      };
      orders.push(newOrder);
      saveCollection(LOCAL_STORAGE_KEYS.ORDERS, orders);
      
      // Clear local cart
      localStorage.removeItem('stylehub_cart_items');
      return delayResponse<any>(newOrder);
    }

    // Create Product (Vendor upload)
    if (url === '/products') {
      const products = getCollection<Product>(LOCAL_STORAGE_KEYS.PRODUCTS);
      const newProduct: Product = {
        id: `prd_${Math.random().toString(36).substring(2, 9)}`,
        vendor_id: 'vnd_retro_threads',
        category_id: body.category_id || 'cat_jackets',
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/ /g, '-'),
        description: body.description,
        base_price: Number(body.base_price) || 89.00,
        status: 'DRAFT', // Default state
        is_featured: false,
        total_stock: Number(body.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)) || 10,
        avg_rating: 5.0,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        images: [
          { 
            id: `img_${Math.random().toString(36).substring(2, 5)}`, 
            product_id: '', 
            url: body.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&h=650&fit=crop', 
            is_primary: true, 
            display_order: 1 
          }
        ],
        variants: body.variants?.map((v: any) => ({
          ...v,
          id: v.id || `vrt_${Math.random().toString(36).substring(2, 5)}`,
          price: Number(v.price) || Number(body.base_price)
        })) || []
      };
      products.unshift(newProduct);
      saveCollection(LOCAL_STORAGE_KEYS.PRODUCTS, products);
      return delayResponse<any>(newProduct);
    }

    // Create Coupon (Admin action)
    if (url === '/admin/coupons' || url === '/coupons') {
      const coupons = getCollection<Coupon>('stylehub_coupons');
      const newCoupon: Coupon = {
        id: `cp_${Math.random().toString(36).substring(2, 7)}`,
        code: body.code.toUpperCase(),
        discount_type: body.discount_type,
        discount_value: Number(body.discount_value),
        min_order: Number(body.min_order) || 0,
        max_uses: Number(body.max_uses) || 100,
        uses_count: 0,
        is_active: true
      };
      coupons.push(newCoupon);
      saveCollection('stylehub_coupons', coupons);
      return delayResponse<any>(newCoupon);
    }

    return delayResponse<any>({} as any);
  },

  patch: async <T>(url: string, body: any): Promise<APIResponse<T>> => {
    console.log('[API PATCH]', url, body);
    
    // Update profile
    if (url === '/users/profile') {
      const users = getCollection<User>(LOCAL_STORAGE_KEYS.USERS);
      const userIdx = users.findIndex(u => u.id === 'usr_customer');
      if (userIdx > -1) {
        users[userIdx] = { ...users[userIdx], ...body };
        saveCollection(LOCAL_STORAGE_KEYS.USERS, users);
        return delayResponse<any>(users[userIdx]);
      }
    }

    if (url.startsWith('/addresses/')) {
      const id = url.split('/').pop();
      const adrList = getCollection<Address>('stylehub_addresses');
      const idx = adrList.findIndex(a => a.id === id);
      if (idx > -1) {
        adrList[idx] = { ...adrList[idx], ...body };
        if (body.is_default) {
          adrList.forEach((a, i) => { if (i !== idx) a.is_default = false; });
        }
        saveCollection('stylehub_addresses', adrList);
        return delayResponse<any>(adrList[idx]);
      }
    }

    // Update Product Info (Vendor edit)
    if (url.startsWith('/products/')) {
      const id = url.split('/').pop()?.split('/')[0];
      const products = getCollection<Product>(LOCAL_STORAGE_KEYS.PRODUCTS);
      const idx = products.findIndex(p => p.id === id);
      if (idx > -1) {
        // Toggle state or parameters
        const updated = { ...products[idx], ...body, updated_at: new Date().toISOString() };
        products[idx] = updated;
        saveCollection(LOCAL_STORAGE_KEYS.PRODUCTS, products);
        return delayResponse<any>(products[idx]);
      }
    }

    // Update Order Status (Vendor or Admin panel)
    if (url.startsWith('/orders/')) {
      const parts = url.split('/');
      const id = parts[2];
      const orders = getCollection<Order>(LOCAL_STORAGE_KEYS.ORDERS);
      const idx = orders.findIndex(o => o.id === id);
      if (idx > -1) {
        orders[idx].status = body.status;
        saveCollection(LOCAL_STORAGE_KEYS.ORDERS, orders);
        return delayResponse<any>(orders[idx]);
      }
    }

    // Approve / Reject Vendors (Admin panel)
    if (url.startsWith('/admin/vendors/')) {
      const parts = url.split('/');
      const id = parts[3];
      const action = parts[4]; // approve, reject, suspend
      const vendors = getCollection<Vendor>('stylehub_vendors');
      const idx = vendors.findIndex(v => v.id === id);
      if (idx > -1) {
        if (action === 'approve') vendors[idx].status = 'APPROVED';
        if (action === 'reject') {
          vendors[idx].status = 'REJECTED';
          vendors[idx].rejection_reason = body.reason || 'Does not meet visual style guidelines';
        }
        if (action === 'suspend') vendors[idx].status = 'SUSPENDED';
        
        saveCollection('stylehub_vendors', vendors);
        return delayResponse<any>(vendors[idx]);
      }
    }

    // Activate/deactivate Users
    if (url.startsWith('/admin/users/')) {
      const id = url.split('/')[3];
      const users = getCollection<User>(LOCAL_STORAGE_KEYS.USERS);
      const idx = users.findIndex(u => u.id === id);
      if (idx > -1) {
        users[idx].is_active = body.status ?? !users[idx].is_active;
        saveCollection(LOCAL_STORAGE_KEYS.USERS, users);
        return delayResponse<any>(users[idx]);
      }
    }

    return delayResponse<any>({} as any);
  },

  delete: async <T>(url: string): Promise<APIResponse<T>> => {
    console.log('[API DELETE]', url);
    
    if (url.startsWith('/addresses/')) {
      const id = url.split('/').pop();
      const list = getCollection<Address>('stylehub_addresses');
      const filtered = list.filter(a => a.id !== id);
      saveCollection('stylehub_addresses', filtered);
      return delayResponse<any>({} as any);
    }

    if (url.startsWith('/products/')) {
      const id = url.split('/').pop();
      const list = getCollection<Product>(LOCAL_STORAGE_KEYS.PRODUCTS);
      // Soft deletion mock: append tag so it filters out of catalogs
      const idx = list.findIndex(p => p.id === id);
      if (idx > -1) {
        list[idx].created_at = 'stale_deleted';
        saveCollection(LOCAL_STORAGE_KEYS.PRODUCTS, list);
      }
      return delayResponse<any>({} as any);
    }

    if (url.startsWith('/coupons/')) {
      const id = url.split('/').pop();
      const list = getCollection<Coupon>('stylehub_coupons');
      const filtered = list.filter(c => c.id !== id);
      saveCollection('stylehub_coupons', filtered);
      return delayResponse<any>({} as any);
    }

    return delayResponse<any>({} as any);
  }
};
