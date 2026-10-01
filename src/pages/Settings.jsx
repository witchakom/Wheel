import { PalettePicker } from '../components/PalettePicker'
import { cls } from '../utils'

const card = 'bg-white rounded-2xl p-4 shadow-sm border border-indigo-100'
const danger = 'px-4 py-2 rounded-xl bg-rose-50 text-rose-600 font-medium'

export function Settings({ t, set, setSet, clearH, clearW, lang, setLang }) {
  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className={card}>
        <div className="font-medium mb-2">{t.lang}</div>
        <div className="flex gap-2">
          {[['th', 'ภาษาไทย'], ['en', 'English']].map(([k, l]) => (
            <button key={k} onClick={() => setLang(k)} className={cls('flex-1 py-2 rounded-xl font-medium', lang === k ? 'bg-indigo-600 text-white' : 'bg-slate-100')}>{l}</button>
          ))}
        </div>
      </div>
      <div className={card}>
        <div className="font-medium mb-2">{t.def}</div>
        <PalettePicker value={set.pal} onChange={(pal) => setSet({ ...set, pal })} />
      </div>
      <div className={card}>
        <label className="font-medium block">
          {t.dur}: {set.dur}s
          <input type="range" min="2" max="10" value={set.dur} onChange={(e) => setSet({ ...set, dur: +e.target.value })} className="w-full mt-2 accent-indigo-600" />
        </label>
      </div>
      <label className={card + ' flex items-center justify-between cursor-pointer font-medium'}>
        {t.rm}
        <input type="checkbox" checked={set.rm} onChange={(e) => setSet({ ...set, rm: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
      </label>
      <div className="flex gap-2 flex-wrap">
        <button onClick={clearH} className={danger}>{t.clr}</button>
        <button onClick={clearW} className={danger}>{t.clrw}</button>
      </div>
    </div>
  )
}
