import { useEffect, useState } from 'react'

/**
 * Shows a bottom banner prompting the user to install MathFlow as a PWA.
 * - Listens for the browser's `beforeinstallprompt` event
 * - Appears automatically 2 seconds after the page loads (first visit only)
 * - Remembers dismissal so it never reappears after "Later" is tapped
 * - Hides itself when already running in standalone (installed) mode
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible]   = useState(false)

  useEffect(() => {
    // Already installed — nothing to do
    if (window.matchMedia('(display-mode: standalone)').matches) return
    // User already dismissed — don't pester them
    if (localStorage.getItem('mf-install-dismissed')) return

    function handlePrompt(e) {
      e.preventDefault()          // stop the browser's default mini-infobar
      setDeferred(e)
      // Slide up after a short pause so it doesn't feel intrusive
      setTimeout(() => setVisible(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt)
  }, [])

  async function install() {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    setVisible(false)
    setDeferred(null)
    // If they dismissed the OS dialog, remember it so we don't ask again
    if (outcome === 'dismissed') localStorage.setItem('mf-install-dismissed', '1')
  }

  function dismiss() {
    setVisible(false)
    localStorage.setItem('mf-install-dismissed', '1')
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2"
      style={{ animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <div
        className="w-full max-w-md mx-auto rounded-[18px] border border-[#222]
                   bg-[#0f0f0f] px-4 py-3 flex items-center gap-3"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.7)' }}
      >
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-[11px] flex items-center justify-center"
          style={{ background: '#d4f53c' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <rect x="3.5" y="10.8" width="17" height="2.4" rx="1.2" fill="#0a1200" />
            <rect x="10.8" y="3.5" width="2.4" height="17" rx="1.2" fill="#0a1200" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#f0f0ee] leading-tight">
            Install MathFlow
          </p>
          <p className="text-[11px] text-[#444] mt-0.5 font-mono">
            works offline · no app store needed
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={dismiss}
            className="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold text-[#444]
                       hover:text-[#888] hover:bg-[#1a1a1a] transition-all"
          >
            Later
          </button>
          <button
            onClick={install}
            className="px-4 py-1.5 rounded-[8px] text-[12px] font-bold
                       active:scale-95 transition-all"
            style={{ background: '#d4f53c', color: '#0a1200' }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
