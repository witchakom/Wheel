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
  const [dark, setDark] = useLS('spin.dark', false)
  const [set, setSet] = useLS('spin.set', { pal: 'pastel', dur: 5, rm: false })
  const [saved, setSaved] = useLS('spin.saved', [])
  const [hist, setHist] = useLS('spin.hist', [])
  const [cur, setCur] = useState(() => mkWheel(TPL[1], lang, set.pal))
  const t = T[lang]

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  const go = (p) => { setPage(p); window.scrollTo(0, 0) }
  const setDefaultPalette = (pal) => {
    setSet((current) => ({ ...current, pal }))
    setCur((wheel) => ({ ...wheel, pal }))
  }
  const onWin = (it) => {
    setHist((hs) => [{ id: uid(), w: cur.name, r: it.t, ts: Date.now() }, ...hs].slice(0, 100))
    if (set.rm) setTimeout(() => setCur((c) => ({ ...c, items: c.items.filter((x) => x !== it) })), 600)
  }

  const nav = [['home', t.home], ['create', t.create], ['mine', t.mine], ['hist', t.hist], ['set', t.set]]
  const title = nav.find((n) => n[0] === page)[1]

  return (
    <div className={`min-h-screen${dark ? ' dark-mode' : ''}`}>
      <header className="app-header sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => go('home')} className="font-bold text-lg flex items-center gap-1.5">
            <svg className="brand-wheel" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="2.4"/><path d="M16 5v8.6M16 18.4V27M5 16h8.6M18.4 16H27M8.2 8.2l6.1 6.1m3.4 3.4 6.1 6.1m0-15.6-6.1 6.1m-3.4 3.4-6.1 6.1"/></svg>
            <span className="hidden sm:inline">SpinWheel</span>
          </button>
          <nav className="hidden md:flex gap-1 ml-4 flex-1">
            {nav.map(([k, l]) => (
              <button key={k} onClick={() => go(k)} className={cls('px-3 py-1.5 rounded-full text-sm font-medium transition', page === k ? 'nav-active bg-indigo-600 text-white' : 'hover:bg-indigo-50')}>{l}</button>
            ))}
          </nav>
          <div className="flex-1 md:hidden" />
          <div className="flex rounded-full bg-slate-100 p-0.5 text-xs font-bold">
            {['th', 'en'].map((k) => (
              <button key={k} onClick={() => setLang(k)} className={cls('px-3 py-1 rounded-full', lang === k ? 'bg-indigo-600 text-white' : 'text-slate-500')}>{k.toUpperCase()}</button>
            ))}
          </div>
          <button
            aria-label={dark ? (lang === 'th' ? 'เปลี่ยนเป็นโหมดสว่าง' : 'Switch to light mode') : (lang === 'th' ? 'เปลี่ยนเป็นโหมดมืด' : 'Switch to dark mode')}
            aria-pressed={dark}
            className="theme-toggle w-9 h-9 rounded-lg bg-slate-100"
            onClick={() => setDark(!dark)}
          >
            {dark ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/></svg>
            )}
          </button>
        </div>
        <nav className="mobile-nav md:hidden px-4 pb-2 flex gap-1 overflow-x-auto">
          {nav.map(([k, l]) => (
            <button key={k} onClick={() => go(k)} className={cls('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium', page === k ? 'nav-active bg-indigo-600 text-white' : 'hover:bg-indigo-50')}>{l}</button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {page !== 'home' && <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>}
        {page === 'home' && <Home t={t} lang={lang} cur={cur} set={set} onWin={onWin} pick={setCur} />}
        {page === 'create' && <Create t={t} lang={lang} cur={cur} setCur={setCur} setSaved={setSaved} set={set} setSet={setSet} onWin={onWin} />}
        {page === 'mine' && <Mine t={t} saved={saved} setSaved={setSaved} open={(w) => { setCur(w); go('home') }} />}
        {page === 'hist' && <History t={t} hist={hist} lang={lang} onDelete={(id) => setHist((hs) => hs.filter((r) => r.id !== id))} onClear={() => setHist([])} />}
        {page === 'set' && <Settings t={t} set={set} setSet={setSet} setPalette={setDefaultPalette} lang={lang} setLang={setLang} clearH={() => setHist([])} clearW={() => setSaved([])} />}
      </main>
    </div>
  )
}
