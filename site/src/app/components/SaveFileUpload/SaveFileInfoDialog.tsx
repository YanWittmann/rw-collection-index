"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RwIconButton } from '../other/RwIconButton';
import { RwIcon } from '../PearlGrid/RwIcon';
import { useAppContext } from '../../context/AppContext';

interface SaveFileInfoDialogProps {
    onFile: (file: File, donate: boolean) => void;
    onClose: () => void;
}

const pick = <T, >(arr: T[]): T | undefined => arr.length ? arr[Math.floor(Math.random() * arr.length)] : undefined;

function getSavePath(): string | null {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return String.raw`%USERPROFILE%\AppData\LocalLow\Videocult\Rain World`;
    if (ua.includes('Mac')) return '~/Library/Application Support/Rain World';
    if (ua.includes('Linux')) return '~/.config/unity3d/Videocult/Rain World';
    return null;
}

export function SaveFileInfoDialog({ onFile, onClose }: SaveFileInfoDialogProps) {
    const { pearls } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const [copied, setCopied] = useState(false);
    const [donateSave, setDonateSave] = useState(false);
    const savePath = useMemo(() => getSavePath(), []);

    const examples = useMemo(() => {
        const pearlEntry = pick(pearls.filter(p => p.metadata.type === 'pearl'));
        const itemEntry = pick(pearls.filter(p => p.metadata.type === 'item' && p.metadata.subType?.startsWith('item/')));
        const broadcastEntry = pick(pearls.filter(p => p.metadata.type === 'broadcast'));
        return [
            {
                label: 'Collected pearl',
                variant: 'gold' as const,
                iconType: 'pearl',
                color: pearlEntry?.metadata.color ?? '#aaaaaa'
            },
            {
                label: 'Found item',
                variant: 'gold' as const,
                iconType: itemEntry?.metadata.subType ?? 'pearl',
                color: undefined
            },
            {
                label: 'Not yet found',
                variant: 'default' as const,
                iconType: 'questionmark',
                color: broadcastEntry?.metadata.color ?? '#d48573'
            },
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        setPortalRoot(div);
        return () => {
            document.body.removeChild(div);
        };
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) onFile(file, donateSave);
    }, [onFile, donateSave]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragOver(false), []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFile(file, donateSave);
        e.target.value = '';
    }, [onFile, donateSave]);

    if (!portalRoot) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="bg-black border-2 border-white/80 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.1)] w-full max-w-md flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center py-3 px-5 border-b border-white/20">
                    <h2 className="text-white font-medium">Sync save file unlocks</h2>
                    <div
                        className="cursor-pointer text-white hover:bg-white/10 p-1 rounded"
                        onClick={onClose}
                    >
                        ✕
                    </div>
                </div>

                <div className="flex flex-col gap-5 p-6">
                    {/* Drop zone + path hint */}
                    <div className="flex flex-col gap-2">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors select-none ${
                                isDragOver
                                    ? 'border-white/80 bg-white/10'
                                    : 'border-white/30 hover:border-white/50 hover:bg-white/5'
                            }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange}/>
                            <p className="text-white font-medium text-sm">Drop your save file here or click to
                                browse.</p>
                            <p className="text-white/50 text-xs mt-1">Your save file is processed locally in the
                                browser.</p>
                        </div>
                        {savePath && (
                            <p
                                className={`font-mono text-xs text-center select-text cursor-copy transition-colors ${copied ? 'text-white/70' : 'text-white/50'}`}
                                onMouseDown={() => {
                                    navigator.clipboard.writeText(savePath).then(() => {
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 1000);
                                    }).catch(() => {
                                    });
                                }}
                            >
                                {copied ? 'Copied!' : savePath}
                            </p>
                        )}
                        {/* Donate checkbox */}
                        <div className="flex items-center justify-center gap-2 px-1 mt-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div
                                    className={`shrink-0 w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                                        donateSave ? 'border-white/60 bg-white/15' : 'border-white/30 group-hover:border-white/50'
                                    }`}>
                                    {donateSave &&
                                        <span className="text-white text-[9px] leading-none select-none">✓</span>}
                                </div>
                                <input type="checkbox" className="hidden" checked={donateSave}
                                       onChange={(e) => setDonateSave(e.target.checked)}/>
                                <span
                                    className="text-xs text-white/50 group-hover:text-white/70 transition-colors leading-snug select-none">
                                    Submit save file for parser testing.
                                </span>
                            </label>
                            <a
                                href="https://github.com/YanWittmann/rw-collection-index/blob/main/privacy.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-white/50 underline transition-colors"
                            >Privacy policy</a>
                        </div>
                    </div>

                    {/* Explanatory text */}
                    <ul className="text-white/90 text-sm space-y-2">
                        <li>Load your save file to highlight which pearls, broadcasts, items and interactions you have
                            already completed.
                        </li>
                        <li>In Spoiler Protection mode, items you have not yet collected remain hidden behind a question
                            mark.
                        </li>
                        <li>Not all entries are supported, as some data is not tracked by the game.
                        </li>
                    </ul>

                    {/* Example buttons */}
                    <div className="flex flex-row gap-8 justify-center">
                        {examples.map(({ label, variant, iconType, color }) => (
                            <div key={label} className="flex flex-col items-center gap-2">
                                <div className="pointer-events-none">
                                    <RwIconButton variant={variant} aria-label={label} selected={false}>
                                        <RwIcon color={color} type={iconType}/>
                                    </RwIconButton>
                                </div>
                                <span className="text-xs text-white/50">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        portalRoot
    );
}
