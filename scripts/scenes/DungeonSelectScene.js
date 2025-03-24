import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { getAllDungeons, canAccessDungeon } from '../data/DungeonConfig.js';
import BaseScene from './BaseScene.js';

/**
 * DungeonSelectScene - Scene for selecting which dungeon to explore
 */
class DungeonSelectScene extends BaseScene {
    constructor() {
        super('DungeonSelectScene');
    }

    preload() {
        // Load dungeon selection assets with unique keys
        this.load.image('select-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
        
        // Load dungeon background images for previews
        this.load.image('forest-bg', ASSET_PATHS.BACKGROUNDS.FOREST);
        this.load.image('caverns-bg', ASSET_PATHS.BACKGROUNDS.CAVERNS);
        
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
        
        // Initialize base scene components
        this.initializeScene();
        
        // Add background with unique key
        this.add.image(width/2, height/2, 'select-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Dungeon Selection', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create dungeon selection grid
        this.createDungeonSelection();
        
        // Add back button
        this.ui.createButton(
            width * 0.5,
            height * 0.9,
            'BACK TO TOWN',
            () => {
                navigationManager.navigateTo(this, 'MainMenuScene');
            },
            {
                width: 200,
                height: 50
            }
        );
    }
    
    /**
     * Create dungeon selection grid
     */
    createDungeonSelection() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Get all available dungeons
        const dungeons = getAllDungeons();
        
        // Calculate spacing
        const startY = height * 0.4;
        const spacing = height * 0.22; // Increased from 0.25 to 0.33 for better separation
        
        // Calculate panel dimensions
        const panelWidth = width * 0.75;
        const panelHeight = height * 0.16; // Reduced from 0.2 to 0.16
        
        // Create panel for dungeon list
        this.ui.createPanel(
            width * 0.5,
            height * 0.52, 
            width * 0.8,
            height * 0.7, 
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Create dungeon entries
        dungeons.forEach((dungeon, index) => {
            const y = startY + (index * spacing);
            
            // Create panel for this dungeon
            this.ui.createPanel(
                width * 0.5,
                y,
                panelWidth,
                panelHeight,
                {
                    fillColor: 0x222244,
                    fillAlpha: 0.8,
                    borderColor: 0x5599ff,
                    borderThickness: 1
                }
            );
            
            // Add dungeon icon/preview
            const iconX = width * 0.25;
            this.add.image(iconX, y, dungeon.backgroundKey)
                .setDisplaySize(120, 80) // Increased size from 100,70 to 120,80
                .setOrigin(0.5);
            
            // Add dungeon info
            const infoX = width * 0.38; // Moved from 0.5 to 0.45 to align left from center
            
            // Dungeon name
            this.add.text(infoX, y - 30, dungeon.name, {
                fontFamily: "'VT323'", 
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff'
            }).setOrigin(0, 0.5); // Changed from center (0.5) to left-aligned (0, 0.5)
            
            // Dungeon description
            this.add.text(infoX, y, dungeon.previewText, {
                fontFamily: "'VT323'", 
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#cccccc',
                wordWrap: { width: width * 0.30 } // Reduced from 0.4 to 0.3
            }).setOrigin(0, 0.5); // Changed from center (0.5, 0.5) to left-aligned (0, 0.5)
            
            // Dungeon level requirement
            const levelColor = gameState.player.level >= dungeon.minLevel ? '#00ff00' : '#ff0000';
            
            
            // Add enter button - positioned relative to panel edge
            const canAccess = canAccessDungeon(gameState.player, dungeon.id);
            const buttonX = width * 0.5 + (panelWidth / 2) - 70; // Positioned to right edge of panel
            
            const enterButton = new Button(
                this,
                buttonX,
                y,
                'ENTER',
                () => {
                    // Set current dungeon in game state
                    gameState.currentDungeon = {
                        id: dungeon.id,
                        name: dungeon.name,
                        level: 1, // Starting level
                        minRooms: dungeon.minRooms,
                        maxRooms: dungeon.maxRooms,
                        backgroundKey: dungeon.backgroundKey
                    };
                    
                    // Navigate to dungeon
                    this.transitions.fade(() => {
                        navigationManager.navigateTo(this, 'DungeonScene');
                    });
                },
                {
                    width: 100,
                    height: 40,
                    fontSize: this.ui.fontSize.sm,
                    disabled: !canAccess
                }
            );
            
            // Show lock icon or access message - positioned below button
            if (!canAccess) {
                this.add.text(buttonX, y + 26, `Level Required: ${dungeon.minLevel}`, {
                    fontFamily: "'VT323'", 
                    fontSize: this.ui.fontSize.xs + 'px',
                    fill: '#ff9999'
                }).setOrigin(0.5);
            }
        });
    }
}

export default DungeonSelectScene;
