// ---- File: OverworldScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../utils/gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';
import { saveGame } from '../utils/SaveLoadManager.js';

// --- Extend BaseScene ---
class OverworldScene extends BaseScene {
    constructor() {
        // --- Call super() with the scene key ---
        super({ key: 'OverworldScene' });
        this.playerInfoText = null; // Add reference for UI text
    }

    // ---- **** LIFECYCLE HANDLERS **** ----
    onWake(sys, data) {
        console.log(`[OverworldScene] --- WAKE event received ---`, data);

        // Attempt to refresh necessary UI - It's okay if elements aren't ready yet
        console.log("[OverworldScene onWake] Updating player info display.");
        this.updatePlayerInfoDisplay(); // Keep this call, the function itself has checks

        // --- Safely handle camera and input enabling ---
        // Use a very short delay to give Phaser time to fully wake the camera system
        this.time.delayedCall(10, () => { // Small delay (e.g., 10ms)
            // --- Add checks INSIDE the delayed call ---
            if (this && this.scene && this.sys.isActive()) { // Check if scene is still valid
                if (this.cameras && this.cameras.main) {
                    console.log("[OverworldScene onWake - Delayed] Forcing camera alpha to 1.");
                    this.cameras.main.setAlpha(1); // Make visible immediately
                } else {
                    console.warn("[OverworldScene onWake - Delayed] Cameras or main camera not available after wake.");
                }

                if (this.input) {
                     console.log("[OverworldScene onWake - Delayed] Enabling input.");
                     this.input.enabled = true; // Enable input
                } else {
                     console.warn("[OverworldScene onWake - Delayed] Input system not available after wake.");
                }
            } else {
                 console.warn(`[OverworldScene onWake - Delayed] Scene ${this.scene?.key || 'Unknown'} became inactive before delayed operations.`);
            }
        });
        // --- End safe handling ---
    }

    onResume(sys, data){
        console.log(`[OverworldScene] --- RESUME event received ---`, data);
        // Simple handling for resume - ensure visibility and input if needed
        if (this.cameras?.main && this.cameras.main.alpha < 1 && !this.cameras.main.isFading) {
             console.log("[OverworldScene onResume] Camera is transparent, forcing alpha to 1.");
             this.cameras.main.setAlpha(1);
        }
        if(this.input && !this.input.enabled && !this.cameras?.main?.isFading) {
            console.log("[OverworldScene onResume] Enabling input.");
            this.input.enabled = true;
        }
    }
    // ---- **** END LIFECYCLE HANDLERS **** ----

    // ---- **** MODIFIED INIT **** ----
    init(data){
        console.log(`[OverworldScene] --- INIT ---`, data);
        // DO NOT add listeners here anymore - moved to create()
    }
    // ---- **** END INIT **** ----


    preload() {
        console.log(`[OverworldScene] --- PRELOAD START ---`); // Log preload start
        // Load overworld assets
        this.load.image('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);

        // Use fallback portrait path if player/portrait isn't set yet
        const portraitPath = gameState.player?.portrait || ASSET_PATHS.FALLBACKS.PORTRAIT;
        if (!this.textures.exists('player-avatar')) {
             console.log(`Preloading player avatar with path: ${portraitPath}`);
             this.load.image('player-avatar', portraitPath);
        }
        console.log(`[OverworldScene] --- PRELOAD END ---`); // Log preload end
    }

    // ---- File: OverworldScene.js ----
    create() {
        console.log(`[OverworldScene] --- CREATE START ---`);
        this.initializeScene();

        // --- Register Listeners in Create (Moved from init) ---
        this.events.off('wake', this.onWake, this);
        this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
        this.events.on('wake', this.onWake, this);
        this.events.on(Phaser.Scenes.Events.RESUME, this.onResume, this);
        console.log("[OverworldScene Create] Wake/Resume listeners registered.");
        // --- End Listener Registration ---

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background
        this.add.image(width/2, height/2, 'overworld-bg').setDisplaySize(width, height).setDepth(0);

        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Aetheria Overworld', {
            fontSize: this.ui.fontSize.lg
        }).setDepth(1);

        // --- >>> HEALING LOGIC <<< ---
        if (gameState.player) {
            console.log("[OverworldScene Create] Restoring player health and mana...");
            const maxHp = gameState.player.maxHealth || 100;
            const maxMp = gameState.player.maxMana || 50;

            // Use HealthManager to set health/mana to max safely
            HealthManager.updatePlayerHealth(maxHp, false); // false = set directly, not relative
            HealthManager.updatePlayerMana(maxMp, false);   // false = set directly, not relative

            // Log the result
            console.log(`[OverworldScene Create] Player restored to ${gameState.player.health}/${gameState.player.maxHealth} HP, ${gameState.player.mana}/${gameState.player.maxMana} MP`);

            // Save the game state after healing
            saveGame();
        } else {
            console.warn("[OverworldScene Create] No player data found, cannot restore health/mana.");
        }
        // --- >>> END HEALING LOGIC <<< ---

        // Display player info
        console.log("[OverworldScene Create] Calling createPlayerInfo...");
        this.createPlayerInfo();

        // Create navigation buttons
        console.log("[OverworldScene Create] Calling createNavigationButtons...");
        this.createNavigationButtons();

        // --- Initial Fade-In ---
        console.log("[OverworldScene Create] Setting up initial fade-in.");
        this.cameras.main.setAlpha(0); // Start transparent

        if (this.transitions) {
            this.time.delayedCall(50, () => {
                if (this && this.scene?.isActive) {
                     console.log("[OverworldScene Create] Delayed call: Fading in...");
                     this.transitions.fadeIn();
                } else {
                    console.warn(`[OverworldScene Create Delayed] Scene ${this.scene?.key || 'Unknown'} became inactive.`);
                     if(this.cameras?.main) this.cameras.main.setAlpha(1);
                     if(this.input) this.input.enabled = true;
                }
            });
        } else {
            console.warn(`[OverworldScene Create] TransitionManager not found. Setting alpha to 1.`);
             if(this.cameras?.main) this.cameras.main.setAlpha(1);
             if(this.input) this.input.enabled = true;
        }
        // --- End Fade-In ---

        console.log(`[OverworldScene] --- CREATE END ---`);
    }

        /**
     * Create player info display
     */
        createPlayerInfo() {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
    
            const player = gameState.player || {};
            const maxHealth = player.maxHealth || 100;
            const maxMana = player.maxMana || 50;
            const currentHealth = player.health ?? maxHealth;
            const currentMana = player.mana ?? maxMana;
    
            // Avatar Panel
            const avatarX = width * 0.2;
            const avatarY = height * 0.3;
            const avatarSize = 100;
            // --- FIX: Get panel instance first, then set depth on its container ---
            const avatarPanel = this.ui.createPanel(avatarX, avatarY, avatarSize, avatarSize, {});
            if (avatarPanel && avatarPanel.container) { // Add check for safety
                 avatarPanel.container.setDepth(1); // Set depth on the internal container
            }
            // --- END FIX ---
    
            // Avatar Image
            const portraitKey = 'player-avatar';
            if (this.textures.exists(portraitKey)) {
                 this.add.image(avatarX, avatarY, portraitKey).setDisplaySize(80, 80).setDepth(2); // Ensure avatar on top
            } else {
                 this.add.rectangle(avatarX, avatarY, 80, 80, 0x555555).setDepth(2);
            }
    
            // Info Panel
            const textWidth = 300;
            const textHeight = avatarSize;
            const infoX = avatarX + avatarSize / 2 + 20; // Position right of avatar
            const infoPanelX = infoX + textWidth / 2; // Center X for the panel
            // --- FIX: Get panel instance first, then set depth on its container ---
            const infoPanel = this.ui.createPanel(infoPanelX, avatarY, textWidth, textHeight, {
                fillColor: this.ui.colors.secondary, fillAlpha: 0.8, strokeColor: this.ui.colors.accent
            });
            if (infoPanel && infoPanel.container) { // Add check for safety
                infoPanel.container.setDepth(1); // Set depth on the internal container
            }
            // --- END FIX ---
    
    
            // Info Text (store reference)
            if (this.playerInfoText) {
                 try { this.playerInfoText.destroy(); } catch(e){} // Destroy old if exists
                 this.playerInfoText = null;
            }
            this.playerInfoText = this.ui.createText(infoX + 10, avatarY, '', { // Start with empty text
                fontSize: this.ui.fontSize.md, color: '#ffffff', align: 'left', lineSpacing: 8
            }).setOrigin(0, 0.5).setDepth(2); // Ensure text on top
    
            this.updatePlayerInfoDisplay(); // Call helper to set initial text
        }

    // ---- **** Keep updatePlayerInfoDisplay Helper **** ----
    updatePlayerInfoDisplay() {
        console.log("[OverworldScene updatePlayerInfoDisplay] --- START ---"); // Log start
        // Strengthened Check
        if (!this.playerInfoText || !this.playerInfoText.scene || !this.playerInfoText.active) {
             console.warn(`[OverworldScene updatePlayerInfoDisplay] Cannot update: text element missing, inactive, or scene context lost.`);
             console.log("[OverworldScene updatePlayerInfoDisplay] --- END (invalid text element) ---");
             return;
        }

        if (!gameState.player) {
             console.warn("[OverworldScene updatePlayerInfoDisplay] Cannot update: gameState missing player.");
             try {
                if (this.playerInfoText && this.playerInfoText.active) {
                     this.playerInfoText.setText("No Player Data");
                }
             } catch(e){
                 console.error("[OverworldScene updatePlayerInfoDisplay] Error setting 'No Player Data' text:", e);
             }
             console.log("[OverworldScene updatePlayerInfoDisplay] --- END (no player) ---");
             return;
        }

        // ... (rest of the update logic remains the same) ...
        console.log("[OverworldScene updatePlayerInfoDisplay] Accessing gameState.player:", gameState.player);
        const p = gameState.player;
        const maxH = p.maxHealth || 100;
        const maxM = p.maxMana || 50;
        const currentH = p.health ?? maxH;
        const currentM = p.mana ?? maxM;
        const playerName = p.name || 'Adventurer';
        const playerClass = (p.class || 'Warrior').charAt(0).toUpperCase() + (p.class || 'Warrior').slice(1).toLowerCase();
        const stats = `${playerName}\n${playerClass}\nHP: ${currentH}/${maxH}\nMP: ${currentM}/${maxM}`;

        console.log(`[OverworldScene updatePlayerInfoDisplay] Calculated stats string: "${stats}"`);
        try {
            if (this.playerInfoText && this.playerInfoText.active) {
                this.playerInfoText.setText(stats);
                console.log("[OverworldScene updatePlayerInfoDisplay] setText successful.");
            } else {
                 console.warn("[OverworldScene updatePlayerInfoDisplay] Text element became invalid before setText could execute.");
            }
        } catch (e) {
            console.error("[OverworldScene updatePlayerInfoDisplay] Error during setText:", e);
        }
        console.log("[OverworldScene updatePlayerInfoDisplay] --- END ---");
    }


    /**
     * Create navigation buttons to other scenes
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonWidth = 200;
        const buttonHeight = 50;
        const horizontalSpacing = 40;
        const verticalSpacing = 20;
        const gridWidth = (buttonWidth * 2) + horizontalSpacing;
        const centerX = width / 2;
        const col1X = centerX - (gridWidth / 4);
        const col2X = centerX + (gridWidth / 4);
        const row1Y = height * 0.55;
        const row2Y = row1Y + buttonHeight + verticalSpacing;
        const row3Y = row2Y + buttonHeight + verticalSpacing;
        const buttonOptions = { width: buttonWidth, height: buttonHeight, depth: 5 }; // Add depth

        const navigateWithFade = (targetScene) => {
             this.safePlaySound('button-click');
             gameState.previousScene = 'OverworldScene';
             if (this.transitions) {
                 this.transitions.fade(() => navigationManager.navigateTo(this, targetScene));
             } else {
                 navigationManager.navigateTo(this, targetScene);
             }
        };

        // Row 1
        this.ui.createButton(col1X, row1Y, 'DUNGEONS', () => navigateWithFade('DungeonSelectScene'), buttonOptions);
        this.ui.createButton(col2X, row1Y, 'INVENTORY', () => navigateWithFade('InventoryScene'), buttonOptions);
        // Row 2
        this.ui.createButton(col1X, row2Y, 'CRAFTING', () => navigateWithFade('CraftingScene'), buttonOptions);
        this.ui.createButton(col2X, row2Y, 'POTION SHOP', () => navigateWithFade('PotionShopScene'), buttonOptions);
        // Row 3
        this.ui.createButton(col1X, row3Y, 'CHARACTER', () => navigateWithFade('CharacterSheetScene'), buttonOptions);
        this.ui.createButton(col2X, row3Y, 'MAIN MENU', () => navigateWithFade('StartScene'), { ...buttonOptions, fillColor: 0x555555, hoverColor: 0x777777 });
    }

    // ---- **** Keep SHUTDOWN **** ----
    shutdown() {
        console.log(`--- ${this.scene.key} SHUTDOWN ---`);
        // Clean up listeners added in create
        this.events.off('wake', this.onWake, this);
        this.events.off(Phaser.Scenes.Events.RESUME, this.onResume, this);
        if (this.playerInfoText) { try { this.playerInfoText.destroy(); } catch(e){} this.playerInfoText = null; }
        if (super.shutdown) super.shutdown(); // Call BaseScene shutdown if it exists
    }
    // ---- **** END SHUTDOWN **** ----

}

export default OverworldScene;