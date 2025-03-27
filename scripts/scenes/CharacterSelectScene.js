import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import SelectionGrid from '../ui/components/SelectionGrid.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS, AssetHelper } from '../config/AssetConfig.js';

/**
 * CharacterSelectScene - Scene for character creation and customization
 */
class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    preload() {
        // Load character assets
        if (!this.textures.exists('background')) {
            this.load.image('background', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        }
        
        // Load character portraits for different classes
        if (!this.textures.exists('warrior')) {
            this.load.image('warrior', ASSET_PATHS.PLAYERS.WARRIOR);
        }
        if (!this.textures.exists('mage')) {
            this.load.image('mage', ASSET_PATHS.PLAYERS.MAGE);
        }
        if (!this.textures.exists('rogue')) {
            this.load.image('rogue', ASSET_PATHS.PLAYERS.ROGUE);
        }
        if (!this.textures.exists('cleric')) {
            this.load.image('cleric', ASSET_PATHS.PLAYERS.CLERIC);
        }
        if (!this.textures.exists('ranger')) {
            this.load.image('ranger', ASSET_PATHS.PLAYERS.RANGER);
        }
        if (!this.textures.exists('bard')) {
            this.load.image('bard', ASSET_PATHS.PLAYERS.BARD);
        }        
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
        
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Character Creation', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create the main layout container
        this.createMainLayout();
        
        // Create the bottom buttons
        this.createNavigationButtons();
        
        // Initialize with default selections
        this.updateCharacterPreview();
    }
    
    /**
     * Create the main layout for character creation
     */
    createMainLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Use a more balanced layout with proper spacing
        // Left column is 30% of width, right side split into two equal columns
        const leftColumnWidth = width * 0.4;
        const rightSideWidth = width - leftColumnWidth;
        const rightColumnWidth = rightSideWidth / 2;
        
        // === LEFT COLUMN - Character Preview ===
        this.createCharacterPreviewSection(
            leftColumnWidth / 2, 
            height * 0.4
        );
        
        // === MIDDLE COLUMN - Character Class ===
        this.createClassSelectionSection(
            leftColumnWidth + (rightColumnWidth ), 
            height * 0.33
        );
        
        // === BOTTOM SECTION - Character Name ===
        this.createNameInputSection(
            width / 2, 
            height * 0.65
        );
    }
    
    /**
     * Create the character preview section
     */
    createCharacterPreviewSection(x, y) {
        // Create section label with enhanced styling
        /*
        this.characterLabel = this.ui.createSectionLabel(
            x, 
            y - this.ui.spacing.xl * 2, 
            'CHARACTER PREVIEW',
            {
                sideMarkers: true,
                animate: true
            }
        );
        */

        // Create character preview with enhanced visuals
        this.characterPreview = this.ui.createCharacterPreview(
            x, 
            y, 
            'warrior', // Start with warrior as default
            { 
                id: 'character-preview',
                panelScale: 1.5,
                size: Math.min(this.cameras.main.width * 0.2, this.cameras.main.height * 0.2),
                spriteScale: 1 // Increase sprite scale
            }
        );
        
        // Add stats text with enhanced styling
        /*
        this.statsText = this.ui.createSectionLabel(
            x,
            y + this.ui.spacing.xl * 2,
            'STATS\nSTR: 10  AGI: 10\nINT: 10  CON: 10',
            { 
                fontSize: this.ui.fontSize.xs,
                fontFamily: "'VT323'",
                background: true,
                animate: false
            }
        );
        */
    }
    
    /**
     * Create the class selection section
     */
    createClassSelectionSection(x, y) {
        // Available classes
        const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Bard'];
        
        // Create section label with enhanced styling
        this.classLabel = this.ui.createTitle(
            x, 
            y - this.ui.spacing.xl * 1.8, 
            'CHARACTER TYPE',
            {
                fontSize: this.ui.fontSize.md,
                padding: this.ui.spacing.md
            }
        );
        
        // Create class selection grid
        this.classGrid = new SelectionGrid(
            this,
            x,
            y,
            classes,
            (className, index) => {
                console.log(`Selected class: ${className}`);
                gameState.player.class = className.toLowerCase();
                this.updateCharacterPreview();
                this.updateClassDescription(className);
            },
            {
                columns: 2,
                itemWidth: 160,  
                itemHeight: 45,  
                spacing: this.ui.spacing.lg,  
                fontSize: this.ui.fontSize.md * 1.2  
            }
        );
    }
    
    /**
     * Create the name input section
     */
    createNameInputSection(x, y) {
        // Create section label with enhanced styling
        this.nameLabel = this.ui.createTitle(
            x*0.5, 
            y + this.ui.spacing.lg*1, 
            'Set Name:',
            {
                fontSize: this.ui.fontSize.md,
                padding: this.ui.spacing.md
            }
        );
        
        // Create name input with a more obvious interactive appearance
        this.nameInput = this.ui.createInputField(
            x*1.2,
            y + this.ui.spacing.lg*1,
            'Adventurer',
            (name) => {
                const truncatedName = name.slice(0, 20);
                console.log(`Character name set to: ${truncatedName}`);
                gameState.player.name = truncatedName;
            },
            {
                width: 300,
                height: 50,
                promptText: 'Enter your character name:',
                id: 'name-input',
                fillColor: 0x111111,
                maxLength: 20
            }
        );

        // Create a sliding highlight effect
        const highlightWidth = 40;
        const highlightHeight = this.nameInput.height;
        const startX = this.nameInput.container.x - this.nameInput.width/2 + highlightWidth/2;
        const endX = this.nameInput.container.x + this.nameInput.width/2 - highlightWidth/2;
        
        const highlight = this.add.rectangle(
            startX,
            this.nameInput.container.y,
            highlightWidth,
            highlightHeight,
            0xffffff,
            0.1
        );

        // Add sliding animation
        this.tweens.add({
            targets: highlight,
            x: endX,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        /*
        // Add a small hint text below the input field
        const hintY = y + this.ui.spacing.md + 30;
        this.nameHint = this.add.text(x, hintY, '(Click to edit)', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.xs + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add a subtle animation to draw attention
        this.tweens.add({
            targets: this.nameHint,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        */
    }
    
    /**
     * Create the bottom navigation buttons
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Back button to return to the start screen
        const backButton = new Button(
            this,
            width * 0.25,
            height * 0.85,
            'BACK',
            () => {
                console.log('Back button clicked');
                navigationManager.navigateTo(this, 'StartScene');
            },
            {
                width: 120,
                height: 50
            }
        );
        
        // Start game button to finalize character and start the game
        this.startButton = new Button(
            this,
            width * 0.75,
            height * 0.85,
            'START GAME',
            () => {
                console.log('Start game button clicked');
                
                // Initialize player object if it doesn't exist
                if (!gameState.player) {
                    gameState.player = {};
                }
                
                // Get character info
                const playerName = this.nameInput.getValue() || 'Adventurer';
                const playerClass = this.classGrid.getSelectedItem().toLowerCase();
                
                // Store player class selection properly
                const playerClassLower = this.classGrid.getSelectedItem().toLowerCase();
                
                // Store the player data to use in other scenes
                gameState.player.name = playerName;
                gameState.player.class = playerClassLower;
                // Store sprite and portrait paths to use in other scenes
                gameState.player.sprite = ASSET_PATHS.PLAYERS[playerClassLower.toUpperCase()] || ASSET_PATHS.PLAYERS.DEFAULT;
                gameState.player.portrait = ASSET_PATHS.PORTRAITS[playerClassLower.toUpperCase()] || ASSET_PATHS.PORTRAITS.DEFAULT;
                
                // Generate stats based on class and race
                let str = 10, agi = 10, int = 10, con = 10;
                
                // Adjust stats based on class
                switch (playerClassLower) {
                    case 'warrior':
                        str += 3; con += 2;
                        break;
                    case 'mage':
                        int += 4; agi += 1;
                        break;
                    case 'rogue':
                        agi += 4; str += 1;
                        break;
                    case 'cleric':
                        int += 2; con += 3;
                        break;
                    case 'ranger':
                        agi += 3; str += 2;
                        break;
                    case 'bard':
                        agi += 2; int += 3;
                        break;
                }
                              
                // Calculate derived stats
                const maxHealth = 50 + (con * 5);
                const maxMana = 20 + (int * 3);
                
                // Save character data to gameState
                gameState.player.level = 1;
                gameState.player.experience = 0;
                gameState.player.experienceToNextLevel = 100;
                gameState.player.health = maxHealth;
                gameState.player.maxHealth = maxHealth;
                gameState.player.mana = maxMana;
                gameState.player.maxMana = maxMana;
                
                // Save stats to gameState
                gameState.player.strength = str;
                gameState.player.agility = agi;
                gameState.player.intelligence = int;
                gameState.player.constitution = con;
                
                // Navigate to the OverworldScene
                console.log('Character created:', gameState.player);
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            {
                width: 200,
                height: 50
            }
        );
        
        // Add shine effect to the start button for emphasis
        this.startButton.addShineEffect();
    }
    
    /**
     * Update the class description text
     * @param {string} className - Name of the selected class
     */
    updateClassDescription(className) {
        if (!this.classDescText) return;
        
        let desc = '';
        switch (className) {
            case 'Warrior':
                desc = 'Warriors excel at close combat\nand have high defense.';
                break;
            case 'Mage':
                desc = 'Mages harness arcane power\nto cast devastating spells.';
                break;
            case 'Rogue':
                desc = 'Rogues are stealthy and quick,\ndealing high damage.';
                break;
            case 'Cleric':
                desc = 'Clerics heal allies and\nsmite foes with divine magic.';
                break;
            case 'Ranger':
                desc = 'Rangers excel at ranged combat\nand wilderness survival.';
                break;
            case 'Bard':
                desc = 'Bards inspire allies and\nconfuse enemies with magic.';
                break;
        }
        
        this.classDescText.setText(desc);
    }
    
    /**
     * Update the character preview based on selections
     */
    updateCharacterPreview() {
        const playerClass = this.classGrid ? this.classGrid.getSelectedItem().toLowerCase() : 'warrior';
        
        // Create character data object with sprite key
        const characterData = {
            name: playerClass.charAt(0).toUpperCase() + playerClass.slice(1),
            sprite: playerClass // This matches the image keys we loaded in preload()
        };
        
        console.log('Updating character preview:', {
            class: playerClass,
            characterData,
            previewExists: !!this.characterPreview,
            updateMethodExists: !!(this.characterPreview && this.characterPreview.updateCharacter),
            loadedTextures: this.textures.list
        });
        
        // Update the character preview sprite
        if (this.characterPreview && this.characterPreview.updateCharacter) {
            this.characterPreview.updateCharacter(characterData);
        }
        
        // Generate some fake stats based on class and race
        let str = 10, agi = 10, int = 10, con = 10;
        
        // Adjust stats based on class
        switch (playerClass) {
            case 'warrior':
                str += 3; con += 2;
                break;
            case 'mage':
                int += 4; agi += 1;
                break;
            case 'rogue':
                agi += 4; str += 1;
                break;
            case 'cleric':
                int += 2; con += 3;
                break;
            case 'ranger':
                agi += 3; str += 2;
                break;
            case 'bard':
                agi += 2; int += 3;
                break;
        }
    }
}

export default CharacterSelectScene;
