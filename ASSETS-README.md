# Aetheria Assets Guide

This document provides a comprehensive list of all required assets for the Aetheria game project, including file specifications and organization structure.

## Asset Directory Structure

```
assets/
├── sprites/
│   ├── backgrounds/
│   │   ├── combat-bg.png
│   │   ├── character-bg.png
│   │   ├── inventory-bg.png
│   │   ├── title-bg.png
│   │   ├── overworld-bg.png
│   │   ├── dungeon-bg.png
│   │   └── battle-result-bg.png
│   ├── characters/
│   │   ├── warrior-portrait.png
│   │   ├── mage-portrait.png
│   │   ├── rogue-portrait.png
│   │   ├── cleric-portrait.png
│   │   ├── ranger-portrait.png
│   │   ├── bard-portrait.png
│   │   └── default-portrait.png
│   ├── enemies/
│   │   ├── goblin-sprite.png
│   │   ├── wolf-sprite.png
│   │   ├── spider-sprite.png
│   │   ├── bandit-sprite.png
│   │   ├── mushroom-sprite.png
│   │   ├── bat-sprite.png
│   │   ├── golem-sprite.png
│   │   ├── ghost-sprite.png
│   │   ├── goblin-chief-sprite.png
│   │   ├── crystal-queen-sprite.png
│   │   └── default-enemy.png
│   ├── icons/
│   │   ├── player-icon.png
│   │   ├── health-icon.png
│   │   ├── mana-icon.png
│   │   ├── strength-icon.png
│   │   ├── agility-icon.png
│   │   ├── intelligence-icon.png
│   │   └── constitution-icon.png
│   ├── items/
│   │   └── default-item.png
│   └── effects/
│       ├── slash.png
│       ├── fire.png
│       ├── ice.png
│       ├── arcane.png
│       ├── poison.png
│       ├── bleed.png
│       ├── stun.png
│       ├── heal.png
│       ├── shield.png
│       ├── crystal.png
│       └── ghost.png
└── audio/
    ├── attack.mp3
    ├── enemy-hit.mp3
    ├── player-hit.mp3
    ├── defend.mp3
    ├── heal.mp3
    ├── victory.mp3
    ├── defeat.mp3
    ├── menu-select.mp3
    ├── level-up.mp3
    ├── door_open.wav
    └── sword.wav
```

## Recommended Asset Specifications

### Images

- **Background Images**: 800x600 pixels, PNG format
  - `combat-bg.png`: Combat scene background
  - `character-bg.png`: Character sheet scene background
  - `inventory-bg.png`: Inventory scene background  
  - `title-bg.png`: Title screen background
  - `overworld-bg.png`: Overworld map background
  - `dungeon-bg.png`: Dungeon interior background
  - `battle-result-bg.png`: Post-combat results screen background

- **Character Portraits**: 128x128 pixels, PNG format with transparency
  - `warrior-portrait.png`: Warrior class character portrait
  - `mage-portrait.png`: Mage class character portrait
  - `rogue-portrait.png`: Rogue class character portrait
  - `cleric-portrait.png`: Cleric class character portrait
  - `ranger-portrait.png`: Ranger class character portrait
  - `bard-portrait.png`: Bard class character portrait
  - `default-portrait.png`: Default fallback portrait

- **Enemy Sprites**: 64x64 pixels, PNG format with transparency
  - **Verdant Woods Enemies:**
    - `goblin-sprite.png`: Forest Goblin
    - `wolf-sprite.png`: Forest Wolf
    - `spider-sprite.png`: Giant Spider
    - `bandit-sprite.png`: Forest Bandit
    - `mushroom-sprite.png`: Myconid (mushroom creature)
    - `goblin-chief-sprite.png`: Goblin Chieftain (boss)
  
  - **Crystal Caverns Enemies:**
    - `bat-sprite.png`: Crystal Bat
    - `golem-sprite.png`: Crystal Golem
    - `ghost-sprite.png`: Spectral Miner (ghost)
    - `crystal-queen-sprite.png`: Crystal Queen (boss)
    
  - **Fallback:**
    - `default-enemy.png`: Default enemy fallback sprite

- **Effect Sprites**: 32x32 pixels, PNG format with transparency
  - `slash.png`: Physical attack effect
  - `fire.png`: Fire magic effect
  - `ice.png`: Ice magic effect
  - `arcane.png`: Arcane magic effect
  - `poison.png`: Poison status effect
  - `bleed.png`: Bleeding status effect
  - `stun.png`: Stun status effect
  - `heal.png`: Healing effect
  - `shield.png`: Defense/shield effect
  - `crystal.png`: Crystal magic effect
  - `ghost.png`: Ghost/spectral magic effect

- **UI Icons**: 24x24 pixels, PNG format with transparency
  - `player-icon.png`: Player character marker
  - `health-icon.png`: Health status indicator
  - `mana-icon.png`: Mana/energy status indicator
  - `strength-icon.png`: Strength stat indicator
  - `agility-icon.png`: Agility stat indicator
  - `intelligence-icon.png`: Intelligence stat indicator
  - `constitution-icon.png`: Constitution stat indicator

### Audio

- **Combat Sounds**: MP3 format, short duration (0.5-2 seconds)
  - `attack.mp3`: Basic attack sound
  - `enemy-hit.mp3`: Sound when an enemy is hit
  - `player-hit.mp3`: Sound when the player is hit
  - `defend.mp3`: Defend action sound
  - `heal.mp3`: Healing sound
  - `victory.mp3`: Combat victory fanfare
  - `defeat.mp3`: Combat defeat sound

- **UI Sounds**: MP3 format, very short duration (0.1-0.5 seconds)
  - `menu-select.mp3`: UI selection sound
  - `level-up.mp3`: Level up celebration sound

- **Environmental Sounds**: WAV format, short duration (0.5-2 seconds)
  - `door_open.wav`: Door opening sound
  - `sword.wav`: Combat start/weapon draw sound

## Asset Creation Guidelines

1. **Consistent Style**: Maintain a consistent pixel art style across all assets
2. **Color Palette**: Use a limited color palette for better visual cohesion
3. **Transparency**: Ensure all character, enemy, and effect sprites have transparent backgrounds
4. **Optimization**: Keep file sizes small for better performance
5. **Naming Convention**: Follow the established naming pattern for all new assets

## Adding New Assets

When adding new assets to the project, be sure to:

1. Place them in the appropriate directory
2. Update the AssetConfig.js file with the new asset paths
3. Reference them consistently using the AssetHelper methods

This ensures that the asset management system can properly load and handle all game resources.
