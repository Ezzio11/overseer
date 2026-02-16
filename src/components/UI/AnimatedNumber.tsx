'use client';

import { useState, useEffect } from 'react';

interface AnimatedNumberProps {
    value: number;
    format?: (v: number) => string;
    duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
    value,
    format = (v) => v.toLocaleString(),
    duration = 1000
}) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let start = displayValue;
        const end = value;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            const current = start + (end - start) * easeProgress;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value, duration]);

    return <>{format(displayValue)}</>;
};
