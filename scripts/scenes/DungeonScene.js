import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';

/**
 * DungeonScene - Scene for exploring procedurally generated dungeons and handling combat
 */
class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
        this.inCombat = false;
    }

    preload() {
        // Load dungeon assets
        this.load.image('dungeon-bg', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('player-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('enemy-icon', 'https://labs.phaser.io/assets/sprites/phaser-enemy.png');
        
        // Load transition assets
        this.load.spritesheet('door', 'https://labs.phaser.io/assets/sprites/metalslug_mummy37x45.png', { 
            frameWidth: 37, 
            frameHeight: 45 
        });
        this.load.audio('door-open', 'assets/audio/door_open.wav');
        this.load.audio('combat-start', 'assets/audio/combat_start.wav');
        
        // Load enemy sprites - placeholders
        this.load.image('wolf-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('bandit-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('spider-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('alpha-wolf-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        
        // Load combat effect sprites
        this.load.image('attack-effect', 'https://labs.phaser.io/assets/particles/red.png');
        this.load.image('heal-effect', 'https://labs.phaser.io/assets/particles/blue.png');
        this.load.image('defend-effect', 'https://labs.phaser.io/assets/particles/yellow.png');
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
        
        // Add background
        this.add.image(width/2, height/2, 'dungeon-bg').setDisplaySize(width, height);

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
            dungeonTemplate.minRooms || 5, 
            dungeonTemplate.maxRooms || 10
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
        console.log('Starting combat encounter...');
        
        // Generate enemies based on dungeon level
        const dungeon = gameState.currentDungeon;
        const enemies = this.generateEnemies(dungeon.level, dungeon.enemies);
        
        // Store enemies in gameState for the encounter scene
        gameState.currentEncounter = {
            enemies: enemies,
            type: 'normal',
            roomNumber: dungeon.currentRoom
        };
        
        // Use transition manager to handle the enemy encounter transition
        this.transitions.enemyEncounter([], () => {
            // Navigate to encounter scene
            navigationManager.navigateTo(this, 'EncounterScene');
        });
    }
    
    /**
     * Start a boss encounter
     */
    startBossEncounter() {
        console.log('Starting boss encounter...');
        
        // Generate boss based on dungeon level
        const dungeon = gameState.currentDungeon;
        const boss = this.generateBoss(dungeon.level, dungeon.bosses);
        
        // Store boss in gameState for the encounter scene
        gameState.currentEncounter = {
            enemies: [boss],
            type: 'boss',
            roomNumber: dungeon.currentRoom
        };
        
        // Use transition manager to handle the enemy encounter transition
        this.transitions.enemyEncounter([], () => {
            // Navigate to encounter scene
            navigationManager.navigateTo(this, 'EncounterScene');
        });
    }
    
    /**
     * Generate enemies based on dungeon level
     */
    generateEnemies(level, enemyTypes) {
        const enemyCount = Phaser.Math.Between(1, 3); // 1-3 enemies
        const enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            // Pick a random enemy type from the dungeon's enemy list
            const enemyType = Phaser.Utils.Array.GetRandom(enemyTypes);
            const enemyTemplate = gameState.enemyTemplates[enemyType];
            
            if (!enemyTemplate) {
                console.error(`Enemy template not found for type: ${enemyType}`);
                continue;
            }
            
            // Create enemy instance with scaled stats based on dungeon level
            const levelMultiplier = 1 + ((level - 1) * 0.2);
            
            const enemy = {
                type: enemyType,
                name: enemyTemplate.name,
                health: Math.round(enemyTemplate.baseHealth * levelMultiplier),
                maxHealth: Math.round(enemyTemplate.baseHealth * levelMultiplier),
                damage: Math.round(enemyTemplate.baseDamage * levelMultiplier),
                agility: enemyTemplate.agility,
                abilities: enemyTemplate.abilities,
                loot: enemyTemplate.loot,
                experienceReward: Math.round(enemyTemplate.experienceReward * levelMultiplier),
                goldReward: {
                    min: Math.round(enemyTemplate.goldReward.min * levelMultiplier),
                    max: Math.round(enemyTemplate.goldReward.max * levelMultiplier)
                }
            };
            
            enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Generate a boss based on dungeon
     */
    generateBoss(level, bossTypes) {
        // Pick a random boss type from the dungeon's boss list
        const bossType = Phaser.Utils.Array.GetRandom(bossTypes);
        const bossTemplate = gameState.enemyTemplates[bossType];
        
        if (!bossTemplate) {
            console.error(`Boss template not found for type: ${bossType}`);
            // Fallback to first boss in the list
            const fallbackBossType = bossTypes[0];
            bossTemplate = gameState.enemyTemplates[fallbackBossType];
            
            // If still no template, create a generic boss
            if (!bossTemplate) {
                return {
                    type: 'generic-boss',
                    name: 'Dungeon Boss',
                    health: 100,
                    maxHealth: 100,
                    damage: 20,
                    agility: 10,
                    abilities: ['smash', 'roar'],
                    loot: [{ item: 'gold', chance: 1.0 }],
                    experienceReward: 100,
                    goldReward: { min: 50, max: 100 }
                };
            }
        }
        
        // Create boss instance with scaled stats based on dungeon level
        const levelMultiplier = 1.5 + ((level - 1) * 0.3); // Bosses are stronger
        
        const boss = {
            type: bossType,
            name: bossTemplate.name,
            health: Math.round(bossTemplate.baseHealth * levelMultiplier * 2), // Bosses have double health
            maxHealth: Math.round(bossTemplate.baseHealth * levelMultiplier * 2),
            damage: Math.round(bossTemplate.baseDamage * levelMultiplier),
            agility: bossTemplate.agility,
            abilities: bossTemplate.abilities,
            loot: bossTemplate.loot,
            experienceReward: Math.round(bossTemplate.experienceReward * levelMultiplier * 2),
            goldReward: {
                min: Math.round(bossTemplate.goldReward.min * levelMultiplier * 2),
                max: Math.round(bossTemplate.goldReward.max * levelMultiplier * 2)
            },
            isBoss: true
        };
        
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
                fillAlpha: 0.9,
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
     * Handle a defend action
     */
    handleDefend() {
        // Calculate defense bonus
        const defenseBonus = Phaser.Math.Between(5, 10);
        
        // Apply defense bonus to player
        gameState.player.defense += defenseBonus;
    }
    
    /**
     * Handle a heal action
     */
    handleHeal() {
        // Calculate heal amount
        const healAmount = Phaser.Math.Between(10, 20);
        
        // Apply heal to player
        gameState.player.health += healAmount;
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
                        'chest-sprite'
                    ).setDisplaySize(cellSize * 0.6, cellSize * 0.6);
                } else if (!isWall && Math.random() < 0.15) {
                    // Add an enemy
                    this.add.image(
                        cellX + cellSize/2,
                        cellY + cellSize/2,
                        'enemy-sprite'
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
            'player-sprite'
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
        
        // Create combat button
        const combatButton = new Button(
            this,
            width * 0.25,
            height * 0.9,
            'COMBAT',
            () => {
                console.log('Combat button clicked');
                navigationManager.navigateTo(this, 'CombatResultScene');
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
                // When retreating, we go to the combat result scene with a condition
                navigationManager.navigateTo(this, 'CombatResultScene', {}, 'Retreat with Loot');
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
        
        // Add player stats text
        const playerName = gameState.player.name || 'Adventurer';
        const playerHealth = gameState.player.health || 100;
        const playerMana = gameState.player.mana || 50;
        
        this.add.text(width * 0.85, height * 0.2, `${playerName}\nHP: ${playerHealth}/100\nMP: ${playerMana}/50`, {
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
