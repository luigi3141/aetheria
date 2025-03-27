/**
 * Panel - A reusable UI panel component
 * Creates a container with a background rectangle, optional border, and corner decorations
 */
class Panel {
    /**
     * Create a new panel
     * @param {Phaser.Scene} scene - The scene this panel belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {object} options - Optional configuration
     */
    constructor(scene, x, y, width, height, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Styling options
        this.fillColor = options.fillColor !== undefined ? options.fillColor : 0x222233;
        this.fillAlpha = options.fillAlpha !== undefined ? options.fillAlpha : 1;
        this.strokeColor = options.strokeColor !== undefined ? options.strokeColor : 0xffd700;
        this.strokeWidth = options.strokeWidth !== undefined ? options.strokeWidth : 2;
        this.cornerSize = options.cornerSize !== undefined ? options.cornerSize : 4;
        this.pixelPerfect = options.pixelPerfect !== undefined ? options.pixelPerfect : true;
        
        // Create container for all panel elements
        this.container = scene.add.container(x, y);
        
        // Create panel background
        this.bg = scene.add.rectangle(0, 0, width, height, this.fillColor, this.fillAlpha)
            .setOrigin(0.5)
            .setStrokeStyle(this.strokeWidth, this.strokeColor);
            
        // Add to container
        this.container.add(this.bg);
        
        // Add pixel corners if pixel perfect is enabled
        if (this.pixelPerfect) {
            this._createCorners();
        }
    }
    
    /**
     * Create pixel-art style corners
     * @private
     */
    _createCorners() {
        this.corners = this.scene.add.graphics();
        this.corners.fillStyle(this.strokeColor, 1);
        
        // Draw pixel corners (small squares at each corner)
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        
        this.corners.fillRect(-halfWidth, -halfHeight, this.cornerSize, this.cornerSize); // Top-left
        this.corners.fillRect(halfWidth - this.cornerSize, -halfHeight, this.cornerSize, this.cornerSize); // Top-right
        this.corners.fillRect(-halfWidth, halfHeight - this.cornerSize, this.cornerSize, this.cornerSize); // Bottom-left
        this.corners.fillRect(halfWidth - this.cornerSize, halfHeight - this.cornerSize, this.cornerSize, this.cornerSize); // Bottom-right
        
        // Add to container
        this.container.add(this.corners);
    }
    
    /**
     * Change panel size
     * @param {number} newWidth - New panel width
     * @param {number} newHeight - New panel height 
     */
    setSize(newWidth, newHeight) {
        this.width = newWidth;
        this.height = newHeight;
        
        // Update background
        this.bg.width = newWidth;
        this.bg.height = newHeight;
        
        // Update corners if pixel perfect is enabled
        if (this.pixelPerfect) {
            this.corners.clear();
            this._createCorners();
        }
        
        return this;
    }
    
    /**
     * Change panel position
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
     * Add a child to the panel
     * @param {Phaser.GameObjects.GameObject} child - Child to add
     */
    add(child) {
        this.container.add(child);
        return this;
    }
    
    /**
     * Clean up panel resources
     */
    destroy() {
        this.container.destroy();
    }
    
    /**
     * Get the container for adding custom content
     * @returns {Phaser.GameObjects.Container} The panel's container
     */
    getContainer() {
        return this.container;
    }
}

export default Panel;
