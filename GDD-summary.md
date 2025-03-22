**Game Design Document (GDD)**

**Overview**

- **Genre**: Fantasy Role-Playing Game (RPG)
- **Target Audience**: Casual to mid-core gamers who enjoy progression-based RPGs, fans of classic browser games, and players interested in crafting and exploration.
- **Unique Selling Points**:
  - A cozy, pixel-art RPG centered on dungeon exploration and crafting.
  - Infinite progression with no level cap, encouraging long-term play.
  - Deep customization through talent trees and equipment itemization.

**Game Mechanics**

- **Core Loop**:
  - Explore procedurally generated dungeons.
  - Battle enemies to collect loot and resources.
  - Craft or upgrade gear using gathered materials.
  - Return to harder dungeons with better rewards.
- **Combat System**:
  - Turn-based with four options: Attack, Use Ability (class-specific), Defend, Use Item.
  - Turn order determined by Agility attribute.
  - Damage calculations:
    - Melee: Based on Strength.
    - Ranged: Based on Agility.
    - Magic: Based on Intelligence.
- **Character Progression**:
  - Infinite leveling with XP formula: XP to level N = 100 \* (1.1)^(N-1).
  - Stat gains per level: +5 Health, +2 Mana, +1 to a chosen attribute (Strength, Agility, or Intelligence).
  - Talent trees with linear progression (e.g., unlock a new talent every 5 levels).
- **Crafting and Inventory**:
  - Inventory limits: 50 items (carry), 100 slots (home base chest).
  - Crafting: Combine materials to create or upgrade gear (e.g., 5 Iron Ingots + 2 Leather = Iron Sword).
  - Success is guaranteed with no failure chance.
- **Quests**:
  - Types: Main (story-driven), Side (optional), Daily (repeatable).
  - Procedurally generated with scaling difficulty and rewards based on player level.

**Story and Worldbuilding**

- **Setting**: A single continent with thematic regions:
  - Verdant Woods (lush forests).
  - Frostpeak Mountains (icy peaks).
  - Scorching Deserts (arid dunes).
- **Plot**: Players are adventurers seeking the Wyvern’s Court, a mythical council of ancient wyverns guarding powerful secrets and treasures.
- **Characters**:
  - **Rival Adventurers**: Compete with the player for loot and fame.
  - **Merchants**: Offer trade goods and occasional quests.
  - **Wyvern Guardians**: Bosses protecting key regions.
- **Lore**: The continent is steeped in history, with ancient ruins, mystical forests, and tales of the wyverns’ reign, providing context for exploration and quests.

**Levels and Environments**

- **Dungeon Generation**:
  - Procedurally generated with 5–20 rooms per dungeon.
  - Enemies: 1–3 per room, scaled to dungeon level.
  - Loot: Tiered drops (Common, Uncommon, Rare, Legendary).
- **Regions**:
  - **Verdant Woods**: Low-level area with wolves and bandits.
  - **Frostpeak Mountains**: Mid-tier area with ice wyverns.
  - **Scorching Deserts**: High-level area with fire elementals.
- **Progression Gates**: Access to higher difficulty areas requires minimum level or gear score.

**Art and Audio Direction**

- **Visual Style**: Pixel art inspired by _Stardew Valley_ (cozy, vibrant) and _Final Fantasy Tactics_ (detailed, tactical).
- **Character Design**: Customizable visuals including hair, skin tones, and armor colors/patterns.
- **Environments**: Distinct biomes with unique enemies and aesthetics (e.g., green foliage in Verdant Woods, icy blues in Frostpeak Mountains).
- **UI Elements**: Retro fonts, limited color palettes, and responsive layouts for desktop and mobile.
- **Audio**:
  - **Music**: Ambient tracks for hub areas, dungeons, and combat.
  - **Sound Effects**: Action sounds (e.g., attack, ability), environmental cues (e.g., wind, footsteps), and UI feedback (e.g., button clicks).

**Technical Design Document (TDD)**

**Game Engine and Tools**

- **Game Engine**: Phaser 3
  - **Reason**: Lightweight, open-source, and optimized for 2D browser-based games with pixel art.
- **Tools**:
  - **Development**: Visual Studio Code or similar IDE.
  - **Asset Creation**: Aseprite for pixel art, Audacity for sound editing.
  - **Version Control**: Git with GitHub for team collaboration.

**Architecture**

- **Scene-Based Structure**: Each game screen is a Phaser Scene object:
  - StartScene, OverworldScene, DungeonScene, etc.
- **Modular Components**:
  - **PlayerData**: Tracks stats, inventory, and quests.
  - **UI Components**: Reusable buttons, lists, and panels.
  - **Game Logic**: Separate modules for combat, crafting, and quests.
- **Data Flow**: Centralized game state with event-driven updates (e.g., playerLevelUp triggers UI refresh).

**Systems Design**

- **Combat System**:
  - Turn-based logic using state machines for player and enemy actions.
  - Damage formula: (Base Damage + Attribute Bonus) \* Gear Modifier.
- **Crafting System**:
  - Recipe database with material requirements (e.g., Iron Sword: 5 Iron Ingots, 2 Leather).
  - Inventory management enforces slot limits.
- **Quest System**:
  - Procedural generation using templates (e.g., “Defeat X enemies”).
  - Quest log tracks active and completed quests.

**Performance and Optimization**

- **Rendering**:
  - Use sprite sheets for efficient texture packing.
  - Limit draw calls with batch rendering.
- **Memory**:
  - Preload assets in Phaser’s preload phase.
  - Unload unused assets between scenes.
- **Frame Rate**:
  - Target 60 FPS on desktop, 30 FPS on mobile.
  - Optimize loops and minimize heavy computations in update.

**Art and Asset Specifications**

**Character and Asset Designs**

- **Characters**:
  - 32 unique sprites (4 races x 4 classes x 2 genders).
  - Customizable with hairstyles, colors, and armor visuals.
- **Enemies**: 20 types with distinct visuals (e.g., wolf, bandit, ice wyvern).
- **Items**: 50 icons for gear, materials, and consumables (e.g., Iron Sword, Health Potion).
- **Environments**: 5 tile sets for biomes (Verdant Woods, Frostpeak Mountains, etc.).

**Animation Guidelines**

- **Character Animations**:
  - Idle, walk, attack, and ability animations (4 frames each).
  - Enemy-specific animations (e.g., wolf lunge, wyvern breath).
- **Environmental Effects**:
  - Weather effects (snow, sandstorms).
  - Lighting effects (torches, glows).

**UI/UX Design**

- **HUD**: Health and mana bars (top-left), quick-access items (bottom-center).
- **Menus**:
  - Inventory: Grid layout with drag-and-drop.
  - Crafting: List of recipes with material requirements.
  - Character Stats: Panel with attributes and equipped gear.
- **Feedback**: Tooltips, combat logs, and button hover effects.

**Sound and Music Design**

**Sound Effects**

- **Actions**: Attack hit (sharp clang), ability use (whoosh or spark), item pickup (soft chime).
- **Environment**: Wind (howling), footsteps (crunching), enemy growls (low rumble).
- **UI**: Button clicks (click), menu navigation (beep), notifications (ding).

**Music Composition**

- **Hub**: Calm, ambient track with gentle strings and flute (mood: peaceful, tempo: slow).
- **Dungeon**: Mysterious, tense music with low percussion and synth (mood: suspenseful, tempo: moderate).
- **Combat**: Upbeat, intense theme with drums and brass (mood: thrilling, tempo: fast).

**Gameplay Flow and User Interface (UI) Design**

**Game Flow**

1. **StartScene**: Title screen with "Start Game" and "Settings."
2. **CharacterSelectScene**: Choose or create a character (race, class, appearance).
3. **OverworldScene**: Central hub with options for dungeons, inventory, crafting, and stats.
4. **DungeonSelectScene**: Select a dungeon based on region and difficulty.
5. **DungeonScene**: Explore rooms, battle enemies, and collect loot.
6. **CombatResultScene**: Post-combat choice: continue deeper or retreat with loot.
7. **PostRunSummaryScene**: Recap of loot and XP after exiting the dungeon.
8. **InventoryScene**: Manage items and gear.
9. **CraftingScene**: Craft items using materials.
10. **CharacterSheetScene**: View and manage stats and equipment.

**UI Layouts**

- **HUD**:
  - Top-left: Health and mana bars.
  - Bottom-center: Quick-access item slots (e.g., potions).
- **Menus**:
  - Centered panels with lists (quests), grids (inventory), and buttons (craft, equip).
- **Responsive Design**: UI scales for desktop (full-screen) and mobile (touch-friendly).

**Monetization and Progression**

**Currency System**

- **Gold**: Earned from quests, enemies, and trading.
  - Used for crafting materials, gear upgrades, and merchant purchases.

**Progression Systems**

- **Experience Points (XP)**: Earned from combat and quests, driving infinite leveling.
- **Skill Trees**: Linear talents (e.g., +10% damage at level 5, unlock ability at level 10).
- **Achievements**: Milestones like “Defeat 50 Enemies” or “Craft a Rare Item.”
- **Unlockables**: New dungeons, gear recipes, and cosmetic options (e.g., armor colors).