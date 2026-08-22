function segmentValue(target) {
  return target / 10
}

function filledSegments(given, target) {
  const unit = segmentValue(target)
  return Array.from({ length: 10 }, (_, index) => {
    const start = index * unit
    const fill = Math.max(0, Math.min(unit, given - start))
    return fill / unit
  })
}

export default function ComplementsGuide({ given, target, answer, compact = false }) {
  const segments = filledSegments(given, target)
  const unit = segmentValue(target)

  return (
    <div
      aria-label={`There are ${given}. Add ${answer} more to make ${target}.`}
      style={{
        width: '100%',
        maxWidth: compact ? 380 : 460,
        margin: '0 auto',
        padding: compact ? 16 : 20,
        borderRadius: 20,
        background: 'var(--md-sys-color-surface-container)',
        color: 'var(--md-sys-color-on-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <span className="md-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Fill the gap
        </span>
        <span className="dm-mono" style={{ color: 'var(--md-sys-color-primary)', fontSize: compact ? 18 : 22 }}>
          {target}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: compact ? 4 : 6, alignItems: 'end' }}>
        {segments.map((fill, index) => (
          <div
            key={index}
            style={{
              height: compact ? 34 : 46,
              borderRadius: 8,
              padding: 3,
              background: 'var(--md-sys-color-surface-variant)',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <div
              style={{
                height: `${Math.max(fill * 100, fill > 0 ? 12 : 0)}%`,
                marginTop: `${100 - Math.max(fill * 100, fill > 0 ? 12 : 0)}%`,
                borderRadius: 5,
                background: fill === 1 ? 'var(--md-custom-color-correct)' : 'var(--md-sys-color-primary)',
                transition: 'height 180ms ease-out, margin-top 180ms ease-out',
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 10 }}>
        <span className="md-label-small" style={{ color: 'var(--md-custom-color-correct)' }}>
          {given} filled
        </span>
        <span className="md-label-small" style={{ color: 'var(--md-sys-color-primary)' }}>
          {answer} missing
        </span>
      </div>

      <div
        className="dm-mono"
        style={{
          marginTop: 18,
          padding: '12px 10px',
          borderRadius: 12,
          background: 'var(--md-sys-color-surface-container-high)',
          textAlign: 'center',
          fontSize: compact ? 22 : 'clamp(24px, 6vw, 34px)',
          color: 'var(--md-sys-color-on-surface)',
        }}
      >
        {given} + <span style={{ color: 'var(--md-sys-color-primary)' }}>{answer}</span> = {target}
      </div>

      {!compact && (
        <p className="md-body-medium" style={{ margin: '14px 0 0', textAlign: 'center', color: 'var(--md-sys-color-on-surface-variant)' }}>
          We have {given}. We need {answer} more to make {target}.
        </p>
      )}

      <span className="md-label-small" style={{ display: 'block', marginTop: 10, textAlign: 'center', color: 'var(--md-sys-color-outline)' }}>
        Each block is worth {unit}.
      </span>
    </div>
  )
}
