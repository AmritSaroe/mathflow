import { motion } from 'framer-motion'

function HomeIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active
        ? <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
        : <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round"/>
      }
    </svg>
  )
}

function SettingsIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m19 13.6 1.2 1-.1 1.8-1.7 1.1-1.8-.7-.7 1.1.3 1.9-1.5.9-1.7-.8-.9-1.1-1.3.1-1.4 1.3-1.7-.5-.4-1.9-1.3-.8-1.7.3-1.4-1.4.7-1.8-.8-1.1-1.9-.1-.6-1.6 1.2-1.4-.1-1.3-1.3-1.2.5-1.8 1.8-.5 1.1-.9-.2-1.9 1.6-.8 1.5 1.1 1.3-.1.8-1.7 1.8-.2 1 1.7 1.2.5 1.6-.9 1.5 1.1-.4 1.8.9 1 1.8-.2 1 1.6-.9 1.6.3 1.2 1.7.8-.1 1.8Z" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
    </svg>
  )
}

function StatsIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {active ? (
        <>
          <rect x="3"  y="12" width="4" height="9" rx="1" fill="currentColor"/>
          <rect x="10" y="7"  width="4" height="14" rx="1" fill="currentColor"/>
          <rect x="17" y="3"  width="4" height="18" rx="1" fill="currentColor"/>
        </>
      ) : (
        <>
          <rect x="3"  y="12" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.7"/>
          <rect x="10" y="7"  width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.7"/>
          <rect x="17" y="3"  width="4" height="18" rx="1" stroke="currentColor" strokeWidth="1.7"/>
        </>
      )}
    </svg>
  )
}

const TABS = [
  { key: 'home',  label: 'Home',  Icon: HomeIcon },
  { key: 'stats', label: 'Stats', Icon: StatsIcon },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon },
]

/**
 * M3 Navigation Bar — 3 destinations, 80dp height.
 * Active indicator: pill shape behind icon (64×32dp), primary color.
 * Label always visible. Spring-animated sliding pill via Framer Motion layoutId.
 */
export default function NavBar({ active, onChange }) {
  return (
    <nav
      style={{
        display: 'flex',
        height: 80,
        flexShrink: 0,
        background: 'var(--md-sys-color-surface-container)',
        borderTop: '1px solid var(--md-sys-color-outline-variant)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Main navigation"
    >
      {TABS.map(({ key, label, Icon }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive
                ? 'var(--md-sys-color-on-secondary-container)'
                : 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {/* Icon with pill active indicator */}
            <div style={{ position: 'relative', width: 64, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 16,
                    background: 'var(--md-sys-color-secondary-container)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon active={isActive} />
              </span>
            </div>

            {/* Label */}
            <span
              className="md-label-medium"
              style={{
                color: 'inherit',
                fontWeight: isActive ? 700 : 500,
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
