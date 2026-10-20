import React from "react";

interface DimeLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function DimeLogo({ size = "md", className = "" }: DimeLogoProps) {
  const sizeMap = {
    sm: "w-7 h-7 rounded-lg",
    md: "w-9 h-9 rounded-xl",
    lg: "w-11 h-11 rounded-2xl",
    xl: "w-16 h-16 rounded-[1.25rem]",
  };

  const iconSizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-9 h-9",
  };

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-gradient-to-br from-[#FB923C] via-[#EA580C] to-[#C2410C] shadow-md shadow-orange-500/20 ring-1 ring-white/30 transition-transform duration-200 group-hover:scale-105 ${sizeMap[size]} ${className}`}
      style={{
        boxShadow:
          "inset 0 1px 1px 0 rgba(255, 255, 255, 0.45), 0 2px 6px -1px rgba(234, 88, 12, 0.35)",
      }}
    >
      {/* Subtle radial sheen overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.4)_0%,_transparent_70%)] pointer-events-none" />

      {/* Bespoke DIME Geometric Vector Mark */}
      <svg
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizeMap[size]} text-white relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]`}
      >
        <defs>
          <linearGradient id="dimeLoopGrad" x1="6" y1="4" x2="22" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="1" stopColor="#FED7AA" />
          </linearGradient>
          <linearGradient id="dimeSparkGrad" x1="10" y1="18" x2="21" y2="9" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#FFF7ED" />
          </linearGradient>
        </defs>

        {/* Outer Precision D Monogram */}
        <path
          d="M6.5 5.5C6.5 4.67157 7.17157 4 8 4H14.5C19.7467 4 24 8.25329 24 13.5C24 18.7467 19.7467 23 14.5 23H8C7.17157 23 6.5 22.3284 6.5 21.5V5.5Z"
          fill="white"
          fillOpacity="0.14"
        />

        {/* Crisp Stylized D Contour */}
        <path
          d="M7.5 5.5C7.5 4.94772 7.94772 4.5 8.5 4.5H14C18.9706 4.5 23 8.52944 23 13.5C23 18.4706 18.9706 22.5 14 22.5H8.5C7.94772 22.5 7.5 22.0523 7.5 21.5V5.5Z"
          stroke="url(#dimeLoopGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic Ascending Innovation Vector (Data Growth Spark) */}
        <path
          d="M8.5 16.5L12 12.5L15.5 15.5L20.5 9.5"
          stroke="url(#dimeSparkGrad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex Spark Beacon Dot */}
        <circle cx="20.5" cy="9.5" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
