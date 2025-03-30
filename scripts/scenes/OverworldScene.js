// OverworldScene.js

// --- Imports ---
import UIManager from '../ui/UIManager.js'; // Keep this, BaseScene uses it
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js'; // <<< IMPORT BaseScene

// --- Extend BaseScene ---
class OverworldScene extends BaseScene {
    constructor() {
        // --- Call super() with the scene key ---
        super({ key: 'OverworldScene' });
    }

    preload() {
        // Load overworld assets
        this.load.image('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);

        // Use fallback portrait path if player/portrait isn't set yet
        const portraitPath = gameState.player?.portrait || ASSET_PATHS.FALLBACKS.PORTRAIT;
        // Use safeAddImage logic for preloading if BaseScene provides it, otherwise basic load
        if (!this.textures.exists('player-avatar')) {
             console.log(`Preloading player avatar with path: ${portraitPath}`);
             this.load.image('player-avatar', portraitPath);
        }
    }

    create() {
        // --- Initialize BaseScene first ---
        this.initializeScene(); // This creates this.ui and this.transitions

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- REMOVE the manual UIManager creation ---
        // this.ui = new UIManager(this); // NO LONGER NEEDED

        // Add background
        this.add.image(width/2, height/2, 'overworld-bg').setDisplaySize(width, height);

        // Create the title (uses this.ui created by initializeScene)
        this.ui.createTitle(width/2, height * 0.08, 'Aetheria Overworld', {
            fontSize: this.ui.fontSize.lg
        });

        // --- Add Healing Logic ---
        if (gameState.player) {
            console.log('OverworldScene: Restoring health and mana...');
            gameState.player.health = gameState.player.maxHealth;
            gameState.player.mana = gameState.player.maxMana;
            HealthManager.validatePlayerHealth();
            console.log(`Player Restored: HP ${gameState.player.health}/${gameState.player.maxHealth}, MP ${gameState.player.mana}/${gameState.player.maxMana}`);
        } else {
            console.warn("OverworldScene: Player data not found, cannot restore health/mana.");
        }
        // --- End Healing Logic ---

        // Display player info (uses restored values)
        this.createPlayerInfo();

        // Create navigation buttons
        this.createNavigationButtons();

        if (this.transitions) {
            this.transitions.fadeIn(); // Fade in this scene smoothly
        } else {
            console.warn(`TransitionManager not found in ${this.scene.key}, skipping fade-in.`);
        }
        console.log(`${this.scene.key} Create End`); 
    }

    /**
     * Create player info display
     */
    createPlayerInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Ensure player health and mana values are consistent (already validated above)
        // HealthManager.validatePlayerHealth(); // Not needed again here

        // Player Info Display setup
        const player = gameState.player || {};
        const maxHealth = player.maxHealth || 100;
        const maxMana = player.maxMana || 50;
        const currentHealth = player.health ?? maxHealth;
        const currentMana = player.mana ?? maxMana;

        // Create player avatar section
        const avatarX = width * 0.2;
        const avatarY = height * 0.3;
        const avatarContainer = this.ui.createPanel(avatarX, avatarY, 100, 100, { /* styles */ });

        // Safely add the avatar image using the key loaded in preload
        const portraitKey = 'player-avatar';
        if (this.textures.exists(portraitKey)) {
             this.add.image(avatarX, avatarY, portraitKey).setDisplaySize(80, 80);
        } else {
             console.warn(`Avatar texture '${portraitKey}' not found in createPlayerInfo.`);
             this.add.rectangle(avatarX, avatarY, 80, 80, 0x555555); // Placeholder
        }

        // Create player text info section
        const infoX = width * 0.35;
        const infoY = height * 0.3;
        const playerName = player.name || 'Adventurer';
        const playerClass = player.class || 'Warrior';
        const playerStats = `${playerName}\n${playerClass}\nHP: ${currentHealth}/${maxHealth}\nMP: ${currentMana}/${maxMana}`;

        // Create text using ui manager for consistency
        this.playerInfoText = this.ui.createText(infoX, infoY, playerStats, {
            fontSize: this.ui.fontSize.md,
            color: '#ffffff',
            align: 'left',
            lineSpacing: 8
        }).setOrigin(0, 0.5); // Align origin to middle-left

        // If you used createSectionLabel before and liked that style:
        /*
        this.playerInfoText = this.ui.createSectionLabel(
            infoX, infoY, playerStats,
            {
                fontSize: this.ui.fontSize.md,
                background: true,
                align: 'left',
                animate: false // Maybe don't animate stats constantly
            }
        ).setOrigin(0, 0.5); // Adjust origin if using section label
        */
    }

    /**
     * Create navigation buttons to other scenes
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Layout Configuration ---
        const buttonWidth = 180;
        const buttonHeight = 50;
        const horizontalSpacing = 40; // Space between buttons horizontally
        const verticalSpacing = 20;   // Space between rows
        const gridWidth = (buttonWidth * 2) + horizontalSpacing; // Total width of two buttons + space

        // Center the grid horizontally
        const centerX = width / 2;
        const col1X = centerX - (gridWidth / 4); // Center of the left button
        const col2X = centerX + (gridWidth / 4); // Center of the right button

        // Define vertical positions for rows
        const row1Y = height * 0.55;
        const row2Y = row1Y + buttonHeight + verticalSpacing;
        const row3Y = row2Y + buttonHeight + verticalSpacing + 10; // Extra space for the centered button

        const buttonOptions = { width: buttonWidth, height: buttonHeight };
        // --- End Layout Configuration ---

        // --- Row 1 ---
        // Dungeons button (Left)
        this.ui.createButton(col1X, row1Y, 'DUNGEONS', () => {
            this.safePlaySound('button-click'); 
            navigationManager.navigateTo(this, 'DungeonSelectScene');
        }, buttonOptions);

        // Inventory button (Right)
        this.ui.createButton(col2X, row1Y, 'INVENTORY', () => {
            this.safePlaySound('button-click');
            gameState.previousScene = 'OverworldScene'; // Set previous scene before navigating
            navigationManager.navigateTo(this, 'InventoryScene');
        }, buttonOptions);

        // --- Row 2 ---
        // Crafting button (Left)
        this.ui.createButton(col1X, row2Y, 'CRAFTING', () => {
            this.safePlaySound('button-click');
            gameState.previousScene = 'OverworldScene';
            navigationManager.navigateTo(this, 'CraftingScene');
        }, buttonOptions);

        // >>> NEW: Potion Shop button (Right) <<<
        this.ui.createButton(col2X, row2Y, 'POTION SHOP', () => {
            this.safePlaySound('button-click');
            gameState.previousScene = 'OverworldScene'; // Set previous scene
            console.log('Potion Shop button clicked');
            navigationManager.navigateTo(this, 'PotionShopScene'); // Navigate to the new scene
        }, buttonOptions);

        // --- Row 3 ---
        // Character button (Centered below)
        this.ui.createButton(centerX, row3Y, 'CHARACTER', () => {
            this.safePlaySound('button-click');
            gameState.previousScene = 'OverworldScene';
            navigationManager.navigateTo(this, 'CharacterSheetScene');
        }, buttonOptions);
    }
}

export default OverworldScene;