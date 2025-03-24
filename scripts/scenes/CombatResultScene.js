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
        
        // Get enemy data - handle both single enemy and multiple enemies
        let enemy = null;
        let enemies = [];
        
        if (combatResult.enemy) {
            // Single enemy format
            enemy = combatResult.enemy;
            enemies = [enemy];
        } else if (combatResult.enemies && Array.isArray(combatResult.enemies)) {
            // Multiple enemies format (legacy)
            enemies = combatResult.enemies;
            enemy = enemies[0];
        }
        
        // Create title for the results
        let resultTitle;
        if (isRetreat) {
            resultTitle = 'You managed to escape safely!';
        } else if (isVictory) {
            resultTitle = `You defeated the ${enemy ? enemy.name : 'enemy'}!`;
        } else if (isDefeat) {
            resultTitle = 'You were defeated in battle!';
        } else {
            resultTitle = 'Battle concluded.';
        }
        
        this.add.text(width/2, height * 0.2, resultTitle, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add experience gained
        if (combatResult.loot) {
            this.add.text(width/2, height * 0.27, `Experience gained: ${combatResult.loot.experience}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add gold gained
            this.add.text(width/2, height * 0.32, `Gold gained: ${combatResult.loot.gold}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffff00',
                align: 'center'
            }).setOrigin(0.5);
        }
        
        // Update player stats
        if (combatResult.loot) {
            this.updatePlayerStats(combatResult.loot);
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
        const loot = combatResult.loot || { gold: 0, items: [], experience: 0 };
        
        // Create a panel for the loot
        const panel = this.ui.createPanel(
            width/2,
            height * 0.6,
            width * 0.8,
            height * 0.3,
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
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display items or "No items" message
        if (loot.items && loot.items.length > 0) {
            // Display up to 5 items
            const displayItems = loot.items.slice(0, 5);
            const startY = height * 0.5;
            const spacing = 30;
            
            displayItems.forEach((item, index) => {
                // Try to get item name from templates
                let itemName = item;
                
                this.add.text(width/2, startY + (index * spacing), `- ${itemName}`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.md + 'px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
            });
            
            // If there are more items, show a message
            if (loot.items.length > 5) {
                const moreCount = loot.items.length - 5;
                this.add.text(width/2, startY + (5 * spacing), `...and ${moreCount} more items`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#aaaaaa',
                    align: 'center'
                }).setOrigin(0.5);
            }
        } else {
            // No items message
            this.add.text(width/2, height * 0.55, 'No items found', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#aaaaaa',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    /**
     * Update player stats with loot
     */
    updatePlayerStats(loot) {
        // Add experience
        gameState.player.experience += loot.experience;
        
        // Check for level up
        if (gameState.player.experience >= gameState.player.experienceToNextLevel) {
            this.handleLevelUp();
        }
        
        // Add gold
        gameState.player.gold += loot.gold;
        
        // Add items to inventory
        if (loot.items && loot.items.length > 0) {
            loot.items.forEach(item => {
                // Only add if there's space
                if (gameState.player.inventory.items.length < gameState.player.inventory.maxItems) {
                    gameState.player.inventory.items.push(item);
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
            'Continue Exploring',
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
            'Return to Town',
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
