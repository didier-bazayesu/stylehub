import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', to: ROUTES.PRODUCTS },
    { label: 'New Arrivals', to: `${ROUTES.PRODUCTS}?sort=newest` },
    { label: 'Featured', to: `${ROUTES.PRODUCTS}?is_featured=true` },
  ],
  Account: [
    { label: 'My Orders', to: ROUTES.CUSTOMER.ORDERS },
    { label: 'Wishlist', to: ROUTES.CUSTOMER.WISHLIST },
    { label: 'Profile', to: ROUTES.CUSTOMER.PROFILE },
  ],
  Sell: [
    { label: 'Become a Vendor', to: ROUTES.VENDOR_APPLY },
    { label: 'Vendor Dashboard', to: ROUTES.VENDOR.DASHBOARD },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              to={ROUTES.HOME}
              className="text-lg font-bold tracking-tight text-gray-900 dark:text-white"
            >
              Style<span className="text-gray-400">Hub</span>
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Curated fashion from independent designers, delivered worldwide.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {section}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map(({ label, to }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row dark:border-gray-800">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} StyleHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
