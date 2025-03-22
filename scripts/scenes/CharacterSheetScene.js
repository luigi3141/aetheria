import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import UIManager from '../ui/UIManager.js';

/**
 * CharacterSheetScene - Scene for viewing and managing character stats and skills
 */
class CharacterSheetScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSheetScene' });
    }

    preload() {
        // Load character sheet assets
        this.load.image('character-bg', 'https://labs.phaser.io/assets/skies/space1.png');
        
        // Load class-specific character portraits if they don't exist
        if (!this.textures.exists('warrior')) {
            this.load.image('warrior', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
        if (!this.textures.exists('mage')) {
            this.load.image('mage', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
        if (!this.textures.exists('rogue')) {
            this.load.image('rogue', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
        if (!this.textures.exists('cleric')) {
            this.load.image('cleric', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
        if (!this.textures.exists('ranger')) {
            this.load.image('ranger', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
        if (!this.textures.exists('bard')) {
            this.load.image('bard', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        }
    }

    create() {
        console.log('CharacterSheetScene created');
        
        // Initialize UI manager
        this.ui = new UIManager(this);
        
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
        this.add.image(width/2, height/2, 'character-bg').setDisplaySize(width, height);
        
        // Add decorative corners
        this.ui.addScreenCorners();
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
        
        // Create character info container
        this.ui.createPanel(
            this,
            width * 0.25,
            height * 0.35,
            width * 0.4,
            height * 0.4,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add character portrait - use the character's class sprite if available
        const characterClass = gameState.player?.class || 'warrior';
        let portraitKey = characterClass;
        
        // Fallback to a default if the texture doesn't exist
        if (!this.textures.exists(portraitKey)) {
            portraitKey = 'warrior';
        }
        
        // Create the portrait
        const portrait = this.add.image(
            width * 0.25,
            height * 0.3,
            portraitKey
        ).setDisplaySize(100, 100);
        
        // Add a simple glow effect with a background circle
        const glowCircle = this.add.circle(
            width * 0.25,
            height * 0.3,
            60,
            0x3399ff,
            0.3
        );
        
        // Ensure the circle is behind the portrait
        glowCircle.setDepth(portrait.depth - 1);
        
        // Get character info from gameState
        const playerName = gameState.player?.name || 'Unnamed Hero';
        const playerClass = gameState.player?.class || 'Unknown Class';
        const playerRace = gameState.player?.race || 'Unknown Race';
        const playerLevel = gameState.player?.level || 1;
        
        // Add character name
        this.add.text(width * 0.25, height * 0.2, playerName, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add character class and race
        this.add.text(width * 0.25, height * 0.4, `${playerRace} ${playerClass}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add level
        this.add.text(width * 0.25, height * 0.45, `Level ${playerLevel}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Create stats display
     */
    createStatsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the stats
        this.ui.createPanel(
            this,
            width * 0.7,
            height * 0.35,
            width * 0.4,
            height * 0.4,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add stats title
        this.add.text(width * 0.7, height * 0.2, 'CHARACTER STATS', {
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
            { name: 'Health', value: `${player.health || 100}/${player.maxHealth || 100}` },
            { name: 'Mana', value: `${player.mana || 50}/${player.maxMana || 50}` },
            { name: 'Experience', value: `${player.experience || 0}/${player.experienceToNextLevel || 100}` }
        ];
        
        // Display primary stats
        primaryStats.forEach((stat, index) => {
            const statY = height * 0.25 + (index * 30);
            
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
        this.add.text(width * 0.7, height * 0.4, 'RESOURCES', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Display secondary stats
        secondaryStats.forEach((stat, index) => {
            const statY = height * 0.45 + (index * 30);
            
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
     * Create back button
     */
    createBackButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Back button to return to the overworld
        const backButton = new Button(
            this,
            width * 0.5,
            height * 0.85,
            'RETURN TO GAME',
            () => {
                console.log('Back button clicked');
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            {
                width: 200,
                height: 50
            }
        );
        
        // Add shine effect to make the button more noticeable
        backButton.addShineEffect();
    }
}

export default CharacterSheetScene;
