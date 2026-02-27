const KEYS = ['1','2','3','4','5','6','7','8','9','del','0','submit']

export default function NumPad({ onKey }) {
  return (
    <div
      className="flex-shrink-0 px-3 pt-2 pb-5"
      style={{ touchAction: 'manipulation', background: '#080808' }}
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {KEYS.map(k => {
          const isOK  = k === 'submit'
          const isDel = k === 'del'

          return (
            <button
              key={k}
              onPointerDown={e => { e.preventDefault(); onKey(k) }}
              className="flex items-center justify-center h-[70px] rounded-[16px]
                         select-none transition-all duration-100 active:scale-[0.92]"
              style={
                isOK  ? {
                  background: '#d4f53c',
                  color: '#0a1400',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.04em',
                  boxShadow: '0 2px 12px #d4f53c28',
                } :
                isDel ? {
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  color: '#3a3a3a',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 18,
                } : {
                  background: '#111',
                  border: '1px solid #1a1a1a',
                  color: '#d8d8d5',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 22,
                  fontWeight: 400,
                }
              }
            >
              {isOK ? 'OK' : isDel ? '⌫' : k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
