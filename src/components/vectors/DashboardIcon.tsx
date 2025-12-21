const DashboardIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Main dashboard frame */}
    <rect
      x="15"
      y="20"
      width="90"
      height="80"
      rx="8"
      className="fill-secondary stroke-primary/30"
      strokeWidth="2"
    />
    
    {/* Top bar */}
    <rect x="15" y="20" width="90" height="12" rx="8" className="fill-muted" />
    <rect x="15" y="28" width="90" height="4" className="fill-muted" />
    <circle cx="25" cy="26" r="3" className="fill-destructive/60" />
    <circle cx="35" cy="26" r="3" className="fill-primary/60" />
    <circle cx="45" cy="26" r="3" className="fill-primary/30" />
    
    {/* Left panel - pie chart */}
    <rect x="22" y="40" width="35" height="35" rx="4" className="fill-card" />
    <circle cx="39.5" cy="57.5" r="12" className="fill-transparent stroke-muted-foreground/20" strokeWidth="4" />
    <path
      d="M39.5 45.5A12 12 0 0 1 51.5 57.5L39.5 57.5Z"
      className="fill-primary"
    />
    <path
      d="M39.5 57.5A12 12 0 0 1 27.5 57.5L39.5 57.5Z"
      className="fill-primary/40"
    />
    
    {/* Right panel - bar chart */}
    <rect x="63" y="40" width="35" height="35" rx="4" className="fill-card" />
    <rect x="68" y="62" width="6" height="8" rx="1" className="fill-primary/40" />
    <rect x="77" y="55" width="6" height="15" rx="1" className="fill-primary/60" />
    <rect x="86" y="48" width="6" height="22" rx="1" className="fill-primary" />
    
    {/* Bottom stats */}
    <rect x="22" y="80" width="25" height="14" rx="4" className="fill-card" />
    <rect x="25" y="84" width="12" height="3" rx="1" className="fill-muted-foreground/30" />
    <rect x="25" y="89" width="18" height="2" rx="1" className="fill-primary/60" />
    
    <rect x="52" y="80" width="25" height="14" rx="4" className="fill-card" />
    <rect x="55" y="84" width="12" height="3" rx="1" className="fill-muted-foreground/30" />
    <rect x="55" y="89" width="15" height="2" rx="1" className="fill-primary/40" />
    
    <rect x="82" y="80" width="16" height="14" rx="4" className="fill-primary/20" />
    <path d="M88 84L90 87L93 83" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    
    {/* Floating notification */}
    <g className="animate-float">
      <rect x="85" y="8" width="24" height="18" rx="4" className="fill-primary shadow-glow" />
      <text x="97" y="20" textAnchor="middle" className="fill-primary-foreground text-[9px] font-bold">+24%</text>
    </g>
  </svg>
);

export default DashboardIcon;
