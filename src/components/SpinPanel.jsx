import { useState } from 'react'
import { Disc } from './Disc'
import { Confetti } from './Confetti'
import { cls, col } from '../utils'

export function SpinPanel({ wheel, t, set, onWin }) {
  const [rot, setRot] = useState(0)
  const [busy, setBusy] = useState(false)
  const [win, setWin] = useState(null)
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
    const target = -((k + 0.25 + Math.random() * 0.5) * seg)
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
      <div className="relative w-full max-w-[480px] aspect-square mx-auto">
        {n > 0 ? (
          <Disc items={items} pal={pal} rot={rot} dur={dur} />
        ) : (
          <div className="absolute inset-0 rounded-full bg-white shadow-xl grid place-items-center text-slate-400 text-center p-8">{t.min2}</div>
        )}
        <svg viewBox="0 0 40 40" className="absolute left-1/2 -top-3 w-10 h-10 -translate-x-1/2 z-10 drop-shadow-lg">
          <path d="M20 38L6 6Q20 -2 34 6Z" fill="#1e1b4b" stroke="#fff" strokeWidth="2" />
        </svg>
        <button
          onClick={spin}
          disabled={disabled}
          className={cls(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[22%] h-[22%] rounded-full bg-indigo-950 text-white font-bold text-xs sm:text-sm shadow-xl ring-4 ring-white z-10 transition',
            disabled ? 'opacity-70' : 'hover:scale-105 active:scale-95'
          )}
        >
          {busy ? '…' : 'SPIN'}
        </button>
      </div>

      <div className="text-center mt-5">
        <button
          onClick={spin}
          disabled={disabled}
          className="px-8 py-3 rounded-full bg-linear-to-r from-fuchsia-500 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-95 transition"
        >
          🎡 {t.spin}
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
              <button onClick={() => setWin(null)} className="px-5 py-2 rounded-full bg-slate-100 font-medium">{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
