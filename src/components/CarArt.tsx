import { useId } from 'react';
import type { Car } from '../types/db';

type Props = { car: Pick<Car, 'body_color' | 'body_color_2' | 'scene_1' | 'scene_2'> };

/** Ilustración vectorial del carro, tintada según los colores del vehículo. */
export default function CarArt({ car }: Props) {
  const id = useId().replace(/:/g, '');
  const light = car.body_color === '#E8ECF4' ? '#ffffff' : car.body_color;
  return (
    <svg viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={car.scene_1} />
          <stop offset="1" stopColor={car.scene_2} />
        </linearGradient>
        <linearGradient id={`bd${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={car.body_color_2} />
        </linearGradient>
        <linearGradient id={`gl${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe6ff" stopOpacity=".9" />
          <stop offset="1" stopColor="#5b7ea8" stopOpacity=".7" />
        </linearGradient>
        <radialGradient id={`sh${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#000" stopOpacity=".5" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="168" fill={`url(#bg${id})`} />
      <circle cx="255" cy="34" r="46" fill="#fff" opacity=".05" />
      <ellipse cx="160" cy="140" rx="120" ry="16" fill={`url(#sh${id})`} />
      <path
        d="M30 118 L44 96 Q52 84 74 82 L108 58 Q118 51 134 51 L206 51 Q224 51 236 62 L266 86 Q286 90 292 104 L294 116 Q294 122 286 122 L38 122 Q30 122 30 118 Z"
        fill={`url(#bd${id})`}
        stroke="rgba(255,255,255,.14)"
        strokeWidth="1"
      />
      <path d="M118 62 Q125 57 134 57 L168 57 L168 80 L104 80 Z" fill={`url(#gl${id})`} opacity=".92" />
      <path d="M176 57 L204 57 Q218 57 228 66 L242 80 L176 80 Z" fill={`url(#gl${id})`} opacity=".92" />
      <path d="M46 96 L286 100" stroke="#fff" strokeOpacity=".18" strokeWidth="2" fill="none" />
      <rect x="284" y="98" width="10" height="9" rx="3" fill="#ffe9b0" />
      <rect x="30" y="100" width="8" height="8" rx="2.5" fill="#ff5a5a" />
      <g>
        <circle cx="98" cy="122" r="26" fill="#0c0f16" />
        <circle cx="98" cy="122" r="14" fill="#20283a" />
        <circle cx="98" cy="122" r="14" fill="none" stroke="#4a92ff" strokeWidth="1.5" opacity=".8" />
        <circle cx="98" cy="122" r="4.5" fill="#39445c" />
      </g>
      <g>
        <circle cx="232" cy="122" r="26" fill="#0c0f16" />
        <circle cx="232" cy="122" r="14" fill="#20283a" />
        <circle cx="232" cy="122" r="14" fill="none" stroke="#4a92ff" strokeWidth="1.5" opacity=".8" />
        <circle cx="232" cy="122" r="4.5" fill="#39445c" />
      </g>
    </svg>
  );
}
