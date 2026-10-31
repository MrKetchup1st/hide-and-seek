# Hide & Seek

A local multiplayer hide-and-seek game for one keyboard, built with HTML, CSS, and Canvas.

## Run

Open `index.html` in a browser. No build step or server is required.

## Modes

- 2 Players: one hider vs one seeker
- 3 Players: two hiders vs one seeker
- 2 Seekers: one hider vs two seekers
- Super Hard: optional modifier compatible with every mode

Seeker roles change each round. Maps, random roles, flashlight modes, radar, doors, and performance settings are handled in the start menu.

## Controls

| Action | Player 1 | Player 2 | Seeker |
| --- | --- | --- | --- |
| Move | W A S D | I J K L | Arrow keys |
| Sprint / Dash | L-Shift | . | R-Shift |
| Flashlight / Mode | F | ; | Enter |
| Ping / Radar | Q | U | Space |

Other keys: `M` menu/controls, `P` pause, `N` mute. Map, Hard, and AI are menu buttons. All bindings can be changed from the controls screen.

## Features

- Pitch-black flashlight gameplay with wall occlusion
- Ping waves and hard-mode radar
- Multiple maps, including the door-linked GATE map
- Three game modes plus Super Hard modifiers
- AI spectator mode for watching automated matches
- Menu-selectable fullscreen mode

## Files

- `index.html` — page entry point
- `game.js` — game logic and rendering
- `styles.css` — page shell styling
- `manifest.webmanifest` — web app metadata
- `icon.svg` — app icon
