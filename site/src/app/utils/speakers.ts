export const speakersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "Five Pebbles": "#66d9bf",
    "EP": "#66d9bf",
    "BSM": "#e5d999",
    "LttM": "#e5d999",
    "CW": "#bfbfe5",
    "GW": "#bfbfe5",
    "NSH": "#bfffbf",
    "SRS": "#ffbfbf",
    "NGI": "#b28ccc",
    "GS": "#e59966",
    "HR": "#8cb28c",
    "SI": "#bfbfbf",
    "UU": "#8ce58c",
    "HF": "#8c8ce5",
    "PI": "#ffbfff",
    "WO": "#bfbfff",
    "EOC": "#ffffe5",
};

export const transcribersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "FP-artificer": "#66d9bf",
    "LttM-pre-collapse": "#FFEB04",
    "LttM-post-collapse": "#ffffff",
    "LttM-saint": "#4B7486",
    "broadcast-pre-FP": "#ffffff",
    "broadcast-post-FP": "#7f7f7f",
};

export const speakerNames: { [key: string]: string } = {
    "FP": "Five Pebbles",
    "Five Pebbles": "Five Pebbles",
    "FP-artificer": "Five Pebbles",
    "EP": "Erratic Pulse / Five Pebbles",
    "BSM": "Big Sis Moon / Looks to the Moon",
    "LttM": "Looks to the Moon",
    "LttM-pre-collapse": "Looks to the Moon (Pre-Collapse)",
    "LttM-post-collapse": "Looks to the Moon",
    "LttM-saint": "Looks to the Moon (Future)",
    "CW": "Chasing Wind",
    "GW": "Grey Wind / Chasing Wind",
    "NSH": "No Significant Harassment",
    "SRS": "Seven Red Suns",
    "NGI": "(Unknown)",
    "GS": "Gazing Stars",
    "HR": "(Unknown)",
    "SI": "Secluded Instinct",
    "UU": "(Unknown)",
    "HF": "(Unknown)",
    "PI": "Pleading Intellect",
    "WO": "Wandering Omen",
    "EOC": "Epoch of Clouds",
    "broadcast-pre-FP": "Pre-Five Pebbles",
    "broadcast-post-FP": "Post-Five Pebbles",
    "broadcast": "Broadcast",
}

export const regionNames: { [key: string]: string } = {
    "SU": "Outskirts",
    "HI": "Industrial Complex",
    "DS": "Drainage System",
    "GW": "Garbage Wastes",
    "SL": "Shoreline",
    "SH": "Shaded Citadel",
    "UW": "Exterior",
    "SS": "Five Pebbles",
    "CC": "Chimney Canopy",
    "SI": "Sky Islands",
    "LF": "Farm Arrays",
    "SB": "Subterranean",
    "VS": "Pipeyard",
    "OE": "Outer Expanse",
    "MS": "Submerged Superstructure",
    "LC": "Metropolis",
    "RM": "The Rot",
    "DM": "Looks to the Moon",
    "CL": "Silent Construct",
    "HR": "Rubicon",
    "UG": "Undergrowth",
    "LM": "Waterfront Facility",
}

export function darken(hex: string, amount: number) {
    return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - amount)).toString(16)).substr(-2));
}

const variableDefinitions: { [key: string]: any } = {
    "speakersColors": speakersColors,
    "transcribersColors": transcribersColors,
    "SI-CHAT": "When the MSC DLC is disabled, there are only two Sky Island pearls per playthrough, each with one random one of five possible conversations.\nWith the MSC DLC, these have been split into five separate pearls. This is one of them.",
    "LC-PEARL-MOON": "This Pearl cannot be brought to Moon as Artificer, as the Shoreline has been replaced by the Waterfront Facility.\nThe only way to bring the Pearl to Moon is to be spawned into the Metropolis as Monk or Survivor in Expedition Mode and bringing the Pearl to Shoreline.",
    "MAP-LP-PRE-PEB": "White Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThe locations listed here can therefore be visited in any order.",
    "LP-PRE-PEB": "The seven White Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThey can only be found before meeting Five Pebbles.\nBroadcast names are unofficial and match the Wiki's names.",
    "MAP-LP-POST-PEB": "Gray Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThe locations listed here can therefore be visited in any order.",
    "LP-POST-PEB": "The ten Gray Broadcasts are unlocked in sequential order regardless of the location they are found in.\nThey can only be found after meeting Five Pebbles.\nBroadcast names are unofficial and match the Wiki's names.",
}

/**
 * Replaces registered variables from the {@link variableDefinitions} object in the given string.
 * Format for variables is ${some.variable.name} where each part of the access is separated by a dot.
 * @param str The string to resolve variables in.
 * @returns The string with all variables resolved.
 */
export function resolveVariables(str: string): string {
    return str.replace(/\${([^}]+)}/g, (_, variable) => {
        const parts = variable.split(".");
        let value = variableDefinitions[parts[0]];
        if (value === undefined) {
            console.error(`Variable ${variable} not found`);
            return `\${${variable}}`;
        }
        for (let i = 1; i < parts.length; i++) {
            value = value[parts[i]];
            if (value === undefined) {
                console.error(`Variable ${variable} not found`);
                return `\${${variable}}`;
            }
        }
        if (typeof value === "string") {
            return value;
        }
        console.error(`Variable ${variable} is not a string`);
        return `\${${variable}}`;
    });
}
