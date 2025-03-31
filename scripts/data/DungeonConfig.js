/**
 * DungeonConfig - Centralized configuration for all dungeon data
 * Defines metadata for dungeons including names, descriptions, room counts, etc.
 */

const DUNGEON_DATA = {
    // Verdant Forest dungeon
    'verdant-woods': {
        id: 'verdant-woods',
        name: 'Verdant Forest',
        description: 'A lush forest teeming with wildlife and dangerous creatures.',
        minLevel: 1, // Player level required to enter
        maxLevel: 20, // Max dungeon level this config applies to
        minRooms: 15, // Example property
        maxRooms: 20, // Example property
        backgroundKey: 'forest-bg', // Matches asset key
        backgroundPath: 'assets/sprites/backgrounds/forest-bg.png', // Actual path
        previewText: 'A beginner-friendly forest dungeon with goblins, wolves, and spiders.',
        // --- >>> THIS IS THE ARRAY TO UPDATE <<< ---
        enemyTypes: [
            'forest-goblin',     // Level 1
            'wolf',              // Level 2
            'forest-spider',     // Level 2
            'forest-bandit',     // Level 3
            'mushroom-creature', // Level 4
            'wild-boar',         // Level 4
            'thorn-lurker',      // Level 5
            'owlbear-cub',       // Level 5
            'briar-spirit',      // Level 6
            'entling',           // Level 6
            'horned-stag',       // Level 7
            'feral-druid',       // Level 8  <-- Needed for level 8 encounters
            'witch-hare',        // Level 8  <-- Needed for level 8 encounters
            'moss-troll',        // Level 9  <-- Needed for level 9 encounters
            'forest-wyrmling'    // Level 10 <-- Needed for level 10 encounters
            // Add any other enemies from enemies.js meant for this dungeon
        ],
        bossTypes: ['goblin-chief', 'alpha-wolf'],
        difficulty: 'Easy'
    },
    
    // Crystal Caverns dungeon
   'crystal-caverns': {
        id: 'crystal-caverns',
        name: 'Crystal Caverns',
        description: 'A mysterious cave system with glowing crystals and dangerous denizens.',
        minLevel: 10, // Player level requirement
        maxLevel: 20, // Max dungeon level
        minRooms: 18,
        maxRooms: 25,
        backgroundKey: 'caverns-bg',
        backgroundPath: 'assets/sprites/backgrounds/caverns-bg.png',
        previewText: 'A challenging dungeon filled with crystal golems and hostile spirits.',
        enemyTypes: ['cave-bat', 'crystal-golem', 'miner-ghost'], // Add more if defined
        bossTypes: ['crystal-queen'], // Corrected boss name from previous step
        difficulty: 'Challenging'
    }
};

/**
 * Get data for a specific dungeon
 * @param {string} dungeonId - The ID of the dungeon
 * @returns {object} - Dungeon data object
 */
export function getDungeonData(dungeonId) {
    return DUNGEON_DATA[dungeonId] || null;
}

/**
 * Get all available dungeons
 * @returns {array} - Array of dungeon data objects
 */
export function getAllDungeons() {
    return Object.values(DUNGEON_DATA);
}

/**
 * Check if player can access a dungeon
 * @param {object} player - Player object with level property
 * @param {string} dungeonId - Dungeon ID to check
 * @returns {boolean} - Whether the player can access the dungeon
 */
export function canAccessDungeon(player, dungeonId) {
    const dungeon = DUNGEON_DATA[dungeonId];
    if (!dungeon) return false;
    
    return player.level >= dungeon.minLevel;
}

export default {
    DUNGEON_DATA,
    getDungeonData,
    getAllDungeons,
    canAccessDungeon
};
