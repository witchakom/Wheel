import { useMemo } from 'react'
import { PAL } from '../data/palettes'

export function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 45 }, () => ({
        l: Math.random() * 100,
        d: Math.random() * 0.8,
        t: 2 + Math.random() * 2,
        c: PAL.rainbow[Math.floor(Math.random() * 8)],
        s: 6 + Math.random() * 8,
      })),
    []
  )
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
      {bits.map((b, i) => (
        <span
          key={i}
          style={{ position: 'absolute', top: 0, left: b.l + '%', width: b.s, height: b.s * 1.6, background: b.c, borderRadius: 2, animation: `fall ${b.t}s ${b.d}s linear forwards` }}
        />
      ))}
    </div>
  )
}
