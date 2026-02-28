import { useRegisterSW } from 'virtual:pwa-register/react'
import { AnimatePresence, motion } from 'framer-motion'

export default function UpdatePrompt() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0, transition: { ease: [0.2, 0, 0, 1], duration: 0.3 } }}
          exit={{ opacity: 0, y: 32, transition: { ease: [0.3, 0, 1, 1], duration: 0.2 } }}
          style={{
            position: 'fixed',
            bottom: 96,
            left: 16,
            right: 16,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '0 8px 0 16px',
            height: 56,
            borderRadius: 4,
            background: 'var(--md-sys-color-inverse-surface)',
            color: 'var(--md-sys-color-inverse-on-surface)',
            boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span style={{ fontSize: 14, fontFamily: 'Roboto, sans-serif', fontWeight: 400 }}>
            Update available
          </span>
          <button
            className="md-state"
            onClick={() => updateServiceWorker(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--md-sys-color-inverse-primary)',
              fontFamily: 'Roboto, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: '0.1px',
              padding: '0 8px',
              height: 40,
              borderRadius: 20,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Reload
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
