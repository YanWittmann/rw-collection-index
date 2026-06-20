"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { isPrideMonth, pickRandomPrideFlag, PrideFlag } from "../../utils/prideFlags";
import { cn } from "@shadcn/lib/utils";

interface SplashText {
    label: string;
    size: string;
    bottom: string;
    right: string;
}

const SPLASH_MODDED: SplashText  = { label: "Modded!",        size: "text-2xl", bottom: "-bottom-6", right: "-right-12" };
const SPLASH_PRIDE: SplashText   = { label: "Pride month!",   size: "text-xl",  bottom: "-bottom-6", right: "-right-20" };
const SPLASH_404: SplashText     = { label: "404: Not Found", size: "text-xl",  bottom: "-bottom-6", right: "-right-24" };

// The splash shown on first render, by precedence: a missed route wins over the modded badge.
function initialSplash(showModded: boolean): SplashText | null {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.__RW_FROM_404__) return SPLASH_404;
    return showModded ? SPLASH_MODDED : null;
}

const CHARS1 = "Rain World".split('');
const CHARS2 = "Collection Index".split('');

let prideAutoPlayed = false;

export function TitleSection({ showModded }: { showModded: boolean }) {
    const [flag] = useState<PrideFlag | null>(() => isPrideMonth() ? pickRandomPrideFlag() : null);
    const [splash, setSplash] = useState<SplashText | null>(() => initialSplash(showModded));

    const refs1 = useRef<(HTMLSpanElement | null)[]>([]);
    const refs2 = useRef<(HTMLSpanElement | null)[]>([]);
    const isRunning = useRef(false);
    const rafRef = useRef<number>(0);
    const animationStartedAt = useRef<number>(0);

    const runAnimation = useCallback((withDelay: boolean = true) => {
        if (!flag || isRunning.current) return;
        isRunning.current = true;
        animationStartedAt.current = performance.now();
        cancelAnimationFrame(rafRef.current);

        const n = flag.colors.length;
        const line1Len = CHARS1.length;
        const line2Len = CHARS2.length;
        const startTime = performance.now();

        const sweepAngle = Math.PI / 3;
        const cyScale    = 0.25;
        const bandWidth  = 1.1;
        const delayMs    = withDelay ? 800 : 0;
        const enterMs    = 800;
        const holdMs     = 900;
        const exitMs     = 800;
        const easeIn     = (t: number) => t * (1.7 - 0.7 * t);
        const easeOut    = (t: number) => t * (0.3 + 0.7 * t);

        const cosA = Math.cos(sweepAngle);
        const sinA = Math.sin(sweepAngle);
        const maxProj = cosA + cyScale * sinA;

        function proj(line: number, i: number): number {
            const x = i / ((line === 0 ? line1Len : line2Len) - 1);
            return x * cosA + line * cyScale * sinA;
        }

        function color(line: number, i: number): string {
            const x = i / ((line === 0 ? line1Len : line2Len) - 1);
            return flag!.colors[Math.min(Math.floor(x * n), n - 1)].hex;
        }

        function tick(now: number) {
            const elapsed = now - startTime - delayMs;
            if (elapsed < 0) { rafRef.current = requestAnimationFrame(tick); return; }

            const totalMs = enterMs + holdMs + exitMs;
            const done = elapsed >= totalMs;

            let front: number;
            let entering = false;
            if (elapsed < enterMs) {
                front = easeIn(elapsed / enterMs) * maxProj;
                entering = true;
            } else if (elapsed < enterMs + holdMs) {
                front = maxProj;
            } else {
                front = maxProj + easeOut((elapsed - enterMs - holdMs) / exitMs) * (bandWidth + 0.01);
            }

            const apply = (el: HTMLSpanElement | null, line: number, i: number) => {
                if (!el) return;
                const p = proj(line, i);
                const lit = !done && (entering ? p <= front : front - bandWidth <= p && p <= front);
                el.style.color = lit ? color(line, i) : '';
            };
            refs1.current.forEach((el, i) => apply(el, 0, i));
            refs2.current.forEach((el, i) => apply(el, 1, i));

            if (!done) {
                rafRef.current = requestAnimationFrame(tick);
            } else {
                isRunning.current = false;
                prideAutoPlayed = true;
            }
        }

        rafRef.current = requestAnimationFrame(tick);
    }, [flag]);

    useEffect(() => {
        if (flag && !prideAutoPlayed) {
            runAnimation();
        }
        return () => {
            cancelAnimationFrame(rafRef.current);
            isRunning.current = false;
            // StrictMode fires cleanup in <1ms; real navigation takes much longer
            if (animationStartedAt.current > 0 && performance.now() - animationStartedAt.current > 100) {
                prideAutoPlayed = true;
            }
        };
    }, [flag, runAnimation]);

    const eventHandlers = flag
        ? {
            onMouseEnter: () => { setSplash(SPLASH_PRIDE); runAnimation(false); },
            onTouchStart: () => { setSplash(SPLASH_PRIDE); runAnimation(false); },
          }
        : {};

    return (
        <div {...eventHandlers} style={{ display: 'contents' }}>
            <h1 className="text-5xl rw-title-font" title={flag?.name}>
                {CHARS1.map((ch, i) => (
                    <span key={i} ref={el => { refs1.current[i] = el; }}>{ch}</span>
                ))}
            </h1>
            <div className="relative inline-block mt-4 mb-8">
                <h1 className="text-[2rem] rw-title-font" title={flag?.name}>
                    {CHARS2.map((ch, i) => (
                        <span key={i} ref={el => { refs2.current[i] = el; }}>{ch}</span>
                    ))}
                </h1>
                <div className={cn('absolute transition-opacity duration-500', splash ? 'opacity-100' : 'opacity-0', splash?.bottom ?? SPLASH_MODDED.bottom, splash?.right ?? SPLASH_MODDED.right)}>
                    <div className={cn('rw-title-font transform -rotate-[0.25rad] text-rw-gold font-bold uppercase tracking-widest animate-[modded-pulse_2.2s_cubic-bezier(0.45,0,0.55,1)_infinite]', splash?.size ?? SPLASH_MODDED.size)}>
                        {splash?.label ?? ''}
                    </div>
                </div>
            </div>
        </div>
    );
}
