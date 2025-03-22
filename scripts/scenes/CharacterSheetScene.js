import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

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
        this.load.image('character-portrait', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('skill-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'character-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Character Sheet', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create tabs for different character sheet sections
        this.createCharacterTabs();
        
        // Create the character portrait and basic info
        this.createCharacterInfo();
        
        // Create the stats display
        this.createStatsDisplay();
        
        // Create the skills display
        this.createSkillsDisplay();
        
        // Create navigation buttons
        this.createNavigationButtons();
    }
    
    /**
     * Create tabs for different character sheet sections
     */
    createCharacterTabs() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const tabY = height * 0.15;
        const tabWidth = 120;
        const tabHeight = 40;
        const tabSpacing = 10;
        
        // Create tabs
        const tabs = ['Stats', 'Skills', 'Abilities', 'Biography'];
        
        tabs.forEach((tabName, index) => {
            const tabX = width * 0.2 + (index * (tabWidth + tabSpacing));
            
            // Create tab button
            const tabButton = new Button(
                this,
                tabX,
                tabY,
                tabName,
                () => {
                    console.log(`Tab clicked: ${tabName}`);
                    this.setActiveTab(tabName);
                },
                {
                    width: tabWidth,
                    height: tabHeight,
                    fontSize: this.ui.fontSize.sm
                }
            );
            
            // Make the first tab active by default
            if (index === 0) {
                tabButton.setActive(true);
            }
        });
    }
    
    /**
     * Set the active character sheet tab
     * @param {string} tabName - Name of the tab to activate
     */
    setActiveTab(tabName) {
        // In a real implementation, this would show/hide different sections
        console.log(`Setting active tab: ${tabName}`);
    }
    
    /**
     * Create the character portrait and basic info
     */
    createCharacterInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the character portrait
        const portraitPanel = this.ui.createPanel(
            width * 0.2,
            height * 0.35,
            width * 0.3,
            height * 0.3,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add character portrait
        const portrait = this.add.image(
            width * 0.2,
            height * 0.35,
            'character-portrait'
        ).setDisplaySize(100, 100);
        
        // Add a glow effect to the portrait
        portrait.preFX.addGlow(0x3399ff, 4);
        
        // Get character info from gameState
        const playerName = gameState.player?.name || 'Unnamed Hero';
        const playerClass = gameState.player?.class || 'Unknown Class';
        const playerRace = gameState.player?.race || 'Unknown Race';
        const playerLevel = gameState.player?.level || 1;
        
        // Add character name
        this.add.text(width * 0.2, height * 0.25, playerName, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.lg + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add character class and race
        this.add.text(width * 0.2, height * 0.45, `${playerRace} ${playerClass}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add level display
        const levelText = this.add.text(width * 0.3, height * 0.28, `Level ${playerLevel}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffcc00',
            align: 'center',
            backgroundColor: '#222244',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        // Add a border to the level text
        levelText.setStroke('#000000', 2);
    }
    
    /**
     * Create the stats display
     */
    createStatsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the stats
        const statsPanel = this.ui.createPanel(
            width * 0.6,
            height * 0.35,
            width * 0.3,
            height * 0.3,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add stats title
        this.add.text(width * 0.6, height * 0.25, 'CHARACTER STATS', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Get character stats from gameState
        const stats = gameState.player?.stats || {
            strength: 10,
            dexterity: 8,
            intelligence: 12,
            vitality: 9,
            luck: 7
        };
        
        // Define stat labels and descriptions
        const statInfo = {
            strength: { label: 'Strength', desc: 'Increases physical damage and carrying capacity' },
            dexterity: { label: 'Dexterity', desc: 'Improves accuracy, evasion, and critical hit chance' },
            intelligence: { label: 'Intelligence', desc: 'Enhances magical abilities and spell effectiveness' },
            vitality: { label: 'Vitality', desc: 'Boosts health points and physical resistance' },
            luck: { label: 'Luck', desc: 'Affects critical hits, item drops, and random events' }
        };
        
        // Display the stats
        const startY = height * 0.28;
        const spacing = height * 0.05;
        
        let index = 0;
        for (const [statKey, statValue] of Object.entries(stats)) {
            const y = startY + (index * spacing);
            
            // Add stat label
            this.add.text(width * 0.5, y, statInfo[statKey].label + ':', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'right'
            }).setOrigin(1, 0.5);
            
            // Add stat value
            const valueText = this.add.text(width * 0.52, y, statValue.toString(), {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffcc00',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            // Add stat bar
            const barWidth = 100;
            const barHeight = 10;
            const barX = width * 0.55;
            
            // Background bar
            this.add.rectangle(
                barX + barWidth/2,
                y,
                barWidth,
                barHeight,
                0x222233
            );
            
            // Filled bar (scaled based on stat value, assuming max is 20)
            const fillWidth = (statValue / 20) * barWidth;
            this.add.rectangle(
                barX + fillWidth/2,
                y,
                fillWidth,
                barHeight,
                0x3399ff
            ).setOrigin(0, 0.5);
            
            // Add increase button
            const increaseButton = new Button(
                this,
                width * 0.7,
                y,
                '+',
                () => {
                    console.log(`Increasing stat: ${statKey}`);
                    this.increaseStat(statKey);
                },
                {
                    width: 30,
                    height: 30,
                    fontSize: this.ui.fontSize.sm
                }
            );
            
            // Show stat description on hover
            valueText.setInteractive();
            valueText.on('pointerover', () => {
                this.statTooltip = this.add.text(width * 0.6, y + 15, statInfo[statKey].desc, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#aaaaaa',
                    backgroundColor: '#111122',
                    padding: { x: 5, y: 2 }
                }).setOrigin(0.5);
            });
            
            valueText.on('pointerout', () => {
                if (this.statTooltip) {
                    this.statTooltip.destroy();
                    this.statTooltip = null;
                }
            });
            
            index++;
        }
        
        // Add available stat points
        const availablePoints = gameState.player?.statPoints || 3;
        
        this.add.text(width * 0.6, height * 0.45, `Available Points: ${availablePoints}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Increase a character stat
     * @param {string} statKey - The stat to increase
     */
    increaseStat(statKey) {
        // Check if player has available stat points
        if (!gameState.player) gameState.player = {};
        if (!gameState.player.stats) gameState.player.stats = {};
        
        const availablePoints = gameState.player.statPoints || 0;
        
        if (availablePoints > 0) {
            // Increase the stat
            gameState.player.stats[statKey] = (gameState.player.stats[statKey] || 0) + 1;
            
            // Decrease available points
            gameState.player.statPoints = availablePoints - 1;
            
            // Refresh the scene to show updated stats
            this.scene.restart();
        }
    }
    
    /**
     * Create the skills display
     */
    createSkillsDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the skills
        const skillsPanel = this.ui.createPanel(
            width * 0.5,
            height * 0.7,
            width * 0.8,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x9966ff,
                borderThickness: 2
            }
        );
        
        // Add skills title
        this.add.text(width * 0.5, height * 0.6, 'SKILLS & ABILITIES', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Sample skills - in a real implementation, this would come from gameState and be filtered by class
        const skills = [
            { name: 'Fireball', type: 'Offensive', description: 'Launches a ball of fire at enemies', level: 2 },
            { name: 'Healing Touch', type: 'Support', description: 'Restores health to a single target', level: 1 },
            { name: 'Shield Bash', type: 'Offensive', description: 'Stuns an enemy with your shield', level: 3 },
            { name: 'Stealth', type: 'Utility', description: 'Become invisible to enemies for a short time', level: 1 }
        ];
        
        // Create a grid layout for the skills
        const gridCols = 4;
        const gridRows = Math.ceil(skills.length / gridCols);
        const cellSize = 80;
        const startX = width * 0.2;
        const startY = height * 0.65;
        
        // Draw grid cells and skills
        skills.forEach((skill, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);
            
            const cellX = startX + col * (cellSize + 20);
            const cellY = startY + row * (cellSize + 10);
            
            // Create skill cell
            const cell = this.add.rectangle(
                cellX + cellSize/2,
                cellY + cellSize/2,
                cellSize,
                cellSize,
                0x222233
            ).setStrokeStyle(1, 0x9966ff);
            
            // Add skill icon
            const skillIcon = this.add.image(
                cellX + cellSize/2,
                cellY + cellSize/2 - 10,
                'skill-icon'
            ).setDisplaySize(cellSize * 0.6, cellSize * 0.6);
            
            // Add skill name
            this.add.text(cellX + cellSize/2, cellY + cellSize - 20, skill.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add skill level
            this.add.text(cellX + cellSize - 10, cellY + 10, `Lv ${skill.level}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffcc00',
                align: 'right'
            }).setOrigin(1, 0);
            
            // Make the skill interactive
            skillIcon.setInteractive();
            
            // Add hover effect
            skillIcon.on('pointerover', () => {
                cell.setStrokeStyle(2, 0xffcc00);
                
                // Show skill tooltip
                this.skillTooltip = this.ui.createPanel(
                    cellX + cellSize/2,
                    cellY - 40,
                    200,
                    60,
                    {
                        fillColor: 0x111122,
                        fillAlpha: 0.9,
                        borderColor: 0xffcc00,
                        borderThickness: 2
                    }
                );
                
                // Add skill description
                this.skillTooltipText = this.add.text(cellX + cellSize/2, cellY - 40, 
                    `${skill.type}\n${skill.description}`, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#ffffff',
                    align: 'center'
                }).setOrigin(0.5);
            });
            
            skillIcon.on('pointerout', () => {
                cell.setStrokeStyle(1, 0x9966ff);
                
                // Hide skill tooltip
                if (this.skillTooltip) {
                    this.skillTooltip.destroy();
                    this.skillTooltipText.destroy();
                    this.skillTooltip = null;
                    this.skillTooltipText = null;
                }
            });
        });
    }
    
    /**
     * Create navigation buttons
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create back button
        const backButton = new Button(
            this,
            width * 0.3,
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
        
        // Create inventory button
        const inventoryButton = new Button(
            this,
            width * 0.7,
            height * 0.9,
            'GO TO INVENTORY',
            () => {
                console.log('Go to inventory clicked');
                navigationManager.navigateTo(this, 'InventoryScene');
            },
            {
                width: 200,
                height: 50
            }
        );
    }
}

export default CharacterSheetScene;
