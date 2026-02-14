import React from 'react';

interface PanelProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    decoration?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
    children,
    className = '',
    title,
    decoration = true
}) => {
    return (
        <div className={`glass-panel relative p-6 ${className}`}>
            {decoration && (
                <>
                    <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-[var(--color-primary)] opacity-50" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-[var(--color-primary)] opacity-50" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-[var(--color-primary)] opacity-50" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-[var(--color-primary)] opacity-50" />
                </>
            )}

            {title && (
                <div className="mb-4 border-b border-white/10 pb-2 flex items-center justify-between">
                    <h2 className="text-xs font-bold tracking-[0.2em] text-[var(--color-primary)] uppercase drop-shadow-[0_0_5px_rgba(0,255,148,0.5)]">
                        [{title}]
                    </h2>
                    <div className="h-1 w-1 bg-[var(--color-primary)] rounded-full animate-pulse" />
                </div>
            )}

            <div className="text-sm text-gray-300 font-mono">
                {children}
            </div>
        </div>
    );
};
