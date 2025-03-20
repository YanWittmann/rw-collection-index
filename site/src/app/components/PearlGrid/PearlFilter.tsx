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
}

export interface FilterOption {
    id: string;
    label: string;
    icon?: string;
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
            }
            return newFilters;
        });
    };

    const activeFilterCount = filters.tags.size + filters.types.size;

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
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </RwIconButton>
                        </TooltipTrigger>
                        <TooltipContent>Filter Options</TooltipContent>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-64 p-0 z-50 bg-black rounded-xl border-2 border-white/50 shadow-lg"
                        align="start"
                        sideOffset={5}
                    >
                        <div className="relative">
                            {/* Inner border */}
                            <div className="absolute inset-[3px] rounded-lg border-2 border-white/60 pointer-events-none" />
                            
                            {/* Content */}
                            <div className="relative z-10 p-2">
                                {filterSections.map((section, index) => (
                                    <div key={section.title} className={cn(
                                        "p-2",
                                        index < filterSections.length - 1 && "border-b border-white/20"
                                    )}>
                                        <div className="text-sm font-medium text-white mb-2">{section.title}</div>
                                        <div className="flex flex-wrap gap-1">
                                            {section.options.map(option => (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <RwIconButton
                                                            key={option.id}
                                                            onClick={() => toggleFilter(section.title.toLowerCase(), option.id)}
                                                            selected={section.title.toLowerCase() === 'tags'
                                                                ? filters.tags.has(option.id)
                                                                : filters.types.has(option.id)
                                                            }
                                                            aria-label={option.label}
                                                        >
                                                            {option.icon ? (
                                                                <RwIcon type={option.icon} />
                                                            ) : (
                                                                <span className="text-xs">{option.label}</span>
                                                            )}
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