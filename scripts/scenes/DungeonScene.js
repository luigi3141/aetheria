import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

/**
 * DungeonScene - Scene for exploring procedurally generated dungeons
 */
class DungeonScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DungeonScene' });
    }

    preload() {
        // Load dungeon assets
        this.load.image('dungeon-floor', 'https://labs.phaser.io/assets/skies/space3.png');
        this.load.image('player-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('enemy-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('chest-sprite', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'dungeon-floor').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Get current dungeon info
        const dungeonName = gameState.currentDungeon?.name || "Unknown Dungeon";
        const dungeonLevel = gameState.currentDungeon?.level || 1;
        
        // Create the dungeon title
        this.ui.createTitle(width/2, height * 0.08, `${dungeonName} - Floor 1`, {
            fontSize: this.ui.fontSize.md
        });
        
        // Create the dungeon map (placeholder)
        this.createDungeonMap();
        
        // Create player character
        this.createPlayer();
        
        // Create UI elements
        this.createUI();
    }
    
    /**
     * Create a placeholder dungeon map
     * In a real implementation, this would be procedurally generated
     */
    createDungeonMap() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a simple grid as placeholder for the dungeon
        const gridSize = 8;
        const cellSize = 50;
        const startX = width/2 - (gridSize * cellSize)/2;
        const startY = height/2 - (gridSize * cellSize)/2;
        
        // Draw grid cells
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                // Randomly determine if this is a wall or floor
                const isWall = Math.random() < 0.2;
                
                const cellX = startX + x * cellSize;
                const cellY = startY + y * cellSize;
                
                const cell = this.add.rectangle(
                    cellX + cellSize/2,
                    cellY + cellSize/2,
                    cellSize - 2,
                    cellSize - 2,
                    isWall ? 0x333333 : 0x666666
                );
                
                // Add some random elements
                if (!isWall && Math.random() < 0.1) {
                    // Add a chest
                    this.add.image(
                        cellX + cellSize/2,
                        cellY + cellSize/2,
                        'chest-sprite'
                    ).setDisplaySize(cellSize * 0.6, cellSize * 0.6);
                } else if (!isWall && Math.random() < 0.15) {
                    // Add an enemy
                    this.add.image(
                        cellX + cellSize/2,
                        cellY + cellSize/2,
                        'enemy-sprite'
                    ).setDisplaySize(cellSize * 0.7, cellSize * 0.7)
                    .setTint(0xff0000);
                }
            }
        }
    }
    
    /**
     * Create the player character
     */
    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add player sprite at the center of the screen
        this.player = this.add.image(
            width/2,
            height/2,
            'player-sprite'
        ).setDisplaySize(40, 40);
        
        // Add a glow effect to the player
        this.player.preFX.addGlow(0xffff00, 4);
    }
    
    /**
     * Create UI elements for the dungeon
     */
    createUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create combat button
        const combatButton = new Button(
            this,
            width * 0.25,
            height * 0.9,
            'COMBAT',
            () => {
                console.log('Combat button clicked');
                navigationManager.navigateTo(this, 'CombatResultScene');
            },
            {
                width: 160,
                height: 50
            }
        );
        
        // Create retreat button
        const retreatButton = new Button(
            this,
            width * 0.75,
            height * 0.9,
            'RETREAT',
            () => {
                console.log('Retreat button clicked');
                // When retreating, we go to the combat result scene with a condition
                navigationManager.navigateTo(this, 'CombatResultScene', {}, 'Retreat with Loot');
            },
            {
                width: 160,
                height: 50
            }
        );
        
        // Create player stats display
        const statsPanel = this.ui.createPanel(
            width * 0.85,
            height * 0.2,
            200,
            100,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add player stats text
        const playerName = gameState.player.name || 'Adventurer';
        const playerHealth = gameState.player.health || 100;
        const playerMana = gameState.player.mana || 50;
        
        this.add.text(width * 0.85, height * 0.2, `${playerName}\nHP: ${playerHealth}/100\nMP: ${playerMana}/50`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
}

export default DungeonScene;
