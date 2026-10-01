import { col } from '../utils'

export function Mine({ t, saved, setSaved, open }) {
  if (saved.length === 0) return <p className="text-center text-slate-400 py-20">{t.empty}</p>
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {saved.map((w) => (
        <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 rounded-full overflow-hidden shrink-0">
              {w.items.slice(0, 4).map((it, i) => (
                <span key={i} className="flex-1" style={{ background: col(it, i, w.pal) }} />
              ))}
            </div>
            <div className="min-w-0">
              <div className="font-bold truncate">{w.name}</div>
              <div className="text-xs text-slate-500">{w.items.length} {t.items_n}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => open(w)} className="flex-1 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">{t.load}</button>
            <button onClick={() => setSaved((s) => s.filter((x) => x.id !== w.id))} className="px-3 rounded-lg bg-rose-50 text-rose-600 text-sm">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}
