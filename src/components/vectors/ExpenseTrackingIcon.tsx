const ExpenseTrackingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Scattered expense items - left side */}
    <g className="animate-float">
      <rect x="5" y="20" width="28" height="14" rx="7" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="19" y="29.5" textAnchor="middle" className="fill-primary/70 text-[7px]" style={{ fontFamily: 'var(--font-body)' }}>Food</text>
    </g>

    <g className="animate-float-delayed">
      <rect x="8" y="42" width="26" height="14" rx="7" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="21" y="51.5" textAnchor="middle" className="fill-primary/70 text-[7px]" style={{ fontFamily: 'var(--font-body)' }}>Rent</text>
    </g>

    <g className="animate-float">
      <rect x="3" y="64" width="30" height="14" rx="7" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="18" y="73.5" textAnchor="middle" className="fill-primary/70 text-[7px]" style={{ fontFamily: 'var(--font-body)' }}>Travel</text>
    </g>

    <g className="animate-float-delayed">
      <rect x="6" y="86" width="36" height="14" rx="7" className="fill-primary/15 stroke-primary/30" strokeWidth="1" />
      <text x="24" y="95.5" textAnchor="middle" className="fill-primary/70 text-[6px]" style={{ fontFamily: 'var(--font-body)' }}>Electricity</text>
    </g>

    {/* Flow arrows converging to center */}
    <path d="M34 27 Q 48 27, 52 45" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M35 49 Q 45 49, 52 50" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M34 71 Q 45 71, 52 60" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M35 93 Q 48 93, 52 68" className="stroke-primary/25" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Central funnel / organizer */}
    <g className="animate-pulse-glow">
      <path d="M52 35 L68 35 L64 75 L56 75 Z" className="fill-primary/10 stroke-primary/40" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Funnel lines */}
      <line x1="54" y1="45" x2="66" y2="45" className="stroke-primary/20" strokeWidth="1" />
      <line x1="55" y1="55" x2="65" y2="55" className="stroke-primary/20" strokeWidth="1" />
      <line x1="56" y1="65" x2="64" y2="65" className="stroke-primary/20" strokeWidth="1" />
    </g>

    {/* Output arrows to grouped categories - right side */}
    <path d="M64 45 Q 72 40, 78 32" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M65 55 Q 72 55, 78 55" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    <path d="M64 65 Q 72 70, 78 78" className="stroke-primary/30" strokeWidth="1.5" fill="none" strokeLinecap="round" />

    {/* Grouped category cards - right side */}
    <g>
      <rect x="78" y="20" width="38" height="24" rx="6" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="88" cy="28" r="4" className="fill-primary/30" />
      <text x="88" y="30" textAnchor="middle" className="fill-primary text-[5px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>🍔</text>
      <rect x="95" y="26" width="16" height="4" rx="2" className="fill-muted-foreground/30" />
      <rect x="95" y="33" width="12" height="3" rx="1.5" className="fill-primary/40" />
    </g>

    <g>
      <rect x="78" y="48" width="38" height="14" rx="6" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="88" cy="55" r="4" className="fill-primary/30" />
      <text x="88" y="57" textAnchor="middle" className="fill-primary text-[5px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>🏠</text>
      <rect x="95" y="53" width="16" height="4" rx="2" className="fill-muted-foreground/30" />
    </g>

    <g>
      <rect x="78" y="66" width="38" height="24" rx="6" className="fill-secondary stroke-primary/30" strokeWidth="1.5" />
      <circle cx="88" cy="74" r="4" className="fill-primary/30" />
      <text x="88" y="76" textAnchor="middle" className="fill-primary text-[5px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>✈️</text>
      <rect x="95" y="72" width="16" height="4" rx="2" className="fill-muted-foreground/30" />
      <rect x="95" y="79" width="10" height="3" rx="1.5" className="fill-primary/40" />
    </g>
  </svg>
);

export default ExpenseTrackingIcon;
