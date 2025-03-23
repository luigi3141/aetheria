import Button from './components/Button.js';
import { LAYOUT } from './Layout.js';

/**
 * ButtonFactory - Factory class for consistent button creation
 * Standardizes button appearance and behavior across the application
 */
class ButtonFactory {
    /**
     * Create a standard button with consistent styling and behavior
     * @param {Phaser.Scene} scene - The scene to add the button to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {Function} callback - Button click callback
     * @param {object} options - Additional button options
     * @returns {Button} The created button
     */
    static createButton(scene, x, y, text, callback, options = {}) {
        const width = options.width || LAYOUT.BUTTON.WIDTH;
        const height = options.height || LAYOUT.BUTTON.HEIGHT;
        const fontSize = options.fontSize || scene.ui?.fontSize?.md || '16px';
        const shine = options.shine !== undefined ? options.shine : true;
        
        const button = new Button(
            scene,
            x,
            y,
            text,
            callback,
            {
                width: width,
                height: height,
                fontSize: fontSize,
                fontFamily: options.fontFamily || "'Press Start 2P'",
                backgroundColor: options.backgroundColor || 0x6666ff,
                backgroundAlpha: options.backgroundAlpha || 0.8,
                borderColor: options.borderColor || 0xaaaaff,
                borderThickness: options.borderThickness || 2,
                textColor: options.textColor || '#ffffff',
                hoverColor: options.hoverColor || 0x8888ff,
                soundKey: options.soundKey || 'button-click',
                ...options
            }
        );
        
        // Add shine effect if specified
        if (shine) {
            button.addShineEffect();
        }
        
        return button;
    }
    
    /**
     * Create a navigation button (commonly used for scene transitions)
     * @param {Phaser.Scene} scene - The scene to add the button to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {string|Function} destination - Target scene key or callback function
     * @param {object} options - Additional button options
     * @returns {Button} The created button
     */
    static createNavigationButton(scene, x, y, text, destination, options = {}) {
        // Generate the callback based on destination
        let callback;
        
        if (typeof destination === 'string') {
            // If destination is a string, assume it's a scene key
            callback = () => {
                try {
                    scene.safePlaySound('button-click', { volume: 0.5 });
                    if (scene.navigationManager) {
                        scene.navigationManager.navigateTo(scene, destination);
                    } else if (window.navigationManager) {
                        window.navigationManager.navigateTo(scene, destination);
                    } else {
                        console.warn('Navigation manager not found, falling back to direct scene start');
                        scene.scene.start(destination);
                    }
                } catch (error) {
                    console.error(`Error navigating to ${destination}:`, error);
                }
            };
        } else if (typeof destination === 'function') {
            // If destination is a function, use it directly
            callback = destination;
        } else {
            console.warn('Invalid destination, creating disabled button');
            callback = () => { console.warn('Button has no valid destination'); };
        }
        
        // Create the button with navigation styling
        return this.createButton(scene, x, y, text, callback, {
            backgroundColor: options.backgroundColor || 0x3366cc,
            borderColor: options.borderColor || 0x66aaff,
            ...options
        });
    }
    
    /**
     * Create a back button for returning to previous scenes
     * @param {Phaser.Scene} scene - The scene to add the button to
     * @param {object} options - Additional button options
     * @returns {Button} The created button
     */
    static createBackButton(scene, options = {}) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        
        // Default position at bottom center
        const x = options.x || width / 2;
        const y = options.y || height * LAYOUT.BUTTON.Y;
        
        // Default text
        const text = options.text || 'Back';
        
        // Create callback for navigation
        const callback = () => {
            try {
                scene.safePlaySound('button-click', { volume: 0.5 });
                if (scene.navigationManager) {
                    scene.navigationManager.navigateBack(scene);
                } else if (window.navigationManager) {
                    window.navigationManager.navigateBack(scene);
                } else {
                    console.warn('Navigation manager not found, falling back to history');
                    scene.scene.start('OverworldScene'); // Default fallback
                }
            } catch (error) {
                console.error('Error navigating back:', error);
            }
        };
        
        // Create the back button
        return this.createButton(scene, x, y, text, callback, {
            backgroundColor: options.backgroundColor || 0x555555,
            borderColor: options.borderColor || 0x999999,
            width: options.width || LAYOUT.BUTTON.WIDTH,
            height: options.height || LAYOUT.BUTTON.HEIGHT,
            ...options
        });
    }
    
    /**
     * Create a set of action buttons for combat or interaction
     * @param {Phaser.Scene} scene - The scene to add the buttons to
     * @param {Array} actions - Array of action objects {text, callback, options}
     * @param {object} options - General options for all buttons
     * @returns {Array<Button>} Array of created buttons
     */
    static createActionButtons(scene, actions, options = {}) {
        const width = scene.cameras.main.width;
        const height = scene.cameras.main.height;
        
        // Default y position
        const baseY = options.baseY || height * LAYOUT.COMBAT.ACTION_BUTTONS.Y;
        
        // Default spacing
        const spacing = options.spacing || LAYOUT.COMBAT.ACTION_BUTTONS.SPACING;
        
        // Calculate starting x position for centering the buttons
        const totalWidth = (actions.length - 1) * spacing;
        const startX = width / 2 - totalWidth / 2;
        
        // Create all action buttons
        const buttons = [];
        
        actions.forEach((action, index) => {
            const x = startX + index * spacing;
            const button = this.createButton(
                scene,
                x,
                baseY,
                action.text,
                action.callback,
                {
                    backgroundColor: 0x3366aa,
                    width: 120,
                    height: 40,
                    ...options,
                    ...action.options
                }
            );
            
            buttons.push(button);
        });
        
        return buttons;
    }
}

export default ButtonFactory;
