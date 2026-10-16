import { type SortKey } from '../../data/constants';
import { useI18n } from '../../i18n/I18nContext';
import { IcCheck, IcSort, IcStar } from '../icons';

const ORDER: SortKey[] = ['recomendados', 'precio_asc', 'precio_desc', 'rating'];

export default function SortSheet({
  current,
  onSelect,
}: {
  current: SortKey;
  onSelect: (k: SortKey) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="grabber" />
      <div className="sh-title">{t('sort.title')}</div>
      <div className="sh-sub" style={{ marginBottom: 10 }}>
        {t('sort.sub')}
      </div>
      {ORDER.map((k) => (
        <div key={k} className={'sortrow' + (current === k ? ' on' : '')} onClick={() => onSelect(k)}>
          <div className="mi">{k === 'rating' ? <IcStar /> : <IcSort />}</div>
          <div className="ml">{t('sort.' + k)}</div>
          {current === k ? (
            <IcCheck className="chk" />
          ) : (
            <span className="mc" style={{ color: 'var(--muted-2)' }}>
              ›
            </span>
          )}
        </div>
      ))}
    </>
  );
}
