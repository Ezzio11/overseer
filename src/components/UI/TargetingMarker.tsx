import React from 'react';
import { Crosshair, Scan } from 'lucide-react';

interface TargetingMarkerProps {
    label: string;
}

export const TargetingMarker: React.FC<TargetingMarkerProps> = ({ label }) => {
    // REMOVED INTERNAL STATE to prevent re-render flickering.
    // Pure CSS animations handle the visuals.

    return (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-40 h-40">
            {/* Outer Rotating Ring (Slow) */}
            <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-[spin_8s_linear_infinite]" />

            {/* Inner Rotating Ring (Fast, Counter) */}
            <div className="absolute inset-4 border-t border-b border-cyan-400/40 rounded-full animate-[spin_3s_linear_infinite_reverse]" />

            {/* Static HUD Brackets */}
            <div className="absolute inset-0 flex flex-col justify-between py-2">
                <div className="flex justify-between px-2">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                </div>
                <div className="flex justify-between px-2">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                </div>
            </div>

            {/* Center Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Crosshair className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>

            {/* Scanning Laser Line */}
            <div className="absolute w-full h-[1px] bg-cyan-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />

            {/* Label / Data Block */}
            <div className="absolute -bottom-10 flex flex-col items-center">
                <div className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/30 backdrop-blur-sm">
                    <span className="font-data text-data-xs text-cyan-400 tracking-tactical-wide font-bold">
                        TARGET LOCKED
                    </span>
                </div>
                <div className="mt-1 font-data text-data-xs text-cyan-200/70 tracking-widest uppercase">
                    {label}
                </div>
            </div>
        </div>
    );
};
