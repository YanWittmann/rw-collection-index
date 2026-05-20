import React, { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { KARMA_STRIP_META, KARMA_STRIP_WEBP } from './karmaSpinnerData';

type State = 'pending' | 'ready' | 'unsupported';

const PROBE = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';

const N = KARMA_STRIP_META.frameCount;
const PING_PONG = [
    ...Array.from({ length: N }, (_, i) => i),
    ...Array.from({ length: N - 2 }, (_, i) => N - 2 - i),
];
const CYCLE_MS = PING_PONG.length * 150;

interface KarmaSpinnerProps {
    size?: number;
    className?: string;
}

export const KarmaSpinner: React.FC<KarmaSpinnerProps> = ({ size = 38 * 1.5, className }) => {
    const [state, setState] = useState<State>('pending');
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const img = new Image();
        img.onload = () => setState('ready');
        img.onerror = () => setState('unsupported');
        img.src = PROBE;
    }, []);

    const scale = size / KARMA_STRIP_META.frameSize;
    const frameW = KARMA_STRIP_META.frameSize * scale;
    const stripW = frameW * N;

    useEffect(() => {
        if (state !== 'ready') return;
        let rafId: number;
        let lastStep = -1;
        const tick = (now: number) => {
            const step = Math.floor((now % CYCLE_MS) / 150);
            if (step !== lastStep && divRef.current) {
                divRef.current.style.backgroundPositionX = `-${PING_PONG[step] * frameW}px`;
                lastStep = step;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafId);
    }, [state, frameW]);

    if (state !== 'ready') {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div
                ref={divRef}
                className={className}
                style={{
                    width: size,
                    height: size,
                    backgroundImage: `url("data:image/webp;base64,${KARMA_STRIP_WEBP}")`,
                    backgroundSize: `${stripW}px ${size}px`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPositionX: '0px',
                    imageRendering: 'pixelated',
                    animation: `karma-aura ${CYCLE_MS}ms linear infinite`,
                    animationDelay: `-${performance.now() % CYCLE_MS}ms`,
                }}
            />
        </div>
    );
};
