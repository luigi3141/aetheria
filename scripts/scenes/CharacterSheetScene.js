import gameState from '../utils/gameState.js';
import BaseScene from './BaseScene.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { LAYOUT } from '../ui/layout/LayoutHelper.js'; 
import navigationManager from '../navigation/NavigationManager.js';


/**
 * CharacterSheetScene - Scene for viewing and managing character stats and skills
 */
class CharacterSheetScene extends BaseScene {
    constructor() {
        super({ key: 'CharacterSheetScene' });
    }

    preload() {
        // Load character sheet background
        if (!this.textures.exists('character-bg')) {
            this.load.image('character-bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        }
        
        // Load class-specific character portraits if they don't exist
        if (!this.textures.exists('warrior')) {
            this.load.image('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
        }
        if (!this.textures.exists('mage')) {
            this.load.image('mage', ASSET_PATHS.PORTRAITS.MAGE);
        }
        if (!this.textures.exists('rogue')) {
            this.load.image('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
        }
        if (!this.textures.exists('cleric')) {
            this.load.image('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
        }
        if (!this.textures.exists('ranger')) {
            this.load.image('ranger', ASSET_PATHS.PORTRAITS.RANGER);
        }
        if (!this.textures.exists('bard')) {
            this.load.image('bard', ASSET_PATHS.PORTRAITS.BARD);
        }
        
    }

    create() {
        console.log('CharacterSheetScene created');
        
        // Initialize scene from BaseScene
        this.initializeScene();
        
        // Create the scene background
        this.createBackground();
        
        // Create the scene title
        this.createTitle();
        
        // Create character info section
        this.createCharacterInfo();
        
        // Create stats display
        this.createStatsDisplay();
        
        // Create back button
        this.createBackButton();
    }
    
    /**
     * Create the scene background
     */
    createBackground() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Add background
        this.safeAddImage(width/2, height/2, 'character-bg', {
            displayWidth: width,
            displayHeight: height
        });
    }
    
    /**
     * Create the scene title
     */
    createTitle() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Character Sheet', {
            fontSize: this.ui.fontSize.lg
        });
    }
    
    /**
     * Create the character portrait and basic info
     */
    createCharacterInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- >>> DEFINE panelPos HERE <<< ---
        // Get panel position using LAYOUT for the LEFT panel
        const panelPos = this.ui.layoutHelper.getPosition(LAYOUT.PANEL.LEFT); 
        // --- >>> END DEFINITION <<< ---

        // Create character info container using the defined panelPos
        this.ui.createPanel(
            panelPos.x, // Now panelPos is defined
            panelPos.y, // Now panelPos is defined
            width * 0.35,
            height * 0.6,
            {
                fillColor: 0x222233,
                fillAlpha: 0.7,
                borderColor: 0x9999aa,
                borderThickness: 2
            }
        );

        // Get player info from gameState
        const player = gameState.player || {};
        const playerClass = player.class || 'warrior';
        const playerName = player.name || 'Adventurer';
        const playerLevel = player.level || 1;

        // Add character portrait based on class (using defined panelPos)
        this.safeAddImage(
            panelPos.x, // Center X of panel
            panelPos.y - height * 0.1, // Position above panel center
            playerClass, // Key should match preloaded texture
            { scale: 1, origin: 0.5 } // Example scale/origin
        );

        // Add character name (using defined panelPos)
        this.add.text(panelPos.x, panelPos.y + height * 0.05, playerName, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center',
        }).setOrigin(0.5);

        // Add character class and level (using defined panelPos)
        this.add.text(panelPos.x, panelPos.y + height * 0.1, `Level ${playerLevel} ${playerClass.charAt(0).toUpperCase() + playerClass.slice(1).toLowerCase()}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#aaaaff',
            align: 'center'
        }).setOrigin(0.5);
/*
        // Add gold display (using defined panelPos)
        const gold = player.gold || 0;
        this.add.text(panelPos.x, panelPos.y + height * 0.15, `Gold: ${gold}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
*/
    }
    
    /**
     * Create the stats display section
     */
    createStatsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Get panel position using LAYOUT
        const panelPos = this.ui.layoutHelper.getPosition(LAYOUT.PANEL.RIGHT);

        // Create stats container
        const statsPanel = this.ui.createPanel(
            panelPos.x,
            panelPos.y,
            width * 0.35,
            height * 0.6,
             { /* panel styles */ }
        );

         // Use relative positions within the panel area
         const panelTopY = panelPos.y - (statsPanel.height / 2);
         const panelCenterX = panelPos.x;
         const statsStartX = panelPos.x - width * 0.15; // Start slightly left of center
         const valueX = panelPos.x + width * 0.05; // Position value column

        // Add stats title
        this.add.text(panelCenterX, panelTopY + 30, 'CHARACTER STATS', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Get player stats from gameState
        const player = gameState.player || {};
        
        // Define the primary stats to display
        const primaryStats = [
            { name: 'Strength', value: player.strength || 10 },
            { name: 'Agility', value: player.agility || 10 },
            { name: 'Intelligence', value: player.intelligence || 10 },
            { name: 'Constitution', value: player.constitution || 10 }
        ];
        
        // Define the secondary stats to display
        const secondaryStats = [
            { name: 'Health', value: `${player.health ?? player.maxHealth ?? 100}/${player.maxHealth ?? 100}` },
            { name: 'Mana', value: `${player.mana ?? player.maxMana ?? 50}/${player.maxMana ?? 50}` },
            { name: 'Attack', value: `${player.currentAttack ?? 10}`}, // Display calculated attack
            { name: 'Defense', value: `${player.currentDefense ?? 0}`}, // Display calculated defense
            { name: 'Experience', value: `${player.experience || 0}/${player.experienceToNextLevel || 100}` }
        ];
        
        // Display primary stats
        const primaryStatsStartY = panelTopY + 70;
        const statSpacing = 25; // Adjust spacing
        
        // Display primary stats
        primaryStats.forEach((stat, index) => {
            const statY = primaryStatsStartY + (index * statSpacing);
            
            // Stat name
            this.add.text(statsStartX, statY, stat.name, { /* styles */ align: 'left' }).setOrigin(0, 0.5);
            // Stat value
            this.add.text(valueX, statY, stat.value.toString(), { /* styles */ align: 'right' }).setOrigin(1, 0.5);
        });
        
        // Display secondary stats title (optional)
        const secondaryStatsStartY = primaryStatsStartY + primaryStats.length * statSpacing + 20;
        /*
        this.add.text(panelCenterX, secondaryStatsStartY - 15, 'COMBAT STATS', {
            fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm + 'px', fill: '#cccccc', align: 'center'
        }).setOrigin(0.5);
        */

        // Display secondary stats
        secondaryStats.forEach((stat, index) => {
            const statY = secondaryStatsStartY + (index * statSpacing);
            // Stat name
            this.add.text(statsStartX, statY, stat.name, { /* styles */ align: 'left' }).setOrigin(0, 0.5);
            // Stat value
            this.add.text(valueX, statY, stat.value.toString(), { /* styles */ align: 'right' }).setOrigin(1, 0.5);
        });
    }
    
    /**
     * Create the back button to return to the previous scene
     */
    createBackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Use ui.createButton and standard positioning
        this.ui.createButton(
            width / 2, // Center horizontally
            height * 0.9, // Near bottom
            'Back', // Button text
            () => { // Callback function
                this.safePlaySound('button-click');

                // Determine the destination scene
                // Use gameState.previousScene if it's set, otherwise default to OverworldScene
                const destinationScene = gameState.previousScene || 'OverworldScene';
                console.log(`Navigating back to: ${destinationScene}`);

                // Use the existing navigateTo method
                if (navigationManager) {
                     navigationManager.navigateTo(this, destinationScene); 
                } else {
                     // Fallback if navigationManager is somehow missing (shouldn't happen now)
                     console.warn("NavigationManager not found, using direct scene start as fallback.");
                     this.scene.start(destinationScene);
                }
            },
            { width: 150, height: 40 } // Standard button size
        );
    }
}

export default CharacterSheetScene;
