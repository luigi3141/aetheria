/**
 * ScrollableContainer.js
 * A container that supports scrolling for its contents
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
        // --- SIMPLIFIED Scene Validity Check ---
        // Primarily check if 'scene' is a valid object and has the 'add' factory.
        if (!scene || typeof scene.add === 'undefined') {
            console.error("[ScrollableContainer Constructor] Invalid or incomplete scene object provided!", scene);
            this.valid = false;
            return;
       }
       // Check if the scene seems active (less critical than 'add', but good to have)
       // Use optional chaining for safety
       if (!scene.sys?.isActive()) {
           console.warn(`[ScrollableContainer Constructor] Scene "${scene.scene?.key || 'Unknown'}" is not active during construction.`);
           // Decide if this should block construction - maybe not critical if 'add' exists
           // this.valid = false;
           // return;
       }
        this.valid = true; // Scene looks okay initially
        // --- End Scene Check ---

        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.managedObjects = []; // Initialize managedObjects array BEFORE initialize()

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

        // Initialize container only if valid
        if(this.valid) {
             this.initialize();
        }
    }

    /**
     * Initialize the scrollable container
     */
    initialize() {
        // --- SIMPLIFIED Double Check ---
        if (!this.valid || !this.scene || !this.scene.add) { // Check 'add' again
            console.error("[ScrollableContainer Initialize] Cannot initialize - scene context or 'add' factory is invalid.");
            this.container = null;
            return;
        }
        console.log(`[ScrollableContainer] Initializing for scene ${this.scene.scene.key}`);
        // --- End Simplified Check ---

        // Safely create background
        try {
            this.background = this.scene.add.rectangle(
                this.x, this.y, this.width, this.height,
                this.options.backgroundColor, this.options.backgroundAlpha
            );
            this.background.setOrigin(0.5);
            this.managedObjects.push(this.background);
        } catch(e) { console.error("Failed to create SC background", e); this.background = null; }

        // Safely create border
        if (this.options.borderThickness > 0) {
             try {
                 this.border = this.scene.add.rectangle(
                    this.x, this.y, this.width, this.height
                 );
                 this.border.setOrigin(0.5);
                 // Stroke should be set AFTER origin typically
                 this.border.setStrokeStyle(this.options.borderThickness, this.options.borderColor);
                 this.border.setFillStyle(null, 0); // Ensure no fill if only border needed
                 this.managedObjects.push(this.border);
             } catch(e) { console.error("Failed to create SC border", e); this.border = null; }
        }

        // --- Safely Create Container ---
        try {
            this.container = this.scene.add.container(
                this.x - (this.width / 2) + this.options.padding,
                this.y - (this.height / 2) + this.options.padding
            );
             if (!this.container) {
                 console.error("[ScrollableContainer] FAILED TO CREATE PHASER CONTAINER via scene.add.container!");
             } else {
                 console.log("[ScrollableContainer] this.container created successfully:", this.container);
                 this.managedObjects.push(this.container); // Add to managed only if successful
             }
        } catch (e) {
            console.error("[ScrollableContainer] Error during this.scene.add.container:", e);
            this.container = null; // Explicitly nullify on error
        }
        // --- End Safely Create Container ---


        // Set up masking only if container was created successfully
        if (this.options.mask && this.container) {
            this.createMask();
        }

        // Initialize content values
        this.contentHeight = 0;
        this.scrollPosition = 0;
        this.maxScroll = 0;

        // Create scrollbar
        this.createScrollbar();

        // Set up input handling
        this.setupInputHandling();
    }

    /**
     * Create a mask for the container
     */
    createMask() {
         if (!this.scene || !this.scene.make) return; // Safety check
         try {
             const maskGraphics = this.scene.make.graphics();
             maskGraphics.fillStyle(0xffffff);
             maskGraphics.fillRect(
                 this.x - this.width / 2,
                 this.y - this.height / 2,
                 this.width,
                 this.height
             );

             const mask = maskGraphics.createGeometryMask();
             // Ensure container exists before setting mask
             if (this.container) {
                this.container.setMask(mask);
             }
             this.maskGraphics = maskGraphics;
             this.managedObjects.push(this.maskGraphics); // Add mask graphics for cleanup
         } catch (e) {
             console.error("Failed to create mask", e);
             this.maskGraphics = null;
         }
    }

    /**
     * Create the scrollbar
     */
    createScrollbar() {
         if (!this.scene || !this.scene.add) return; // Safety check
        try {
            this.scrollbarBg = this.scene.add.rectangle(
                this.x + (this.width / 2) - this.options.scrollbarWidth - 2, this.y,
                this.options.scrollbarWidth, this.height - 4,
                0x000000, 0.3
            ).setOrigin(0, 0.5).setVisible(false); // Hide initially
            this.managedObjects.push(this.scrollbarBg);

            this.scrollbarHandle = this.scene.add.rectangle(
                this.x + (this.width / 2) - this.options.scrollbarWidth - 2, this.y - (this.height / 2) + 2,
                this.options.scrollbarWidth, 40, // Initial height
                this.options.scrollbarColor, this.options.scrollbarAlpha
            ).setOrigin(0, 0).setVisible(false); // Hide initially
            this.managedObjects.push(this.scrollbarHandle);
        } catch (e) {
            console.error("Failed to create scrollbar elements", e);
            this.scrollbarBg = null;
            this.scrollbarHandle = null;
        }
    }

    /**
     * Setup input handling for scrolling
     */
    setupInputHandling() {
         if (!this.scene || !this.scene.add || !this.scene.input) return; // Safety check
        try {
             this.interactiveArea = this.scene.add.rectangle(
                 this.x, this.y, this.width, this.height, 0xffffff, 0
             ).setInteractive();
             this.managedObjects.push(this.interactiveArea); // Manage for destruction

            // Mouse wheel scrolling (Check if input system is ready)
             if (this.scene.input.mouse?.enabled || this.scene.input.touch?.enabled) {
                 this.scene.input.on('wheel', this.handleWheel, this); // Use named function
             }

            // Drag scrolling
             this.interactiveArea.on('pointerdown', (pointer) => {
                if(!this.valid) return; // Don't interact if invalid
                this.isDragging = true;
                this.lastDragY = pointer.y;
             });

             // Use scene-level pointermove and pointerup for better drag handling
             this.scene.input.on('pointermove', this.handlePointerMove, this);
             this.scene.input.on('pointerup', this.handlePointerUp, this);
             this.scene.input.on('pointerupoutside', this.handlePointerUp, this); // Handle release outside

        } catch (e) {
             console.error("Failed to setup input handling", e);
             this.interactiveArea = null;
        }
    }

     // --- Input Handlers ---
     handleWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (!this.valid || !this.interactiveArea || !this.isPointerOver(pointer)) {
            return;
        }
        // Check if the wheel event target is within this container or its children
        // This helps prevent unintended scrolling when multiple scroll areas exist.
        // Note: `gameObjects` array might be empty or inaccurate depending on Phaser version/setup.
        // Relying on isPointerOver is generally sufficient.
        this.scroll(deltaY * 0.5); // Adjust scroll speed as needed
    }

    handlePointerMove(pointer) {
        if (!this.valid || !this.isDragging || !pointer.isDown) {
            return;
        }
        const deltaY = this.lastDragY - pointer.y;
        this.scroll(deltaY);
        this.lastDragY = pointer.y;
    }

    handlePointerUp(pointer) {
        if (!this.valid) return;
        this.isDragging = false;
    }

    // --- End Input Handlers ---

    /**
     * Check if pointer is over the interactive area
     */
    isPointerOver(pointer) {
        // Ensure interactiveArea was created
        if (!this.interactiveArea) return false;
        // GetBounds might fail if the object is destroyed or invalid
        try {
            const bounds = this.interactiveArea.getBounds();
            return bounds.contains(pointer.x, pointer.y);
        } catch (e) {
            // console.warn("Error getting bounds for interactiveArea", e);
            return false;
        }
    }

    /**
     * Add an item to the container
     */
    addItem(item, y = null) {
        // Check validity and container existence
        if (!this.valid || !this.container) {
             console.error("[ScrollableContainer addItem] Cannot add item: Container is null or invalid.", { item: item, container: this.container, valid: this.valid });
             return item; // Return original item, might be null/invalid
        }
        // Check if the item to be added is valid
        if (!item || typeof item.destroy !== 'function') {
             console.error("[ScrollableContainer addItem] Attempted to add an invalid item.", item);
             return item; // Return invalid item
        }

        if (y === null) y = this.contentHeight;
        item.y = y;

        try {
             this.container.add(item); // This is where the error occurred
        } catch (e) {
             console.error("[ScrollableContainer addItem] Error during this.container.add(item):", e, "Item:", item, "Container:", this.container);
             // Optionally destroy the item if adding failed and it won't be used
             // item.destroy();
             return item; // Indicate potential failure by returning original item
        }

        const itemHeight = item.displayHeight || item.height || 20;
        this.contentHeight = Math.max(this.contentHeight, y + itemHeight);

        this.updateMaxScroll();
        return item; // Return the item added
    }

    /**
     * Add a text item to the container
     */
    addText(text, style = {}) {
// --- SIMPLIFIED Scene Check ---
if (!this.valid || !this.scene || !this.scene.add) {
    console.error("[ScrollableContainer addText] Cannot add text: Scene context or 'add' factory is invalid.");
    return null;
}
// --- End Simplified Check ---
        const defaultStyle = {
            fontFamily: "'VT323'",
            fontSize: '16px',
            fill: '#ffffff',
            wordWrap: { width: this.width - (this.options.padding * 2) - (this.options.scrollbarWidth + 4) }
        };
        let textObj = null;
        try {
            textObj = this.scene.add.text(0, 0, text, {...defaultStyle, ...style});
        } catch (e) { console.error("[ScrollableContainer] Error creating text object:", e); return null; }
        if (!textObj) { console.error("[ScrollableContainer] Failed to create text object."); return null; }

        const addedItem = this.addItem(textObj); // Use the safer addItem

        // Return the textObj only if addItem didn't return the item itself due to an error
        return addedItem === textObj ? textObj : null;
    }

    /**
     * Scroll the container
     */
    scroll(deltaY) {
        if (!this.valid || this.maxScroll <= 0 || !this.container) return;

        this.scrollPosition = Phaser.Math.Clamp(
            this.scrollPosition + deltaY, 0, this.maxScroll
        );
        // Calculate the target Y position for the container
        const targetContainerY = this.y - (this.height / 2) + this.options.padding - this.scrollPosition;

        // Use a tween for smoother scrolling (optional)
         this.scene.tweens.add({
             targets: this.container,
             y: targetContainerY,
             duration: 50, // Short duration for responsiveness
             ease: 'Quad.easeOut'
         });
        // Or apply directly for immediate update:
        // this.container.y = targetContainerY;


        this.updateScrollbarPosition();
    }

    /**
     * Update the maximum scroll value
     */
    updateMaxScroll() {
        if (!this.valid) return;
        const visibleHeight = this.height - (this.options.padding * 2);
        this.maxScroll = Math.max(0, this.contentHeight - visibleHeight);
        this.updateScrollbar(); // Update scrollbar based on new maxScroll
    }

    /**
     * Update scrollbar visibility and size
     */
    updateScrollbar() {
        // Ensure scrollbar elements exist
        if (!this.valid || !this.scrollbarBg || !this.scrollbarHandle) return;

        const needsScrollbar = this.maxScroll > 0;
        this.scrollbarBg.setVisible(needsScrollbar);
        this.scrollbarHandle.setVisible(needsScrollbar);

        if (needsScrollbar && this.contentHeight > 0) { // Added contentHeight check
            const visibleHeight = this.height - (this.options.padding * 2);
            const scrollTrackHeight = this.height - 4; // Actual track height
            // Ratio of visible area to total content height
            const contentRatio = Math.min(1, visibleHeight / this.contentHeight);
            const handleHeight = Math.max(30, scrollTrackHeight * contentRatio); // Min handle height 30px

            this.scrollbarHandle.displayHeight = handleHeight; // Use displayHeight for graphics/rectangles
            this.updateScrollbarPosition();
        }
    }

    /**
     * Update scrollbar handle position
     */
    updateScrollbarPosition() {
        if (!this.valid || this.maxScroll <= 0 || !this.scrollbarHandle) return;

        // Handle potential division by zero if maxScroll is calculated incorrectly
        const scrollRatio = this.maxScroll > 0 ? this.scrollPosition / this.maxScroll : 0;

        // Available track space for the handle to move in
        const scrollTrackSpace = (this.height - 4) - this.scrollbarHandle.displayHeight; // Use displayHeight
        const handleYOffset = scrollRatio * scrollTrackSpace;

        this.scrollbarHandle.y = this.y - (this.height / 2) + 2 + handleYOffset;
    }

    /**
     * Clear all items from the internal Phaser container
     */
    clear() {
        if (!this.valid || !this.container) return;
        this.container.removeAll(true); // Destroy children when removing
        this.contentHeight = 0;
        this.scrollPosition = 0;
        this.container.y = this.y - (this.height / 2) + this.options.padding; // Reset container position
        this.updateMaxScroll();
    }

    /**
     * Scroll to the bottom of the container
     */
    scrollToBottom() {
        if (!this.valid) return;
        this.scroll(this.maxScroll); // Scroll by the max amount
    }

    /**
     * Update the container size
     */
    resize(width, height) {
         if (!this.valid) return;
        this.width = width;
        this.height = height;

        if (this.background) { this.background.setSize(width, height); this.background.setPosition(this.x, this.y); }
        if (this.border) { this.border.setSize(width, height); this.border.setPosition(this.x, this.y); }
        if (this.maskGraphics) { /* ... update mask ... */ }
        if (this.interactiveArea) { this.interactiveArea.setSize(width, height); this.interactiveArea.setPosition(this.x, this.y); }
        if (this.scrollbarBg) { /* ... update scrollbarBg pos/size ... */ }
        if (this.container) { // Update container position based on new center/padding
             this.container.setPosition(
                 this.x - (this.width / 2) + this.options.padding,
                 this.y - (this.height / 2) + this.options.padding - this.scrollPosition // Keep current scroll offset
             );
        }

        this.updateMaxScroll(); // Recalculate scroll based on new height
    }

    /**
     * Set the visibility of the entire component
     */
    setVisible(visible) {
         if (!this.valid) return;
        if (this.background) this.background.visible = visible;
        if (this.border) this.border.visible = visible;
        if (this.container) this.container.visible = visible;
        if (this.interactiveArea) this.interactiveArea.visible = visible; // Toggle interactive area too

        // Only show scrollbar parts if needed AND overall component is visible
        const needsScrollbar = this.maxScroll > 0;
        if (this.scrollbarBg) this.scrollbarBg.visible = visible && needsScrollbar;
        if (this.scrollbarHandle) this.scrollbarHandle.visible = visible && needsScrollbar;
    }

    /**
     * Clean up all Phaser GameObjects created by this container.
     */
    destroy() {
        if (!this.valid) return; // Already destroyed or invalid
        console.log(`[ScrollableContainer] Destroying elements for container at (${this.x}, ${this.y})`);
        this.valid = false; // Mark as invalid immediately

         // Remove general scene listeners first to prevent errors during destruction
         if(this.scene?.input) {
            this.scene.input.off('wheel', this.handleWheel, this);
            this.scene.input.off('pointermove', this.handlePointerMove, this);
            this.scene.input.off('pointerup', this.handlePointerUp, this);
            this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
         }

        // Destroy managed Phaser GameObjects
        for (let i = this.managedObjects.length - 1; i >= 0; i--) {
             const obj = this.managedObjects[i];
             if (obj && typeof obj.destroy === 'function') {
                 // Check 'active' property - Phaser sets this to false on destruction
                 if (obj.active !== false) {
                    try {
                         // Passing true ensures removal from scene display list etc.
                        obj.destroy(true);
                    } catch(e) {
                        console.warn("[ScrollableContainer] Error during explicit destroy:", e, obj.constructor.name);
                    }
                 }
             }
         }
        this.managedObjects = [];

        // Explicitly nullify references
        this.scene = null;
        this.background = null;
        this.border = null;
        this.container = null;
        this.maskGraphics = null;
        this.scrollbarBg = null;
        this.scrollbarHandle = null;
        this.interactiveArea = null;
        this.options = null;
        console.log("[ScrollableContainer] Destruction complete.");
    }
}

export default ScrollableContainer;