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
        this.load.image('background', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        
        // Load character portraits for different classes
        this.load.image('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
        this.load.image('mage', ASSET_PATHS.PORTRAITS.MAGE);
        this.load.image('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
        this.load.image('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
        this.load.image('ranger', ASSET_PATHS.PORTRAITS.RANGER);
        this.load.image('bard', ASSET_PATHS.PORTRAITS.BARD);
        
        // Load race sprites (using same placeholders for now)
        this.load.image('human', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('elf', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('dwarf', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('halfling', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('orc', 'https://labs.phaser.io/assets/sprites/mushroom2.png');
        this.load.image('dragonborn', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);
        
        // Add decorative corners
        this.ui.addScreenCorners();
        
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
        const leftColumnWidth = width * 0.3;
        const rightSideWidth = width - leftColumnWidth;
        const rightColumnWidth = rightSideWidth / 2;
        
        // === LEFT COLUMN - Character Preview ===
        this.createCharacterPreviewSection(
            leftColumnWidth / 2, 
            height * 0.38
        );
        
        // === MIDDLE COLUMN - Character Class ===
        this.createClassSelectionSection(
            leftColumnWidth + (rightColumnWidth / 2), 
            height * 0.25
        );
        
        // === RIGHT COLUMN - Character Race ===
        this.createRaceSelectionSection(
            leftColumnWidth + rightColumnWidth + (rightColumnWidth / 2), 
            height * 0.25
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
        this.characterLabel = this.ui.createSectionLabel(
            x, 
            y - this.ui.spacing.xl * 2, 
            'CHARACTER PREVIEW',
            {
                sideMarkers: true,
                animate: true
            }
        );
        
        // Create character preview with enhanced visuals
        this.characterPreview = this.ui.createCharacterPreview(
            x, 
            y, 
            'warrior', // Start with warrior as default
            { 
                id: 'character-preview',
                size: Math.min(this.cameras.main.width * 0.22, this.cameras.main.height * 0.25)
            }
        );
        
        // Add stats text with enhanced styling
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
    }
    
    /**
     * Create the class selection section
     */
    createClassSelectionSection(x, y) {
        // Available classes
        const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Bard'];
        
        // Create section label with enhanced styling
        this.classLabel = this.ui.createSectionLabel(
            x, 
            y - this.ui.spacing.xl * 1.5, 
            'SELECT CLASS',
            {
                sideMarkers: true,
                animate: true
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
                itemWidth: 120,
                itemHeight: 40,
                spacing: this.ui.spacing.md,
                fontSize: this.ui.fontSize.md
            }
        );
    }
    
    /**
     * Create the race selection section
     */
    createRaceSelectionSection(x, y) {
        // Available races
        const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Dragonborn'];
        
        // Create section label with enhanced styling
        this.raceLabel = this.ui.createSectionLabel(
            x, 
            y - this.ui.spacing.xl * 1.5, 
            'SELECT RACE',
            {
                sideMarkers: true,
                animate: true
            }
        );
        
        // Create race selection grid
        this.raceGrid = new SelectionGrid(
            this,
            x,
            y,
            races,
            (raceName, index) => {
                console.log(`Selected race: ${raceName}`);
                gameState.player.race = raceName;
                this.updateCharacterPreview();
                this.updateRaceDescription(raceName);
            },
            {
                columns: 2,
                itemWidth: 120,
                itemHeight: 40,
                spacing: this.ui.spacing.md,
                fontSize: this.ui.fontSize.md
            }
        );
    }
    
    /**
     * Create the name input section
     */
    createNameInputSection(x, y) {
        // Create section label with enhanced styling
        this.nameLabel = this.ui.createSectionLabel(
            x, 
            y - this.ui.spacing.lg, 
            'ENTER CHARACTER NAME',
            {
                sideMarkers: true,
                animate: true
            }
        );
        
        // Create name input with a more obvious interactive appearance
        this.nameInput = this.ui.createInputField(
            x,
            y,
            'Adventurer',
            (name) => {
                console.log(`Character name set to: ${name}`);
                gameState.player.name = name;
            },
            {
                width: 300,
                height: 50,
                promptText: 'Enter your character name:',
                id: 'name-input'
            }
        );
        
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
                const playerRace = this.raceGrid.getSelectedItem();
                
                // Generate stats based on class and race
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
                
                // Adjust stats based on race
                switch (playerRace.toLowerCase()) {
                    case 'human':
                        str += 1; agi += 1; int += 1; con += 1;
                        break;
                    case 'elf':
                        agi += 2; int += 2; con -= 1;
                        break;
                    case 'dwarf':
                        con += 3; str += 1; agi -= 1;
                        break;
                    case 'halfling':
                        agi += 3; int += 1; str -= 1;
                        break;
                    case 'orc':
                        str += 3; con += 2; int -= 2;
                        break;
                    case 'dragonborn':
                        str += 2; int += 2; con += 1;
                        break;
                }
                
                // Calculate derived stats
                const maxHealth = 50 + (con * 5);
                const maxMana = 20 + (int * 3);
                
                // Save character data to gameState
                gameState.player.name = playerName;
                gameState.player.class = playerClass;
                gameState.player.race = playerRace;
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
     * Update the race description text
     * @param {string} raceName - Name of the selected race
     */
    updateRaceDescription(raceName) {
        if (!this.raceDescText) return;
        
        let desc = '';
        switch (raceName) {
            case 'Human':
                desc = 'Humans are versatile and\nadaptable to any class.';
                break;
            case 'Elf':
                desc = 'Elves are graceful and magical,\nwith enhanced perception.';
                break;
            case 'Dwarf':
                desc = 'Dwarves are hardy and strong,\nresistant to poison and magic.';
                break;
            case 'Halfling':
                desc = 'Halflings are small but nimble,\nwith uncanny luck.';
                break;
            case 'Orc':
                desc = 'Orcs are mighty warriors with\ngreat strength and endurance.';
                break;
            case 'Dragonborn':
                desc = 'Dragonborn have draconic heritage\nand can breathe elemental energy.';
                break;
        }
        
        this.raceDescText.setText(desc);
    }
    
    /**
     * Update the character preview based on selections
     */
    updateCharacterPreview() {
        // In a real implementation, we would update the character sprite
        // based on the selected class and race
        const playerClass = this.classGrid ? this.classGrid.getSelectedItem().toLowerCase() : 'warrior';
        const playerRace = this.raceGrid ? this.raceGrid.getSelectedItem().toLowerCase() : 'human';
        
        // Update character sprite based on class
        // For now we only have a few placeholder sprites
        let spriteKey = playerClass;
        
        // Update the character preview sprite
        if (this.characterPreview && this.characterPreview.setSprite) {
            this.characterPreview.setSprite(spriteKey);
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
        
        // Adjust stats based on race
        switch (playerRace) {
            case 'human':
                str += 1; agi += 1; int += 1; con += 1;
                break;
            case 'elf':
                agi += 2; int += 2; con -= 1;
                break;
            case 'dwarf':
                con += 3; str += 1; agi -= 1;
                break;
            case 'halfling':
                agi += 3; int += 1; str -= 1;
                break;
            case 'orc':
                str += 3; con += 2; int -= 2;
                break;
            case 'dragonborn':
                str += 2; int += 2; con += 1;
                break;
        }
        
        // Update stats text
        if (this.statsText) {
            this.statsText.setText(`STATS\nSTR: ${str}  AGI: ${agi}\nINT: ${int}  CON: ${con}`);
        }
    }
}

export default CharacterSelectScene;
