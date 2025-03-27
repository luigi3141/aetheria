import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';

/**
 * OverworldScene - The main hub world where the player can access various game features
 */
class OverworldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverworldScene' });
    }

    preload() {
        // Load overworld assets
        this.load.image('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);
        this.load.image('player-avatar', gameState.player.portrait);
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'overworld-bg').setDisplaySize(width, height);


        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Aetheria Overworld', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Display player info
        this.createPlayerInfo();
        
        // Create navigation buttons
        this.createNavigationButtons();
    }
    
    /**
     * Create player info display
     */
    createPlayerInfo() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Ensure player health and mana values are consistent
        HealthManager.validatePlayerHealth();
        
        // Create player avatar
        const avatarX = width * 0.2;
        const avatarY = height * 0.3;
        
        // Create avatar container with border
        const avatarContainer = this.ui.createPanel(
            avatarX,
            avatarY,
            100,
            100,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0xffcc00,
                borderThickness: 2
            }
        );
        
        // Add player sprite
        const characterClass = gameState.player.class || 'warrior';
        const playerSprite = this.add.image(avatarX, avatarY, 'player-avatar').setDisplaySize(80, 80);
        
        // Add player info text
        const infoX = width * 0.3;
        const infoY = height * 0.3;
        
        const playerName = gameState.player.name || 'Adventurer';
        const playerClass = gameState.player.class || 'Warrior';
        
        // Display player stats including health and mana
        const playerStats = `${playerName}\n${playerClass}\nHP: ${gameState.player.health}/${gameState.player.maxHealth}\nMP: ${gameState.player.mana}/${gameState.player.maxMana}`;
        
        const playerInfo = this.ui.createSectionLabel(
            infoX,
            infoY,
            playerStats,
            {
                fontSize: this.ui.fontSize.md,
                background: true,
                align: 'left'
            }
        );
    }
    
    /**
     * Create navigation buttons to other scenes
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create dungeon button
        const dungeonButton = new Button(
            this,
            width * 0.25,
            height * 0.5,
            'DUNGEONS',
            () => {
                console.log('Dungeons button clicked');
                navigationManager.navigateTo(this, 'DungeonSelectScene');
            },
            {
                width: 180,
                height: 50
            }
        );
        
        // Create inventory button
        const inventoryButton = new Button(
            this,
            width * 0.75,
            height * 0.5,
            'INVENTORY',
            () => {
                console.log('Inventory button clicked');
                navigationManager.navigateTo(this, 'InventoryScene');
            },
            {
                width: 180,
                height: 50
            }
        );
        
        // Create crafting button
        const craftingButton = new Button(
            this,
            width * 0.25,
            height * 0.65,
            'CRAFTING',
            () => {
                console.log('Crafting button clicked');
                navigationManager.navigateTo(this, 'CraftingScene');
            },
            {
                width: 180,
                height: 50
            }
        );
        
        // Create character sheet button
        const characterButton = new Button(
            this,
            width * 0.75,
            height * 0.65,
            'CHARACTER',
            () => {
                console.log('Character button clicked');
                navigationManager.navigateTo(this, 'CharacterSheetScene');
            },
            {
                width: 180,
                height: 50
            }
        );
    }
}

export default OverworldScene;
