import { useEffect } from 'react';

export function useEscapeKey(onEscape: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onEscape(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onEscape, enabled]);
}
