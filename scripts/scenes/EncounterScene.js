import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';

/**
 * EncounterScene - Scene for encountering enemies and deciding to fight or retreat
 */
class EncounterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EncounterScene' });
    }

    preload() {
        // Load encounter assets
        this.load.image('encounter-background', 'https://labs.phaser.io/assets/skies/space3.png');
        // Add enemy sprite placeholders
        this.load.image('wolf-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('bandit-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('spider-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('alpha-wolf-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        
        // Load transition assets
        this.load.audio('door-open', 'assets/audio/door_open.wav');
        this.load.audio('combat-start', 'assets/audio/combat_start.wav');
    }

    create(data) {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Create Transition Manager
        this.transitions = new TransitionManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'encounter-background').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Store dungeon data
        this.dungeonName = data.dungeonName || 'Unknown Dungeon';
        this.dungeonLevel = data.dungeonLevel || 1;
        this.roomNumber = data.roomNumber || 1;
        this.isBoss = data.isBoss || false;
        
        // Set enemies from data or generate random enemies
        this.enemies = data.enemies || this.generateRandomEnemies();
        console.log('Encounter enemies:', this.enemies);
        
        // Create the encounter title
        const titleText = this.isBoss ? 'Boss Encounter!' : 'Enemy Encounter';
        this.ui.createTitle(width/2, height * 0.1, titleText, {
            fontSize: this.ui.fontSize.lg
        });
        
        // Display enemies
        this.displayEnemies();
        
        // Create encounter description
        this.createEncounterDescription();
        
        // Create action buttons
        this.createActionButtons();
    }
    
    /**
     * Generate random enemies if none provided
     */
    generateRandomEnemies() {
        // Default enemy if we can't generate proper ones
        return [{
            type: 'wolf',
            name: 'Wolf',
            level: this.dungeonLevel || 1,
            health: 30,
            maxHealth: 30,
            damage: 5,
            agility: 8,
            abilities: ['bite', 'howl'],
            loot: [
                { item: 'wolf-pelt', chance: 0.7 },
                { item: 'wolf-fang', chance: 0.3 }
            ],
            experienceReward: 20,
            goldReward: { min: 5, max: 15 }
        }];
    }
    
    /**
     * Display enemies on screen
     */
    displayEnemies() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for enemies
        this.enemyContainer = this.add.container(width/2, height * 0.3);
        
        // Calculate positions based on number of enemies
        const enemyCount = this.enemies.length;
        const spacing = width * 0.15;
        const startX = -(spacing * (enemyCount - 1)) / 2;
        
        // Add each enemy
        this.enemies.forEach((enemy, index) => {
            const xPos = startX + (index * spacing);
            
            // Try to get the enemy sprite, fallback to default if not found
            const spriteKey = `${enemy.type}-sprite`;
            const textureExists = this.textures.exists(spriteKey);
            
            // Add enemy sprite
            const sprite = this.add.image(xPos, 0, textureExists ? spriteKey : 'wolf-sprite');
            
            // Add scaling based on enemy type
            const scale = enemy.isBoss ? 2 : 1;
            sprite.setScale(scale);
            
            // Set enemy level if not already set
            if (!enemy.level) {
                enemy.level = this.dungeonLevel || 1;
            }
            
            // Add enemy name text
            const nameText = this.add.text(xPos, 80, `${enemy.name} (Lvl ${enemy.level})`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: enemy.isBoss ? '#ff0000' : '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add health text
            const healthText = this.add.text(xPos, 100, `HP: ${enemy.health}/${enemy.maxHealth}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add to container
            this.enemyContainer.add(sprite);
            this.enemyContainer.add(nameText);
            this.enemyContainer.add(healthText);
        });
        
        // Animate enemies appearing with transition manager
        this.transitions.enemyEncounter(this.enemyContainer.getAll());
    }
    
    /**
     * Create descriptive text about the encounter
     */
    createEncounterDescription() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Calculate difficulty
        const difficulty = this.calculateDifficulty();
        
        // Change color based on difficulty
        let difficultyColor;
        switch(difficulty) {
            case 'Easy': difficultyColor = '#00ff00'; break;
            case 'Moderate': difficultyColor = '#ffff00'; break;
            case 'Challenging': difficultyColor = '#ff9900'; break;
            case 'Dangerous': difficultyColor = '#ff0000'; break;
            default: difficultyColor = '#ffffff';
        }
        
        // Create encounter description
        this.ui.createPanel(
            this,
            width/2,
            height * 0.62,
            width * 0.7,
            height * 0.15,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Enemy count description
        const enemyCountText = this.enemies.length === 1 
            ? "You've encountered a lone enemy" 
            : `You've encountered a group of ${this.enemies.length} enemies`;
        
        // Create description text
        this.add.text(width/2, height * 0.58, enemyCountText, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add difficulty text
        this.add.text(width/2, height * 0.65, `Difficulty: ${difficulty}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: difficultyColor,
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Calculate encounter difficulty based on enemy levels vs player level
     */
    calculateDifficulty() {
        const playerLevel = gameState.player.level;
        
        // Calculate average enemy level
        let totalEnemyLevel = 0;
        this.enemies.forEach(enemy => {
            totalEnemyLevel += enemy.level;
        });
        
        const averageEnemyLevel = totalEnemyLevel / this.enemies.length;
        
        // Additional difficulty for multiple enemies
        const enemyCountFactor = 1 + ((this.enemies.length - 1) * 0.3); // 30% harder per additional enemy
        
        // Calculate relative difficulty (enemy level / player level)
        const relativeDifficulty = (averageEnemyLevel * enemyCountFactor) / playerLevel;
        
        // Determine difficulty rating
        if (relativeDifficulty < 0.8) return 'Easy';
        if (relativeDifficulty < 1.2) return 'Moderate';
        if (relativeDifficulty < 1.8) return 'Challenging';
        return 'Dangerous';
    }
    
    /**
     * Create action buttons for the encounter
     */
    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create fight button
        const fightButton = new Button(
            this,
            width * 0.35,
            height * 0.8,
            'FIGHT',
            () => {
                this.handleFight();
            },
            {
                width: 150,
                height: 50,
                backgroundColor: 0xaa0000
            }
        );
        
        // Create retreat button
        const retreatButton = new Button(
            this,
            width * 0.65,
            height * 0.8,
            'RETREAT',
            () => {
                this.handleRetreat();
            },
            {
                width: 150,
                height: 50,
                backgroundColor: 0x555555
            }
        );
    }
    
    /**
     * Handle the fight action
     */
    handleFight() {
        console.log('Fight button clicked');
        
        // Set up combat in gameState
        gameState.combat.inCombat = true;
        gameState.combat.enemies = this.enemies;
        gameState.combat.turn = 'player';
        gameState.combat.currentEnemy = 0;
        gameState.combat.actionLog = [];
        
        // Navigate to combat result scene (which will handle the actual combat)
        navigationManager.navigateTo(this, 'CombatResultScene', {
            condition: 'Victory',
            enemies: this.enemies,
            loot: this.generateLoot()
        });
    }
    
    /**
     * Handle the retreat action
     */
    handleRetreat() {
        console.log('Retreat button clicked');
        
        // Calculate retreat success chance based on player agility
        const retreatChance = Math.min(0.7, 0.4 + (gameState.player.agility * 0.03));
        const isSuccessful = Math.random() < retreatChance;
        
        if (isSuccessful) {
            // Successful retreat
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'DungeonScene');
            });
        } else {
            // Failed retreat, forced to fight
            this.showMessage('Retreat failed! You must fight!', () => {
                this.handleFight();
            });
        }
    }
    
    /**
     * Generate loot from defeated enemies
     */
    generateLoot() {
        const loot = {
            gold: 0,
            items: [],
            experience: 0
        };
        
        // Calculate loot from each enemy
        this.enemies.forEach(enemy => {
            // Add gold
            if (enemy.goldReward) {
                loot.gold += Phaser.Math.Between(
                    enemy.goldReward.min || 1, 
                    enemy.goldReward.max || 10
                );
            }
            
            // Add experience
            loot.experience += enemy.experienceReward || 10;
            
            // Add items based on loot table and chance
            if (enemy.loot && Array.isArray(enemy.loot)) {
                enemy.loot.forEach(lootItem => {
                    if (Math.random() < (lootItem.chance || 0.1)) {
                        loot.items.push(lootItem.item);
                    }
                });
            }
        });
        
        return loot;
    }
    
    /**
     * Show a message to the player
     */
    showMessage(message, callback) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all message elements
        const messageContainer = this.add.container(0, 0);
        
        // Create panel background
        const panel = this.ui.createPanel(
            width/2,
            height/2,
            width * 0.7,
            height * 0.3,
            {
                fillColor: 0x111122,
                fillAlpha: 0.9,
                borderColor: 0x3399ff,
                borderThickness: 2
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
        messageContainer.add(messageText);
        messageContainer.add(continueButton);
    }
}

export default EncounterScene;
