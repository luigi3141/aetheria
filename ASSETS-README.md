# Echoes of Aetheria - Game Assets Guide

This document provides information about the game assets needed for Echoes of Aetheria and how to replace the placeholder files with actual game assets.

## Asset Directory Structure

```
assets/
├── sprites/
│   ├── backgrounds/
│   │   └── combat-bg.png
│   ├── enemies/
│   │   ├── goblin-chief-sprite.png
│   │   ├── mushroom-sprite.png
│   │   ├── bat-sprite.png
│   │   ├── golem-sprite.png
│   │   ├── ghost-sprite.png
│   │   └── crystal-queen-sprite.png
│   └── effects/
│       ├── slash.png
│       ├── poison.png
│       ├── bleed.png
│       ├── stun.png
│       ├── crystal.png
│       └── ghost.png
└── audio/
    ├── attack.mp3
    ├── defend.mp3
    ├── heal.mp3
    ├── enemy-hit.mp3
    ├── player-hit.mp3
    ├── poison.mp3
    ├── crystal.mp3
    ├── ghost.mp3
    ├── victory.mp3
    ├── door_open.wav
    └── sword.wav
```

## Recommended Asset Specifications

### Images

- **Background Images**: 800x600 pixels, PNG format
  - `combat-bg.png`: Combat scene background

- **Enemy Sprites**: 64x64 pixels, PNG format with transparency
  - `goblin-chief-sprite.png`: Goblin Chief boss
  - `mushroom-sprite.png`: Mushroom creature
  - `bat-sprite.png`: Cave bat
  - `golem-sprite.png`: Crystal golem
  - `ghost-sprite.png`: Miner ghost
  - `crystal-queen-sprite.png`: Crystal Queen boss

- **Effect Sprites**: 32x32 pixels, PNG format with transparency
  - `slash.png`: Attack effect
  - `poison.png`: Poison status effect
  - `bleed.png`: Bleeding status effect
  - `stun.png`: Stun status effect
  - `crystal.png`: Crystal magic effect
  - `ghost.png`: Ghost magic effect

### Audio

- **Sound Effects**: WAV format, short duration (0.5-2 seconds)
  - `door_open.wav`: Door opening sound
  - `sword.wav`: Combat start sound

- **Combat Sounds**: MP3 format, short duration (0.5-2 seconds)
  - `attack.mp3`: Attack sound
  - `defend.mp3`: Defend action sound
  - `heal.mp3`: Healing sound
  - `enemy-hit.mp3`: Enemy being hit sound
  - `player-hit.mp3`: Player being hit sound
  - `poison.mp3`: Poison effect sound
  - `crystal.mp3`: Crystal magic sound
  - `ghost.mp3`: Ghost magic sound
  - `victory.mp3`: Victory fanfare

## Art Style Guidelines

Echoes of Aetheria uses a pixel art style similar to Stardew Valley and Final Fantasy Tactics. Here are some guidelines:

- Use a limited color palette for each asset (8-16 colors)
- Create clean pixel edges (avoid anti-aliasing)
- Use a consistent light source direction
- For animations, use 4-8 frames per animation cycle
- Keep the style consistent across all assets

## Resources for Creating Pixel Art

- [Piskel](https://www.piskelapp.com/) - Free online pixel art editor
- [Aseprite](https://www.aseprite.org/) - Professional pixel art and animation tool
- [LibreSprite](https://libresprite.github.io/) - Free, open-source fork of Aseprite
- [OpenGameArt.org](https://opengameart.org/) - Free game art resources
- [itch.io](https://itch.io/game-assets) - Many free and paid game assets

## Resources for Creating Game Audio

- [Audacity](https://www.audacityteam.org/) - Free audio editing software
- [BFXR](https://www.bfxr.net/) - Sound effect generator
- [Freesound](https://freesound.org/) - Free sound effects library
- [Incompetech](https://incompetech.com/) - Royalty-free music

## Note on Placeholder Files

The current files in the assets directory are empty placeholder files. You'll need to replace them with actual pixel art images and audio files for your game to look and sound good. The placeholders are there just to prevent 404 errors during development.
