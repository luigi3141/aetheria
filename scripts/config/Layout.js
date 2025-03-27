/**
 * Layout configuration for UI elements
 */
export const LAYOUT = {
    // Combat scene layout
    COMBAT: {
        TITLE: {
            x: 0.5, // Center of screen (relative)
            y: 0.08  // Near top (relative)
        },
        PLAYER_PANEL: {
            x: 0.25, // Left side (relative)
            y: 0.25, // Upper area (relative)
            width: 0.4, // 40% of screen width (relative)
            height: 0.2 // 20% of screen height (relative)
        },
        ENEMY_PANEL: {
            x: 0.75, // Right side (relative)
            y: 0.25, // Upper area (relative)
            width: 0.4, // 40% of screen width (relative)
            height: 0.2 // 20% of screen height (relative)
        },
        PLAYER_HEALTH: {
            x: 0.25, // Left side (relative)
            y: 0.3   // Within player panel (relative)
        },
        PLAYER_MANA: {
            x: 0.25, // Left side (relative)
            y: 0.38  // Below health bar (relative)
        },
        ENEMY_HEALTH: {
            x: 0.75, // Right side (relative)
            y: 0.3   // Within enemy panel (relative)
        },
        BUTTONS: {
            y: 0.88, // Bottom of screen (relative)
            width: 140, // Fixed width
            height: 50, // Fixed height
            spacing: 160 // Fixed spacing
        },
        SPRITES: {
            PLAYER: {
                x: 0.25, // Left side (relative)
                y: 300   // Fixed y position 
            },
            ENEMY: {
                x: 0.75, // Right side (relative)
                y: 300   // Fixed y position
            }
        },
        LOG: {
            x: 0.5,  // Center of screen (relative)
            y: 0.75, // Lower area (relative)
            width: 0.8, // 80% of screen width (relative)
            height: 0.1 // 10% of screen height (relative)
        }
    },
    DEBUG: {
        PANEL: {
            x: 0.05,
            y: 0.05,
            width: 0.2,
            height: 0.15
        }
    }
};
