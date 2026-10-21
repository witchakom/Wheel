import { useState } from 'react'
import { GlbViewer } from './GlbViewer'
import { Confetti } from './Confetti'
import { col } from '../utils'

export function SpinPanel({ wheel, t, set, onWin }) {
  const [rot, setRot] = useState(0)
  const [busy, setBusy] = useState(false)
  const [win, setWin] = useState(null)
  const [modelReady, setModelReady] = useState(false)
  const [modelError, setModelError] = useState(false)
  const { items, pal } = wheel
  const n = items.length
  const dur = set.dur
  const disabled = busy || n < 2

  const spin = () => {
    if (disabled) return
    setWin(null)
    setBusy(true)
    const k = Math.floor(Math.random() * n)
    const seg = 360 / n
    const target = -(k + (Math.random() - 0.5) * 0.5) * seg
    const delta = 360 * (4 + Math.floor(Math.random() * 3)) + ((((target - rot) % 360) + 360) % 360)
    setRot(rot + delta)
    setTimeout(() => {
      setBusy(false)
      setWin({ it: items[k], k })
      onWin(items[k], k)
    }, dur * 1000 + 150)
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-[480px] mx-auto">
        <div className="relative aspect-[4/5] overflow-hidden">
          <GlbViewer
            rotation={rot}
            duration={dur}
            items={items}
            pal={pal}
            onReady={() => setModelReady(true)}
            onError={(error) => setModelError(error?.message || 'โหลดไฟล์โมเดลไม่สำเร็จ')}
          />
          {!modelReady && !modelError && <div className="absolute inset-0 grid place-items-center text-sm text-slate-500">Loading 3D model…</div>}
          {modelError && <div className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-rose-700">โหลดโมเดล 3D ไม่สำเร็จ: {modelError}</div>}
        </div>
      </div>

      <div className="text-center mt-5">
        <button
          onClick={spin}
          disabled={disabled}
          className="px-8 py-3 rounded-full bg-linear-to-r from-fuchsia-500 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-95 transition"
        >
          {busy ? <span className="spin-loading" aria-label={t.spin} /> : t.spin}
        </button>
      </div>

      {win && (
        <div className="fixed inset-0 z-30 bg-indigo-950/50 grid place-items-center p-4" onClick={() => setWin(null)}>
          <Confetti />
          <div className="pop bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm text-slate-500">{t.win}</div>
            <div className="text-4xl font-bold my-4 break-words" style={{ color: col(win.it, win.k, pal) }}>{win.it.t}</div>
            <div className="flex gap-2 justify-center">
              <button onClick={() => { setWin(null); setTimeout(spin, 50) }} className="px-5 py-2 rounded-full bg-indigo-600 text-white font-medium">{t.again}</button>
              <button onClick={() => setWin(null)} className="px-5 py-2 rounded-full bg-slate-100 text-white font-medium">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
