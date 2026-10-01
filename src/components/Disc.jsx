import { col } from '../utils'

const point = (a, r) => {
  const t = (a * Math.PI) / 180
  return [(r * Math.sin(t)).toFixed(2), (-r * Math.cos(t)).toFixed(2)]
}

export function Disc({ items, pal, rot, dur }) {
  const n = items.length
  const seg = 360 / n
  return (
    <div
      className="absolute inset-0"
      style={{ transform: `rotate(${rot}deg)`, transition: `transform ${dur}s cubic-bezier(.12,.6,.08,1)` }}
    >
      <svg viewBox="-100 -100 200 200" className="w-full h-full drop-shadow-xl">
        <circle r="99" fill="#fff" />
        {items.map((it, i) => {
          const [x0, y0] = point(i * seg, 96)
          const [x1, y1] = point((i + 1) * seg, 96)
          const mid = (i + 0.5) * seg
          const c = col(it, i, pal)
          const label = it.t.length > 14 ? it.t.slice(0, 13) + '…' : it.t
          return (
            <g key={i}>
              {n === 1 ? (
                <circle r="96" fill={c} />
              ) : (
                <path d={`M0 0L${x0} ${y0}A96 96 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1}Z`} fill={c} stroke="#fff" strokeWidth="1" />
              )}
              <text
                transform={`rotate(${mid - 90}) translate(88,0)`}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={n > 18 ? 5 : n > 10 ? 6.5 : 8}
                fontWeight="700"
                fill="#fff"
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,.35)', strokeWidth: 1.4 }}
              >
                {label}
              </text>
            </g>
          )
        })}
        <circle r="97" fill="none" stroke="#fff" strokeWidth="4" />
      </svg>
    </div>
  )
}
