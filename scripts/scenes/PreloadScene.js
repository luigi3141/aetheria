/**
 * PreloadScene - Dedicated scene for preloading shared assets
 * This centralizes asset loading to prevent duplicate loading across scenes
 */

import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';

class PreloadScene extends BaseScene {
    constructor() {
        super({ key: 'PreloadScene' });
        this.headlessMode = true; // Always run in headless mode
    }

    /**
     * Static method to preload shared assets from any scene
     * @param {Phaser.Scene} scene - The scene to load assets from
     */
    static preloadSharedAssets(scene) {
        const tryLoadAudio = (key, path) => {
            if (path && !scene.sound.get(key)) {
                scene.load.audio(key, path);
            }
        };

        const tryLoadImage = (key, path) => {
            if (path && !scene.textures.exists(key)) {
                scene.load.image(key, path);
            }
        };

        // Load audio assets
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
        tryLoadAudio('battle-music', ASSET_PATHS.MUSIC.BATTLE);
        tryLoadAudio('crafting-music', ASSET_PATHS.MUSIC.CRAFTING);
        tryLoadAudio('inventory-music', ASSET_PATHS.MUSIC.INVENTORY);
        tryLoadAudio('player-hit', ASSET_PATHS.SOUNDS.combat.playerHit);

        // Load shared images
        // Common backgrounds used across scenes
        tryLoadImage('character-bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        tryLoadImage('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
        tryLoadImage('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
        tryLoadImage('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);
        tryLoadImage('dungeon-bg', ASSET_PATHS.BACKGROUNDS.DUNGEON);
        tryLoadImage('battle-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);
        tryLoadImage('crafting-bg', ASSET_PATHS.BACKGROUNDS.CRAFTING);

        // Character portraits used in multiple scenes
        tryLoadImage('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
        tryLoadImage('mage', ASSET_PATHS.PORTRAITS.MAGE);
        tryLoadImage('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
        tryLoadImage('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
        tryLoadImage('ranger', ASSET_PATHS.PORTRAITS.RANGER);
        tryLoadImage('bard', ASSET_PATHS.PORTRAITS.BARD);

        // Combat effects used in multiple scenes
        tryLoadImage('slash-effect', ASSET_PATHS.EFFECTS.SLASH);
        tryLoadImage('fire-effect', ASSET_PATHS.EFFECTS.FIRE);
        tryLoadImage('heal-effect', ASSET_PATHS.EFFECTS.HEAL);

        // UI elements used across scenes
        tryLoadImage('ui-panel', ASSET_PATHS.UI.panel);
        tryLoadImage('ui-button', ASSET_PATHS.UI.button);
    }

    preload() {
        // This scene is now only used as a utility, not for direct loading
        this.scene.stop();
    }

    create() {
        // Nothing to create since we're running headless
        this.scene.stop();
    }
}

export default PreloadScene;
