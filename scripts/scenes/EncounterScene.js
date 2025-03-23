import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { generateLoot, getAbilityData, applyStatusEffect } from '../data/enemies.js';

/**
 * EncounterScene - Scene for encountering enemies and deciding to fight or retreat
 */
class EncounterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EncounterScene' });
    }

    preload() {
        // Load combat-related assets
        this.load.image('combat-bg', 'assets/sprites/backgrounds/combat-bg.png');
        this.load.image('player-icon', 'assets/sprites/characters/warrior-icon.png');
        this.load.image('enemy-icon', 'assets/sprites/enemies/goblin-sprite.png');
        this.load.image('wolf-sprite', 'assets/sprites/enemies/wolf-sprite.png');
        this.load.image('spider-sprite', 'assets/sprites/enemies/spider-sprite.png');
        this.load.image('goblin-chief-sprite', 'assets/sprites/enemies/goblin-chief-sprite.png');
        this.load.image('bandit-sprite', 'assets/sprites/enemies/bandit-sprite.png');
        this.load.image('mushroom-sprite', 'assets/sprites/enemies/mushroom-sprite.png');
        this.load.image('bat-sprite', 'assets/sprites/enemies/bat-sprite.png');
        this.load.image('golem-sprite', 'assets/sprites/enemies/golem-sprite.png');
        this.load.image('ghost-sprite', 'assets/sprites/enemies/ghost-sprite.png');
        this.load.image('crystal-queen-sprite', 'assets/sprites/enemies/crystal-queen-sprite.png');
        
        // Load combat effect sprites
        this.load.image('slash-effect', 'assets/sprites/effects/slash.png');
        this.load.image('heal-effect', 'assets/sprites/effects/heal.png');
        this.load.image('defend-effect', 'assets/sprites/effects/shield.png');
        this.load.image('poison-effect', 'assets/sprites/effects/poison.png');
        this.load.image('bleed-effect', 'assets/sprites/effects/bleed.png');
        this.load.image('stun-effect', 'assets/sprites/effects/stun.png');
        this.load.image('crystal-effect', 'assets/sprites/effects/crystal.png');
        this.load.image('ghost-effect', 'assets/sprites/effects/ghost.png');
        
        // Load combat sounds - make sure to load with both naming conventions for compatibility
        // Original sound keys
        this.load.audio('attack', 'assets/audio/attack.mp3');
        this.load.audio('defend', 'assets/audio/defend.mp3');
        this.load.audio('heal', 'assets/audio/heal.mp3');
        this.load.audio('enemy-hit', 'assets/audio/enemy-hit.mp3');
        this.load.audio('player-hit', 'assets/audio/player-hit.mp3');
        this.load.audio('victory', 'assets/audio/victory.mp3');
        this.load.audio('poison', 'assets/audio/poison.mp3');
        this.load.audio('crystal', 'assets/audio/crystal.mp3');
        this.load.audio('ghost', 'assets/audio/ghost.mp3');
        
        // Alternative sound keys with -sound suffix for backward compatibility
        this.load.audio('attack-sound', 'assets/audio/attack.mp3');
        this.load.audio('defend-sound', 'assets/audio/defend.mp3');
        this.load.audio('heal-sound', 'assets/audio/heal.mp3');
        this.load.audio('enemy-hit-sound', 'assets/audio/enemy-hit.mp3');
        this.load.audio('player-hit-sound', 'assets/audio/player-hit.mp3');
        this.load.audio('victory-sound', 'assets/audio/victory.mp3');
        this.load.audio('poison-sound', 'assets/audio/poison.mp3');
        this.load.audio('crystal-sound', 'assets/audio/crystal.mp3');
        this.load.audio('ghost-sound', 'assets/audio/ghost.mp3');
    }
    
    create(data) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Initialize UI manager
        this.ui = new UIManager(this);
        this.transitions = new TransitionManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'combat-bg').setDisplaySize(width, height);
        
        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Get combat data from gameState
        const combatData = gameState.combatData || {};
        this.enemies = combatData.enemies || [];
        this.isBoss = combatData.isBoss || false;
        
        // Initialize combat state
        this.combatState = {
            turn: 'player',
            round: 1,
            playerDefending: false,
            enemyDefending: false,
            log: [],
            activeStatusEffects: {
                player: [],
                enemies: []
            },
            abilityCooldowns: {
                player: {},
                enemies: {}
            }
        };
        
        // Create the combat UI
        this.createCombatUI();
        
        // Start combat with intro
        this.startCombat();
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
        
        // Clear any existing enemy sprites
        if (this.enemySprites) {
            this.enemySprites.forEach(sprite => sprite.destroy());
        }
        
        this.enemySprites = [];
        
        // Get the primary enemy (first in the list)
        const enemy = this.enemies[0];
        
        if (!enemy) return;
        
        // Add enemy sprite
        const sprite = enemy.sprite || 'enemy-icon';
        this.enemySprites[0] = this.add.image(
            width * 0.85, 
            height * 0.25, 
            sprite
        ).setDisplaySize(enemy.isBoss ? 96 : 64, enemy.isBoss ? 96 : 64);
        
        // Add enemy name and health
        this.enemyNameText = this.add.text(width * 0.75, height * 0.2, enemy.name, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.enemyHealthText = this.add.text(width * 0.75, height * 0.25, `HP: ${enemy.health}/${enemy.maxHealth}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.enemyHealthBar = this.makeHealthBar(width * 0.75, height * 0.3, 150, 15, 0xff3333);
        this.updateHealthBar(this.enemyHealthBar, enemy.health, enemy.maxHealth);
        
        // Store references to display elements in the enemy object
        enemy.displayElements = {
            sprite: this.enemySprites[0],
            nameText: this.enemyNameText,
            healthText: this.enemyHealthText,
            healthBar: this.enemyHealthBar,
            statusContainer: this.add.container(width * 0.75, height * 0.35)
        };
        
        // If this is a boss, add a special effect
        if (enemy.isBoss) {
            // Add pulsing glow effect
            const glow = this.add.graphics();
            glow.fillStyle(0xff0000, 0.3);
            glow.fillCircle(width * 0.85, height * 0.25, 60);
            
            this.tweens.add({
                targets: glow,
                alpha: 0.1,
                duration: 800,
                yoyo: true,
                repeat: -1
            });
        }
    }
    
    /**
     * Create a health bar
     */
    makeHealthBar(x, y, width, height, color) {
        // Create the bar
        const bar = this.add.graphics();
        
        // Create border
        const border = this.add.graphics();
        border.lineStyle(2, 0xffffff, 1);
        border.strokeRect(x - width/2, y - height/2, width, height);
        
        return {
            bar: bar,
            x: x - width/2,
            y: y - height/2,
            width: width,
            height: height,
            color: color
        };
    }
    
    /**
     * Update a health bar
     */
    updateHealthBar(bar, value, maxValue) {
        const percentage = Math.max(0, Math.min(value / maxValue, 1));
        
        bar.bar.clear();
        bar.bar.fillStyle(bar.color, 1);
        bar.bar.fillRect(bar.x, bar.y, bar.width * percentage, bar.height);
    }
    
    /**
     * Process status effects for a target
     * @param {object} target - The target (player or enemy)
     * @param {string} targetType - Either 'player' or 'enemy'
     * @returns {object} - Status effect results including damage dealt
     */
    processStatusEffects(target, targetType) {
        if (!target.statusEffects || target.statusEffects.length === 0) {
            return { damage: 0, effects: [] };
        }
        
        let totalDamage = 0;
        const activeEffects = [];
        const expiredEffects = [];
        
        // Process each status effect
        target.statusEffects.forEach(effect => {
            // Skip if no remaining duration
            if (effect.remainingDuration <= 0) {
                expiredEffects.push(effect);
                return;
            }
            
            // Process effect based on type
            switch (effect.type) {
                case 'poison':
                    // Apply poison damage
                    const poisonDamage = effect.damage || 2;
                    totalDamage += poisonDamage;
                    activeEffects.push(`${effect.type}: -${poisonDamage} HP`);
                    break;
                    
                case 'bleed':
                    // Apply bleed damage
                    const bleedDamage = Math.ceil(target.maxHealth * 0.05);
                    totalDamage += bleedDamage;
                    activeEffects.push(`${effect.type}: -${bleedDamage} HP`);
                    break;
                    
                case 'stun':
                    // Stun prevents action
                    activeEffects.push(`${effect.type}: Skip turn`);
                    break;
                    
                case 'immobilize':
                    // Immobilize prevents movement
                    activeEffects.push(`${effect.type}: Can't retreat`);
                    break;
                    
                default:
                    // Other effects
                    activeEffects.push(effect.type);
            }
            
            // Decrease remaining duration
            effect.remainingDuration--;
        });
        
        // Remove expired effects
        target.statusEffects = target.statusEffects.filter(effect => effect.remainingDuration > 0);
        
        // Apply damage if any
        if (totalDamage > 0) {
            target.health = Math.max(0, target.health - totalDamage);
            
            // Update health display
            if (targetType === 'player') {
                this.playerHealthText.setText(`HP: ${target.health}/${target.maxHealth || 100}`);
                this.updateHealthBar(this.playerHealthBar, target.health, target.maxHealth || 100);
            } else if (target.displayElements) {
                target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
                this.updateHealthBar(target.displayElements.healthBar, target.health, target.maxHealth);
            }
        }
        
        // Update status effect display
        this.updateStatusEffectDisplay(target, targetType);
        
        return {
            damage: totalDamage,
            effects: activeEffects,
            expired: expiredEffects
        };
    }
    
    /**
     * Update the visual display of status effects
     * @param {object} target - The target (player or enemy)
     * @param {string} targetType - Either 'player' or 'enemy'
     */
    updateStatusEffectDisplay(target, targetType) {
        // Get the container to update
        let container;
        
        if (targetType === 'player') {
            // Create player status container if it doesn't exist
            if (!this.playerStatusContainer) {
                const width = this.cameras.main.width;
                const height = this.cameras.main.height;
                this.playerStatusContainer = this.add.container(width * 0.25, height * 0.35);
            }
            container = this.playerStatusContainer;
        } else if (target.displayElements && target.displayElements.statusContainer) {
            container = target.displayElements.statusContainer;
        } else {
            return; // No container to update
        }
        
        // Clear existing icons
        container.removeAll();
        
        // No effects to display
        if (!target.statusEffects || target.statusEffects.length === 0) {
            return;
        }
        
        // Add icons for each effect
        const spacing = 20;
        let xPos = 0;
        
        target.statusEffects.forEach((effect, index) => {
            // Get icon based on effect type
            let iconKey;
            switch (effect.type) {
                case 'poison': iconKey = 'poison-effect'; break;
                case 'bleed': iconKey = 'bleed-effect'; break;
                case 'stun': iconKey = 'stun-effect'; break;
                default: iconKey = 'defend-effect'; // Default icon
            }
            
            // Create icon
            const icon = this.add.image(xPos, 0, iconKey).setDisplaySize(16, 16);
            
            // Add duration text
            const durationText = this.add.text(xPos, 10, effect.remainingDuration, {
                fontFamily: "'VT323'",
                fontSize: '12px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // Add to container
            container.add(icon);
            container.add(durationText);
            
            // Update position for next icon
            xPos += spacing;
        });
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
        
        // Remove encounter action buttons
        this.children.list
            .filter(child => child.type === 'Image' && child.texture.key === 'button-background')
            .forEach(button => button.destroy());
        
        this.children.list
            .filter(child => child.type === 'Text' && (child.text === 'FIGHT' || child.text === 'RETREAT'))
            .forEach(text => text.destroy());
        
        // Create the combat UI with action buttons
        this.createCombatUI();
    }
    
    /**
     * Create the combat UI for turn-based combat
     */
    createCombatUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create combat log container
        this.combatLogContainer = this.add.container(width * 0.75, height * 0.3);
        this.combatLogBg = this.add.rectangle(0, 0, width * 0.4, height * 0.4, 0x000000, 0.7)
            .setOrigin(0.5, 0.5);
        this.combatLogContainer.add(this.combatLogBg);
        
        // Add title
        this.combatLogTitle = this.add.text(0, -this.combatLogBg.height * 0.4, 'COMBAT LOG', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0.5);
        this.combatLogContainer.add(this.combatLogTitle);
        
        // Create log entries container
        this.logEntries = [];
        this.maxLogEntries = 8; // Maximum number of log entries to display
        
        // Create title based on boss status
        const titleText = this.isBoss ? 'Boss Battle!' : 'Combat Encounter';
        this.ui.createTitle(width/2, height * 0.08, titleText, {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create player panel
        const playerPanel = this.ui.createPanel(
            width * 0.25,
            height * 0.25,
            width * 0.4,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add player icon
        this.playerSprite = this.add.image(
            width * 0.15, 
            height * 0.25, 
            'player-icon'
        ).setDisplaySize(64, 64);
        
        // Add player stats
        const playerName = gameState.player.name || 'Adventurer';
        const playerHealth = gameState.player.health || 100;
        const playerMaxHealth = gameState.player.maxHealth || 100;
        
        this.playerNameText = this.add.text(width * 0.25, height * 0.2, playerName, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.playerHealthText = this.add.text(width * 0.25, height * 0.25, `HP: ${playerHealth}/${playerMaxHealth}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        this.playerHealthBar = this.makeHealthBar(width * 0.25, height * 0.3, 150, 15, 0x3399ff);
        this.updateHealthBar(this.playerHealthBar, playerHealth, playerMaxHealth);
        
        // Create enemy panel
        const enemyPanel = this.ui.createPanel(
            width * 0.75,
            height * 0.25,
            width * 0.4,
            height * 0.2,
            {
                fillColor: 0x221111,
                fillAlpha: 0.7,
                borderColor: 0xff3333,
                borderThickness: 2
            }
        );
        
        // Display enemies
        this.displayEnemies();
        
        // Create combat log panel
        const logPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.55,
            width * 0.8,
            height * 0.2,
            {
                fillColor: 0x111111,
                fillAlpha: 0.7,
                borderColor: 0xffcc00,
                borderThickness: 2
            }
        );
        
        // Add combat log text
        this.combatLogText = this.add.text(width * 0.5, height * 0.55, 'Combat begins!', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width * 0.75 }
        }).setOrigin(0.5);
        
        // Create combat action buttons
        this.createCombatActionButtons();
    }
    
    /**
     * Create combat action buttons for turn-based combat
     */
    createCombatActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create action button panel
        const actionPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.8,
            width * 0.8,
            height * 0.15,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Store action buttons for easy access
        this.actionButtons = {};
        
        // Create attack button
        this.actionButtons.attack = new Button(
            this,
            width * 0.25,
            height * 0.8,
            'ATTACK',
            () => {
                this.playerAttack();
            },
            {
                width: 120,
                height: 50,
                backgroundColor: 0xaa0000
            }
        );
        
        // Create defend button
        this.actionButtons.defend = new Button(
            this,
            width * 0.45,
            height * 0.8,
            'DEFEND',
            () => {
                this.playerDefend();
            },
            {
                width: 120,
                height: 50,
                backgroundColor: 0x0066aa
            }
        );
        
        // Create heal button
        this.actionButtons.heal = new Button(
            this,
            width * 0.65,
            height * 0.8,
            'HEAL',
            () => {
                // Use a basic heal ability
                this.playerUseAbility('basic-heal');
            },
            {
                width: 120,
                height: 50,
                backgroundColor: 0x00aa66
            }
        );
        
        // Create retreat button
        this.actionButtons.retreat = new Button(
            this,
            width * 0.85,
            height * 0.8,
            'RETREAT',
            () => {
                this.handleRetreat();
            },
            {
                width: 120,
                height: 50,
                backgroundColor: 0x555555
            }
        );
    }
    
    /**
     * Update the action buttons (enable/disable)
     * @param {boolean} enabled - Whether buttons should be enabled
     */
    updateActionButtons(enabled) {
        if (!this.actionButtons) return;
        
        Object.values(this.actionButtons).forEach(button => {
            if (button && button.setInteractive) {
                if (enabled) {
                    button.setInteractive();
                    button.setAlpha(1);
                } else {
                    button.disableInteractive();
                    button.setAlpha(0.5);
                }
            }
        });
    }
    
    /**
     * Start combat sequence
     */
    startCombat() {
        // If no enemies provided, generate random ones
        if (!this.enemies || this.enemies.length === 0) {
            this.enemies = this.generateRandomEnemies();
        }
        
        // Display enemies
        this.displayEnemies();
        
        // Create encounter description
        this.createEncounterDescription();
        
        // Initialize player status
        if (!gameState.player.statusEffects) {
            gameState.player.statusEffects = [];
        }
        
        // Initialize enemy status effects
        this.enemies.forEach(enemy => {
            if (!enemy.statusEffects) {
                enemy.statusEffects = [];
            }
        });
        
        // Start first round
        this.startPlayerTurn();
    }
    
    /**
     * Start player turn
     */
    startPlayerTurn() {
        // Set turn to player
        this.combatState.turn = 'player';
        
        // Process player status effects
        const statusResults = this.processStatusEffects(gameState.player, 'player');
        
        // Add status effect results to combat log
        if (statusResults.effects.length > 0) {
            this.addToCombatLog(`Status effects on player: ${statusResults.effects.join(', ')}`);
        }
        
        // Check if player is stunned
        const isStunned = gameState.player.statusEffects.some(effect => effect.type === 'stun');
        
        if (isStunned) {
            this.addToCombatLog('Player is stunned and skips their turn!');
            this.time.delayedCall(1000, () => {
                this.startEnemyTurn();
            });
            return;
        }
        
        // Update UI for player turn
        this.updateActionButtons(true);
        this.addToCombatLog('Your turn! Choose an action.');
    }
    
    /**
     * Handle player attack action
     */
    playerAttack() {
        // Disable action buttons during animation
        this.updateActionButtons(false);
        
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        const playerStr = player.strength || 10;
        
        // Select target (for now just pick first enemy)
        const target = this.enemies[0];
        
        // Calculate base damage
        let damage = Math.floor(playerStr * 0.8) + Math.floor(Math.random() * 6) + 1;
        
        // Add scaling based on player attributes
        if (player.agility) {
            damage += Math.floor(player.agility * 0.2);
        }
        
        // Add level scaling
        damage += Math.floor(playerLevel * 0.5);
        
        // Apply weapon damage if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.weapon) {
            damage += player.inventory.equipped.weapon.damage || 0;
        }
        
        // Check if enemy is defending
        if (target.isDefending) {
            damage = Math.floor(damage * 0.5);
            this.addToCombatLog(`${target.name} is defending and takes reduced damage!`);
        }
        
        // Apply damage
        target.health = Math.max(0, target.health - damage);
        
        // Play attack animation and sound
        this.playAttackAnimation(target);
        this.safePlaySound('attack-sound');
        
        // Update enemy health display
        if (target.displayElements) {
            this.updateHealthBar(target.displayElements.healthBar, target.health, target.maxHealth);
            target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
        }
        
        // Add to combat log
        this.addToCombatLog(`You attack ${target.name} for ${damage} damage!`);
        
        // Check if enemy defeated
        if (target.health <= 0) {
            this.enemyDefeated(target);
        } else {
            // Continue to enemy turn after a short delay
            this.time.delayedCall(1000, () => {
                this.startEnemyTurn();
            });
        }
    }
    
    /**
     * Handle player using an ability
     * @param {string} abilityId - The ID of the ability to use
     */
    playerUseAbility(abilityId) {
        // Disable action buttons during animation
        this.updateActionButtons(false);
        
        // Get ability data
        const ability = getAbilityData(abilityId);
        if (!ability) {
            // Fallback to basic attack if ability not found
            this.playerAttack();
            return;
        }
        
        // Process ability based on type
        switch (ability.type) {
            case 'damage':
                this.processPlayerDamageAbility(ability);
                break;
                
            case 'heal':
                this.processPlayerHealAbility(ability);
                break;
                
            case 'buff':
                this.processPlayerBuffAbility(ability);
                break;
                
            case 'debuff':
                this.processPlayerDebuffAbility(ability);
                break;
                
            default:
                this.addToCombatLog(`Used ${ability.name}!`);
                break;
        }
        
        // Continue to enemy turn after a delay
        this.time.delayedCall(1500, () => {
            this.startEnemyTurn();
        });
    }
    
    /**
     * Process a player damage ability
     * @param {object} ability - The ability data
     */
    processPlayerDamageAbility(ability) {
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        
        // Determine targets
        let targets = [];
        if (ability.targetType === 'all') {
            targets = [...this.enemies];
        } else {
            // Default to first enemy for single target
            targets = [this.enemies[0]];
        }
        
        // Calculate damage for each target
        targets.forEach(target => {
            // Base damage calculation
            let damage = ability.baseDamage || 5;
            
            // Add scaling based on player attributes
            if (ability.scaling) {
                const attribute = ability.scaling.attribute || 'strength';
                const scale = ability.scaling.factor || 0.5;
                damage += Math.floor(player[attribute] * scale);
            }
            
            // Add level scaling
            damage += Math.floor(playerLevel * 0.3);
            
            // Apply damage
            target.health = Math.max(0, target.health - damage);
            
            // Update enemy health display
            if (target.displayElements) {
                target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
            }
            
            // Add to combat log
            this.addToCombatLog(`You used ${ability.name} on ${target.name} for ${damage} damage!`);
            
            // Apply status effect if ability has one
            if (ability.statusEffect) {
                this.applyStatusEffectToTarget(target, ability.statusEffect);
                this.addToCombatLog(`${target.name} is afflicted with ${ability.statusEffect.type}!`);
            }
            
            // Play appropriate animation and sound
            this.playAbilityAnimation(target, ability);
            
            // Check if enemy defeated
            if (target.health <= 0) {
                this.enemyDefeated(target);
            }
        });
    }
    
    /**
     * Process a player healing ability
     * @param {object} ability - The ability data
     */
    processPlayerHealAbility(ability) {
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        const playerInt = player.intelligence || 8;
        
        // Calculate healing amount
        let healAmount = ability.baseHeal || 10;
        
        // Add attribute scaling
        if (ability.scaling) {
            const attribute = ability.scaling.attribute || 'intelligence';
            const scale = ability.scaling.factor || 0.5;
            healAmount += Math.floor(player[attribute] * scale);
        }
        
        // Add level scaling
        healAmount += Math.floor(playerLevel * 0.5);
        
        // Apply healing
        const oldHealth = player.health;
        player.health = Math.min(player.maxHealth, player.health + healAmount);
        const actualHealing = player.health - oldHealth;
        
        // Play heal animation and sound
        this.playHealAnimation(player);
        this.safePlaySound('heal-sound');
        
        // Add to combat log
        this.addToCombatLog(`You use ${ability.name} and heal for ${actualHealing} health!`);
        
        // Update player health display
        if (this.playerHealthText) {
            this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        }
        if (this.playerHealthBar) {
            this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
        }
        
        // Continue to enemy turn after a delay
        this.time.delayedCall(1500, () => {
            this.startEnemyTurn();
        });
    }
    
    /**
     * Process a player buff ability
     * @param {object} ability - The ability data
     */
    processPlayerBuffAbility(ability) {
        // Get player
        const player = gameState.player;
        
        // Apply buff as status effect
        if (ability.buff) {
            this.applyStatusEffectToTarget(player, {
                type: ability.buff.type,
                duration: ability.buff.duration || 3,
                magnitude: ability.buff.magnitude || 1
            });
            
            // Add to combat log
            this.addToCombatLog(`You used ${ability.name} and gained ${ability.buff.type}!`);
            
            // Play appropriate animation
            this.playBuffAnimation(player, ability);
        }
    }
    
    /**
     * Process a player debuff ability
     * @param {object} ability - The ability data
     */
    processPlayerDebuffAbility(ability) {
        // Determine targets
        let targets = [];
        if (ability.targetType === 'all') {
            targets = [...this.enemies];
        } else {
            // Default to first enemy for single target
            targets = [this.enemies[0]];
        }
        
        // Apply debuff to each target
        targets.forEach(target => {
            if (ability.debuff) {
                this.applyStatusEffectToTarget(target, {
                    type: ability.debuff.type,
                    duration: ability.debuff.duration || 3,
                    magnitude: ability.debuff.magnitude || 1
                });
                
                // Add to combat log
                this.addToCombatLog(`You used ${ability.name} on ${target.name}!`);
                this.addToCombatLog(`${target.name} is afflicted with ${ability.debuff.type}!`);
                
                // Play appropriate animation
                this.playDebuffAnimation(target, ability);
            }
        });
    }
    
    /**
     * Apply a status effect to a target
     * @param {object} target - The target to apply the effect to
     * @param {object} effectData - The effect data
     */
    applyStatusEffectToTarget(target, effectData) {
        // Initialize status effects array if it doesn't exist
        if (!target.statusEffects) {
            target.statusEffects = [];
        }
        
        // Check if effect already exists
        const existingEffect = target.statusEffects.find(effect => effect.type === effectData.type);
        
        if (existingEffect) {
            // Refresh duration if effect already exists
            existingEffect.remainingDuration = Math.max(
                existingEffect.remainingDuration,
                effectData.duration || 3
            );
            
            // Update magnitude if new one is stronger
            if (effectData.magnitude && effectData.magnitude > existingEffect.magnitude) {
                existingEffect.magnitude = effectData.magnitude;
            }
        } else {
            // Add new effect
            target.statusEffects.push({
                type: effectData.type,
                remainingDuration: effectData.duration || 3,
                magnitude: effectData.magnitude || 1,
                damage: effectData.damage || 0
            });
        }
        
        // Update status effect display
        const targetType = target === gameState.player ? 'player' : 'enemy';
        this.updateStatusEffectDisplay(target, targetType);
    }
    
    /**
     * Start enemy turn
     */
    startEnemyTurn() {
        // Set turn to enemy
        this.combatState.turn = 'enemy';
        
        // Process each enemy's turn
        this.processEnemyTurns(0);
    }
    
    /**
     * Process enemy turns one by one
     * @param {number} index - Current enemy index
     */
    processEnemyTurns(index) {
        // If all enemies processed, go back to player turn
        if (index >= this.enemies.length) {
            // Decrement cooldowns
            Object.keys(this.combatState.abilityCooldowns.player).forEach(abilityId => {
                if (this.combatState.abilityCooldowns.player[abilityId] > 0) {
                    this.combatState.abilityCooldowns.player[abilityId]--;
                }
            });
            
            // Start a new round
            this.combatState.round++;
            this.startPlayerTurn();
            return;
        }
        
        // Get current enemy
        const enemy = this.enemies[index];
        
        // Skip defeated enemies
        if (enemy.health <= 0) {
            this.processEnemyTurns(index + 1);
            return;
        }
        
        // Process enemy status effects
        const statusResults = this.processStatusEffects(enemy, 'enemy');
        
        // Add status effect results to combat log
        if (statusResults.effects.length > 0) {
            this.addToCombatLog(`Status effects on ${enemy.name}: ${statusResults.effects.join(', ')}`);
        }
        
        // Check if enemy is stunned
        const isStunned = enemy.statusEffects.some(effect => effect.type === 'stun');
        
        if (isStunned) {
            this.addToCombatLog(`${enemy.name} is stunned and skips their turn!`);
            this.time.delayedCall(800, () => {
                this.processEnemyTurns(index + 1);
            });
            return;
        }
        
        // Perform enemy action after a delay
        this.time.delayedCall(800, () => {
            this.performEnemyAction(enemy);
            
            // Process next enemy after a delay
            this.time.delayedCall(800, () => {
                this.processEnemyTurns(index + 1);
            });
        });
    }
    
    /**
     * Perform enemy action
     * @param {object} enemy - The enemy performing the action
     */
    performEnemyAction(enemy) {
        // If enemy has abilities, decide whether to use one
        if (enemy.abilities && enemy.abilities.length > 0 && Math.random() < 0.7) {
            // Choose a random ability
            const abilityId = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
            this.enemyUseAbility(enemy, abilityId);
        } else {
            // Default to basic attack
            this.enemyAttack(enemy);
        }
    }
    
    /**
     * Handle enemy attack
     * @param {object} enemy - The attacking enemy
     */
    enemyAttack(enemy) {
        // Get player stats
        const player = gameState.player;
        
        // Calculate base damage
        let damage = enemy.damage || 5;
        
        // Add random variation
        damage += Math.floor(Math.random() * 3) - 1;
        
        // Apply level scaling
        const enemyLevel = enemy.level || 1;
        damage += Math.floor(enemyLevel * 0.3);
        
        // Check if player is defending
        if (this.combatState.playerDefending) {
            damage = Math.floor(damage * 0.5);
            this.addToCombatLog('You are defending and take reduced damage!');
        }
        
        // Apply damage reduction from armor if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.armor) {
            const damageReduction = player.inventory.equipped.armor.defense || 0;
            damage = Math.max(1, damage - damageReduction);
        }
        
        // Apply damage
        player.health = Math.max(0, player.health - damage);
        
        // Play attack animation and sound
        this.playEnemyAttackAnimation(enemy);
        this.safePlaySound('enemy-hit-sound');
        
        // Update player health display
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
        
        // Add to combat log
        this.addToCombatLog(`${enemy.name} attacks you for ${damage} damage!`);
        
        // Check if player defeated
        if (player.health <= 0) {
            this.playerDefeated();
        }
    }
    
    /**
     * Handle victory
     */
    handleVictory() {
        // Play victory sound
        this.safePlaySound('victory-sound');
        
        // Calculate rewards
        const expGained = this.enemies.reduce((total, enemy) => total + (enemy.expValue || enemy.level * 10), 0);
        const goldGained = this.enemies.reduce((total, enemy) => total + (enemy.goldValue || enemy.level * 5), 0);
        
        // Add rewards to player
        gameState.player.experience += expGained;
        gameState.player.gold += goldGained;
        
        // Check for level up
        const didLevelUp = gameState.player.experience >= gameState.player.experienceToNextLevel;
        
        // Determine if this was a boss encounter
        const isBoss = gameState.currentEncounter && gameState.currentEncounter.type === 'boss';
        
        // Store combat results
        gameState.combatResults = {
            victory: true,
            expGained: expGained,
            goldGained: goldGained,
            levelUp: didLevelUp,
            isBoss: isBoss,
            itemsFound: [] // TODO: Implement item drops
        };
        
        // Show victory message
        this.addToCombatLog("Victory! You defeated all enemies.");
        
        // Use fade transition to combat result scene after a short delay
        this.time.delayedCall(2000, () => {
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'CombatResultScene');
            });
        });
    }
    
    /**
     * Handle defeat
     */
    handleDefeat() {
        console.log('Defeat!');
        
        // Store defeat result for the result scene
        gameState.combatResult = {
            outcome: 'defeat',
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
     * Show a message to the player
     */
    showMessage(message, callback) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for all message elements
        const messageContainer = this.add.container(0, 0);
        
        // Create panel background
        const panel = this.ui.createPanel(
            this,
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
    
    /**
     * Add message to combat log
     * @param {string} message - The message to add to the combat log
     */
    addToCombatLog(message) {
        // Create new text object for the log entry
        const newEntry = this.add.text(0, 0, message, {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            wordWrap: { width: this.combatLogBg.width * 0.8 }
        }).setOrigin(0.5, 0);
        
        // Add to our array of log entries
        this.logEntries.push(newEntry);
        this.combatLogContainer.add(newEntry);
        
        // If we have too many entries, remove the oldest
        if (this.logEntries.length > this.maxLogEntries) {
            const oldestEntry = this.logEntries.shift();
            oldestEntry.destroy();
        }
        
        // Position all entries
        this.updateCombatLogPositions();
        
        console.log(`Combat Log: ${message}`);
    }
    
    /**
     * Update positions of all combat log entries
     */
    updateCombatLogPositions() {
        const startY = -this.combatLogBg.height * 0.3;
        const spacing = 20;
        
        this.logEntries.forEach((entry, index) => {
            entry.setPosition(0, startY + (index * spacing));
        });
    }
    
    /**
     * Play attack animation
     * @param {object} target - The target of the attack
     */
    playAttackAnimation(target) {
        // Find the target's sprite
        let targetSprite;
        
        if (target && target.displayElements && target.displayElements.sprite) {
            // If the target has display elements with a sprite, use that
            targetSprite = target.displayElements.sprite;
        } else if (this.enemySprites && this.enemySprites.length > 0) {
            // Fallback to the first enemy sprite if available
            targetSprite = this.enemySprites[0];
        } else {
            // If no sprite can be found, log and return
            console.log('Cannot play attack animation: no valid target sprite found');
            return;
        }
        
        // Create slash effect
        const slash = this.add.image(
            targetSprite.x, 
            targetSprite.y,
            'slash-effect'
        ).setScale(0.8);
        
        // Flash the target red
        this.tweens.add({
            targets: targetSprite,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
        });
        
        // Animate the slash
        this.tweens.add({
            targets: slash,
            angle: 360,
            alpha: { from: 1, to: 0 },
            scale: 1.2,
            duration: 500,
            onComplete: () => {
                slash.destroy();
            }
        });
    }
    
    /**
     * Play heal animation
     * @param {object} target - The target being healed
     */
    playHealAnimation(target) {
        // Create heal effect
        const healEffect = this.add.image(
            this.playerSprite.x, 
            this.playerSprite.y,
            'heal-effect'
        ).setScale(0.8).setAlpha(0.8);
        
        // Animate the heal effect
        this.tweens.add({
            targets: healEffect,
            y: this.playerSprite.y - 50,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                healEffect.destroy();
            }
        });
        
        // Flash the target green
        this.tweens.add({
            targets: this.playerSprite,
            tint: 0x00ff00,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
    }
    
    /**
     * Safe sound play method that won't crash if sound is missing
     * @param {string} key - The sound key to play
     * @param {object} config - Optional sound config
     */
    safePlaySound(key, config = {}) {
        try {
            // Try to play the sound with the provided key
            if (this.sound.get(key)) {
                this.sound.play(key, config);
                return true;
            }
            
            // If that fails, try without the -sound suffix
            const altKey = key.replace('-sound', '');
            if (altKey !== key && this.sound.get(altKey)) {
                this.sound.play(altKey, config);
                return true;
            }
            
            // If that fails too, try with the -sound suffix
            const altKey2 = key + '-sound';
            if (this.sound.get(altKey2)) {
                this.sound.play(altKey2, config);
                return true;
            }
            
            console.log(`Sound not found: ${key}`);
            return false;
        } catch (error) {
            console.log(`Error playing sound ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Play enemy attack animation
     * @param {object} enemy - The enemy performing the attack
     */
    playEnemyAttackAnimation(enemy) {
        if (!enemy || !enemy.displayElements || !enemy.displayElements.sprite) {
            console.log('Cannot play enemy attack animation: enemy or sprite not found');
            return;
        }
        
        // Move enemy toward player and back
        this.tweens.add({
            targets: enemy.displayElements.sprite,
            x: { from: enemy.displayElements.sprite.x, to: enemy.displayElements.sprite.x - 30 },
            yoyo: true,
            duration: 150,
            ease: 'Power1'
        });
        
        // Flash the player red
        this.tweens.add({
            targets: this.playerSprite,
            tint: 0xff0000,
            duration: 100,
            yoyo: true,
            delay: 100
        });
    }
    
    /**
     * Handle an enemy being defeated
     * @param {object} enemy - The defeated enemy
     */
    enemyDefeated(enemy) {
        // Add to combat log
        this.addToCombatLog(`${enemy.name} has been defeated!`);
        
        // Play defeat animation
        if (enemy.displayElements && enemy.displayElements.sprite) {
            // Fade out the enemy sprite
            this.tweens.add({
                targets: enemy.displayElements.sprite,
                alpha: 0,
                y: enemy.displayElements.sprite.y + 30,
                duration: 800,
                ease: 'Power2'
            });
            
            // Fade out the enemy name and health text
            if (enemy.displayElements.nameText) {
                this.tweens.add({
                    targets: [enemy.displayElements.nameText, enemy.displayElements.healthText],
                    alpha: 0,
                    duration: 800
                });
            }
        }
        
        // Mark as defeated
        enemy.defeated = true;
        
        // Check if all enemies are defeated
        const allDefeated = this.enemies.every(e => e.defeated || e.health <= 0);
        
        if (allDefeated) {
            // Delay victory to allow defeat animation to play
            this.time.delayedCall(1000, () => {
                this.handleVictory();
            });
        } else {
            // Continue to next enemy turn
            this.time.delayedCall(1000, () => {
                this.startEnemyTurn();
            });
        }
    }
    
    /**
     * Handle enemy using an ability
     * @param {object} enemy - The enemy using the ability
     * @param {string} abilityId - The ID of the ability to use
     */
    enemyUseAbility(enemy, abilityId) {
        // Get ability data
        const ability = getAbilityData(abilityId);
        if (!ability) {
            // Fallback to basic attack if ability not found
            this.enemyAttack(enemy);
            return;
        }
        
        // Process ability based on type
        switch (ability.type) {
            case 'damage':
                this.processEnemyDamageAbility(enemy, ability);
                break;
                
            case 'heal':
                this.processEnemyHealAbility(enemy, ability);
                break;
                
            case 'buff':
                this.processEnemyBuffAbility(enemy, ability);
                break;
                
            case 'debuff':
                this.processEnemyDebuffAbility(enemy, ability);
                break;
                
            default:
                this.addToCombatLog(`${enemy.name} used ${ability.name}!`);
                break;
        }
    }
    
    /**
     * Process an enemy damage ability
     * @param {object} enemy - The enemy using the ability
     * @param {object} ability - The ability data
     */
    processEnemyDamageAbility(enemy, ability) {
        // Get player stats
        const player = gameState.player;
        
        // Calculate damage
        let damage = ability.baseDamage || enemy.damage || 5;
        
        // Add level scaling
        const enemyLevel = enemy.level || 1;
        damage += Math.floor(enemyLevel * 0.3);
        
        // Check if player is defending
        if (this.combatState && this.combatState.playerDefending) {
            damage = Math.floor(damage * 0.5);
            this.addToCombatLog('You are defending and take reduced damage!');
        }
        
        // Apply damage reduction from armor if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.armor) {
            const damageReduction = player.inventory.equipped.armor.defense || 0;
            damage = Math.max(1, damage - damageReduction);
        }
        
        // Apply damage
        player.health = Math.max(0, player.health - damage);
        
        // Update player health display
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
        
        // Play appropriate animation and sound
        this.playEnemyAttackAnimation(enemy);
        this.safePlaySound(`${ability.soundKey || 'enemy-attack'}-sound`);
        
        // Add to combat log
        this.addToCombatLog(`${enemy.name} used ${ability.name} for ${damage} damage!`);
        
        // Apply status effect if ability has one
        if (ability.statusEffect) {
            this.applyStatusEffectToTarget(player, ability.statusEffect);
            this.addToCombatLog(`You are afflicted with ${ability.statusEffect.type}!`);
        }
        
        // Check if player defeated
        if (player.health <= 0) {
            this.handleDefeat();
            return;
        }
        
        // Continue to next enemy or end turn
        this.processNextEnemyOrEndTurn();
    }
}

export default EncounterScene;
