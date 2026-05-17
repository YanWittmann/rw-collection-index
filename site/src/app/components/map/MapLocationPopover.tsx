"use client"

import { useMemo, useState } from "react";
import type React from "react";
import { MapInfo } from "../../types/types";
import { generateMapLinkFromMapInfo } from "../../utils/mapUtils";
import { getRegion } from "../../utils/speakers";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { RwScrollableList, RwScrollableListItem } from "../other/RwScrollableList";
import { RwCheckbox } from "../other/RwCheckbox";
import { MapModal } from "./MapModal";

interface MapLocationPopoverProps {
    locations: MapInfo[];
    children: React.ReactNode;
}

export function MapLocationPopover({ locations, children }: MapLocationPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [previewEnabled, setPreviewEnabled] = useState<boolean>(() => {
        try { return localStorage.getItem('rw-map-preview') === 'true'; } catch { return false; }
    });
    const [modalOpen, setModalOpen] = useState(false);

    const listItems: RwScrollableListItem[] = useMemo(() => {
        return locations.map((loc, i) => {
            const regionDef = getRegion(loc.region);
            const link = generateMapLinkFromMapInfo(loc);
            return {
                id: `loc-${i}`,
                title: `${loc.region}_${loc.room}`,
                subtitle: regionDef.name,
                asset: regionDef.image ? { src: regionDef.image, fit: 'cover' as const } : undefined,
                color: regionDef.color,
                onClick: previewEnabled
                    ? () => { setIsOpen(false); setModalOpen(true); }
                    : link ? () => { setIsOpen(false); window.open(link, '_blank'); } : undefined,
            };
        });
    }, [locations, previewEnabled]);

    const openModal = () => { setIsOpen(false); setModalOpen(true); };
    const disablePreview = () => {
        setPreviewEnabled(false);
        try { localStorage.setItem('rw-map-preview', 'false'); } catch { /* */ }
        setModalOpen(false);
        setIsOpen(true);
    };

    const header = (
        <div className="px-4 pt-4 pb-3">
            <RwCheckbox
                checked={previewEnabled}
                onCheckedChange={() => {
                    const next = !previewEnabled;
                    setPreviewEnabled(next);
                    try { localStorage.setItem('rw-map-preview', next ? 'true' : 'false'); } catch { /* */ }
                    if (next) openModal();
                }}
                size="xsmall"
            >
                Enable preview
            </RwCheckbox>
        </div>
    );

    return (
        <>
            <Popover open={isOpen} onOpenChange={(open) => {
                if (open && previewEnabled) { openModal(); }
                else { setIsOpen(open); }
            }}>
                <PopoverTrigger asChild>
                    {children}
                </PopoverTrigger>
                <PopoverContent
                    className="w-72 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg overflow-y-auto"
                    style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
                    align="start"
                    sideOffset={5}
                >
                    <RwScrollableList items={listItems} header={header} />
                </PopoverContent>
            </Popover>
            {modalOpen && (
                <MapModal locations={locations} onClose={() => setModalOpen(false)} onDisablePreview={disablePreview} />
            )}
        </>
    );
}
