# First Person Shooter

A basic first-person shooter game built with TypeScript and Three.js.

## Features

- First-person camera with mouse control
- WASD movement
- Shooting mechanics
- Basic level with targets

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

To start the development server:

```bash
npm start
```

This will open the game in your default browser.

### Building

To build the project:

```bash
npm run build
```

## Controls

- WASD / Arrow Keys: Movement
- Mouse: Look around
- Click: Shoot
- Space: Jump
- Click anywhere to lock pointer and start game

## Project Structure

- `src/index.ts`: Main game initialization and loop
- `src/player.ts`: Player movement and controls
- `src/world.ts`: Game world creation (ground, walls, targets)
- `src/weapon.ts`: Weapon mechanics and shooting