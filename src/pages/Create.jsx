import { useState } from 'react'
import { SpinPanel } from '../components/SpinPanel'
import { PalettePicker } from '../components/PalettePicker'
import { col, uid } from '../utils'

const iconBtn = 'w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm disabled:opacity-30'
const input = 'rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400'

export function Create({ t, cur, setCur, setSaved, set, onWin }) {
  const [newItem, setNewItem] = useState('')
  const [ok, setOk] = useState(false)
  const setItems = (items) => setCur({ ...cur, items })
  const patch = (i, p) => setItems(cur.items.map((x, j) => (j === i ? { ...x, ...p } : x)))

  const add = () => {
    const v = newItem.trim()
    if (!v) return
    setItems([...cur.items, { t: v }])
    setNewItem('')
  }
  const move = (i, d) => {
    const a = [...cur.items]
    const j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    setItems(a)
  }
  const save = () => {
    const w = { ...cur, id: cur.id || uid() }
    setCur(w)
    setSaved((s) => (s.some((x) => x.id === w.id) ? s.map((x) => (x.id === w.id ? w : x)) : [w, ...s]))
    setOk(true)
    setTimeout(() => setOk(false), 1500)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-100 space-y-4">
        <label className="block text-sm font-medium">
          {t.name}
          <input value={cur.name} onChange={(e) => setCur({ ...cur, name: e.target.value })} className={`mt-1 w-full ${input}`} />
        </label>

        <div>
          <div className="text-sm font-medium mb-1">{t.palette}</div>
          <PalettePicker value={cur.pal} onChange={(pal) => setCur({ ...cur, pal })} />
        </div>

        <div>
          <div className="text-sm font-medium mb-1">{t.items} ({cur.items.length})</div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {cur.items.map((it, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input type="color" title={t.custom} value={col(it, i, cur.pal)} onChange={(e) => patch(i, { c: e.target.value })} className="w-8 h-8 rounded-lg border-0 p-0 bg-transparent cursor-pointer" />
                <input value={it.t} onChange={(e) => patch(i, { t: e.target.value })} className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-400" />
                <button className={iconBtn} title={t.up} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button className={iconBtn} title={t.down} disabled={i === cur.items.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button className={`${iconBtn} bg-rose-50! text-rose-600`} title={t.del} onClick={() => setItems(cur.items.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <input value={newItem} placeholder={t.ph} onChange={(e) => setNewItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} className={`flex-1 min-w-0 ${input}`} />
            <button onClick={add} className="px-4 rounded-xl bg-indigo-600 text-white font-medium">+ {t.add}</button>
          </div>
        </div>

        <button onClick={save} className="w-full py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600">
          {ok ? '✓ ' + t.saved : '💾 ' + t.save}
        </button>
      </div>
      <SpinPanel wheel={cur} t={t} set={set} onWin={onWin} />
    </div>
  )
}
