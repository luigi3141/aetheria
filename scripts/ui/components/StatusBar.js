/**
 * StatusBar - A reusable health/mana bar component
 * Creates a dynamic bar with background, foreground, and optional text label
 */
class StatusBar {
    /**
     * Create a new status bar
     * @param {Phaser.Scene} scene - The scene this status bar belongs to
     * @param {number} x - X position (center)
     * @param {number} y - Y position (center)
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @param {object} options - Optional configuration
     */
    constructor(scene, x, y, current, max, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.current = current;
        this.max = max;
        
        // Default options
        this.width = options.width || 200;
        this.height = options.height || 20;
        this.barColor = options.barColor || 0x00ff00;
        this.bgColor = options.bgColor || 0x333333;
        this.borderColor = options.borderColor || 0xffffff;
        this.showText = options.showText !== undefined ? options.showText : true;
        this.textPrefix = options.textPrefix || 'HP';
        this.fontFamily = options.fontFamily || "'Press Start 2P'";
        this.fontSize = options.fontSize || 12;
        this.fontColor = options.fontColor || '#ffffff';
        
        // Calculate bar positioning
        this.barX = x - this.width / 2;
        this.barY = y - this.height / 2;
        
        this._create();
    }
    
    /**
     * Create the status bar elements
     * @private
     */
    _create() {
        // Create background
        this.bg = this.scene.add.rectangle(
            this.x, this.y, this.width, this.height, this.bgColor
        ).setOrigin(0.5);
        
        // Create foreground bar
        this.bar = this.scene.add.graphics();
        
        // Create border
        this.border = this.scene.add.graphics();
        this.border.lineStyle(2, this.borderColor, 1);
        this.border.strokeRect(this.barX, this.barY, this.width, this.height);
        
        // Create text if needed
        if (this.showText) {
            this.text = this.scene.add.text(
                this.x, this.y, 
                `${this.textPrefix}: ${this.current}/${this.max}`, 
                {
                    fontFamily: this.fontFamily,
                    fontSize: this.fontSize,
                    fill: this.fontColor,
                    align: 'center'
                }
            ).setOrigin(0.5);
        }
        
        // Draw initial bar
        this._updateBar();
    }
    
    /**
     * Update the bar graphics
     * @private
     */
    _updateBar() {
        // Ensure values are valid
        this.current = Math.min(this.current, this.max);
        this.current = Math.max(0, this.current);
        
        // Calculate percentage
        const percent = this.current / this.max;
        
        // Update bar graphics
        this.bar.clear();
        this.bar.fillStyle(this.barColor, 1);
        this.bar.fillRect(
            this.barX, 
            this.barY, 
            this.width * percent, 
            this.height
        );
    }
    
    /**
     * Update bar values and appearance
     * @param {number} newCurrent - New current value
     * @param {number} newMax - New maximum value (optional)
     */
    update(newCurrent, newMax = null) {
        this.current = newCurrent;
        
        if (newMax !== null) {
            this.max = newMax;
        }
        
        // Update bar fill
        this._updateBar();
        
        // Update text if it exists
        if (this.text) {
            this.text.setText(`${this.textPrefix}: ${this.current}/${this.max}`);
        }
        
        return this;
    }
    
    /**
     * Set bar color
     * @param {number} newColor - New color value
     */
    setBarColor(newColor) {
        this.barColor = newColor;
        this._updateBar();
        return this;
    }
    
    /**
     * Set position of all elements
     * @param {number} newX - New X position
     * @param {number} newY - New Y position
     */
    setPosition(newX, newY) {
        // Calculate offsets
        const offsetX = newX - this.x;
        const offsetY = newY - this.y;
        
        // Update stored coordinates
        this.x = newX;
        this.y = newY;
        this.barX = this.barX + offsetX;
        this.barY = this.barY + offsetY;
        
        // Move background
        this.bg.setPosition(newX, newY);
        
        // Update bar position (requires redraw)
        this._updateBar();
        
        // Update border position
        this.border.clear();
        this.border.lineStyle(2, this.borderColor, 1);
        this.border.strokeRect(this.barX, this.barY, this.width, this.height);
        
        // Move text if it exists
        if (this.text) {
            this.text.setPosition(newX, newY);
        }
        
        return this;
    }
    
    /**
     * Clean up all elements
     */
    destroy() {
        if (this.bg) this.bg.destroy();
        if (this.bar) this.bar.destroy();
        if (this.border) this.border.destroy();
        if (this.text) this.text.destroy();
        // Nullify references
        this.scene = null;
        this.bg = null;
        this.bar = null;
        this.border = null;
        this.text = null;
    }
}

export default StatusBar;
