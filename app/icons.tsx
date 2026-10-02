type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const ArrowUpRight = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M7 17 17 7M9 7h8v8" /></svg>
);
export const ArrowDown = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
export const ArrowUp = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 19V5M6 11l6-6 6 6" /></svg>
);
export const Check = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
export const Square = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><rect x="5" y="5" width="14" height="14" rx="3" /></svg>
);
export const Download = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 4v11M7 10l5 5 5-5M5 19h14" /></svg>
);
export const Mic = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg>
);
export const Ear = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M6 9a6 6 0 0 1 12 0c0 3-2 4-3 6s-1 4-3.5 4A2.5 2.5 0 0 1 9 16.5" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5" /></svg>
);
export const Notes = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h4" /></svg>
);
export const Plus = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const Mark = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" /></svg>
);
