import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import BaseScene from './BaseScene.js';
import { LAYOUT } from '../ui/Layout.js';
import { ASSET_PATHS, AssetHelper } from '../config/AssetConfig.js';
import ButtonFactory from '../ui/ButtonFactory.js';

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
        this.ui.createTitle(width/2, height * LAYOUT.TITLE.Y, 'Character Sheet', {
            fontSize: this.ui.fontSize.lg
        });
    }
    
    /**
     * Create the character portrait and basic info
     */
    createCharacterInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create character info container
        this.ui.createPanel(
            width * LAYOUT.PANEL.LEFT.X,
            height * LAYOUT.PANEL.LEFT.Y,
            width * 0.4,
            height * 0.5,
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
        
        // Add character portrait based on class
        this.safeAddImage(
            width * 0.25, 
            height * 0.25, 
            playerClass,
            { displayWidth: 128, displayHeight: 128 }
        ).setOrigin(0.5);
        
        // Add character name
        this.add.text(width * 0.25, height * 0.4, playerName, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add character class and level
        this.add.text(width * 0.25, height * 0.45, `Level ${playerLevel} ${playerClass}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#aaaaff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add gold display
        const gold = player.gold || 0;
        this.add.text(width * 0.25, height * 0.5, `Gold: ${gold}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Create the stats display section
     */
    createStatsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create stats container
        this.ui.createPanel(
            width * LAYOUT.PANEL.RIGHT.X,
            height * LAYOUT.PANEL.RIGHT.Y,
            width * 0.4,
            height * 0.5,
            {
                fillColor: 0x222233,
                fillAlpha: 0.7,
                borderColor: 0x9999aa,
                borderThickness: 2
            }
        );
        
        // Add stats title
        this.add.text(width * LAYOUT.STATS.X, height * 0.2, 'CHARACTER STATS', {
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
            { name: 'Health', value: `${player.health !== undefined ? player.health : 100}/${player.maxHealth || 100}` },
            { name: 'Mana', value: `${player.mana !== undefined ? player.mana : 50}/${player.maxMana || 50}` },
            { name: 'Experience', value: `${player.experience || 0}/${player.experienceToNextLevel || 100}` }
        ];
        
        // Display primary stats
        primaryStats.forEach((stat, index) => {
            const statY = height * LAYOUT.STATS.START_Y + (index * LAYOUT.STATS.SPACING);
            
            // Stat name
            this.add.text(width * 0.6, statY, stat.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#aaaaaa',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            // Stat value
            this.add.text(width * 0.8, statY, stat.value.toString(), {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });
        
        // Display secondary stats title
        this.add.text(width * LAYOUT.STATS.X, height * 0.45, 'OTHER STATS', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display secondary stats
        secondaryStats.forEach((stat, index) => {
            const statY = height * 0.5 + (index * LAYOUT.STATS.SPACING);
            
            // Stat name
            this.add.text(width * 0.6, statY, stat.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#aaaaaa',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            // Stat value
            this.add.text(width * 0.8, statY, stat.value.toString(), {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });
    }
    
    /**
     * Create the back button to return to the previous scene
     */
    createBackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create back button using ButtonFactory
        ButtonFactory.createBackButton(this);
    }
}

export default CharacterSheetScene;
