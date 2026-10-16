import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { OTP_LENGTH } from '../data/constants';

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
};

/** Fila de casillas para un código de verificación (auto-avance, borrar y pegar). */
export default function OtpInput({ value, onChange, length = OTP_LENGTH, autoFocus = true }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function emit(arr: string[]) {
    onChange(arr.join('').slice(0, length));
  }

  function handleChange(i: number, raw: string) {
    const v = raw.replace(/\D/g, '');
    const arr = [...digits];
    if (!v) {
      arr[i] = '';
      emit(arr);
      return;
    }
    if (v.length > 1) {
      v.slice(0, length - i)
        .split('')
        .forEach((c, k) => (arr[i + k] = c));
      emit(arr);
      refs.current[Math.min(i + v.length, length - 1)]?.focus();
      return;
    }
    arr[i] = v;
    emit(arr);
    if (i < length - 1) refs.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    onChange(text);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  }

  return (
    <div className="otp-row" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={'otp-box' + (d ? ' filled' : '')}
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          aria-label={`Dígito ${i + 1}`}
        />
      ))}
    </div>
  );
}
