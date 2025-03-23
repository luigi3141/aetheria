import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import { getEnemyData, getAbilityData } from '../data/enemies.js';
import UIManager from '../ui/UIManager.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { generateLoot, applyStatusEffect } from '../data/enemies.js';
import HealthManager from '../utils/HealthManager.js';

/**
 * EncounterScene - Scene for encountering enemies and deciding to fight or retreat
 */
class EncounterScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EncounterScene' });
    }

    /**
     * Initialize scene - this runs before create() and can be used to reset state
     */
    init() {
        // Reset all combat flags and state
        this.victoryHandled = false;
        this.victoryTransitionStarted = false;
        this.combatEnded = false;
        
        // Clear any existing timers or tweens
        if (this.tweens) {
            this.tweens.killAll();
        }
        
        if (this.time && this.time.removeAllEvents) {
            this.time.removeAllEvents();
        }
        
        // Reset UI elements references
        this.actionButtons = null;
        this.combatLogContainer = null;
        this.combatLogText = null;
        
        console.log('EncounterScene initialized with fresh state');
    }

    preload() {
        // Detect GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        console.log(`Running on GitHub Pages: ${isGitHubPages}`);
        
        // Add a consistent base path for all assets
        // This works both locally and on GitHub Pages without modifications
        const getPath = (path) => {
            // Just use the relative path as-is, which works in both environments
            return path;
        };
        
        // Debug asset loading
        console.log(`Loading sprites from path: ${getPath('assets/sprites/enemies/wolf-sprite.png')}`);
        
        // Load encounter assets
        this.load.image('combat-bg', getPath('assets/sprites/backgrounds/combat-bg.png'));
        
        // Load effect sprites
        this.load.image('slash-effect', getPath('assets/sprites/effects/slash.png'));
        this.load.image('fire-effect', getPath('assets/sprites/effects/fire.png'));
        this.load.image('ice-effect', getPath('assets/sprites/effects/ice.png'));
        this.load.image('arcane-effect', getPath('assets/sprites/effects/arcane.png'));
        this.load.image('poison-effect', getPath('assets/sprites/effects/poison.png'));
        this.load.image('bleed-effect', getPath('assets/sprites/effects/bleed.png'));
        this.load.image('stun-effect', getPath('assets/sprites/effects/stun.png'));
        this.load.image('heal-effect', getPath('assets/sprites/effects/heal.png'));
        this.load.image('shield-effect', getPath('assets/sprites/effects/shield.png'));
        this.load.image('crystal-effect', getPath('assets/sprites/effects/crystal.png'));
        this.load.image('ghost-effect', getPath('assets/sprites/effects/ghost.png'));
        
        // Load enemy sprites
        this.load.image('goblin-sprite', getPath('assets/sprites/enemies/goblin-sprite.png'));
        this.load.image('wolf-sprite', getPath('assets/sprites/enemies/wolf-sprite.png'));
        this.load.image('mushroom-sprite', getPath('assets/sprites/enemies/mushroom-sprite.png'));
        this.load.image('bat-sprite', getPath('assets/sprites/enemies/bat-sprite.png'));
        this.load.image('skeleton-sprite', getPath('assets/sprites/enemies/skeleton-sprite.png'));
        this.load.image('slime-sprite', getPath('assets/sprites/enemies/slime-sprite.png'));
        this.load.image('spider-sprite', getPath('assets/sprites/enemies/spider-sprite.png'));
        this.load.image('ghost-sprite', getPath('assets/sprites/enemies/ghost-sprite.png'));
        this.load.image('golem-sprite', getPath('assets/sprites/enemies/golem-sprite.png'));
        this.load.image('dragon-sprite', getPath('assets/sprites/enemies/dragon-sprite.png'));
        this.load.image('default-enemy', getPath('assets/sprites/enemies/default-enemy.png'));
        
        // Load player sprites
        this.load.image('default-player', getPath('assets/sprites/characters/default-player.png'));
        this.load.image('warrior-sprite', getPath('assets/sprites/characters/warrior-sprite.png'));
        this.load.image('mage-sprite', getPath('assets/sprites/characters/mage-sprite.png'));
        this.load.image('rogue-sprite', getPath('assets/sprites/characters/rogue-sprite.png'));
        this.load.image('cleric-sprite', getPath('assets/sprites/characters/cleric-sprite.png'));
        
        // Load audio - only load essential sounds to prevent missing file errors
        this.load.audio('attack-sound', getPath('assets/audio/attack.mp3'));
        this.load.audio('enemy-hit-sound', getPath('assets/audio/enemy-hit.mp3'));
        this.load.audio('player-hit-sound', getPath('assets/audio/player-hit.mp3'));
        this.load.audio('heal-sound', getPath('assets/audio/heal.mp3'));
        this.load.audio('defend-sound', getPath('assets/audio/defend.mp3'));
        this.load.audio('victory-sound', getPath('assets/audio/victory.mp3'));
        
        // Add simple error handling that doesn't cause loops
        this.load.on('loaderror', (fileObj) => {
            console.warn(`Error loading asset: ${fileObj.src} - will use fallback if available`);
        });
    }
    
    create(data) {
        // Initialize game state if needed
        if (!gameState.encounters) {
            gameState.encounters = {
                completed: [],
                current: null
            };
        }
        
        // Store scene data
        this.sceneData = data || {};
        
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Check for loading errors and report which sprites failed to load
        const missingTextures = [];
        ['wolf-sprite', 'goblin-sprite', 'skeleton-sprite', 'slime-sprite', 'default-enemy'].forEach(key => {
            if (!this.textures.exists(key)) {
                missingTextures.push(key);
            }
        });
        
        if (missingTextures.length > 0) {
            console.warn(`Failed to load textures: ${missingTextures.join(', ')}`);
        }
        
        // Show all available textures
        console.log('Complete texture list:', Object.keys(this.textures.list).filter(key => 
            !key.startsWith('__') && key !== 'displaylist'
        ));
        
        // Create default-enemy texture if missing for fallback
        if (!this.textures.exists('default-enemy')) {
            console.log('Creating default-enemy texture as fallback');
            // Create a simple colored rectangle as fallback
            const graphics = this.make.graphics();
            graphics.fillStyle(0xff0000);
            graphics.fillRect(0, 0, 32, 32);
            graphics.lineStyle(2, 0xffffff);
            graphics.strokeRect(0, 0, 32, 32);
            graphics.generateTexture('default-enemy', 32, 32);
            graphics.destroy();
        }
        
        // Initialize UI manager
        this.ui = new UIManager(this);
        this.transitions = new TransitionManager(this);
        
        // Initialize combat state
        this.combatState = {
            turn: 'player',
            round: 1,
            log: [],
            enemyDefeated: false,
            activeStatusEffects: {
                player: [],
                enemies: []
            },
            abilityCooldowns: {
                player: {},
                enemies: {}
            }
        };
        
        // Add background
        this.add.image(width/2, height/2, 'combat-bg').setDisplaySize(width, height);
        
        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Get combat data from gameState
        const combatData = gameState.combatData || {};
        this.enemies = combatData.enemies || [];
        this.isBoss = combatData.isBoss || false;
        
        // Ensure player stats are properly initialized
        HealthManager.validatePlayerHealth();
        
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
     * Create the enemy display
     */
    createEnemyDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get the enemy
        const enemy = this.enemies[0];
        
        // Debug enemy object
        console.log('Enemy data:', {
            name: enemy.name,
            sprite: enemy.sprite,
            level: enemy.level
        });
        
        // Check for AssetHelper (part of your architecture improvements)
        const assetConfig = this.scene.scene.sys.game.registry.get('assetConfig');
        const AssetHelper = assetConfig ? assetConfig.AssetHelper : null;
        console.log('AssetHelper available:', !!AssetHelper);
        
        // Determine sprite key to use
        let spriteKey = enemy.sprite || 'default-enemy';
        console.log('Initial sprite key from enemy:', spriteKey);
        
        // Log all available texture keys
        console.log('Available texture keys:', Object.keys(this.textures.list).filter(key => 
            !key.startsWith('__') && key !== 'displaylist'
        ));
        
        // SOLUTION: Use placeholder sprites from DungeonScene which are already loaded
        // This ensures something displays correctly
        if (!this.textures.exists(spriteKey)) {
            console.warn(`Sprite key "${spriteKey}" not found in texture cache, trying alternatives...`);
            
            // Map enemy sprites to dungeon placeholders that we know are loaded
            const placeholderMap = {
                'wolf-sprite': 'dungeon-wolf-placeholder',
                'spider-sprite': 'dungeon-spider-placeholder',
                'bandit-sprite': 'dungeon-bandit-placeholder',
                'alpha-wolf-sprite': 'dungeon-alpha-wolf-placeholder'
            };
            
            // Check if we have a matching placeholder
            if (placeholderMap[spriteKey]) {
                spriteKey = placeholderMap[spriteKey];
                console.log(`Using placeholder sprite: ${spriteKey}`);
            }
            // Try without -sprite suffix
            else if (spriteKey.endsWith('-sprite') && this.textures.exists(spriteKey.replace('-sprite', ''))) {
                spriteKey = spriteKey.replace('-sprite', '');
                console.log(`Using key without -sprite suffix: ${spriteKey}`);
            }
            // Use player-icon as a final fallback (which is definitely loaded)
            else {
                console.warn('No suitable fallback found, using player-icon as emergency fallback');
                spriteKey = 'player-icon';
            }
        }
        
        // Final sprite key to use
        console.log(`Final sprite key: "${spriteKey}"`);
        
        // Create enemy sprite with final key
        const enemySprite = this.add.sprite(
            width * 0.75,
            height * 0.4,
            spriteKey
        );
        
        // Double-check that the sprite was created successfully
        console.log('Enemy sprite created:', {
            key: enemySprite.texture.key,
            width: enemySprite.width,
            height: enemySprite.height
        });
        
        // Scale sprite appropriately
        const scale = enemy.scale || 2.0;
        enemySprite.setScale(scale);
        
        // Add enemy name
        const nameText = this.add.text(
            width * 0.75,
            height * 0.25,
            enemy.name,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create health bar
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = width * 0.75;
        const healthBarY = height * 0.3;
        
        // Create health bar background
        const healthBarBg = this.add.rectangle(
            healthBarX,
            healthBarY,
            healthBarWidth,
            healthBarHeight,
            0x333333
        ).setOrigin(0.5);
        
        // Create health bar foreground
        const healthBar = this.add.graphics();
        
        // Draw initial health bar
        const healthPercentage = enemy.health / enemy.maxHealth;
        healthBar.fillStyle(0xff0000, 1);
        healthBar.fillRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
        
        // Add border
        const healthBarBorder = this.add.graphics();
        healthBarBorder.lineStyle(2, 0xffffff, 1);
        healthBarBorder.strokeRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth,
            healthBarHeight
        );
        
        // Add health text
        const healthText = this.add.text(
            healthBarX,
            healthBarY,
            `${enemy.health}/${enemy.maxHealth}`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create status effect container
        const statusContainer = this.add.container(
            width * 0.75,
            height * 0.35
        );
        
        // Store display elements with the enemy
        enemy.displayElements = {
            sprite: enemySprite,
            nameText: nameText,
            healthBar: {
                bg: healthBarBg,
                bar: healthBar,
                border: healthBarBorder,
                x: healthBarX - healthBarWidth / 2,
                y: healthBarY - healthBarHeight / 2,
                width: healthBarWidth,
                height: healthBarHeight,
                color: 0xff0000
            },
            healthText: healthText,
            statusContainer: statusContainer
        };
        
        // Add a slight bobbing animation to make the enemy sprite feel alive
        this.tweens.add({
            targets: enemySprite,
            y: enemySprite.y + 8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Update a health bar
     * @param {object} healthBar - The health bar object
     * @param {number} currentHealth - Current health value
     * @param {number} maxHealth - Maximum health value
     */
    updateHealthBar(healthBar, currentHealth, maxHealth) {
        if (!healthBar || !healthBar.bar) return;
        
        // Ensure health doesn't exceed maximum
        currentHealth = Math.min(currentHealth, maxHealth);
        
        // Calculate percentage
        const percentage = Math.max(0, Math.min(currentHealth / maxHealth, 1));
        
        // Clear previous graphics
        healthBar.bar.clear();
        
        // Draw new health bar
        healthBar.bar.fillStyle(healthBar.color, 1);
        healthBar.bar.fillRect(
            healthBar.x, 
            healthBar.y, 
            healthBar.width * percentage, 
            healthBar.height
        );
    }
    
    /**
     * Update a mana bar
     * @param {object} manaBar - The mana bar object
     * @param {number} currentMana - Current mana value
     * @param {number} maxMana - Maximum mana value
     */
    updateManaBar(manaBar, currentMana, maxMana) {
        if (!manaBar || !manaBar.bar) return;
        
        // Ensure values are valid numbers
        currentMana = Number(currentMana) || 0;
        maxMana = Number(maxMana) || 1;
        
        // Ensure mana doesn't exceed maximum
        currentMana = Math.max(0, Math.min(currentMana, maxMana));
        
        // Calculate percentage
        const percentage = maxMana > 0 ? currentMana / maxMana : 0;
        
        // Clear previous graphics
        manaBar.bar.clear();
        
        // Draw new mana bar
        manaBar.bar.fillStyle(manaBar.color, 1);
        manaBar.bar.fillRect(
            manaBar.x, 
            manaBar.y, 
            manaBar.width * percentage, 
            manaBar.height
        );
        
        // Log the update for debugging
        console.log(`Updating mana bar: ${currentMana}/${maxMana} (${Math.round(percentage * 100)}%)`);
    }
    
    /**
     * Create the combat UI for turn-based combat
     */
    createCombatUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create combat log container
        this.createCombatLog();
        
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
        this.playerSprite = this.add.sprite(
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
        
        // Add player mana bar
        const playerMana = gameState.player.mana !== undefined ? gameState.player.mana : 100;
        const playerMaxMana = gameState.player.maxMana || 100;
        this.playerManaText = this.add.text(width * 0.25, height * 0.35, `MP: ${playerMana}/${playerMaxMana}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.playerManaBar = this.makeManaBar(width * 0.25, height * 0.35, 150, 15, 0x0066ff);
        this.updateManaBar(this.playerManaBar, playerMana, playerMaxMana);
        
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
        this.createEnemyDisplay();
        
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
     * Create a mana bar
     */
    makeManaBar(x, y, width, height, color) {
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
        const { difficulty, difficultyColor } = this.calculateDifficulty();
        
        // Create description panel
        this.ui.createPanel(
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
        
        // Enemy description - simplified for single enemy combat
        const enemy = this.enemies[0];
        const enemyText = `You've encountered a ${enemy.name}!`;
        
        // Create description text
        this.add.text(width/2, height * 0.58, enemyText, {
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
        if (relativeDifficulty < 0.8) return { difficulty: 'Easy', difficultyColor: '#00ff00' };
        if (relativeDifficulty < 1.2) return { difficulty: 'Moderate', difficultyColor: '#ffff00' };
        if (relativeDifficulty < 1.8) return { difficulty: 'Challenging', difficultyColor: '#ff9900' };
        return { difficulty: 'Dangerous', difficultyColor: '#ff0000' };
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
        this.createCombatLog();
        
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
        this.playerSprite = this.add.sprite(
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
        
        // Add player mana bar
        const playerMana = gameState.player.mana !== undefined ? gameState.player.mana : 100;
        const playerMaxMana = gameState.player.maxMana || 100;
        this.playerManaText = this.add.text(width * 0.25, height * 0.35, `MP: ${playerMana}/${playerMaxMana}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.playerManaBar = this.makeManaBar(width * 0.25, height * 0.35, 150, 15, 0x0066ff);
        this.updateManaBar(this.playerManaBar, playerMana, playerMaxMana);
        
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
        this.createEnemyDisplay();
        
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
     * Create combat action buttons
     */
    createCombatActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create container for action buttons
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
                height: 40,
                backgroundColor: 0xaa0000
            }
        );
        
        // Create special ability button
        this.actionButtons.ability = new Button(
            this,
            width * 0.5,
            height * 0.8,
            'SPECIAL',
            () => {
                this.playerUseSpecialAbility();
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0x9900cc
            }
        );
        
        // Create retreat button
        this.actionButtons.retreat = new Button(
            this,
            width * 0.75,
            height * 0.8,
            'RETREAT',
            () => {
                this.handleRetreat();
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0x555555
            }
        );
        
        // Create item button (if inventory system is implemented)
        if (gameState.player.inventory && gameState.player.inventory.items && gameState.player.inventory.items.length > 0) {
            this.actionButtons.item = new Button(
                this,
                width * 0.9,
                height * 0.8,
                'ITEM',
                () => {
                    // Show item menu
                    this.showItemMenu();
                },
                {
                    width: 120,
                    height: 40,
                    backgroundColor: 0x339933
                }
            );
        }
    }

    /**
     * Handle player attack action
     */
    playerAttack() {
        // Check if combat is already over
        if (this.combatState.enemyDefeated || this.victoryHandled || this.combatEnded) {
            console.log("Combat already ended, ignoring attack");
            return;
        }
        
        // Disable action buttons during animation
        this.updateActionButtons(false);
        
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        const playerStr = player.strength || 10;
        
        // Select target (for now just pick first enemy)
        const target = this.enemies[0];
        
        // Check if target is already defeated
        if (target.defeated || target.health <= 0) {
            console.log("Target already defeated, ignoring attack");
            this.updateActionButtons(true);
            return;
        }
        
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
        
        // Update enemy health display
        if (target.displayElements) {
            this.updateHealthBar(target.displayElements.healthBar, target.health, target.maxHealth);
            target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
        }
        
        // Play attack animation and sound
        this.playAttackAnimation(target);
        this.safePlaySound('attack-sound');
        
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
     * @param {string} abilityId - ID of the ability to use
     */
    playerUseAbility(abilityId) {
        console.log(`Player using ability: ${abilityId}`);
        
        // Disable action buttons during ability execution
        this.updateActionButtons(false);
        
        // Get ability data
        const ability = getAbilityData(abilityId);
        
        if (!ability) {
            console.warn(`Ability not found: ${abilityId}`);
            this.addToCombatLog("That ability isn't available.");
            this.updateActionButtons(true);
            return;
        }
        
        // Process ability based on type
        switch (ability.type) {
            case 'attack':
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
                console.warn(`Unknown ability type: ${ability.type}`);
                this.addToCombatLog("Unable to use that ability.");
                this.updateActionButtons(true);
                break;
        }
        
        // Update mana display
        if (this.playerManaText) {
            const player = gameState.player;
            this.playerManaText.setText(`MP: ${player.mana}/${player.maxMana || 100}`);
        }
        if (this.playerManaBar) {
            const mana = gameState.player.mana !== undefined ? gameState.player.mana : 0;
            const maxMana = gameState.player.maxMana || 100;
            this.updateManaBar(this.playerManaBar, mana, maxMana);
        }
    }
    
    /**
     * Process a player damage ability
     * @param {object} ability - The ability data
     */
    processPlayerDamageAbility(ability) {
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        
        // Determine targets - in our simplified system, we only have one enemy
        const target = this.enemies[0];
        
        // Base damage calculation based on player strength
        const baseAttack = Math.floor((player.strength || 10) * 0.8) + Math.floor(Math.random() * 6) + 1;
        
        // Apply ability damage multiplier
        let damage = Math.floor(baseAttack * (ability.damageMultiplier || 1.0));
        
        // Add level scaling
        damage += Math.floor(playerLevel * 0.3);
        
        // Apply weapon damage if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.weapon) {
            damage += player.inventory.equipped.weapon.damage || 0;
        }
        
        // Check for multiple hits
        const hits = ability.hits || 1;
        let totalDamage = 0;
        
        for (let i = 0; i < hits; i++) {
            // Apply small random variation for each hit
            const hitDamage = Math.floor(damage * (0.9 + Math.random() * 0.2));
            totalDamage += hitDamage;
            
            // For multi-hit abilities, log each hit
            if (hits > 1) {
                this.addToCombatLog(`Hit ${i+1}: ${hitDamage} damage`);
            }
        }
        
        // Apply damage
        target.health = Math.max(0, target.health - totalDamage);
        
        // Update enemy health display
        if (target.displayElements) {
            this.updateHealthBar(target.displayElements.healthBar, target.health, target.maxHealth);
            target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
        }
        
        // Add to combat log
        this.addToCombatLog(`You used ${ability.name} on ${target.name} for ${totalDamage} damage!`);
        
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
        } else {
            // Continue to enemy turn after a delay if enemy is still alive
            this.time.delayedCall(1500, () => {
                this.startEnemyTurn();
            });
        }
    }
    
    /**
     * Process a player healing ability
     * @param {object} ability - The ability data
     */
    processPlayerHealAbility(ability) {
        // Get player stats
        const player = gameState.player;
        const playerLevel = player.level || 1;
        
        // Calculate healing amount
        let healAmount = ability.healAmount || 10;
        
        // Add attribute scaling
        if (ability.scaling) {
            const attribute = ability.scaling.attribute || 'intelligence';
            const scale = ability.scaling.factor || 0.5;
            // Use a default value of 10 if the attribute doesn't exist
            const attributeValue = player[attribute] || 10;
            healAmount += Math.floor(attributeValue * scale);
        }
        
        // Add level scaling
        healAmount += Math.floor(playerLevel * 0.5);
        
        // Apply healing
        const oldHealth = player.health;
        player.health = Math.min(player.maxHealth, player.health + healAmount);
        const actualHealing = player.health - oldHealth;
        
        // Play heal animation and sound
        this.playHealAnimation(this.playerSprite);
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
     * Start combat sequence
     */
    startCombat() {
        // If no enemies provided, generate random ones
        if (!this.enemies || this.enemies.length === 0) {
            this.enemies = this.generateRandomEnemies();
        }
        
        // Display enemies
        this.createEnemyDisplay();
        
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
        
        // Process status effects
        this.processStatusEffects(gameState.player, 'player');
        
        // Update action buttons
        this.updateActionButtons(true);
        
        // Add to combat log
        this.addToCombatLog('Your turn!');
    }
    
    /**
     * Start enemy turn
     */
    startEnemyTurn() {
        // Check if all enemies are defeated
        if (this.enemies.every(enemy => enemy.defeated || enemy.health <= 0)) {
            // If all enemies are defeated, handle victory
            this.handleVictory();
            return;
        }
        
        // Add to combat log
        this.addToCombatLog("Enemy turn!");
        
        // Process enemy turns
        this.processEnemyTurns(0);
    }
    
    /**
     * Process enemy turns one by one
     * @param {number} index - Current enemy index
     */
    processEnemyTurns(index) {
        // Check if there are enemies left to process
        if (index >= this.enemies.length) {
            // All enemies have taken their turn, go back to player
            this.time.delayedCall(1000, () => {
                this.startPlayerTurn();
            });
            return;
        }
        
        // Get the current enemy
        const enemy = this.enemies[index];
        
        // Skip defeated enemies
        if (enemy.defeated || enemy.health <= 0) {
            this.processEnemyTurns(index + 1);
            return;
        }
        
        // Process enemy turn
        this.performEnemyAction(enemy, () => {
            // Move to next enemy after this one's turn is complete
            this.processEnemyTurns(index + 1);
        });
    }
    
    /**
     * Perform enemy action
     * @param {object} enemy - The enemy performing the action
     * @param {function} callback - Function to call when action is complete
     */
    performEnemyAction(enemy, callback) {
        // Process enemy status effects
        const statusResults = this.processStatusEffects(enemy, 'enemy');
        
        // Add status effect results to combat log
        if (statusResults.effects.length > 0) {
            this.addToCombatLog(`Status effects on ${enemy.name}: ${statusResults.effects.join(', ')}`);
        }
        
        // Check if enemy is stunned
        const isStunned = enemy.statusEffects && enemy.statusEffects.some(effect => effect.type === 'stun');
        
        if (isStunned) {
            this.addToCombatLog(`${enemy.name} is stunned and skips their turn!`);
            this.time.delayedCall(800, callback);
            return;
        }
        
        // If enemy has abilities, decide whether to use one
        if (enemy.abilities && enemy.abilities.length > 0 && Math.random() < 0.7) {
            // Choose a random ability
            const abilityId = enemy.abilities[Math.floor(Math.random() * enemy.abilities.length)];
            this.enemyUseAbility(enemy, abilityId, callback);
        } else {
            // Default to basic attack
            this.enemyAttack(enemy, callback);
        }
    }
    
    /**
     * Handle enemy attack
     * @param {object} enemy - The attacking enemy
     * @param {function} callback - Function to call when action is complete
     */
    enemyAttack(enemy, callback) {
        // Get player stats
        const player = gameState.player;
        
        // Calculate base damage
        let damage = enemy.damage || 5;
        
        // Add random variation
        damage += Math.floor(Math.random() * 3) - 1;
        
        // Apply level scaling
        const enemyLevel = enemy.level || 1;
        damage += Math.floor(enemyLevel * 0.3);
        
        // Apply damage reduction from armor if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.armor) {
            const damageReduction = player.inventory.equipped.armor.defense || 0;
            damage = Math.max(1, damage - damageReduction);
        }
        
        // Apply damage using HealthManager
        HealthManager.updatePlayerHealth(-damage, true);
        
        // Update player health display
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
        
        // Play attack animation and sound
        this.playEnemyAttackAnimation(enemy);
        this.safePlaySound('enemy-hit-sound');
        
        // Add to combat log
        this.addToCombatLog(`${enemy.name} attacks you for ${damage} damage!`);
        
        // Check if player defeated
        if (player.health <= 0) {
            this.playerDefeated();
        }
        
        // Call callback to continue to next enemy or end turn
        callback();
    }
    
    /**
     * Handle victory
     */
    handleVictory(enemy) {
        // Play victory sound immediately
        this.safePlaySound('victory-sound', { volume: 0.7 });
        
        // Show "Victory!" text as immediate feedback
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 - 50;
        const victoryText = this.add.text(centerX, centerY, 'Victory!', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true }
        }).setOrigin(0.5).setAlpha(0);
        
        // Animate the victory text
        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            y: centerY - 20,
            scale: 1.2,
            duration: 300,
            ease: 'Power2',
            yoyo: true,
            hold: 400,
            completeDelay: 200
        });
        
        // Play defeat animation with reduced duration
        if (enemy.displayElements && enemy.displayElements.sprite) {
            // Fade out the enemy sprite
            this.tweens.add({
                targets: enemy.displayElements.sprite,
                alpha: 0,
                y: enemy.displayElements.sprite.y + 30,
                duration: 500, // Reduced from 800ms
                ease: 'Power2'
            });
            
            // Fade out the enemy name and health text
            if (enemy.displayElements.nameText) {
                this.tweens.add({
                    targets: [enemy.displayElements.nameText, enemy.displayElements.healthText],
                    alpha: 0,
                    duration: 500 // Reduced from 800ms
                });
            }
        }
        
        // Process victory after a shorter delay
        this.time.delayedCall(600, () => {
            this.processVictory();
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
        // Calculate loot loss (70% of current loot)
        if (gameState.currentRun && gameState.currentRun.loot) {
            // Calculate gold loss
            const goldLost = Math.floor(gameState.currentRun.loot.gold * 0.7);
            gameState.currentRun.loot.gold -= goldLost;
            
            // Calculate item loss (remove 70% of items randomly)
            if (gameState.currentRun.loot.items && gameState.currentRun.loot.items.length > 0) {
                const itemsToKeep = Math.ceil(gameState.currentRun.loot.items.length * 0.3);
                gameState.currentRun.loot.items = gameState.currentRun.loot.items
                    .sort(() => Math.random() - 0.5) // Shuffle
                    .slice(0, itemsToKeep); // Keep only 30%
            }
            
            this.addToCombatLog(`You retreat from combat, losing 70% of your loot!`);
        } else {
            this.addToCombatLog(`You retreat from combat!`);
        }
        
        // Use fade transition back to dungeon scene
        this.time.delayedCall(1500, () => {
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'DungeonScene');
            });
        });
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
                fillAlpha: 0.7,
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
            fontFamily: "'VT323'",
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        // Add to container
        if (this.combatLogEntries) {
            this.combatLogEntries.add(newEntry);
            
            // Position the new entry at the bottom of the log
            const entries = this.combatLogEntries.getAll();
            const entryHeight = 20;
            
            // Reposition all entries to move them up
            entries.forEach((entry, index) => {
                const y = (entries.length - 1 - index) * entryHeight;
                entry.setPosition(10, y);
                
                // Fade out older entries
                const alpha = Math.max(0.5, 1 - (entries.length - 1 - index) * 0.15);
                entry.setAlpha(alpha);
            });
            
            // If we have too many entries, remove the oldest ones
            const maxEntries = 8;
            if (entries.length > maxEntries) {
                for (let i = 0; i < entries.length - maxEntries; i++) {
                    entries[i].destroy();
                }
            }
        } else {
            console.warn('Combat log container not initialized yet');
        }
        
        // Log to console as well
        console.log('Combat Log:', message);
    }
    
    /**
     * Create the combat log
     */
    createCombatLog() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a container for the combat log
        this.combatLogContainer = this.add.container(width * 0.5, height * 0.55);
        
        // Create the background for the combat log
        this.combatLogBg = this.add.rectangle(0, 0, width * 0.8, height * 0.2, 0x111111, 0.7);
        this.combatLogBg.setStrokeStyle(2, 0xffcc00);
        this.combatLogContainer.add(this.combatLogBg);
        
        // Create a container for the log entries
        this.combatLogEntries = this.add.container(0, 0);
        this.combatLogContainer.add(this.combatLogEntries);
        
        // Add initial message
        this.addToCombatLog('Combat begins!');
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
            target.x, 
            target.y,
            'heal-effect'
        ).setScale(0.8).setAlpha(0.8);
        
        // Animate the heal effect
        this.tweens.add({
            targets: healEffect,
            y: target.y - 50,
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
            targets: target,
            tint: 0x00ff00,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
    }
    
    /**
     * Safely play a sound, handling cases where the sound might not be loaded
     * @param {string} key - The sound key to play
     */
    safePlaySound(key) {
        try {
            // Check if the sound exists in the cache
            if (this.sound.get(key)) {
                this.sound.play(key, { volume: 0.5 });
            } else {
                console.warn(`Sound ${key} not found in cache`);
            }
        } catch (error) {
            console.warn(`Error playing sound ${key}: ${error.message}`);
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
        // Check if enemy is already defeated to prevent multiple defeat processing
        if (enemy.defeated || this.combatState.enemyDefeated || this.combatEnded) {
            return;
        }
        
        // Add to combat log
        this.addToCombatLog(`${enemy.name} has been defeated!`);
        
        // Mark as defeated
        enemy.defeated = true;
        this.combatState.enemyDefeated = true;
        this.combatEnded = true;
        
        console.log('Enemy defeated, combat ended');
        
        // Disable all action buttons immediately
        this.disableAllButtons();
        
        // Play victory sound immediately
        this.safePlaySound('victory-sound', { volume: 0.7 });
        
        // Calculate rewards based on the single enemy
        const expGained = enemy.expValue || enemy.level * 10;
        const goldGained = enemy.goldValue || enemy.level * 5;
        
        // Generate loot items
        const lootItems = [];
        if (enemy.loot && Array.isArray(enemy.loot)) {
            enemy.loot.forEach(lootItem => {
                // Check if item should drop based on chance
                if (Math.random() <= (lootItem.chance || 0.5)) {
                    lootItems.push(lootItem.item || lootItem);
                }
            });
        }
        
        // Initialize player inventory if it doesn't exist
        if (!gameState.player.inventory) {
            gameState.player.inventory = {
                items: [],
                equipped: {}
            };
        }
        
        // Ensure items array exists
        if (!gameState.player.inventory.items) {
            gameState.player.inventory.items = [];
        }
        
        // Add rewards to player
        gameState.player.experience += expGained;
        gameState.player.gold += goldGained;
        
        // Add loot items to player inventory
        lootItems.forEach(item => {
            gameState.player.inventory.items.push(item);
        });
        
        // Check for level up
        const didLevelUp = gameState.player.experience >= gameState.player.experienceToNextLevel;
        
        // Determine if this was a boss encounter
        const isBoss = gameState.currentEncounter && gameState.currentEncounter.type === 'boss';
        
        // Store combat results
        gameState.combatResult = {
            outcome: 'victory',
            enemy: enemy,
            isBoss: isBoss,
            loot: {
                experience: expGained,
                gold: goldGained,
                items: lootItems
            }
        };
        
        // Show victory message
        this.addToCombatLog("Victory! You defeated the enemy.");
        
        // Set transition flag to prevent multiple transitions
        this.victoryTransitionStarted = true;
        
        // Use fade transition to combat result scene after a short delay
        this.time.delayedCall(2000, () => {
            console.log('Starting transition to CombatResultScene');
            this.transitions.fade(() => {
                navigationManager.navigateTo(this, 'CombatResultScene');
            });
        });
    }
    
    /**
     * Handle enemy using an ability
     * @param {object} enemy - The enemy using the ability
     * @param {string} abilityId - The ID of the ability to use
     * @param {function} callback - Function to call when action is complete
     */
    enemyUseAbility(enemy, abilityId, callback) {
        // Get ability data
        const ability = getAbilityData(abilityId);
        if (!ability) {
            // Fallback to basic attack if ability not found
            this.enemyAttack(enemy, callback);
            return;
        }
        
        // Process ability based on type
        switch (ability.type) {
            case 'damage':
                this.processEnemyDamageAbility(enemy, ability, callback);
                break;
                
            case 'heal':
                this.processEnemyHealAbility(enemy, ability, callback);
                break;
                
            case 'buff':
                this.processEnemyBuffAbility(enemy, ability, callback);
                break;
                
            case 'debuff':
                this.processEnemyDebuffAbility(enemy, ability, callback);
                break;
                
            default:
                this.addToCombatLog(`${enemy.name} used ${ability.name}!`);
                callback();
                break;
        }
    }
    
    /**
     * Process an enemy damage ability
     * @param {object} enemy - The enemy using the ability
     * @param {object} ability - The ability data
     * @param {function} callback - Function to call when action is complete
     */
    processEnemyDamageAbility(enemy, ability, callback) {
        // Get player stats
        const player = gameState.player;
        
        // Calculate damage
        let damage = ability.baseDamage || enemy.damage || 5;
        
        // Add level scaling
        const enemyLevel = enemy.level || 1;
        damage += Math.floor(enemyLevel * 0.3);
        
        // Apply damage reduction from armor if equipped
        if (player.inventory && player.inventory.equipped && player.inventory.equipped.armor) {
            const damageReduction = player.inventory.equipped.armor.defense || 0;
            damage = Math.max(1, damage - damageReduction);
        }
        
        // Apply damage using HealthManager
        HealthManager.updatePlayerHealth(-damage, true);
        
        // Update player health display
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
        
        // Add to combat log
        this.addToCombatLog(`${enemy.name} used ${ability.name} for ${damage} damage!`);
        
        // Apply status effect if ability has one
        if (ability.statusEffect) {
            this.applyStatusEffectToTarget(player, ability.statusEffect);
            this.addToCombatLog(`You are afflicted with ${ability.statusEffect.type}!`);
        }
        
        // Play sound effect
        this.safePlaySound(`${ability.soundKey || 'enemy-attack'}-sound`);
        
        // Check if player defeated
        if (player.health <= 0) {
            this.handleDefeat();
            return;
        }
        
        // Call callback to continue to next enemy or end turn
        callback();
    }
    
    /**
     * Update the action buttons (enable/disable)
     * @param {boolean} enabled - Whether buttons should be enabled
     */
    updateActionButtons(enabled) {
        if (!this.actionButtons) return;
        
        Object.values(this.actionButtons).forEach(button => {
            if (button && typeof button.setInteractive === 'function') {
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
     * Disable all action buttons
     */
    disableAllButtons() {
        // Find all buttons in the scene and disable them
        this.children.list
            .filter(child => child.type === 'Image' && child.texture.key === 'button-background')
            .forEach(button => {
                // Disable the button
                if (button.setInteractive) {
                    button.disableInteractive();
                }
                
                // Dim the button to indicate it's disabled
                this.tweens.add({
                    targets: button,
                    alpha: 0.5,
                    duration: 200
                });
            });
            
        // Also disable ability buttons if they exist
        if (this.abilityButtons) {
            this.abilityButtons.forEach(button => {
                if (button && button.setInteractive) {
                    button.disableInteractive();
                }
                
                // Dim the button
                if (button) {
                    this.tweens.add({
                        targets: button,
                        alpha: 0.5,
                        duration: 200
                    });
                }
            });
        }
        
        // Set a flag to indicate combat is over
        this.combatEnded = true;
    }
    
    /**
     * Play an animation for an ability
     * @param {object} target - The target of the ability
     * @param {object} ability - The ability data
     */
    playAbilityAnimation(target, ability) {
        // Default to slash effect if no specific animation
        let effectKey = 'slash-effect';
        let soundKey = 'attack-sound';
        let color = 0xffffff;
        
        // Determine effect based on ability type or properties
        if (ability.element === 'fire' || ability.name.toLowerCase().includes('fire')) {
            effectKey = 'fire-effect';
            soundKey = 'fire-sound';
            color = 0xff6600;
        } else if (ability.element === 'ice' || ability.name.toLowerCase().includes('ice')) {
            effectKey = 'ice-effect';
            soundKey = 'ice-sound';
            color = 0x66ccff;
        } else if (ability.element === 'arcane' || ability.name.toLowerCase().includes('arcane')) {
            effectKey = 'arcane-effect';
            soundKey = 'magic-sound';
            color = 0xcc66ff;
        } else if (ability.statusEffect && ability.statusEffect.type === 'poison') {
            effectKey = 'poison-effect';
            soundKey = 'poison-sound';
            color = 0x66ff66;
        } else if (ability.statusEffect && ability.statusEffect.type === 'bleed') {
            effectKey = 'bleed-effect';
            soundKey = 'bleed-sound';
            color = 0xff3333;
        }
        
        // Fallback to generic effects if the specific one isn't loaded
        if (!this.textures.exists(effectKey)) {
            effectKey = 'slash-effect';
        }
        
        // Create effect at target position
        try {
            const effect = this.add.image(
                target.x, 
                target.y,
                effectKey
            ).setScale(0.8);
            
            // Animate the effect
            this.tweens.add({
                targets: effect,
                scale: 1.5,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    effect.destroy();
                }
            });
            
            // Flash the target
            this.tweens.add({
                targets: target,
                alpha: 0.5,
                yoyo: true,
                duration: 100,
                repeat: 2
            });
            
            // Shake the target
            this.tweens.add({
                targets: target,
                x: target.x + 10,
                duration: 50,
                yoyo: true,
                repeat: 3,
                onComplete: () => {
                    target.x = target.originalX || target.x;
                }
            });
            
            // Play sound effect
            this.safePlaySound(soundKey);
        } catch (error) {
            console.warn('Error playing ability animation:', error);
        }
    }
    
    /**
     * Create the player display
     */
    createPlayerDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get player data from gameState
        const player = gameState.player;
        
        // Ensure player health and mana values are consistent
        HealthManager.validatePlayerHealth();
        
        // Create player sprite
        const playerSprite = this.add.sprite(
            width * 0.25,
            height * 0.4,
            player.spriteKey || 'player-placeholder'
        );
        
        // Scale sprite appropriately
        playerSprite.setScale(2);
        
        // Add player name
        const nameText = this.add.text(
            width * 0.25,
            height * 0.25,
            player.name || 'Adventurer',
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create health bar
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = width * 0.25;
        const healthBarY = height * 0.3;
        
        // Create health bar background
        const healthBarBg = this.add.rectangle(
            healthBarX,
            healthBarY,
            healthBarWidth,
            healthBarHeight,
            0x333333
        ).setOrigin(0.5);
        
        // Create health bar foreground
        const healthBar = this.add.graphics();
        
        // Draw initial health bar
        const healthPercentage = player.health / player.maxHealth;
        healthBar.fillStyle(0x00ff00, 1);
        healthBar.fillRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
        
        // Add border
        const healthBarBorder = this.add.graphics();
        healthBarBorder.lineStyle(2, 0xffffff, 1);
        healthBarBorder.strokeRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth,
            healthBarHeight
        );
        
        // Add health text
        const healthText = this.add.text(
            healthBarX,
            healthBarY,
            `${player.health}/${player.maxHealth}`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create mana bar
        const manaBarWidth = 200;
        const manaBarHeight = 15;
        const manaBarX = width * 0.25;
        const manaBarY = height * 0.35;
        
        // Create mana bar background
        const manaBarBg = this.add.rectangle(
            manaBarX,
            manaBarY,
            manaBarWidth,
            manaBarHeight,
            0x333333
        ).setOrigin(0.5);
        
        // Create mana bar foreground
        const manaBar = this.add.graphics();
        
        // Draw initial mana bar - ensure we're using the correct mana values
        const manaPercentage = Math.max(0, Math.min(player.mana / (player.maxMana || 1), 1));
        manaBar.fillStyle(0x0066ff, 1);
        manaBar.fillRect(
            manaBarX - manaBarWidth / 2,
            manaBarY - manaBarHeight / 2,
            manaBarWidth * manaPercentage,
            manaBarHeight
        );
        
        // Add border
        const manaBarBorder = this.add.graphics();
        manaBarBorder.lineStyle(2, 0xffffff, 1);
        manaBarBorder.strokeRect(
            manaBarX - manaBarWidth / 2,
            manaBarY - manaBarHeight / 2,
            manaBarWidth,
            manaBarHeight
        );
        
        // Add mana text
        const manaText = this.add.text(
            manaBarX,
            manaBarY,
            `${player.mana}/${player.maxMana}`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Create status effect container
        const statusContainer = this.add.container(
            width * 0.25,
            height * 0.4
        );
        
        // Store display elements
        this.playerDisplayElements = {
            sprite: playerSprite,
            nameText: nameText,
            healthBar: {
                bg: healthBarBg,
                bar: healthBar,
                border: healthBarBorder,
                x: healthBarX - healthBarWidth / 2,
                y: healthBarY - healthBarHeight / 2,
                width: healthBarWidth,
                height: healthBarHeight,
                color: 0x00ff00
            },
            healthText: healthText,
            manaBar: {
                bg: manaBarBg,
                bar: manaBar,
                border: manaBarBorder,
                x: manaBarX - manaBarWidth / 2,
                y: manaBarY - manaBarHeight / 2,
                width: manaBarWidth,
                height: manaBarHeight,
                color: 0x0066ff
            },
            manaText: manaText,
            statusContainer: statusContainer
        };
    }
    
    /**
     * Handle player using their special ability (class-specific attack)
     */
    playerUseSpecialAbility() {
        // Disable action buttons during ability execution
        this.updateActionButtons(false);
        
        // Get player stats and class
        const player = gameState.player;
        const playerClass = player.class || 'Warrior';
        
        // Check if player has enough mana
        const manaCost = 15; // Standard mana cost for special ability
        
        if (player.mana < manaCost) {
            this.addToCombatLog("Not enough mana to use special ability!");
            
            // Shake the ability button to indicate error
            this.tweens.add({
                targets: this.actionButtons.ability,
                x: { from: this.actionButtons.ability.x - 5, to: this.actionButtons.ability.x + 5 },
                duration: 100,
                repeat: 3,
                yoyo: true,
                onComplete: () => {
                    this.actionButtons.ability.x = this.cameras.main.width * 0.5;
                    this.updateActionButtons(true);
                }
            });
            return;
        }
        
        // Consume mana using HealthManager
        HealthManager.consumePlayerManaByPercentage(manaCost / player.maxMana * 100);
        
        // Update mana display
        if (this.playerDisplayElements && this.playerDisplayElements.manaBar) {
            const mana = gameState.player.mana !== undefined ? gameState.player.mana : 0;
            const maxMana = gameState.player.maxMana || 100;
            this.updateManaBar(
                this.playerDisplayElements.manaBar, 
                mana, 
                maxMana
            );
            
            // Also update the mana text
            if (this.playerDisplayElements.manaText) {
                this.playerDisplayElements.manaText.setText(`${mana}/${maxMana}`);
            }
        }
        
        if (this.playerManaText) {
            const player = gameState.player;
            this.playerManaText.setText(`MP: ${player.mana}/${player.maxMana}`);
        }
        if (this.playerManaBar) {
            const mana = gameState.player.mana !== undefined ? gameState.player.mana : 0;
            const maxMana = gameState.player.maxMana || 100;
            this.updateManaBar(this.playerManaBar, mana, maxMana);
        }
        
        // Get the appropriate ability based on player class
        let abilityId;
        switch (playerClass) {
            case 'Warrior':
                abilityId = 'cleave';
                break;
            case 'Mage':
                abilityId = 'fireball';
                break;
            case 'Rogue':
                abilityId = 'backstab';
                break;
            case 'Cleric':
                abilityId = 'smite';
                break;
            default:
                abilityId = 'cleave';
                break;
        }
        
        // Get ability data
        const ability = getAbilityData(abilityId);
        
        if (!ability) {
            console.warn(`Ability not found: ${abilityId}`);
            this.addToCombatLog("That ability isn't available.");
            this.updateActionButtons(true);
            return;
        }
        
        // Process the ability
        this.processPlayerDamageAbility(ability);
    }
    
    /**
     * Show the item menu for combat
     */
    showItemMenu() {
        // Disable action buttons while item menu is open
        this.updateActionButtons(false);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the item menu
        const itemPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.5,
            width * 0.7,
            height * 0.6,
            {
                fillColor: 0x222222,
                fillAlpha: 0.9,
                borderColor: 0x339933,
                borderThickness: 2
            }
        );
        
        // Add title
        const titleText = this.add.text(width * 0.5, height * 0.25, 'ITEMS', {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Get player items
        const items = gameState.player.inventory.items || [];
        
        // If no items, show message
        if (items.length === 0) {
            const noItemsText = this.add.text(width * 0.5, height * 0.5, 'No items available', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff'
            }).setOrigin(0.5);
            
            // Add close button
            const closeButton = new Button(
                this,
                width * 0.5,
                height * 0.7,
                'CLOSE',
                () => {
                    // Remove all item menu elements
                    [itemPanel, titleText, noItemsText, closeButton].forEach(element => {
                        if (element) element.destroy();
                    });
                    
                    // Re-enable action buttons
                    this.updateActionButtons(true);
                },
                {
                    width: 120,
                    height: 40,
                    backgroundColor: 0x555555
                }
            );
            
            return;
        }
        
        // Create item buttons
        const itemButtons = [];
        const itemElements = [];
        
        // Add panel and title to elements to clean up later
        itemElements.push(itemPanel, titleText);
        
        // Display up to 6 items
        const maxItems = Math.min(items.length, 6);
        const startY = height * 0.35;
        const itemSpacing = 50;
        
        for (let i = 0; i < maxItems; i++) {
            const item = items[i];
            const yPos = startY + (i * itemSpacing);
            
            // Create item button
            const itemButton = new Button(
                this,
                width * 0.5,
                yPos,
                item.name,
                () => {
                    // Use the item
                    this.useItem(item);
                    
                    // Remove all item menu elements
                    itemElements.forEach(element => {
                        if (element) element.destroy();
                    });
                    
                    // Re-enable action buttons
                    this.updateActionButtons(true);
                },
                {
                    width: 200,
                    height: 40,
                    backgroundColor: 0x339933
                }
            );
            
            // Add description text
            const descText = this.add.text(
                width * 0.5,
                yPos + 25,
                item.description || '',
                {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#cccccc'
                }
            ).setOrigin(0.5);
            
            // Add to elements array for cleanup
            itemElements.push(itemButton, descText);
        }
        
        // Add close button
        const closeButton = new Button(
            this,
            width * 0.5,
            height * 0.75,
            'CLOSE',
            () => {
                // Remove all item menu elements
                itemElements.forEach(element => {
                    if (element) element.destroy();
                });
                
                // Re-enable action buttons
                this.updateActionButtons(true);
            },
            {
                width: 120,
                height: 40,
                backgroundColor: 0x555555
            }
        );
        
        // Add close button to elements
        itemElements.push(closeButton);
    }

    /**
     * Use an item in combat
     * @param {object} item - The item to use
     */
    useItem(item) {
        console.log(`Using item: ${item.name}`);
        
        // Process the item based on its type
        switch (item.type) {
            case 'potion':
                this.usePotion(item);
                break;
                
            case 'scroll':
                this.useScroll(item);
                break;
                
            default:
                this.addToCombatLog(`Used ${item.name}, but nothing happened.`);
                break;
        }
        
        // Remove the item from inventory
        const itemIndex = gameState.player.inventory.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
            gameState.player.inventory.items.splice(itemIndex, 1);
        }
        
        // Continue to enemy turn after a delay
        this.time.delayedCall(1000, () => {
            this.startEnemyTurn();
        });
    }
    
    /**
     * Use a potion item
     * @param {object} potion - The potion item
     */
    usePotion(potion) {
        const player = gameState.player;
        
        // Apply healing
        if (potion.healAmount) {
            const oldHealth = player.health;
            player.health = Math.min(player.maxHealth, player.health + potion.healAmount);
            const actualHealing = player.health - oldHealth;
            
            // Update health display
            this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
            this.updateHealthBar(this.playerHealthBar, player.health, player.maxHealth);
            
            // Play heal animation
            this.playHealAnimation(this.playerSprite);
            
            // Add to combat log
            this.addToCombatLog(`Used ${potion.name} and restored ${actualHealing} health!`);
        }
        
        // Apply mana restoration
        if (potion.manaAmount) {
            const oldMana = player.mana;
            player.mana = Math.min(player.maxMana, player.mana + potion.manaAmount);
            const actualMana = player.mana - oldMana;
            
            // Update mana display
            if (this.playerManaText) {
                this.playerManaText.setText(`MP: ${player.mana}/${player.maxMana}`);
            }
            if (this.playerManaBar) {
                const mana = gameState.player.mana !== undefined ? gameState.player.mana : 0;
                const maxMana = gameState.player.maxMana || 100;
                this.updateManaBar(this.playerManaBar, mana, maxMana);
            }
            
            // Add to combat log
            this.addToCombatLog(`Used ${potion.name} and restored ${actualMana} mana!`);
        }
    }
    
    /**
     * Use a scroll item
     * @param {object} scroll - The scroll item
     */
    useScroll(scroll) {
        // Process scroll effects
        if (scroll.effect === 'damage') {
            // Get target (for now just pick first enemy)
            const target = this.enemies[0];
            
            // Calculate damage
            const damage = scroll.power || 20;
            
            // Apply damage
            target.health = Math.max(0, target.health - damage);
            
            // Update enemy health display
            if (target.displayElements) {
                this.updateHealthBar(target.displayElements.healthBar, target.health, target.maxHealth);
                target.displayElements.healthText.setText(`HP: ${target.health}/${target.maxHealth}`);
            }
            
            // Play effect animation
            this.playAbilityAnimation(target, {
                name: scroll.name,
                element: scroll.element || 'arcane'
            });
            
            // Add to combat log
            this.addToCombatLog(`Used ${scroll.name} on ${target.name} for ${damage} damage!`);
            
            // Check if enemy defeated
            if (target.health <= 0) {
                this.enemyDefeated(target);
            }
        } else if (scroll.effect === 'buff') {
            // Apply buff to player
            this.addToCombatLog(`Used ${scroll.name} and gained ${scroll.buffType || 'a buff'}!`);
            
            // TODO: Implement buff system
        }
    }
    
    /**
     * Process victory and ensure transition to victory screen
     */
    processVictory() {
        console.log('Processing victory and transitioning to result screen');
        
        // Prevent multiple calls to processVictory
        if (this.victoryHandled) {
            return;
        }
        this.victoryHandled = true;
        
        // Calculate rewards based on the single enemy
        const enemy = this.enemies[0];
        const expGained = enemy.expValue || enemy.level * 10;
        const goldGained = enemy.goldValue || enemy.level * 5;
        
        // Generate loot items
        const lootItems = [];
        if (enemy.loot && Array.isArray(enemy.loot)) {
            enemy.loot.forEach(lootItem => {
                // Check if item should drop based on chance
                if (Math.random() <= (lootItem.chance || 0.5)) {
                    lootItems.push(lootItem.item || lootItem);
                }
            });
        }
        
        // Initialize player inventory if it doesn't exist
        if (!gameState.player.inventory) {
            gameState.player.inventory = {
                items: [],
                equipped: {}
            };
        }
        
        // Ensure items array exists
        if (!gameState.player.inventory.items) {
            gameState.player.inventory.items = [];
        }
        
        // Add rewards to player
        gameState.player.experience += expGained;
        gameState.player.gold += goldGained;
        
        // Add loot items to player inventory
        lootItems.forEach(item => {
            gameState.player.inventory.items.push(item);
        });
        
        // Check for level up
        const didLevelUp = gameState.player.experience >= gameState.player.experienceToNextLevel;
        
        // Determine if this was a boss encounter
        const isBoss = gameState.currentEncounter && gameState.currentEncounter.type === 'boss';
        
        // Store combat results
        gameState.combatResult = {
            outcome: 'victory',
            enemy: enemy,
            isBoss: isBoss,
            loot: {
                experience: expGained,
                gold: goldGained,
                items: lootItems
            }
        };
        
        // Show victory message in combat log (already shown in enemyDefeated)
        // No need to play victory sound again as it's already played in enemyDefeated
        
        // Start faster transition to combat result scene with a shorter delay
        // Use camera fade effect for smoother transition
        this.time.delayedCall(300, () => {
            console.log('Transitioning to CombatResultScene');
            this.cameras.main.fadeOut(400, 0, 0, 0, (camera, progress) => {
                // When fade is complete, navigate to result scene
                if (progress === 1) {
                    navigationManager.navigateTo(this, 'CombatResultScene');
                }
            });
        });
    }
}

export default EncounterScene;
