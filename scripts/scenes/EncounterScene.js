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
import navigationManager from '../navigation/NavigationManager.js';
import { generateLoot } from '../data/enemies.js';

import items from '../data/items.js'; // Import the entire default export object
const { getItemData } = items; // Destructure getItemData from the imported object

export default class EncounterScene extends BaseScene {
    constructor() {
        super({ key: 'EncounterScene' });
    }

    init(data) {
        // NOTE: EncounterScene doesn't receive data directly via navigateTo typically.
        // It relies on gameState.combatData being set *before* navigating to it.
        console.log("EncounterScene init. Reading from gameState.combatData:", gameState.combatData);

        if (!gameState.combatData || !gameState.combatData.dungeon) {
            console.error("CRITICAL: gameState.combatData or combatData.dungeon not set before entering EncounterScene!");
            // Navigate back safely if data is missing
            navigationManager.navigateTo(this, 'OverworldScene'); // Or DungeonScene?
            // Prevent further execution in this scene
            this.scene.pause(); // Or stop() if appropriate
        }
    }

    preload() {
        // Use combatData from gameState set in the previous scene (DungeonScene)
        const combatData = gameState.combatData;
        if (!combatData) {
            console.error("Cannot preload enemies: gameState.combatData is missing.");
            return; // Avoid errors if data is missing
        }

        const dungeon = combatData.dungeon; // Includes current level
        const isBoss = combatData.isBoss || false;

        // --- Generate enemies based on gameState ---
        // Note: generateCombatEncounter now uses dungeon.level internally
        const enemies = generateCombatEncounter(dungeon, isBoss);
        if (!enemies || enemies.length === 0) {
             console.error("EnemyGenerator failed to produce enemies!");
             // Handle error - maybe force retreat or show error message?
             // For now, store empty array to potentially handle in create()
             this.enemiesToPreload = [];
             return;
        }
        this.enemiesToPreload = enemies; // Store for use in create()
        // --- ---

        // Preload background based on dungeon config
        const bgKey = dungeon.backgroundKey || 'combat-bg'; // Fallback key
        const bgPath = ASSET_PATHS.BACKGROUNDS[dungeon.backgroundKey?.toUpperCase().replace('-BG', '')] || ASSET_PATHS.BACKGROUNDS.COMBAT;
        if (!this.textures.exists(bgKey)) {
            this.load.image(bgKey, bgPath);
        }
        this.backgroundKeyToUse = bgKey; // Store key for create()


        // Preload enemy sprites
        this.enemiesToPreload.forEach(enemy => {
            if (enemy.sprite && !this.textures.exists(enemy.sprite)) {
                // Use the key directly from enemy data (assuming it matches ASSET_PATHS keys)
                const spritePath = ASSET_PATHS.ENEMIES[enemy.sprite.toUpperCase()];
                if (spritePath) {
                    this.load.image(enemy.sprite, spritePath);
                } else {
                    console.warn(`No sprite path found in ASSET_PATHS.ENEMIES for key: ${enemy.sprite}`);
                    // Optionally load a fallback sprite
                    if (!this.textures.exists('DEFAULT_ENEMY')) {
                         this.load.image('DEFAULT_ENEMY', ASSET_PATHS.ENEMIES.DEFAULT);
                    }
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

    create(data) { // data argument might be empty here
        this.initializeScene();

        // Check if preloading failed to generate enemies
        if (!this.enemiesToPreload || this.enemiesToPreload.length === 0) {
            console.error("EncounterScene Create: No enemies were preloaded or generated. Returning to previous scene.");
             // Attempt to navigate back cleanly
             const prevScene = gameState.previousScene || 'DungeonScene'; // Default back to Dungeon
             navigationManager.navigateTo(this, prevScene);
             return; // Stop further execution
        }

        // Assign enemies from preload step
        this.enemies = this.enemiesToPreload;

        // --- Rest of create method remains largely the same ---
        this.combatEngine = new CombatEngine(this);
        // ... initialize other managers (UI, Log, Audio, Text, Sprite) ...
        this.combatUI = new CombatUI(this);
        this.combatLog = new CombatLog(this);
        this.combatAudio = new CombatAudio(this);
        this.combatText = new CombatText(this);
        this.spriteManager = new SpriteManager(this);
        this.spriteManager.playerSpriteKey = this.playerSpriteKey;

        // Add background using the key determined in preload
        this.add.image(0, 0, this.backgroundKeyToUse || 'combat-bg')
            .setOrigin(0)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Store enemies in gameState AFTER generation and assignment
        gameState.combatData.enemies = this.enemies;

        // --- Calculate difficulty based on generated enemies ---
        const enemy = this.enemies[0];
        const playerLevel = gameState.player?.level || 1;
        const { label: difficulty, color: difficultyColor } = calculateDifficulty(this.enemies, playerLevel);

        // --- Encounter Message setup ---
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.combatLog.createCombatLog(); // Create log UI FIRST

        const messageContainer = this.add.container(0, 0);
        const dimBg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
        const box = this.add.rectangle(width / 2, height / 2, width * 0.6, height * 0.3, 0x222222, 0.9)
            .setStrokeStyle(2, 0xffffff);
        const messageText = `Encountered ${enemy.name}!`; // Simplified message
        const message = this.add.text(width / 2, height / 2 - 20, messageText, { /* styles */ }).setOrigin(0.5);
        const diffText = this.add.text(width / 2, height / 2 + 20, `Difficulty: ${difficulty}`, { /* styles */ fill: difficultyColor }).setOrigin(0.5);
        messageContainer.add([dimBg, box, message, diffText]);

        // Add messages to the actual log
        this.combatLog.addEncounterMessage(enemy, difficulty, difficultyColor);

        // --- Start Combat After Delay ---
        this.time.delayedCall(1500, () => {
            messageContainer.destroy();
            this.combatEngine.setEnemies(this.enemies); // Set enemies in engine
            this.combatUI.createCombatUI(); // Create main UI elements

            // Create sprites
            this.spriteManager.createPlayerSprite();
            this.spriteManager.createEnemyDisplay(enemy); // Pass the actual enemy object

            // Use CombatUI to create enemy health bar
            this.combatUI.createEnemyHealthBar(enemy);

            this.combatEngine.startCombat(); // Start the engine logic
            this.combatAudio.playBattleMusic();
        });

        if (this.transitions) {
            this.transitions.fadeIn(); // Fade in this scene smoothly
        } else {
            console.warn(`TransitionManager not found in ${this.scene.key}, skipping fade-in.`);
        }
        console.log(`${this.scene.key} Create End`); 
    }

    update(time, delta) {}

    processVictory() {
        const enemy = this.enemies[0]; // Assuming single enemy for now
        let experienceReward = 0;
        let goldReward = 0;
        let lootItems = [];

        // Use generateLoot helper from enemies.js
        const lootResult = generateLoot(this.enemies); // Pass the array of defeated enemies
        experienceReward = lootResult.experience;
        goldReward = lootResult.gold;
        lootItems = lootResult.items; // Array of item IDs

        this.combatLog.addLogEntry(`You gained ${experienceReward} XP and ${goldReward} Gold.`);
        lootItems.forEach(itemId => {
             const itemData = getItemData(itemId); // Get data for logging name
             if (itemData) {
                  this.combatLog.addLogEntry(`You found: ${itemData.inGameName}!`);
             } else {
                  this.combatLog.addLogEntry(`You found an unknown item (${itemId})!`); // Fallback
             }
        });

        // Set combat result in gameState BEFORE navigating
        gameState.combatResult = {
            outcome: 'victory',
            enemyName: enemy?.name || 'Enemy', // Handle potential undefined enemy
            experienceGained: experienceReward,
            goldGained: goldReward,
            loot: lootItems // Pass the array of item IDs
        };

        // Navigate to CombatResultScene
        this.time.delayedCall(1500, () => {
             // Check scene validity before starting next one
             if (this.scene.isActive()) {
                 navigationManager.navigateTo(this, 'CombatResultScene');
             }
        });
    }

    processDefeat() {
        // Set combat result in gameState
        gameState.combatResult = { outcome: 'defeat' };
        // Navigate to DefeatScene
         this.time.delayedCall(1500, () => {
             if (this.scene.isActive()) {
                 navigationManager.navigateTo(this, 'DefeatScene');
             }
        });
    }

    handleRetreat() {
        this.combatLog.addLogEntry('You retreat from battle!');
        // Set combat result in gameState
        gameState.combatResult = { outcome: 'retreat' };
        // Navigate to Overworld directly on retreat? Or a specific retreat summary?
        // Let's go to Overworld for now.
         this.time.delayedCall(1000, () => {
             if (this.scene.isActive()) {
                  navigationManager.navigateTo(this, 'OverworldScene');
             }
        });
    }

    updateEnemyHealth(enemy) {
       if (enemy && this.combatUI) {
           this.combatUI.updateEnemyHealthBar(enemy);
       }
   }

}
