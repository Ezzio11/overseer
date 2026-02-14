import React from 'react';

interface TacticalFrameProps {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    title?: string;
    variant?: 'default' | 'alert' | 'warning' | 'hex';
}

export const TacticalFrame: React.FC<TacticalFrameProps> = ({
    children,
    className = '',
    contentClassName = 'p-4',
    title,
    variant = 'default'
}) => {
    // FUI Palette
    const colors = {
        default: { primary: 'border-cyan-500/50', glow: 'shadow-[0_0_25px_rgba(0,217,255,0.2)]', bg: 'bg-[rgba(10,21,32,0.75)]' },
        alert: { primary: 'border-red-500/50', glow: 'shadow-[0_0_25px_rgba(255,42,109,0.2)]', bg: 'bg-[rgba(30,15,18,0.75)]' },
        warning: { primary: 'border-amber-500/50', glow: 'shadow-[0_0_25px_rgba(255,200,0,0.2)]', bg: 'bg-[rgba(30,25,15,0.75)]' },
        hex: { primary: 'border-purple-500/50', glow: 'shadow-[0_0_25px_rgba(168,85,247,0.2)]', bg: 'bg-[rgba(25,15,30,0.75)]' }
    };

    const c = colors[variant as keyof typeof colors] || colors.default;

    return (
        <div className={`relative ${className} flex flex-col`}>
            {/* Main Container with Glassmorphism */}
            <div className={`
                relative w-full h-full flex flex-col
                border ${c.primary}
                ${c.bg} backdrop-blur-md
                ${c.glow} depth-shadow animate-breathe
                transition-all duration-300
            `}>

                {/* Corner Accents (CSS Only) */}
                <div className={`absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 ${variant === 'alert' ? 'border-red-500' : 'border-cyan-400'}`} />
                <div className={`absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b-2 border-r-2 ${variant === 'alert' ? 'border-red-500' : 'border-cyan-400'}`} />

                {/* TITLE BAR */}
                {title && (
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.05] bg-black/20">
                        <div className={`w-1.5 h-1.5 rounded-full ${variant === 'alert' ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'} shadow-[0_0_8px_currentcolor]`} />
                        <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-white/90 uppercase">
                            {title}
                        </span>
                        {/* Deco lines */}
                        <div className="flex-1" />
                        <div className="flex gap-1 opacity-30">
                            <div className="w-1 h-3 bg-white/50 -skew-x-12" />
                            <div className="w-1 h-3 bg-white/50 -skew-x-12" />
                            <div className="w-2 h-3 bg-white/50 -skew-x-12" />
                        </div>
                    </div>
                )}

                {/* CONTENT */}
                <div className={`relative flex-1 min-h-0 w-full overflow-hidden ${contentClassName}`}>
                    {/* Subtle Internal Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                    <div className="relative z-10 w-full h-full">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};
