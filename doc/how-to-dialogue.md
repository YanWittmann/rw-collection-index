# Contributing to the Rain World Collection Index

First, thank you for considering contributing to this project, be it adding support for your own mod or suggesting a change to the core data.
This document provides a complete guide for adding or modifying dialogue entries.

The contribution workflow consists of three distinct stages.
The application separates the content (dialogue files) from the presentation logic (user interface).
Therefore, adding a new entry is a two-step process: you must first write the source text file, and then manually register it within the application code to ensure it appears in the correct category with the proper styling.

<table>
  <tr>
    <td width="33%" align="center" valign="top">
      <a href="#development-workflow">
        <img src="../site/public/img/source.png" width="48" style="image-rendering: pixelated;" /><br/>
        <b>1. Development Workflow</b>
      </a>
      <p>
        Set up the live-reloading environment to preview your changes in real-time.
      </p>
    </td>
    <td width="33%" align="center" valign="top">
      <a href="#dialogue-file-format">
        <img src="../site/public/img/pearl.png" width="48" style="image-rendering: pixelated;" /><br/>
        <b>2. Dialogue File Format</b>
      </a>
      <p>
        Learn the syntax for <code>.txt</code> files, from basic metadata to advanced scripting.
      </p>
    </td>
    <td width="33%" align="center" valign="top">
      <a href="#integrating-with-the-user-interface">
        <img src="../site/public/img/filter.png" width="48" style="image-rendering: pixelated;" /><br/>
        <b>3. UI Integration</b>
      </a>
      <p>
        Register your entries in <code>pearlOrder.ts</code> and define metadata in <code>speakers.ts</code>.
      </p>
    </td>
  </tr>
</table>

The process may look intimidating at first, but believe me when I say that it is really intuitive working with it.
All features are incremental, meaning you can start with the bare minimum of an entry and see it in the UI to then add more metadata to it over time.

# Development Workflow

To add or modify entries, you need to run the application's development server and the dialogue file watcher simultaneously.
This provides a live-reloading environment where changes to the source `.txt` files are automatically parsed and reflected in the application.

1.  Open two separate terminal windows in the [`/site`](../site) directory of the project.
2.  In the first terminal, start the React development server: `npm run start`
3.  In the second terminal, start the dialogue file watcher: `npm run watch-dialogue-files`  
    This script monitors the [`/dialogue`](../dialogue) folders for changes and rebuilds the JSON database whenever a file is saved.
    - If you want to watch the `dialogue-modded` directory instead, you need to modify the [`package.json`](../site/package.json) to use `--profile modded` instead of `--profile vanilla`.
    - You can also `npm run create-dialogue-files` to create the full dataset instead of a preview, as it is being built on the live site.
4.  Navigate to the dialogue source directory located at [`/dialogue`](../dialogue) or [`/dialogue-modded`](../dialogue-modded).
5.  Create a new `.txt` file or edit an existing one.
6.  Save the file.
    The watcher terminal will log that it has detected a change and is re-generating the data.
    The web application should auto-reload with the updated content.

# Dialogue File Format

Each entry in the collection grid table is a `.txt` file that follows a specific structure.
The filename (without the `.txt` extension) will become the entry's unique ID in the system (may differ from in-game ID).
The parser reads these files to generate the final JSON data used by the application.

## Conceptual Overview

A dialogue file is not just raw text; it is a structured document consisting of two main parts: **Global Metadata** and **Sections**.

The **Global Metadata** lives at the very top of the file and defines properties that apply to the entire entry, such as its name, color, and location in the world.
Following this header are one or more **Sections**, which begin with a `===` marker.
These sections contain the actual content, such as dialogue transcriptions or spoiler hints.

When the parser processes a file, it resolves any dynamic content (like variables or inheritance) and compiles it into a JSON object.
This object is what the frontend application eventually renders.

## Global Metadata

The top of the file contains key-value pairs that apply to the entire entry.
Each pair is on its own line.

Syntax: `key: value`

Common Keys:

- `internalId`: The in-game ID for the entry (e.g. `DM`, `Chatlog_DM0`).
- `type`: The primary category. Can be `pearl`, `broadcast`, `echo` or `item`, where `item` is used as a container for any remaining entries that require a custom texture that will not be re-colored automatically.
- `subType`: If `type: item` is used, the specific texture for the icon (e.g. `hunter`, `spinning-top`) can be specified here.
- `color`: The hex color code for the entry in case `type: pearl` or `type: broadcast` are used (e.g. `#f6ee53`).
- `name`: The display name of the entry (e.g. `Light Yellow`, `Dark Blue 1`).
- `map`: Defines a map location. Multiple `map` lines can be added. Requires `region`, `room`, `mapSlugcat`. e.g. `region=DM, room=WALL06, mapSlugcat=spear`. Different map implementations may be selected depending on the slugcat or manually via an additional `impl` parameter.
- `tag`: Comma-separated tags for filtering and information (e.g. `downpour`, `watcher`).
- `info`: A general-purpose informational note displayed with the entry on title hover.
- `inherit`: The ID of another entry file to inherit global metadata from. See [Advanced Syntax](#advanced-syntax) for details.

Example from [`Chatlog_DM0_DARK_BLUE_1.txt`](../dialogue/dp_broadcasts/Chatlog_DM0_DARK_BLUE_1.txt):

```text
internalId: Chatlog_DM0
color: #194fe7
type: broadcast
name: Dark Blue 1
map: region=DM, room=WALL06, mapSlugcat=spear
tag: downpour
```

## Sections

Sections begin with a `===` header and contain specific blocks of content like transcriptions or hints.

Syntax: `=== namespace: value`

There are two primary namespaces: `transcription` and `hint`.

### Transcription Sections (`=== transcription: ...`)

This section defines a single transcription block.
The `value` after the colon is the transcriber's ID (e.g. `LttM-pre-collapse`, `broadcast`, `FP`).

A transcription section contains two parts: custom metadata that overwrites the global metadata and the actual dialogue text.

- Transcription Metadata (prefixed with `md-`)
  - `md-sourceDialogue`: The name of the original game file the text was extracted from (e.g. `102-spear.txt`). The parser can also attempt to auto-detect this if the `--sourceFiles` flag is used (not in watcher mode, use `create-dialogue-files` for this). This property is the only exclusive `md-` property which will not work on the global ones.
  - `md-map`: Add map locations for this specific transcription. (Or use `md-map: none` to clear global ones).
  - `md-transcriberName`: Set a custom display name for the transcriber button in the UI, which is separate from the entry name.
  - The `md-super-` prefix promotes a metadata key from the transcription level to the global level of the final generated entry. This is useful with variables, as it allows a single file to generate entries with different global properties (like their `subType` icon).
    - `md-super-subType: watcher-ripple` will set the main icon for a specific generated variant.
  - All remaining global ones are supported.

- Dialogue Text:  
  The lines of dialogue. The parser recognizes the `SPEAKER: Text` format.
  - If a line contains a colon (`:`) and the text before it is short, it is treated as a speaker.
  - Lines without a recognizable speaker are treated as narrative text.
  - Speakers can also be given a namespace with the syntax `NS<Identifier>-<SpeakerName>:`, which is mainly used for modded speakers to prevent name collisions the namespace will not be displayed in the result, only used for lookup of the speaker name and color.

Example from [`DM_LIGHT_YELLOW.txt`](../dialogue/v_dp_pearls/DM_LIGHT_YELLOW.txt):

```text
=== transcription: LttM-pre-collapse
md-map: region=DM, room=LAB3, mapSlugcat=spear
md-sourceDialogue: 102-spear.txt
Oh! This is one of my pearls. Did you extract this from my Memory Conflux?
While I value your curiosity, I would prefer that you don't move things around or steal items from this facility.
...
```

### Hint Sections (`=== hint: ...`)

This section defines a hint for Spoiler/Unlock Mode.
The `value` is the title of the hint.
The lines that follow are the hint's content.
You can stack multiple hints by having multiple `hint` sections follow each other.
A hint section always refers to the `transcriber` section that came before it.

Example from [`DS_BRIGHT_GREEN.txt`](../dialogue/v_dp_pearls/DS_BRIGHT_GREEN.txt):

```text
=== transcription: LttM-post-collapse
md-sourceDialogue: 14.txt
It's an old text...

=== hint: Rough Location
At the bottom of the region.

=== hint: Rough Location
Just above a very long, water-filled pipe in a small pocket of air.
```

## Advanced Syntax

The parser supports additional syntax for more complex entries to save repeating the same information multiple times.

### Inheritance (`inherit`)

You can reference another file's ID in the global metadata to copy its properties.
This works across modded and vanilla profiles.

- Single-value properties (like `color` or `name`) are overwritten if defined in the child file.
- Multi-value properties (like `map` or `tag`) are merged with the parent's values.

### Variables (`md-var-`)

Variables allow a single `.txt` file to generate multiple distinct entries in the collection grid.
This is useful for item dialogues where the item type changes.

- Define a variable in a transcription's metadata: `md-var-VariableName: Value`
- The parser will create a unique entry for each unique combination of variable values in the file.
- The filename can reference a variable to create dynamic IDs: `Iterator_Dialogue_Items_{var--DialogueId}.txt`.

Example from [`Iterator_Dialogue_Items_{var--DialogueId}.txt`](../dialogue/v_dp_iterators/Iterator_Dialogue_Items_%7Bvar--DialogueId%7D.txt):

```text
type: item

=== transcription: LttM-post-collapse
md-subType: item/Rock_icon
md-var-DialogueId: Rock
md-name: Rock
It's a rock. Thank you, I suppose, little creature.

=== transcription: LttM-saint
md-subType: item/Spear_icon
md-var-DialogueId: Spear
md-name: Spear
It's piece of sharpened rebar... What is it you want to know?
```

This creates two items in the collection, one for "Rock" and one for "Spear", each with its own subtype icon and name.

### Value Patterns

The parser can resolve patterns inside any metadata value to create dynamic content.

- `{randomPick--value1--value2}`: This pattern selects one of the provided values separated by `--`. The selection cycles through all options before repeating any.
    - Example: `md-color: {randomPick--#ffdba6--#ad8a58}` will assign one of the two colors to the entry.

### Special Content Formatting

For more complex dialogue scenarios or to embed media, the parser recognizes several keywords and syntax patterns.

#### MONO Keyword

The `MONO` keyword on its own line indicates that the following text is not standard dialogue but rather a block of descriptive text or scripted events where indentation via single spaces matters.
It uses special line prefixes:

- `/`: A comment or descriptive action, rendered in gray.
- `|`: A dialogue or action taken by the game, rendered in white.

Example from [`LttM_short_Dialogue_{var--DialogueId}.txt`](../dialogue/v_dp_iterators/LttM/LttM_short_Dialogue_%7Bvar--DialogueId%7D.txt):

```text
=== transcription: LttM-post-collapse
md-type: pearl
md-transcriberName: If Looks to the Moon is not on speaking terms with Slugcat
md-var-DialogueId: Receiving_an_object
md-name: If Looks to the Moon is not on speaking terms with Slugcat
MONO
/ After speaking, Looks to the Moon throws the object away.
/ One of the following options is selected randomly:
/  If Looks to the Moon has 4 or more Neurons
|   I have nothing to say to you, &lt;little creature&gt;.
|   Go away, &lt;little creature&gt;.
```

#### Embedding Media

You can embed images, audio, and other files directly into a transcription using a Markdown-like syntax.
The path should be relative to the `public/img` directory.

Syntax: `![path/to/file.ext]`

- Images: `![PearlReader/DRONE_1.png]`
- Audio: `![PearlReader/AUDIO_GROOVE.mp3]`

You can also add optional modifiers to change how the media is displayed.

Syntax with Modifiers: `![path/to/file.ext][MODIFIER=value]`

- `STYLE=rounded` will apply a `rounded` style to the image.

#### Image Sequences

To group a series of embedded images into an automatically playing animation, use the `SEQUENCE` keyword.
It can also take an optional `SPEED` parameter as given interval in milliseconds.

Example from [`Watcher_Pearl_Misc_Projection_{var--DialogueId}.txt`](../dialogue/watcher_pearls/img/Watcher_Pearl_Misc_Projection_%7Bvar--DialogueId%7D.txt):

```text
=== transcription: PearlReader
md-name: Misc: Image 1
SEQUENCE[SPEED=1000]
![PearlReader/misc/img1/1.png][STYLE=rounded]
![PearlReader/misc/img1/2.png][STYLE=rounded]
![PearlReader/misc/img1/3.png][STYLE=rounded]
![PearlReader/misc/img1/4.png][STYLE=rounded]
![PearlReader/misc/img1/5.png][STYLE=rounded]
```

# Integrating with the User Interface

Creating the `.txt` dialogue files is the first step.
To make your entries appear correctly in the application, with the right names, colors, and sorted into the correct categories, you need to edit two files in the application's source code.

## Defining Names and Colors

[`speakers.ts`](../site/src/app/utils/speakers.ts) serves as a dictionary for all display metadata, such as the names and colors for speakers, regions, and transcribers.
When you add a new speaker or region in your `.txt` files, you must define its corresponding metadata here for it to be displayed correctly.

### Defining Speakers

When the parser encounters a speaker in your dialogue, such as `WT: ...` or `NSWT-WT: ...`, it looks up the ID (`WT` or `NSWT-WT`) in this file.
You should add an entry for your new speaker's full name in the `speakerNames` object and its color in the `speakersColors` object.
Using a namespace like `NSWT` is recommended for modded content to prevent conflicts.

```javascript
export const speakerNames: { [key: string]: string } = {
  "NSWT-WT": "Whispering Tides",
};

export const speakersColors: { [key: string]: string } = {
  "NSWT-WT": "#a3d9c2",
};
```

### Defining Regions and Transcribers

The process is identical for regions and transcribers.
If you specified a new region code in a `map` property (e.g. `region=SC`), you must add its name and color to the `regionNames` and `regionColors` objects, respectively.

Likewise, if you created a new transcriber ID (e.g. `=== transcription: seer`), you can assign it a button color in `transcribersColors` and a custom icon in `transcribersImages`.

```javascript
export const regionNames: { [key: string]: string } = {
    "SC": "Sunken City",
};

export const regionColors: { [key: string]: string } = {
    "SC": "#1c3d4e",
};

export const transcribersColors: { [key: string]: string } = {
    "chasing-wind": "#66d9bf",
};

export const transcribersImages: { [key: string]: string } = {
    "chasing-wind": "modded/chasing-wind",
};
```

## Displaying Entries in the Collection

[`pearlOrder.ts`](../site/src/app/utils/pearlOrder.ts) defines the hierarchical structure of the collection's content grid.
Inside, you will find several exported constants, but the main ones of interest are `vanillaPearlOrder` and `moddedPearlOrder`.

Each of these is an array of `PearlChapter` objects.
A chapter can contain a list of entry IDs (or matchable ID patterns) directly in its `ids` property, or it can contain a list of subchapters in its `items` property for a nested structure.

To add your entry, find the appropriate chapter and add its internal ID (the filename without the `.txt` extension) to the `ids` array.
Using regular expressions is useful for files that use the `md-var-` syntax.

```javascript
{
  name: "The Watcher: Projections",
    ids: [
      "WAUA", "WORA", "DRONE", "ABSTRACT",
      { pattern: /Watcher_Pearl_Text_Projection.+/ },
      { pattern: /Watcher_Pearl_Misc_Projection.+/ }
  ]
}
```

If you want to create subchapters, such as for adding a new mod, add a new `PearlChapter` object to the `moddedPearlOrder` array.
Give the chapter a header text, an icon, and links to the mod's pages.
Use `defaultOpen` to optionally collapse sub-content initially.

> Image paths for icons are relative to the [`site/public`](../site/public) directory.
> For example, `img/modded/SunkenCity/thumb.webp` refers to a file located at `site/public/img/modded/SunkenCity/thumb.webp`.

```javascript
{
  name: "Sunken City",
  headerType: "banner",
  icon: "img/modded/SunkenCity/thumb.webp",
  link: [
    { title: "Steam Workshop", url: "..." },
  ],
  ids: [
    "SC_Pearl_1",
    "SC_Pearl_2",
  ]
}
```

You may nest subchapters if you want to further structure your content.

```javascript
{
  name: "Chasing Wind",
  headerType: "banner",
  icon: "img/modded/ChasingWind/thumb.webp",
  defaultOpen: true,
  link: [
    { title: "Mod Wiki", url: "..." },
  ],
  items: [
    {
      name: "Slugcat Interactions",
      ids: [
        { pattern: /CW_Dialogue_survivor_.+/ },
      ]
    },
    {
      name: "White Pearls (Misc)",
      defaultOpen: false,
      ids: [
        { pattern: /Misc_CW_WHITE_PEARLS_\d+/ },
      ]
    },
  ]
},
```

---

By following this structure, you can add or modify any piece of lore in the Rain World Collection Index.
When you are finished with your changes, please submit them as a Pull Request on GitHub.

But honestly: Just check out a couple of the files in the dialogue directories!
It's not as complicated as it looks at first.
