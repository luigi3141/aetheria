import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';

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
        
        // Load transition assets
        this.load.spritesheet('door', 'https://labs.phaser.io/assets/sprites/metalslug_mummy37x45.png', { 
            frameWidth: 37, 
            frameHeight: 45 
        });
        this.load.audio('door-open', 'assets/audio/door_open.wav');
        this.load.audio('combat-start', 'assets/audio/sword.wav');
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
        
        // Get dungeon data from gameState
        const discoveredDungeons = gameState.dungeons.discovered || [];
        const dungeonTemplates = gameState.dungeonTemplates || {};
        
        // Create a panel for each discovered dungeon
        const startY = height * 0.25;
        const spacing = height * 0.15;
        
        let dungeonCount = 0;
        
        // Loop through discovered dungeons
        discoveredDungeons.forEach((dungeonId, index) => {
            // Get dungeon template
            const dungeon = dungeonTemplates[dungeonId];
            
            if (!dungeon) {
                console.warn(`Dungeon template not found for ID: ${dungeonId}`);
                return;
            }
            
            dungeonCount++;
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
            
            // Get difficulty text based on dungeon level
            const difficultyText = this.getDifficultyText(dungeon.level);
            
            this.add.text(infoX, y + 15, `Level: ${dungeon.level} | Difficulty: ${difficultyText}`, {
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
                    this.enterDungeon(dungeonId);
                },
                {
                    width: 100,
                    height: 40
                }
            );
        });
        
        // If no dungeons are available, show a message
        if (dungeonCount === 0) {
            this.add.text(width * 0.5, height * 0.4, 'No dungeons available yet.\nExplore the world to discover dungeons!', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    /**
     * Get difficulty text based on level
     */
    getDifficultyText(level) {
        if (level <= 1) return 'Easy';
        if (level <= 3) return 'Normal';
        if (level <= 5) return 'Hard';
        if (level <= 8) return 'Very Hard';
        return 'Extreme';
    }
    
    /**
     * Enter the selected dungeon
     */
    enterDungeon(dungeonId) {
        console.log(`Entering dungeon: ${dungeonId}`);
        
        // Get dungeon template
        const dungeonTemplate = gameState.dungeonTemplates[dungeonId];
        
        if (!dungeonTemplate) {
            console.error(`Dungeon template not found for ID: ${dungeonId}`);
            return;
        }
        
        // Create a new dungeon instance from the template
        const totalRooms = Phaser.Math.Between(
            dungeonTemplate.minRooms || 5, 
            dungeonTemplate.maxRooms || 8
        );
        
        // Set current dungeon in gameState
        gameState.currentDungeon = {
            id: dungeonId,
            name: dungeonTemplate.name,
            level: dungeonTemplate.level,
            totalRooms: totalRooms,
            currentRoom: 1,
            enemies: dungeonTemplate.enemies,
            bosses: dungeonTemplate.bosses,
            treasureChance: dungeonTemplate.treasureChance || 0.3,
            emptyRoomChance: dungeonTemplate.emptyRoomChance || 0.2
        };
        
        console.log('Initialized dungeon:', gameState.currentDungeon);
        
        // Use dungeon entry transition
        this.transitions.dungeonEntry(() => {
            // Navigate to dungeon scene
            navigationManager.navigateTo(this, 'DungeonScene');
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
