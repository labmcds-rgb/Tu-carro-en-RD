import type { CSSProperties } from 'react';

type Props = { className?: string; style?: CSSProperties };

/* --- Íconos de trazo (stroke) --- */
const stroke = (d: React.ReactNode, vb = '0 0 24 24', sw = 2) =>
  function IconStroke({ className, style }: Props) {
    return (
      <svg viewBox={vb} fill="none" stroke="currentColor" strokeWidth={sw} className={className} style={style}>
        {d}
      </svg>
    );
  };

/* --- Íconos de relleno (fill) --- */
const fill = (d: React.ReactNode, vb = '0 0 24 24') =>
  function IconFill({ className, style }: Props) {
    return (
      <svg viewBox={vb} fill="currentColor" className={className} style={style}>
        {d}
      </svg>
    );
  };

export const IcStar = fill(<path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z" />);
export const IcHeart = stroke(
  <path d="M12 21s-7-4.5-9.5-8.5C.8 9.6 2 6 5.2 6c1.9 0 3.1 1.1 3.8 2.2C9.7 7.1 10.9 6 12.8 6 16 6 17.2 9.6 15.5 12.5 13 16.5 12 21 12 21z" />,
);
export const IcSeat = stroke(
  <>
    <path d="M6 19v-7a2 2 0 0 1 2-2h1l1-5h4l1 5h1a2 2 0 0 1 2 2v7" />
    <path d="M6 15h12" />
  </>,
);
export const IcGear = stroke(
  <>
    <path d="M6 4v16M18 4v16M6 12h12M12 4v4" />
    <circle cx="6" cy="4" r="1.6" />
    <circle cx="18" cy="4" r="1.6" />
    <circle cx="12" cy="4" r="1.6" />
  </>,
);
export const IcFuel = stroke(
  <>
    <rect x="4" y="4" width="9" height="16" rx="2" />
    <path d="M4 12h9M13 8l3 2v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9l-3-3" />
  </>,
);
export const IcBolt = stroke(<path d="M13 2 4 14h7l-1 8 9-12h-7z" strokeLinejoin="round" />);
export const IcCalendar = stroke(
  <>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </>,
);
export const IcPin = stroke(
  <>
    <path d="M12 21s-7-5.7-7-11a7 7 0 0 1 14 0c0 5.3-7 11-7 11z" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="2.4" />
  </>,
);
export const IcSearch = stroke(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
);
export const IcFilter = stroke(<path d="M4 6h16M7 12h10M10 18h4" />);
export const IcSort = stroke(<path d="M3 6h18M6 12h12M10 18h4" />);
export const IcCheck = stroke(<path d="m5 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />, '0 0 24 24', 2.5);
export const IcX = stroke(<path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />, '0 0 24 24', 2.4);
export const IcChevronLeft = stroke(<path d="m15 18-6-6 6-6" />, '0 0 24 24', 2.4);
export const IcChevronRight = stroke(<path d="m9 18 6-6-6-6" />, '0 0 24 24', 2.4);
export const IcAlert = stroke(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </>,
);
export const IcUser = stroke(
  <>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </>,
);
export const IcPhone = stroke(
  <path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
);
export const IcMail = stroke(
  <>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </>,
);
export const IcLock = stroke(
  <>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </>,
);
export const IcEye = stroke(
  <>
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);
export const IcBell = stroke(<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />);
export const IcDoc = stroke(
  <>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6M8 13h8M8 17h5" />
  </>,
);
export const IcLogout = stroke(<path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />);
export const IcSettings = stroke(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.3-1.3L13.8 2h-3.6l-.5 2.4a7 7 0 0 0-2.3 1.3l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.3l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.3 1.3l.5 2.4h3.6l.5-2.4a7 7 0 0 0 2.3-1.3l2.3.9 2-3.4-2-1.5A7 7 0 0 0 19 12z" />
  </>,
);
export const IcChat = stroke(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
export const IcHome = stroke(<path d="M3 10.5 12 3l9 7.5M5 9v11h14V9" strokeLinejoin="round" />);
export const IcCarFront = stroke(
  <>
    <path d="M5 20l2-6c.4-1.2 1.5-2 2.8-2h4.4c1.3 0 2.4.8 2.8 2l2 6M4 20h16M7 16h10" />
    <circle cx="8.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="20" r="1.4" fill="currentColor" stroke="none" />
  </>,
);
export const IcShield = stroke(
  <>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);
export const IcPlane = stroke(
  <path d="M2 16l9-3V5a1.5 1.5 0 0 1 3 0v8l7 3v2l-7-1.5V21l2 1.5V24l-4-1-4 1v-1.5L11 21v-4.5L2 18z" />,
);
export const IcUserPlus = stroke(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M17 8h4M19 6v4" />
  </>,
);
export const IcWhatsApp = fill(
  <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-4-1.3-2.6-1.3-4.2-4-4.3-4.2-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.4.5c-.1.2-.3.3-.1.6.1.3.7 1.1 1.4 1.8 1 .9 1.7 1.1 2 1.2.2.1.4.1.5-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.5.3.1.2.1.9-.1 1.5z" />,
);
export const IcGoogle = fill(
  <path d="M12 11v2.9h4.1a3.9 3.9 0 0 1-4.1 2.9 4.3 4.3 0 0 1 0-8.6 3.9 3.9 0 0 1 2.7 1l2.1-2.1A7 7 0 1 0 19 12c0-.4 0-.7-.1-1z" />,
);
