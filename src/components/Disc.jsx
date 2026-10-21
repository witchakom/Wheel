import { col } from '../utils'

const point = (angle, radius) => {
  const radians = (angle * Math.PI) / 180
  return [radius * Math.sin(radians), -radius * Math.cos(radians)]
}

export function Disc({ items, pal, rot, dur }) {
  const n = items.length
  const seg = 360 / n

  return (
    <div
      className="absolute inset-0"
      style={{ transform: `rotate(${rot}deg)`, transition: `transform ${dur}s cubic-bezier(.12,.6,.08,1)` }}
    >
      <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full">
        {items.map((it, i) => {
          const [x0, y0] = point(i * seg, 81)
          const [x1, y1] = point((i + 1) * seg, 81)
          const fill = col(it, i, pal)
          return n === 1 ? (
            <circle key={i} r="81" fill={fill} />
          ) : (
            <path
              key={i}
              d={`M0 0L${x0} ${y0}A81 81 0 ${seg > 180 ? 1 : 0} 1 ${x1} ${y1}Z`}
              fill={fill}
            />
          )
        })}
      </svg>
      <img
        src="/wheel-3d.png"
        alt=""
        draggable="false"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain"
      />
      <svg viewBox="-100 -100 200 200" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        {items.map((it, i) => {
          const mid = (i + 0.5) * seg
          const label = it.t.length > 14 ? `${it.t.slice(0, 13)}…` : it.t
          return (
            <text
              key={i}
              transform={`rotate(${mid - 90}) translate(58,0)`}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={n > 18 ? 5 : n > 10 ? 6.5 : 8}
              fontWeight="700"
              fill="#fff"
              style={{ paintOrder: 'stroke', stroke: 'rgba(20,18,32,.72)', strokeWidth: 2.2 }}
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
