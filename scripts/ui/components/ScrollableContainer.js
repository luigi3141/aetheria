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
        this.items = []; // Add this array to track added items

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
        if (!this.scene || !this.scene.add || !this.scene.input) return;
       try {
            // --- Interactive Area Setup ---
            // Create the background rectangle for visual bounds and potentially wheel events
            this.interactiveArea = this.scene.add.rectangle(
                this.x, this.y, this.width, this.height, 0xffffff, 0
            );
            // Make it interactive *only* to detect if the pointer is *over* it for wheel events.
            // DO NOT make it draggable here. Dragging will be handled by scene listeners.
            this.interactiveArea.setInteractive(); // Needs to be interactive for isPointerOver
            this.managedObjects.push(this.interactiveArea);

           // --- Scene-Level Listeners ---
           // Remove previous listeners to avoid duplicates if re-initialized
           this.scene.input.off('wheel', this.handleWheel, this);
           this.scene.input.off('pointerdown', this.handleScenePointerDown, this); // New handler name
           this.scene.input.off('pointermove', this.handleScenePointerMove, this); // New handler name
           this.scene.input.off('pointerup', this.handleScenePointerUp, this); // New handler name
           this.scene.input.off('pointerupoutside', this.handleScenePointerUp, this); // New handler name

           // Add new listeners
           this.scene.input.on('wheel', this.handleWheel, this);
           this.scene.input.on('pointerdown', this.handleScenePointerDown, this);
           this.scene.input.on('pointermove', this.handleScenePointerMove, this);
           this.scene.input.on('pointerup', this.handleScenePointerUp, this);
           this.scene.input.on('pointerupoutside', this.handleScenePointerUp, this);

           this.isDragging = false; // Initialize dragging state

       } catch (e) {
            console.error("Failed to setup input handling", e);
            this.interactiveArea = null;
       }
   }

   // --- NEW Scene Pointer Down Handler ---
       // ---- File: ScrollableContainer.js ----

       handleScenePointerDown(pointer) {
        // --- Initial Checks ---
        // Ensure the container and scene systems are valid
        if (!this.valid || !this.scene || !this.scene.input?.manager || !this.container) {
            // console.warn("[ScrollContainer PointerDown] Invalid state (scene, input, or container missing).");
            this.isDragging = false; // Ensure dragging is off if state is invalid
            return;
        }

        // --- Check if Pointer is Over This Container's Area ---
        if (this.isPointerOver(pointer)) {
            // --- Hit Test for Objects Under Pointer ---
            const hitObjects = this.scene.input.hitTestPointer(pointer);
            console.log(`[ScrollContainer hitTest] Objects under pointer (Count: ${hitObjects?.length || 0}):`, hitObjects?.map(o => o?.constructor?.name || 'Unknown'));

            let clickedInteractiveChild = false; // Flag to track if an interactive child was clicked

            // --- Iterate Through Hit Objects (Topmost First) ---
            if (hitObjects && hitObjects.length > 0) {
                for (const hitObject of hitObjects) {
                    // Check if the hit object itself is interactive and enabled
                    if (hitObject.input?.enabled) {
                        console.log(`[ScrollContainer hitTest] Checking interactive hit object: ${hitObject.constructor?.name}`);

                        // --- Parent Traversal Logic ---
                        let tempParent = hitObject.parentContainer;
                        let isChild = false;
                        let depth = 0;
                        const maxDepth = 10; // Safety limit for traversal
                        // console.log(`  [Parent Check] Starting traversal from: ${hitObject.constructor?.name}. Target container:`, this.container);

                        while (tempParent && depth < maxDepth) {
                            // console.log(`    [Parent Check] Depth ${depth}: Parent is ${tempParent.constructor?.name}`);
                            // Check if the current parent IS the scrollable content container
                            if (tempParent === this.container) {
                                isChild = true;
                                // console.log("    [Parent Check] MATCH FOUND!");
                                break; // Found ancestor, stop traversal
                            }
                            // Move up to the next parent
                            tempParent = tempParent.parentContainer;
                            depth++;
                        }
                        if (depth >= maxDepth) console.warn("[ScrollContainer hitTest] Parent traversal depth limit reached.");
                        // console.log(`  [Parent Check] Finished traversal. isChild = ${isChild}`);
                        // --- End Parent Traversal ---


                        // --- Handle Result of Parent Check ---
                        if (isChild) {
                             // The interactive object belongs to this scroll container's content
                             clickedInteractiveChild = true;
                             console.log(`[ScrollContainer] Confirmed pointer down hit interactive child within scroll area: ${hitObject.constructor?.name}`);
                             // Break the loop: We found the topmost interactive child within our container.
                             // Let the event system handle the click for this child (e.g., the button).
                             break;
                        } else {
                             // This interactive object isn't inside our scroll content container.
                             // Continue the loop to check objects potentially underneath it.
                             // console.log(`[ScrollContainer] Interactive object ${hitObject.constructor?.name} not child of target container.`);
                        }

                    } // End if (hitObject.input?.enabled)

                    // Optimization: If we hit the main interactiveArea background itself,
                    // we know we didn't hit a child within the content first.
                    if (hitObject === this.interactiveArea || hitObject === this.background) {
                        // console.log("[ScrollContainer hitTest] Hit main background, stopping deeper check.");
                        break;
                    }
                } // End for loop
            } else {
                 // console.log("[ScrollContainer hitTest] No objects hit.");
            } // End if hitObjects

            // --- Drag Logic ---
            // Only start dragging if the click did NOT land on an interactive child inside the content area
            if (!clickedInteractiveChild) {
                console.log("[ScrollContainer] PointerDown did NOT hit interactive child - Starting drag.");
                this.isDragging = true;
                this.lastDragY = pointer.y; // Initialize drag starting point
            } else {
                console.log("[ScrollContainer] PointerDown hit an interactive child - Drag NOT started.");
                this.isDragging = false; // Ensure dragging is off if a child was clicked
            }
            // --- End Drag Logic ---

        } else {
            // Click was outside the container bounds
            this.isDragging = false; // Ensure dragging is off
        }
    } // End handleScenePointerDown

// --- NEW Scene Pointer Move Handler ---
handleScenePointerMove(pointer) {
    // Only scroll if dragging IS active AND the pointer is actually down
    if (!this.valid || !this.isDragging || !pointer.isDown) {
         // If pointer comes up unexpectedly, stop dragging
         if (!pointer.isDown && this.isDragging) {
              console.log("[ScrollContainer] PointerMove detected pointer up, stopping drag.");
              this.isDragging = false;
         }
        return;
    }

    // Calculate delta and scroll
    const deltaY = this.lastDragY - pointer.y;
    this.scroll(deltaY);
    this.lastDragY = pointer.y; // Update last position for next move event
}

// --- NEW Scene Pointer Up Handler ---
handleScenePointerUp(pointer) {
    // Simply stop dragging when the pointer goes up, regardless of where
    if (!this.valid) return;
    if (this.isDragging) {
         console.log("[ScrollContainer] PointerUp stopping drag.");
        this.isDragging = false;
    }
}

/*
   handlePointerDownForDrag(pointer) {
    if (!this.valid || !this.scene || !this.scene.input?.manager) return; // Add check for input manager

    // Check if the pointerdown happened INSIDE the scroll container bounds
    if (this.isPointerOver(pointer)) {

        // --- >>> Check if pointer hit an interactive child <<< ---
        // Get game objects under the pointer IN THIS SCENE
        const topObject = this.scene.input.manager.hitTest(pointer, this.scene.children.list, this.scene.cameras.main, 1)[0];

        // Check if the top object under the pointer:
        // a) Has input enabled
        // b) Is a child of our scrollable content container OR a child of an element within that container (like the button's bg)
        let clickedInteractiveChild = false;
        if (topObject && topObject.input?.enabled) {
             // Traverse up the parent chain to see if it belongs to our scroll content
             let parent = topObject.parentContainer;
             while (parent) {
                 if (parent === this.container) { // Is it directly in the scroll content?
                      clickedInteractiveChild = true;
                      break;
                 }
                 // Check if it's inside a row container which is inside the scroll content
                 if (parent.parentContainer === this.container) {
                      clickedInteractiveChild = true;
                      break;
                 }
                 parent = parent.parentContainer;
             }
             // Handle case where the hit object *is* the scroll container itself (less likely)
             if(topObject === this.container) clickedInteractiveChild = false; // Don't block drag if clicking container bg
        }
        // --- >>> End Check <<< ---


        // Only start dragging if the click was NOT on an interactive child within the container
        if (!clickedInteractiveChild) {
            this.isDragging = true;
            this.lastDragY = pointer.y;
            console.log("[ScrollContainer] Drag Started (Pointer down was not on interactive child)");
            // Optional: Stop further propagation ONLY if dragging starts
            // pointer.event.stopPropagation();
        } else {
            console.log("[ScrollContainer] Pointer down hit an interactive child, drag NOT started.");
            this.isDragging = false; // Ensure not dragging
            // Allow the event to propagate to the button
        }

    } else {
        this.isDragging = false; // Clicked outside
    }
}*/
     // --- Input Handlers ---
     handleWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (!this.valid || !this.interactiveArea || !this.isPointerOver(pointer)) {
            return;
        }
        // console.log("[ScrollContainer] Wheel event over container");
        this.scroll(deltaY * 0.5);
    }
/*
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
*/
    // --- End Input Handlers ---

    /**
     * Check if pointer is over the interactive area
     */
    isPointerOver(pointer) { // Keep this bounds check
        if (!this.interactiveArea) return false;
        try {
            const bounds = this.interactiveArea.getBounds();
            return bounds.contains(pointer.x, pointer.y);
        } catch (e) { return false; }
    }
    /**
     * Add an item to the container
     */
    addItem(item, y = null) {
        // Check validity and container existence
        if (!this.valid || !this.container) {
            console.error("[ScrollableContainer addItem] Cannot add item: Container is null or invalid.", { item: item, container: this.container, valid: this.valid });
            return null; // Return null on failure
        }
        // Check if the item to be added is valid
        if (!item || typeof item.destroy !== 'function') {
            console.error("[ScrollableContainer addItem] Attempted to add an invalid item.", item);
            return null; // Return null on failure
        }

        // Determine Y position if not provided (basic stacking)
        if (y === null) {
            y = this.contentHeight; 
        }
        item.y = y; // Set item's position within the scrollable container

        try {
            this.container.add(item); // Add the item to Phaser's container
            
            // --- Add to tracker *after* successful add ---
            this.items.push(item); 
            // --- ---

            // Update content height based on the item's position and size
            const itemHeight = item.displayHeight || item.height || 20; // Estimate height
            this.contentHeight = Math.max(this.contentHeight, item.y + itemHeight); 

            this.updateMaxScroll(); // Update scroll limits

            return item; // Return the successfully added item

        } catch (e) {
            console.error("[ScrollableContainer addItem] Error during this.container.add(item):", e, "Item:", item, "Container:", this.container);
            // Optionally destroy the item if adding failed and it won't be used elsewhere
            // if (item && item.destroy) item.destroy(); 
            return null; // Return null on failure
        }
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
        this.items = []; // Clear tracked items as well
        this.contentHeight = 0;
        this.scrollPosition = 0;
        this.container.y = this.y - (this.height / 2) + this.options.padding; // Reset container position
        this.updateMaxScroll();
    }

    getItems() {
        return this.items;
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
        // Prevent double destruction or errors if already invalid
        if (!this.valid) {
            console.warn("[ScrollableContainer] Attempted to destroy an already invalid or destroyed container.");
            return;
        }
        console.log(`[ScrollableContainer] Destroying elements for container at (${this.x}, ${this.y})`);
        this.valid = false; // Mark as invalid immediately

         // --- Remove scene listeners ---
         // Check if scene and input system are still accessible
         if(this.scene?.input) {
            this.scene.input.off('wheel', this.handleWheel, this);
            this.scene.input.off('pointerdown', this.handleScenePointerDown, this);
            this.scene.input.off('pointermove', this.handleScenePointerMove, this);
            this.scene.input.off('pointerup', this.handleScenePointerUp, this);
            this.scene.input.off('pointerupoutside', this.handleScenePointerUp, this);
            console.log("[ScrollableContainer] Scene input listeners removed.");
         } else {
              console.warn("[ScrollableContainer] Scene or input system missing during destroy, listeners might remain.");
         }
         // --- End remove scene listeners ---


        // --- Destroy managed Phaser GameObjects ---
        // Iterate backwards to avoid issues with array modification during loop
        for (let i = this.managedObjects.length - 1; i >= 0; i--) {
             const obj = this.managedObjects[i];
             // Check if object exists and has a destroy method
             if (obj && typeof obj.destroy === 'function') {
                 // Check 'active' property - Phaser sets this to false on destruction,
                 // helps prevent trying to destroy already destroyed objects.
                 if (obj.active !== false) {
                    try {
                         // Passing true ensures removal from scene display list etc.
                        obj.destroy(true);
                    } catch(e) {
                        // Log error but continue cleanup
                        console.warn("[ScrollableContainer] Error during explicit destroy of managed object:", e, obj.constructor?.name || obj);
                    }
                 }
             }
         }
        this.managedObjects = []; // Clear the managed objects array
        // --- End destroy managed objects ---


        // --- Nullify internal references ---
        // This helps garbage collection and prevents accessing stale objects
        this.scene = null;
        this.background = null;
        this.border = null;
        this.container = null; // The Phaser container holding scrollable items
        this.maskGraphics = null;
        this.scrollbarBg = null;
        this.scrollbarHandle = null;
        this.interactiveArea = null;
        this.options = null;
        this.items = []; // Clear the tracked items array
        // --- End nullify references ---

        console.log("[ScrollableContainer] Destruction complete.");
    } // End destroy()
}

export default ScrollableContainer;