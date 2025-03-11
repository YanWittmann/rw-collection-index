import { useEffect, useState } from "react";
import { urlAccess } from "../utils/urlAccess";
import { PearlData } from "../types/types";
import { UnlockMode } from "../page";

export function useDialogue(unlockMode: UnlockMode) {
    const [selectedPearl, setSelectedPearl] = useState<string | null>(null);
    const [selectedTranscriber, setSelectedTranscriber] = useState<string | null>(null);
    const [currentGridPosition, setCurrentGridPosition] = useState<[number, number]>([0, 0]); // [row, col]

    // find position of a pearl in the grid
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

    const handleSelectPearl = (pearl: PearlData | null) => {
        if (pearl === null) {
            setSelectedPearl(null);
            setSelectedTranscriber(null);
            return;
        }
        const multipleSameTranscribers = new Set(pearl.transcribers.map(transcriber => transcriber.transcriber)).size !== pearl.transcribers.length;
        setSelectedPearl(pearl.id);
        const possibleTranscriber = pearl.transcribers[pearl.transcribers.length - 1]?.transcriber;
        if (multipleSameTranscribers && possibleTranscriber) {
            setSelectedTranscriber(possibleTranscriber + '-' + (pearl.transcribers.length - 1));
        } else {
            setSelectedTranscriber(possibleTranscriber ?? null);
        }
    };

    const findNextValidPosition = (row: number, col: number, pearls: PearlData[][], direction: 'right' | 'left'): [number, number] | null => {
        const maxRows = pearls.length;
        if (row >= maxRows) return null;

        // Try current row first
        const currentRow = pearls[row];
        if (direction === 'right') {
            // Look right in current row
            for (let c = col; c < 5; c++) {
                if (currentRow && currentRow[c]) return [row, c];
            }
            // If not found, try next row from beginning
            if (row + 1 < maxRows) {
                for (let c = 0; c < 5; c++) {
                    if (pearls[row + 1] && pearls[row + 1][c]) return [row + 1, c];
                }
            }
        } else {
            // Look left in current row
            for (let c = col; c >= 0; c--) {
                if (currentRow && currentRow[c]) return [row, c];
            }
            // If not found, try previous row from end
            if (row - 1 >= 0) {
                for (let c = 4; c >= 0; c--) {
                    if (pearls[row - 1] && pearls[row - 1][c]) return [row - 1, c];
                }
            }
        }
        return null;
    };

    const handleKeyNavigation = (e: KeyboardEvent, pearls: PearlData[][], currentPearlId: string | null) => {
        if (!pearls.length) return;
        
        const maxRows = pearls.length;
        let [row, col] = currentGridPosition;

        // If there's a selected pearl but it doesn't match our current position,
        // update our position to match it
        if (currentPearlId) {
            const pearlPos = findPearlPosition(currentPearlId, pearls);
            if (pearlPos) {
                [row, col] = pearlPos;
                setCurrentGridPosition(pearlPos);
            }
        }
        
        let handled = true;

        switch (e.key.toLowerCase()) {
            case 'w': {
                // Try to find a valid position in the row above
                for (let r = row - 1; r >= 0; r--) {
                    if (pearls[r] && pearls[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            }
            case 's': {
                // Try to find a valid position in the row below
                for (let r = row + 1; r < maxRows; r++) {
                    if (pearls[r] && pearls[r][col]) {
                        row = r;
                        break;
                    }
                }
                break;
            }
            case 'a': {
                const newPos = findNextValidPosition(row, col - 1, pearls, 'left');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'd': {
                const newPos = findNextValidPosition(row, col + 1, pearls, 'right');
                if (newPos) [row, col] = newPos;
                break;
            }
            case 'q':
            case 'e': {
                if (currentPearlId) {
                    const currentPearl = pearls.flat().find(p => p?.id === currentPearlId);
                    if (currentPearl && currentPearl.transcribers.length > 0) {
                        const transcribers = currentPearl.transcribers;
                        let currentIndex = transcribers.length - 1;

                        if (selectedTranscriber) {
                            const [baseName, indexStr] = selectedTranscriber.split('-');
                            const index = parseInt(indexStr);
                            if (!isNaN(index)) {
                                currentIndex = index;
                            } else {
                                currentIndex = transcribers.findIndex(t => t.transcriber === selectedTranscriber);
                                if (currentIndex === -1) currentIndex = transcribers.length - 1;
                            }
                        }

                        let newIndex;
                        if (e.key.toLowerCase() === 'q') {
                            newIndex = (currentIndex - 1 + transcribers.length) % transcribers.length;
                        } else {
                            newIndex = (currentIndex + 1) % transcribers.length;
                        }

                        const newTranscriber = transcribers[newIndex].transcriber;
                        // count how many times this transcriber name appears
                        const sameTranscribers = transcribers.filter(t => t.transcriber === newTranscriber);
                        // if it appears more than once, always use the index suffix
                        setSelectedTranscriber(sameTranscribers.length > 1 ? `${newTranscriber}-${newIndex}` : newTranscriber);
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
            
            // Find and select the pearl at the new position
            if (pearls[row] && pearls[row][col]) {
                const pearl = pearls[row][col];
                if (pearl) handleSelectPearl(pearl);
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

    useEffect(() => {
        if (unlockMode === "all" && selectedPearl) {
            urlAccess.setParam("pearl", selectedPearl);
        } else {
            urlAccess.clearParam("pearl");
        }
        if (unlockMode === "all" && selectedTranscriber) {
            urlAccess.setParam("transcriber", selectedTranscriber);
        } else {
            urlAccess.clearParam("transcriber");
        }
    }, [selectedPearl, selectedTranscriber]);

    return {
        selectedPearl,
        selectedTranscriber,
        handleSelectPearl,
        handleSelectTranscriber: setSelectedTranscriber,
        handleKeyNavigation,
        currentGridPosition
    };
}