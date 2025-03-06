import { useState, useEffect } from 'react';

export function useUnlockState() {
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key?.startsWith('rw-unlock-')) {
                setVersion(v => v + 1);
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return {
        unlockVersion: version,
        refresh: () => setVersion(v => v + 1)
    };
}