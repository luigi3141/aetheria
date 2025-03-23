import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';

/**
 * PreloadScene - Dedicated scene for preloading shared assets
 * This centralizes asset loading to prevent duplicate loading across scenes
 */
class PreloadScene extends BaseScene {
    constructor() {
        super('PreloadScene');
        
        // Track loading progress
        this.loadingProgress = 0;
        this.assetsLoaded = false;
    }
    
    preload() {
        // Create a loading screen
        this.createLoadingScreen();
        
        // Register progress events
        this.registerProgressEvents();
        
        // Preload shared assets
        this.preloadSharedAssets();
    }
    
    create() {
        console.log('PreloadScene: All assets loaded');
        this.assetsLoaded = true;
        
        // Initialize the scene with base functionality
        this.initializeScene();
        
        // Start the title screen scene after a short delay
        this.time.delayedCall(500, () => {
            this.scene.start('TitleScene');
        });
    }
    
    /**
     * Create the loading screen UI
     */
    createLoadingScreen() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Background
        this.add.rectangle(width/2, height/2, width, height, 0x000000);
        
        // Title text
        this.add.text(width/2, height * 0.3, 'AETHERIA', {
            fontFamily: "'Press Start 2P'",
            fontSize: '32px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Loading text
        this.loadingText = this.add.text(width/2, height * 0.45, 'Loading...', {
            fontFamily: "'Press Start 2P'",
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Progress bar background
        this.add.rectangle(width/2, height * 0.5, width * 0.6, 20, 0x333333).setOrigin(0.5);
        
        // Progress bar
        this.progressBar = this.add.rectangle(width/2 - width * 0.3, height * 0.5, 0, 20, 0x6666ff)
            .setOrigin(0, 0.5);
    }
    
    /**
     * Register progress events to update the loading bar
     */
    registerProgressEvents() {
        // Update progress bar as assets load
        this.load.on('progress', (value) => {
            this.loadingProgress = value;
            this.updateProgressBar();
        });
        
        // Update text when file loads
        this.load.on('fileprogress', (file) => {
            this.loadingText.setText(`Loading: ${file.key}`);
        });
        
        // Update when complete
        this.load.on('complete', () => {
            this.loadingText.setText('Loading complete!');
            this.progressBar.width = this.cameras.main.width * 0.6;
        });
    }
    
    /**
     * Update the progress bar based on loading progress
     */
    updateProgressBar() {
        if (this.progressBar) {
            const width = this.cameras.main.width;
            this.progressBar.width = this.loadingProgress * width * 0.6;
        }
    }
    
    /**
     * Preload all shared assets used across multiple scenes
     */
    preloadSharedAssets() {
        // Load common backgrounds
        this.load.image('character-bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
        this.load.image('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
        this.load.image('title-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
        this.load.image('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);
        this.load.image('dungeon-bg', ASSET_PATHS.BACKGROUNDS.DUNGEON);
        this.load.image('battle-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);
        
        // Load character class portraits
        this.load.image('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
        this.load.image('mage', ASSET_PATHS.PORTRAITS.MAGE);
        this.load.image('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
        this.load.image('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
        this.load.image('ranger', ASSET_PATHS.PORTRAITS.RANGER);
        this.load.image('bard', ASSET_PATHS.PORTRAITS.BARD);
        
        // Load common icons
        this.load.image('player-icon', ASSET_PATHS.ICONS.PLAYER);
        this.load.image('health-icon', ASSET_PATHS.ICONS.HEALTH);
        this.load.image('mana-icon', ASSET_PATHS.ICONS.MANA);
        this.load.image('strength-icon', ASSET_PATHS.ICONS.STRENGTH);
        this.load.image('agility-icon', ASSET_PATHS.ICONS.AGILITY);
        this.load.image('intelligence-icon', ASSET_PATHS.ICONS.INTELLIGENCE);
        this.load.image('constitution-icon', ASSET_PATHS.ICONS.CONSTITUTION);
        
        // Load effect sprites
        this.load.image('slash-effect', ASSET_PATHS.EFFECTS.SLASH);
        this.load.image('fire-effect', ASSET_PATHS.EFFECTS.FIRE);
        this.load.image('heal-effect', ASSET_PATHS.EFFECTS.HEAL);
        
        // Load sound effects
        this.load.audio('attack', ASSET_PATHS.AUDIO.ATTACK);
        this.load.audio('enemy-hit', ASSET_PATHS.AUDIO.ENEMY_HIT);
        this.load.audio('player-hit', ASSET_PATHS.AUDIO.PLAYER_HIT);
        this.load.audio('heal', ASSET_PATHS.AUDIO.HEAL);
        this.load.audio('victory', ASSET_PATHS.AUDIO.VICTORY);
        this.load.audio('defeat', ASSET_PATHS.AUDIO.DEFEAT);
        this.load.audio('button-click', ASSET_PATHS.AUDIO.MENU_SELECT);
        this.load.audio('level-up', ASSET_PATHS.AUDIO.LEVEL_UP);
    }
}

export default PreloadScene;
