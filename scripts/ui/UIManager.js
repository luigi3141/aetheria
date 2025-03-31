/**
 * UIManager - A coordinator for UI components and global UI configuration
 * This slimmed-down manager focuses on coordinating components rather than creating them directly
 */

// Import component modules
import Button from './components/Button.js';
import Panel from './components/Panel.js';
import StatusBar from './components/StatusBar.js';
import InputField from './components/InputField.js';

// Import layout utilities
import { LAYOUT, LayoutHelper } from './layout/LayoutHelper.js';

class UIManager {
    /**
     * Create a new UI Manager
     * @param {Phaser.Scene} scene - The scene this manager belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        
        // Initialize layout helper
        this.layoutHelper = new LayoutHelper(scene);
        
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
        
        // Track created UI elements for easy access
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
        const padding = options.padding || this.spacing.md * 2;
        const lineSpacing = options.lineSpacing || 0;

        // Create temporary text to measure width
        const tempText = this.scene.add.text(0, 0, text, {
            fontFamily: "'Press Start 2P'",
            fontSize: fontSize + 'px',
            lineSpacing: lineSpacing
        });
        const textWidth = tempText.width;
        const textHeight = tempText.height;
        tempText.destroy();

        // Create rectangle background
        const rectWidth = textWidth + padding * 2;
        const rectHeight = textHeight + padding * 2;
        const bg = this.scene.add.rectangle(x, y, rectWidth, rectHeight, 0x000000, 0.6)
            .setOrigin(0.5);

        const title = this.scene.add.text(x, y, text, {
            fontFamily: "'Press Start 2P'",
            fontSize: fontSize + 'px',
            fill: options.color || '#ffffff',
            align: 'center',
            lineSpacing: lineSpacing,
            resolution: 3
        }).setOrigin(0.5);
        
        // Group background and text
        title.background = bg;
        
        return title;
    }
    
    /**
     * Create a button with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Button text
     * @param {function} callback - Function to call when button is clicked
     * @param {object} options - Optional configuration
     * @returns {Button} The created button
     */
    createButton(x, y, text, callback, options = {}) {
        // Define button options with UIManager defaults
        const buttonOptions = {
            width: options.width || Math.min(240, this.width * 0.4),
            height: options.height || 50,
            fontSize: options.fontSize || this.fontSize.sm,
            fontFamily: "'Press Start 2P'",
            fillColor: this.colors.primary,
            hoverColor: this.colors.primaryHover,
            strokeColor: this.colors.accent,
            textColor: '#ffffff',
            // Allow overriding with provided options
            ...options
        };
        
        // Create a new Button instance
        const button = new Button(this.scene, x, y, text, callback, buttonOptions);
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = button;
        }
        
        return button;
    }
    
    /**
     * Create a panel with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Panel width
     * @param {number} height - Panel height
     * @param {object} options - Optional configuration
     * @returns {Panel} The created panel
     */
    createPanel(x, y, width, height, options = {}) {
        const panelOptions = {
            fillColor: options.fillColor || this.colors.secondary,
            fillAlpha: options.fillAlpha || 0.8,
            strokeColor: options.strokeColor || this.colors.accent,
            ...options
        };
        
        const panel = new Panel(this.scene, x, y, width, height, panelOptions);
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = panel;
        }
        
        return panel;
    }
    
    /**
     * Create a status bar with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} current - Current value
     * @param {number} max - Maximum value
     * @param {object} options - Optional configuration
     * @returns {StatusBar} The created status bar
     */
    createStatusBar(x, y, current, max, options = {}) {
        // Start with default options
        const defaultOptions = {
            fontSize: this.fontSize.sm
        };
        
        // Merge with provided options, ensuring options take precedence
        const statusBarOptions = {
            ...defaultOptions,
            ...options
        };
        
        const statusBar = new StatusBar(this.scene, x, y, current, max, statusBarOptions);
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = statusBar;
        }
        
        return statusBar;
    }
    
    /**
     * Create an input field with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} defaultValue - Default text value
     * @param {function} onChange - Function to call when value changes
     * @param {object} options - Optional configuration
     * @returns {InputField} The created input field
     */
    createInputField(x, y, defaultValue, onChange, options = {}) {
        const inputFieldOptions = {
            fontSize: options.fontSize || this.fontSize.md,
            borderColor: options.borderColor || this.colors.accent,
            ...options
        };
        
        const inputField = new InputField(this.scene, x, y, defaultValue, onChange, inputFieldOptions);
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = inputField;
        }
        
        return inputField;
    }
    
    /**
     * Create text with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Text content
     * @param {object} options - Optional configuration
     * @returns {Phaser.GameObjects.Text} The created text object
     */
    createText(x, y, text, options = {}) {
        const textObject = this.scene.add.text(x, y, text, {
            fontFamily: options.fontFamily || "'Press Start 2P'",
            fontSize: (options.fontSize || this.fontSize.md) + 'px',
            fill: options.color || '#ffffff',
            stroke: options.stroke || '#000000',
            strokeThickness: options.strokeThickness || 2,
            align: options.align || 'center'
        }).setOrigin(0.5);
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = textObject;
        }
        
        return textObject;
    }
    
    /**
     * Create a section label with standard styling
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} text - Label text
     * @param {object} options - Optional configuration
     * @returns {Phaser.GameObjects.Container} The created container with label
     */
    createSectionLabel(x, y, text, options = {}) {
        const fontSize = options.fontSize || this.fontSize.md;
        const color = options.color || '#ffffff';
        const align = options.align || 'left';
        const addLine = options.addLine !== false;
        const sideMarkers = options.sideMarkers || false;
        const animate = options.animate || false;
        const background = options.background || false;
        
        const container = this.scene.add.container(x, y);
        const elements = [];
        
        // Create the label text
        const label = this.scene.add.text(0, 0, text.toUpperCase(), {
            fontFamily: options.fontFamily || "'Press Start 2P'",
            fontSize: fontSize + 'px',
            fill: color,
            align: align,
            resolution: 3
        }).setOrigin(0, 0.5);
        
        elements.push(label);
        container.add(label);
        
        // Add background if requested
        if (background) {
            const padding = this.spacing.sm;
            const bg = this.scene.add.rectangle(
                0,
                0,
                label.width + padding * 2,
                label.height + padding * 2,
                this.colors.secondary,
                0.7
            ).setOrigin(0, 0.5);
            
            // Add background before text (rendering order)
            container.addAt(bg, 0);
            elements.push(bg);
            // Adjust text position for padding
            label.setPosition(padding, 0);
        }
        let pulseTween = null;
        let markerTween = null;
        
        // Add side markers if requested
        if (sideMarkers) {
            const markerSize = this.spacing.sm;
            const markerSpacing = this.spacing.md;
            
            // Left marker
            const leftMarker = this.scene.add.graphics();
            leftMarker.fillStyle(this.colors.accent, 1);
            leftMarker.fillRect(-markerSpacing - markerSize, -markerSize/2, markerSize, markerSize);
            container.add(leftMarker);
            elements.push(leftMarker);
            
            // Right marker
            const rightMarker = this.scene.add.graphics();
            rightMarker.fillStyle(this.colors.accent, 1);
            rightMarker.fillRect(label.width + markerSpacing, -markerSize/2, markerSize, markerSize);
            container.add(rightMarker);
            elements.push(rightMarker);
            
            label.sideMarkers = { left: leftMarker, right: rightMarker };
        }
        
        // Add animation if requested
        if (animate) {
            // Pulse animation for text
            pulseTween = this.scene.tweens.add({ // Assign to pulseTween
                targets: label,
                alpha: { from: 1, to: 0.7 },
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });
            
            // If side markers are present, add animation for them too
            if (sideMarkers && label.sideMarkers) {
                markerTween = this.scene.tweens.add({ // Assign to markerTween
                    targets: [label.sideMarkers.left, label.sideMarkers.right],
                    alpha: { from: 1, to: 0.5 },
                    duration: 1000,
                    ease: 'Sine.easeInOut',
                    yoyo: true,
                    repeat: -1
                });
            }
        }
        
        // Store in elements if an id is provided
        if (options.id) {
            this.elements[options.id] = container;
        }
        
        // Add public methods to the container
        container.setText = (newText) => {
            label.setText(newText.toUpperCase());
        };
        
        // Override the container's destroy method to properly clean up all elements
        const originalDestroy = container.destroy;
        container.destroy = function(fromScene) {
            console.log(`[UIManager] Destroying SectionLabel container for "${label.text}"`); // Add log
            // If being destroyed from scene cleanup, use original destroy
            if (pulseTween && pulseTween.isPlaying()) {
                console.log("[UIManager] Stopping pulse tween.");
                pulseTween.stop();
                pulseTween = null; // Clear reference
            }
            if (markerTween && markerTween.isPlaying()) {
                console.log("[UIManager] Stopping marker tween.");
                markerTween.stop();
                markerTween = null; // Clear reference
            }
            if (fromScene) {
                originalDestroy.call(this);
                return;
            }
            
            // Otherwise, manually destroy each element
            elements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            
            // Call original destroy without recursion
            originalDestroy.call(this, true);
        };
        
        return container;
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
        
        // Calculate grid positions using the layout helper
        const positions = [];
        const startX = x - ((columns * itemWidth) + ((columns - 1) * spacing)) / 2 + (itemWidth / 2);
        const startY = y;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                positions.push({
                    x: startX + (col * (itemWidth + spacing)),
                    y: startY + (row * (itemHeight + spacing))
                });
            }
        }
        
        // Create buttons for each item
        items.forEach((item, index) => {
            if (index >= positions.length) return;
            
            const isSelected = index === selectedIndex;
            const pos = positions[index];
            
            // Create button background
            const bg = this.scene.add.rectangle(
                pos.x, 
                pos.y, 
                itemWidth, 
                itemHeight, 
                isSelected ? this.colors.primary : this.colors.secondary
            )
                .setOrigin(0.5)
                .setInteractive()
                .setStrokeStyle(2, isSelected ? this.colors.accent : 0x555555);
                
            // Create button text
            const text = this.scene.add.text(pos.x, pos.y, item, {
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
     * Get position based on layout constants
     * @param {object} layout - Layout object from LAYOUT constants
     * @returns {object} Calculated position with x, y, width, height
     */
    getPosition(layout) {
        return this.layoutHelper.getPosition(layout);
    }
      
    /**
     * Build standard combat UI elements
     * @param {object} data - Combat data including player and enemy
     * @param {object} options - Optional configuration
     * @returns {object} Created UI elements
     */
    buildCombatUI(data, options = {}) {
        const { player, enemy } = data;
        const ui = {};
        
        // Create player status panel
        const playerPanelPos = this.getPosition(LAYOUT.COMBAT.PLAYER_PANEL);
        ui.playerPanel = this.createPanel(
            playerPanelPos.x, 
            playerPanelPos.y, 
            playerPanelPos.width, 
            playerPanelPos.height, 
            { id: 'player-panel' }
        );
        
        // Create player health bar
        const playerHealthPos = this.getPosition(LAYOUT.COMBAT.PLAYER_HEALTH);
        ui.playerHealth = this.createStatusBar(
            playerHealthPos.x,
            playerHealthPos.y,
            player.health,
            player.maxHealth,
            { 
                id: 'player-health',
                width: playerPanelPos.width * 0.8,
                textPrefix: 'HP',
                fontSize: LAYOUT.COMBAT.PLAYER_HEALTH.style.fontSize
            }
        );
        
        // Create player mana bar if applicable
        if (player.mana !== undefined) {
            const playerManaPos = this.getPosition(LAYOUT.COMBAT.PLAYER_MANA);
            ui.playerMana = this.createStatusBar(
                playerManaPos.x,
                playerManaPos.y,
                player.mana,
                player.maxMana,
                { 
                    id: 'player-mana',
                    width: playerPanelPos.width * 0.8,
                    textPrefix: 'MP',
                    barColor: 0x0000ff,
                    fontSize: LAYOUT.COMBAT.PLAYER_MANA.style.fontSize
                }
            );
        }
        
        // Create enemy status panel
        const enemyPanelPos = this.getPosition(LAYOUT.COMBAT.ENEMY_PANEL);
        ui.enemyPanel = this.createPanel(
            enemyPanelPos.x, 
            enemyPanelPos.y, 
            enemyPanelPos.width, 
            enemyPanelPos.height, 
            { id: 'enemy-panel' }
        );
        
        // Create enemy health bar
        const enemyHealthPos = this.getPosition(LAYOUT.COMBAT.ENEMY_HEALTH);
        ui.enemyHealth = this.createStatusBar(
            enemyHealthPos.x,
            enemyHealthPos.y,
            enemy.health,
            enemy.maxHealth,
            { 
                id: 'enemy-health',
                width: enemyPanelPos.width * 0.8,
                textPrefix: 'HP',
                barColor: 0xff0000,
                fontSize: LAYOUT.COMBAT.ENEMY_HEALTH.style.fontSize
            }
        );
        
        // Create combat log if applicable
        const logPos = this.getPosition(LAYOUT.COMBAT.LOG);
        if (logPos) {
            ui.log = this.createPanel(
                logPos.x,
                logPos.y,
                logPos.width,
                logPos.height,
                { id: 'combat-log', fillAlpha: 0.7 }
            );
            
            ui.logText = this.createText(
                logPos.x,
                logPos.y,
                '',
                {
                    id: 'combat-log-text',
                    fontSize: this.fontSize.sm,
                    align: 'left'
                }
            );
            
            // Add log text to panel
            ui.log.add(ui.logText);
        }
        
        return ui;
    }
    
    /**
     * Update combat UI elements with new data
     * @param {object} ui - UI elements created by buildCombatUI
     * @param {object} data - Updated combat data
     */
    updateCombatUI(ui, data) {
        const { player, enemy } = data;
        
        // Update player health
        if (ui.playerHealth) {
            ui.playerHealth.update(player.health, player.maxHealth);
        }
        
        // Update player mana if applicable
        if (ui.playerMana && player.mana !== undefined) {
            ui.playerMana.update(player.mana, player.maxMana);
        }
        
        // Update enemy health
        if (ui.enemyHealth && enemy) {
            ui.enemyHealth.update(enemy.health, enemy.maxHealth);
        }
    }
    
    /**
     * Add message to combat log
     * @param {object} ui - UI elements created by buildCombatUI
     * @param {string} message - Message to add to the log
     * @param {object} options - Optional configuration
     */
    addCombatLogMessage(ui, message, options = {}) {
        if (!ui.logText) return;
        
        const color = options.color || '#ffffff';
        const maxLines = options.maxLines || 5;
        
        // Get current log text
        let logContent = ui.logText.text;
        let lines = logContent ? logContent.split('\n') : [];
        
        // Add new message with color
        lines.push(`${message}`);
        
        // Limit to max lines
        if (lines.length > maxLines) {
            lines = lines.slice(lines.length - maxLines);
        }
        
        // Update log text
        ui.logText.setText(lines.join('\n'));
    }
    
    /**
     * Clean up UI elements when no longer needed
     * @param {string} id - ID of element to destroy, or null to destroy all
     */
    destroy(id = null) {
        if (id) {
            // Destroy specific element
            if (this.elements[id]) {
                if (typeof this.elements[id].destroy === 'function') {
                    this.elements[id].destroy();
                }
                delete this.elements[id];
            }
        } else {
            // Destroy all elements
            Object.values(this.elements).forEach(element => {
                if (element && typeof element.destroy === 'function') {
                    element.destroy();
                }
            });
            this.elements = {};
        }
    }
    
    /**
     * Create a character preview panel
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {object|string} character - Character data or class name
     * @param {object} options - Optional configuration
     * @returns {object} The created preview elements
     */
    createCharacterPreview(x, y, character, options = {}) {
        // If character is a string, convert it to an object
        if (typeof character === 'string') {
            character = {
                name: character.charAt(0).toUpperCase() + character.slice(1),
                sprite: character
            };
        }
        
        // Size calculations
        // 1. Start with base size (25% of screen width or provided size)
        const baseSize = options.size || Math.min(100, this.width * 0.1);
        // 2. Apply panel scaling (default 1x)
        const panelScale = options.panelScale || 1;
        const size = baseSize * panelScale;
        // 3. Calculate width and height (4:3 ratio by default)
        const width = options.width || size;
        const height = options.height || size * 1.33;
        
        const panelOptions = {
            fillColor: options.fillColor || this.colors.secondary,
            fillAlpha: options.fillAlpha || 0.8,
            strokeColor: options.strokeColor || this.colors.accent,
            ...options.panelOptions
        };
        
        console.log('Creating character preview:', {
            character,
            size,
            width,
            height,
            textureExists: this.scene.textures.exists(character.sprite),
            spriteKey: character.sprite,
            allTextures: this.scene.textures.list
        });
        
        // Create container panel
        const panel = this.createPanel(x, y, width, height, panelOptions);
        const elements = [panel];
        
        // Character name at top of panel
        const nameText = this.createText(0, -height/2 + this.spacing.lg, character.name || "Character", {
            fontSize: this.fontSize.md,
            color: options.nameColor || '#ffffff',
            align: 'center'
        });
        panel.add(nameText);
        
        // Character image/sprite in center of panel
        let sprite;
        
        // Check if character sprite exists in cache
        if (character.sprite && this.scene.textures.exists(character.sprite)) {
            sprite = this.scene.add.sprite(0, 0, character.sprite);
            panel.add(sprite);
            
            // Scale sprite to fit nicely in the panel with padding
            if (sprite.width > 0 && sprite.height > 0) {
                const padding = this.spacing.md; // Add padding around sprite
                const maxSpriteWidth = width - (padding * 2);
                const maxSpriteHeight = height - (padding * 3); // Extra padding for name
                const scale = Math.min(
                    maxSpriteWidth / sprite.width,
                    maxSpriteHeight / sprite.height
                );
                sprite.setScale(scale);
            } else {
                sprite.setScale(options.spriteScale || 2);
            }
            console.log('Created sprite:', {
                key: character.sprite,
                width: sprite.width,
                height: sprite.height,
                scale: sprite.scale
            });
        } else {
            console.log('Sprite not found:', character.sprite);
            // Fallback rectangle if sprite isn't available
            const fallbackWidth = width - (this.spacing.lg * 2);
            const fallbackHeight = height - (this.spacing.lg * 4);
            sprite = this.scene.add.rectangle(0, 0, fallbackWidth, fallbackHeight, 0x666666);
            panel.add(sprite);
        }
        
        // Create selection indicator (hidden by default)
        const indicator = this.scene.add.graphics();
        indicator.lineStyle(3, this.colors.accent, 1);
        indicator.strokeRect(-width/2, -height/2, width, height);
        indicator.visible = false;
        panel.add(indicator);
        
        // Return preview object with methods
        return {
            panel,
            nameText,
            sprite,
            indicator,
            
            // Method to toggle selection
            setSelected: (selected) => {
                indicator.visible = selected;
                panel.bg.setStrokeStyle(2, selected ? 0xffffff : this.colors.accent);
            },
            
            // Method to update character data
            updateCharacter: (newCharacter) => {
                // Update name
                if (newCharacter.name) {
                    nameText.setText(newCharacter.name);
                }
                
                // Update sprite if it exists
                if (newCharacter.sprite && this.scene.textures.exists(newCharacter.sprite)) {
                    sprite.setTexture(newCharacter.sprite);
                    
                    // Rescale sprite to fit
                    const padding = this.spacing.lg;
                    const maxSpriteWidth = width - (padding * 2);
                    const maxSpriteHeight = height - (padding * 4);
                    const scale = Math.min(
                        maxSpriteWidth / sprite.width,
                        maxSpriteHeight / sprite.height
                    );
                    sprite.setScale(scale);
                }
            },
            
            // Method to clean up
            destroy: () => {
                panel.destroy();
            }
        };
    }
}

export default UIManager;
