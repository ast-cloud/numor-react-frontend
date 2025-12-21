const AccountingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Document base */}
    <rect
      x="25"
      y="15"
      width="70"
      height="90"
      rx="8"
      className="fill-secondary stroke-primary/30"
      strokeWidth="2"
    />
    
    {/* Header stripe */}
    <rect
      x="25"
      y="15"
      width="70"
      height="20"
      rx="8"
      className="fill-primary/20"
    />
    <rect
      x="25"
      y="27"
      width="70"
      height="8"
      className="fill-primary/20"
    />
    
    {/* Invoice lines */}
    <rect x="35" y="45" width="40" height="4" rx="2" className="fill-muted-foreground/40" />
    <rect x="35" y="55" width="50" height="4" rx="2" className="fill-muted-foreground/30" />
    <rect x="35" y="65" width="35" height="4" rx="2" className="fill-muted-foreground/30" />
    
    {/* Amount highlight */}
    <rect x="35" y="80" width="25" height="8" rx="4" className="fill-primary/30" />
    <rect x="65" y="80" width="20" height="8" rx="4" className="fill-primary" />
    
    {/* Floating elements */}
    <circle cx="95" cy="25" r="12" className="fill-primary/20 animate-pulse-glow" />
    <path
      d="M92 25L94 27L98 23"
      className="stroke-primary"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Dollar sign floating */}
    <g className="animate-float">
      <circle cx="15" cy="50" r="10" className="fill-primary/10" />
      <text x="15" y="54" textAnchor="middle" className="fill-primary text-xs font-bold">$</text>
    </g>
  </svg>
);

export default AccountingIcon;
