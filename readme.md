# Rain World Collection Index

Hosted at [https://yanwittmann.github.io/rw-collection-index](https://yanwittmann.github.io/rw-collection-index/)

A web application for browsing and reading all Pearls and Broadcasts from Rain World.

## Features

- Complete listing of all Pearls and Broadcasts
- Includes additional items such as White Pearls
- Location details with map links
- Progressive unlock and hint system for spoiler-free exploration
- Search functionality

Information is sourced from the [Rain World Wiki](https://rainworld.miraheze.org/wiki/Pearl/Dialogue) and the game itself.

![UI Example of a selected Pearl](./doc/ui-demo-01.png)

## Unlock Modes

- View All: Instantly access all content
- Unlock: Gradual discovery system
  - Items start as locked
  - Progressive hints guide exploration
  - Items can be manually unlocked when found in-game
  - Option to reset unlocks

## Technical Details

- Built with React and TypeScript
- Custom UI components styled for Rain World
- URL parameter support (disabled in unlock mode to prevent spoilers)
  - `pearl=<id>`: Selects a specific pearl (e.g., `pearl=SI_chat3_DARK_PURPLE`)
  - `transcriber=<id>`: Selects a transcriber for the chosen pearl (e.g., `transcriber=LttM-pre-collapse`)
- Hover over speaker names to reveal full names
- Hold shift to show the amount of transcriptions on each entry

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/YanWittmann/rw-collection-index
cd rw-collection-index/site
```

### Install Dependencies

```bash
npm install
```

### Run the Application

```bash
npm run start
```

### Build the Application

```bash
npm run build
```
