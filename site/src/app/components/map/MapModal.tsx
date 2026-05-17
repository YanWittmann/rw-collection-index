"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { createPortal } from "react-dom";
import { MapInfo } from "../../types/types";
import { generateMapLinkFromMapInfo } from "../../utils/mapUtils";
import { getRegion } from "../../utils/speakers";
import { useAppContext } from "../../context/AppContext";
import { RwScrollableList, RwScrollableListEntry, RwScrollableListItem } from "../other/RwScrollableList";
import { RwCheckbox } from "../other/RwCheckbox";
import { LoadingSpinner } from "../LoadingSpinner";
import { cn } from "@shadcn/lib/utils";
import { ensureMinLightness } from "../../utils/colorUtils";

interface MapModalProps {
    locations: MapInfo[];
    onClose: () => void;
    onDisablePreview?: () => void;
}

function LocationInfoPanel({ location, link }: { location: MapInfo; link: string | null }) {
    const regionDef = getRegion(location.region);
    return (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 p-8 text-center text-white">
            <div
                className="text-lg font-medium"
                style={{ color: regionDef.color ? ensureMinLightness(regionDef.color) : undefined }}
            >
                {regionDef.name} ({location.region})
            </div>
            <div className="font-mono text-sm text-white/60">
                {location.region}_{location.room}
            </div>
            {link ? (
                <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 text-sm text-blue-400 underline hover:text-blue-300 transition-colors"
                >
                    Open in new tab ↗
                </a>
            ) : (
                <div className="text-sm text-white/40 mt-2">
                    No interactive map is available for this region.
                </div>
            )}
        </div>
    );
}

export function MapModal({ locations, onClose, onDisablePreview }: MapModalProps) {
    const { isMobile } = useAppContext();

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [iframeSrc, setIframeSrc] = useState<string | null>(
        () => generateMapLinkFromMapInfo(locations[0])
    );
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const prevSrcRef = useRef<string | null>(null);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        setPortalRoot(div);
        return () => { document.body.removeChild(div); };
    }, []);

    useEscapeKey(onClose);

    const handleSelectLocation = useCallback((index: number) => {
        setSelectedIndex(index);
        const newSrc = generateMapLinkFromMapInfo(locations[index]);
        if (newSrc !== prevSrcRef.current) setIframeLoaded(false);
        setIframeSrc(newSrc);
    }, [locations]);

    const currentLocation = locations[selectedIndex];
    const currentLink = useMemo(
        () => generateMapLinkFromMapInfo(currentLocation),
        [currentLocation]
    );

    const listItems: RwScrollableListItem[] = useMemo(() => {
        return locations.map((loc, i) => {
            const regionDef = getRegion(loc.region);
            return {
                id: `loc-${i}`,
                subtitle: regionDef.name,
                title: `${loc.region}_${loc.room}`,
                asset: regionDef.image ? { src: regionDef.image, fit: 'cover' as const } : undefined,
                color: regionDef.color,
                onClick: () => handleSelectLocation(i),
            };
        });
    }, [locations, handleSelectLocation]);

    const activeItemId = `loc-${selectedIndex}`;

    const renderIframeOrInfo = (location: MapInfo, link: string | null) => {
        if (!link) return <LocationInfoPanel location={location} link={null} />;
        return (
            <div className="relative flex-1 min-h-0">
                <iframe
                    src={iframeSrc!}
                    title="Rain World Map"
                    style={{ border: 'none', width: '100%', height: '100%' }}
                    onLoad={(e) => {
                        prevSrcRef.current = (e.target as HTMLIFrameElement).src;
                        setIframeLoaded(true);
                    }}
                />
                {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <LoadingSpinner />
                    </div>
                )}
            </div>
        );
    };

    const renderBody = () => {
        if (isMobile) {
            return (
                <div className="flex flex-col flex-1 overflow-hidden">
                    {locations.length > 1 && (
                        <div
                            className="flex overflow-x-auto no-scrollbar border-b-2 border-white/80 flex-shrink-0 bg-white/5"
                            onTouchStart={e => e.stopPropagation()}
                            onTouchEnd={e => e.stopPropagation()}
                        >
                            {listItems.map((item, i) => (
                                <RwScrollableListEntry
                                    key={item.id}
                                    item={item}
                                    active={i === selectedIndex}
                                    className="w-auto flex-shrink-0 border-r-2 border-white/80"
                                    assetVariant="title-post"
                                />
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col flex-1 overflow-hidden">
                        {renderIframeOrInfo(currentLocation, currentLink)}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-1 overflow-hidden">
                {locations.length > 1 && (
                    <div className="w-56 border-r-2 border-white/80 flex-shrink-0 overflow-hidden">
                        <RwScrollableList items={listItems} activeId={activeItemId} noBorder />
                    </div>
                )}
                <div className="flex flex-col flex-1 overflow-hidden">
                    {renderIframeOrInfo(currentLocation, currentLink)}
                </div>
            </div>
        );
    };

    const singleLocationItem: RwScrollableListItem | null = useMemo(() => {
        if (locations.length !== 1) return null;
        const loc = locations[0];
        const regionDef = getRegion(loc.region);
        const link = generateMapLinkFromMapInfo(loc);
        return {
            id: 'loc-0',
            subtitle: regionDef.name,
            title: `${loc.region}_${loc.room}`,
            asset: regionDef.image ? { src: regionDef.image, fit: 'cover' as const } : undefined,
            color: regionDef.color,
            onClick: link ? () => window.open(link, '_blank') : undefined,
        };
    }, [locations]);

    const header = (
        <div className="flex items-center border-b-2 border-white/80 flex-shrink-0">
            {singleLocationItem ? (
                <RwScrollableListEntry item={singleLocationItem} className="w-auto flex-shrink-0 border-r-2 border-white/80" />
            ) : null}
            <div className="flex items-center gap-3 py-2 px-5 flex-1">
                {onDisablePreview && (
                    <RwCheckbox checked={true} onCheckedChange={onDisablePreview} size="xsmall">
                        Enable preview
                    </RwCheckbox>
                )}
                <div className="flex-1" />
                <div
                    className="cursor-pointer w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    onClick={onClose}
                >
                    ✕
                </div>
            </div>
        </div>
    );

    const modalInnerClass = cn(
        "bg-black border-2 border-white/80 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden absolute",
        isMobile ? "inset-x-2 inset-y-4" : "inset-6"
    );

    if (!portalRoot) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 bg-black/60"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={modalInnerClass}>
                {header}
                <div className="flex flex-1 overflow-hidden">
                    {renderBody()}
                </div>
            </div>
        </div>,
        portalRoot
    );
}
