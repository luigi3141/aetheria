import BaseScene from './BaseScene.js';
import CombatEngine from '../encounter/CombatEngine.js';
import CombatUI from '../encounter/CombatUI.js';
import CombatLog from '../encounter/CombatLog.js';
import CombatAudio from '../encounter/CombatAudio.js';
import CombatText from '../encounter/CombatText.js';
import SpriteManager from '../encounter/SpriteManager.js';
import { generateCombatEncounter } from '../encounter/EnemyGenerator.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { calculateDifficulty } from '../utils/DifficultyManager.js';
import gameState from '../gameState.js';

export default class EncounterScene extends BaseScene {
    constructor() {
        super({ key: 'EncounterScene' });
        this.isBoss = false;
        this.dungeonLevel = 1;
    }

    init(data) {
        this.dungeonLevel = data.dungeonLevel || 1;
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
        this.load.image('combat-background', 'assets/sprites/backgrounds/combat-bg.png');

        const dungeon = gameState.combatData?.dungeon || { id: 'verdant-woods', level: 1 };
        const isBoss = gameState.combatData?.isBoss || false;
        const enemies = generateCombatEncounter(dungeon, isBoss);

        enemies.forEach(enemy => {
            if (enemy.sprite && !this.textures.exists(enemy.sprite)) {
                const spritePath = ASSET_PATHS.ENEMIES[enemy.sprite.toUpperCase()];
                if (spritePath) {
                    this.load.image(enemy.sprite, spritePath);
                } else {
                    console.warn(`No sprite path found for sprite key: ${enemy.sprite}`);
                }
            }
        });

        const playerClass = gameState.player.class?.toUpperCase() || 'DEFAULT';
        const spriteKey = `player-${playerClass.toLowerCase()}`;
        const spritePath = ASSET_PATHS.PLAYERS[playerClass] || ASSET_PATHS.PLAYERS.DEFAULT;
        if (!this.textures.exists(spriteKey)) {
            this.load.image(spriteKey, spritePath);
        }

        this.playerSpriteKey = spriteKey;
        this.enemiesToPreload = enemies;
    }

    create(data) {
        this.initializeScene();

        this.combatEngine = new CombatEngine(this);
        this.combatUI = new CombatUI(this);
        this.combatLog = new CombatLog(this);
        this.combatAudio = new CombatAudio(this);
        this.combatText = new CombatText(this);
        this.spriteManager = new SpriteManager(this);
        this.spriteManager.playerSpriteKey = this.playerSpriteKey;
      
        this.add.image(0, 0, 'combat-background')
            .setOrigin(0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const dungeon = gameState.combatData?.dungeon || { id: 'verdant-woods', level: 1 };
        this.isBoss = gameState.combatData?.isBoss || false;
        this.enemies = this.enemiesToPreload || generateCombatEncounter(dungeon, this.isBoss);

        if (!gameState.combatData) {
            gameState.combatData = {};
        }
        gameState.combatData.enemies = this.enemies;

        const enemy = this.enemies[0];
        const playerLevel = gameState.player?.level || 1;
        const { label: difficulty, color: difficultyColor } = calculateDifficulty(this.enemies, playerLevel);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Initialize combat log first
        this.combatLog.createCombatLog();
        
        const messageContainer = this.add.container(0, 0);

        const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        const box = this.add.rectangle(width / 2, height / 2, width * 0.6, height * 0.3, 0x222222, 0.9)
            .setStrokeStyle(2, 0xffffff);
        const message = this.add.text(
            width / 2,
            height / 2 - 20,
            `You've encountered a ${enemy.name}!`,
            {
                fontFamily: "'VT323'",
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        const diffText = this.add.text(
            width / 2,
            height / 2 + 20,
            `Difficulty: ${difficulty}`,
            {
                fontFamily: "'VT323'",
                fontSize: '20px',
                fill: difficultyColor,
                align: 'center'
            }
        ).setOrigin(0.5);

        messageContainer.add([dimBg, box, message, diffText]);
        this.combatLog.addLogEntry(`You've encountered a ${enemy.name}!`);
        this.combatLog.addLogEntry(`Difficulty: ${difficulty}`, false, difficultyColor);

        this.time.delayedCall(1500, () => {
            messageContainer.destroy();
            this.combatEngine.setEnemies(this.enemies);
            this.combatUI.createCombatUI();
            
            // Create player and enemy sprites
            this.spriteManager.createPlayerSprite();
            this.spriteManager.createEnemyDisplay(this.enemies[0]);
            
            // Create enemy health bar using CombatUI instead of SpriteManager
            this.combatUI.createEnemyHealthBar(this.enemies[0]);
            
            this.combatEngine.startCombat();
            this.combatAudio.playBattleMusic();
        });

        this.input.keyboard.on('keydown-F2', () => {
            this.ui.toggleDebug();
        });
        
        if (this.ui.debug?.fpsText) {
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    this.ui.debug.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
                },
                loop: true
            });
        }
    }

    update(time, delta) {}

    processVictory() {
        const enemy = this.enemies[0];
        let experienceReward = 10; // Default experience
        let goldReward = Math.floor(Math.random() * 10) + 5; // Default gold

        if (enemy.lootTable) {
            if (enemy.lootTable.experience) {
                experienceReward = Math.floor(Math.random() * (enemy.lootTable.experience.max - enemy.lootTable.experience.min + 1)) + enemy.lootTable.experience.min;
            }
            if (enemy.lootTable.gold) {
                goldReward = Math.floor(Math.random() * (enemy.lootTable.gold.max - enemy.lootTable.gold.min + 1)) + enemy.lootTable.gold.min;
            }
        }

        if (gameState.player) {
            gameState.player.experience = (gameState.player.experience || 0) + experienceReward;
            gameState.player.gold = (gameState.player.gold || 0) + goldReward;

            this.combatLog.addLogEntry(`You gained ${experienceReward} experience and ${goldReward} gold!`);

            let lootItems = [];
            if (enemy.lootTable && enemy.lootTable.items && enemy.lootTable.items.length > 0) {
                enemy.lootTable.items.forEach(lootItem => {
                    if (Math.random() <= lootItem.chance) {
                        // Ensure inventory exists
                        if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 20, equipped: {} };
                        if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
                        
                        // Add item ID to loot list and log
                        lootItems.push(lootItem.id);
                        this.combatLog.addLogEntry(`You found a ${lootItem.id}!`);
                    }
                });
            }

            gameState.combatResult = {
                outcome: 'victory',
                enemyName: enemy.name,
                experienceGained: experienceReward,
                goldGained: goldReward,
                loot: lootItems
            };
        }

        this.time.delayedCall(1500, () => {
            this.scene.start('CombatResultScene');
        });
    }

    handleDefeat() {
        this.combatLog.addLogEntry('You have been defeated!');
        gameState.combatResult = { outcome: 'defeat' };
        this.time.delayedCall(1500, () => {
            this.scene.start('DefeatScene', { retreated: false });
        });
    }

    handleRetreat() {
        this.combatLog.addLogEntry('You retreat from battle!');
        gameState.combatResult = { outcome: 'retreat' };
        this.scene.start('DefeatScene', { retreated: true });
    }
    
    /**
     * Update the enemy's health display
     * @param {object} enemy - The enemy to update
     */
    updateEnemyHealth(enemy) {
        if (enemy && this.combatUI) {
            this.combatUI.updateEnemyHealthBar(enemy);
        }
    }
}
