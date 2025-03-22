import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

/**
 * DungeonSelectScene - Scene for selecting which dungeon to explore
 */
class DungeonSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonSelectScene' });
    }

    preload() {
        // Load dungeon selection assets
        this.load.image('dungeon-bg', 'https://labs.phaser.io/assets/skies/space2.png');
        this.load.image('dungeon-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'dungeon-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Dungeon Selection', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create dungeon selection grid
        this.createDungeonGrid();
        
        // Create back button
        this.createBackButton();
    }
    
    /**
     * Create the dungeon selection grid
     */
    createDungeonGrid() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Sample dungeon data - in a real implementation, this would come from gameState
        const dungeons = [
            { name: "Forest Ruins", level: 1, difficulty: "Easy" },
            { name: "Crystal Caves", level: 5, difficulty: "Medium" },
            { name: "Shadow Temple", level: 10, difficulty: "Hard" },
            { name: "Dragon's Lair", level: 15, difficulty: "Very Hard" }
        ];
        
        // Create a panel for each dungeon
        const startY = height * 0.25;
        const spacing = height * 0.15;
        
        dungeons.forEach((dungeon, index) => {
            const y = startY + (index * spacing);
            
            // Create dungeon panel
            const panel = this.ui.createPanel(
                width * 0.5,
                y,
                width * 0.8,
                80,
                {
                    fillColor: 0x111122,
                    fillAlpha: 0.7,
                    borderColor: 0x3399ff,
                    borderThickness: 2
                }
            );
            
            // Add dungeon icon
            const iconX = width * 0.2;
            this.add.image(iconX, y, 'dungeon-icon').setDisplaySize(60, 60);
            
            // Add dungeon info
            const infoX = width * 0.4;
            this.add.text(infoX, y - 15, dungeon.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5);
            
            this.add.text(infoX, y + 15, `Level: ${dungeon.level} | Difficulty: ${dungeon.difficulty}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#aaaaaa'
            }).setOrigin(0, 0.5);
            
            // Add enter button
            const enterButton = new Button(
                this,
                width * 0.8,
                y,
                'ENTER',
                () => {
                    console.log(`Entering dungeon: ${dungeon.name}`);
                    gameState.currentDungeon = dungeon;
                    navigationManager.navigateTo(this, 'DungeonScene');
                },
                {
                    width: 100,
                    height: 40
                }
            );
        });
    }
    
    /**
     * Create back button to return to overworld
     */
    createBackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create back button
        const backButton = new Button(
            this,
            width * 0.5,
            height * 0.9,
            'BACK TO TOWN',
            () => {
                console.log('Back to town clicked');
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            {
                width: 200,
                height: 50
            }
        );
    }
}

export default DungeonSelectScene;
