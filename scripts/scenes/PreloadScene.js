import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';

/**
 * PreloadScene - Dedicated scene for preloading shared assets
 * This centralizes asset loading to prevent duplicate loading across scenes
 */
class PreloadScene extends BaseScene {
    constructor() {
        super({ key: 'PreloadScene' });
        
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
            this.scene.start('StartScene');
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
        const tryLoadAudio = (key, path) => {
            if (path) {
              this.load.audio(key, path);
            } else {
              console.warn(`⚠️ Skipping load.audio for "${key}" — path is undefined`);
            }
          };
          
          tryLoadAudio('attack', ASSET_PATHS.SOUNDS.combat.attack);
          tryLoadAudio('hit', ASSET_PATHS.SOUNDS.combat.hit);
          tryLoadAudio('victory', ASSET_PATHS.SOUNDS.combat.victory);
          tryLoadAudio('defeat', ASSET_PATHS.SOUNDS.combat.defeat);
          tryLoadAudio('level-up', ASSET_PATHS.SOUNDS.combat.levelUp);
          tryLoadAudio('heal', ASSET_PATHS.SOUNDS.combat.heal);
          tryLoadAudio('button-click', ASSET_PATHS.SOUNDS.ui.buttonClick);
          tryLoadAudio('menu-open', ASSET_PATHS.SOUNDS.ui.menuOpen);
          tryLoadAudio('menu-close', ASSET_PATHS.SOUNDS.ui.menuClose);
          tryLoadAudio('background-music', ASSET_PATHS.MUSIC.BACKGROUND);
          tryLoadAudio('combat-music', ASSET_PATHS.MUSIC.COMBAT);
          tryLoadAudio('menu-music', ASSET_PATHS.MUSIC.MENU);
          tryLoadAudio('title-music', ASSET_PATHS.MUSIC.TITLE);
          tryLoadAudio('game-music', ASSET_PATHS.MUSIC.GAME);
          
          const tryLoadImage = (key, path) => {
            if (path) {
              this.load.image(key, path);
            } else {
              console.warn(`⚠️ Skipping load.image for "${key}" — path is undefined`);
            }
          };
          
          // Load common backgrounds
          tryLoadImage('character-bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
          tryLoadImage('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
          tryLoadImage('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
          tryLoadImage('title-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
          tryLoadImage('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);
          tryLoadImage('dungeon-bg', ASSET_PATHS.BACKGROUNDS.DUNGEON);
          tryLoadImage('battle-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);

          // Load character portraits
          tryLoadImage('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
          tryLoadImage('mage', ASSET_PATHS.PORTRAITS.MAGE);
          tryLoadImage('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
          tryLoadImage('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
          tryLoadImage('ranger', ASSET_PATHS.PORTRAITS.RANGER);
          tryLoadImage('bard', ASSET_PATHS.PORTRAITS.BARD);

          // Load icons
          tryLoadImage('player-icon', ASSET_PATHS.ICONS.PLAYER);
          tryLoadImage('health-icon', ASSET_PATHS.ICONS.HEALTH);
          tryLoadImage('mana-icon', ASSET_PATHS.ICONS.MANA);
          tryLoadImage('strength-icon', ASSET_PATHS.ICONS.STRENGTH);
          tryLoadImage('agility-icon', ASSET_PATHS.ICONS.AGILITY);
          tryLoadImage('intelligence-icon', ASSET_PATHS.ICONS.INTELLIGENCE);
          tryLoadImage('constitution-icon', ASSET_PATHS.ICONS.CONSTITUTION);

          // Load effects
          tryLoadImage('slash-effect', ASSET_PATHS.EFFECTS.SLASH);
          tryLoadImage('fire-effect', ASSET_PATHS.EFFECTS.FIRE);
          tryLoadImage('heal-effect', ASSET_PATHS.EFFECTS.HEAL);

        } catch (error) {
          console.error('Error loading assets:', error);
        }
}
    


export default PreloadScene;
