import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { getItemData } from '../data/items.js';

/**
 * CombatResultScene - Scene that shows the results of combat encounters
 */
class CombatResultScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatResultScene' });
    }

    init(data) {
        // Store any data passed from the previous scene
        this.sceneData = data;
        console.log("CombatResultScene Init:", data);
        console.log("Player State:", gameState.player);
        console.log("Combat Result:", gameState.combatResult);
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
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create UI Manager
        this.ui = new UIManager(this);

        // Create Transition Manager
        this.transitions = new TransitionManager(this);

        // Add background
        this.add.image(width/2, height/2, 'combat-result-bg').setDisplaySize(width, height);

        // Get combat result data from gameState
        const combatResult = gameState.combatResult || {};
        console.log("Combat Result Data:", combatResult);

        const isRetreat = combatResult.outcome === 'retreat';
        const isVictory = combatResult.outcome === 'victory';
        const isDefeat = combatResult.outcome === 'defeat';

        // Create the title based on outcome
        let titleText = 'Victory!';
        let titleColor = '#ffff00'; // Yellow for victory
        if (isRetreat) {
            titleText = 'Retreat Successful';
            titleColor = '#aaaaaa'; // Grey for retreat
        } else if (isDefeat) {
            titleText = 'Defeat';
            titleColor = '#ff0000'; // Red for defeat
        }

        this.ui.createTitle(width/2, height * 0.08, titleText, {
            fontSize: this.ui.fontSize.lg,
            color: titleColor
        });

        // Create the combat results display (XP/Gold)
        this.createResultsDisplay();

        // Create the loot display if there is loot and not a defeat
        if (combatResult.loot && !isDefeat) { // Show loot on victory or retreat (if applicable)
            this.createLootDisplay();
        } else if (isVictory || isRetreat) {
            // Show "No items found" if victory/retreat but no loot array
             this.createLootDisplay(); // Call it to show the "No items found" message
        }

        // Create navigation buttons
        this.createNavigationButtons();
        console.log("CombatResultScene Create End");
    }

    /**
     * Create the results display (XP & Gold)
     */
    createResultsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const combatResult = gameState.combatResult || {};
        const isVictory = combatResult.outcome === 'victory';
        // const isRetreat = combatResult.outcome === 'retreat';
        const isDefeat = combatResult.outcome === 'defeat';

        let resultTitleText = 'Battle Concluded.';
         if (isVictory) {
             resultTitleText = `You defeated ${combatResult.enemyName || 'the enemy'}!`;
         } else if (isDefeat) {
             resultTitleText = 'You were defeated in battle!';
         } else { // Retreat or unknown
             resultTitleText = 'You escaped from the battle.';
         }

        this.add.text(width/2, height * 0.18, resultTitleText, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Display XP and Gold only on Victory
        if (isVictory) {
            const xpGained = combatResult.experienceGained || 0;
            const goldGained = combatResult.goldGained || 0;

            this.add.text(width/2, height * 0.25, `Experience: +${xpGained}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#00ff00', // Green for XP
                align: 'center'
            }).setOrigin(0.5);

             this.add.text(width/2, height * 0.30, `Gold: +${goldGained}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffff00', // Yellow for Gold
                align: 'center'
            }).setOrigin(0.5);

            // Update player stats only if it hasn't been done yet
            // This prevents double application if the scene restarts
            if (!this.statsApplied) {
                this.updatePlayerStats(combatResult);
                this.statsApplied = true; // Flag to prevent re-applying
            }
        }
    }

    /**
     * Create the loot display with icons and names
     */
    createLootDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get loot data
        const combatResult = gameState.combatResult || {};
        const lootItemsArray = combatResult.loot || []; // Array of item IDs (strings)
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
        this.add.text(panelX, panelY - (panelHeight / 2) - 20, 'Items Acquired', { // Position title above panel
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // --- Display Items ---
        const maxItemsToShow = 4; // Limit visible items directly
        const itemSpacingY = 45; // Vertical space between items
        const itemIconSize = 32; // Size of the icon
        const itemTextOffsetX = 25; // Horizontal space between icon and text
        const startY = panelY - (panelHeight / 2) + 35; // Start Y inside the panel

        if (lootItemsArray.length > 0) {
            const displayItems = lootItemsArray.slice(0, maxItemsToShow);

            displayItems.forEach((itemId, index) => {
                const itemData = getItemData(itemId); // Fetch details from item database

                if (!itemData) {
                    console.warn(`Could not find item data for ID: ${itemId}`);
                    // Display placeholder if item data is missing
                     this.add.text(panelX, startY + (index * itemSpacingY), `- Unknown Item (${itemId})`, {
                        fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm + 'px', fill: '#ff8888', align: 'center'
                    }).setOrigin(0.5);
                    return; // Skip to next item
                }

                const itemY = startY + (index * itemSpacingY);
                const itemStartX = panelX - (panelWidth / 2) + 40; // Start X inside panel

                // Display Icon
                if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                     this.add.image(itemStartX, itemY, itemData.iconKey)
                        .setDisplaySize(itemIconSize, itemIconSize)
                        .setOrigin(0.5);
                } else {
                     console.warn(`Icon key "${itemData.iconKey}" not found for item "${itemData.inGameName}". Add to AssetConfig & preload.`);
                     // Optional: Add a placeholder rectangle/sprite if icon missing
                     this.add.rectangle(itemStartX, itemY, itemIconSize, itemIconSize, 0x555555).setOrigin(0.5);
                }

                // Display Name
                this.add.text(itemStartX + itemTextOffsetX, itemY, itemData.inGameName, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#ffffff', // Could add tier color here later if needed
                    align: 'left'
                }).setOrigin(0, 0.5); // Align left, vertically centered
            });

            // --- Handle Overflow ---
            if (lootItemsArray.length > maxItemsToShow) {
                const moreCount = lootItemsArray.length - maxItemsToShow;
                this.add.text(panelX, startY + (maxItemsToShow * itemSpacingY), `...and ${moreCount} more items`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#cccccc',
                    align: 'center'
                }).setOrigin(0.5);
            }
        } else {
            // --- No Items Message ---
            this.add.text(panelX, panelY, 'No items found', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
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

        // Add items to inventory
        const lootItemsArray = combatResult.loot || [];
        if (lootItemsArray.length > 0) {
            // Ensure inventory structure exists
            if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 20, equipped: {} };
            if (!gameState.player.inventory.items) gameState.player.inventory.items = [];

            lootItemsArray.forEach(itemId => {
                if (gameState.player.inventory.items.length >= gameState.player.inventory.maxItems) {
                    console.warn("Inventory is full, cannot add item:", itemId);
                    // Optionally, drop the item on the ground or handle differently
                    return;
                }

                const itemData = getItemData(itemId);
                if (!itemData) return; // Skip if item data not found

                // Handle stackable items
                if (itemData.stackable) {
                    const existingItemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === itemId);
                    if (existingItemIndex > -1) {
                        // Increment quantity of existing stack
                        gameState.player.inventory.items[existingItemIndex].quantity = (gameState.player.inventory.items[existingItemIndex].quantity || 1) + 1;
                        console.log(`Incremented stack for ${itemId}. New quantity: ${gameState.player.inventory.items[existingItemIndex].quantity}`);
                    } else {
                        // Add new stack
                        gameState.player.inventory.items.push({ itemId: itemId, quantity: 1 });
                         console.log(`Added new stack for ${itemId}.`);
                    }
                } else {
                    // Add non-stackable item as a new entry
                    gameState.player.inventory.items.push({ itemId: itemId, quantity: 1 }); // Non-stackable items still have quantity 1
                     console.log(`Added non-stackable item ${itemId}.`);
                }
            });
            console.log("Player Inventory after adding loot:", JSON.parse(JSON.stringify(gameState.player.inventory.items)));
        }
    }

    /**
     * Handle player level up mechanics
     */
    handleLevelUp() {
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
            gameState.player.health = gameState.player.maxHealth; // Heal to full on level up
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

            const levelText = this.add.text(width/2, height * 0.38, // Adjusted Y position
                `LEVEL UP! You are now level ${gameState.player.level}`, {
                fontFamily: "'Press Start 2P'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffff00', // Bright Yellow
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }).setOrigin(0.5).setAlpha(0).setDepth(100); // Ensure it's visible

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
    }

    /**
     * Create navigation buttons
     */
/**
     * Create navigation buttons based on the combat outcome.
     */
createNavigationButtons() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Get combat result data
    const combatResult = gameState.combatResult || {};
    const isVictory = combatResult.outcome === 'victory';
    // const isRetreat = combatResult.outcome === 'retreat'; // We might handle retreat differently later
    // const isDefeat = combatResult.outcome === 'defeat'; // Defeat usually goes to DefeatScene directly

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
                console.log("CombatResultScene: Continue Exploring selected.");
                // Ensure we have dungeon state before returning
                if (!gameState.currentDungeon) {
                     console.warn("No current dungeon state found, returning to Overworld instead.");
                     this.transitions.fade(() => {
                         navigationManager.navigateTo(this, 'OverworldScene');
                     });
                     return;
                }
                // Navigate back to the Dungeon Scene
                this.transitions.fade(() => {
                    // Pass data if needed, e.g., indicating return from combat
                    navigationManager.navigateTo(this, 'DungeonScene', { fromCombat: true });
                });
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