/**
 * Layout - Constants for UI layout to ensure consistency across scenes
 */
export const LAYOUT = {
    // Screen regions (as percentage of screen dimensions)
    TITLE: {
        Y: 0.08,
        FONT_SIZE: 'lg'
    },
    
    // Panel positions
    PANEL: {
        LEFT: {
            X: 0.25,
            Y: 0.35
        },
        RIGHT: {
            X: 0.75,
            Y: 0.35
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
    
    // Combat layout
    COMBAT: {
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
        }
    },
    
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
 * Helper functions for calculating positions
 */
export const LayoutHelper = {
    /**
     * Calculate position for a centered grid of items
     * @param {number} width - Screen width
     * @param {number} height - Screen height
     * @param {number} index - Item index
     * @param {number} columns - Number of columns
     * @param {number} spacing - Spacing between items
     * @returns {object} Position {x, y}
     */
    gridPosition(width, height, index, columns, spacing) {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        return {
            x: width * 0.5 + (col - (columns - 1) / 2) * spacing,
            y: height * 0.5 + row * spacing
        };
    }
};

export default {
    LAYOUT,
    LayoutHelper
};
