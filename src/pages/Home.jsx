import { TPL, mkWheel } from '../data/templates'
import { SpinPanel } from '../components/SpinPanel'

export function Home({ t, lang, cur, pick, set, onWin }) {
  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">
      <div>
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-fuchsia-600 to-indigo-600 bg-clip-text text-transparent">{t.title}</h1>
          <p className="text-slate-500 mt-1">{t.sub}</p>
        </div>
        <div className="text-center font-medium mb-4">{cur.emoji} {cur.name}</div>
        <SpinPanel wheel={cur} t={t} set={set} onWin={onWin} />
      </div>
      <div>
        <h2 className="font-bold mb-3">{t.tpl}</h2>
        <div className="grid grid-cols-2 gap-2">
          {TPL.map((tp) => (
            <button
              key={tp.id}
              onClick={() => pick(mkWheel(tp, lang, set.pal))}
              className="text-left p-3 rounded-2xl bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition border border-indigo-100"
            >
              <div className="text-2xl">{tp.e}</div>
              <div className="text-sm font-medium leading-tight mt-1">{tp.n[lang]}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
