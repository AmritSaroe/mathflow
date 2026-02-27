const KEYS = ['1','2','3','4','5','6','7','8','9','del','0','submit']

export default function NumPad({ onKey }) {
  return (
    <div
      className="flex-shrink-0 bg-[#1a1a1a] px-3 pt-2 pb-4"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {KEYS.map(k => {
          const isSubmit = k === 'submit'
          const isDel    = k === 'del'
          return (
            <button
              key={k}
              onPointerDown={(e) => { e.preventDefault(); onKey(k) }}
              className={[
                'flex items-center justify-center h-[68px] rounded-[13px] border',
                'select-none active:scale-[0.94] transition-transform',
                isSubmit
                  ? 'bg-[#e0ff5a] border-[#e0ff5a] text-[#111800] font-sans font-bold text-[14px] tracking-wide'
                  : isDel
                  ? 'bg-[#242424] border-[#333] text-[#666] font-mono text-[16px]'
                  : 'bg-[#242424] border-[#333] text-[#f0f0f0] font-mono text-[22px]',
              ].join(' ')}
            >
              {isSubmit ? 'OK' : isDel ? '⌫' : k}
            </button>
          )
        })}
      </div>
    </div>
  )
}
