import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../utils/gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { getDungeonData } from '../data/DungeonConfig.js';
import { loadGame } from '../utils/SaveLoadManager.js';
import BaseScene from './BaseScene.js';

class DungeonScene extends BaseScene {
    constructor() {
        super({ key: 'DungeonScene' });
    }

    preload() {
        const dungeon = gameState.currentDungeon;
        if (dungeon?.backgroundKey) {
            if (!this.textures.exists('combat-bg')) {
                this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS[dungeon.backgroundKey.toUpperCase().replace('-BG', '')]);
            }
        } else {
            if (!this.textures.exists('combat-bg')) {
                this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
            }
        }

        const playerClass = gameState.player.class?.toUpperCase() || 'DEFAULT';
        const spriteKey = `player-${playerClass.toLowerCase()}`;
        if (!this.textures.exists(spriteKey)) {
            const spritePath = ASSET_PATHS.PLAYERS[playerClass] || ASSET_PATHS.PLAYERS.DEFAULT;
            this.load.image(spriteKey, spritePath);
        }
        this.playerSpriteKey = spriteKey;
    }

    init(data) {
        console.log("DungeonScene init - Player state:", {
            level: gameState.player?.level,
            name: gameState.player?.name,
            class: gameState.player?.class,
            health: gameState.player?.health,
            maxHealth: gameState.player?.maxHealth
        });

        // Store current dungeon data before loading saved state
        const currentDungeonData = data?.currentDungeon || gameState.currentDungeon;
        const fromOverworld = data?.fromOverworld || false;
        
        console.log("DungeonScene init - Received dungeon data:", currentDungeonData, "fromOverworld:", fromOverworld);

        // Load saved state, preserving health if not from overworld
        loadGame(!fromOverworld);

        // If coming from overworld, always start at level 1
        if (fromOverworld) {
            console.log("Coming from overworld - resetting dungeon level to 1");
            currentDungeonData.level = 1;
        }

        // Merge dungeon configuration with current dungeon state
        if (currentDungeonData) {
            const dungeonConfig = getDungeonData(currentDungeonData.id);
            if (dungeonConfig) {
                // Merge config data with current state
                gameState.currentDungeon = {
                    ...dungeonConfig, // Base properties from config
                    level: currentDungeonData.level || 1, // Preserve level or default to 1
                    id: currentDungeonData.id, // Keep the current ID
                    name: dungeonConfig.name // Always use config name
                };
                this.currentDungeon = gameState.currentDungeon;
                
                console.log("DungeonScene init - Final dungeon data:", {
                    id: gameState.currentDungeon.id,
                    name: gameState.currentDungeon.name,
                    level: gameState.currentDungeon.level,
                    fromOverworld
                });
            } else {
                console.error(`No dungeon configuration found for id: ${currentDungeonData.id}`);
            }
        }

        console.log("DungeonScene init - Final health state:", {
            health: gameState.player.health,
            maxHealth: gameState.player.maxHealth,
            mana: gameState.player.mana,
            maxMana: gameState.player.maxMana
        });

        console.log("DungeonScene init - Inventory state:", {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });

        console.log("DungeonScene init - Current dungeon:", gameState.currentDungeon);
    }

    create() {
        console.log('DungeonScene create - Starting scene creation');
        
        // Initialize base scene components first
        this.initializeScene();
        
        // Log inventory state at the start of scene creation
        console.log('DungeonScene create - Inventory state:', {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'combat-bg');
        bg.setDisplaySize(width, height);

        // Create player sprite
        const playerSprite = this.add.image(width * 0.5, height * 0.6, this.playerSpriteKey);
        playerSprite.setScale(2);

        // Create UI elements
        this.createUI();

        // Create enemy encounter button
        this.createEncounterButton();

        // Create return button
        this.createReturnButton();

        // Create inventory button
        this.createInventoryButton();

        // --- MODIFIED FADE IN AT THE END ---
        if (this.transitions) {
            // Delay the fade-in slightly to ensure camera is ready
            this.time.delayedCall(50, () => { // 50ms delay (adjust if needed)
                // Add extra check inside the delayed call for robustness
                if (this && this.scene && this.sys.isActive()) {
                     this.transitions.fadeIn(); // Fade in this scene smoothly
                } else {
                    console.warn(`Scene ${this.scene?.key || 'Unknown'} became inactive before delayed fadeIn.`);
                }
            });
        } else {
            console.warn(`TransitionManager not found in ${this.scene.key}, skipping fade-in.`);
            // If no transition manager, make sure input is enabled manually if needed
             if(this.input) this.input.enabled = true;
        }
        // --- END MODIFICATION ---

        console.log(`${this.scene.key} Create End`); 
    }

    initializeDungeon() {
        const dungeonId = 'verdant-woods'; // Default to Verdant Forest
        const dungeonData = getDungeonData(dungeonId);
        
        if (!dungeonData) {
            console.error('Failed to load dungeon data for:', dungeonId);
            return;
        }

        gameState.currentDungeon = {
            id: dungeonData.id,
            name: dungeonData.name,
            level: 1, // Starting level
            minRooms: dungeonData.minRooms,
            maxRooms: dungeonData.maxRooms,
            backgroundKey: dungeonData.backgroundKey
        };
    }

    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Ensure this.ui exists (should be handled by initializeScene)
        if (!this.ui) {
            console.error("UIManager not initialized in DungeonScene!");
            return;
        }

        this.transitions = new TransitionManager(this); // Ensure transitions are initialized

        const dungeon = gameState.currentDungeon;
        if (!dungeon) {
            console.error("No current dungeon data found in gameState!");
            // Handle error - maybe navigate back?
            navigationManager.navigateTo(this, 'OverworldScene');
            return;
        }

        // --- MODIFICATION: Display current dungeon level in title ---
        this.ui.createTitle(width / 2, height * 0.06, `${dungeon.name} - Level ${dungeon.level}`, {
            fontSize: this.ui.fontSize.lg
        });
        // --- END MODIFICATION ---

        const player = gameState.player;

        // Add a dark rectangle behind the text
        const rectWidth = 300; // Adjust width as needed
        const rectHeight = 120; // Adjust height as needed
        const rect = this.add.rectangle(width * 0.5, height * 0.3, rectWidth, rectHeight, 0x000000, 0.7)
            .setOrigin(0.5)
            .setDepth(1);

        // --- Consider updating player stats display here too if needed ---
        const playerInfoText = this.ui.createText(
            width * 0.5, // Centered maybe?
            height * 0.3,
            `${player.name || 'Adventurer'} \n Lvl ${player.level}\n` +
            `HP: ${player.health}/${player.maxHealth}\n` +
             `MP: ${player.mana}/${player.maxMana}`,
             {
                 fontSize: this.ui.fontSize.sm,
                 color: '#ffffff',
                 align: 'center', // Center align
                 lineSpacing: 8,
                 backgroundColor: '#000000cc', // Add slight background
                 padding: {x: 10, y: 5}
             }
            ).setOrigin(0.5).setDepth(2); // Ensure text is above the rectangle
    }

    createEncounterButton() {
        // ... (existing logic) ...
        const width = this.cameras.main.width; // <<< ADD THIS
        const height = this.cameras.main.height; // <<< ADD THIS
        const buttonY = height * 0.9;
         new Button(
             this, width * 0.5, buttonY, 'ADVANCE',
             () => {
                 this.transitions.fade(() => {
                     // --- Pass current dungeon state to EncounterScene ---
                     // EncounterScene will use dungeon.level to generate enemies
                     gameState.combatData = {
                         dungeon: { ...gameState.currentDungeon }, // Pass a copy
                         isBoss: false // Determine if it should be a boss fight here
                         // Potentially add boss logic: e.g., if dungeon.level % 5 === 0
                     };
                     navigationManager.navigateTo(this, 'EncounterScene');
                 });
             },
             { /* options */ }
         );
    }


    createReturnButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.9;
       // const buttonSpacing = width * 0.2;

        new Button(
            this,
            width * 0.8,
            buttonY,
            'RETREAT',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'OverworldScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0xcc0000,
                hoverColor: 0x990000
            }
        );
    }

    createInventoryButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.9;

        new Button(
            this,
            width * 0.2,
            buttonY,
            'INVENTORY',
            () => {
                // Store the current dungeon data in a temporary variable
                const dungeonData = { ...gameState.currentDungeon };
                
                gameState.previousScene = 'DungeonScene';
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'InventoryScene', {
                        returnSceneKey: 'DungeonScene',
                        dungeonData: dungeonData // Pass dungeon data to InventoryScene
                    });
                });
            },
            { width: 160, height: 50 }
        );
    }
}

export default DungeonScene;
