const ExpenseTrackingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <style>{`
      @keyframes flyIn1 { 0%,100% { transform: translate(0,0) rotate(-8deg); } 50% { transform: translate(6px,-4px) rotate(-5deg); } }
      @keyframes flyIn2 { 0%,100% { transform: translate(0,0) rotate(5deg); } 50% { transform: translate(4px,5px) rotate(8deg); } }
      @keyframes flyIn3 { 0%,100% { transform: translate(0,0) rotate(-3deg); } 50% { transform: translate(-3px,-6px) rotate(0deg); } }
      @keyframes flyIn4 { 0%,100% { transform: translate(0,0) rotate(6deg); } 50% { transform: translate(5px,3px) rotate(3deg); } }
      @keyframes folderBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      .bill1 { animation: flyIn1 3s ease-in-out infinite; }
      .bill2 { animation: flyIn2 3.5s ease-in-out infinite; }
      .bill3 { animation: flyIn3 2.8s ease-in-out infinite; }
      .bill4 { animation: flyIn4 3.2s ease-in-out infinite; }
      .folder-bounce { animation: folderBounce 2s ease-in-out infinite; }
    `}</style>

    {/* Scattered bills - left side */}
    {/* Bill 1 - top left */}
    <g className="bill1">
      <rect x="8" y="10" width="28" height="36" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" transform="rotate(-12 22 28)" />
      <line x1="14" y1="18" x2="30" y2="18" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" transform="rotate(-12 22 28)" />
      <line x1="14" y1="22" x2="28" y2="22" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(-12 22 28)" />
      <line x1="14" y1="26" x2="26" y2="26" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(-12 22 28)" />
      <rect x="14" y="30" width="10" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.2" transform="rotate(-12 22 28)" />
    </g>

    {/* Bill 2 - middle left */}
    <g className="bill2">
      <rect x="18" y="52" width="26" height="34" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" transform="rotate(6 31 69)" />
      <line x1="23" y1="59" x2="39" y2="59" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" transform="rotate(6 31 69)" />
      <line x1="23" y1="63" x2="37" y2="63" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(6 31 69)" />
      <line x1="23" y1="67" x2="35" y2="67" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(6 31 69)" />
      <rect x="23" y="72" width="8" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.25" transform="rotate(6 31 69)" />
    </g>

    {/* Bill 3 - top center-left */}
    <g className="bill3">
      <rect x="48" y="5" width="24" height="30" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" transform="rotate(-5 60 20)" />
      <line x1="52" y1="12" x2="68" y2="12" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" transform="rotate(-5 60 20)" />
      <line x1="52" y1="16" x2="65" y2="16" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(-5 60 20)" />
      <rect x="52" y="22" width="10" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.2" transform="rotate(-5 60 20)" />
    </g>

    {/* Bill 4 - bottom left */}
    <g className="bill4">
      <rect x="5" y="95" width="30" height="34" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" transform="rotate(8 20 112)" />
      <line x1="11" y1="103" x2="29" y2="103" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" transform="rotate(8 20 112)" />
      <line x1="11" y1="107" x2="27" y2="107" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(8 20 112)" />
      <line x1="11" y1="111" x2="24" y2="111" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" transform="rotate(8 20 112)" />
      <rect x="11" y="116" width="12" height="4" rx="1" fill="hsl(var(--primary))" opacity="0.2" transform="rotate(8 20 112)" />
    </g>

    {/* Flow arrows - bills flying toward phone */}
    <path d="M 40 30 Q 65 35, 90 50" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2s" repeatCount="indefinite" />
    </path>
    <path d="M 45 68 Q 70 65, 90 60" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2.5s" repeatCount="indefinite" />
    </path>
    <path d="M 72 22 Q 85 35, 95 48" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.8s" repeatCount="indefinite" />
    </path>
    <path d="M 38 108 Q 70 100, 92 85" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" fill="none" strokeDasharray="3 3">
      <animate attributeName="stroke-dashoffset" from="24" to="0" dur="2.2s" repeatCount="indefinite" />
    </path>

    {/* Phone frame */}
    <rect x="90" y="12" width="68" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
    {/* Phone notch */}
    <rect x="112" y="15" width="24" height="5" rx="2.5" fill="hsl(var(--muted))" />
    {/* Phone screen area */}
    <rect x="95" y="24" width="58" height="96" rx="4" fill="hsl(var(--background))" />

    {/* Progress bar on screen */}
    <rect x="100" y="29" width="48" height="5" rx="2.5" fill="hsl(var(--muted))" />
    <rect x="100" y="29" width="48" height="5" rx="2.5" fill="hsl(var(--primary))" opacity="0.3">
      <animate attributeName="width" from="10" to="48" dur="3s" repeatCount="indefinite" />
    </rect>
    {/* Checkmark */}
    <circle cx="152" cy="31.5" r="4" fill="hsl(var(--primary))" opacity="0.2" />
    <path d="M150 31.5 L151.5 33 L154 29.5" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    {/* Label: "Categorized" */}
    <text x="124" y="44" textAnchor="middle" fontSize="5" fill="hsl(var(--muted-foreground))" opacity="0.6" style={{ fontFamily: 'var(--font-body)' }}>Categorized</text>

    {/* Folder 1 - Food */}
    <g className="folder-bounce">
      <rect x="100" y="50" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="100" y="48" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="111" y="61" textAnchor="middle" fontSize="7" style={{ fontFamily: 'var(--font-body)' }}>🍔</text>
      <text x="111" y="73" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Food</text>
    </g>

    {/* Folder 2 - Travel */}
    <g className="folder-bounce" style={{ animationDelay: '0.3s' }}>
      <rect x="126" y="50" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="126" y="48" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="137" y="61" textAnchor="middle" fontSize="7" style={{ fontFamily: 'var(--font-body)' }}>✈️</text>
      <text x="137" y="73" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Travel</text>
    </g>

    {/* Folder 3 - Rent */}
    <g className="folder-bounce" style={{ animationDelay: '0.6s' }}>
      <rect x="100" y="80" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="100" y="78" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="111" y="91" textAnchor="middle" fontSize="7" style={{ fontFamily: 'var(--font-body)' }}>🏠</text>
      <text x="111" y="103" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Rent</text>
    </g>

    {/* Folder 4 - Bills */}
    <g className="folder-bounce" style={{ animationDelay: '0.9s' }}>
      <rect x="126" y="80" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="126" y="78" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="137" y="91" textAnchor="middle" fontSize="7" style={{ fontFamily: 'var(--font-body)' }}>⚡</text>
      <text x="137" y="103" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Bills</text>
    </g>

    {/* Small receipt going into folder - animated */}
    <g opacity="0.6">
      <rect x="108" y="52" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5">
        <animate attributeName="opacity" values="0;0.8;0" dur="2s" repeatCount="indefinite" />
        <animate attributeName="y" values="44;52" dur="2s" repeatCount="indefinite" />
      </rect>
    </g>
    <g opacity="0.6">
      <rect x="134" y="82" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.5">
        <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="74;82" dur="2.5s" repeatCount="indefinite" />
      </rect>
    </g>
  </svg>
);

export default ExpenseTrackingIcon;
