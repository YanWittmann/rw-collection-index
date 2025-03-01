export const speakersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "EP": "#66d9bf",
    "BSM": "#e5d999",
    "LttM": "#e5d999",
    "CW": "#bfbfe5",
    "NSH": "#bfffbf",
    "SRS": "#ffbfbf",
};

export const transcribersColors: { [key: string]: string } = {
    "FP": "#66d9bf",
    "FP-artificer": "#66d9bf",
    "LttM-pre-collapse": "#FFEB04",
    "LttM-post-collapse": "#ffffff",
    "LttM-saint": "#4B7486",
};

export const speakerNames: { [key: string]: string } = {
    "FP": "Five Pebbles",
    "FP-artificer": "Five Pebbles",
    "EP": "Erratic Pulse",
    "BSM": "Big Sis Moon",
    "LttM": "Looks to the Moon",
    "LttM-pre-collapse": "Looks to the Moon (Pre-Collapse)",
    "LttM-post-collapse": "Looks to the Moon",
    "LttM-saint": "Looks to the Moon (Saint)",
    "CW": "Chasing Wind",
    "NSH": "No Significant Harassment",
    "SRS": "Seven Red Suns",
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
}

export function darken(hex: string, amount: number) {
    return '#' + hex.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - amount)).toString(16)).substr(-2));
}