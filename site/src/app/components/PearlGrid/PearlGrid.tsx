import { PearlData } from "../../types/types";
import { RwTextInput } from "./RwTextInput";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PearlItem from "./PearlItem";
import { cn } from "@shadcn/lib/utils";
import { RwIconButton } from "../other/RwIconButton";
import { FilterSection, PearlFilter } from "./PearlFilter";
import { getSpeakerInfo, regionColors, regionNames, speakerNames } from "../../utils/speakers";
import { OrderedChapter } from "../../utils/pearlOrder";
import { useAppContext } from "../../context/AppContext";
import { useFilteredPearls } from "../../hooks/useFilteredPearls";
import { useChapterExpansion } from "../../hooks/useChapterExpansion";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { RwScrollableList, RwScrollableListItem } from "../other/RwScrollableList";

interface FlatChapterItem {
    id: string;
    name: string;
    items: PearlData[];
    depth: number;
    hasSubChapters: boolean;
    isExpanded: boolean;
    originalChapter: OrderedChapter;
}

interface PearlGridProps {
    order: (pearls: PearlData[]) => OrderedChapter[];
    isAlternateDisplayModeActive?: boolean; // This could become global state too
}

interface MemoizedPearlItemProps {
    pearl: PearlData;
    pearlIndex: number;
    showTranscriberCount: boolean;
}

const SearchBar = () => {
    const { isMobile, unlockMode, setUnlockMode, filters, setFilters } = useAppContext();

    const onToggleUnlockMode = useCallback(() => {
        setUnlockMode(unlockMode === "all" ? "unlock" : "all");
    }, [unlockMode, setUnlockMode]);

    const onTextInput = useCallback((text: string) => {
        setFilters(prev => ({ ...prev, text: text === '' ? undefined : text }));
    }, [setFilters]);

    // This data should ideally not be recalculated here.
    // For a future refactor, this could be derived once and stored in context.
    const { pearls } = useAppContext();
    const filterSections: FilterSection[] = useMemo(() => {
        const uniqueRegions = new Set<string>();
        pearls.forEach(p => p.transcribers.forEach(t => t.metadata.map?.forEach(m => m.region && uniqueRegions.add(m.region))));

        const uniqueSpeakers = new Set<string>();
        pearls.forEach(p => p.transcribers.forEach(t => t.lines.forEach(l => {
            if (l.speaker) {
                uniqueSpeakers.add((l.namespace ? l.namespace + "-" : "") + l.speaker);
            }
        })));
        uniqueSpeakers.delete("Five Pebbles");

        const sortedRegions = Array.from(uniqueRegions).sort();
        const sortedSpeakers = Array.from(uniqueSpeakers).sort((a, b) => {
            const indexA = Object.keys(speakerNames).indexOf(a);
            const indexB = Object.keys(speakerNames).indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        return [
            {
                title: "Tags",
                options: [
                    { id: "vanilla", label: "Vanilla (No DLC)", icon: "vanilla-rw" },
                    { id: "downpour", label: "Downpour", icon: "dlc-dp" },
                    { id: "watcher", label: "Watcher", icon: "dlc-watcher" },
                ]
            },
            {
                title: "Types",
                options: [
                    { id: "pearl", label: "Pearl", icon: "pearl", iconColor: '#A0A0A0' },
                    { id: "broadcast", label: "Broadcast", icon: "broadcast", iconColor: '#FFFFFF' },
                    { id: "echo", label: "Echo", icon: "echo" },
                    { id: "item", label: "Other", icon: "item/Bubble_Weed_icon" }
                ]
            },
            {
                title: "Regions",
                options: sortedRegions.map(r => ({
                    id: r,
                    label: regionNames[r] ?? r,
                    content: r,
                    iconColor: regionColors[r]
                })),
            },
            {
                title: "Speakers",
                options: sortedSpeakers.map(s => {
                    // s is the full key (e.g. NSCP-FPB or just FPB)
                    // We need to parse it back to lookup info, or assume s is the 'rawSpeaker'
                    let actualSpeaker = s;
                    let namespace = undefined;
                    const hyphenIndex = s.indexOf('-');
                    if (s.startsWith('NS') && hyphenIndex > 2 && hyphenIndex < s.length - 1) {
                        namespace = s.slice(0, hyphenIndex);
                        actualSpeaker = s.slice(hyphenIndex + 1);
                    }

                    const info = getSpeakerInfo(s, actualSpeaker, namespace);

                    return {
                        id: s,
                        label: info.displayName,
                        content: actualSpeaker,
                        iconColor: info.color
                    };
                }),
            }
        ];
    }, [pearls]);

    return (
        <div className={"flex gap-2 items-center"}>
            <div className={cn("relative flex items-center", isMobile ? "flex-1" : "w-full")}>
                <RwTextInput
                    value={filters.text || ''}
                    className="w-full pr-8 bg-gray-950"
                    onTextInput={onTextInput}
                    placeholder="Search..."
                />
                {(filters.text || '').length > 0 && (
                    <button
                        type="button"
                        onClick={() => onTextInput('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white focus:outline-none transition-colors"
                        aria-label="Clear search">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2}
                             stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                )}
            </div>
            <PearlFilter filters={filters} setFilters={setFilters} filterSections={filterSections}/>
            {isMobile && (
                <RwIconButton square={false} onClick={onToggleUnlockMode} className="shrink-0"
                              aria-label="Toggle Unlock Mode">
                    <span className="text-white">{unlockMode === "all" ? "Spoiler" : "Show All"}</span>
                </RwIconButton>
            )}
        </div>
    );
};

const BannerChapterHeader = React.memo(({ flatChapter, onToggle }: {
    flatChapter: FlatChapterItem,
    onToggle: () => void
}) => {
    const { originalChapter, depth, hasSubChapters } = flatChapter;
    const { icon: iconUrl, link: linkData } = originalChapter;
    const [isLinkPopoverOpen, setIsLinkPopoverOpen] = useState(false);

    const iconElement = useMemo(() => {
        if (!iconUrl) return null;

        const ImageContent = (
            <img src={iconUrl} alt={"Icon for " + flatChapter.name}/>
        );

        if (typeof linkData === 'string') {
            return (
                <a
                    href={linkData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 block"
                    onClick={(e) => e.stopPropagation()}
                >
                    <RwIconButton
                        square={true}
                        aria-label="Open Link"
                    >
                        {ImageContent}
                    </RwIconButton>
                </a>
            );
        }

        if (Array.isArray(linkData) && linkData.length > 0) {
            const listItems: RwScrollableListItem[] = linkData.map((link, index) => ({
                id: `link-${index}`,
                title: link.title,
                subtitle: link.subtitle ?? link.url,
                onClick: () => {
                    window.open(link.url, "_blank");
                    setIsLinkPopoverOpen(false);
                },
            }));

            return (
                <Popover open={isLinkPopoverOpen} onOpenChange={setIsLinkPopoverOpen}>
                    <PopoverTrigger asChild>
                        <div onClick={(e) => e.stopPropagation()}>
                            <RwIconButton
                                square={true}
                                aria-label="Open Links"
                                padding="p-2"
                            >
                                {ImageContent}
                            </RwIconButton>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-64 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg text-white"
                        align="end"
                        sideOffset={5}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <RwScrollableList items={listItems} breakSubtitle={false}/>
                    </PopoverContent>
                </Popover>
            );
        }

        return (
            <RwIconButton
                square={true}
                className="shrink-0 w-[52px] h-[52px] p-2 cursor-default"
                aria-label="Chapter Icon"
            >
                {ImageContent}
            </RwIconButton>
        );
    }, [iconUrl, linkData, flatChapter.name, isLinkPopoverOpen]);

    return (
        <div
            className={cn("flex w-full gap-2", depth > 0 && "mt-2", flatChapter.isExpanded && "mb-3")}
            style={{
                marginLeft: `${depth * 16}px`,
                width: `calc(100% - ${depth * 16}px)`
            }}
        >
            <RwIconButton
                square={false}
                className="flex-1"
                onClick={onToggle}
                expandedScaleFactor={0.2}
                aria-label={flatChapter.name}
            >
                <div className="flex w-full items-center justify-start gap-4">
                    <span
                        className={cn("font-medium tracking-wide", flatChapter.isExpanded ? "text-white" : "text-gray-500", flatChapter.name.length > 20 ? "text-sm" : "text-md")}>
                        {flatChapter.name}
                    </span>
                </div>
            </RwIconButton>
            {iconElement}
        </div>
    );
});

// wrapper component for lazy loading
const LazyChapterGrid = ({
                             flatChapter,
                             chapterIndex,
                             isVisible,
                             setVisibleChapters,
                             currentGridPosition,
                             selectedPearlRef,
                             getHighlightStyle,
                             isAlternateDisplayModeActive,
                             onToggle
                         }: {
    flatChapter: FlatChapterItem
    chapterIndex: number
    isVisible: boolean
    setVisibleChapters: (callback: (prev: Set<number>) => Set<number>) => void
    currentGridPosition?: [number, number]
    selectedPearlRef: React.RefObject<HTMLDivElement | null>
    getHighlightStyle: (chapterId: string, itemIndex: number) => React.CSSProperties
    isAlternateDisplayModeActive: boolean
    onToggle: () => void
}) => {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const currentRef = observerRef.current;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisibleChapters(prev => new Set([...Array.from(prev), chapterIndex]));
            }
        }, { rootMargin: '200px' });

        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [chapterIndex, setVisibleChapters]);

    return (
        <div ref={observerRef} className="last:mb-4">
            {flatChapter.name && (
                flatChapter.originalChapter.headerType === "banner" ? (
                    <BannerChapterHeader flatChapter={flatChapter} onToggle={onToggle}/>
                ) : (
                    <button onClick={onToggle}
                            className={cn("flex items-center gap-2 w-full text-left group focus:outline-none", flatChapter.isExpanded && flatChapter.items.length > 0 && "mb-2")}
                            style={{ paddingLeft: `${flatChapter.depth * 16}px` }}>
                        <h3 className="text-white text-sm font-medium group-hover:text-white/90">{flatChapter.name}</h3>
                        <div
                            className={cn("text-white/60 group-hover:text-white transition-transform duration-200", flatChapter.isExpanded ? "rotate-90" : "rotate-0")}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="m9 18 6-6-6-6"/>
                            </svg>
                        </div>
                    </button>
                )
            )}
            {flatChapter.isExpanded && flatChapter.items.length > 0 && (
                <>
                    {isVisible ? (
                        <div className="grid grid-cols-5 gap-2 w-fit">
                            {flatChapter.items.map((pearl, pearlIndex) => pearl && pearl.id && (
                                <div key={`pearl-${pearl.id}`}
                                     ref={currentGridPosition && getHighlightStyle(flatChapter.id, pearlIndex).outline ? selectedPearlRef : undefined}
                                     style={getHighlightStyle(flatChapter.id, pearlIndex)}>
                                    <MemoizedPearlItem
                                        pearl={pearl}
                                        pearlIndex={pearlIndex}
                                        showTranscriberCount={isAlternateDisplayModeActive}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[50px] ml-2 bg-black/20 rounded-xl"/>
                    )}
                </>
            )}
        </div>
    );
};

const MemoizedPearlItem = React.memo<MemoizedPearlItemProps>(({ pearl, pearlIndex, showTranscriberCount }) => (
    <PearlItem pearl={pearl} pearlIndex={pearlIndex} showTranscriberCount={showTranscriberCount}/>
));

const useIsScrollable = (ref: React.RefObject<HTMLDivElement | null>, dependencies: any[]) => {
    const [isScrollable, setIsScrollable] = useState(false);
    const [showGradient, setShowGradient] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (ref.current) {
                const { scrollHeight, clientHeight, scrollTop } = ref.current;
                const hasScrollableContent = scrollHeight > clientHeight;
                setIsScrollable(hasScrollableContent);
                if (hasScrollableContent) {
                    setShowGradient(scrollTop + clientHeight < scrollHeight - 1);
                } else {
                    setShowGradient(false);
                }
            }
        };

        const timer = setTimeout(checkScroll, 0); // Check after render
        window.addEventListener('resize', checkScroll);
        ref.current?.addEventListener('scroll', checkScroll);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkScroll);
            ref.current?.removeEventListener('scroll', checkScroll);
        };
    }, [ref, ...dependencies]);

    return { isScrollable, showGradient };
};

export function PearlGrid({ order, isAlternateDisplayModeActive = false }: PearlGridProps) {
    const { pearls, handleSelectPearl, selectedPearlId, isMobile } = useAppContext();
    const { baseTree, filteredTree, totalItems, firstItem } = useFilteredPearls(pearls, order);
    const { expandedChapters, toggleChapter } = useChapterExpansion(filteredTree, baseTree);

    const [visibleChapters, setVisibleChapters] = useState(new Set([0]));
    const selectedPearlRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Automatically select the first item if only one is filtered and on desktop
    useEffect(() => {
        if (!isMobile && totalItems === 1 && firstItem && selectedPearlId !== firstItem.id) {
            const timer = setTimeout(() => handleSelectPearl(firstItem), 0);
            return () => clearTimeout(timer);
        }
    }, [totalItems, firstItem, isMobile, handleSelectPearl, selectedPearlId]);

    const displayList = useMemo(() => {
        const list: FlatChapterItem[] = [];
        const flatten = (chapters: OrderedChapter[], depth: number, parentIdPrefix: string) => {
            chapters.forEach((chapter) => {
                const uniqueId = `${parentIdPrefix}-${chapter.name}`;
                const isExpanded = expandedChapters.has(chapter.name);
                list.push({
                    id: uniqueId,
                    name: chapter.name,
                    items: chapter.items || [],
                    depth: depth,
                    hasSubChapters: !!(chapter.subChapters && chapter.subChapters.length > 0),
                    isExpanded: isExpanded,
                    originalChapter: chapter
                });
                if (isExpanded && chapter.subChapters) {
                    const nextDepth = chapter.headerType === 'banner' ? 0 : depth + 1;
                    flatten(chapter.subChapters, nextDepth, uniqueId);
                }
            });
        };
        flatten(filteredTree, 0, 'root');
        return list;
    }, [filteredTree, expandedChapters]);

    const pearlGrid = useMemo(() => {
        const grid: PearlData[][] = [];
        displayList.forEach(chapter => {
            if (chapter.isExpanded && chapter.items.length > 0) {
                for (let i = 0; i < chapter.items.length; i += 5) {
                    grid.push(chapter.items.slice(i, i + 5));
                }
            }
        });
        return grid;
    }, [displayList]);

    const { currentGridPosition } = useKeyboardNavigation(pearlGrid);

    const getHighlightStyle = useCallback((chapterId: string, itemIndex: number) => {
        if (!currentGridPosition) return {};
        const [targetRow, targetCol] = currentGridPosition;
        let currentRow = 0;

        for (const chapter of displayList) {
            if (chapter.isExpanded && chapter.items.length > 0) {
                if (chapter.id === chapterId) {
                    const itemRow = Math.floor(itemIndex / 5);
                    const itemCol = itemIndex % 5;
                    if (currentRow + itemRow === targetRow && itemCol === targetCol) {
                        return { outline: '2px solid rgba(255, 255, 255, 0.5)', borderRadius: '0.75rem' };
                    }
                }
                currentRow += Math.ceil(chapter.items.length / 5);
            }
        }
        return {};
    }, [currentGridPosition, displayList]);

    // Scroll selected item into view
    useEffect(() => {
        if (!selectedPearlRef.current) return;
        const scrollContainer = selectedPearlRef.current.closest('.no-scrollbar');
        if (!scrollContainer) return;
        const itemRect = selectedPearlRef.current.getBoundingClientRect();
        const containerRect = scrollContainer.getBoundingClientRect();
        const padding = 120;
        if (itemRect.top < containerRect.top + padding || itemRect.bottom > containerRect.bottom - padding) {
            selectedPearlRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentGridPosition]);

    const { isScrollable, showGradient } = useIsScrollable(containerRef, [displayList]);

    return (
        <div className={cn("relative", isMobile ? "w-full max-h-[98svh] h-[98svh]" : "w-[18rem] max-h-[80svh]")}>
            <div className={cn("no-scrollbar overflow-y-auto box-border h-full", isMobile ? "px-4" : "px-1")}
                 ref={containerRef}>
                <div
                    className={cn("sticky top-0 z-20 bg-gray-950/90 backdrop-blur-sm", isMobile ? "pt-4" : "pt-1", "mb-4")}>
                    <SearchBar/>
                </div>
                <div className={cn("grid grid-cols-1 gap-4", isMobile ? "" : "px-1", isMobile ? "pb-4" : "pb-1")}>
                    {displayList.map((flatChapter, index) => (
                        <LazyChapterGrid
                            key={flatChapter.id}
                            flatChapter={flatChapter}
                            chapterIndex={index}
                            isVisible={visibleChapters.has(index)}
                            setVisibleChapters={setVisibleChapters}
                            currentGridPosition={currentGridPosition}
                            selectedPearlRef={selectedPearlRef}
                            getHighlightStyle={getHighlightStyle}
                            isAlternateDisplayModeActive={isAlternateDisplayModeActive}
                            onToggle={() => toggleChapter(flatChapter.name)}
                        />
                    ))}
                </div>
            </div>
            <div
                className={cn("absolute bottom-0 left-0 right-0 h-8 pointer-events-none bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-white/20 to-transparent transition-opacity duration-300 border-b-2 border-white/50 z-10", isScrollable && showGradient ? "opacity-100" : "opacity-0")}/>
        </div>
    );
}

export default React.memo(PearlGrid);