import { useRef, useState, type ChangeEvent } from 'react';
import type { Car } from '../../types/db';
import { supabase } from '../../lib/supabase';
import { darken, colorNameToHex } from '../../lib/color';
import {
  CAR_CATEGORIES,
  TRANSMISSIONS,
  FUELS,
  ADMIN_ZONES,
  SCENE_PRESETS,
  MAX_PHOTO_BYTES,
  CAR_PHOTOS_BUCKET,
  CAR_FEATURES,
  DEFAULT_FEATURES,
  LEGACY_FEATURE_MAP,
} from '../../data/constants';
import { useI18n } from '../../i18n/I18nContext';
import CarArt from '../CarArt';

/** Normaliza las features guardadas (ids nuevos o texto viejo en español) a ids conocidos. */
function normalizeFeatures(stored: string[] | undefined | null): string[] {
  if (!stored) return [...DEFAULT_FEATURES];
  const ids = stored.map((f) => LEGACY_FEATURE_MAP[f] ?? f).filter((f) => (CAR_FEATURES as readonly string[]).includes(f));
  return Array.from(new Set(ids));
}

type Props = {
  car?: Car | null;
  onSaved: (msg: string) => void;
  onError: (msg: string) => void;
};

export default function CarForm({ car, onSaved, onError }: Props) {
  const { t } = useI18n();
  const editing = !!car;
  const [brand, setBrand] = useState(car?.brand ?? '');
  const [model, setModel] = useState(car?.model ?? '');
  const [year, setYear] = useState(car?.year ?? new Date().getFullYear());
  const [category, setCategory] = useState(car?.category ?? 'SUV');
  const [price, setPrice] = useState(car?.price_per_day ?? 45);
  const [seats, setSeats] = useState(car?.seats ?? 5);
  const [transmission, setTransmission] = useState(car?.transmission ?? 'Automática');
  const [fuel, setFuel] = useState(car?.fuel ?? 'Gasolina');
  const [location, setLocation] = useState(car?.location ?? '');
  const [plate, setPlate] = useState(car?.plate ?? '');
  const [zone, setZone] = useState(car?.zone ?? 'Santo Domingo');
  const [colorName, setColorName] = useState(car?.color_name ?? '');
  const [descriptionEs, setDescriptionEs] = useState(car?.description ?? '');
  const [descriptionEn, setDescriptionEn] = useState(car?.description_en ?? '');
  // El color del dibujo se deriva de la palabra; si no se escribió, se conserva el del carro.
  const bodyColor = colorName.trim() ? colorNameToHex(colorName) : car?.body_color ?? '#2B6CB0';
  const [features, setFeatures] = useState<string[]>(() => normalizeFeatures(car?.features));
  const [isActive, setIsActive] = useState(car?.is_active ?? true);

  const toggleFeature = (id: string) =>
    setFeatures((cur) => (cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]));
  const [images, setImages] = useState<string[]>(() =>
    car?.images && car.images.length ? car.images : car?.image_url ? [car.image_url] : [],
  );
  const removePhoto = (url: string) => setImages((cur) => cur.filter((u) => u !== url));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ''; // permite re-elegir el mismo archivo
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        onError(t('carForm.notImage'));
        continue;
      }
      // Aviso claro cuando la foto pesa más de 50 MB (en vez de un error silencioso)
      if (file.size > MAX_PHOTO_BYTES) {
        const mb = (file.size / (1024 * 1024)).toFixed(0);
        onError(t('carForm.tooBig', { mb }));
        continue;
      }
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(CAR_PHOTOS_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) {
        onError(t('carForm.uploadError') + error.message);
        continue;
      }
      const { data } = supabase.storage.from(CAR_PHOTOS_BUCKET).getPublicUrl(path);
      setImages((cur) => [...cur, data.publicUrl]);
    }
    setUploading(false);
  }

  const scene = SCENE_PRESETS[category] ?? SCENE_PRESETS.SUV;
  const preview: Pick<Car, 'body_color' | 'body_color_2' | 'scene_1' | 'scene_2'> = {
    body_color: bodyColor,
    body_color_2: darken(bodyColor, 0.3),
    scene_1: scene[0],
    scene_2: scene[1],
  };

  async function save() {
    if (!brand.trim() || !model.trim()) {
      onError(t('carForm.brandModelRequired'));
      return;
    }
    setSaving(true);
    const payload = {
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      category,
      price_per_day: Number(price),
      seats: Number(seats),
      transmission,
      fuel,
      location: location.trim() || zone,
      plate: plate.trim() || null,
      zone,
      description: descriptionEs.trim() || null,
      description_en: descriptionEn.trim() || null,
      color_name: colorName.trim() || null,
      body_color: bodyColor,
      body_color_2: darken(bodyColor, 0.3),
      scene_1: scene[0],
      scene_2: scene[1],
      features,
      is_active: isActive,
      images,
      image_url: images[0] ?? null,
    };
    const res = editing
      ? await supabase.from('cars').update(payload).eq('id', car!.id)
      : await supabase.from('cars').insert(payload);
    setSaving(false);
    if (res.error) {
      onError(t('carForm.saveError') + res.error.message);
      return;
    }
    onSaved(editing ? t('carForm.updatedToast') : t('carForm.addedToast'));
  }

  async function remove() {
    if (!car) return;
    setSaving(true);
    const { error } = await supabase.from('cars').delete().eq('id', car.id);
    setSaving(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes('foreign key') || m.includes('violates') || m.includes('referenced')) {
        onError(t('carForm.fkError'));
      } else {
        onError(t('carForm.deleteError') + error.message);
      }
      setConfirming(false);
      return;
    }
    onSaved(t('carForm.deletedToast'));
  }

  return (
    <div className="carform">
      <div className="grabber" />
      <div className="sh-title">{editing ? t('carForm.editTitle') : t('carForm.addTitle')}</div>
      <div className="sh-sub" style={{ marginBottom: 14 }}>
        {editing ? `${car!.brand} ${car!.model}` : t('carForm.newVehicle')}
      </div>

      <div className="carform-preview">
        {images[0] ? <img src={images[0]} alt={t('carForm.photoAlt')} /> : <CarArt car={preview} />}
      </div>

      {images.length > 0 && (
        <div className="photo-strip">
          {images.map((url, i) => (
            <div className="photo-thumb" key={url}>
              <img src={url} alt="" />
              {i === 0 && <span className="main-tag">{t('carForm.mainPhoto')}</span>}
              <button
                type="button"
                className="rm"
                onClick={() => removePhoto(url)}
                aria-label={t('carForm.removePhoto')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="photo-actions">
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? t('carForm.uploading') : images.length ? t('carForm.addPhoto') : t('carForm.uploadPhoto')}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={onPickFile} />
      </div>
      <div className="photo-hint">{t('carForm.photoHint')}</div>

      <div className="form-row">
        <div className="field">
          <label>{t('carForm.brand')}</label>
          <div className="inp">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" />
          </div>
        </div>
        <div className="field">
          <label>{t('carForm.model')}</label>
          <div className="inp">
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Corolla" />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>{t('carForm.year')}</label>
          <div className="inp">
            <input type="number" value={year} onChange={(e) => setYear(+e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('carForm.pricePerDay')}</label>
          <div className="inp">
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)} />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>{t('carForm.category')}</label>
          <div className="inp">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CAR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t('cat.' + c)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t('carForm.zone')}</label>
          <div className="inp">
            <select value={zone} onChange={(e) => setZone(e.target.value)}>
              {ADMIN_ZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="field">
        <label>{t('carForm.location')}</label>
        <div className="inp">
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Piantini, SD" />
        </div>
      </div>

      <div className="field">
        <label>{t('carForm.plate')}</label>
        <div className="inp">
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder={t('carForm.platePh')}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>{t('carForm.seats')}</label>
          <div className="inp">
            <input type="number" value={seats} onChange={(e) => setSeats(+e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label>{t('carForm.transmission')}</label>
          <div className="inp">
            <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
              {TRANSMISSIONS.map((tr) => (
                <option key={tr} value={tr}>
                  {t('trans.' + tr)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="field">
          <label>{t('carForm.fuel')}</label>
          <div className="inp">
            <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
              {FUELS.map((f) => (
                <option key={f} value={f}>
                  {t('fuel.' + f)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t('carForm.color')}</label>
          <div className="inp">
            <input value={colorName} onChange={(e) => setColorName(e.target.value)} placeholder={t('carForm.colorPh')} />
          </div>
        </div>
      </div>

      <div className="field">
        <label>{t('carForm.descriptionEs')}</label>
        <div className="inp" style={{ alignItems: 'stretch' }}>
          <textarea
            value={descriptionEs}
            onChange={(e) => setDescriptionEs(e.target.value)}
            placeholder={t('carForm.descriptionPh')}
            rows={3}
            style={{
              width: '100%',
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              font: 'inherit',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          />
        </div>
      </div>

      <div className="field">
        <label>{t('carForm.descriptionEn')}</label>
        <div className="inp" style={{ alignItems: 'stretch' }}>
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            placeholder={t('carForm.descriptionPh')}
            rows={3}
            style={{
              width: '100%',
              resize: 'none',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text)',
              font: 'inherit',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          />
        </div>
      </div>

      <div className="b-sec" style={{ padding: '6px 0 0' }}>
        <h3>{t('carForm.features')}</h3>
      </div>
      <div className="sh-sub" style={{ margin: '0 0 10px' }}>
        {t('carForm.featuresHint')}
      </div>
      <div className="tchips" style={{ marginBottom: 8 }}>
        {CAR_FEATURES.map((f) => (
          <button
            key={f}
            type="button"
            className={'chip tchip' + (features.includes(f) ? ' active' : '')}
            onClick={() => toggleFeature(f)}
          >
            {t('feature.' + f)}
          </button>
        ))}
      </div>

      <div className="extra" style={{ margin: '4px 0 6px' }} onClick={() => setIsActive((v) => !v)}>
        <div className="en">
          {t('carForm.availableTitle')}
          <small>{t('carForm.availableDesc')}</small>
        </div>
        <div className={'switch' + (isActive ? ' on' : '')}>
          <span className="knob" />
        </div>
      </div>

      <div className="sheet-actions" style={{ marginTop: 16 }}>
        {!confirming && (
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? t('booking.saving') : editing ? t('editProfile.saveChanges') : t('carForm.addToFleet')}
          </button>
        )}
        {editing && !confirming && (
          <button className="btn btn-danger" onClick={() => setConfirming(true)} disabled={saving}>
            {t('carForm.deleteCar')}
          </button>
        )}
        {editing && confirming && (
          <>
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
              {t('carForm.confirmA')}
              <b style={{ color: 'var(--text)' }}>
                {car!.brand} {car!.model}
              </b>
              {t('carForm.confirmB')}
            </div>
            <button className="btn btn-danger" onClick={remove} disabled={saving}>
              {saving ? t('carForm.deleting') : t('carForm.confirmDelete')}
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)} disabled={saving}>
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
