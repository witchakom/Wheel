import { PAL } from '../data/palettes'
import { cls } from '../utils'

export function PalettePicker({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {Object.keys(PAL).map((k) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={cls('flex rounded-full overflow-hidden h-7 w-24 border-2', value === k ? 'border-indigo-600' : 'border-transparent')}
        >
          {PAL[k].slice(0, 6).map((c, i) => (
            <span key={i} className="flex-1" style={{ background: c }} />
          ))}
        </button>
      ))}
    </div>
  )
}
