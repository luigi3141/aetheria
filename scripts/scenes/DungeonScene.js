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
        super('DungeonScene');
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
        
        // Load UI elements
        this.load.image('player-icon', ASSET_PATHS.ICONS.PLAYER);
        this.load.image('enemy-icon', ASSET_PATHS.ENEMIES.DEFAULT);
        
        // Load enemy sprites
        this.load.image('dungeon-wolf', ASSET_PATHS.ENEMIES.WOLF);
        this.load.image('dungeon-bandit', ASSET_PATHS.ENEMIES.DEFAULT); // No bandit asset, use default
        this.load.image('dungeon-spider', ASSET_PATHS.ENEMIES.SPIDER);
        this.load.image('dungeon-alpha-wolf', ASSET_PATHS.ENEMIES.WOLF); // Use wolf for alpha-wolf
        
        // Load combat effect sprites
        this.load.image('attack-effect', ASSET_PATHS.EFFECTS.SLASH);
        
        // Load audio
        this.load.audio('door-open', 'assets/audio/door_open.wav');
        this.load.audio('combat-start', 'assets/audio/sword.wav');
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

        // Add decorative corners
        this.ui.addScreenCorners();
        
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
        
        // Create the dungeon map
        this.createDungeonMap();
        
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
     * Create the dungeon map
     */
    createDungeonMap() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a simple grid as placeholder for the dungeon
        const gridSize = 8;
        const cellSize = 50;
        const startX = width/2 - (gridSize * cellSize)/2;
        const startY = height/2 - (gridSize * cellSize)/2;
        
        // Draw grid cells
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Randomly determine if this is a wall or floor
                const isWall = Math.random() < 0.2;
                
                const cellX = startX + x * cellSize;
                const cellY = startY + y * cellSize;
                
                const cell = this.add.rectangle(
                    cellX + cellSize/2,
                    cellY + cellSize/2,
                    cellSize - 2,
                    cellSize - 2,
                    isWall ? 0x333333 : 0x666666
                );
                
                // Add some random elements
                if (!isWall && Math.random() < 0.1) {
                    // Add a chest
                    this.add.image(
                        cellX + cellSize/2,
                        cellY + cellSize/2,
                        'player-icon'  // Using player icon as a temporary chest
                    ).setDisplaySize(cellSize * 0.6, cellSize * 0.6)
                    .setTint(0xffaa00); // Gold tint for chests
                } else if (!isWall && Math.random() < 0.15) {
                    // Add an enemy
                    this.add.image(
                        cellX + cellSize/2,
                        cellY + cellSize/2,
                        'enemy-icon'  // Using the loaded enemy icon
                    ).setDisplaySize(cellSize * 0.7, cellSize * 0.7)
                    .setTint(0xff0000);
                }
            }
        }
    }
    
    /**
     * Create the player character
     */
    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add player sprite at the center of the screen
        this.player = this.add.image(
            width/2,
            height/2,
            'player-icon'  // Updated to use player-icon which is loaded properly
        ).setDisplaySize(40, 40);
        
        // Add a simple highlight instead of glow (which requires WebGL)
        const playerHighlight = this.add.circle(
            width/2,
            height/2,
            25,
            0xffff00,
            0.3
        );
        
        // Make the highlight pulse
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
        
        // Create explore button (renamed from 'COMBAT' to 'EXPLORE')
        const exploreButton = new Button(
            this,
            width * 0.25,
            height * 0.9,
            'EXPLORE',
            () => {
                console.log('Explore button clicked');
                // Start a proper combat encounter
                this.startCombatEncounter();
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
}

export default DungeonScene;
