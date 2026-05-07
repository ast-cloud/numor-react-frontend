import React from "react";

interface BotMascotProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const BotMascot = ({ size = 24, className, ...props }: BotMascotProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* Antenna */}
      <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="3" r="1.5" fill="currentColor" />
      
      {/* Head / Body */}
      <rect x="6" y="8" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Eyes */}
      <circle cx="12" cy="16" r="1.8" fill="currentColor" />
      <circle cx="20" cy="16" r="1.8" fill="currentColor" />
      
      {/* Smile */}
      <path
        d="M12 22c1.2 1 2.8 1.5 4 1.5s2.8-.5 4-1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Blush marks */}
      <circle cx="9" cy="20" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="23" cy="20" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
};

export default BotMascot;
