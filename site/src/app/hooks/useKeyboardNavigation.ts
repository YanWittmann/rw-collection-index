import { useEffect, useState } from 'react';
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

    const handleTranscriberSelection = (direction: 'next' | 'prev') => {
        if (!selectedPearlData || !selectedPearlData.transcribers.length) return;

        const transcribers = selectedPearlData.transcribers;
        let currentIndex = -1;

        if (selectedTranscriberName) {
            const isIndexed = /.+-\d+$/.test(selectedTranscriberName);
            if (isIndexed) {
                const index = parseInt(selectedTranscriberName.split('-').pop()!);
                currentIndex = index;
            } else {
                currentIndex = transcribers.findIndex(t => t.transcriber === selectedTranscriberName);
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

        handleSelectTranscriber(newName);
    };

    const handleKeyNavigation = (e: KeyboardEvent) => {
        if (!pearlGrid.length) return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

        const activeElement = document.activeElement;
        if (
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement ||
            (activeElement instanceof HTMLElement && activeElement.isContentEditable)
        ) {
            return;
        }

        const maxRows = pearlGrid.length;
        let [row, col] = currentGridPosition;

        if (selectedPearlId) {
            const pearlPos = findPearlPosition(selectedPearlId, pearlGrid);
            if (pearlPos) {
                [row, col] = pearlPos;
            }
        }

        let handled = true;

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                for (let r = row - 1; r >= 0; r--) {
                    if (pearlGrid[r] && pearlGrid[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            case 'arrowdown':
            case 's':
                for (let r = row + 1; r < maxRows; r++) {
                    if (pearlGrid[r] && pearlGrid[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            case 'arrowleft':
            case 'a': {
                const newPos = findNextValidPosition(row, col - 1, pearlGrid, 'left');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'arrowright':
            case 'd': {
                const newPos = findNextValidPosition(row, col + 1, pearlGrid, 'right');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'q':
            case 'e':
                if (selectedPearlId) {
                    handleTranscriberSelection(e.key.toLowerCase() === 'e' ? 'next' : 'prev');
                    e.preventDefault();
                    return;
                }
                handled = false;
                break;
            default:
                handled = false;
        }

        if (handled && (pearlGrid[row]?.[col] || findNextValidPosition(row, col, pearlGrid, 'right'))) {
            e.preventDefault();
            if (!pearlGrid[row]?.[col]) {
                const newPos = findNextValidPosition(row, col, pearlGrid, 'right');
                if (newPos) [row, col] = newPos;
            }
            setCurrentGridPosition([row, col]);

            if (pearlGrid[row]?.[col]) {
                handleSelectPearl(pearlGrid[row][col]);
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
    }, [pearlGrid, currentGridPosition, selectedPearlId, selectedTranscriberName]);

    return { currentGridPosition };
}