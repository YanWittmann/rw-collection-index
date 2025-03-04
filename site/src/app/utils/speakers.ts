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
}

export function darken(hex: string, amount: number) {
    return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - amount)).toString(16)).substr(-2));
}