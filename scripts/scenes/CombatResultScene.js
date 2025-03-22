import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

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
        
        // Create a panel for the results
        const resultsPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.25,
            width * 0.8,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: isRetreat ? 0xffcc00 : 0x33ff33,
                borderThickness: 2
            }
        );
        
        // Generate some sample combat stats
        const enemiesDefeated = isRetreat ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5) + 3;
        const experienceGained = enemiesDefeated * 25;
        const goldFound = enemiesDefeated * 15 + Math.floor(Math.random() * 50);
        
        // Add the results text
        const resultsText = this.add.text(width * 0.5, height * 0.25, 
            `${isRetreat ? 'You managed to escape with some loot!' : 'You were victorious in combat!'}\n\n` +
            `Enemies Defeated: ${enemiesDefeated}\n` +
            `Experience Gained: ${experienceGained}\n` +
            `Gold Found: ${goldFound}`,
            {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Update the player's stats in the game state
        gameState.player.experience = (gameState.player.experience || 0) + experienceGained;
        gameState.player.gold = (gameState.player.gold || 0) + goldFound;
    }
    
    /**
     * Create the loot display
     */
    createLootDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the loot
        const lootPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.55,
            width * 0.8,
            height * 0.3,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x9966ff,
                borderThickness: 2
            }
        );
        
        // Create loot title
        this.add.text(width * 0.5, height * 0.45, 'LOOT FOUND', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffcc00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Generate some random loot items
        const lootItems = [
            { name: 'Iron Sword', type: 'Weapon', rarity: 'Common', stats: '+5 Attack' },
            { name: 'Leather Boots', type: 'Armor', rarity: 'Common', stats: '+3 Defense' },
            { name: 'Magic Amulet', type: 'Accessory', rarity: 'Rare', stats: '+10 Magic' }
        ];
        
        // Display the loot items
        const startY = height * 0.5;
        const spacing = height * 0.08;
        
        lootItems.forEach((item, index) => {
            const y = startY + (index * spacing);
            
            // Add item icon
            this.add.image(width * 0.25, y, 'loot-icon')
                .setDisplaySize(40, 40)
                .setTint(item.rarity === 'Common' ? 0xffffff : 0xffcc00);
            
            // Add item name and stats
            this.add.text(width * 0.3, y - 10, item.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: item.rarity === 'Common' ? '#ffffff' : '#ffcc00',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            this.add.text(width * 0.3, y + 10, `${item.type} | ${item.stats}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#aaaaaa',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            // Add a take button
            const takeButton = new Button(
                this,
                width * 0.8,
                y,
                'TAKE',
                () => {
                    console.log(`Taking item: ${item.name}`);
                    // Add item to inventory
                    if (!gameState.inventory) gameState.inventory = [];
                    gameState.inventory.push(item);
                },
                {
                    width: 80,
                    height: 30
                }
            );
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
