const CAConnectIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* User avatar left */}
    <g>
      <circle cx="35" cy="45" r="18" className="fill-secondary stroke-primary/30" strokeWidth="2" />
      <circle cx="35" cy="40" r="8" className="fill-muted-foreground/30" />
      <path d="M22 60C22 52 28 48 35 48C42 48 48 52 48 60" className="fill-muted-foreground/30" />
    </g>
    
    {/* CA avatar right */}
    <g>
      <circle cx="85" cy="45" r="18" className="fill-primary/20 stroke-primary" strokeWidth="2" />
      <circle cx="85" cy="40" r="8" className="fill-primary/40" />
      <path d="M72 60C72 52 78 48 85 48C92 48 98 52 98 60" className="fill-primary/40" />
      {/* CA badge */}
      <circle cx="97" cy="55" r="8" className="fill-primary" />
      <text x="97" y="58" textAnchor="middle" className="fill-primary-foreground text-[8px] font-bold">CA</text>
    </g>
    
    {/* Connection line with pulse */}
    <g className="animate-pulse-glow">
      <line x1="53" y1="45" x2="67" y2="45" className="stroke-primary" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="60" cy="45" r="4" className="fill-primary" />
    </g>
    
    {/* Calendar/booking icon */}
    <g className="animate-float">
      <rect x="42" y="75" width="36" height="30" rx="4" className="fill-secondary stroke-primary/40" strokeWidth="1.5" />
      <rect x="42" y="75" width="36" height="8" rx="4" className="fill-primary/30" />
      <rect x="42" y="80" width="36" height="3" className="fill-primary/30" />
      <circle cx="50" cy="92" r="2" className="fill-muted-foreground/40" />
      <circle cx="60" cy="92" r="2" className="fill-primary" />
      <circle cx="70" cy="92" r="2" className="fill-muted-foreground/40" />
      <circle cx="50" cy="100" r="2" className="fill-muted-foreground/40" />
      <circle cx="60" cy="100" r="2" className="fill-muted-foreground/40" />
      <circle cx="70" cy="100" r="2" className="fill-muted-foreground/40" />
    </g>
    
    {/* Star rating */}
    <g>
      <path d="M15 85L16.5 88.5L20.5 89L17.75 91.5L18.5 95.5L15 93.5L11.5 95.5L12.25 91.5L9.5 89L13.5 88.5Z" className="fill-primary/60" />
      <path d="M105 85L106.5 88.5L110.5 89L107.75 91.5L108.5 95.5L105 93.5L101.5 95.5L102.25 91.5L99.5 89L103.5 88.5Z" className="fill-primary/60" />
    </g>
  </svg>
);

export default CAConnectIcon;
