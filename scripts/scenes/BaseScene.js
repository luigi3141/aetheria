import UIManager from '../ui/UIManager.js';
import TransitionManager from '../ui/TransitionManager.js';

/**
 * BaseScene - Base class for all scenes with common functionality
 */
class BaseScene extends Phaser.Scene {
    /**
     * @param {string} key - The scene key
     * @param {object} options - Additional scene options
     */
    constructor(key, options = {}) {
        super({ key, ...options });
    }

    /**
     * Initialize base scene components
     * This should be called at the beginning of the create() method in child classes
     */
    initializeScene() {
        // Initialize UI manager
        this.ui = new UIManager(this);
        
        // Initialize transitions manager
        this.transitions = new TransitionManager(this);
        
        
        // Initialize safe asset handling
        this.initializeSafeAssetHandling();
    }
    
    /**
     * Safely play a sound with error handling
     * @param {string} key - Sound key
     * @param {object} config - Sound configuration
     */
    safePlaySound(key, config = { volume: 0.5 }) {
        try {
            // Check if the sound exists in the cache
            if (this.sound.get(key)) {
                this.sound.play(key, config);
            } else {
                console.warn(`Sound ${key} not found in cache`);
            }
        } catch (error) {
            console.warn(`Error playing sound ${key}: ${error.message}`);
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
        try {
            if (this.textures.exists(key)) {
                return this.add.image(x, y, key, options);
            } else {
                console.warn(`Image ${key} not found in cache, using placeholder`);
                // Create a placeholder rectangle
                const placeholder = this.add.rectangle(x, y, 64, 64, 0xff00ff);
                if (options.displayWidth) placeholder.displayWidth = options.displayWidth;
                if (options.displayHeight) placeholder.displayHeight = options.displayHeight;
                return placeholder;
            }
        } catch (error) {
            console.warn(`Error adding image ${key}: ${error.message}`);
            return this.add.rectangle(x, y, 64, 64, 0xff00ff);
        }
    }
    
    /**
     * Initialize safe asset handling methods
     * Adds methods for safely handling assets with proper error management
     */
    initializeSafeAssetHandling() {
        // This can be expanded with more safe asset methods as needed
    }
}

export default BaseScene;
