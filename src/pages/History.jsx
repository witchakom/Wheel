export function History({ t, hist, lang }) {
  if (hist.length === 0) return <p className="text-center text-slate-400 py-20">{t.empty}</p>
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 divide-y divide-slate-100 max-w-2xl mx-auto">
      {hist.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="font-bold truncate">{r.r}</div>
            <div className="text-xs text-slate-500 truncate">{t.wheel}: {r.w}</div>
          </div>
          <div className="text-xs text-slate-400 shrink-0 text-right">
            {new Date(r.ts).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </div>
      ))}
    </div>
  )
}
