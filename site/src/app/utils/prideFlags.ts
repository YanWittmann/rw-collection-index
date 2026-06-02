export interface PrideFlag {
    name: string;
    identities: string[];
    colors: { hex: string; label: string }[];
}

export const PRIDE_FLAGS: PrideFlag[] = [
    {
        name: "Rainbow / Pride Flag",
        identities: ["General LGBTQ+", "Queer", "Gay"],
        colors: [
            { hex: "#E40303", label: "Red" },
            { hex: "#FF8C00", label: "Orange" },
            { hex: "#FFED00", label: "Yellow" },
            { hex: "#00A832", label: "Green" }, // #008026
            { hex: "#004CFF", label: "Royal Blue" },
            { hex: "#732982", label: "Violet" },
        ],
    },
    {
        name: "Lesbian Flag",
        identities: ["Lesbian", "Sapphic", "Women-loving-women"],
        colors: [
            { hex: "#D52D00", label: "Dark Orange" },
            { hex: "#FF9A56", label: "Light Orange" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#D362A4", label: "Pink" },
            { hex: "#A30262", label: "Dark Rose" }, // #A30262
        ],
    },
    {
        name: "Gay Men Flag",
        identities: ["Gay Men", "Achillean", "Men-loving-men"],
        colors: [
            { hex: "#09B090", label: "Dark Green" }, // #078970
            { hex: "#98E2C6", label: "Light Green" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#7BADE2", label: "Light Blue" },
            { hex: "#6E22CC", label: "Purple" }, // #3F1174
        ],
    },
    {
        name: "Bisexual Flag",
        identities: ["Bisexual", "Biromantic", "Multi-attraction spectrum"],
        colors: [
            { hex: "#D60270", label: "Pink" },
            { hex: "#9B4F96", label: "Purple" },
            { hex: "#1550c0", label: "Blue" }, // #0038A8
        ],
    },
    {
        name: "Pansexual Flag",
        identities: ["Pansexual", "Panromantic", "Omnisexual", "Polysexual"],
        colors: [
            { hex: "#FF218C", label: "Pink" },
            { hex: "#FFD800", label: "Yellow" },
            { hex: "#21B1FF", label: "Blue" },
        ],
    },
    {
        name: "Transgender Flag",
        identities: ["Transgender", "Transsexual", "Non-binary", "Transmasculine", "Transfeminine"],
        colors: [
            { hex: "#55CDFC", label: "Light Blue" },
            { hex: "#F7A8B8", label: "Pink" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#F7A8B8", label: "Pink" },
            { hex: "#55CDFC", label: "Light Blue" },
        ],
    },
    {
        name: "Non-Binary Flag",
        identities: ["Non-Binary", "Genderqueer", "Genderfluid", "Enby"],
        colors: [
            { hex: "#FCF434", label: "Yellow" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#9C59D1", label: "Purple" },
            { hex: "#525252", label: "Black" }, // #2C2C2C
        ],
    },
    {
        name: "Asexual Flag",
        identities: ["Asexual", "Ace-spec", "Demisexual", "Greysexual"],
        colors: [
            { hex: "#363636", label: "Black" }, // #000000
            { hex: "#A3A3A3", label: "Grey" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#CC00CC", label: "Purple" }, // #800080
        ],
    },
    {
        name: "Aromantic Flag",
        identities: ["Aromantic", "Aro-spec", "Demiromantic", "Grayromantic"],
        colors: [
            { hex: "#3DA542", label: "Dark Green" },
            { hex: "#A7D379", label: "Light Green" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#A9A9A9", label: "Grey" },
            { hex: "#525252", label: "Black" }, // #000000
        ],
    },
    {
        name: "Genderfluid Flag",
        identities: ["Genderfluid", "Genderflux", "Multi-gender"],
        colors: [
            { hex: "#FF75A2", label: "Pink" },
            { hex: "#FFFFFF", label: "White" },
            { hex: "#BE18D6", label: "Purple" },
            { hex: "#5A5A5A", label: "Black" }, // #000000
            { hex: "#333EBD", label: "Blue" },
        ],
    },
];

export function isPrideMonth(): boolean {
    return new Date().getMonth() === 5; // June
}

export function pickRandomPrideFlag(): PrideFlag {
    return PRIDE_FLAGS[Math.floor(Math.random() * PRIDE_FLAGS.length)];
}
