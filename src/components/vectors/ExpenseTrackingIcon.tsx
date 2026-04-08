const ExpenseTrackingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Receipt */}
    <path
      d="M35 15H85V95L78 90L71 95L64 90L57 95L50 90L43 95L35 100V15Z"
      className="fill-secondary stroke-primary/30"
      strokeWidth="2"
    />
    <rect x="35" y="15" width="50" height="16" rx="0" className="fill-primary/15" />

    {/* Receipt lines */}
    <rect x="44" y="40" width="32" height="4" rx="2" className="fill-muted-foreground/40" />
    <rect x="44" y="50" width="24" height="4" rx="2" className="fill-muted-foreground/30" />
    <rect x="44" y="60" width="28" height="4" rx="2" className="fill-muted-foreground/30" />

    {/* Divider */}
    <line x1="44" y1="72" x2="76" y2="72" className="stroke-muted-foreground/20" strokeWidth="1.5" strokeDasharray="3 2" />

    {/* Total amount */}
    <rect x="44" y="78" width="14" height="5" rx="2.5" className="fill-muted-foreground/30" />
    <rect x="62" y="77" width="14" height="7" rx="3.5" className="fill-primary/80" />

    {/* Animated coin stack - left */}
    <g className="animate-float">
      <ellipse cx="18" cy="58" rx="10" ry="4" className="fill-primary/25" />
      <ellipse cx="18" cy="54" rx="10" ry="4" className="fill-primary/35" />
      <ellipse cx="18" cy="50" rx="10" ry="4" className="fill-primary/50" />
      <text x="18" y="53" textAnchor="middle" className="fill-primary-foreground text-[6px] font-bold" style={{ fontFamily: 'var(--font-body)' }}>₹</text>
    </g>

    {/* Animated checkmark badge */}
    <g className="animate-pulse-glow">
      <circle cx="90" cy="30" r="12" className="fill-primary/20" />
      <path
        d="M85 30L88 33L95 26"
        className="stroke-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>

    {/* Floating category tag */}
    <g className="animate-float-delayed">
      <rect x="88" y="65" width="24" height="12" rx="6" className="fill-primary/15" />
      <circle cx="96" cy="71" r="2" className="fill-primary/60" />
      <rect x="100" y="69.5" width="8" height="3" rx="1.5" className="fill-primary/40" />
    </g>

    {/* Small sparkle */}
    <g className="animate-pulse-glow">
      <path d="M28 25L29.5 29L33.5 30.5L29.5 32L28 36L26.5 32L22.5 30.5L26.5 29Z" className="fill-primary/40" />
    </g>
  </svg>
);

export default ExpenseTrackingIcon;
