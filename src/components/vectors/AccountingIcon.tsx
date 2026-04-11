const AccountingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 -10 420 210"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <style>{`
      @keyframes sendDoc1 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(220px, -30px) rotate(8deg); opacity: 0; }
      }
      @keyframes sendDoc2 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(215px, 5px) rotate(-5deg); opacity: 0; }
      }
      @keyframes sendDoc3 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(210px, 40px) rotate(6deg); opacity: 0; }
      }
      @keyframes sendDoc4 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.4; }
        100% { transform: translate(218px, -15px) rotate(-8deg); opacity: 0; }
      }
      @keyframes sendDoc5 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.4; }
        100% { transform: translate(208px, 25px) rotate(4deg); opacity: 0; }
      }
      @keyframes typingDot {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes phonePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      .send-doc-1 { animation: sendDoc1 3.4s ease-in-out 0.3s infinite; }
      .send-doc-2 { animation: sendDoc2 2.9s ease-in-out 0.9s infinite; }
      .send-doc-3 { animation: sendDoc3 3.1s ease-in-out 1.5s infinite; }
      .send-doc-4 { animation: sendDoc4 3.6s ease-in-out 1.8s infinite; }
      .send-doc-5 { animation: sendDoc5 2.7s ease-in-out 2.2s infinite; }
      .phone-pulse { animation: phonePulse 2s ease-in-out infinite; }
      .typing-dot-1 { animation: typingDot 1.2s ease-in-out infinite; }
      .typing-dot-2 { animation: typingDot 1.2s ease-in-out 0.2s infinite; }
      .typing-dot-3 { animation: typingDot 1.2s ease-in-out 0.4s infinite; }
    `}</style>

    {/* Phone frame - left side */}
    <g className="phone-pulse">
      <rect x="5" y="5" width="90" height="155" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="30" y="9" width="30" height="6" rx="3" fill="hsl(var(--muted))" />
      <rect x="12" y="22" width="76" height="128" rx="5" fill="hsl(var(--background))" />
    </g>

    {/* Invoice being created inside phone */}
    <rect x="18" y="28" width="64" height="80" rx="4" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8">
      <animate attributeName="opacity" values="0.5;1;1;0.5" dur="4s" repeatCount="indefinite" />
    </rect>
    
    {/* Invoice header */}
    <rect x="18" y="28" width="64" height="16" rx="4" fill="hsl(var(--primary))" opacity="0.2" />
    <text x="50" y="39" textAnchor="middle" fontSize="6" fill="hsl(var(--primary))" opacity="0.8" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>INVOICE</text>
    
    {/* Invoice lines - typing effect */}
    <rect x="24" y="52" width="40" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.4">
      <animate attributeName="width" values="0;40" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="24" y="60" width="50" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.3">
      <animate attributeName="width" values="0;50" dur="2.3s" repeatCount="indefinite" begin="0.3s" />
    </rect>
    <rect x="24" y="68" width="34" height="4" rx="2" fill="hsl(var(--muted-foreground))" opacity="0.3">
      <animate attributeName="width" values="0;34" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
    </rect>
    
    {/* Amount */}
    <rect x="24" y="78" width="16" height="7" rx="2.5" fill="hsl(var(--primary))" opacity="0.3" />
    <rect x="46" y="78" width="30" height="7" rx="2.5" fill="hsl(var(--primary))" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
    </rect>

    {/* Typing dots */}
    <circle cx="26" cy="98" r="2" fill="hsl(var(--primary))" className="typing-dot-1" />
    <circle cx="33" cy="98" r="2" fill="hsl(var(--primary))" className="typing-dot-2" />
    <circle cx="40" cy="98" r="2" fill="hsl(var(--primary))" className="typing-dot-3" />

    {/* Send buttons on phone */}
    <rect x="18" y="118" width="20" height="14" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
    <g transform="translate(22, 120.5) scale(0.38)">
      <rect x="2" y="6" width="20" height="14" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2,6 12,13 22,6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    
    <rect x="42" y="118" width="20" height="14" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
    <g transform="translate(46, 120) scale(0.45)">
      <path d="M12 2C6.48 2 2 6.04 2 11c0 1.6.44 3.08 1.2 4.4L2 22l4.8-1.2C8.4 21.56 10.12 22 12 22c5.52 0 10-4.04 10-9S17.52 2 12 2z" fill="#25D366" />
      <path d="M16.5 14.2c-.3-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.3-.74.94-.9 1.13-.17.19-.34.22-.63.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.34.44-.52.15-.17.2-.3.3-.49.1-.19.05-.37-.02-.52-.08-.15-.64-1.54-.88-2.1-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.37-.26.3-.98.96-.98 2.33s1 2.7 1.14 2.89c.15.19 1.98 3.02 4.8 4.23.67.29 1.2.46 1.6.59.68.21 1.29.18 1.78.11.54-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.08-.12-.26-.19-.55-.34z" fill="white" />
    </g>
    
    <rect x="66" y="118" width="20" height="14" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
    <g transform="translate(70, 120.5) scale(0.38)">
      <polyline points="6,9 6,2 18,2 18,9" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="14" width="12" height="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </g>

    {/* Flying invoices going outward */}
    <g className="send-doc-1">
      <rect x="90" y="25" width="28" height="38" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <rect x="90" y="25" width="28" height="8" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="95" y1="38" x2="112" y2="38" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" />
      <line x1="95" y1="44" x2="110" y2="44" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" />
      <rect x="95" y="50" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-2">
      <rect x="88" y="58" width="30" height="40" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <rect x="88" y="58" width="30" height="9" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="93" y1="72" x2="112" y2="72" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" />
      <line x1="93" y1="78" x2="108" y2="78" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" />
      <rect x="93" y="86" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-3">
      <rect x="92" y="95" width="26" height="36" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <rect x="92" y="95" width="26" height="8" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="97" y1="108" x2="112" y2="108" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" />
      <rect x="97" y="116" width="10" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-4">
      <rect x="86" y="10" width="28" height="36" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <rect x="86" y="10" width="28" height="8" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="91" y1="24" x2="108" y2="24" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" />
      <line x1="91" y1="30" x2="104" y2="30" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.3" />
      <rect x="91" y="36" width="12" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-5">
      <rect x="90" y="76" width="26" height="34" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.8" />
      <rect x="90" y="76" width="26" height="8" rx="3" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="95" y1="90" x2="110" y2="90" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" opacity="0.4" />
      <rect x="95" y="98" width="10" height="4" rx="1.5" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    {/* Flow trail particles */}
    <circle cx="110" cy="45" r="2" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="110;380" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="108" cy="80" r="2" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="108;375" dur="2.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <circle cx="112" cy="115" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="112;378" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.25;0" dur="1.8s" repeatCount="indefinite" />
    </circle>

    {/* Destination icons on the right */}
    {/* Email */}
    <g>
      <circle cx="385" cy="20" r="32" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="385" cy="20" r="24" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="24;29;24" dur="2s" repeatCount="indefinite" />
      </circle>
      <g transform="translate(367, 3) scale(1.6)">
        <rect x="2" y="6" width="20" height="14" rx="2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="2,6 12,13 22,6" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>

    {/* WhatsApp */}
    <g>
      <circle cx="390" cy="95" r="32" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="390" cy="95" r="24" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="24;29;24" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <g transform="translate(374, 79) scale(1.4)">
        <path d="M12 2C6.48 2 2 6.04 2 11c0 1.6.44 3.08 1.2 4.4L2 22l4.8-1.2C8.4 21.56 10.12 22 12 22c5.52 0 10-4.04 10-9S17.52 2 12 2z" fill="#25D366" />
        <path d="M16.5 14.2c-.3-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.3-.74.94-.9 1.13-.17.19-.34.22-.63.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.34.44-.52.15-.17.2-.3.3-.49.1-.19.05-.37-.02-.52-.08-.15-.64-1.54-.88-2.1-.23-.56-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.37-.26.3-.98.96-.98 2.33s1 2.7 1.14 2.89c.15.19 1.98 3.02 4.8 4.23.67.29 1.2.46 1.6.59.68.21 1.29.18 1.78.11.54-.08 1.7-.69 1.94-1.36.24-.67.24-1.24.17-1.36-.08-.12-.26-.19-.55-.34z" fill="white" />
      </g>
    </g>

    {/* Print */}
    <g>
      <circle cx="383" cy="170" r="32" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="383" cy="170" r="24" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="24;29;24" dur="2.4s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <g transform="translate(367, 156) scale(1.4)">
        <polyline points="6,9 6,2 18,2 18,9" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6" y="14" width="12" height="8" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  </svg>
);

export default AccountingIcon;
