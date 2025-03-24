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
        minLevel: 1,
        maxLevel: 10,
        minRooms: 15,
        maxRooms: 20,
        backgroundKey: 'forest-bg',
        backgroundPath: 'assets/sprites/backgrounds/forest-bg.png',
        previewText: 'A beginner-friendly forest dungeon with goblins, wolves, and spiders.',
        enemyTypes: ['forest-goblin', 'wolf', 'forest-spider', 'mushroom-creature', 'forest-bandit'],
        bossTypes: ['goblin-chief', 'alpha-wolf'],
        difficulty: 'Easy'
    },
    
    // Crystal Caverns dungeon
    'crystal-caverns': {
        id: 'crystal-caverns',
        name: 'Crystal Caverns',
        description: 'A mysterious cave system with glowing crystals and dangerous denizens.',
        minLevel: 10,
        maxLevel: 20,
        minRooms: 18,
        maxRooms: 25,
        backgroundKey: 'caverns-bg',
        backgroundPath: 'assets/sprites/backgrounds/caverns-bg.png',
        previewText: 'A challenging dungeon filled with crystal golems and hostile spirits.',
        enemyTypes: ['cave-bat', 'crystal-golem', 'miner-ghost'],
        bossTypes: ['crystal-guardian'],
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
