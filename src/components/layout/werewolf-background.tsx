"use client";

import type React from "react";
import { useEffect, useState } from "react";

interface WerewolfBackgroundProps {
  children: React.ReactNode;
}

export default function WerewolfBackground({
  children,
}: WerewolfBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div suppressHydrationWarning={true} className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#050508] via-[#0b0a14] to-[#120f26] font-sans">
      {/* 1. Starry Night Sky */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-950/20 via-transparent to-transparent opacity-70 pointer-events-none" />

      {/* Dynamic Star Field */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[10%] left-[20%] w-[2px] h-[2px] bg-white rounded-full animate-pulse duration-1000" />
          <div className="absolute top-[25%] left-[75%] w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse duration-2000" />
          <div className="absolute top-[40%] left-[12%] w-[2px] h-[2px] bg-white rounded-full animate-pulse duration-1500" />
          <div className="absolute top-[15%] left-[88%] w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse duration-3000" />
          <div className="absolute top-[60%] left-[80%] w-[2px] h-[2px] bg-white rounded-full animate-pulse duration-2500" />
          <div className="absolute top-[75%] left-[30%] w-[1px] h-[1px] bg-white rounded-full" />
          <div className="absolute top-[50%] left-[45%] w-[2.5px] h-[2.5px] bg-purple-200 rounded-full animate-pulse duration-[4s]" />
          <div className="absolute top-[8%] left-[55%] w-[1.5px] h-[1.5px] bg-white rounded-full animate-pulse duration-[3.5s]" />
        </div>
      )}

      {/* 2. Spooky Glowing Full Moon */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 md:left-[80%] md:-translate-x-0 w-36 h-36 md:w-48 md:h-48 rounded-full bg-radial from-[#fae8ff] via-[#d8b4fe] to-[#a855f7] opacity-90 blur-[1px] animate-moon-pulse pointer-events-none z-0" />

      {/* 3. Floating Embers (Upward moving particles) */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
          {/* Ember 1 */}
          <div className="absolute left-[15%] w-1.5 h-1.5 bg-werewolf-red/60 rounded-full blur-[0.5px] animate-ember-float-1" />
          {/* Ember 2 */}
          <div className="absolute left-[45%] w-2 h-2 bg-purple-400/50 rounded-full blur-[1px] animate-ember-float-2" />
          {/* Ember 3 */}
          <div className="absolute left-[75%] w-1 h-1 bg-werewolf-gold/60 rounded-full blur-[0.5px] animate-ember-float-3" />
          {/* Ember 4 */}
          <div className="absolute left-[30%] w-2 h-2 bg-werewolf-red/40 rounded-full blur-[1px] animate-ember-float-1 duration-[20s]" />
          {/* Ember 5 */}
          <div className="absolute left-[85%] w-1.5 h-1.5 bg-purple-500/50 rounded-full blur-[0.5px] animate-ember-float-2 duration-[25s]" />
        </div>
      )}

      {/* 4. Layered Forest Silhouettes & Fog at the bottom */}
      <div className="absolute bottom-0 w-full h-[30%] pointer-events-none select-none z-10">
        {/* Rolling Fog - Back Layer */}
        <div className="absolute inset-0 opacity-20 blur-md translate-y-4">
          <div className="absolute w-[200%] h-full bg-gradient-to-r from-transparent via-[#4c1d95]/40 to-transparent animate-fog-slow" />
        </div>

        {/* Forest Outline Back (spooky pine vector) */}
        <div className="absolute bottom-0 w-full h-24 opacity-40 text-spooky-purple">
          <svg
            className="w-full h-full fill-current"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            role="img"
            aria-label="Spooky Forest Silhouette Back"
          >
            <title>Spooky Forest Silhouette Back</title>
            <path d="M0,100 L0,80 L20,70 L40,85 L60,65 L80,80 L100,75 L120,90 L140,70 L160,85 L180,60 L200,80 L220,75 L240,90 L260,70 L280,85 L300,60 L320,80 L340,75 L360,95 L380,70 L400,85 L420,65 L440,80 L460,75 L480,90 L500,70 L520,85 L540,60 L560,80 L580,75 L600,90 L620,70 L640,85 L660,60 L680,80 L700,75 L720,90 L740,70 L760,85 L780,60 L800,80 L820,75 L840,90 L860,70 L880,85 L900,60 L920,80 L940,75 L960,95 L980,70 L1000,85 L1020,65 L1040,80 L1060,75 L1080,90 L1100,70 L1120,85 L1140,60 L1160,80 L1180,75 L1200,90 L1220,70 L1240,85 L1260,60 L1280,80 L1300,75 L1320,95 L1340,70 L1360,85 L1380,65 L1400,80 L1420,75 L1440,90 L1440,100 Z" />
          </svg>
        </div>

        {/* Rolling Fog - Front Layer */}
        <div className="absolute inset-0 opacity-30 blur-sm">
          <div className="absolute w-[200%] h-full bg-gradient-to-r from-transparent via-[#1e1b4b]/60 to-transparent animate-fog-fast" />
        </div>

        {/* Forest Outline Front (closer and darker) */}
        <div className="absolute bottom-0 w-full h-16 text-[#04020a]">
          <svg
            className="w-full h-full fill-current"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
            role="img"
            aria-label="Spooky Forest Silhouette Front"
          >
            <title>Spooky Forest Silhouette Front</title>
            <path d="M0,100 L0,85 L30,75 L60,90 L90,80 L120,95 L150,80 L180,90 L210,75 L240,88 L270,82 L300,95 L330,80 L360,92 L390,75 L420,88 L450,82 L480,95 L510,80 L540,90 L570,75 L600,88 L630,82 L660,95 L690,80 L720,92 L750,75 L780,88 L810,82 L840,95 L870,80 L900,90 L930,75 L960,88 L990,82 L1020,95 L1050,80 L1080,90 L1110,75 L1140,88 L1170,82 L1200,95 L1230,80 L1260,92 L1290,75 L1320,88 L1350,82 L1380,95 L1410,80 L1440,88 L1440,100 Z" />
          </svg>
        </div>
      </div>

      {/* 5. Main Content Area */}
      <main className="relative z-20 flex-1 flex flex-col justify-center items-center w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
        {children}
      </main>

      {/* 6. Spooky Footer Details */}
      <div className="relative z-20 w-full text-center py-4 text-[10px] font-mono tracking-widest text-purple-400/40 select-none pointer-events-none">
        {"WAREWOLF: NIGHTFALL // SYSTEM STATUS: MOCKED LOBBY"}
      </div>
    </div>
  );
}
