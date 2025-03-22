import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';

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
        this.load.image('combat-bg', 'https://labs.phaser.io/assets/skies/space3.png');
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
        this.add.image(width/2, height/2, 'combat-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Determine if this is a victory or retreat
        const isRetreat = this.scene.settings.data?.condition === 'Retreat with Loot';
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, isRetreat ? 'Retreat Successful' : 'Victory!', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create the combat results display
        this.createCombatResults(isRetreat);
        
        // Create the loot display
        this.createLootDisplay();
        
        // Create navigation buttons
        this.createNavigationButtons(isRetreat);
    }
    
    /**
     * Create the combat results display
     * @param {boolean} isRetreat - Whether this is a retreat or victory
     */
    createCombatResults(isRetreat) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get data from scene settings
        const data = this.scene.settings.data || {};
        const enemies = data.enemies || [];
        const loot = data.loot || { gold: 0, items: [], experience: 0 };
        
        // Create a panel for the results
        const panel = this.ui.createPanel(
            width/2,
            height * 0.3,
            width * 0.8,
            height * 0.25,
            {
                fillColor: 0x111122,
                fillAlpha: 0.8,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Create title for the results
        let resultTitle;
        if (isRetreat) {
            resultTitle = 'You managed to escape with some loot!';
        } else {
            resultTitle = `You defeated ${enemies.length} ${enemies.length === 1 ? 'enemy' : 'enemies'}!`;
        }
        
        this.add.text(width/2, height * 0.2, resultTitle, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add experience gained
        this.add.text(width/2, height * 0.27, `Experience gained: ${loot.experience}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add gold gained
        this.add.text(width/2, height * 0.32, `Gold gained: ${loot.gold}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Update player stats
        this.updatePlayerStats(loot);
    }
    
    /**
     * Create the loot display
     */
    createLootDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get loot data
        const data = this.scene.settings.data || {};
        const loot = data.loot || { gold: 0, items: [], experience: 0 };
        
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
        
        // Add continue button
        this.createContinueButton();
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
     * Create the continue button
     */
    createContinueButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create continue button
        const continueButton = new Button(
            this,
            width/2,
            height * 0.85,
            'CONTINUE',
            () => {
                this.handleContinue();
            },
            {
                width: 180,
                height: 60,
                backgroundColor: 0x3366cc
            }
        );
    }
    
    /**
     * Handle continue button click
     */
    handleContinue() {
        console.log('Continuing to dungeon...');
        
        // Use fade transition to return to dungeon
        this.transitions.fade(() => {
            // Return to dungeon scene
            navigationManager.navigateTo(this, 'DungeonScene');
        });
    }
    
    /**
     * Create navigation buttons
     * @param {boolean} isRetreat - Whether this is a retreat or victory
     */
    createNavigationButtons(isRetreat) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        if (isRetreat) {
            // If retreating, show button to return to town
            const returnButton = new Button(
                this,
                width * 0.5,
                height * 0.85,
                'RETURN TO TOWN',
                () => {
                    console.log('Returning to town');
                    navigationManager.navigateTo(this, 'PostRunSummaryScene', {}, 'Retreat with Loot');
                },
                {
                    width: 240,
                    height: 50
                }
            );
        } else {
            // If victorious, show button to continue to next level
            const continueButton = new Button(
                this,
                width * 0.5,
                height * 0.85,
                'CONTINUE TO NEXT LEVEL',
                () => {
                    console.log('Continuing to next level');
                    navigationManager.navigateTo(this, 'DungeonScene', {}, 'Next Level');
                },
                {
                    width: 280,
                    height: 50
                }
            );
        }
    }
}

export default CombatResultScene;
