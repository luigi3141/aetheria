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
        this.load.audio('combat-start', 'assets/audio/sword.wav');
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
        gameState.combat = {
            inCombat: true,
            enemies: this.enemies,
            turn: 'player',
            currentEnemy: 0,
            actionLog: [],
            playerHealth: gameState.player.health,
            playerMaxHealth: gameState.player.maxHealth || 100,
            playerDefense: 0
        };
        
        // Create the combat UI
        this.createCombatUI();
    }
    
    /**
     * Create the combat UI for turn-based combat
     */
    createCombatUI() {
        // Clear existing UI
        if (this.combatContainer) {
            this.combatContainer.destroy();
        }
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all combat UI elements
        this.combatContainer = this.add.container(0, 0);
        
        // Create combat panel
        const panel = this.ui.createPanel(
            width/2,
            height/2,
            width * 0.9,
            height * 0.7,
            {
                fillColor: 0x111122,
                fillAlpha: 0.9,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add panel elements to container
        this.combatContainer.add(panel.rectangle);
        if (panel.border) {
            this.combatContainer.add(panel.border);
        }
        
        // Add combat title
        const titleText = this.add.text(width/2, height * 0.2, 'COMBAT', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        this.combatContainer.add(titleText);
        
        // Display player stats
        this.displayPlayerStats();
        
        // Display current enemy
        this.displayCurrentEnemy();
        
        // Create combat action buttons
        this.createCombatActionButtons();
        
        // Display combat log
        this.createCombatLog();
    }
    
    /**
     * Display player stats in combat
     */
    displayPlayerStats() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create player stats panel
        const playerPanel = this.ui.createPanel(
            width * 0.25,
            height * 0.3,
            width * 0.4,
            height * 0.15,
            {
                fillColor: 0x222244,
                fillAlpha: 0.8,
                borderColor: 0x6688cc,
                borderThickness: 1
            }
        );
        
        // Add panel elements to container
        this.combatContainer.add(playerPanel.rectangle);
        if (playerPanel.border) {
            this.combatContainer.add(playerPanel.border);
        }
        
        // Add player name
        const playerName = this.add.text(width * 0.1, height * 0.27, gameState.player.name || 'Hero', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff'
        });
        this.combatContainer.add(playerName);
        
        // Add player health
        const healthText = this.add.text(width * 0.1, height * 0.32, 
            `HP: ${gameState.combat.playerHealth}/${gameState.combat.playerMaxHealth}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ff8888'
        });
        this.combatContainer.add(healthText);
        
        // Add player defense if any
        if (gameState.combat.playerDefense > 0) {
            const defenseText = this.add.text(width * 0.3, height * 0.32, 
                `DEF: +${gameState.combat.playerDefense}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#88ccff'
            });
            this.combatContainer.add(defenseText);
        }
    }
    
    /**
     * Display the current enemy in combat
     */
    displayCurrentEnemy() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get current enemy
        const enemy = this.enemies[gameState.combat.currentEnemy];
        
        // Create enemy stats panel
        const enemyPanel = this.ui.createPanel(
            width * 0.75,
            height * 0.3,
            width * 0.4,
            height * 0.15,
            {
                fillColor: 0x442222,
                fillAlpha: 0.8,
                borderColor: 0xcc6666,
                borderThickness: 1
            }
        );
        
        // Add panel elements to container
        this.combatContainer.add(enemyPanel.rectangle);
        if (enemyPanel.border) {
            this.combatContainer.add(enemyPanel.border);
        }
        
        // Add enemy sprite
        const enemySprite = this.add.image(width * 0.75, height * 0.45, `${enemy.type}-sprite`)
            .setDisplaySize(80, 80);
        this.combatContainer.add(enemySprite);
        
        // Add enemy name
        const enemyName = this.add.text(width * 0.6, height * 0.27, enemy.name, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff'
        });
        this.combatContainer.add(enemyName);
        
        // Add enemy health
        const healthText = this.add.text(width * 0.6, height * 0.32, 
            `HP: ${enemy.health}/${enemy.maxHealth}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ff8888'
        });
        this.combatContainer.add(healthText);
    }
    
    /**
     * Create combat action buttons
     */
    createCombatActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create attack button
        const attackButton = new Button(
            this,
            width * 0.25,
            height * 0.7,
            'ATTACK',
            () => {
                this.handleAttack();
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0xaa3333
            }
        );
        this.combatContainer.add(attackButton);
        
        // Create defend button
        const defendButton = new Button(
            this,
            width * 0.5,
            height * 0.7,
            'DEFEND',
            () => {
                this.handleDefend();
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0x3366aa
            }
        );
        this.combatContainer.add(defendButton);
        
        // Create heal button
        const healButton = new Button(
            this,
            width * 0.75,
            height * 0.7,
            'HEAL',
            () => {
                this.handleHeal();
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0x33aa66
            }
        );
        this.combatContainer.add(healButton);
    }
    
    /**
     * Create combat log display
     */
    createCombatLog() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create log panel
        const logPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.55,
            width * 0.8,
            height * 0.15,
            {
                fillColor: 0x000000,
                fillAlpha: 0.7,
                borderColor: 0x666666,
                borderThickness: 1
            }
        );
        
        // Add panel elements to container
        this.combatContainer.add(logPanel.rectangle);
        if (logPanel.border) {
            this.combatContainer.add(logPanel.border);
        }
        
        // Add log text
        this.combatLogText = this.add.text(width * 0.15, height * 0.5, 'Combat started! Choose your action...', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            wordWrap: { width: width * 0.7 }
        });
        this.combatContainer.add(this.combatLogText);
    }
    
    /**
     * Handle attack action
     */
    handleAttack() {
        // Get current enemy
        const enemy = this.enemies[gameState.combat.currentEnemy];
        
        // Calculate damage
        const playerAttack = gameState.player.attack || 10;
        const damage = Math.max(1, playerAttack - Math.floor(enemy.defense / 2));
        
        // Apply damage to enemy
        enemy.health = Math.max(0, enemy.health - damage);
        
        // Update combat log
        this.updateCombatLog(`You attack ${enemy.name} for ${damage} damage!`);
        
        // Check if enemy is defeated
        if (enemy.health <= 0) {
            this.handleEnemyDefeated();
        } else {
            // Enemy turn
            this.time.delayedCall(1000, () => {
                this.enemyTurn();
            });
        }
        
        // Update UI
        this.displayCurrentEnemy();
    }
    
    /**
     * Handle defend action
     */
    handleDefend() {
        // Increase player defense
        gameState.combat.playerDefense += 5;
        
        // Update combat log
        this.updateCombatLog(`You take a defensive stance! Defense +5.`);
        
        // Enemy turn
        this.time.delayedCall(1000, () => {
            this.enemyTurn();
        });
        
        // Update UI
        this.displayPlayerStats();
    }
    
    /**
     * Handle heal action
     */
    handleHeal() {
        // Calculate heal amount
        const healAmount = Math.floor(gameState.combat.playerMaxHealth * 0.2);
        
        // Apply healing
        gameState.combat.playerHealth = Math.min(
            gameState.combat.playerMaxHealth,
            gameState.combat.playerHealth + healAmount
        );
        
        // Update combat log
        this.updateCombatLog(`You use a healing potion and recover ${healAmount} HP!`);
        
        // Enemy turn
        this.time.delayedCall(1000, () => {
            this.enemyTurn();
        });
        
        // Update UI
        this.displayPlayerStats();
    }
    
    /**
     * Handle enemy turn
     */
    enemyTurn() {
        // Get current enemy
        const enemy = this.enemies[gameState.combat.currentEnemy];
        
        // Calculate damage
        const enemyAttack = enemy.attack;
        let damage = Math.max(1, enemyAttack - Math.floor(gameState.combat.playerDefense / 2));
        
        // Apply damage to player
        gameState.combat.playerHealth = Math.max(0, gameState.combat.playerHealth - damage);
        
        // Update combat log
        this.updateCombatLog(`${enemy.name} attacks you for ${damage} damage!`);
        
        // Reset player defense
        gameState.combat.playerDefense = 0;
        
        // Check if player is defeated
        if (gameState.combat.playerHealth <= 0) {
            this.handlePlayerDefeated();
        }
        
        // Update UI
        this.displayPlayerStats();
    }
    
    /**
     * Update the combat log with a new message
     */
    updateCombatLog(message) {
        // Add message to log
        gameState.combat.actionLog.push(message);
        
        // Keep only the last 3 messages
        if (gameState.combat.actionLog.length > 3) {
            gameState.combat.actionLog.shift();
        }
        
        // Update log text
        this.combatLogText.setText(gameState.combat.actionLog.join('\n'));
    }
    
    /**
     * Handle enemy defeated
     */
    handleEnemyDefeated() {
        // Update combat log
        this.updateCombatLog(`${this.enemies[gameState.combat.currentEnemy].name} was defeated!`);
        
        // Move to next enemy or end combat
        gameState.combat.currentEnemy++;
        
        if (gameState.combat.currentEnemy < this.enemies.length) {
            // Next enemy
            this.time.delayedCall(1000, () => {
                this.updateCombatLog(`${this.enemies[gameState.combat.currentEnemy].name} appears!`);
                this.displayCurrentEnemy();
            });
        } else {
            // All enemies defeated
            this.time.delayedCall(1000, () => {
                this.handleVictory();
            });
        }
    }
    
    /**
     * Handle player defeated
     */
    handlePlayerDefeated() {
        // Update combat log
        this.updateCombatLog(`You have been defeated!`);
        
        // End combat
        this.time.delayedCall(1500, () => {
            // Store combat result
            gameState.combatResult = {
                outcome: 'defeat',
                enemies: this.enemies,
                isBoss: gameState.currentEncounter.type === 'boss'
            };
            
            // Navigate to combat result scene
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'CombatResultScene');
            });
        });
    }
    
    /**
     * Handle victory
     */
    handleVictory() {
        console.log('Victory!');
        
        // Generate loot based on enemies defeated
        const loot = this.generateLoot();
        
        // Store loot and encounter info for the result scene
        gameState.combatResult = {
            outcome: 'victory',
            loot: loot,
            enemies: this.enemies,
            isBoss: gameState.currentEncounter.type === 'boss'
        };
        
        // Use fade transition to combat result scene
        this.transitions.fade(() => {
            // Navigate to combat result scene
            navigationManager.navigateTo(this, 'CombatResultScene');
        });
    }
    
    /**
     * Handle the retreat action
     */
    handleRetreat() {
        console.log('Retreat button clicked');
        
        // Calculate retreat success chance based on player agility
        const retreatChance = Math.min(0.7, 0.4 + ((gameState.player.agility || 1) * 0.03));
        const isSuccessful = Math.random() < retreatChance;
        
        if (isSuccessful) {
            // Successful retreat
            // Store retreat result for the result scene
            gameState.combatResult = {
                outcome: 'retreat',
                enemies: this.enemies
            };
            
            // Use fade transition to combat result scene
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'CombatResultScene');
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
