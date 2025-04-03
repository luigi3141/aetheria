// ---- File: BaseScene.js ----

import UIManager from '../ui/UIManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import audioManager from '../utils/AudioManager.js'; // Corrected import name casing

/**
 * BaseScene - Base class for all scenes with common functionality
 */
export default class BaseScene extends Phaser.Scene {
    constructor(config) {
        if (!config || typeof config.key !== 'string') {
          throw new Error(
            `BaseScene constructor must be passed an object with a valid { key: 'SceneName' }`
          );
        }

        super(config);
        console.log(`🧩 BaseScene constructor for ${config.key}`);
    }

    /**
     * Initialize base scene components
     * This should be called at the beginning of the create() method in child classes
     */
    initializeScene() {
        // Initialize UI manager if not already set
        if (!this.ui) {
            console.log(`🧩 Initializing UIManager for scene: ${this.scene.key}`);
            try {
                this.ui = new UIManager(this);
            } catch (e) {
                console.warn(`⚠️ UIManager failed to initialize in ${this.scene.key}:`, e);
            }
        }

        // Initialize transition manager if not already set
        if (!this.transitions) {
            console.log(`🧩 Initializing TransitionManager for scene: ${this.scene.key}`);
            try {
                this.transitions = new TransitionManager(this);
            } catch (e) {
                console.warn(`⚠️ TransitionManager failed to initialize in ${this.scene.key}:`, e);
            }
        }

        // Initialize safe asset handling
        if (typeof this.initializeSafeAssetHandling === 'function') {
            try {
                this.initializeSafeAssetHandling();
            } catch (e) {
                console.warn(`⚠️ initializeSafeAssetHandling failed in ${this.scene.key}:`, e);
            }
        }

        // Resume audio context on first interaction if needed
        if (this.sound?.context?.state === 'suspended') {
            const resumeAudioContext = () => {
                if (this.sound?.context?.state === 'suspended') {
                    this.sound.context.resume().then(() => {
                        console.log(`AudioContext resumed for scene ${this.scene.key}`);
                    }).catch(e => console.error(`Error resuming AudioContext in ${this.scene.key}:`, e));
                }
                // Clean up listeners after first interaction
                window.removeEventListener('pointerdown', resumeAudioContext);
                document.removeEventListener('keydown', resumeAudioContext);
            };
            window.addEventListener('pointerdown', resumeAudioContext, { once: true });
            document.addEventListener('keydown', resumeAudioContext, { once: true });
        }
        // --- Set AudioManager context ---
        audioManager.setScene(this);
        // ---

    }

     // Ensure context is set if create is overridden and called later
     create() {
         audioManager.setScene(this);
         // Subclasses should call super.create() if they override this,
         // or ensure they call initializeScene() / audioManager.setScene(this) themselves.
     }


    /**
     * Safely play a sound EFFECT using the AudioManager
     * @param {string} key - The key of the sound to play
     * @param {object} config - Optional Phaser sound config (e.g., { volume: 0.5 })
     * @returns {void} - This method no longer returns the sound instance directly
     */
    safePlaySound(key, config = {}) { // Added config parameter back
        // --- FIX: Delegate to AudioManager ---
        try {
             // console.log(`[BaseScene ${this.scene.key}] Playing SFX: ${key}`); // Optional detailed log
             audioManager.playSoundEffect(key, config); // Pass config along
        } catch (e) {
             // AudioManager already logs errors, but catch here just in case
             console.warn(`[BaseScene ${this.scene.key}] Error occurred trying to play sound ${key}:`, e);
        }
        // --- END FIX ---
    }


    /**
     * Safely display an image with error handling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} key - Image key
     * @param {object} options - Additional display options
     * @returns {Phaser.GameObjects.Image} The created image or a placeholder
     */
    safeAddImage(x, y, key, options = {}) {
        let imageObject = null;
        try {
            if (this.textures.exists(key)) {
                // Create the image using only x, y, key
                imageObject = this.add.image(x, y, key);

                // Apply options to the created image object
                if (options.displayWidth) {
                    imageObject.setDisplaySize(options.displayWidth, options.displayHeight || options.displayWidth); // Use displayWidth if height missing
                } else if (options.scale) {
                    imageObject.setScale(options.scale);
                }

                if (options.originX !== undefined && options.originY !== undefined) {
                     imageObject.setOrigin(options.originX, options.originY);
                } else if (options.origin !== undefined) {
                     imageObject.setOrigin(options.origin); // Handle single origin value
                }

                // Add other common options if needed (e.g., setDepth, setAlpha)
                if (options.depth !== undefined) {
                    imageObject.setDepth(options.depth);
                }


            } else {
                console.warn(`Image ${key} not found in cache, using placeholder`);
                // Create a placeholder rectangle
                imageObject = this.add.rectangle(x, y, options.displayWidth || 64, options.displayHeight || 64, 0xff00ff);
                if (options.originX !== undefined && options.originY !== undefined) {
                     imageObject.setOrigin(options.originX, options.originY);
                 } else if (options.origin !== undefined) {
                     imageObject.setOrigin(options.origin);
                 }
                 if (options.depth !== undefined) {
                    imageObject.setDepth(options.depth);
                }
            }
        } catch (error) {
            console.warn(`Error adding image ${key}: ${error.message}`);
            // Fallback placeholder on error
            imageObject = this.add.rectangle(x, y, options.displayWidth || 64, options.displayHeight || 64, 0xff00ff);
             if (options.originX !== undefined && options.originY !== undefined) {
                 imageObject.setOrigin(options.originX, options.originY);
             } else if (options.origin !== undefined) {
                 imageObject.setOrigin(options.origin);
             }
             if (options.depth !== undefined) {
                imageObject.setDepth(options.depth);
             }
        }
        return imageObject; // Return the created image or placeholder
    }

    shutdown() {
        console.log(`--- ${this.scene.key} SHUTDOWN ---`);
        // Clean up listeners? (Phaser might handle this automatically for scene events)
        // If you added global listeners (e.g., to window), remove them here.

        // Optionally tell AudioManager the scene is ending (might not be necessary)
        // if (audioManager.scene === this) {
        //     audioManager.setScene(null);
        // }
    }
    /**
     * Initialize safe asset handling methods
     * Adds methods for safely handling assets with proper error management
     */
    initializeSafeAssetHandling() {
        // This can be expanded with more safe asset methods as needed
    }
}