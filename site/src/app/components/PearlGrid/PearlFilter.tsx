import React from "react";
import { RwIconButton } from "../other/RwIconButton";
import { RwIcon } from "./RwIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { cn } from "@shadcn/lib/utils";
import { ensureMinLightness } from "../../utils/colorUtils";

const POPOVER_WIDTH = "w-[32rem]";

export interface FilterState {
    text: string | undefined;
    tags: Set<string>;
    types: Set<string>;
    regions: Set<string>;
    speakers: Set<string>;
    saveFound: boolean;
}

export interface FilterOption {
    id: string;
    label: string;
    icon?: string;
    iconColor?: string;
    image?: string;
}

export interface FilterSection {
    title: string;
    options: FilterOption[];
}

interface FilterChipProps {
    option: FilterOption;
    selected: boolean;
    onClick: () => void;
}

function FilterChip({ option, selected, onClick }: FilterChipProps) {
    const hasIcon = !!option.icon || !!option.image;
    const [iconFailed, setIconFailed] = React.useState(false);
    const showIcon = hasIcon && !iconFailed;

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <RwIconButton
                    square={false}
                    size="small"
                    variant={selected ? 'gold' : 'default'}
                    onClick={onClick}
                    className="w-full"
                    aria-label={option.label}
                >
                    <div className="flex items-center w-full gap-2 overflow-hidden">
                        {showIcon && (
                            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                {option.image
                                    ? <img
                                        src={`img/${option.image}`}
                                        alt=""
                                        className="w-full h-full object-cover rounded-sm"
                                        style={{ imageRendering: "pixelated" }}
                                        onError={() => setIconFailed(true)}
                                    />
                                    : <>
                                        <RwIcon type={option.icon} color={option.iconColor} />
                                        <img src={`img/${option.icon}.png`} alt="" className="hidden" onError={() => setIconFailed(true)} />
                                    </>
                                }
                            </div>
                        )}
                        <span
                            className="truncate text-xs leading-normal -translate-y-[1px] text-white text-left min-w-0 flex-1"
                            style={{ color: option.iconColor ? ensureMinLightness(option.iconColor) : undefined }}
                        >
                            {option.label}
                        </span>
                    </div>
                </RwIconButton>
            </TooltipTrigger>
            <TooltipContent>
                <div className="text-center">
                    <div>{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.id}</div>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}

interface PearlFilterProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filterSections: FilterSection[];
}

export function PearlFilter({ filters, setFilters, filterSections }: PearlFilterProps) {
    const toggleFilter = (section: string, optionId: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (optionId === 'saveFound') {
                newFilters.saveFound = !prev.saveFound;
            } else if (section === 'tags') {
                const newTags = new Set(prev.tags);
                if (newTags.has(optionId)) newTags.delete(optionId); else newTags.add(optionId);
                newFilters.tags = newTags;
            } else if (section === 'types') {
                const newTypes = new Set(prev.types);
                if (newTypes.has(optionId)) newTypes.delete(optionId); else newTypes.add(optionId);
                newFilters.types = newTypes;
            } else if (section === 'regions') {
                const newRegions = new Set(prev.regions);
                if (newRegions.has(optionId)) newRegions.delete(optionId); else newRegions.add(optionId);
                newFilters.regions = newRegions;
            } else if (section === 'speakers') {
                const newSpeakers = new Set(prev.speakers);
                if (newSpeakers.has(optionId)) newSpeakers.delete(optionId); else newSpeakers.add(optionId);
                newFilters.speakers = newSpeakers;
            }
            return newFilters;
        });
    };

    const isSelected = (section: FilterSection, optionId: string): boolean => {
        if (optionId === 'saveFound') return filters.saveFound;
        switch (section.title.toLowerCase()) {
            case 'tags':     return filters.tags.has(optionId);
            case 'types':    return filters.types.has(optionId);
            case 'regions':  return filters.regions.has(optionId);
            case 'speakers': return filters.speakers.has(optionId);
            default:         return false;
        }
    };

    const activeFilterCount = filters.tags.size + filters.types.size + filters.regions.size + filters.speakers.size + (filters.saveFound ? 1 : 0);

    return (
        <Popover>
            <TooltipProvider delayDuration={120}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                            <RwIconButton className="shrink-0" aria-label="Filter Options">
                                <RwIcon type="filter"/>
                                {activeFilterCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </RwIconButton>
                        </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Filter Options</TooltipContent>
                    <PopoverContent
                        className={cn("p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg", POPOVER_WIDTH)}
                        align="start"
                        sideOffset={5}
                    >
                        <div className="relative">
                            <div className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>
                            <TooltipProvider delayDuration={100} disableHoverableContent>
                                <div className="relative z-10 p-2 max-h-[70vh] overflow-y-auto no-scrollbar">
                                    {filterSections.map((section, index) => (
                                        <div key={section.title} className={cn(
                                            "p-2",
                                            index < filterSections.length - 1 && "border-b border-white/20"
                                        )}>
                                            <div className="text-sm font-medium text-white mb-2">{section.title}</div>
                                            <div className="grid grid-cols-3 gap-1">
                                                {section.options.map(option => (
                                                    <FilterChip
                                                        key={option.id}
                                                        option={option}
                                                        selected={isSelected(section, option.id)}
                                                        onClick={() => toggleFilter(section.title.toLowerCase(), option.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TooltipProvider>
                        </div>
                    </PopoverContent>
                </Tooltip>
            </TooltipProvider>
        </Popover>
    );
}
