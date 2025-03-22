/**
 * Button - A reusable pixel-art style button component
 */
class Button {
    /**
     * Create a new button
     * @param {Phaser.Scene} scene - The scene this button belongs to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {function} callback - Function to call when button is clicked
     * @param {object} options - Optional configuration
     */
    constructor(scene, x, y, text, callback, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = text;
        this.callback = callback;
        
        // Set default options
        this.width = options.width || 240;
        this.height = options.height || 50;
        this.fontSize = options.fontSize || 16;
        this.fontFamily = options.fontFamily || "'Press Start 2P'";
        this.fillColor = options.fillColor || 0x4a6fb2;
        this.hoverColor = options.hoverColor || 0x5a7fc2;
        this.activeColor = options.activeColor || 0x3a5f92;
        this.strokeColor = options.strokeColor || 0xffd700;
        this.textColor = options.textColor || '#ffffff';
        this.disabled = options.disabled || false;
        this.cornerSize = options.cornerSize || 4;
        this.pixelPerfect = options.pixelPerfect !== false;
        
        // Create button elements
        this.create();
    }
    
    /**
     * Create the button elements
     */
    create() {
        // Create a container for all button elements
        this.container = this.scene.add.container(this.x, this.y);
        
        // Create button background
        this.bg = this.scene.add.rectangle(0, 0, this.width, this.height, this.fillColor)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setStrokeStyle(2, this.strokeColor);
            
        // Add to container
        this.container.add(this.bg);
        
        // Add pixel corners if pixel perfect is enabled
        if (this.pixelPerfect) {
            this.corners = this.scene.add.graphics();
            this.corners.fillStyle(this.strokeColor, 1);
            
            // Draw pixel corners (small squares at each corner)
            const halfWidth = this.width / 2;
            const halfHeight = this.height / 2;
            const cornerSize = this.cornerSize;
            
            this.corners.fillRect(-halfWidth, -halfHeight, cornerSize, cornerSize); // Top-left
            this.corners.fillRect(halfWidth - cornerSize, -halfHeight, cornerSize, cornerSize); // Top-right
            this.corners.fillRect(-halfWidth, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-left
            this.corners.fillRect(halfWidth - cornerSize, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-right
            
            // Add to container
            this.container.add(this.corners);
        }
        
        // Create button text
        this.textObj = this.scene.add.text(0, 0, this.text, {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize + 'px',
            fill: this.textColor,
            resolution: 3
        }).setOrigin(0.5);
        
        // Add to container
        this.container.add(this.textObj);
        
        // Create shine effect object (hidden by default)
        this.shine = this.scene.add.graphics();
        this.shine.fillStyle(0xffffff, 0.3);
        this.shine.fillRect(-this.width/2, -this.height/2, this.width/4, this.height);
        this.shine.visible = false;
        
        // Add to container
        this.container.add(this.shine);
        
        // Add hover effects
        this.bg.on('pointerover', this.onPointerOver, this);
        this.bg.on('pointerout', this.onPointerOut, this);
        this.bg.on('pointerdown', this.onPointerDown, this);
        this.bg.on('pointerup', this.onPointerUp, this);
        
        // Set initial state
        if (this.disabled) {
            this.disable();
        }
    }
    
    /**
     * Handle pointer over event
     */
    onPointerOver() {
        if (!this.disabled) {
            this.bg.fillColor = this.hoverColor;
            
            // Scale up slightly
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power1'
            });
        }
    }
    
    /**
     * Handle pointer out event
     */
    onPointerOut() {
        if (!this.disabled) {
            this.bg.fillColor = this.fillColor;
            
            // Scale back to normal
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power1'
            });
        }
    }
    
    /**
     * Handle pointer down event
     */
    onPointerDown() {
        if (!this.disabled) {
            // Change color and scale down slightly
            this.bg.fillColor = this.activeColor;
            
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                ease: 'Power1'
            });
        }
    }
    
    /**
     * Handle pointer up event
     */
    onPointerUp() {
        if (!this.disabled) {
            // Restore hover color and scale
            this.bg.fillColor = this.hoverColor;
            
            this.scene.tweens.add({
                targets: this.container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 50,
                ease: 'Power1',
                onComplete: () => {
                    if (this.callback) {
                        this.callback();
                    }
                }
            });
        }
    }
    
    /**
     * Add a shine effect animation to the button
     * @param {object} options - Optional configuration
     * @returns {Button} This button for chaining
     */
    addShineEffect(options = {}) {
        const duration = options.duration || 2000;
        const delay = options.delay || 1000;
        const repeat = options.repeat !== undefined ? options.repeat : -1;
        
        // Make shine visible
        this.shine.visible = true;
        
        // Position shine off the left edge initially
        this.shine.x = -this.width;
        
        // Create the shine animation
        this.shineAnim = this.scene.tweens.add({
            targets: this.shine,
            x: this.width,
            duration: duration,
            delay: delay,
            repeat: repeat,
            yoyo: false,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                if (repeat === 0) {
                    this.shine.visible = false;
                }
            }
        });
        
        return this;
    }
    
    /**
     * Stop the shine effect animation
     * @returns {Button} This button for chaining
     */
    stopShineEffect() {
        if (this.shineAnim) {
            this.shineAnim.stop();
            this.shine.visible = false;
        }
        return this;
    }
    
    /**
     * Add a pulsing animation to the button
     * @param {object} options - Optional configuration
     * @returns {Button} This button for chaining
     */
    addPulseEffect(options = {}) {
        const scale = options.scale || 1.1;
        const duration = options.duration || 1000;
        const repeat = options.repeat !== undefined ? options.repeat : -1;
        
        this.pulseAnim = this.scene.tweens.add({
            targets: this.container,
            scaleX: scale,
            scaleY: scale,
            duration: duration,
            yoyo: true,
            repeat: repeat,
            ease: 'Sine.easeInOut'
        });
        
        return this;
    }
    
    /**
     * Stop the pulse animation
     * @returns {Button} This button for chaining
     */
    stopPulseEffect() {
        if (this.pulseAnim) {
            this.pulseAnim.stop();
            this.container.setScale(1);
        }
        return this;
    }
    
    /**
     * Enable the button
     * @returns {Button} This button for chaining
     */
    enable() {
        this.disabled = false;
        this.bg.fillColor = this.fillColor;
        this.textObj.setAlpha(1);
        return this;
    }
    
    /**
     * Disable the button
     * @returns {Button} This button for chaining
     */
    disable() {
        this.disabled = true;
        this.bg.fillColor = 0x666666;
        this.textObj.setAlpha(0.5);
        return this;
    }
    
    /**
     * Set the button text
     * @param {string} text - New button text
     * @returns {Button} This button for chaining
     */
    setText(text) {
        this.text = text;
        this.textObj.setText(text);
        return this;
    }
    
    /**
     * Set the button position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Button} This button for chaining
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.container.setPosition(x, y);
        return this;
    }
    
    /**
     * Set the button size
     * @param {number} width - Button width
     * @param {number} height - Button height
     * @returns {Button} This button for chaining
     */
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.bg.setSize(width, height);
        
        // Update corners if they exist
        if (this.corners) {
            this.corners.clear();
            this.corners.fillStyle(this.strokeColor, 1);
            
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            const cornerSize = this.cornerSize;
            
            this.corners.fillRect(-halfWidth, -halfHeight, cornerSize, cornerSize);
            this.corners.fillRect(halfWidth - cornerSize, -halfHeight, cornerSize, cornerSize);
            this.corners.fillRect(-halfWidth, halfHeight - cornerSize, cornerSize, cornerSize);
            this.corners.fillRect(halfWidth - cornerSize, halfHeight - cornerSize, cornerSize, cornerSize);
        }
        
        // Update shine if it exists
        if (this.shine) {
            this.shine.clear();
            this.shine.fillStyle(0xffffff, 0.3);
            this.shine.fillRect(-width/2, -height/2, width/4, height);
        }
        
        return this;
    }
    
    /**
     * Destroy the button
     */
    destroy() {
        if (this.shineAnim) this.shineAnim.stop();
        if (this.pulseAnim) this.pulseAnim.stop();
        this.container.destroy();
    }
}
