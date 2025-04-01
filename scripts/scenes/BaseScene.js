import UIManager from '../ui/UIManager.js';
import TransitionManager from '../ui/TransitionManager.js';

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
            window.addEventListener('pointerdown', () => {
                this.sound.context.resume();
            }, { once: true });
        }
    }

    /**
     * Safely play a sound, handling cases where the sound isn't loaded yet
     * @param {string} key - The key of the sound to play
     * @returns {Phaser.Sound.BaseSound|null} The sound object if successfully played
     */
    safePlaySound(key) {
        try {
            const sound = this.sound.get(key);
            if (sound) {
                return sound.play();
            } else if (this.cache.audio.exists(key)) {
                // Load it on the fly if cached
                return this.sound.add(key).play();
            } else {
                console.warn(`Sound ${key} not found in cache for scene ${this.scene.key}`);
                return null;
            }
        } catch (e) {
            console.warn(`Error playing sound ${key} in scene ${this.scene.key}:`, e);
            return null;
        }
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
    
            } else {
                console.warn(`Image ${key} not found in cache, using placeholder`);
                // Create a placeholder rectangle
                imageObject = this.add.rectangle(x, y, options.displayWidth || 64, options.displayHeight || 64, 0xff00ff);
                if (options.originX !== undefined && options.originY !== undefined) {
                     imageObject.setOrigin(options.originX, options.originY);
                 } else if (options.origin !== undefined) {
                     imageObject.setOrigin(options.origin);
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
        }
        return imageObject; // Return the created image or placeholder
    }
    
    shutdown() {
        console.log(`--- ${this.scene.key} SHUTDOWN ---`);
        // Call super.shutdown() if extending BaseScene and it has one
        // if (super.shutdown) {
        //     super.shutdown();
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