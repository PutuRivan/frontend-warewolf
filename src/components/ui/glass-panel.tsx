import type React from "react";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: boolean;
}

export default function GlassPanel({
  children,
  className = "",
  hoverGlow = false,
}: GlassPanelProps) {
  return (
    <div
      suppressHydrationWarning={true}
      className={`
        relative backdrop-blur-md bg-spooky-black/60 border border-purple-500/20 rounded-2xl p-6 md:p-8
        shadow-[0_8px_32px_0_rgba(17,9,36,0.5)] 
        ${hoverGlow ? "transition-all duration-300 hover:border-purple-500/40 hover:shadow-[0_8px_32px_0_rgba(192,132,252,0.15)]" : ""}
        ${className}
      `}
    >
      {/* Spooky corner borders */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-400/30 rounded-tl-xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400/30 rounded-tr-xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-purple-400/30 rounded-bl-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-purple-400/30 rounded-br-xl pointer-events-none" />

      {children}
    </div>
  );
}
