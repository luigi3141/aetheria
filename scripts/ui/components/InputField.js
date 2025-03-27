/**
 * InputField - A reusable text input field component
 * Creates an interactive input field that uses a prompt to update text
 */
class InputField {
    /**
     * Create a new input field
     * @param {Phaser.Scene} scene - The scene this input field belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} defaultValue - Default text value
     * @param {function} onChange - Function to call when value changes
     * @param {object} options - Optional configuration
     */
    constructor(scene, x, y, defaultValue, onChange = null, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.value = defaultValue;
        this.onChange = onChange;
        
        // Configuration options
        this.width = options.width || 300;
        this.height = options.height || 50;
        this.fontSize = options.fontSize || 16;
        this.fontFamily = options.fontFamily || "'VT323'";
        this.promptText = options.promptText || 'Enter text:';
        this.fillColor = options.fillColor || 0x222233;
        this.borderColor = options.borderColor || 0xffd700;
        this.textColor = options.textColor || '#ffffff';
        this.cornerSize = options.cornerSize !== undefined ? options.cornerSize : 4;
        
        // Create container for all input elements
        this.container = scene.add.container(x, y);
        
        this._create();
    }
    
    /**
     * Create the input field elements
     * @private
     */
    _create() {
        // Create background panel
        this.bg = this.scene.add.rectangle(0, 0, this.width, this.height, this.fillColor)
            .setOrigin(0.5)
            .setStrokeStyle(2, this.borderColor);
        
        // Add to container
        this.container.add(this.bg);
        
        // Create pixel corners
        this.corners = this.scene.add.graphics();
        this.corners.fillStyle(this.borderColor, 1);
        
        // Draw pixel corners (small squares at each corner)
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.corners.fillRect(-halfWidth, -halfHeight, this.cornerSize, this.cornerSize); // Top-left
        this.corners.fillRect(halfWidth - this.cornerSize, -halfHeight, this.cornerSize, this.cornerSize); // Top-right
        this.corners.fillRect(-halfWidth, halfHeight - this.cornerSize, this.cornerSize, this.cornerSize); // Bottom-left
        this.corners.fillRect(halfWidth - this.cornerSize, halfHeight - this.cornerSize, this.cornerSize, this.cornerSize); // Bottom-right
        
        // Add to container
        this.container.add(this.corners);
        
        // Create text display
        this.text = this.scene.add.text(0, 0, this.value, {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize + 'px',
            fill: this.textColor,
            align: 'center',
            resolution: 3
        }).setOrigin(0.5);
        
        // Add to container
        this.container.add(this.text);
        
        // Make the background interactive
        this.bg.setInteractive({ useHandCursor: true });
        
        // Handle click to edit
        this.bg.on('pointerdown', () => {
            // Show prompt dialog
            const newValue = prompt(this.promptText + ' (max 20 characters)', this.value);
            
            // Update if value changed and not cancelled
            if (newValue !== null && newValue !== this.value) {
                // Truncate to 20 characters
                const truncatedValue = newValue.slice(0, 20);
                this.setValue(truncatedValue);
                
                // Call onChange callback if provided
                if (this.onChange) {
                    this.onChange(truncatedValue);
                }
            }
        });
    }
    
    /**
     * Get the current input value
     * @returns {string} Current value
     */
    getValue() {
        return this.value;
    }
    
    /**
     * Set the input value
     * @param {string} newValue - New value to set
     */
    setValue(newValue) {
        this.value = newValue;
        this.text.setText(newValue);
        return this;
    }
    
    /**
     * Set field position
     * @param {number} newX - New X position
     * @param {number} newY - New Y position
     */
    setPosition(newX, newY) {
        this.x = newX;
        this.y = newY;
        this.container.setPosition(newX, newY);
        return this;
    }
    
    /**
     * Clean up all elements
     */
    destroy() {
        this.container.destroy();
    }
}

export default InputField;
