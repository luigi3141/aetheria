// ---- File: scripts/utils/AssetLoader.js ---- // <<< RENAME FILE (optional but clearer)
// ---- (Formerly PreloadScene.js) ----

import { ASSET_PATHS } from '../config/AssetConfig.js';

// No longer extends BaseScene or Phaser.Scene
class AssetLoader {

    /**
     * Static method to queue loading of shared assets in the background.
     * Call this from a scene that is already running (like StartScene).
     * @param {Phaser.Scene} scene - The scene instance whose loader will be used.
     */
    static loadSharedAssetsInBackground(scene) {
        console.log(`[AssetLoader] Queuing shared assets for background loading in scene: ${scene.scene.key}`);

        // Use the provided scene's loader
        const loader = scene.load;

        const tryLoadAudio = (key, path) => {
            // Only queue if not already loaded AND not currently loading
            if (path && !scene.cache.audio.exists(key) && !scene.load.isLoading(key)) {
                 console.log(`[AssetLoader] Queueing Audio: ${key}`);
                 loader.audio(key, path);
            } else if (scene.cache.audio.exists(key)) {
                 // console.log(`[AssetLoader] Audio already cached: ${key}`);
            } else if (scene.load.isLoading(key)) {
                 // console.log(`[AssetLoader] Audio already loading: ${key}`);
            } else if (!path) { console.warn(`Audio path missing for ${key}`); }
        };
        const tryLoadImage = (key, path) => {
            // Only queue if not already loaded OR loading
            if (path && !scene.textures.exists(key) && !loader.isLoading(key)) {
                // console.log(`Queueing Image: ${key}`);
                loader.image(key, path);
            } else if (!path) { console.warn(`Image path missing for ${key}`); }
        };

        // --- Queue Assets (Same list as before) ---
        console.log("[AssetLoader] Queueing Audio...");
        // Load audio assets
        tryLoadAudio('attack', ASSET_PATHS.SOUNDS.combat.attack);
        //tryLoadAudio('hit', ASSET_PATHS.SOUNDS.combat.hit);
        //tryLoadAudio('victory', ASSET_PATHS.SOUNDS.combat.victory);
        //tryLoadAudio('defeat', ASSET_PATHS.SOUNDS.combat.defeat);
        //tryLoadAudio('level-up', ASSET_PATHS.SOUNDS.combat.levelUp);
        //tryLoadAudio('heal', ASSET_PATHS.SOUNDS.combat.heal);
        tryLoadAudio('button-click', ASSET_PATHS.SOUNDS.ui.buttonClick);
        //tryLoadAudio('menu-open', ASSET_PATHS.SOUNDS.ui.menuOpen);
        //tryLoadAudio('menu-close', ASSET_PATHS.SOUNDS.ui.menuClose);
        //tryLoadAudio('background-music', ASSET_PATHS.MUSIC.BACKGROUND);
        //tryLoadAudio('combat-music', ASSET_PATHS.MUSIC.COMBAT);
        //tryLoadAudio('menu-music', ASSET_PATHS.MUSIC.MENU);
        tryLoadAudio('title-music', ASSET_PATHS.MUSIC.TITLE);
        //tryLoadAudio('game-music', ASSET_PATHS.MUSIC.GAME);
        tryLoadAudio('battle-music', ASSET_PATHS.MUSIC.BATTLE);
        //tryLoadAudio('crafting-music', ASSET_PATHS.MUSIC.CRAFTING);
        //tryLoadAudio('inventory-music', ASSET_PATHS.MUSIC.INVENTORY);
        tryLoadAudio('player-hit', ASSET_PATHS.SOUNDS.combat.playerHit);

        // Load shared images
        // Common backgrounds used across scenes
        console.log("[AssetLoader] Queueing Backgrounds...");
        tryLoadImage('character-bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        tryLoadImage('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
        tryLoadImage('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
        tryLoadImage('overworld-bg', ASSET_PATHS.BACKGROUNDS.OVERWORLD);
        tryLoadImage('dungeon-bg', ASSET_PATHS.BACKGROUNDS.DUNGEON);
        tryLoadImage('battle-result-bg', ASSET_PATHS.BACKGROUNDS.BATTLE_RESULT);
        tryLoadImage('crafting-bg', ASSET_PATHS.BACKGROUNDS.CRAFTING);

        // Character portraits used in multiple scenes
        console.log("[AssetLoader] Queueing Portraits...");
        tryLoadImage('warrior', ASSET_PATHS.PORTRAITS.WARRIOR);
        tryLoadImage('mage', ASSET_PATHS.PORTRAITS.MAGE);
        tryLoadImage('rogue', ASSET_PATHS.PORTRAITS.ROGUE);
        tryLoadImage('cleric', ASSET_PATHS.PORTRAITS.CLERIC);
        tryLoadImage('ranger', ASSET_PATHS.PORTRAITS.RANGER);
        tryLoadImage('bard', ASSET_PATHS.PORTRAITS.BARD);

        // Combat effects used in multiple scenes
        tryLoadImage('slash-effect', ASSET_PATHS.EFFECTS.SLASH);
        tryLoadImage('fire-effect', ASSET_PATHS.EFFECTS.FIRE);
        //tryLoadImage('heal-effect', ASSET_PATHS.EFFECTS.HEAL);

        // UI elements used across scenes
        //tryLoadImage('ui-panel', ASSET_PATHS.UI.panel);
        //tryLoadImage('ui-button', ASSET_PATHS.UI.button);
        if (!loader.isLoading()) {
            console.log("[AssetLoader] Starting background asset load...");
            loader.start();
        } else {
             console.log("[AssetLoader] Loader already active, assets queued.");
        }

         // Optional: Listen for load completion for debugging
         loader.off('complete', AssetLoader.onLoadComplete); // Remove previous listener if any
         loader.on('complete', AssetLoader.onLoadComplete);

          // Only start loader if it's not already running AND has files queued
     if (!loader.isLoading() && loader.totalToLoad > 0) {
        console.log("[AssetLoader] Starting background asset load...");
        loader.start();
     } else if (loader.isLoading()){
         console.log("[AssetLoader] Loader already active, assets queued.");
     } else {
          console.log("[AssetLoader] No new assets queued for background loading.");
     }
    }

    static onLoadComplete() {
         console.log("[AssetLoader] Background asset loading complete.");
         // No scene transition here - loading happens in the background
    }
}

// Export the class or the static method directly
export { AssetLoader };