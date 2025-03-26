import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { getDungeonEnemies, getDungeonBoss, generateLoot } from '../data/enemies.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';

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
        const enemies = getDungeonEnemies(dungeon.id, dungeon.level, enemyCount);
        
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
        const boss = getDungeonBoss(dungeon.id, dungeon.level);
        
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
     * Generate enemies for a dungeon encounter
     * @param {string} dungeonId - The dungeon ID
     * @param {number} dungeonLevel - The dungeon level
     * @param {number} count - Number of enemies to generate
     * @returns {Array} Array of enemy objects
     */
    generateDungeonEnemies(dungeonId, dungeonLevel, count) {
        // Get current dungeon
        const dungeon = gameState.currentDungeon;
        
        if (!dungeon || !dungeon.enemies || dungeon.enemies.length === 0) {
            // Return default enemies if no dungeon data
            return [{
                name: 'Forest Wolf',
                level: dungeonLevel || 1,
                health: 20 + (dungeonLevel * 5),
                maxHealth: 20 + (dungeonLevel * 5),
                damage: 5 + dungeonLevel,
                defense: 2,
                sprite: 'wolf-enemy',
                abilities: ['bite', 'howl']
            }];
        }
        
        // Generate requested number of enemies
        const enemies = [];
        for (let i = 0; i < count; i++) {
            // Get random enemy type from dungeon's enemy list
            const enemyType = dungeon.enemies[Math.floor(Math.random() * dungeon.enemies.length)];
            
            // Create enemy based on type
            let enemy;
            switch (enemyType) {
                case 'wolf':
                    enemy = {
                        name: 'Forest Wolf',
                        level: dungeonLevel,
                        health: 20 + (dungeonLevel * 5),
                        maxHealth: 20 + (dungeonLevel * 5),
                        damage: 5 + dungeonLevel,
                        defense: 2,
                        sprite: 'wolf-enemy',
                        abilities: ['bite', 'howl']
                    };
                    break;
                case 'bandit':
                    enemy = {
                        name: 'Bandit',
                        level: dungeonLevel,
                        health: 15 + (dungeonLevel * 4),
                        maxHealth: 15 + (dungeonLevel * 4),
                        damage: 6 + dungeonLevel,
                        defense: 1,
                        sprite: 'bandit-enemy',
                        abilities: ['slash', 'steal']
                    };
                    break;
                case 'spider':
                    enemy = {
                        name: 'Giant Spider',
                        level: dungeonLevel,
                        health: 12 + (dungeonLevel * 3),
                        maxHealth: 12 + (dungeonLevel * 3),
                        damage: 4 + dungeonLevel,
                        defense: 0,
                        sprite: 'spider-enemy',
                        abilities: ['bite', 'web']
                    };
                    break;
                default:
                    // Default enemy
                    enemy = {
                        name: 'Forest Creature',
                        level: dungeonLevel,
                        health: 15 + (dungeonLevel * 4),
                        maxHealth: 15 + (dungeonLevel * 4),
                        damage: 5 + dungeonLevel,
                        defense: 1,
                        sprite: 'enemy-icon',
                        abilities: ['attack']
                    };
            }
            
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Generate a boss for a dungeon encounter
     * @param {string} dungeonId - The dungeon ID
     * @param {number} dungeonLevel - The dungeon level
     * @returns {Object} Boss enemy object
     */
    generateDungeonBoss(dungeonId, dungeonLevel) {
        // Get current dungeon
        const dungeon = gameState.currentDungeon;
        
        if (!dungeon || !dungeon.bosses || dungeon.bosses.length === 0) {
            // Return default boss if no dungeon data
            return {
                name: 'Dungeon Guardian',
                level: dungeonLevel + 2,
                health: 50 + (dungeonLevel * 10),
                maxHealth: 50 + (dungeonLevel * 10),
                damage: 8 + (dungeonLevel * 2),
                defense: 4,
                sprite: 'boss-icon',
                isBoss: true,
                abilities: ['smash', 'roar', 'heal']
            };
        }
        
        // Get random boss type from dungeon's boss list
        const bossType = dungeon.bosses[Math.floor(Math.random() * dungeon.bosses.length)];
        
        // Create boss based on type
        let boss;
        switch (bossType) {
            case 'alpha-wolf':
                boss = {
                    name: 'Alpha Wolf',
                    level: dungeonLevel + 2,
                    health: 50 + (dungeonLevel * 10),
                    maxHealth: 50 + (dungeonLevel * 10),
                    damage: 8 + (dungeonLevel * 2),
                    defense: 3,
                    sprite: 'wolf-boss',
                    isBoss: true,
                    abilities: ['fierce-bite', 'howl', 'call-pack']
                };
                break;
            case 'bandit-chief':
                boss = {
                    name: 'Bandit Chief',
                    level: dungeonLevel + 2,
                    health: 45 + (dungeonLevel * 8),
                    maxHealth: 45 + (dungeonLevel * 8),
                    damage: 10 + (dungeonLevel * 2),
                    defense: 2,
                    sprite: 'bandit-boss',
                    isBoss: true,
                    abilities: ['dual-slash', 'rally', 'smoke-bomb']
                };
                break;
            case 'spider-queen':
                boss = {
                    name: 'Spider Queen',
                    level: dungeonLevel + 2,
                    health: 40 + (dungeonLevel * 7),
                    maxHealth: 40 + (dungeonLevel * 7),
                    damage: 7 + (dungeonLevel * 2),
                    defense: 1,
                    sprite: 'spider-boss',
                    isBoss: true,
                    abilities: ['venom-bite', 'web-trap', 'spawn-spiderlings']
                };
                break;
            default:
                // Default boss
                boss = {
                    name: 'Dungeon Guardian',
                    level: dungeonLevel + 2,
                    health: 50 + (dungeonLevel * 10),
                    maxHealth: 50 + (dungeonLevel * 10),
                    damage: 8 + (dungeonLevel * 2),
                    defense: 4,
                    sprite: 'boss-icon',
                    isBoss: true,
                    abilities: ['smash', 'roar', 'heal']
                };
        }
        
        return boss;
    }
    
    /**
     * Handle a treasure room
     */
    handleTreasureRoom() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create treasure UI
        const treasurePanel = this.ui.createPanel(
            this,
            width/2,
            height/2,
            width * 0.6,
            height * 0.5,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0xffcc00,
                borderThickness: 3
            }
        );
        
        // Generate random treasure
        const gold = Phaser.Math.Between(20, 50 * gameState.currentDungeon.level);
        
        // Random treasure items (simplified for now)
        const items = [];
        const possibleItems = ['health-potion', 'mana-potion', 'wolf-pelt'];
        
        // Add 1-3 random items
        const itemCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < itemCount; i++) {
            const itemId = Phaser.Utils.Array.GetRandom(possibleItems);
            const item = gameState.itemTemplates[itemId];
            if (item) items.push({...item});
        }
        
        // Display treasure title
        this.add.text(width/2, height * 0.35, 'TREASURE FOUND!', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display gold
        this.add.text(width/2, height * 0.45, `${gold} Gold`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display items
        let itemText = '';
        items.forEach(item => {
            itemText += `${item.name}\n`;
        });
        
        this.add.text(width/2, height * 0.55, itemText, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add collect button
        const collectButton = new Button(
            this,
            width/2,
            height * 0.7,
            'COLLECT TREASURE',
            () => {
                // Add gold to player
                gameState.player.gold += gold;
                
                // Add items to inventory
                items.forEach(item => {
                    gameState.inventory.items.push(item);
                });
                
                // Clean up UI
                treasurePanel.destroy();
                this.children.list
                    .filter(child => child.type === 'Text' || child.texture?.key === 'button-background')
                    .forEach(child => child.destroy());
                
                // Show confirmation
                this.showMessage('Treasure collected!');
            },
            {
                width: 220,
                height: 60
            }
        );
    }
    
    /**
     * Handle an empty/safe room
     */
    handleSafeRoom() {
        // Nothing happens, player can rest
        this.showMessage('You rest for a moment.');
    }
    
    /**
     * Move to the next room in the dungeon
     */
    moveToNextRoom() {
        const dungeon = gameState.currentDungeon;
        
        // Increment current room
        dungeon.currentRoom++;
        
        // Handle the new room
        this.handleNewRoom();
    }
    
    /**
     * Create the combat scene
     */
    createCombatScene() {
        // Create combat background
        this.add.image(this.cameras.main.width/2, this.cameras.main.height/2, 'combat-background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Create combat UI elements
        this.createCombatUI();
    }
    
    /**
     * Create the combat UI elements
     */
    createCombatUI() {
        // Create combat title
        this.ui.createTitle(this.cameras.main.width/2, this.cameras.main.height * 0.08, 'Combat', {
            fontSize: this.ui.fontSize.md
        });
        
        // Create enemy display
        const enemy = gameState.currentEnemy;
        this.add.text(this.cameras.main.width/2, this.cameras.main.height * 0.2, enemy.name, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create player display
        const player = gameState.player;
        this.add.text(this.cameras.main.width/2, this.cameras.main.height * 0.3, player.name, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create combat options
        const attackButton = new Button(
            this,
            this.cameras.main.width * 0.25,
            this.cameras.main.height * 0.5,
            'ATTACK',
            () => {
                // Handle attack
                this.handleAttack();
            },
            {
                width: 150,
                height: 50
            }
        );
        
        const defendButton = new Button(
            this,
            this.cameras.main.width * 0.5,
            this.cameras.main.height * 0.5,
            'DEFEND',
            () => {
                // Handle defend
                this.handleDefend();
            },
            {
                width: 150,
                height: 50
            }
        );
        
        const healButton = new Button(
            this,
            this.cameras.main.width * 0.75,
            this.cameras.main.height * 0.5,
            'HEAL',
            () => {
                // Handle heal
                this.handleHeal();
            },
            {
                width: 150,
                height: 50
            }
        );
    }
    
    /**
     * Handle an attack
     */
    handleAttack() {
        // Calculate damage
        const damage = Phaser.Math.Between(10, 20);
        
        // Apply damage to enemy
        gameState.currentEnemy.health -= damage;
        
        // Check if enemy is defeated
        if (gameState.currentEnemy.health <= 0) {
            // Enemy defeated, end combat
            this.endCombat();
        } else {
            // Enemy not defeated, enemy attacks back
            this.handleEnemyAttack();
        }
    }
    
    /**
     * Handle an enemy attack
     */
    handleEnemyAttack() {
        // Calculate damage
        const damage = Phaser.Math.Between(5, 15);
        
        // Apply damage to player
        gameState.player.health -= damage;
        
        // Check if player is defeated
        if (gameState.player.health <= 0) {
            // Player defeated, game over
            this.gameOver();
        }
    }
      
    /**
     * End combat
     */
    endCombat() {
        // Clean up combat UI
        this.children.list
            .filter(child => child.type === 'Text' || child.texture?.key === 'button-background')
            .forEach(child => child.destroy());
        
        // Navigate back to dungeon scene
        navigationManager.navigateTo(this, 'DungeonScene');
    }
    
    /**
     * Game over
     */
    gameOver() {
        // Clean up combat UI
        this.children.list
            .filter(child => child.type === 'Text' || child.texture?.key === 'button-background')
            .forEach(child => child.destroy());
        
        // Navigate to game over scene
        navigationManager.navigateTo(this, 'GameOverScene');
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
        // Generate enemies based on dungeon level
        const dungeon = gameState.currentDungeon || { id: 'verdant-woods', level: 1 };
        const enemyCount = Math.floor(Math.random() * 2) + 1;
        
        // Get enemies for the encounter
        let enemies = [];
        try {
            enemies = getDungeonEnemies(dungeon.id, dungeon.level, enemyCount);
        } catch (error) {
            console.error("Error generating enemies:", error);
            // Fallback to a default enemy if there's an error
            enemies = [{ 
                name: "Forest Goblin", 
                level: dungeon.level, 
                hp: 20, 
                maxHp: 20,
                attack: 5,
                defense: 3
            }];
        }
        
        // Get the first enemy for display
        const enemy = enemies[0];
        
        // Calculate difficulty using the same system as EncounterScene
        const playerLevel = gameState.player?.level || 1;
        let totalEnemyLevel = 0;
        enemies.forEach(enemy => {
            totalEnemyLevel += enemy.level || 1;
        });
        
        const averageEnemyLevel = totalEnemyLevel / enemies.length;
        const enemyCountFactor = 1 + ((enemies.length - 1) * 0.3); // 30% harder per additional enemy
        const relativeDifficulty = (averageEnemyLevel * enemyCountFactor) / playerLevel;
        
        // Determine difficulty rating - match EncounterScene's system
        let difficulty = "Moderate";
        let difficultyColor = '#ffff00'; // Yellow
        
        if (relativeDifficulty < 0.8) {
            difficulty = "Easy";
            difficultyColor = '#00ff00'; // Green
        } else if (relativeDifficulty < 1.2) {
            difficulty = "Moderate";
            difficultyColor = '#ffff00'; // Yellow
        } else if (relativeDifficulty < 1.8) {
            difficulty = "Challenging";
            difficultyColor = '#ff9900'; // Orange
        } else {
            difficulty = "Dangerous";
            difficultyColor = '#ff0000'; // Red
        }
        
        // Set up combat data for the encounter scene - this data will be available in EncounterScene
        gameState.combatData = {
            enemies: enemies,
            dungeon: dungeon,
            showIntro: false, // Skip the intro in EncounterScene since we're showing it here
            difficulty: difficulty,
            difficultyColor: difficultyColor
        };
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all message elements
        const messageContainer = this.add.container(0, 0);
        
        // Create dim background
        const background = this.add.rectangle(
            width/2, 
            height/2, 
            width, 
            height, 
            0x000000, 
            0.6
        );
        
        // Create message box
        const messageBox = this.add.rectangle(
            width/2, 
            height/2, 
            width * 0.6, 
            height * 0.3, 
            0x222222, 
            0.9
        ).setStrokeStyle(2, 0xffffff);
        
        // Create encounter text
        const text = this.add.text(
            width/2, 
            height/2 - 20, 
            `You've encountered a ${enemy.name}!`, 
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create difficulty text with the same color as in EncounterScene
        const difficultyText = this.add.text(
            width/2, 
            height/2 + 20, 
            `Difficulty: ${difficulty}`, 
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: difficultyColor,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add all elements to the container
        messageContainer.add(background);
        messageContainer.add(messageBox);
        messageContainer.add(text);
        messageContainer.add(difficultyText);
        
        // Play an alert sound if available
        this.safePlaySound('combat-start');
        
        // Add a fade-in tween for the message
        text.alpha = 0;
        difficultyText.alpha = 0;
        
        this.tweens.add({
            targets: [text, difficultyText],
            alpha: 1,
            duration: 300,
            ease: 'Power2'
        });
        
        // Delay then navigate
        this.time.delayedCall(1500, () => {
            // Use fade transition to navigate to encounter scene
            this.transitions.fade(() => {
                // Clean up the message elements
                messageContainer.destroy();
                
                // Navigate to encounter scene
                navigationManager.navigateTo(this, 'EncounterScene');
            }, 300);
        });
    }
}

export default DungeonScene;
