import React from "react";
import { RwIconButton } from "../other/RwIconButton";
import { RwIcon } from "./RwIcon";
import { Popover, PopoverContent, PopoverTrigger } from "@shadcn/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@shadcn/components/ui/tooltip";
import { cn } from "@shadcn/lib/utils";

export interface FilterState {
    text: string | undefined;
    tags: Set<string>;
    types: Set<string>;
    regions: Set<string>;
    speakers: Set<string>;
}

export interface FilterOption {
    id: string;
    label: string;
    content?: string;
    icon?: string;
    iconColor?: string;
}

export interface FilterSection {
    title: string;
    options: FilterOption[];
}

interface PearlFilterProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filterSections: FilterSection[];
}

/**
 * <pre>
 * import numpy as np
 * from scipy.optimize import curve_fit
 *
 * x_values = np.array([2, 3, 6, 7, 8])
 * y_values = np.array([1.125, 1, 0.5, 0.4, 0.35])
 *
 * def model(x, a, b, c):
 *     return a / (x + b) + c
 *
 * params, _ = curve_fit(model, x_values, y_values, p0=[1, 1, 0])
 *
 * a, b, c = params
 * a, b, c
 * </pre>
 *
 * produces:
 *
 * \[
 * f(x) = \frac{30.77}{x + 10.24} - 1.37
 * \]
 */
function worldLengthToTextSize(x: number): number {
    return 30.77 / (x + 10.24) - 1.37;
}

function longestWord(sentence: string): string {
    return sentence.split(" ").reduce((a, b) => (b.length > a.length ? b : a), "");
}

export function PearlFilter({ filters, setFilters, filterSections }: PearlFilterProps) {
    const toggleFilter = (section: string, optionId: string) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (section === 'tags') {
                const newTags = new Set(prev.tags);
                if (newTags.has(optionId)) {
                    newTags.delete(optionId);
                } else {
                    newTags.add(optionId);
                }
                newFilters.tags = newTags;
            } else if (section === 'types') {
                const newTypes = new Set(prev.types);
                if (newTypes.has(optionId)) {
                    newTypes.delete(optionId);
                } else {
                    newTypes.add(optionId);
                }
                newFilters.types = newTypes;
            } else if (section === 'regions') {
                const newRegions = new Set(prev.regions);
                if (newRegions.has(optionId)) {
                    newRegions.delete(optionId);
                } else {
                    newRegions.add(optionId);
                }
                newFilters.regions = newRegions;
            } else if (section === 'speakers') {
                const newSpeakers = new Set(prev.speakers);
                if (newSpeakers.has(optionId)) {
                    newSpeakers.delete(optionId);
                } else {
                    newSpeakers.add(optionId);
                }
                newFilters.speakers = newSpeakers;
            }
            return newFilters;
        });
    };

    const activeFilterCount = filters.tags.size + filters.types.size + filters.regions.size + filters.speakers.size;

    return (
        <Popover>
            <TooltipProvider delayDuration={120}>
                <Tooltip>
                    <PopoverTrigger>
                        <TooltipTrigger>
                            <RwIconButton
                                className="shrink-0"
                                aria-label="Filter Options"
                            >
                                <RwIcon type="filter"/>
                                {activeFilterCount > 0 && (
                                    <span
                                        className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent>Filter Options</TooltipContent>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-60 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                        align="start"
                        sideOffset={5}
                    >
                        <div className="relative">
                            {/* Inner border */}
                            <div
                                className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none"/>

                            {/* Content */}
                            <div className="relative z-10 p-2 max-h-[70vh] overflow-y-auto no-scrollbar">
                                {filterSections.map((section, index) => (
                                    <div key={section.title} className={cn(
                                        "p-2",
                                        index < filterSections.length - 1 && "border-b border-white/20"
                                    )}>
                                        <div className="text-sm font-medium text-white mb-2">{section.title}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {section.options.map(option => (
                                                <Tooltip key={option.id}>
                                                    <TooltipTrigger>
                                                        <RwIconButton
                                                            key={option.id}
                                                            onClick={() => toggleFilter(section.title.toLowerCase(), option.id)}
                                                            selected={section.title.toLowerCase() === 'tags'
                                                                ? filters.tags.has(option.id)
                                                                : section.title.toLowerCase() === 'types'
                                                                    ? filters.types.has(option.id)
                                                                    : section.title.toLowerCase() === 'regions'
                                                                        ? filters.regions.has(option.id)
                                                                        : filters.speakers.has(option.id)
                                                            }
                                                            aria-label={option.label}
                                                        >
                                                            {option.icon &&
                                                                <RwIcon type={option.icon} color={option.iconColor}/>}
                                                            {option.content && <span
                                                                className={"pb-[0.3rem] rw-title-font"}
                                                                style={{ color: option.iconColor, fontSize: worldLengthToTextSize(longestWord(option.content).length).toFixed(3) + "rem" }}>
                                                                {option.content}</span>}
                                                        </RwIconButton>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {option.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Tooltip>
            </TooltipProvider>
        </Popover>
    );
} 