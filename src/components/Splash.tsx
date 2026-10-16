export default function Splash() {
  return (
    <div className="splash">
      <div className="splash-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M4 20l2-6c.4-1.2 1.5-2 2.8-2h10.4c1.3 0 2.4.8 2.8 2l2 6"
            stroke="#3C7BFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M3 20h26v3a2 2 0 0 1-2 2h-1.5a2.5 2.5 0 0 1-5 0h-7a2.5 2.5 0 0 1-5 0H5a2 2 0 0 1-2-2v-3z"
            fill="#3C7BFF"
          />
        </svg>
      </div>
      <div className="splash-spin" />
    </div>
  );
}
