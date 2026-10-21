export function History({ t, hist, lang, onDelete, onClear }) {
  if (hist.length === 0) return <p className="text-center text-slate-400 py-20">{t.empty}</p>
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-end mb-2">
        <button onClick={onClear} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100">{t.clr}</button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 divide-y divide-slate-100">
      {hist.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="font-bold truncate">{r.r}</div>
            <div className="text-xs text-slate-500 truncate">{t.wheel}: {r.w}</div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs text-slate-400 text-right">
              {new Date(r.ts).toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
            </div>
            <button onClick={() => onDelete(r.id)} aria-label={`${t.del}: ${r.r}`} title={t.del} className="grid place-items-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">✕</button>
          </div>
        </div>
      ))}
      </div>
    </div>
  )
}
