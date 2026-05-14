import { useEffect, useRef, useState } from 'react';
import { PearlData } from '../types/types';
import { useAppContext } from '../context/AppContext';

// Helper functions
const findPearlPosition = (pearlId: string, pearls: PearlData[][]): [number, number] | null => {
    for (let row = 0; row < pearls.length; row++) {
        for (let col = 0; col < pearls[row].length; col++) {
            if (pearls[row][col]?.id === pearlId) {
                return [row, col];
            }
        }
    }
    return null;
};

const findNextValidPosition = (row: number, col: number, pearls: PearlData[][], direction: 'right' | 'left'): [number, number] | null => {
    const maxRows = pearls.length;
    if (row >= maxRows) return null;

    const currentRow = pearls[row];
    if (direction === 'right') {
        for (let c = col; c < 5; c++) {
            if (currentRow && currentRow[c]) return [row, c];
        }
        if (row + 1 < maxRows) {
            for (let c = 0; c < 5; c++) {
                if (pearls[row + 1] && pearls[row + 1][c]) return [row + 1, c];
            }
        }
    } else {
        for (let c = col; c >= 0; c--) {
            if (currentRow && currentRow[c]) return [row, c];
        }
        if (row - 1 >= 0) {
            for (let c = 4; c >= 0; c--) {
                if (pearls[row - 1] && pearls[row - 1][c]) return [row - 1, c];
            }
        }
    }
    return null;
};

export function useKeyboardNavigation(pearlGrid: PearlData[][]) {
    const {
        selectedPearlId,
        selectedTranscriberName,
        selectedPearlData,
        handleSelectPearl,
        handleSelectTranscriber
    } = useAppContext();
    const [currentGridPosition, setCurrentGridPosition] = useState<[number, number]>([0, 0]);

    // Refs to hold latest values so the keydown handler can be stable
    const pearlGridRef = useRef(pearlGrid);
    const currentGridPositionRef = useRef(currentGridPosition);
    const selectedPearlIdRef = useRef(selectedPearlId);
    const selectedTranscriberNameRef = useRef(selectedTranscriberName);
    const selectedPearlDataRef = useRef(selectedPearlData);
    const handleSelectPearlRef = useRef(handleSelectPearl);
    const handleSelectTranscriberRef = useRef(handleSelectTranscriber);

    // Keep refs in sync with latest values on every render
    useEffect(() => {
        pearlGridRef.current = pearlGrid;
        currentGridPositionRef.current = currentGridPosition;
        selectedPearlIdRef.current = selectedPearlId;
        selectedTranscriberNameRef.current = selectedTranscriberName;
        selectedPearlDataRef.current = selectedPearlData;
        handleSelectPearlRef.current = handleSelectPearl;
        handleSelectTranscriberRef.current = handleSelectTranscriber;
    });

    const handleTranscriberSelection = (direction: 'next' | 'prev') => {
        const currentSelectedPearlData = selectedPearlDataRef.current;
        const currentSelectedTranscriberName = selectedTranscriberNameRef.current;
        if (!currentSelectedPearlData || !currentSelectedPearlData.transcribers.length) return;

        const transcribers = currentSelectedPearlData.transcribers;
        let currentIndex = -1;

        if (currentSelectedTranscriberName) {
            const isIndexed = /.+-\d+$/.test(currentSelectedTranscriberName);
            if (isIndexed) {
                const index = parseInt(currentSelectedTranscriberName.split('-').pop()!);
                currentIndex = index;
            } else {
                currentIndex = transcribers.findIndex(t => t.transcriber === currentSelectedTranscriberName);
            }
        }

        if (currentIndex === -1) {
            currentIndex = direction === 'next' ? -1 : 0;
        }

        const newIndex = direction === 'next'
            ? (currentIndex + 1) % transcribers.length
            : (currentIndex - 1 + transcribers.length) % transcribers.length;

        const newTranscriber = transcribers[newIndex];
        const duplicateCount = transcribers.filter(t => t.transcriber === newTranscriber.transcriber).length;

        const newName = duplicateCount > 1
            ? `${newTranscriber.transcriber}-${newIndex}`
            : newTranscriber.transcriber;

        handleSelectTranscriberRef.current(newName);
    };

    const handleKeyNavigation = (e: KeyboardEvent) => {
        const currentPearlGrid = pearlGridRef.current;
        const currentSelectedPearlId = selectedPearlIdRef.current;

        if (!currentPearlGrid.length) return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

        const activeElement = document.activeElement;
        if (
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.isContentEditable)
        ) {
            return;
        }

        const maxRows = currentPearlGrid.length;
        let [row, col] = currentGridPositionRef.current;

        if (currentSelectedPearlId) {
            const pearlPos = findPearlPosition(currentSelectedPearlId, currentPearlGrid);
            if (pearlPos) {
                [row, col] = pearlPos;
            }
        }

        let handled = true;

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                for (let r = row - 1; r >= 0; r--) {
                    if (currentPearlGrid[r] && currentPearlGrid[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            case 'arrowdown':
            case 's':
                for (let r = row + 1; r < maxRows; r++) {
                    if (currentPearlGrid[r] && currentPearlGrid[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            case 'arrowleft':
            case 'a': {
                const newPos = findNextValidPosition(row, col - 1, currentPearlGrid, 'left');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'arrowright':
            case 'd': {
                const newPos = findNextValidPosition(row, col + 1, currentPearlGrid, 'right');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'q':
            case 'e':
                if (currentSelectedPearlId) {
                    handleTranscriberSelection(e.key.toLowerCase() === 'e' ? 'next' : 'prev');
                    e.preventDefault();
                    return;
                }
                handled = false;
                break;
            default:
                handled = false;
        }

        if (handled && (currentPearlGrid[row]?.[col] || findNextValidPosition(row, col, currentPearlGrid, 'right'))) {
            e.preventDefault();
            if (!currentPearlGrid[row]?.[col]) {
                const newPos = findNextValidPosition(row, col, currentPearlGrid, 'right');
                if (newPos) [row, col] = newPos;
            }
            setCurrentGridPosition([row, col]);

            if (currentPearlGrid[row]?.[col]) {
                handleSelectPearlRef.current(currentPearlGrid[row][col]);
            }
        }
    };

    useEffect(() => {
        if (selectedPearlId) {
            const pearlPos = findPearlPosition(selectedPearlId, pearlGrid);
            if (pearlPos) {
                setCurrentGridPosition(pearlPos);
            }
        }
    }, [selectedPearlId, pearlGrid]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => handleKeyNavigation(e);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // stable — reads from refs

    return { currentGridPosition };
}
