import React from 'react';

interface TechCardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
    noPadding?: boolean;
}

export const TechCard: React.FC<TechCardProps> = ({ children, title, className = '', noPadding = false }) => {
    return (
        <div className={`relative bg-black/40 border border-white/5 backdrop-blur-sm overflow-hidden group hover:border-white/10 transition-colors ${className}`}>

            {/* BACKGROUND TEXTURE */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* CORNER ACCENTS */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30 group-hover:border-primary/60 transition-colors" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 group-hover:border-primary/60 transition-colors" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30 group-hover:border-primary/60 transition-colors" />

            {/* HEADER */}
            {title && (
                <div className="relative z-10 px-3 py-2 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <span className="text-[10px] font-mono text-primary/80 uppercase tracking-widest font-bold">
                        [{title}]
                    </span>
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-0.5 bg-primary/40 rounded-full" />
                        <div className="w-0.5 h-0.5 bg-primary/40 rounded-full" />
                    </div>
                </div>
            )}

            {/* CONTENT */}
            <div className={`relative z-10 h-full ${noPadding ? '' : 'p-3'}`}>
                {children}
            </div>
        </div>
    );
};
