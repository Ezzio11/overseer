"use client";

import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import { useStore } from "@/lib/store";
import CountryPanel from "@/components/UI/CountryPanel";
import ChartPanel from "@/components/UI/ChartPanel";
import { CommandHeader } from "@/components/UI/CommandHeader";
import { StatusFooter } from "@/components/UI/StatusFooter";
import { Activity } from "lucide-react";
import LoadingScreen from "@/components/UI/LoadingScreen";
import { HUDOverlay } from "@/components/UI/HUDOverlay";

import CosmicBackground from "@/components/UI/CosmicBackground";

// Dynamic import for GlobeView to avoid SSR issues with WebGL
const GlobeView = dynamic(() => import("@/components/Globe/GlobeView"), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const focusedCountry = useStore((state) => state.focusedCountry);
  const [isLoading, setIsLoading] = useState(false); // DISABLED FOR TESTING
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="relative w-full h-screen bg-[var(--bg-void)] overflow-hidden font-sans select-none perspective-1000">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {/* GLOBAL CINEMATIC OVERLAY (Vignette & Scanlines) */}
      <div className="cockpit-overlay" />

      {/* DYNAMIC COSMIC BACKGROUND (Nebula) */}
      <div className="absolute inset-0 z-0">
        <CosmicBackground />
      </div>



      {/* 3D Globe Layer (Background) */}
      <div className="absolute inset-0 z-0">
        <GlobeView />
      </div>

      {/* TACTICAL HUD OVERLAY (Behind Panels) */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        <HUDOverlay />
      </div>

      {/* MAIN COCKPIT CONTAINER */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none cockpit-perspective overflow-hidden">

        {/* TOP HUD */}
        <div className="shrink-0 h-16 pointer-events-auto z-50">
          <div className="w-full h-full bg-gradient-to-b from-black/90 to-transparent pt-2 px-4">
            <CommandHeader />
          </div>
        </div>

        {/* MAIN VIEWPORT (Left - Center - Right) */}
        <div
          className="flex-1 flex flex-col lg:flex-row w-full min-h-0 items-center justify-center px-8 py-4 gap-4 lg:gap-32 overflow-y-auto lg:overflow-hidden"
          style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
        >

          {/* LEFT PANEL WING - COMPACT & FLOATING */}
          <div
            className={`
              w-full lg:w-[320px] h-auto lg:h-[70%] max-h-[700px] transition-all duration-700 ease-out py-2 lg:py-0
              ${focusedCountry ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}
            `}
            style={!isMobile && focusedCountry ? { transform: 'rotateY(20deg) translateX(10px)' } : {}}
          >
            <ChartPanel />
          </div>

          {/* CENTER FOCUS (Spacer for Globe visibility) */}
          <div className="hidden lg:block w-[400px] h-full" />

          {/* RIGHT PANEL WING - COMPACT & FLOATING */}
          <div
            className={`
              w-full lg:w-[400px] h-auto lg:h-[75%] max-h-[800px] transition-all duration-700 ease-out py-2 lg:py-0
              ${focusedCountry ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}
            `}
            style={!isMobile && focusedCountry ? { transform: 'rotateY(-20deg) translateX(-10px)' } : {}}
          >
            <CountryPanel />
          </div>

        </div>

        <StatusFooter />

      </div>
    </main >
  );
}
