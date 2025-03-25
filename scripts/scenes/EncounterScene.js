import BaseScene from './BaseScene.js';
import CombatEngine from '../encounter/CombatEngine.js';
import CombatUI from '../encounter/CombatUI.js';
import CombatLog from '../encounter/CombatLog.js';
import CombatAudio from '../encounter/CombatAudio.js';
import CombatText from '../encounter/CombatText.js';
import SpriteManager from '../encounter/SpriteManager.js';
import { getEnemyData } from '../data/enemies.js';
import { LAYOUT } from '../config/Layout.js';
import gameState from '../gameState.js';

export default class EncounterScene extends BaseScene {
    constructor() {
        super({ key: 'EncounterScene' });
        this.enemies = [];
        this.isBoss = false;
        this.dungeonLevel = 1; // Default level if not specified
    }
    
    init(data) {
        // Store dungeon level
        this.dungeonLevel = data.dungeonLevel || 1;
        
        // Get player data
        this.playerData = data.playerData || this.registry.get('playerData') || {
            health: 100,
            maxHealth: 100,
            mana: 50,
            maxMana: 50,
            level: 1,
            attack: 10,
            defense: 5,
            speed: 5,
            critical: 5
        };
    }
    
    preload() {
        // Create managers and helpers
        this.spriteManager = new SpriteManager(this);
        this.combatUI = new CombatUI(this);
        this.combatLog = new CombatLog(this);
        this.combatAudio = new CombatAudio(this);
        this.combatText = new CombatText(this);
        this.combatEngine = new CombatEngine(this);
        
        // Preload necessary assets
        this.load.image('combat-background', 'assets/sprites/backgrounds/combat-bg.png');
        this.spriteManager.preloadSprites();
    }
    
    /**
     * Create the scene
     */
    create(data) {
        // Initialize base scene components
        this.initializeScene();
        
        // Set up scene background
        this.add.image(0, 0, 'combat-background')
            .setOrigin(0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Set up enemies
        this.enemies = data.enemies || this.generateRandomEnemies();
        this.isBoss = data.isBoss || false;
        
        // Ensure enemy has proper stats
        this.enemies.forEach(enemy => {
            if (!enemy.health) enemy.health = enemy.baseHealth;
            if (!enemy.maxHealth) enemy.maxHealth = enemy.baseHealth;
            if (!enemy.damage) enemy.damage = enemy.baseAttack;
            if (!enemy.defense) enemy.defense = enemy.baseDefense;
        });
        
        this.combatEngine.setEnemies(this.enemies);

        // Create UI elements
        this.combatUI.createCombatUI();
        this.spriteManager.createPlayerSprite();
        this.spriteManager.createEnemyDisplay(this.enemies[0]); // Pass the first enemy since we only show one at a time
        this.combatLog.createCombatLog();

        // Start combat
        this.combatEngine.startCombat();
        this.combatAudio.playBattleMusic();
    }
    
    /**
     * Generate random enemies if none provided
     */
    generateRandomEnemies() {
        const enemyTypes = ['forest-goblin', 'forest-spider', 'wolf'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const enemy = getEnemyData(randomType);
        
        // Set health and other stats
        enemy.health = enemy.baseHealth;
        enemy.maxHealth = enemy.baseHealth;
        enemy.damage = enemy.baseAttack;
        enemy.defense = enemy.baseDefense;
        
        return [enemy];
    }
    
    /**
     * Update method called every frame
     */
    update(time, delta) {
        // No specific update logic needed here 
        // Combat updates are handled by the combat engine
    }
    
    /**
     * Process victory over an enemy
     */
    processVictory() {
        const enemy = this.enemies[0];
        
        // Prepare reward data
        const experienceReward = enemy.experienceReward || 10;
        const goldReward = enemy.goldReward ? 
            Math.floor(Math.random() * (enemy.goldReward.max - enemy.goldReward.min + 1)) + enemy.goldReward.min :
            Math.floor(Math.random() * 10) + 5;
        
        // Update player stats
        if (gameState.player) {
            gameState.player.experience = (gameState.player.experience || 0) + experienceReward;
            gameState.player.gold = (gameState.player.gold || 0) + goldReward;
            
            // Display reward message
            this.combatLog.addLogEntry(`You gained ${experienceReward} experience and ${goldReward} gold!`);
            
            // Handle loot
            let lootItems = [];
            if (enemy.loot && enemy.loot.length > 0) {
                enemy.loot.forEach(lootItem => {
                    if (Math.random() <= lootItem.chance) {
                        // Add item to inventory
                        if (!gameState.player.inventory) gameState.player.inventory = [];
                        gameState.player.inventory.push({ id: lootItem.item, name: lootItem.item });
                        
                        // Track loot for results screen
                        lootItems.push(lootItem.item);
                        
                        // Display loot message
                        this.combatLog.addLogEntry(`You found a ${lootItem.item}!`);
                    }
                });
            }
            
            // Store combat results in gameState for the results screen
            gameState.combatResult = {
                outcome: 'victory',
                enemy: enemy.name,
                experienceGained: experienceReward,
                goldGained: goldReward,
                loot: lootItems
            };
        }
        
        // Transition to combat results screen after a short delay
        this.time.delayedCall(1500, () => {
            this.scene.start('CombatResultScene');
        });
    }
    
    /**
     * Handle player defeat
     */
    handleDefeat() {
        // Add defeat message
        this.combatLog.addLogEntry('You have been defeated!');
        
        // Store combat result for defeat scene
        gameState.combatResult = {
            outcome: 'defeat'
        };
        
        // Transition to defeat scene after a short delay
        this.time.delayedCall(1500, () => {
            this.scene.start('DefeatScene', {
                retreated: false
            });
        });
    }
    
    /**
     * Handle player retreat
     */
    handleRetreat() {
        // Add retreat message
        this.combatLog.addLogEntry('You retreat from battle!');
        
        // Store combat result for defeat scene
        gameState.combatResult = {
            outcome: 'retreat'
        };
        
        this.scene.start('DefeatScene', { retreated: true }); // Transition to defeat scene

        // Transition to defeat scene after a short delay
        /**
        this.time.delayedCall(1500, () => {
            this.scene.start('DefeatScene', {
                retreated: true
            });
        }, null, this);
        */
    }
}
