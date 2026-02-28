/**
 * M3-styled numeric keypad.
 * - Digit keys: FilledTonalButton style (secondary-container bg)
 * - OK key:     FilledButton style (primary bg) — prominent
 * - Del key:    surface-variant bg
 * - Minimum 64dp height per key (spec requirement)
 */

const KEYS = ['1','2','3','4','5','6','7','8','9','del','0','submit']

export default function NumPad({ onKey }) {
  return (
    <div
      style={{
        flexShrink: 0,
        padding: '8px 12px 16px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        background: 'var(--md-sys-color-surface-container)',
        touchAction: 'manipulation',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {KEYS.map(k => {
          const isOK  = k === 'submit'
          const isDel = k === 'del'

          const bg = isOK ? 'var(--md-sys-color-primary)'
            : isDel ? 'var(--md-sys-color-surface-variant)'
            : 'var(--md-sys-color-secondary-container)'

          const fg = isOK ? 'var(--md-sys-color-on-primary)'
            : isDel ? 'var(--md-sys-color-on-surface-variant)'
            : 'var(--md-sys-color-on-secondary-container)'

          return (
            <button
              key={k}
              onPointerDown={e => { e.preventDefault(); onKey(k) }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 64, borderRadius: 12,
                background: bg, color: fg,
                border: 'none', cursor: 'pointer',
                fontFamily: isOK ? "'Roboto', sans-serif" : "'DM Mono', monospace",
                fontWeight: isOK ? 500 : 400,
                fontSize: isOK ? 14 : isDel ? 20 : 22,
                letterSpacing: isOK ? '0.1px' : 0,
                userSelect: 'none', WebkitUserSelect: 'none',
                transition: 'transform 100ms, opacity 100ms',
                position: 'relative', overflow: 'hidden',
              }}
              onPointerDownCapture={e => { e.currentTarget.style.transform = 'scale(0.92)'; e.currentTarget.style.opacity = '0.88' }}
              onPointerUpCapture={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
              onPointerCancelCapture={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1' }}
            >
              {isOK ? 'OK' : isDel ? '⌫' : k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
