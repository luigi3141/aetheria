# Echoes of Aetheria

A fantasy RPG game built with Phaser 3, featuring pixel-art graphics, turn-based combat, and procedurally generated dungeons.

![Echoes of Aetheria](https://github.com/luigi3141/aetheria/raw/master/assets/screenshots/character-creation.png)

## About the Game

Echoes of Aetheria is a fantasy RPG with the following features:

- Pixel-art style graphics inspired by Stardew Valley and Final Fantasy Tactics
- Turn-based combat system with strategic depth
- Procedurally generated dungeons for endless exploration
- Crafting and progression systems
- Infinite character leveling
- Multiple character classes and races to choose from

## Current Status

The game is in early development. Currently implemented features:

- Start menu
- Character creation with class and race selection
- Basic UI framework
- Game state management

## Getting Started

### Prerequisites

- Modern web browser
- Local web server (for development)

### Installation

1. Clone the repository:
```
git clone https://github.com/luigi3141/aetheria.git
```

2. Navigate to the project directory:
```
cd aetheria
```

3. Open `index.html` in a web browser or serve it using a local web server.

## Development

This project uses:

- [Phaser 3](https://phaser.io/phaser3) - HTML5 game framework
- Vanilla JavaScript
- HTML5 and CSS3

## Project Structure

```
aetheria/
├── assets/             # Game assets (images, audio, etc.)
├── scripts/
│   ├── scenes/         # Game scenes (menu, gameplay, etc.)
│   ├── ui/             # UI components and managers
│   │   └── components/ # Reusable UI components
│   └── gameState.js    # Central game state management
├── index.html          # Main HTML file
└── styles.css          # CSS styles
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by classic RPGs like Final Fantasy, Chrono Trigger, and modern pixel-art games
- Built with Phaser 3, a powerful HTML5 game framework
