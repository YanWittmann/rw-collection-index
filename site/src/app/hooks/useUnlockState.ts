import { useState, useEffect } from 'react';

export function useUnlockState() {
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const handleUnlockStateChanged = () => {
            setVersion(v => v + 1);
        };

        window.addEventListener('unlock-state-changed', handleUnlockStateChanged);
        return () => window.removeEventListener('unlock-state-changed', handleUnlockStateChanged);
    }, []);

    return {
        unlockVersion: version,
        refresh: () => setVersion(v => v + 1)
    };
}