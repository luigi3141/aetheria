/**
 * UIManager - A utility class for consistent UI creation and management
 * This helps create consistent UI elements with proper spacing and alignment
 */
class UIManager {
    /**
     * Create a new UI Manager
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        
        // Define standard spacing units based on screen size
        this.spacing = {
            xs: Math.max(4, Math.floor(this.width * 0.005)),
            sm: Math.max(8, Math.floor(this.width * 0.01)),
            md: Math.max(16, Math.floor(this.width * 0.02)),
            lg: Math.max(24, Math.floor(this.width * 0.03)),
            xl: Math.max(32, Math.floor(this.width * 0.04))
        };
        
        // Define standard font sizes
        this.fontSize = {
            xs: Math.max(8, Math.floor(this.width * 0.015)),
            sm: Math.max(12, Math.floor(this.width * 0.02)),
            md: Math.max(16, Math.floor(this.width * 0.025)),
            lg: Math.max(24, Math.floor(this.width * 0.035)),
            xl: Math.max(32, Math.floor(this.width * 0.05))
        };
        
        // Define standard colors
        this.colors = {
            primary: 0x4a6fb2,
            primaryHover: 0x5a7fc2,
            secondary: 0x333333,
            accent: 0xffd700,
            background: 0x111111,
            textLight: 0xffffff,
            textDark: 0x333333
        };
        
        // Track created UI elements for easy updates
        this.elements = {};
    }
    
    /**
     * Create a title with consistent styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Title text
     * @param {object} options - Optional configuration
     * @returns {Phaser.GameObjects.Text} The created text object
     */
    createTitle(x, y, text, options = {}) {
        const fontSize = options.fontSize || this.fontSize.lg;
        const title = this.scene.add.text(x, y, text, {
            fontFamily: "'Press Start 2P'",
            fontSize: fontSize + 'px',
            fill: options.color || '#ffffff',
            align: 'center',
            resolution: 3
        }).setOrigin(0.5);
        
        // Add decorative line under title if requested
        if (options.addLine !== false) {
            const lineWidth = options.lineWidth || Math.min(500, this.width * 0.8);
            const lineY = y + fontSize + this.spacing.md;
            const line = this.scene.add.graphics();
            line.lineStyle(2, this.colors.accent, 1);
            line.beginPath();
            line.moveTo(x - lineWidth/2, lineY);
            line.lineTo(x + lineWidth/2, lineY);
            line.closePath();
            line.strokePath();
            
            // Group title and line
            title.decorativeLine = line;
        }
        
        return title;
    }
    
    /**
     * Create a button with consistent styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {function} callback - Function to call when button is clicked
     * @param {object} options - Optional configuration
     * @returns {object} Button object with background and text
     */
    createButton(x, y, text, callback, options = {}) {
        const width = options.width || Math.min(240, this.width * 0.4);
        const height = options.height || 50;
        const fontSize = options.fontSize || this.fontSize.sm;
        
        // Create button background
        const bg = this.scene.add.rectangle(x, y, width, height, this.colors.primary)
            .setOrigin(0.5)
            .setInteractive()
            .setStrokeStyle(2, this.colors.accent);
            
        // Create button text
        const buttonText = this.scene.add.text(x, y, text, {
            fontFamily: "'Press Start 2P'",
            fontSize: fontSize + 'px',
            fill: '#ffffff',
            resolution: 3
        }).setOrigin(0.5);
        
        // Add hover effects
        bg.on('pointerover', () => {
            bg.fillColor = this.colors.primaryHover;
        });
        
        bg.on('pointerout', () => {
            bg.fillColor = this.colors.primary;
        });
        
        // Add click handler
        bg.on('pointerdown', callback);
        
        // Create button object
        const button = { bg, text: buttonText };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = button;
        }
        
        return button;
    }
    
    /**
     * Create a selection grid with consistent spacing
     * @param {number} x - X position of grid center
     * @param {number} y - Y position of grid start
     * @param {array} items - Array of items to display
     * @param {function} onSelect - Function to call when an item is selected
     * @param {object} options - Optional configuration
     * @returns {array} Array of created button objects
     */
    createSelectionGrid(x, y, items, onSelect, options = {}) {
        const columns = options.columns || 1;
        const rows = Math.ceil(items.length / columns);
        const itemWidth = options.itemWidth || Math.min(160, this.width * 0.2);
        const itemHeight = options.itemHeight || 40;
        const spacing = options.spacing || this.spacing.md;
        const fontSize = options.fontSize || this.fontSize.sm;
        const initialSelection = options.initialSelection || 0;
        
        const buttons = [];
        let selectedIndex = initialSelection;
        
        // Calculate grid dimensions
        const gridWidth = (columns * itemWidth) + ((columns - 1) * spacing);
        const startX = x - (gridWidth / 2) + (itemWidth / 2);
        
        items.forEach((item, index) => {
            // Calculate position in grid
            const col = index % columns;
            const row = Math.floor(index / columns);
            const itemX = startX + (col * (itemWidth + spacing));
            const itemY = y + (row * (itemHeight + spacing));
            
            const isSelected = index === selectedIndex;
            
            // Create button background
            const bg = this.scene.add.rectangle(
                itemX, 
                itemY, 
                itemWidth, 
                itemHeight, 
                isSelected ? this.colors.primary : this.colors.secondary
            )
                .setOrigin(0.5)
                .setInteractive()
                .setStrokeStyle(2, isSelected ? this.colors.accent : 0x555555);
                
            // Create button text
            const text = this.scene.add.text(itemX, itemY, item, {
                fontFamily: "'VT323'",
                fontSize: fontSize + 'px',
                fill: '#ffffff',
                resolution: 3
            }).setOrigin(0.5);
            
            // Create button object
            const button = { bg, text, index, value: item };
            buttons.push(button);
            
            // Add click handler
            bg.on('pointerdown', () => {
                // Update selection
                selectedIndex = index;
                
                // Update all buttons to reflect selection
                buttons.forEach(btn => {
                    const isNowSelected = btn.index === selectedIndex;
                    btn.bg.fillColor = isNowSelected ? this.colors.primary : this.colors.secondary;
                    btn.bg.setStrokeStyle(2, isNowSelected ? this.colors.accent : 0x555555);
                });
                
                // Call selection handler
                if (onSelect) {
                    onSelect(item, index);
                }
            });
        });
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = buttons;
        }
        
        return buttons;
    }
    
    /**
     * Create a text input field
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} defaultValue - Default text value
     * @param {function} onChange - Function to call when value changes
     * @param {object} options - Optional configuration
     * @returns {object} Input field object
     */
    createInputField(x, y, defaultValue, onChange, options = {}) {
        const width = options.width || Math.min(300, this.width * 0.5);
        const height = options.height || 40;
        const fontSize = options.fontSize || this.fontSize.md;
        
        // Create input background
        const bg = this.scene.add.rectangle(x, y, width, height, this.colors.secondary)
            .setOrigin(0.5)
            .setInteractive()
            .setStrokeStyle(2, this.colors.accent);
            
        // Create text display
        const text = this.scene.add.text(x, y, defaultValue, {
            fontFamily: "'VT323'",
            fontSize: fontSize + 'px',
            fill: '#ffffff',
            align: 'center',
            resolution: 3
        }).setOrigin(0.5);
        
        // Add click handler for input
        bg.on('pointerdown', () => {
            // Use browser prompt for input
            // In a real game, you'd use a custom input system
            const value = prompt(options.promptText || 'Enter value:', text.text);
            if (value && value.trim() !== '') {
                text.setText(value.trim());
                
                // Call change handler
                if (onChange) {
                    onChange(value.trim());
                }
            }
        });
        
        // Create input object
        const input = { 
            bg, 
            text,
            getValue: () => text.text,
            setValue: (value) => text.setText(value)
        };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = input;
        }
        
        return input;
    }
    
    /**
     * Create a panel to group related UI elements
     * @param {number} x - X position of panel center
     * @param {number} y - Y position of panel center
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {object} options - Optional configuration
     * @returns {Phaser.GameObjects.Rectangle} The panel object
     */
    createPanel(x, y, width, height, options = {}) {
        const panel = this.scene.add.rectangle(
            x, 
            y, 
            width, 
            height, 
            options.color || this.colors.secondary
        )
            .setOrigin(0.5)
            .setAlpha(options.alpha || 0.8);
            
        if (options.stroke !== false) {
            panel.setStrokeStyle(2, options.strokeColor || this.colors.accent);
        }
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = panel;
        }
        
        return panel;
    }
    
    /**
     * Add pixel-art style corner decorations
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} flipX - Whether to flip horizontally
     * @param {boolean} flipY - Whether to flip vertically
     * @param {object} options - Optional configuration
     * @returns {Phaser.GameObjects.Graphics} The decoration object
     */
    addCornerDecoration(x, y, flipX, flipY, options = {}) {
        const size = options.size || 20;
        const color = options.color || this.colors.accent;
        
        const decoration = this.scene.add.graphics();
        decoration.lineStyle(2, color, 1);
        
        // Draw L-shaped corner
        decoration.beginPath();
        decoration.moveTo(x, y);
        decoration.lineTo(x + (flipX ? -size : size), y);
        decoration.moveTo(x, y);
        decoration.lineTo(x, y + (flipY ? -size : size));
        decoration.closePath();
        decoration.strokePath();
        
        return decoration;
    }
    
    /**
     * Add decorative corners to the screen
     * @param {object} options - Optional configuration
     * @returns {array} Array of corner decoration objects
     */
    addScreenCorners(options = {}) {
        const padding = options.padding || 20;
        const corners = [
            this.addCornerDecoration(padding, padding, false, false, options),
            this.addCornerDecoration(this.width - padding, padding, true, false, options),
            this.addCornerDecoration(padding, this.height - padding, false, true, options),
            this.addCornerDecoration(this.width - padding, this.height - padding, true, true, options)
        ];
        
        return corners;
    }
    
    /**
     * Create a character preview display
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} spriteKey - Key of the sprite to display
     * @param {object} options - Optional configuration
     * @returns {object} Character preview object
     */
    createCharacterPreview(x, y, spriteKey, options = {}) {
        const size = options.size || 200;
        const borderWidth = options.borderWidth || 4;
        const borderColor = options.borderColor || this.colors.accent;
        const bgColor = options.bgColor || 0x222233;
        
        // Create a container for all preview elements
        const container = this.scene.add.container(x, y);
        
        // Create background panel
        const bg = this.scene.add.rectangle(0, 0, size, size, bgColor)
            .setOrigin(0.5)
            .setStrokeStyle(borderWidth, borderColor);
        
        // Add to container
        container.add(bg);
        
        // Create pixel corners
        const corners = this.scene.add.graphics();
        corners.fillStyle(borderColor, 1);
        
        // Draw pixel corners (small squares at each corner)
        const halfSize = size / 2;
        const cornerSize = 8;
        
        corners.fillRect(-halfSize, -halfSize, cornerSize, cornerSize); // Top-left
        corners.fillRect(halfSize - cornerSize, -halfSize, cornerSize, cornerSize); // Top-right
        corners.fillRect(-halfSize, halfSize - cornerSize, cornerSize, cornerSize); // Bottom-left
        corners.fillRect(halfSize - cornerSize, halfSize - cornerSize, cornerSize, cornerSize); // Bottom-right
        
        // Add to container
        container.add(corners);
        
        // Create character sprite
        const sprite = this.scene.add.sprite(0, 0, spriteKey)
            .setOrigin(0.5)
            .setDisplaySize(size * 0.8, size * 0.8);
        
        // Add to container
        container.add(sprite);
        
        // Create glow effect
        const glow = this.scene.add.graphics();
        glow.fillStyle(0xffffff, 0.2);
        glow.fillCircle(0, 0, size * 0.4);
        
        // Add to container (below sprite)
        container.addAt(glow, 1);
        
        // Add a subtle animation to the glow
        this.scene.tweens.add({
            targets: glow,
            alpha: 0.1,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create frame for reference
        const frame = { width: size, height: size };
        
        // Create character preview object with methods
        const characterPreview = {
            container,
            bg,
            corners,
            sprite,
            glow,
            frame,
            setSprite: (newSpriteKey) => {
                sprite.setTexture(newSpriteKey);
            },
            setPosition: (newX, newY) => {
                container.setPosition(newX, newY);
            }
        };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = characterPreview;
        }
        
        return characterPreview;
    }
    
    /**
     * Create a section label with consistent styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Label text
     * @param {object} options - Optional configuration
     * @returns {object} The created label object
     */
    createSectionLabel(x, y, text, options = {}) {
        const fontSize = options.fontSize || this.fontSize.md;
        const fontFamily = options.fontFamily || "'Press Start 2P'";
        const color = options.color || this.colors.textLight;
        const sideMarkers = options.sideMarkers !== undefined ? options.sideMarkers : false;
        const markerWidth = options.markerWidth || 20;
        const markerSpacing = options.markerSpacing || 10;
        const background = options.background !== undefined ? options.background : true;
        const animate = options.animate !== undefined ? options.animate : false;
        
        // Create a container for all label elements
        const container = this.scene.add.container(x, y);
        
        // Create background panel if enabled
        let bg = null;
        if (background) {
            // Calculate text width for proper background sizing
            const tempText = this.scene.add.text(0, 0, text, {
                fontFamily: fontFamily,
                fontSize: fontSize + 'px',
                resolution: 3
            });
            const textWidth = tempText.width;
            tempText.destroy();
            
            // Create background with proper width
            const bgWidth = textWidth + 40;
            const bgHeight = fontSize + 16;
            
            bg = this.scene.add.rectangle(0, 0, bgWidth, bgHeight, 0x000000, 0.5)
                .setOrigin(0.5);
                
            container.add(bg);
        }
        
        // Create text
        const textObj = this.scene.add.text(0, 0, text, {
            fontFamily: fontFamily,
            fontSize: fontSize + 'px',
            fill: color,
            align: 'center',
            resolution: 3
        }).setOrigin(0.5);
        
        container.add(textObj);
        
        // Add side markers if enabled
        let leftMarker = null;
        let rightMarker = null;
        
        if (sideMarkers) {
            // Calculate position for markers
            const textWidth = textObj.width;
            const markerX = (textWidth / 2) + markerSpacing;
            
            // Create left marker
            leftMarker = this.scene.add.graphics();
            leftMarker.lineStyle(2, this.colors.accent, 1);
            leftMarker.lineBetween(-markerX, 0, -markerX - markerWidth, 0);
            
            // Create right marker
            rightMarker = this.scene.add.graphics();
            rightMarker.lineStyle(2, this.colors.accent, 1);
            rightMarker.lineBetween(markerX, 0, markerX + markerWidth, 0);
            
            // Add markers to container
            container.add(leftMarker);
            container.add(rightMarker);
        }
        
        // Add animation if enabled
        if (animate) {
            // Subtle pulsing animation
            this.scene.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Create section label object with methods
        const sectionLabel = {
            container,
            text: textObj,
            bg,
            leftMarker,
            rightMarker,
            setText: (newText) => {
                textObj.setText(newText);
                
                // Update background size if present
                if (bg) {
                    const newWidth = textObj.width + 40;
                    bg.width = newWidth;
                }
                
                // Update marker positions if present
                if (sideMarkers) {
                    const newMarkerX = (textObj.width / 2) + markerSpacing;
                    
                    leftMarker.clear();
                    leftMarker.lineStyle(2, this.colors.accent, 1);
                    leftMarker.lineBetween(-newMarkerX, 0, -newMarkerX - markerWidth, 0);
                    
                    rightMarker.clear();
                    rightMarker.lineStyle(2, this.colors.accent, 1);
                    rightMarker.lineBetween(newMarkerX, 0, newMarkerX + markerWidth, 0);
                }
            },
            setPosition: (newX, newY) => {
                container.setPosition(newX, newY);
            }
        };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = sectionLabel;
        }
        
        return sectionLabel;
    }
    
    /**
     * Create a panel with pixel art styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {object} options - Optional configuration
     * @returns {object} Panel container
     */
    createPanel(x, y, width, height, options = {}) {
        const fillColor = options.fillColor !== undefined ? options.fillColor : 0x222233;
        const fillAlpha = options.fillAlpha !== undefined ? options.fillAlpha : 1;
        const strokeColor = options.strokeColor !== undefined ? options.strokeColor : this.colors.accent;
        const strokeWidth = options.strokeWidth !== undefined ? options.strokeWidth : 2;
        const cornerSize = options.cornerSize !== undefined ? options.cornerSize : 4;
        const pixelPerfect = options.pixelPerfect !== undefined ? options.pixelPerfect : true;
        
        // Create a container for all panel elements
        const container = this.scene.add.container(x, y);
        
        // Create panel background
        const bg = this.scene.add.rectangle(0, 0, width, height, fillColor, fillAlpha)
            .setOrigin(0.5)
            .setStrokeStyle(strokeWidth, strokeColor);
            
        // Add to container
        container.add(bg);
        
        // Add pixel corners if pixel perfect is enabled
        if (pixelPerfect) {
            const corners = this.scene.add.graphics();
            corners.fillStyle(strokeColor, 1);
            
            // Draw pixel corners (small squares at each corner)
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            
            corners.fillRect(-halfWidth, -halfHeight, cornerSize, cornerSize); // Top-left
            corners.fillRect(halfWidth - cornerSize, -halfHeight, cornerSize, cornerSize); // Top-right
            corners.fillRect(-halfWidth, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-left
            corners.fillRect(halfWidth - cornerSize, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-right
            
            // Add to container
            container.add(corners);
        }
        
        // Create panel object with methods
        const panel = {
            container,
            bg,
            width,
            height,
            setSize: (newWidth, newHeight) => {
                bg.width = newWidth;
                bg.height = newHeight;
                
                // Update corners if pixel perfect is enabled
                if (pixelPerfect) {
                    const corners = container.list[1];
                    corners.clear();
                    corners.fillStyle(strokeColor, 1);
                    
                    const halfWidth = newWidth / 2;
                    const halfHeight = newHeight / 2;
                    
                    corners.fillRect(-halfWidth, -halfHeight, cornerSize, cornerSize);
                    corners.fillRect(halfWidth - cornerSize, -halfHeight, cornerSize, cornerSize);
                    corners.fillRect(-halfWidth, halfHeight - cornerSize, cornerSize, cornerSize);
                    corners.fillRect(halfWidth - cornerSize, halfHeight - cornerSize, cornerSize, cornerSize);
                }
            },
            setPosition: (newX, newY) => {
                container.setPosition(newX, newY);
            }
        };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = panel;
        }
        
        return panel;
    }
    
    /**
     * Add decorative corners to the screen
     */
    addScreenCorners() {
        const addCornerDecoration = (x, y, flipX, flipY) => {
            const decoration = this.scene.add.graphics();
            decoration.lineStyle(2, this.colors.accent, 1);
            
            // Draw L-shaped corner
            decoration.beginPath();
            decoration.moveTo(x, y);
            decoration.lineTo(x + (flipX ? -20 : 20), y);
            decoration.moveTo(x, y);
            decoration.lineTo(x, y + (flipY ? -20 : 20));
            decoration.closePath();
            decoration.strokePath();
        };
        
        // Add decorations to all four corners
        addCornerDecoration(20, 20, false, false);
        addCornerDecoration(this.width - 20, 20, true, false);
        addCornerDecoration(20, this.height - 20, false, true);
        addCornerDecoration(this.width - 20, this.height - 20, true, true);
    }
    
    /**
     * Create an input field with consistent styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} defaultValue - Default text value
     * @param {function} onChange - Function to call when value changes
     * @param {object} options - Optional configuration
     * @returns {object} Input field object
     */
    createInputField(x, y, defaultValue, onChange, options = {}) {
        const width = options.width || 300;
        const height = options.height || 50;
        const fontSize = options.fontSize || this.fontSize.md;
        const promptText = options.promptText || 'Enter text:';
        
        // Create a container for all input elements
        const container = this.scene.add.container(x, y);
        
        // Create background panel
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x222233)
            .setOrigin(0.5)
            .setStrokeStyle(2, this.colors.accent);
        
        // Add to container
        container.add(bg);
        
        // Create pixel corners
        const corners = this.scene.add.graphics();
        corners.fillStyle(this.colors.accent, 1);
        
        // Draw pixel corners (small squares at each corner)
        const halfWidth = width / 2;
        const halfHeight = height / 2;
        const cornerSize = 4;
        
        corners.fillRect(-halfWidth, -halfHeight, cornerSize, cornerSize); // Top-left
        corners.fillRect(halfWidth - cornerSize, -halfHeight, cornerSize, cornerSize); // Top-right
        corners.fillRect(-halfWidth, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-left
        corners.fillRect(halfWidth - cornerSize, halfHeight - cornerSize, cornerSize, cornerSize); // Bottom-right
        
        // Add to container
        container.add(corners);
        
        // Create text display
        const text = this.scene.add.text(0, 0, defaultValue, {
            fontFamily: "'VT323'",
            fontSize: fontSize + 'px',
            fill: '#ffffff',
            align: 'center',
            resolution: 3
        }).setOrigin(0.5);
        
        // Add to container
        container.add(text);
        
        // Make the background interactive
        bg.setInteractive({ useHandCursor: true });
        
        // Store current value
        let currentValue = defaultValue;
        
        // Handle click to edit
        bg.on('pointerdown', () => {
            // Show prompt dialog
            const newValue = prompt(promptText, currentValue);
            
            // Update if value changed and not cancelled
            if (newValue !== null && newValue !== currentValue) {
                currentValue = newValue;
                text.setText(currentValue);
                
                // Call onChange callback if provided
                if (onChange) {
                    onChange(currentValue);
                }
            }
        });
        
        // Create input field object with methods
        const inputField = {
            container,
            bg,
            text,
            getValue: () => currentValue,
            setValue: (newValue) => {
                currentValue = newValue;
                text.setText(currentValue);
            }
        };
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = inputField;
        }
        
        return inputField;
    }
    
    /**
     * Calculate a grid of positions
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} columns - Number of columns
     * @param {number} rows - Number of rows
     * @param {number} cellWidth - Width of each cell
     * @param {number} cellHeight - Height of each cell
     * @param {number} spacing - Spacing between cells
     * @returns {array} Array of positions {x, y}
     */
    calculateGrid(startX, startY, columns, rows, cellWidth, cellHeight, spacing) {
        const positions = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                positions.push({
                    x: startX + (col * (cellWidth + spacing)),
                    y: startY + (row * (cellHeight + spacing))
                });
            }
        }
        
        return positions;
    }
    
    /**
     * Create a layout container with automatic vertical spacing
     * @param {number} x - X position of container center
     * @param {number} y - Y position of container top
     * @param {number} width - Container width
     * @param {object} options - Optional configuration
     * @returns {object} Layout container object
     */
    createLayout(x, y, width, options = {}) {
        const spacing = options.spacing || this.spacing.md;
        let currentY = y;
        
        const container = {
            x,
            y,
            width,
            currentY,
            spacing,
            elements: [],
            
            /**
             * Add an element to the layout
             * @param {function} createFn - Function that creates and returns the element
             * @param {number} height - Height of the element
             * @param {object} options - Optional configuration
             * @returns {object} The created element
             */
            addElement: (createFn, height, options = {}) => {
                // Add spacing if not the first element
                if (container.elements.length > 0) {
                    container.currentY += spacing;
                }
                
                // Create element
                const element = createFn(x, container.currentY, options);
                
                // Update current Y position
                container.currentY += height;
                
                // Add to elements
                container.elements.push(element);
                
                return element;
            }
        };
        
        return container;
    }

    /**
     * Add decorative corners to the screen
     * @param {object} options - Optional configuration
     * @returns {object} Screen corners object
     */
    addScreenCorners(options = {}) {
        const size = options.size || 20;
        const thickness = options.thickness || 4;
        const color = options.color || this.colors.accent;
        const padding = options.padding || 10;
        const animate = options.animate !== undefined ? options.animate : true;
        
        // Get screen dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create a container for all corner elements
        const container = this.scene.add.container(0, 0);
        
        // Create corners graphics
        const corners = this.scene.add.graphics();
        corners.fillStyle(color, 1);
        
        // Top-left corner
        corners.fillRect(padding, padding, size, thickness); // Horizontal
        corners.fillRect(padding, padding, thickness, size); // Vertical
        
        // Top-right corner
        corners.fillRect(width - padding - size, padding, size, thickness); // Horizontal
        corners.fillRect(width - padding - thickness, padding, thickness, size); // Vertical
        
        // Bottom-left corner
        corners.fillRect(padding, height - padding - thickness, size, thickness); // Horizontal
        corners.fillRect(padding, height - padding - size, thickness, size); // Vertical
        
        // Bottom-right corner
        corners.fillRect(width - padding - size, height - padding - thickness, size, thickness); // Horizontal
        corners.fillRect(width - padding - thickness, height - padding - size, thickness, size); // Vertical
        
        // Add to container
        container.add(corners);
        
        // Add subtle pulsing animation if enabled
        if (animate) {
            this.scene.tweens.add({
                targets: corners,
                alpha: 0.7,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        // Create screen corners object
        const screenCorners = {
            container,
            corners,
            setColor: (newColor) => {
                corners.clear();
                corners.fillStyle(newColor, 1);
                
                // Redraw all corners
                // Top-left corner
                corners.fillRect(padding, padding, size, thickness);
                corners.fillRect(padding, padding, thickness, size);
                
                // Top-right corner
                corners.fillRect(width - padding - size, padding, size, thickness);
                corners.fillRect(width - padding - thickness, padding, thickness, size);
                
                // Bottom-left corner
                corners.fillRect(padding, height - padding - thickness, size, thickness);
                corners.fillRect(padding, height - padding - size, thickness, size);
                
                // Bottom-right corner
                corners.fillRect(width - padding - size, height - padding - thickness, size, thickness);
                corners.fillRect(width - padding - thickness, height - padding - size, thickness, size);
            }
        };
        
        // Store in elements
        this.elements['screen-corners'] = screenCorners;
        
        return screenCorners;
    }
}

export default UIManager;
