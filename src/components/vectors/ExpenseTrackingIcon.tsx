const ExpenseTrackingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 200 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <style>{`
      @keyframes billFly1 {
        0% { transform: translate(-20px, -10px) rotate(-15deg); opacity: 0; }
        15% { opacity: 0.8; }
        85% { opacity: 0.6; }
        100% { transform: translate(60px, 25px) rotate(0deg); opacity: 0; }
      }
      @keyframes billFly2 {
        0% { transform: translate(-15px, 5px) rotate(10deg); opacity: 0; }
        15% { opacity: 0.8; }
        85% { opacity: 0.6; }
        100% { transform: translate(50px, -5px) rotate(-2deg); opacity: 0; }
      }
      @keyframes billFly3 {
        0% { transform: translate(-10px, -15px) rotate(-8deg); opacity: 0; }
        15% { opacity: 0.8; }
        85% { opacity: 0.6; }
        100% { transform: translate(35px, 30px) rotate(2deg); opacity: 0; }
      }
      @keyframes billFly4 {
        0% { transform: translate(-18px, 10px) rotate(12deg); opacity: 0; }
        15% { opacity: 0.8; }
        85% { opacity: 0.6; }
        100% { transform: translate(55px, -20px) rotate(-3deg); opacity: 0; }
      }
      @keyframes billFly5 {
        0% { transform: translate(-12px, -5px) rotate(-6deg); opacity: 0; }
        15% { opacity: 0.7; }
        85% { opacity: 0.5; }
        100% { transform: translate(45px, 15px) rotate(1deg); opacity: 0; }
      }
      @keyframes billFly6 {
        0% { transform: translate(-22px, 8px) rotate(9deg); opacity: 0; }
        15% { opacity: 0.7; }
        85% { opacity: 0.5; }
        100% { transform: translate(52px, -12px) rotate(-1deg); opacity: 0; }
      }
      @keyframes folderBounce { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
      .bill-fly-1 { animation: billFly1 3s ease-in-out infinite; }
      .bill-fly-2 { animation: billFly2 3.2s ease-in-out 0.5s infinite; }
      .bill-fly-3 { animation: billFly3 2.8s ease-in-out 1s infinite; }
      .bill-fly-4 { animation: billFly4 3.5s ease-in-out 1.5s infinite; }
      .bill-fly-5 { animation: billFly5 3.1s ease-in-out 0.8s infinite; }
      .bill-fly-6 { animation: billFly6 2.9s ease-in-out 2s infinite; }
      .folder-bounce { animation: folderBounce 2s ease-in-out infinite; }
    `}</style>

    {/* Flying bills - continuously flowing toward phone */}
    <g className="bill-fly-1">
      <rect x="10" y="15" width="24" height="32" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="14" y1="21" x2="30" y2="21" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="14" y1="25" x2="28" y2="25" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <line x1="14" y1="29" x2="25" y2="29" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="14" y="34" width="10" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="bill-fly-2">
      <rect x="20" y="60" width="22" height="28" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="24" y1="66" x2="38" y2="66" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="24" y1="70" x2="36" y2="70" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="24" y="76" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.25" />
    </g>

    <g className="bill-fly-3">
      <rect x="45" y="8" width="20" height="26" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="49" y1="14" x2="61" y2="14" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="49" y1="18" x2="59" y2="18" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="49" y="24" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="bill-fly-4">
      <rect x="8" y="95" width="26" height="30" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="13" y1="101" x2="29" y2="101" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="13" y1="105" x2="27" y2="105" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <line x1="13" y1="109" x2="24" y2="109" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="13" y="114" width="10" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="bill-fly-5">
      <rect x="35" y="40" width="20" height="26" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="39" y1="46" x2="51" y2="46" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="39" y1="50" x2="49" y2="50" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="39" y="56" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="bill-fly-6">
      <rect x="25" y="105" width="22" height="28" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <line x1="29" y1="111" x2="43" y2="111" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.4" />
      <line x1="29" y1="115" x2="41" y2="115" stroke="hsl(var(--muted-foreground))" strokeWidth="0.7" opacity="0.3" />
      <rect x="29" y="121" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    {/* Flow trail particles */}
    <circle cx="55" cy="35" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="55;85" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="50" cy="65" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="50;88" dur="2.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <circle cx="60" cy="50" r="1" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="60;90" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.25;0" dur="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="45" cy="100" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="45;88" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="cy" values="100;85" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2.5s" repeatCount="indefinite" />
    </circle>

    {/* Phone frame */}
    <rect x="90" y="12" width="68" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
    <rect x="112" y="15" width="24" height="5" rx="2.5" fill="hsl(var(--muted))" />
    <rect x="95" y="24" width="58" height="96" rx="4" fill="hsl(var(--background))" />

    {/* Progress bar */}
    <rect x="100" y="29" width="48" height="5" rx="2.5" fill="hsl(var(--muted))" />
    <rect x="100" y="29" width="48" height="5" rx="2.5" fill="hsl(var(--primary))" opacity="0.3">
      <animate attributeName="width" from="10" to="48" dur="3s" repeatCount="indefinite" />
    </rect>
    <circle cx="152" cy="31.5" r="4" fill="hsl(var(--primary))" opacity="0.2" />
    <path d="M150 31.5 L151.5 33 L154 29.5" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />

    <text x="124" y="44" textAnchor="middle" fontSize="5" fill="hsl(var(--muted-foreground))" opacity="0.6" style={{ fontFamily: 'var(--font-body)' }}>Categorized</text>

    {/* Folders */}
    <g className="folder-bounce">
      <rect x="100" y="50" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="100" y="48" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="111" y="61" textAnchor="middle" fontSize="7">🍔</text>
      <text x="111" y="73" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Food</text>
    </g>

    <g className="folder-bounce" style={{ animationDelay: '0.3s' }}>
      <rect x="126" y="50" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="126" y="48" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="137" y="61" textAnchor="middle" fontSize="7">✈️</text>
      <text x="137" y="73" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Travel</text>
    </g>

    <g className="folder-bounce" style={{ animationDelay: '0.6s' }}>
      <rect x="100" y="80" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="100" y="78" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="111" y="91" textAnchor="middle" fontSize="7">🏠</text>
      <text x="111" y="103" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Rent</text>
    </g>

    <g className="folder-bounce" style={{ animationDelay: '0.9s' }}>
      <rect x="126" y="80" width="22" height="16" rx="2" fill="hsl(var(--primary))" opacity="0.12" />
      <rect x="126" y="78" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
      <text x="137" y="91" textAnchor="middle" fontSize="7">⚡</text>
      <text x="137" y="103" textAnchor="middle" fontSize="4" fill="hsl(var(--foreground))" opacity="0.7" style={{ fontFamily: 'var(--font-body)' }}>Bills</text>
    </g>

    {/* Receipts landing into folders */}
    <rect x="108" y="52" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.4">
      <animate attributeName="opacity" values="0;0.7;0" dur="2s" repeatCount="indefinite" />
      <animate attributeName="y" values="44;52" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="134" y="82" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.4">
      <animate attributeName="opacity" values="0;0.7;0" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
      <animate attributeName="y" values="74;82" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
    </rect>
    <rect x="108" y="82" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.4">
      <animate attributeName="opacity" values="0;0.7;0" dur="2.2s" repeatCount="indefinite" begin="1s" />
      <animate attributeName="y" values="74;82" dur="2.2s" repeatCount="indefinite" begin="1s" />
    </rect>
    <rect x="134" y="52" width="6" height="8" rx="1" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.4">
      <animate attributeName="opacity" values="0;0.7;0" dur="2.8s" repeatCount="indefinite" begin="1.5s" />
      <animate attributeName="y" values="44;52" dur="2.8s" repeatCount="indefinite" begin="1.5s" />
    </rect>
  </svg>
);

export default ExpenseTrackingIcon;
