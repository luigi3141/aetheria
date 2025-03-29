import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { getDungeonData } from '../data/DungeonConfig.js';
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
            class: gameState.player?.class
        });

        // Load saved state
        const savedState = window.localStorage.getItem('gameState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.player) {
                // Update only inventory and stats, not scene-specific data
                gameState.player.inventory = parsedState.player.inventory;
                gameState.player.gold = parsedState.player.gold;
                gameState.player.experience = parsedState.player.experience;
                gameState.player.experienceToNextLevel = parsedState.player.experienceToNextLevel;
            }
        }

        console.log("DungeonScene init - Inventory state:", {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });

        if (data?.currentDungeon) {
            gameState.currentDungeon = data.currentDungeon;
        }
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

        this.ui = new UIManager(this);
        this.transitions = new TransitionManager(this);

        const dungeon = gameState.currentDungeon;
        this.ui.createTitle(width / 2, height * 0.06, dungeon.name, {
            fontSize: this.ui.fontSize.lg
        });

        const player = gameState.player;
        this.ui.createTitle(
            width * 0.5,
            height * 0.3,
            `${player.name || 'Adventurer'}\nHP: ${player.health}/${player.maxHealth}\nMP: ${player.mana}/${player.maxMana}`,
            { 
                fontSize: this.ui.fontSize.sm,
                padding: this.ui.spacing.md,
                lineSpacing: 10
            }
        );
    }

    createEncounterButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.9;
        const buttonSpacing = width * 0.2;

        new Button(
            this,
            width * 0.5,
            buttonY,
            'ADVANCE',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'EncounterScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0x00cc00,
                hoverColor: 0x009900
            }
        );
    }

    createReturnButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.9;
        const buttonSpacing = width * 0.2;

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
        const buttonSpacing = width * 0.2;

        new Button(
            this,
            width * 0.2,
            buttonY,
            'INVENTORY',
            () => {
                gameState.previousScene = 'DungeonScene';
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'InventoryScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0x999999,
                hoverColor: 0x777777
            }
        );
    }
}

export default DungeonScene;
