import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';
import { generateCombatEncounter } from '../encounter/EnemyGenerator.js';
import { calculateDifficulty } from '../utils/DifficultyManager.js';


/**
 * DungeonScene - Scene for exploring procedurally generated dungeons and handling combat
 */
class DungeonScene extends BaseScene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.inCombat = false;
    }

    preload() {
        // Use background from current dungeon
        if (gameState.currentDungeon && gameState.currentDungeon.backgroundKey) {
            // Clear any previous instance of the background texture
            if (this.textures.exists('combat-bg')) {
                this.textures.remove('combat-bg');
            }
            
            // Load the background based on current dungeon
            this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS[gameState.currentDungeon.backgroundKey.toUpperCase().replace('-BG', '')]);
        } else {
            // Load default combat background if no dungeon is selected
            this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
        }
        
        const playerClass = gameState.player.class?.toUpperCase() || 'DEFAULT';
        const spriteKey = `player-${playerClass.toLowerCase()}`;
        const spritePath = ASSET_PATHS.PLAYERS[playerClass] || ASSET_PATHS.PLAYERS.DEFAULT;
      
        // Load the class-specific sprite using a unique key
        this.load.image(spriteKey, spritePath);
      
        // Store key for later use in create()
        this.playerSpriteKey = spriteKey;
    }

    init(data) {
        // Store any data passed from previous scene
        this.sceneData = data || {};
        
        // Initialize a new dungeon run if none exists
        if (!gameState.currentDungeon) {
            this.initializeDungeon();
        }
    }

    create(data) {
        console.log('Creating DungeonScene with data:', data);
        
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Create Transition Manager
        this.transitions = new TransitionManager(this);
        
        // Create the exploration scene
        this.createExplorationScene(data);
    }
    
    /**
     * Create the exploration scene
     */
    createExplorationScene(data) {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background using the safe image loading method from BaseScene
        this.safeAddImage(width/2, height/2, 'combat-bg', null, { displayWidth: width, displayHeight: height });

        
        // Make sure we have a current dungeon
        if (!gameState.currentDungeon) {
            console.warn('No current dungeon found, initializing...');
            this.initializeDungeon();
        }
        
        const dungeon = gameState.currentDungeon;
        console.log('Current dungeon state:', dungeon);
        
        // Create the dungeon title
        this.dungeonTitle = this.ui.createTitle(width/2, height * 0.08, 
            `${dungeon.name} - Room ${dungeon.currentRoom || 1}/${dungeon.totalRooms || 5}`, {
            fontSize: this.ui.fontSize.md
        });
        

        // Create player character
        this.createPlayer();
        
        // Create exploration UI elements
        this.createExplorationUI();
        
        // If we just skipped combat, move to next room
        if (data && data.skippedCombat) {
            this.moveToNextRoom();
        }
        
        // Handle a newly entered room
        if (dungeon.roomsExplored < dungeon.currentRoom) {
            this.handleNewRoom();
        }
    }
    
    /**
     * Initialize a new dungeon run
     */
    initializeDungeon() {
        // Get the selected dungeon from dungeonList or use default
        let dungeonId = 'verdant-woods'; // Default
        
        // If we have a dungeon set in gameState.dungeons.current, use that
        if (gameState.dungeons && gameState.dungeons.current) {
            dungeonId = gameState.dungeons.current;
        }
        
        console.log("Initializing dungeon with ID:", dungeonId);
        
        // Find the dungeon template
        let dungeonTemplate = gameState.dungeonList.find(d => d.id === dungeonId);
        
        if (!dungeonTemplate) {
            console.error("Dungeon template not found for ID:", dungeonId);
            // Fallback to first dungeon in the list
            dungeonTemplate = gameState.dungeonList[0];
        }
        
        // Generate random number of rooms
        const totalRooms = Phaser.Math.Between(
            dungeonTemplate.minRooms || 15, 
            dungeonTemplate.maxRooms || 20
        );
        
        // Create current dungeon
        gameState.currentDungeon = {
            id: dungeonTemplate.id,
            name: dungeonTemplate.name,
            level: dungeonTemplate.minLevel || 1,
            totalRooms: totalRooms,
            currentRoom: 1,
            roomsExplored: 0,
            enemies: dungeonTemplate.enemies || ['wolf', 'bandit', 'spider'],
            bosses: dungeonTemplate.bosses || ['alpha-wolf'],
            loot: []
        };
        
        console.log('Initialized dungeon:', gameState.currentDungeon);
    }
    
    /**
     * Handle entering a new room in the dungeon
     */
    handleNewRoom() {
        // Get current dungeon
        const dungeon = gameState.currentDungeon;
        
        // Mark the room as explored
        dungeon.roomsExplored = dungeon.currentRoom;
        
        // Update room display
        if (this.dungeonTitle) {
            this.dungeonTitle.setText(`${dungeon.name} - Room ${dungeon.currentRoom}/${dungeon.totalRooms}`);
        }
        
        // Determine room type - last room is always a boss
        let roomType;
        if (dungeon.currentRoom >= dungeon.totalRooms) {
            roomType = 'boss';
        } else {
            // Random room type with weighted probabilities
            const rand = Math.random();
            if (rand < 0.6) {
                roomType = 'combat';
            } else if (rand < 0.8) {
                roomType = 'treasure';
            } else {
                roomType = 'empty';
            }
        }
        
        // Handle different room types
        this.handleRoomByType(roomType);
    }
    
    /**
     * Handle different room types
     */
    handleRoomByType(roomType) {
        switch (roomType) {
            case 'boss':
                console.log('Entered boss room!');
                this.showRoomEncounterMessage('Boss Room', 'You\'ve reached the final room with a powerful boss!', () => {
                    this.startBossEncounter();
                });
                break;
            case 'combat':
                console.log('Entered combat room');
                this.showRoomEncounterMessage('Combat Room', 'You\'ve encountered enemies in this room!', () => {
                    this.startCombatEncounter();
                });
                break;
            case 'treasure':
                console.log('Entered treasure room');
                this.showRoomEncounterMessage('Treasure Room', 'You\'ve found a room with valuable treasure!', () => {
                    this.handleTreasureRoom();
                });
                break;
            case 'empty':
                console.log('Entered empty room');
                this.showRoomEncounterMessage('Empty Room', 'This room appears to be empty and safe.', () => {
                    // Nothing happens, player can rest
                    this.handleSafeRoom();
                });
                break;
            default:
                console.error('Unknown room type:', roomType);
        }
    }
    
    /**
     * Display a message when entering a new room
     */
    showRoomEncounterMessage(title, message, callback) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all message elements
        const messageContainer = this.add.container(0, 0);
        
        // Create panel background
        const panel = this.ui.createPanel(
            width/2,
            height/2,
            width * 0.8,
            height * 0.4,
            {
                fillColor: 0x111122,
                fillAlpha: 0.9,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add title
        const titleText = this.add.text(width/2, height * 0.35, title, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Add message
        const messageText = this.add.text(width/2, height * 0.5, message, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add continue button
        const continueButton = new Button(
            this,
            width/2,
            height * 0.6,
            'CONTINUE',
            () => {
                // Remove message elements
                messageContainer.destroy();
                
                // Execute callback
                if (callback) callback();
            },
            {
                width: 150,
                height: 50
            }
        );
        
        // Add all elements to the container
        messageContainer.add(panel.rectangle);
        if (panel.border) messageContainer.add(panel.border);
        messageContainer.add(titleText);
        messageContainer.add(messageText);
        messageContainer.add(continueButton);
    }
    
    /**
     * Start a combat encounter
     */
    startCombatEncounter() {
        console.log('Starting combat encounter');
        
        // Check if we need to initialize the dungeon
        if (!gameState.currentDungeon) {
            console.error('No current dungeon found, initializing...');
            this.initializeDungeon();
        }
        
        // Get dungeon data from currentDungeon
        const dungeon = gameState.currentDungeon;
        
        // Generate enemies based on dungeon level
        const enemyCount = Math.floor(Math.random() * 2) + 1;
        const enemies = EnemyGenerator.generateCombatEncounter(dungeon);
        
        // Set up combat data for the encounter scene
        gameState.combatData = {
            enemies: enemies,
            dungeon: dungeon
        };
        
        // Use fade transition
        this.transitions.fade(() => {
            navigationManager.navigateTo(this, 'EncounterScene');
        }, 300);
    }
    
    /**
     * Start a boss encounter
     */
    startBossEncounter() {
        console.log('Starting boss encounter');
        
        // Check if we need to initialize the dungeon
        if (!gameState.currentDungeon) {
            console.error('No current dungeon found, initializing...');
            this.initializeDungeon();
        }
        
        // Get dungeon data
        const dungeon = gameState.currentDungeon;
        
        // Generate boss based on dungeon
        const enemies = EnemyGenerator.generateCombatEncounter(dungeon, true);
        
        // Set up combat data for the encounter scene
        gameState.combatData = {
            enemies: [boss],
            dungeon: dungeon,
            isBoss: true
        };
        
        // Use fade transition with longer duration for boss
        this.transitions.fade(() => {
            navigationManager.navigateTo(this, 'EncounterScene');
        }, 500);
    }
    
    
    /**
     * Create the player character
     */
    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add player sprite using the correct class-specific key
        this.player = this.add.sprite(
            width / 2,
            height * 0.6, // lower on screen than exact center
            this.playerSpriteKey
        ).setScale(2); // tweak scale as needed

        // Optional highlight
        const playerHighlight = this.add.circle(
            width / 2,
            height * 0.75,
            25,
            0xffff00,
            0.3
        );

        this.tweens.add({
            targets: playerHighlight,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Create exploration UI elements
     */
    createExplorationUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create explore button (renamed from 'COMBAT' to 'EXPLORE' to 'ADVANCE')
        const advanceButton = new Button(
            this,
            width * 0.25,
            height * 0.9,
            'ADVANCE',
            () => {
                console.log('Advance button clicked');
                // Start a proper combat encounter with a message transition
                this.showEncounterMessage();
            },
            {
                width: 160,
                height: 50
            }
        );
        
        // Create inventory button (new)
        const inventoryButton = new Button(
            this,
            width * 0.5,
            height * 0.9,
            'INVENTORY',
            () => {
                console.log('Inventory button clicked');
                // Store current scene in game state
                gameState.previousScene = 'DungeonScene';
                // Navigate to inventory
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'InventoryScene');
                });
            },
            {
                width: 160,
                height: 50
            }
        );
        
        // Create retreat button
        const retreatButton = new Button(
            this,
            width * 0.75,
            height * 0.9,
            'RETREAT',
            () => {
                console.log('Retreat button clicked');
                // Return to the overworld
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'OverworldScene');
                });
            },
            {
                width: 160,
                height: 50
            }
        );
        
        // Create player stats display
        const statsPanel = this.ui.createPanel(
            width * 0.85,
            height * 0.2,
            200,
            100,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Ensure player health and mana values are consistent using HealthManager
        HealthManager.validatePlayerHealth();
        
        // Add player stats text
        const playerName = gameState.player.name || 'Adventurer';
        const playerHealth = gameState.player.health;
        const playerMaxHealth = gameState.player.maxHealth;
        const playerMana = gameState.player.mana;
        const playerMaxMana = gameState.player.maxMana;
        
        // Store the text element so we can update it later
        this.playerStatsText = this.add.text(width * 0.85, height * 0.2, `${playerName}\nHP: ${playerHealth}/${playerMaxHealth}\nMP: ${playerMana}/${playerMaxMana}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Show a message to the player
     */
    showMessage(message) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create panel
        const panel = this.ui.createPanel(
            this,
            width/2,
            height/2,
            width * 0.6,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.9,
                borderColor: 0x3399ff,
                borderThickness: 3
            }
        );
        
        // Add message
        const messageText = this.add.text(width/2, height/2, message, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add continue button
        const continueButton = new Button(
            this,
            width/2,
            height * 0.6,
            'CONTINUE',
            () => {
                // Remove message elements
                panel.destroy();
                messageText.destroy();
                continueButton.destroy();
            },
            {
                width: 150,
                height: 50
            }
        );
    }
    
    /**
     * Show a transition message before starting a combat encounter
     */
    showEncounterMessage() {
        const dungeon = gameState.currentDungeon || { id: 'verdant-woods', level: 1 };
    
        // Generate enemies for the encounter
        let enemies;
        try {
            enemies = generateCombatEncounter(dungeon, false);
        } catch (error) {
            console.error("Error generating enemies:", error);
            enemies = [{
                name: "Forest Goblin",
                level: dungeon.level,
                health: 20,
                maxHealth: 20,
                damage: 5,
                defense: 3,
                sprite: "goblin"
            }];
        }
    
        const enemy = enemies[0];
    
        // Use utility to calculate difficulty
        const playerLevel = gameState.player?.level || 1;
        const { label: difficulty, color: difficultyColor } = calculateDifficulty(enemies, playerLevel);
    
        // Store combat setup in game state
        gameState.combatData = {
            enemies,
            dungeon,
            showIntro: false,
            difficulty,
            difficultyColor
        };
    
        // UI layout
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const messageContainer = this.add.container(0, 0);
    
        const background = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        const messageBox = this.add.rectangle(width / 2, height / 2, width * 0.6, height * 0.3, 0x222222, 0.9)
            .setStrokeStyle(2, 0xffffff);
    
        const text = this.add.text(
            width / 2,
            height / 2 - 20,
            `You've encountered a ${enemy.name}!`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    
        const difficultyText = this.add.text(
            width / 2,
            height / 2 + 20,
            `Difficulty: ${difficulty}`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: difficultyColor,
                align: 'center'
            }
        ).setOrigin(0.5);
    
        messageContainer.add([background, messageBox, text, difficultyText]);
    
        this.safePlaySound('combat-start');
    
        this.tweens.add({
            targets: [text, difficultyText],
            alpha: { from: 0, to: 1 },
            duration: 300,
            ease: 'Power2'
        });
    
        this.time.delayedCall(1500, () => {
            this.transitions.fade(() => {
                messageContainer.destroy();
                navigationManager.navigateTo(this, 'EncounterScene');
            }, 300);
        });
    }
}

export default DungeonScene;
