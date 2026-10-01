import { useState, useEffect } from 'react'
import { useLS } from './hooks/useLS'
import { T } from './i18n'
import { TPL, mkWheel } from './data/templates'
import { uid, cls } from './utils'
import { Home } from './pages/Home'
import { Create } from './pages/Create'
import { Mine } from './pages/Mine'
import { History } from './pages/History'
import { Settings } from './pages/Settings'

export default function App() {
  const [lang, setLang] = useLS('spin.lang', 'th')
  const [page, setPage] = useState('home')
  const [menu, setMenu] = useState(false)
  const [set, setSet] = useLS('spin.set', { pal: 'rainbow', dur: 5, rm: false })
  const [saved, setSaved] = useLS('spin.saved', [])
  const [hist, setHist] = useLS('spin.hist', [])
  const [cur, setCur] = useState(() => mkWheel(TPL[1], lang, 'rainbow'))
  const t = T[lang]

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const go = (p) => { setPage(p); setMenu(false); window.scrollTo(0, 0) }
  const onWin = (it) => {
    setHist((hs) => [{ id: uid(), w: cur.name, r: it.t, ts: Date.now() }, ...hs].slice(0, 100))
    if (set.rm) setTimeout(() => setCur((c) => ({ ...c, items: c.items.filter((x) => x !== it) })), 600)
  }

  const nav = [['home', t.home], ['create', t.create], ['mine', t.mine], ['hist', t.hist], ['set', t.set]]
  const title = nav.find((n) => n[0] === page)[1]

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => go('home')} className="font-bold text-lg flex items-center gap-1.5">
            🎡 <span className="hidden sm:inline">SpinWheel</span>
          </button>
          <nav className="hidden md:flex gap-1 ml-4 flex-1">
            {nav.map(([k, l]) => (
              <button key={k} onClick={() => go(k)} className={cls('px-3 py-1.5 rounded-full text-sm font-medium transition', page === k ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50')}>{l}</button>
            ))}
          </nav>
          <div className="flex-1 md:hidden" />
          <div className="flex rounded-full bg-slate-100 p-0.5 text-xs font-bold">
            {['th', 'en'].map((k) => (
              <button key={k} onClick={() => setLang(k)} className={cls('px-3 py-1 rounded-full', lang === k ? 'bg-indigo-600 text-white' : 'text-slate-500')}>{k.toUpperCase()}</button>
            ))}
          </div>
          <button className="md:hidden w-9 h-9 rounded-lg bg-slate-100" onClick={() => setMenu(!menu)}>{menu ? '✕' : '☰'}</button>
        </div>
        {menu && (
          <div className="md:hidden px-4 pb-3 grid gap-1">
            {nav.map(([k, l]) => (
              <button key={k} onClick={() => go(k)} className={cls('text-left px-3 py-2 rounded-xl font-medium', page === k ? 'bg-indigo-600 text-white' : 'bg-slate-50')}>{l}</button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {page !== 'home' && <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>}
        {page === 'home' && <Home t={t} lang={lang} cur={cur} set={set} onWin={onWin} pick={setCur} />}
        {page === 'create' && <Create t={t} cur={cur} setCur={setCur} setSaved={setSaved} set={set} onWin={onWin} />}
        {page === 'mine' && <Mine t={t} saved={saved} setSaved={setSaved} open={(w) => { setCur(w); go('home') }} />}
        {page === 'hist' && <History t={t} hist={hist} lang={lang} />}
        {page === 'set' && <Settings t={t} set={set} setSet={setSet} lang={lang} setLang={setLang} clearH={() => setHist([])} clearW={() => setSaved([])} />}
      </main>
    </div>
  )
}
