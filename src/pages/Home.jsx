import { TPL, mkWheel } from '../data/templates'
import { SpinPanel } from '../components/SpinPanel'

export function Home({ t, lang, cur, pick, set, onWin }) {
  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="scene-cloud scene-cloud-a" aria-hidden="true" />
        <div className="scene-cloud scene-cloud-b" aria-hidden="true" />
        <div className="scene-island" aria-hidden="true"><span /><i /><b /></div>
        <div className="current-wheel"><span className="wheel-indicator" aria-hidden="true" />{cur.name}</div>
        <SpinPanel wheel={cur} t={t} set={set} onWin={onWin} />
      </section>

      <section className="template-section">
        <div className="section-heading">
          <div><h2>{t.tpl}</h2><p>{lang === 'th' ? 'เลือกวงล้อที่เหมาะกับช่วงเวลาของคุณ' : 'Choose a wheel for the moment'}</p></div>
        </div>
        <div className="template-grid">
          {TPL.map((tp, i) => (
            <button key={tp.id} onClick={() => pick(mkWheel(tp, lang, set.pal))} className={`template-card accent-${i % 6}`}>
              <span className="template-name">{tp.n[lang]}</span>
              <span className="template-meta">{tp.i[lang].length} {t.items_n}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
