/**
 * Layout configuration for UI elements
 */
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
    DEBUG: {
        PANEL: {
            x: 0.05,
            y: 0.05,
            width: 0.2,
            height: 0.15
        }
    }
};
