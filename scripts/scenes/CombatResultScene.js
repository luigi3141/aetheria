import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';

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
    }

    preload() {
        // Load combat result assets
        this.load.image('combat-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);
        this.load.image('loot-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
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
        const isRetreat = combatResult.outcome === 'retreat';
        const isVictory = combatResult.outcome === 'victory';
        const isDefeat = combatResult.outcome === 'defeat';
        
        // Create the title based on outcome
        let titleText = 'Victory!';
        if (isRetreat) {
            titleText = 'Retreat Successful';
        } else if (isDefeat) {
            titleText = 'Defeat';
        }
        
        this.ui.createTitle(width/2, height * 0.08, titleText, {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create the combat results display
        this.createResultsDisplay();
        
        // Create the loot display if there is loot
        if (combatResult.loot && (isVictory || isRetreat)) {
            this.createLootDisplay();
        }
        
        // Create navigation buttons
        this.createNavigationButtons();
    }
    
    /**
     * Create the results display
     */
    createResultsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get combat result data
        const combatResult = gameState.combatResult || {};
        const isVictory = combatResult.outcome === 'victory';
        const isRetreat = combatResult.outcome === 'retreat';
        const isDefeat = combatResult.outcome === 'defeat';
        
        // Create title for the results
        let resultTitle;
        if (isRetreat) {
            resultTitle = 'You managed to escape safely!';
        } else if (isVictory) {
            resultTitle = `You defeated the ${combatResult.enemyName || 'enemy'}!`;
        } else if (isDefeat) {
            resultTitle = 'You were defeated in battle!';
        } else {
            resultTitle = 'Battle concluded.';
        }
        
        this.ui.createTitle(width/2, height * 0.2, resultTitle, {
            fontSize: this.ui.fontSize.md,
            padding: 10
        });
        
        // Add experience gained
        if (isVictory) {
            this.ui.createTitle(width/2, height * 0.27, `Experience gained: ${combatResult.experienceGained}`, {
                fontSize: this.ui.fontSize.md,
                color: '#00ff00',
                padding: 5
            });
            
            // Add gold gained
            this.ui.createTitle(width/2, height * 0.32, `Gold gained: ${combatResult.goldGained}`, {
                fontSize: this.ui.fontSize.md,
                color: '#ffff00',
                padding: 5
            });
        }
        
        // Update player stats
        if (isVictory) {
            this.updatePlayerStats(combatResult);
        }
    }
    
    /**
     * Create the loot display
     */
    createLootDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get loot data
        const combatResult = gameState.combatResult || {};
        const lootItemsArray = combatResult.loot || [];
        
        // Create a panel for the loot
        const panel = this.ui.createPanel(
            width/2,
            height * 0.5,
            width * 0.5,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.8,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Create title for the loot
        this.add.text(width/2, height * 0.45, 'Items Acquired', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display items or "No items" message
        if (lootItemsArray.length > 0) {
            // Display up to 5 items
            const displayItems = lootItemsArray.slice(0, 5);
            const startY = height * 0.5;
            const spacing = 30;
            
            displayItems.forEach((itemId, index) => {
                // Display the item ID (or fetch item name from an item database if available)
                let itemName = itemId; // Replace with item lookup if you have item data
                
                this.add.text(width/2, startY + (index * spacing), `- ${itemName}`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.md + 'px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
            });
            
            // If there are more items, show a message
            if (lootItemsArray.length > 5) {
                const moreCount = lootItemsArray.length - 5;
                this.add.text(width/2, startY + (5 * spacing), `...and ${moreCount} more items`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.md + 'px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
            }
        } else {
            // No items message
            this.add.text(width/2, height * 0.55, 'No items found', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    /**
     * Update player stats with loot
     */
    updatePlayerStats(combatResult) {
        // Add experience and gold
        if (combatResult.experienceGained) {
            gameState.player.experience = (gameState.player.experience || 0) + combatResult.experienceGained;
        }
        
        if (combatResult.goldGained) {
            gameState.player.gold = (gameState.player.gold || 0) + combatResult.goldGained;
        }
        
        // Check for level up
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
                // Only add if there's space
                if (gameState.player.inventory.items.length < gameState.player.inventory.maxItems) {
                    // Add the item ID (or a placeholder object)
                    // TODO: Replace this with proper item object creation if you have an item database
                    gameState.player.inventory.items.push({ id: itemId, name: itemId, type: 'Unknown' });
                }
            });
        }
    }
    
    /**
     * Handle player level up
     */
    handleLevelUp() {
        // Calculate how many levels gained
        let levelsGained = 0;
        
        while (gameState.player.experience >= gameState.player.experienceToNextLevel) {
            // Subtract experience needed for this level
            gameState.player.experience -= gameState.player.experienceToNextLevel;
            
            // Increase level
            gameState.player.level++;
            levelsGained++;
            
            // Increase stats
            gameState.player.maxHealth += 10;
            gameState.player.health = gameState.player.maxHealth;
            gameState.player.maxMana += 5;
            gameState.player.mana = gameState.player.maxMana;
            gameState.player.strength += 2;
            gameState.player.agility += 1;
            gameState.player.intelligence += 1;
            gameState.player.defense += 1;
            
            // Calculate new experience needed for next level (increases by 20% each level)
            gameState.player.experienceToNextLevel = Math.floor(gameState.player.experienceToNextLevel * 1.2);
        }
        
        // If levels were gained, show level up message
        if (levelsGained > 0) {
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
            
            // Create level up text with animation
            const levelText = this.add.text(width/2, height * 0.4, `LEVEL UP! You are now level ${gameState.player.level}`, {
                fontFamily: "'Press Start 2P'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffff00',
                align: 'center'
            }).setOrigin(0.5).setAlpha(0);
            
            // Animate the level up text
            this.tweens.add({
                targets: levelText,
                alpha: 1,
                y: height * 0.38,
                duration: 1000,
                ease: 'Bounce',
                yoyo: true,
                hold: 1000
            });
        }
    }
    
    /**
     * Create navigation buttons
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get combat result data
        const combatResult = gameState.combatResult || {};
        const isRetreat = combatResult.outcome === 'retreat';
        const isDefeat = combatResult.outcome === 'defeat';
        
        // Create continue button
        const continueButton = new Button(
            this,
            width * 0.35,
            height * 0.85,
            'Explore',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'DungeonScene', {}, 'Next Level');
                });
            },
            {
                width: 200,
                height: 50,
                backgroundColor: 0x3366aa
            }
        );
        
        // Create return to overworld button
        const returnButton = new Button(
            this,
            width * 0.65,
            height * 0.85,
            'Overworld',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'OverworldScene');
                });
            },
            {
                width: 200,
                height: 50,
                backgroundColor: 0x336633
            }
        );
    }
}

export default CombatResultScene;
