import { useEffect, useState } from "react";
import { urlAccess } from "../utils/urlAccess";
import { PearlData } from "../types/types";
import { UnlockMode } from "../page";

// helper functions
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
        // look right in current row
        for (let c = col; c < 5; c++) {
            if (currentRow && currentRow[c]) return [row, c];
        }
        // if not found, try next row from beginning
        if (row + 1 < maxRows) {
            for (let c = 0; c < 5; c++) {
                if (pearls[row + 1] && pearls[row + 1][c]) return [row + 1, c];
            }
        }
    } else {
        // look left in current row
        for (let c = col; c >= 0; c--) {
            if (currentRow && currentRow[c]) return [row, c];
        }
        // if not found, try previous row from end
        if (row - 1 >= 0) {
            for (let c = 4; c >= 0; c--) {
                if (pearls[row - 1] && pearls[row - 1][c]) return [row - 1, c];
            }
        }
    }
    return null;
};

export function useDialogue(unlockMode: UnlockMode, GRID_DATA: PearlData[]) {
    const [selectedPearl, setSelectedPearl] = useState<string | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState<string | null>(null);
    const [currentGridPosition, setCurrentGridPosition] = useState<[number, number]>([0, 0]);

    const handleSelectPearl = (pearl: PearlData | null) => {
        if (pearl === null) {
            setSelectedPearl(null);
            setSelectedTranscriber(null);
            return;
        }
        
        setSelectedPearl(pearl.id);
        
        // always start with the last transcriber
        const lastTranscriber = pearl.transcribers[pearl.transcribers.length - 1];
        if (!lastTranscriber) {
            setSelectedTranscriber(null);
            return;
        }
        
        // check if this transcriber name appears multiple times
        const duplicateCount = pearl.transcribers.filter(t => t.transcriber === lastTranscriber.transcriber).length;
        const lastIndex = pearl.transcribers.length - 1;
        
        // if multiple occurrences, include the index
        setSelectedTranscriber(duplicateCount > 1 
            ? `${lastTranscriber.transcriber}-${lastIndex}`
            : lastTranscriber.transcriber
        );
    };

    const handleTranscriberSelection = (
        transcribers: PearlData['transcribers'],
        currentTranscriber: string | null,
        direction: 'next' | 'prev'
    ): string | null => {
        if (!transcribers.length) return null;

        // find current index
        let currentIndex = 0;
        if (currentTranscriber) {
            // First try to find exact match
            currentIndex = transcribers.findIndex(t => 
                t.transcriber === currentTranscriber || 
                `${t.transcriber}-${transcribers.indexOf(t)}` === currentTranscriber
            );
            // if not found, default to first/last based on direction
            if (currentIndex === -1) {
                currentIndex = direction === 'next' ? 0 : transcribers.length - 1;
            }
        }

        // calculate new index
        const newIndex = direction === 'next'
            ? (currentIndex + 1) % transcribers.length
            : (currentIndex - 1 + transcribers.length) % transcribers.length;

        const newTranscriber = transcribers[newIndex];
        
        // check if this transcriber name appears multiple times
        const duplicateCount = transcribers.filter(t => t.transcriber === newTranscriber.transcriber).length;
        
        // if multiple occurrences, include the index
        return duplicateCount > 1 
            ? `${newTranscriber.transcriber}-${newIndex}`
            : newTranscriber.transcriber;
    };

    const handleKeyNavigation = (e: KeyboardEvent, pearls: PearlData[][], currentPearlId: string | null) => {
        if (!pearls.length) return;
        if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

        const maxRows = pearls.length;
        let [row, col] = currentGridPosition;

        // sync position with selected pearl if needed
        if (currentPearlId) {
            const pearlPos = findPearlPosition(currentPearlId, pearls);
            if (pearlPos) {
                [row, col] = pearlPos;
                setCurrentGridPosition(pearlPos);
            }
        }

        let handled = true;

        switch (e.key.toLowerCase()) {
            case 'arrowup':
            case 'w': {
                for (let r = row - 1; r >= 0; r--) {
                    if (pearls[r] && pearls[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            }
            case 'arrowdown':
            case 's': {
                for (let r = row + 1; r < maxRows; r++) {
                    if (pearls[r] && pearls[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            }
            case 'arrowleft':
            case 'a': {
                const newPos = findNextValidPosition(row, col - 1, pearls, 'left');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'arrowright':
            case 'd': {
                const newPos = findNextValidPosition(row, col + 1, pearls, 'right');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'q':
            case 'e': {
                if (currentPearlId) {
                    const currentPearl = pearls.flat().find(p => p?.id === currentPearlId);
                    if (currentPearl?.transcribers.length) {
                        const newTranscriber = handleTranscriberSelection(
                            currentPearl.transcribers,
                            selectedTranscriber,
                            e.key.toLowerCase() === 'e' ? 'next' : 'prev'
                        );
                        setSelectedTranscriber(newTranscriber);
                        e.preventDefault();
                        return;
                    }
                }
                handled = false;
                break;
            }
            default:
                handled = false;
        }

        if (handled && (pearls[row]?.[col] || findNextValidPosition(row, col, pearls, 'right'))) {
            e.preventDefault();
            if (!pearls[row]?.[col]) {
                const newPos = findNextValidPosition(row, col, pearls, 'right');
                if (newPos) [row, col] = newPos;
            }
            setCurrentGridPosition([row, col]);

            if (pearls[row]?.[col]) {
                handleSelectPearl(pearls[row][col]);
            }
        }
    };

    // keep grid position in sync with selected pearl
    useEffect(() => {
        if (selectedPearl) {
            const pearlPos = findPearlPosition(selectedPearl, []);
            if (pearlPos) {
                setCurrentGridPosition(pearlPos);
            }
        }
    }, [selectedPearl]);

    function pearlIdToUrlId(id: string) {
        for (let element of GRID_DATA) {
            if (element.metadata.internalId && element.id === id) {
                return element.metadata.internalId;
            }
        }
        return id;
    }

    // update url params
    useEffect(() => {
        if (unlockMode === "all") {
            if (selectedPearl) {
                urlAccess.setParam("pearl", pearlIdToUrlId(selectedPearl));
            } else {
                urlAccess.clearParam("pearl");
            }
            if (selectedTranscriber) {
                urlAccess.setParam("transcriber", selectedTranscriber);
            } else {
                urlAccess.clearParam("transcriber");
            }
        } else {
            urlAccess.clearParam("pearl");
            urlAccess.clearParam("transcriber");
        }
    }, [selectedPearl, selectedTranscriber, unlockMode]);

    return {
        selectedPearl,
        selectedTranscriber,
        handleSelectPearl,
        handleSelectTranscriber: setSelectedTranscriber,
        handleKeyNavigation,
        currentGridPosition
    };
}