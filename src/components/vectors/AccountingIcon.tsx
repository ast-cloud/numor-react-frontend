const AccountingIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 220 140"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <style>{`
      @keyframes invoiceCreate {
        0% { opacity: 0; transform: scaleY(0); }
        20% { opacity: 1; transform: scaleY(1); }
        80% { opacity: 1; transform: scaleY(1); }
        100% { opacity: 0; transform: scaleY(1); }
      }
      @keyframes sendEmail {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        15% { opacity: 0.9; }
        85% { opacity: 0.6; }
        100% { transform: translate(70px, -25px) scale(0.8); opacity: 0; }
      }
      @keyframes sendWhatsapp {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        15% { opacity: 0.9; }
        85% { opacity: 0.6; }
        100% { transform: translate(65px, 10px) scale(0.8); opacity: 0; }
      }
      @keyframes sendPrint {
        0% { transform: translate(0, 0) scale(1); opacity: 0; }
        15% { opacity: 0.9; }
        85% { opacity: 0.6; }
        100% { transform: translate(60px, 35px) scale(0.8); opacity: 0; }
      }
      @keyframes sendDoc1 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(75px, -20px) rotate(8deg); opacity: 0; }
      }
      @keyframes sendDoc2 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(70px, 5px) rotate(-5deg); opacity: 0; }
      }
      @keyframes sendDoc3 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.8; }
        90% { opacity: 0.5; }
        100% { transform: translate(68px, 30px) rotate(6deg); opacity: 0; }
      }
      @keyframes sendDoc4 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.4; }
        100% { transform: translate(72px, -10px) rotate(-8deg); opacity: 0; }
      }
      @keyframes sendDoc5 {
        0% { transform: translate(0, 0) rotate(0deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.4; }
        100% { transform: translate(66px, 20px) rotate(4deg); opacity: 0; }
      }
      @keyframes typingDot {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      @keyframes phonePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      .send-email { animation: sendEmail 3s ease-in-out infinite; }
      .send-whatsapp { animation: sendWhatsapp 3.2s ease-in-out 0.6s infinite; }
      .send-print { animation: sendPrint 2.8s ease-in-out 1.2s infinite; }
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
      <rect x="20" y="12" width="68" height="116" rx="10" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="42" y="15" width="24" height="5" rx="2.5" fill="hsl(var(--muted))" />
      <rect x="25" y="24" width="58" height="96" rx="4" fill="hsl(var(--background))" />
    </g>

    {/* Invoice being created inside phone */}
    <rect x="30" y="29" width="48" height="60" rx="3" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6">
      <animate attributeName="opacity" values="0.5;1;1;0.5" dur="4s" repeatCount="indefinite" />
    </rect>
    
    {/* Invoice header */}
    <rect x="30" y="29" width="48" height="12" rx="3" fill="hsl(var(--primary))" opacity="0.2" />
    <text x="54" y="37" textAnchor="middle" fontSize="4.5" fill="hsl(var(--primary))" opacity="0.8" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>INVOICE</text>
    
    {/* Invoice lines - typing effect */}
    <rect x="34" y="46" width="30" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.4">
      <animate attributeName="width" values="0;30" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="34" y="52" width="38" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3">
      <animate attributeName="width" values="0;38" dur="2.3s" repeatCount="indefinite" begin="0.3s" />
    </rect>
    <rect x="34" y="58" width="25" height="3" rx="1.5" fill="hsl(var(--muted-foreground))" opacity="0.3">
      <animate attributeName="width" values="0;25" dur="1.8s" repeatCount="indefinite" begin="0.6s" />
    </rect>
    
    {/* Amount */}
    <rect x="34" y="66" width="12" height="5" rx="2" fill="hsl(var(--primary))" opacity="0.3" />
    <rect x="50" y="66" width="22" height="5" rx="2" fill="hsl(var(--primary))" opacity="0.6">
      <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
    </rect>

    {/* Typing dots */}
    <circle cx="34" cy="78" r="1.5" fill="hsl(var(--primary))" className="typing-dot-1" />
    <circle cx="39" cy="78" r="1.5" fill="hsl(var(--primary))" className="typing-dot-2" />
    <circle cx="44" cy="78" r="1.5" fill="hsl(var(--primary))" className="typing-dot-3" />

    {/* Send buttons on phone */}
    <rect x="30" y="94" width="14" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
    <text x="37" y="101" textAnchor="middle" fontSize="6">📧</text>
    
    <rect x="47" y="94" width="14" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
    <text x="54" y="101" textAnchor="middle" fontSize="6">💬</text>
    
    <rect x="64" y="94" width="14" height="10" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
    <text x="71" y="101" textAnchor="middle" fontSize="6">🖨️</text>

    {/* Flying invoices going outward */}
    <g className="send-doc-1">
      <rect x="82" y="30" width="20" height="28" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6" />
      <rect x="82" y="30" width="20" height="6" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="86" y1="40" x2="98" y2="40" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.4" />
      <line x1="86" y1="44" x2="96" y2="44" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.3" />
      <rect x="86" y="49" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-2">
      <rect x="80" y="55" width="22" height="30" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6" />
      <rect x="80" y="55" width="22" height="7" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="84" y1="66" x2="98" y2="66" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.4" />
      <line x1="84" y1="70" x2="96" y2="70" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.3" />
      <rect x="84" y="76" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-3">
      <rect x="84" y="80" width="18" height="26" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6" />
      <rect x="84" y="80" width="18" height="6" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="88" y1="90" x2="98" y2="90" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.4" />
      <rect x="88" y="96" width="6" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-4">
      <rect x="78" y="18" width="20" height="26" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6" />
      <rect x="78" y="18" width="20" height="6" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="82" y1="28" x2="94" y2="28" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.4" />
      <line x1="82" y1="32" x2="92" y2="32" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.3" />
      <rect x="82" y="36" width="8" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    <g className="send-doc-5">
      <rect x="82" y="68" width="18" height="24" rx="2" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="0.6" />
      <rect x="82" y="68" width="18" height="6" rx="2" fill="hsl(var(--primary))" opacity="0.15" />
      <line x1="86" y1="78" x2="96" y2="78" stroke="hsl(var(--muted-foreground))" strokeWidth="0.6" opacity="0.4" />
      <rect x="86" y="84" width="6" height="3" rx="1" fill="hsl(var(--primary))" opacity="0.2" />
    </g>

    {/* Flow trail particles */}
    <circle cx="95" cy="40" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="95;170" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="92" cy="65" r="1.5" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="92;168" dur="2.3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.3;0" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <circle cx="98" cy="90" r="1" fill="hsl(var(--primary))" opacity="0.15">
      <animate attributeName="cx" values="98;172" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.25;0" dur="1.8s" repeatCount="indefinite" />
    </circle>

    {/* Destination icons on the right */}
    {/* Email */}
    <g>
      <circle cx="185" cy="28" r="16" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="185" cy="28" r="12" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />
      </circle>
      <text x="185" y="32" textAnchor="middle" fontSize="12">📧</text>
      <text x="185" y="48" textAnchor="middle" fontSize="5" fill="hsl(var(--foreground))" opacity="0.6" style={{ fontFamily: 'var(--font-body)' }}>Email</text>
    </g>

    {/* WhatsApp */}
    <g>
      <circle cx="192" cy="72" r="16" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="192" cy="72" r="12" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="12;14;12" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <text x="192" y="76" textAnchor="middle" fontSize="12">💬</text>
      <text x="192" y="92" textAnchor="middle" fontSize="5" fill="hsl(var(--foreground))" opacity="0.6" style={{ fontFamily: 'var(--font-body)' }}>WhatsApp</text>
    </g>

    {/* Print */}
    <g>
      <circle cx="182" cy="115" r="16" fill="hsl(var(--primary))" opacity="0.08" />
      <circle cx="182" cy="115" r="12" fill="hsl(var(--primary))" opacity="0.06">
        <animate attributeName="r" values="12;14;12" dur="2.4s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <text x="182" y="119" textAnchor="middle" fontSize="12">🖨️</text>
      <text x="182" y="135" textAnchor="middle" fontSize="5" fill="hsl(var(--foreground))" opacity="0.6" style={{ fontFamily: 'var(--font-body)' }}>Print</text>
    </g>
  </svg>
);

export default AccountingIcon;
