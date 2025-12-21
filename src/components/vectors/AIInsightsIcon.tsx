const AIInsightsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Brain outline */}
    <ellipse cx="60" cy="55" rx="35" ry="32" className="fill-secondary stroke-primary/40" strokeWidth="2" />
    
    {/* Neural network nodes */}
    <circle cx="45" cy="45" r="6" className="fill-primary/40" />
    <circle cx="75" cy="45" r="6" className="fill-primary/40" />
    <circle cx="60" cy="35" r="5" className="fill-primary/60" />
    <circle cx="50" cy="60" r="5" className="fill-primary/50" />
    <circle cx="70" cy="60" r="5" className="fill-primary/50" />
    <circle cx="60" cy="70" r="6" className="fill-primary" />
    
    {/* Connections */}
    <line x1="45" y1="45" x2="60" y2="35" className="stroke-primary/30" strokeWidth="1.5" />
    <line x1="75" y1="45" x2="60" y2="35" className="stroke-primary/30" strokeWidth="1.5" />
    <line x1="45" y1="45" x2="50" y2="60" className="stroke-primary/30" strokeWidth="1.5" />
    <line x1="75" y1="45" x2="70" y2="60" className="stroke-primary/30" strokeWidth="1.5" />
    <line x1="50" y1="60" x2="60" y2="70" className="stroke-primary/40" strokeWidth="1.5" />
    <line x1="70" y1="60" x2="60" y2="70" className="stroke-primary/40" strokeWidth="1.5" />
    
    {/* Chat bubbles */}
    <g className="animate-float">
      <rect x="80" y="75" width="30" height="20" rx="10" className="fill-primary/20" />
      <circle cx="88" cy="85" r="2" className="fill-primary/60" />
      <circle cx="95" cy="85" r="2" className="fill-primary/60" />
      <circle cx="102" cy="85" r="2" className="fill-primary/60" />
    </g>
    
    {/* Sparkles */}
    <g className="animate-pulse-glow">
      <path d="M100 20L102 25L107 27L102 29L100 34L98 29L93 27L98 25Z" className="fill-primary/60" />
      <path d="M20 70L21 73L24 74L21 75L20 78L19 75L16 74L19 73Z" className="fill-primary/40" />
    </g>
    
    {/* Lightbulb idea indicator */}
    <g className="animate-float-delayed">
      <circle cx="60" cy="10" r="8" className="fill-primary/20" />
      <path d="M57 7V13M60 7V13M63 7V13" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  </svg>
);

export default AIInsightsIcon;
