import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';
import { TERMS, PRIVACY } from '../content/legal';
import { IcChevronLeft } from '../components/icons';

export default function Legal({ doc }: { doc: 'terms' | 'privacy' }) {
  const nav = useNavigate();
  const { t, lang } = useI18n();
  const data = (doc === 'terms' ? TERMS : PRIVACY)[lang];
  const title = doc === 'terms' ? t('settings.terms') : t('settings.privacy');

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav(-1)} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{title}</div>
      </div>

      <div className="legal">
        <div className="legal-updated">
          {t('legal.updated')}: {data.updated}
        </div>
        <p className="legal-intro">{data.intro}</p>
        {data.sections.map((s, i) => (
          <div className="legal-sec" key={i}>
            <h3>{s.h}</h3>
            {s.p.map((para, j) => (
              <p key={j}>{para}</p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
