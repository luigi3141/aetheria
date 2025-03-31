import BaseScene from './BaseScene.js';
import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import items from '../data/items.js';
import CharacterManager from '../utils/CharacterManager.js';
import { getDungeonData } from '../data/DungeonConfig.js';
import HealthManager from '../utils/HealthManager.js';

const { getItemData } = items;

/**
 * CombatResultScene - Scene that shows the results of combat encounters
 */
class CombatResultScene extends BaseScene {
    constructor() {
        super({ key: 'CombatResultScene' }); // Pass config to BaseScene constructor
    }

    init(data) {
        console.log("CombatResultScene Init:", data);
        console.log("Player State:", gameState.player);

        // Load saved state first
        const savedState = window.localStorage.getItem('gameState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.player) {
                // Update only inventory and stats, not scene-specific data
                gameState.player.inventory = parsedState.player.inventory;
                gameState.player.gold = parsedState.player.gold;
                gameState.player.experience = parsedState.player.experience;
                gameState.player.experienceToNextLevel = parsedState.player.experienceToNextLevel;
            }
        }

        // Store combat result data - check both scene data and gameState
        if (data && data.combatResult) {
            this.combatResult = data.combatResult;
            console.log("Combat Result from scene data:", this.combatResult);
        } else if (gameState.combatResult) {
            // Fallback to gameState if scene data is missing
            this.combatResult = gameState.combatResult;
            console.log("Combat Result from gameState:", this.combatResult);
        } else {
            console.error("No combat result data in init!");
            this.combatResult = null;
        }
    }

    preload() {
        console.log("CombatResultScene Preload Start");
        // Load combat result assets
        if (!this.textures.exists('combat-result-bg')) {
            this.load.image('combat-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);
        }

        // --- Load Loot Category Icons ---
        // Check and load each material icon if it doesn't exist
        for (const [key, path] of Object.entries(ASSET_PATHS.MATERIALS)) {
            if (!this.textures.exists(key)) {
                console.log(`Preloading loot icon: ${key}`);
                this.load.image(key, path);
            } else {
                 console.log(`Loot icon already loaded: ${key}`);
            }
        }
        // Add loading for any other potential category icons (e.g., Key items)
        // if (!this.textures.exists('KEY_ICON')) {
        //     this.load.image('KEY_ICON', 'path/to/key_icon.png'); // Example
        // }

        console.log("CombatResultScene Preload End");
    }

    create() {
        console.log("CombatResultScene Create Start");

        // --- Call initializeScene from BaseScene ---
        // This initializes this.ui, this.transitions, etc.
        this.initializeScene();

        // Get screen dimensions after initialization
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Background ---
        // Safely add background using BaseScene's helper if available, or standard add
        if (typeof this.safeAddImage === 'function') {
            this.safeAddImage(width/2, height/2, 'combat-result-bg', {
                displayWidth: width,
                displayHeight: height
            });
        } else {
            this.add.image(width/2, height/2, 'combat-result-bg').setDisplaySize(width, height);
        }


        // --- Validate Combat Result Data ---
        // Ensure we have valid combat result data from init()
        if (!this.combatResult) {
            console.error("CombatResultScene Create: No combat result data found! Cannot proceed.");
            // Show error message instead of crashing
            if (this.ui) { // Check if UI manager is available
                this.ui.createTitle(width/2, height/2, 'Error: Combat data missing', {
                    fontSize: this.ui.fontSize.md || 24, // Use UIManager size or default
                    color: '#ff0000'
                });
                // Add a simple back button as a fallback
                this.ui.createButton(
                    width/2, height * 0.8, 'Return',
                    () => navigationManager.navigateTo(this, 'OverworldScene'),
                    { width: 150, height: 40 }
                );
            }
            return; // Stop creation if data is missing
        }

        console.log("Combat Result Data:", this.combatResult);

        // --- Create Title based on Outcome ---
        let titleText = 'Victory!';
        let titleColor = '#ffff00'; // Yellow for victory
        if (this.combatResult.outcome === 'retreat') {
            titleText = 'Retreat Successful';
            titleColor = '#aaaaaa'; // Grey for retreat
        } else if (this.combatResult.outcome === 'defeat') {
            titleText = 'Defeat';
            titleColor = '#ff0000'; // Red for defeat
        }

        // Create the title using the initialized UI manager
        if (this.ui) {
            this.ui.createTitle(width/2, height * 0.1, titleText, {
                fontSize: this.ui.fontSize.lg, // Use UIManager size
                color: titleColor
            });
        } else {
            console.error("UIManager not initialized, cannot create title!");
        }

        // --- Create the Results Display (XP, Gold, etc.) ---
        // This function also calls updatePlayerStats internally
        this.createResultsDisplay();

        // --- Create the Loot Display ---
        // Show loot on victory or retreat (if applicable), or "No items found" message
        if (this.combatResult.outcome !== 'defeat') {
            this.createLootDisplay();
        }

        // --- Create Navigation Buttons ---
        this.createNavigationButtons();

        console.log("CombatResultScene Create End");
    }

    continueExploring() {
        console.log("CombatResultScene: Continue Exploring selected.");

        // --- >>> INCREMENT DUNGEON LEVEL ON VICTORY <<< ---
        if (this.combatResult?.outcome === 'victory' && gameState.currentDungeon) {
            gameState.currentDungeon.level += 1;
            console.log(`Advanced to Dungeon Level: ${gameState.currentDungeon.level}`);
            // Optional: Check if max level reached, trigger boss, etc.
            const dungeonConfig = getDungeonData(gameState.currentDungeon.id);
            if (dungeonConfig && gameState.currentDungeon.level > dungeonConfig.maxLevel) {
                console.log("Max dungeon level reached!");
                // Handle reaching the end - maybe force Overworld or trigger final boss?
                // For now, let's just cap it or log it.
                // gameState.currentDungeon.level = dungeonConfig.maxLevel;
            }
        }
        // --- <<< END LEVEL INCREMENT >>> ---
        console.log("Calling this.transitions.fade..."); // Log before calling
        if (!this.transitions) { console.error("!!! this.transitions is missing !!!"); return; } // Add check
    
        this.transitions.fade(() => {
            // --- ADD THIS LOG ---
            console.log(">>> Fade callback started <<<");
            // --- END ADD ---
            if (!navigationManager) { console.error("!!! navigationManager is missing !!!"); return; } // Add check
    
            console.log("Attempting navigation via navigationManager...");
            navigationManager.navigateTo(this, 'DungeonScene', { fromCombat: true });
            console.log("navigationManager.navigateTo called.");
        });
        console.log("this.transitions.fade call finished."); // Log after calling
    }

    /**
     * Create the results display (XP & Gold)
     */
    createResultsDisplay() {
        if (!this.combatResult) {
            console.error("Cannot create display: No combat result data!");
            return;
        }

        // Update player stats first
        this.updatePlayerStats(this.combatResult);

        // Log loot items for verification
        if (this.combatResult.loot && this.combatResult.loot.length > 0) {
            console.log("Loot Items Acquired (IDs):", this.combatResult.loot);
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const isVictory = this.combatResult.outcome === 'victory';
        const isDefeat = this.combatResult.outcome === 'defeat';

        let resultTitleText = 'Battle Concluded.';
        if (isVictory) {
            resultTitleText = `You defeated ${this.combatResult.enemyName || 'the enemy'}!`;
        } else if (isDefeat) {
            resultTitleText = 'You were defeated in battle!';
        } else { // Retreat or unknown
            resultTitleText = 'You escaped from the battle.';
        }

        this.ui.createTitle(width/2, height * 0.18, resultTitleText, {
            fontSize: this.ui.fontSize.md
        });

        // Display XP and Gold only on Victory
        if (isVictory) {
            const xpGained = this.combatResult.experienceGained || 0;
            const goldGained = this.combatResult.goldGained || 0;

            this.ui.createTitle(width/2, height * 0.25, `Experience: +${xpGained}`, {
                fontSize: this.ui.fontSize.xs,
                color: '#00ff00', // Green for XP
                padding: { x: 5, y: 5 }
            });

            this.ui.createTitle(width/2, height * 0.30, `Gold: +${goldGained}`, {
                fontSize: this.ui.fontSize.xs,
                color: '#ffff00', // Yellow for Gold
                padding: { x: 5, y: 5 }
            });
        }
    }

    /**
     * Create the loot display with icons and names
     */
    createLootDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get loot data
        const lootItemsArray = this.combatResult.loot || []; // Array of item IDs (strings)
        console.log("Loot Items Acquired (IDs):", lootItemsArray);

        // --- Create Panel ---
        const panelWidth = width * 0.6;
        const panelHeight = height * 0.3; // Increased height for items
        const panelX = width / 2;
        const panelY = height * 0.55; // Positioned lower

        const panel = this.ui.createPanel(
            panelX, panelY, panelWidth, panelHeight,
            {
                fillColor: 0x111122,
                fillAlpha: 0.8,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );

        // --- Create Title ---
        this.ui.createTitle(panelX, panelY - (panelHeight / 2) - 20, 'Items Acquired', {
            fontSize: this.ui.fontSize.xs,
            padding: { x: 5, y: 5 }
        });

        // --- Display Items ---
        const maxItemsToShow = 4; // Limit visible items directly
        const itemSpacing = 60; // Vertical spacing between items
        const startY = panelY - (panelHeight / 4); // Start position for items

        if (lootItemsArray.length === 0) {
            // No items found message
            this.add.text(panelX, panelY, 'No items found', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.xs + 'px',
                fill: '#aaaaaa',
                align: 'center',
                padding: { x: 5, y: 5 }
            }).setOrigin(0.5);
        } else {
            // Display items with icons
            const visibleItems = lootItemsArray.slice(0, maxItemsToShow);
            const itemIconSize = 24;
            let itemY;

            visibleItems.forEach((itemId, index) => {
                itemY = startY + (index * itemSpacing);
                const itemData = getItemData(itemId);
                
                if (!itemData) {
                    console.warn(`Could not find item data for ID: ${itemId}`);
                    // Display placeholder if item data is missing
                    this.add.text(panelX, itemY, `- Unknown Item (${itemId})`, {
                        fontFamily: "'VT323'",
                        fontSize: this.ui.fontSize.xs + 'px',
                        fill: '#ff8888',
                        align: 'center',
                        padding: { x: 5, y: 5 }
                    }).setOrigin(0.5);
                    return; // Skip to next item
                }

                // Create container for item name and icon
                const container = this.add.container(panelX, itemY);

                // Add item name text
                const itemText = this.add.text(0, 0, itemData.inGameName, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.xs + 'px',
                    fill: '#ffffff',
                    align: 'center',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5);

                // Add category icon if it exists
                const typeIconKey = itemData.category?.toUpperCase();
                if (typeIconKey && this.textures.exists(typeIconKey)) {
                    const icon = this.add.image(-itemText.width/2 - 15, 0, typeIconKey)
                        .setDisplaySize(itemIconSize, itemIconSize)
                        .setOrigin(0.5);
                    container.add(icon);
                }

                // Add text to container
                container.add(itemText);
            });

            // --- Handle Overflow ---
            if (lootItemsArray.length > maxItemsToShow) {
                const moreCount = lootItemsArray.length - maxItemsToShow;
                this.add.text(panelX, startY + (maxItemsToShow * itemSpacing), `...and ${moreCount} more items`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.xs + 'px',
                    fill: '#cccccc',
                    align: 'center',
                    padding: { x: 5, y: 5 }
                }).setOrigin(0.5);
            }
        }
    }

    /**
     * Update player stats with loot and check for level up
     */
    updatePlayerStats(combatResult) {
        if (!gameState.player) {
            console.error("Player state not found!");
            return;
        }

        // Initialize inventory if it doesn't exist
        if (!gameState.player.inventory) {
            console.log("Creating new inventory structure");
            gameState.player.inventory = { items: [], maxItems: 20, equipped: {} };
        }
        if (!gameState.player.inventory.items) {
            console.log("Creating new items array");
            gameState.player.inventory.items = [];
        }
        if (!gameState.player.inventory.equipped) {
            console.log("Creating new equipped object");
            gameState.player.inventory.equipped = {};
        }

        // Log initial state (only data we care about)
        const initialState = {
            items: gameState.player.inventory.items,
            equipped: gameState.player.inventory.equipped,
            gold: gameState.player.gold,
            experience: gameState.player.experience
        };
        console.log("CombatResultScene - Initial state:", JSON.parse(JSON.stringify(initialState)));
        console.log("CombatResultScene - Loot to add:", combatResult.loot);

        // Add experience and gold
        if (combatResult.experienceGained) {
            gameState.player.experience = (gameState.player.experience || 0) + combatResult.experienceGained;
        }
        if (combatResult.goldGained) {
            gameState.player.gold = (gameState.player.gold || 0) + combatResult.goldGained;
        }

        // Check for level up BEFORE adding items (important for some game logic)
        if (gameState.player.experience >= gameState.player.experienceToNextLevel) {
            this.handleLevelUp();
        }
        // Check for player level up AFTER adding experience
        if (gameState.player && gameState.player.experience >= gameState.player.experienceToNextLevel) {
            // Call CharacterManager to handle the level up logic consistently
            if (typeof CharacterManager !== 'undefined' && CharacterManager.applyLevelUp) {
                CharacterManager.applyLevelUp(gameState.player);
                this.displayLevelUpMessage(); // Separate UI display logic
    } else {
         console.warn("CharacterManager or applyLevelUp not available. Level up stats not applied.");
         // Fallback basic level up if needed, but ideally use CharacterManager
    }
}
        // Only restore mana if the outcome wasn't a defeat where perhaps penalties apply
        if (combatResult.outcome === 'victory' || combatResult.outcome === 'retreat') {
            const maxMana = gameState.player.maxMana || 50; // Get max mana (with fallback)
            const manaToRestore = Math.floor(maxMana * 0.20); // Calculate 20%

            if (manaToRestore > 0) {
                console.log(`Restoring ${manaToRestore} mana (20% of ${maxMana}) after combat.`);
                // Use HealthManager to safely add mana, respecting the cap
                HealthManager.updatePlayerMana(manaToRestore, true); // true for relative update
            }
        }
        // --- >>> END MANA RESTORE <<< ---
        // Add items to inventory
        const lootItemsArray = combatResult.loot || [];
        if (lootItemsArray.length > 0) {
            lootItemsArray.forEach(itemId => {
                if (gameState.player.inventory.items.length >= gameState.player.inventory.maxItems) {
                    console.warn("Inventory is full, cannot add item:", itemId);
                    return;
                }

                const itemData = getItemData(itemId);
                if (!itemData) {
                    console.warn(`Item data not found for ID: ${itemId}`);
                    return;
                }

                console.log(`Processing item ${itemId}:`, {
                    itemData: itemData,
                    type: itemData.type,
                    category: itemData.category,
                    stackable: itemData.stackable,
                    currentInventorySize: gameState.player.inventory.items.length
                });

                // Handle stackable items
                if (itemData.stackable) {
                    const existingItemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === itemId);
                    if (existingItemIndex > -1) {
                        // Ensure quantity exists before incrementing
                        const currentQuantity = gameState.player.inventory.items[existingItemIndex].quantity || 0;
                        gameState.player.inventory.items[existingItemIndex].quantity = currentQuantity + 1;
                        console.log(`Incremented stack for ${itemId}. New quantity: ${gameState.player.inventory.items[existingItemIndex].quantity}`);
                    } else {
                        // Add new stack with explicit quantity of 1
                        const newItem = { itemId: itemId, quantity: 1 };
                        gameState.player.inventory.items.push(newItem);
                        console.log(`Added new stack for ${itemId}:`, newItem);
                    }
                } else {
                    // Add non-stackable item
                    const newItem = { itemId: itemId, quantity: 1 };
                    gameState.player.inventory.items.push(newItem);
                    console.log(`Added non-stackable item ${itemId}:`, newItem);
                }
            });

            // Log final state (only data we care about)
            const finalState = {
                items: gameState.player.inventory.items,
                equipped: gameState.player.inventory.equipped,
                gold: gameState.player.gold,
                experience: gameState.player.experience
            };
            console.log("CombatResultScene - Final state:", JSON.parse(JSON.stringify(finalState)));
        }

        // Save only the necessary game state data
        const savedState = {
            player: {
                name: gameState.player.name,
                class: gameState.player.class,
                level: gameState.player.level,
                health: gameState.player.health,
                maxHealth: gameState.player.maxHealth,
                mana: gameState.player.mana,
                maxMana: gameState.player.maxMana,
                experience: gameState.player.experience,
                experienceToNextLevel: gameState.player.experienceToNextLevel,
                gold: gameState.player.gold,
                inventory: {
                    items: gameState.player.inventory.items,
                    maxItems: gameState.player.inventory.maxItems,
                    equipped: gameState.player.inventory.equipped
                }
            }
        };

        // Save state and verify it was saved correctly
        window.localStorage.setItem('gameState', JSON.stringify(savedState));
        const verifyState = window.localStorage.getItem('gameState');
        if (verifyState) {
            const parsedVerify = JSON.parse(verifyState);
            console.log("Verified saved state:", {
                itemCount: parsedVerify.player.inventory.items.length,
                items: parsedVerify.player.inventory.items.map(i => `${i.itemId} (x${i.quantity})`)
            });
        }
    }
    
    displayLevelUpMessage() {
        if (!this.ui) { // Add safety check just in case
            console.error("UIManager (this.ui) not available in displayLevelUpMessage!");
            return;
        }
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const levelText = this.ui.createTitle(width/2, height * 0.38,
            `LEVEL UP! You are now level ${gameState.player.level}`, {
            fontSize: this.ui.fontSize.sm, color: '#ffff00',
        });
        // Animate the level up text
        this.tweens.add({
             targets: levelText,
             alpha: { from: 0, to: 1 },
             y: height * 0.35,
             scale: { from: 0.5, to: 1.1 },
             duration: 800,
             ease: 'Bounce.easeOut',
             onComplete: () => {
                 this.tweens.add({
                     targets: levelText, alpha: 0, delay: 1500, duration: 500,
                     onComplete: () => { if (levelText.active) levelText.destroy(); } // Check active
                 });
             }
         });
    }
    /**
     * Handle player level up mechanics
     */
    handleLevelUp() {
        console.log("handleLevelUp called - UI display responsibility moved.");
/*
        // NOTE: This assumes a simple level-up mechanic. Adjust as needed.
        // Consider moving complex level-up logic to CharacterManager.js
        if (!gameState.player) return;

        let levelsGained = 0;
        while (gameState.player.experience >= gameState.player.experienceToNextLevel) {
            gameState.player.experience -= gameState.player.experienceToNextLevel;
            gameState.player.level++;
            levelsGained++;

            // Example Stat Increases (customize based on class/game design)
            gameState.player.maxHealth += 10;
            gameState.player.health += 10;
            gameState.player.maxMana += 5;
            gameState.player.mana = gameState.player.maxMana; // Restore mana
            gameState.player.strength = (gameState.player.strength || 10) + 1;
            gameState.player.agility = (gameState.player.agility || 10) + 1;
            gameState.player.intelligence = (gameState.player.intelligence || 10) + 1;
            // gameState.player.constitution = (gameState.player.constitution || 10) + 1; // If using constitution

            // Calculate new XP threshold (example: increases by 20%)
            gameState.player.experienceToNextLevel = Math.floor(gameState.player.experienceToNextLevel * 1.2);
        }

        // If levels were gained, show level up message
        if (levelsGained > 0) {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;

            const levelText = this.ui.createTitle(width/2, height * 0.38, // Adjusted Y position
                `LEVEL UP! You are now level ${gameState.player.level}`, {
                fontSize: this.ui.fontSize.sm,
                color: '#ffff00', // Bright Yellow
            });

            // Animate the level up text
            this.tweens.add({
                targets: levelText,
                alpha: { from: 0, to: 1 },
                y: height * 0.35, // Move slightly up
                scale: { from: 0.5, to: 1.1 },
                duration: 800,
                ease: 'Bounce.easeOut', // Bouncy effect
                onComplete: () => {
                    // Hold and fade out
                    this.tweens.add({
                        targets: levelText,
                        alpha: 0,
                        delay: 1500,
                        duration: 500,
                        onComplete: () => { levelText.destroy(); }
                    });
                }
            });
            // Optionally play level up sound
            // this.sound.play('level-up-sound');
        }
        */
    }

    /**
     * Create navigation buttons
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get combat result data
        const combatResult = this.combatResult;
        const isVictory = combatResult.outcome === 'victory';
        //const isDefeat = combatResult.outcome === 'defeat';

        // Default button positions
        const buttonY = height * 0.85; // Position buttons lower
        const leftButtonX = width * 0.35;
        const rightButtonX = width * 0.65;
        const buttonWidth = 200;
        const buttonHeight = 50;

        // --- Only show these specific buttons on VICTORY ---
        if (isVictory) {
            // --- Continue Exploring Button (Back to Dungeon) ---
            new Button(
                this,
                leftButtonX,
                buttonY,
                'Continue', // Changed label for clarity
                () => {
                    this.safePlaySound('button-click'); // Play sound on click
                    this.continueExploring(); // Only call the function that handles the logic
                    // NO redundant console.log here
                    // NO redundant check for gameState.currentDungeon here
                    // NO redundant this.transitions.fade here
                },
                {
                    width: buttonWidth,
                    height: buttonHeight,
                    fillColor: 0x00cc66, // Green color for continue/advance
                    hoverColor: 0x009933
                }
            );

            // --- Leave Dungeon Button (Back to Overworld) ---
            new Button(
                this,
                rightButtonX,
                buttonY,
                'Overworld', // Changed label for clarity
                () => {
                    console.log("CombatResultScene: Leave Dungeon selected.");
                    this.safePlaySound('button-click'); // Play sound
                    // Clear current dungeon state when leaving? Optional.
                    // gameState.currentDungeon = null;
                    this.transitions.fade(() => {
                        navigationManager.navigateTo(this, 'OverworldScene');
                    });
                },
                {
                    width: buttonWidth,
                    height: buttonHeight,
                    fillColor: 0x336699, // Blue/neutral color for leaving
                    hoverColor: 0x224466
                }
            );
        } else {
             // --- Fallback for other outcomes (Retreat/Defeat) ---
             // If this scene *is* shown on retreat/defeat, provide a simple way out.
             // Usually, defeat/retreat might go directly to DefeatScene or OverworldScene.
             new Button(
                this,
                width / 2, // Centered button
                buttonY,
                'Return to Overworld',
                () => {
                     console.log("CombatResultScene: Returning to Overworld (Fallback).");
                     this.safePlaySound('button-click'); // Play sound
                    this.transitions.fade(() => {
                        navigationManager.navigateTo(this, 'OverworldScene');
                    });
                },
                {
                    width: buttonWidth + 40, // Slightly wider
                    height: buttonHeight,
                    fillColor: 0x555555,
                    hoverColor: 0x333333
                }
            );
        }
    }
}
export default CombatResultScene;