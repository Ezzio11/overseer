"use client";

import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import CountryPanel from "@/components/UI/CountryPanel";
import ChartPanel from "@/components/UI/ChartPanel";
import { CommandHeader } from "@/components/UI/CommandHeader";
import { StatusFooter } from "@/components/UI/StatusFooter";
import { Activity } from "lucide-react";
import { HUDOverlay } from "@/components/UI/HUDOverlay";
import BootSequence from "@/components/UI/BootSequence";


import CosmicBackground from "@/components/UI/CosmicBackground";

// Dynamic import for GlobeView to avoid SSR issues with WebGL
const GlobeView = dynamic(() => import("@/components/Globe/GlobeView"), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const focusedCountry = useStore((state) => state.focusedCountry);
  const [isBooting, setIsBooting] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeavyLoaded, setIsHeavyLoaded] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // DEFER HEAVY ASSETS: Wait 2.5s before mounting Globe/Stars to ensure Boot Animation completes smoothly
    const heavyLoadTimer = setTimeout(() => setIsHeavyLoaded(true), 2500);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(heavyLoadTimer);
    }
  }, []);

  return (
    <main className="relative w-full h-screen bg-[var(--bg-void)] overflow-hidden font-sans select-none perspective-1000">

      {/* SYSTEM BOOT SEQUENCE */}
      {isBooting && (
        <div className="fixed inset-0 z-[100]">
          <BootSequence onComplete={() => setIsBooting(false)} />
        </div>
      )}

      {/* GLOBAL CINEMATIC OVERLAY (Vignette & Scanlines) */}
      <div className="cockpit-overlay" />

      {/* DYNAMIC COSMIC BACKGROUND (Nebula) - Always Visible now due to new Boot Sequence */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>

      {/* DYNAMIC COSMIC BACKGROUND (Nebula) - Delayed Mount */}


      {/* 3D Globe Layer (Background) - Failsafe fade in - Delayed Mount */}
      {isHeavyLoaded && (
        <div
          className={`absolute inset-0 z-0 transition-all duration-[2000ms] ease-in-out ${isBooting ? 'opacity-0 scale-105 saturate-0' : 'opacity-100 scale-100 saturate-100'
            }`}
        >
          <GlobeView />
        </div>
      )}

      {/* TACTICAL HUD OVERLAY (Behind Panels) */}
      <div className={`absolute inset-0 z-5 pointer-events-none transition-opacity duration-1000 delay-0 ${isBooting ? 'opacity-0' : 'opacity-100'}`}>
        <HUDOverlay />
      </div>

      {/* MAIN COCKPIT CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none cockpit-perspective overflow-hidden">

        {/* TOP HUD - Slide Down Animation */}
        <div
          // 1. CHANGED: 'shrink-0' -> 'shrink-0 h-32' (Force 128px height)
          // 2. CHECK: Ensure 'z-50' is present so it sits above the globe
          className={`shrink-0 h-32 pointer-events-auto z-50 transition-all duration-1000 ease-out delay-0 transform ${isBooting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
        >
          <div className="w-full h-full bg-gradient-to-b from-black/90 to-transparent">
            <CommandHeader />
          </div>
        </div>

        {/* MAIN VIEWPORT (Left - Center - Right) */}
        <div
          // 1. CHANGED: 'justify-between' -> 'justify-center'.
          // 2. ADDED: 'gap-x-...'. This creates the "Hole" for the globe.
          //    I estimated 640px based on your screenshots. Tweak this number to match the ruler exactly.
          className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto min-h-0 items-center justify-center gap-x-12 lg:gap-x-[800px] px-6 py-4 overflow-y-auto lg:overflow-hidden"
          style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
        >

          {/* LEFT PANEL WING */}
          <div
            // ADDED: 'shrink-0' to prevent squishing if the window gets small
            // REMOVED: 'w-full' (let it be its natural size or fixed width)
            className={`
      shrink-0 w-full lg:w-[320px] h-auto lg:h-[70%] max-h-[700px] transition-all duration-1000 ease-out py-2 lg:py-0 delay-100
      ${!isBooting && focusedCountry ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
    `}
            // TWEAKED: Increased translate to 40px to give it a stronger "slide in" feel towards the ruler
            style={!isMobile && focusedCountry ? { transform: 'rotateY(30deg) translateX(40px)' } : {}}
          >
            <ChartPanel />
          </div>

          {/* RIGHT PANEL WING */}
          <div
            // ADDED: 'shrink-0'
            className={`
      shrink-0 w-full lg:w-[320px] h-auto lg:h-[70%] max-h-[700px] transition-all duration-1000 ease-out py-2 lg:py-0 delay-100
      ${!isBooting && focusedCountry ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20 pointer-events-none'}
    `}
            style={!isMobile && focusedCountry ? { transform: 'rotateY(-30deg) translateX(-40px)' } : {}}
          >
            {focusedCountry && <CountryPanel />}
          </div>

        </div>

        {/* BOTTOM STATUS - Slide Up Animation */}
        <div
          className={`shrink-0 pointer-events-auto z-50 transition-all duration-1000 ease-out delay-0 transform ${isBooting ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
        >
          <StatusFooter />
        </div>

      </div>
    </main >
  );
}
