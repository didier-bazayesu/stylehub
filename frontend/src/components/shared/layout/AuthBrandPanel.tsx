// src/components/shared/layout/AuthBrandPanel.tsx

import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/constants'

interface AuthBrandPanelProps {
  quote?: string
  subtext?: string
}

export function AuthBrandPanel({
  quote = 'Fashion that tells your story.',
  subtext = 'Discover curated pieces from independent designers and boutique stores — all in one place.',
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gray-950 p-12 lg:flex">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#3b3b3b_0%,_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#1a1a1a_0%,_transparent_70%)]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Logo */}
      <Link to={ROUTES.HOME} className="relative text-2xl font-bold tracking-tight text-white">
        Style<span className="text-gray-500">Hub</span>
      </Link>

      {/* Center quote */}
      <div className="relative">
        <p className="font-display text-4xl font-bold leading-tight text-white">
          {quote.split('\n').map((line, i) => (
            <span key={i}>
              {i === 0 ? (
                line
              ) : (
                <>
                  <br />
                  <span className="text-gray-400">{line}</span>
                </>
              )}
            </span>
          ))}
        </p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">{subtext}</p>
      </div>

      {/* Bottom stats */}
      <div className="relative flex gap-8">
        {[
          { value: '2,400+', label: 'Independent stores' },
          { value: '180K+', label: 'Products' },
          { value: '4.9★', label: 'Avg. rating' },
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
