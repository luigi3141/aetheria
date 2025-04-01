/**
 * LayoutHelper - Centralized layout definitions and helper functions
 * Consolidates layout configuration from previous files
 */

// Main layout constants
export const LAYOUT = {
        // Combat scene layout
        COMBAT: {
            TITLE: {
                x: 0.5,  // Center of screen
                y: 50,   // Fixed pixels from top
                style: {
                    fontFamily: 'VT323',
                    fontSize: 36,
                    fill: '#ffffff',
                    fontWeight: 'bold'
                }
            },
            PLAYER_PANEL: {
                x: 0.25,  // 25% from left
                y: 0.3,   // 10% from top
                width: 0.35,  // 20% of screen width
                height: 0.18, // 15% of screen height
                style: {
                    nameBox: {
                        borderColor: 0xffff00,
                        borderThickness: 2,
                        backgroundColor: 0x000000,
                        backgroundAlpha: 0.6
                    }
                }
            },
            ENEMY_PANEL: {
                x: 0.75,  // 75% from left
                y: 0.3,   // 10% from top
                width: 0.35,  // 20% of screen width
                height: 0.18, // 15% of screen height
                style: {
                    nameBox: {
                        borderColor: 0xffff00,
                        borderThickness: 2,
                        backgroundColor: 0x000000,
                        backgroundAlpha: 0.6
                    }
                }
            },
            PLAYER_HEALTH: {
                x: 0.25,  // Same x as player panel
                y: 0.3,  // Slightly below player panel
                width: 180,
                height: 18,
                style: {
                    barColor: 0x00ff00,
                    backgroundColor: 0x000000,
                    borderColor: 0xffffff,
                    fontSize: 10,
                    fontColor: '#ffffff',
                    strokeColor: '#000000',
                    strokeThickness: 2
                }
            },
            PLAYER_MANA: {
                x: 0.25,  // Same x as player panel
                y: 0.35,   // Below health bar
                width: 180,
                height: 18,
                style: {
                    barColor: 0x3399ff,
                    backgroundColor: 0x000000,
                    borderColor: 0xffffff,
                    fontSize: 10,
                    fontColor: '#ffffff',
                    strokeColor: '#000000',
                    strokeThickness: 2
                }
            },
            ENEMY_HEALTH: {
                x: 0.75,  // Same x as enemy panel
                y: 0.3,  // Slightly below enemy panel
                width: 180,
                height: 18,
                style: {
                    barColor: 0xff0000,
                    backgroundColor: 0x000000,
                    borderColor: 0xffffff,
                    fontSize: 10,
                    fontColor: '#ffffff',
                    strokeColor: '#000000',
                    strokeThickness: 2
                }
            },
            BUTTONS: {
                x: 0.5,    // Center of screen
                y: 0.85,   // Bottom of screen
                width: 0.14,  // Relative width
                height: 0.08, // Relative height
                spacing: 0.15, // Relative spacing (% of screen width)
                style: {
                    fontSize: 20,
                    borderColor: 0xffd700,
                    colors: {
                        ATTACK: 0x00cc66,
                        SPECIAL: 0x9933cc,
                        ITEM: 0x999999,
                        RETREAT: 0xff4444
                    }
                }
            },
            SPRITES: {
                PLAYER: {
                    x: 0.20,    // Left side (relative)
                    y: 0.65,    // Bottom area (relative)
                },
                ENEMY: {
                    x: 0.80,    // Right side (relative)
                    y: 0.65,    // Slightly elevated
                }
            },
            LOG: {
                x: 0.5,  // Center of screen (relative)
                y: 0.75, // Lower area (relative)
                width: 0.8, // 80% of screen width (relative)
                height: 0.1 // 10% of screen height (relative)
            }
        },
    // Screen regions (as percentage of screen dimensions)
    TITLE: {
        Y: 0.08,
        FONT_SIZE: 'lg'
    },
    
    // Panel positions
    PANEL: {
        LEFT: {
            X: 0.25,
            Y: 0.5
        },
        RIGHT: {
            X: 0.75,
            Y: 0.5
        },
        CENTER: {
            X: 0.5, 
            Y: 0.5
        }
    },
    
    // Button positioning
    BUTTON: {
        Y: 0.85,
        WIDTH: 150,
        HEIGHT: 40,
        SPACING: 20
    },
    /*
    // Combat layout
    COMBAT: {
        TITLE: {
            X: 0.5, // Center of screen (relative)
            Y: 0.08  // Near top (relative)
        },
        PLAYER_PANEL: {
            X: 0.25, // Left side (relative)
            Y: 0.25, // Upper area (relative)
            WIDTH: 0.4, // 40% of screen width (relative)
            HEIGHT: 0.2 // 20% of screen height (relative)
        },
        ENEMY_PANEL: {
            X: 0.75, // Right side (relative)
            Y: 0.25, // Upper area (relative)
            WIDTH: 0.4, // 40% of screen width (relative)
            HEIGHT: 0.2 // 20% of screen height (relative)
        },
        PLAYER_HEALTH: {
            X: 0.25, // Left side (relative)
            Y: 0.3   // Within player panel (relative)
        },
        PLAYER_MANA: {
            X: 0.25, // Left side (relative)
            Y: 0.38  // Below health bar (relative)
        },
        ENEMY_HEALTH: {
            X: 0.75, // Right side (relative)
            Y: 0.3   // Within enemy panel (relative)
        },
        PLAYER: {
            X: 0.25,
            Y: 0.25
        },
        ENEMY: {
            X: 0.75,
            Y: 0.25
        },
        ACTION_BUTTONS: {
            Y: 0.7,
            SPACING: 100
        },
        BUTTONS: {
            Y: 0.88, // Bottom of screen (relative)
            WIDTH: 140, // Fixed width
            HEIGHT: 50, // Fixed height
            SPACING: 160 // Fixed spacing
        },
        SPRITES: {
            PLAYER: {
                X: 0.25, // Left side (relative)
                Y: 300   // Fixed y position 
            },
            ENEMY: {
                X: 0.75, // Right side (relative)
                Y: 300   // Fixed y position
            }
        },
        LOG: {
            X: 0.5,  // Center of screen (relative)
            Y: 0.75, // Lower area (relative)
            WIDTH: 0.8, // 80% of screen width (relative)
            HEIGHT: 0.1 // 10% of screen height (relative)
        }
    },
    */
    
    // Stat display
    STATS: {
        X: 0.7,
        START_Y: 0.25,
        SPACING: 30
    },
    
    // Inventory layout
    INVENTORY: {
        GRID: {
            X: 0.5,
            Y: 0.45,
            CELL_SIZE: 60,
            COLS: 5,
            ROWS: 4
        }
    },
    
    // Standard margins and paddings
    MARGIN: {
        SMALL: 10,
        MEDIUM: 20,
        LARGE: 40
    }
};

/**
 * Helper functions for calculating positions based on screen dimensions
 */
export class LayoutHelper {
    /**
     * Create a new LayoutHelper instance
     * @param {Phaser.Scene} scene - The scene this helper belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
    }
    
    /**
     * Convert a layout position to actual pixel coordinates
     * @param {object} layout - Layout object with x and y as percentages
     * @returns {object} Pixel coordinates
     */
    getPosition(layout) {
        if (!layout) return { x: 0, y: 0 };
        
        const pos = {
            x: layout.X ? layout.X * this.width : (layout.x ? layout.x * this.width : 0),
            y: layout.Y ? layout.Y * this.height : (layout.y ? layout.y * this.height : 0),
            width: layout.WIDTH ? layout.WIDTH * this.width : (layout.width ? layout.width * this.width : null),
            height: layout.HEIGHT ? layout.HEIGHT * this.height : (layout.height ? layout.height * this.height : null)
        };

        return pos;
    }
    
    /**
     * Calculate position for a centered grid of items
     * @param {number} index - Item index
     * @param {number} columns - Number of columns
     * @param {number} cellWidth - Width of each cell
     * @param {number} cellHeight - Height of each cell
     * @param {number} spacing - Spacing between items
     * @param {object} origin - Origin point for the grid (defaults to screen center)
     * @returns {object} Position {x, y}
     */
    gridPosition(index, columns, cellWidth, cellHeight, spacing, origin = { x: 0.5, y: 0.5 }) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        const originX = origin.x * this.width;
        const originY = origin.y * this.height;
        
        // Calculate grid total width and starting offset
        const totalWidth = columns * cellWidth + (columns - 1) * spacing;
        const startX = originX - totalWidth / 2 + cellWidth / 2;
        
        return {
            x: startX + col * (cellWidth + spacing),
            y: originY + row * (cellHeight + spacing)
        };
    }
    
    /**
     * Calculate positions for a horizontal row of items
     * @param {number} count - Number of items
     * @param {number} spacing - Spacing between items
     * @param {object} center - Center point for the row (defaults to bottom center)
     * @returns {array} Array of positions {x, y}
     */
    horizontalPositions(count, spacing, center = { x: 0.5, y: 0.85 }) {
        const positions = [];
        const centerX = center.x * this.width;
        const y = center.y * this.height;
        
        // Calculate total width and starting offset
        const totalWidth = (count - 1) * spacing;
        const startX = centerX - totalWidth / 2;
        
        for (let i = 0; i < count; i++) {
            positions.push({
                x: startX + i * spacing,
                y: y
            });
        }
        
        return positions;
    }
}

export default {
    LAYOUT,
    LayoutHelper
};
