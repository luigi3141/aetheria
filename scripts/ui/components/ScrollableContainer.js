/**
 * ScrollableContainer - A container that supports scrolling for its contents
 * Particularly useful for combat logs, inventory lists, and other scrollable content
 */
class ScrollableContainer {
    /**
     * Create a new scrollable container
     * @param {Phaser.Scene} scene - The scene to add the container to
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Container width
     * @param {number} height - Container height
     * @param {object} options - Additional options
     */
    constructor(scene, x, y, width, height, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // Configuration options
        this.options = {
            backgroundColor: options.backgroundColor || 0x222233,
            backgroundAlpha: options.backgroundAlpha || 0.7,
            borderColor: options.borderColor || 0x9999aa,
            borderThickness: options.borderThickness || 2,
            padding: options.padding || 10,
            scrollbarWidth: options.scrollbarWidth || 8,
            scrollbarColor: options.scrollbarColor || 0x6666cc,
            scrollbarAlpha: options.scrollbarAlpha || 0.8,
            mask: options.mask !== undefined ? options.mask : true,
            ...options
        };
        
        // Initialize container
        this.initialize();
    }
    
    /**
     * Initialize the scrollable container
     */
    initialize() {
        // Create background
        this.background = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            this.options.backgroundColor,
            this.options.backgroundAlpha
        );
        this.background.setOrigin(0.5);
        
        // Add border
        if (this.options.borderThickness > 0) {
            this.border = this.scene.add.rectangle(
                this.x,
                this.y,
                this.width,
                this.height,
                this.options.borderColor,
                1
            );
            this.border.setOrigin(0.5);
            this.border.setStrokeStyle(this.options.borderThickness, this.options.borderColor);
        }
        
        // Create container
        this.container = this.scene.add.container(
            this.x - (this.width / 2) + this.options.padding,
            this.y - (this.height / 2) + this.options.padding
        );
        
        // Set up masking if enabled
        if (this.options.mask) {
            this.createMask();
        }
        
        // Initialize content values
        this.contentHeight = 0;
        this.scrollPosition = 0;
        this.maxScroll = 0;
        
        // Create scrollbar if needed
        this.createScrollbar();
        
        // Set up input handling
        this.setupInputHandling();
    }
    
    /**
     * Create a mask for the container
     */
    createMask() {
        const maskGraphics = this.scene.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillRect(
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
        
        const mask = maskGraphics.createGeometryMask();
        this.container.setMask(mask);
        this.maskGraphics = maskGraphics;
    }
    
    /**
     * Create the scrollbar
     */
    createScrollbar() {
        // Create scrollbar background
        this.scrollbarBg = this.scene.add.rectangle(
            this.x + (this.width / 2) - this.options.scrollbarWidth - 2,
            this.y,
            this.options.scrollbarWidth,
            this.height - 4,
            0x000000,
            0.3
        );
        this.scrollbarBg.setOrigin(0, 0.5);
        
        // Create scrollbar handle
        this.scrollbarHandle = this.scene.add.rectangle(
            this.x + (this.width / 2) - this.options.scrollbarWidth - 2,
            this.y - (this.height / 2) + 2,
            this.options.scrollbarWidth,
            40, // Initial height, will adjust
            this.options.scrollbarColor,
            this.options.scrollbarAlpha
        );
        this.scrollbarHandle.setOrigin(0, 0);
        
        // Hide scrollbar initially
        this.scrollbarBg.visible = false;
        this.scrollbarHandle.visible = false;
    }
    
    /**
     * Setup input handling for scrolling
     */
    setupInputHandling() {
        // Create interactive area
        this.interactiveArea = this.scene.add.rectangle(
            this.x,
            this.y,
            this.width,
            this.height,
            0xffffff,
            0
        ).setInteractive();
        
        // Mouse wheel scrolling
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            // Only handle if within interactive area
            if (this.isPointerOver(pointer)) {
                this.scroll(deltaY * 0.5);
            }
        });
        
        // Drag scrolling
        this.interactiveArea.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.lastDragY = pointer.y;
        });
        
        this.scene.input.on('pointermove', (pointer) => {
            if (this.isDragging && pointer.isDown) {
                const deltaY = this.lastDragY - pointer.y;
                this.scroll(deltaY);
                this.lastDragY = pointer.y;
            }
        });
        
        this.scene.input.on('pointerup', () => {
            this.isDragging = false;
        });
    }
    
    /**
     * Check if pointer is over the interactive area
     * @param {Phaser.Input.Pointer} pointer - The pointer to check
     * @returns {boolean} True if pointer is over
     */
    isPointerOver(pointer) {
        const bounds = this.interactiveArea.getBounds();
        return bounds.contains(pointer.x, pointer.y);
    }
    
    /**
     * Add an item to the container
     * @param {Phaser.GameObjects.GameObject} item - The item to add
     * @param {number} y - Y position relative to previous content
     */
    addItem(item, y = null) {
        // If y not specified, add after last item
        if (y === null) {
            y = this.contentHeight;
        }
        
        // Add item to the container
        this.container.add(item);
        
        // Calculate item height (using displayHeight if available)
        const itemHeight = item.displayHeight || item.height || 20;
        
        // Set item's position within container
        item.y = y;
        
        // Update content height if this item extends beyond current height
        this.contentHeight = Math.max(this.contentHeight, y + itemHeight);
        
        // Update max scroll value
        this.updateMaxScroll();
        
        // Update scrollbar visibility
        this.updateScrollbar();
        
        return item;
    }
    
    /**
     * Add a text item to the container
     * @param {string} text - The text to add
     * @param {object} style - Text style
     * @returns {Phaser.GameObjects.Text} The created text object
     */
    addText(text, style = {}) {
        // Default style
        const defaultStyle = {
            fontFamily: "'VT323'",
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: this.width - (this.options.padding * 2) - (this.options.scrollbarWidth + 4) }
        };
        
        // Create text object
        const textObj = this.scene.add.text(0, 0, text, {...defaultStyle, ...style});
        
        // Add to container
        this.addItem(textObj);
        
        return textObj;
    }
    
    /**
     * Scroll the container
     * @param {number} deltaY - Amount to scroll
     */
    scroll(deltaY) {
        if (this.maxScroll <= 0) return; // No scrolling needed
        
        // Update scroll position
        this.scrollPosition = Phaser.Math.Clamp(
            this.scrollPosition + deltaY,
            0,
            this.maxScroll
        );
        
        // Apply scroll position to container
        this.container.y = this.y - (this.height / 2) + this.options.padding - this.scrollPosition;
        
        // Update scrollbar handle position
        this.updateScrollbarPosition();
    }
    
    /**
     * Update the maximum scroll value
     */
    updateMaxScroll() {
        // Calculate how much content extends beyond visible area
        const visibleHeight = this.height - (this.options.padding * 2);
        this.maxScroll = Math.max(0, this.contentHeight - visibleHeight);
        
        // Update scrollbar visibility
        this.updateScrollbar();
    }
    
    /**
     * Update scrollbar visibility and size
     */
    updateScrollbar() {
        // Check if scrollbar is needed
        const needsScrollbar = this.maxScroll > 0;
        
        // Update visibility
        this.scrollbarBg.visible = needsScrollbar;
        this.scrollbarHandle.visible = needsScrollbar;
        
        if (needsScrollbar) {
            // Calculate scrollbar handle height
            const scrollTrackHeight = this.height - 4;
            const contentRatio = Math.min(1, (this.height - (this.options.padding * 2)) / this.contentHeight);
            const handleHeight = Math.max(30, scrollTrackHeight * contentRatio);
            
            // Update handle height
            this.scrollbarHandle.height = handleHeight;
            
            // Update handle position
            this.updateScrollbarPosition();
        }
    }
    
    /**
     * Update scrollbar handle position
     */
    updateScrollbarPosition() {
        if (this.maxScroll <= 0) return;
        
        // Calculate scrollbar handle position
        const scrollTrackHeight = this.height - 4 - this.scrollbarHandle.height;
        const scrollRatio = this.scrollPosition / this.maxScroll;
        const handleY = scrollRatio * scrollTrackHeight;
        
        // Set position
        this.scrollbarHandle.y = this.y - (this.height / 2) + 2 + handleY;
    }
    
    /**
     * Clear all items from the container
     */
    clear() {
        this.container.removeAll(true);
        this.contentHeight = 0;
        this.scrollPosition = 0;
        this.updateMaxScroll();
    }
    
    /**
     * Scroll to the bottom of the container
     */
    scrollToBottom() {
        this.scroll(this.maxScroll);
    }
    
    /**
     * Update the container size
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        // Update background
        this.background.width = width;
        this.background.height = height;
        
        // Update border
        if (this.border) {
            this.border.width = width;
            this.border.height = height;
        }
        
        // Update mask
        if (this.maskGraphics) {
            this.maskGraphics.clear();
            this.maskGraphics.fillStyle(0xffffff);
            this.maskGraphics.fillRect(
                this.x - width / 2,
                this.y - height / 2,
                width,
                height
            );
        }
        
        // Update interactive area
        this.interactiveArea.width = width;
        this.interactiveArea.height = height;
        
        // Update scrollbar
        this.scrollbarBg.height = height - 4;
        this.scrollbarBg.x = this.x + (width / 2) - this.options.scrollbarWidth - 2;
        
        // Recalculate max scroll
        this.updateMaxScroll();
    }
    
    /**
     * Set the visibility of the container
     * @param {boolean} visible - Visibility state
     */
    setVisible(visible) {
        this.background.visible = visible;
        if (this.border) this.border.visible = visible;
        this.container.visible = visible;
        this.scrollbarBg.visible = visible && (this.maxScroll > 0);
        this.scrollbarHandle.visible = visible && (this.maxScroll > 0);
        this.interactiveArea.visible = visible;
    }
}

export default ScrollableContainer;
