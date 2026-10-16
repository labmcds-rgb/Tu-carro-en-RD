import { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { IcStar } from '../icons';

export default function RatingSheet({
  carName,
  onSubmit,
}: {
  carName: string;
  onSubmit: (rating: number, comment: string) => Promise<void> | void;
}) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  return (
    <>
      <div className="grabber" />
      <div className="sh-title" style={{ textAlign: 'center' }}>
        {t('rate.title')}
      </div>
      <div className="sh-sub" style={{ textAlign: 'center', marginBottom: 6 }}>
        {carName}
      </div>

      <div className="star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={'star' + (n <= rating ? ' on' : '')}
            onClick={() => setRating(n)}
            aria-label={`${n}`}
          >
            <IcStar />
          </button>
        ))}
      </div>

      <textarea
        className="rate-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t('rate.commentPh')}
        rows={3}
      />

      <div className="sheet-actions" style={{ marginTop: 14 }}>
        <button
          className="btn btn-primary"
          disabled={!rating || saving}
          style={!rating ? { opacity: 0.4 } : undefined}
          onClick={async () => {
            if (!rating) return;
            setSaving(true);
            await onSubmit(rating, comment.trim());
          }}
        >
          {saving ? t('rate.sending') : t('rate.submit')}
        </button>
      </div>
    </>
  );
}
