import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

/**
 * PostRunSummaryScene - Scene that shows a summary of the dungeon run after completion
 */
class PostRunSummaryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PostRunSummaryScene' });
    }

    init(data) {
        // Store any data passed from the previous scene
        this.sceneData = data;
    }

    preload() {
        // Load summary assets
        this.load.image('summary-bg', 'https://labs.phaser.io/assets/skies/space1.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'summary-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Dungeon Run Summary', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create the summary display
        this.createSummaryDisplay();
        
        // Create the rewards display
        this.createRewardsDisplay();
        
        // Create return to town button
        this.createReturnButton();
    }
    
    /**
     * Create the dungeon run summary display
     */
    createSummaryDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the summary
        const summaryPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.25,
            width * 0.8,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Get dungeon info
        const dungeonName = gameState.currentDungeon?.name || "Unknown Dungeon";
        const dungeonLevel = gameState.currentDungeon?.level || 1;
        
        // Generate some sample run stats
        const floorsCleared = Math.floor(Math.random() * 3) + 1;
        const enemiesDefeated = floorsCleared * (Math.floor(Math.random() * 5) + 3);
        const chestsOpened = floorsCleared * (Math.floor(Math.random() * 3) + 1);
        const timeSpent = Math.floor(Math.random() * 20) + 10; // minutes
        
        // Add the summary text
        const summaryText = this.add.text(width * 0.5, height * 0.25, 
            `Dungeon: ${dungeonName} (Level ${dungeonLevel})\n\n` +
            `Floors Cleared: ${floorsCleared}\n` +
            `Enemies Defeated: ${enemiesDefeated}\n` +
            `Chests Opened: ${chestsOpened}\n` +
            `Time Spent: ${timeSpent} minutes`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
    
    /**
     * Create the rewards display
     */
    createRewardsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the rewards
        const rewardsPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.55,
            width * 0.8,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0xffcc00,
                borderThickness: 2
            }
        );
        
        // Create rewards title
        this.add.text(width * 0.5, height * 0.45, 'REWARDS EARNED', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Generate some sample rewards
        const experienceGained = Math.floor(Math.random() * 300) + 200;
        const goldFound = Math.floor(Math.random() * 200) + 100;
        const itemsFound = Math.floor(Math.random() * 5) + 2;
        
        // Display the rewards
        const rewardsText = this.add.text(width * 0.5, height * 0.55, 
            `Experience: ${experienceGained}\n` +
            `Gold: ${goldFound}\n` +
            `Items: ${itemsFound}\n\n` +
            `Your character has grown stronger!`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Update player stats
        gameState.player.experience = (gameState.player.experience || 0) + experienceGained;
        gameState.player.gold = (gameState.player.gold || 0) + goldFound;
        
        // Check for level up
        const currentLevel = gameState.player.level || 1;
        const newLevel = Math.floor((gameState.player.experience || 0) / 1000) + 1;
        
        if (newLevel > currentLevel) {
            gameState.player.level = newLevel;
            
            // Show level up message
            const levelUpText = this.add.text(width * 0.5, height * 0.7, 
                `LEVEL UP! You are now level ${newLevel}!`,
                {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.md + 'px',
                    fill: '#ffcc00',
                    align: 'center'
                }
            ).setOrigin(0.5);
            
            // Add a glow effect
            levelUpText.preFX.addGlow(0xffcc00, 4);
            
            // Add a scale animation
            this.tweens.add({
                targets: levelUpText,
                scale: 1.2,
                duration: 500,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut'
            });
        }
    }
    
    /**
     * Create return to town button
     */
    createReturnButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create return button
        const returnButton = new Button(
            this,
            width * 0.5,
            height * 0.85,
            'RETURN TO TOWN',
            () => {
                console.log('Returning to town');
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            {
                width: 240,
                height: 50
            }
        );
        
        // Add shine effect to the button
        returnButton.addShineEffect();
    }
}

export default PostRunSummaryScene;
