const ExpenseTrackingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 160 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Scattered expense items - left side */}
    <g className="animate-float">
      <rect x="2" y="8" width="36" height="16" rx="8" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="20" y="19" textAnchor="middle" className="fill-primary/70 text-[9px]" style={{ fontFamily: 'var(--font-body)' }}>Food</text>
    </g>

    <g className="animate-float-delayed">
      <rect x="5" y="30" width="34" height="16" rx="8" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="22" y="41" textAnchor="middle" className="fill-primary/70 text-[9px]" style={{ fontFamily: 'var(--font-body)' }}>Rent</text>
    </g>

    <g className="animate-float">
      <rect x="0" y="52" width="38" height="16" rx="8" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="19" y="63" textAnchor="middle" className="fill-primary/70 text-[9px]" style={{ fontFamily: 'var(--font-body)' }}>Travel</text>
    </g>

    <g className="animate-float-delayed">
      <rect x="1" y="74" width="46" height="16" rx="8" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="24" y="85" textAnchor="middle" className="fill-primary/70 text-[8px]" style={{ fontFamily: 'var(--font-body)' }}>Electricity</text>
    </g>

    {/* Flow arrows converging to center */}
    <path d="M39 16 Q 55 16, 62 35" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M40 38 Q 52 38, 62 42" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M39 60 Q 52 60, 62 52" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M48 82 Q 56 82, 62 60" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Central funnel */}
    <g className="animate-pulse-glow">
      <path d="M62 24 L82 24 L77 72 L67 72 Z" className="fill-primary/10 stroke-primary/40" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="64" y1="36" x2="80" y2="36" className="stroke-primary/20" strokeWidth="1" />
      <line x1="65" y1="48" x2="79" y2="48" className="stroke-primary/20" strokeWidth="1" />
      <line x1="66" y1="60" x2="78" y2="60" className="stroke-primary/20" strokeWidth="1" />
    </g>

    {/* Output arrows to grouped categories */}
    <path d="M78 35 Q 88 28, 96 20" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M79 48 Q 88 48, 96 48" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M78 62 Q 88 68, 96 74" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Grouped category cards - right side */}
    <g>
      <rect x="96" y="6" width="58" height="28" rx="7" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="108" cy="16" r="5" className="fill-primary/30" />
      <text x="108" y="18.5" textAnchor="middle" className="fill-primary text-[7px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>🍔</text>
      <rect x="117" y="13" width="28" height="5" rx="2.5" className="fill-muted-foreground/30" />
      <rect x="117" y="22" width="18" height="4" rx="2" className="fill-primary/40" />
    </g>

    <g>
      <rect x="96" y="38" width="58" height="18" rx="7" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="108" cy="47" r="5" className="fill-primary/30" />
      <text x="108" y="49.5" textAnchor="middle" className="fill-primary text-[7px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>🏠</text>
      <rect x="117" y="45" width="28" height="5" rx="2.5" className="fill-muted-foreground/30" />
    </g>

    <g>
      <rect x="96" y="60" width="58" height="28" rx="7" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="108" cy="70" r="5" className="fill-primary/30" />
      <text x="108" y="72.5" textAnchor="middle" className="fill-primary text-[7px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>✈️</text>
      <rect x="117" y="68" width="28" height="5" rx="2.5" className="fill-muted-foreground/30" />
      <rect x="117" y="77" width="16" height="4" rx="2" className="fill-primary/40" />
    </g>
  </svg>
);

export default ExpenseTrackingIcon;
