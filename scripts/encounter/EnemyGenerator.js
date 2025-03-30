// ---- File: EnemyGenerator.js ----

// Import necessary functions from enemies.js and the new probability module
import {
    generateEnemy,
    getEnemyData, // Needed to check enemy level
    getEnemyIdsByLevel,
    getPossibleDungeonEnemyTypes, // To get the *list* of types for the dungeon
    getDungeonBoss
} from '../data/enemies.js';
import { determineMonsterLevel } from '../data/monsterLevelProbabilities.js'; // Import the new function
import { getDungeonData } from '../data/DungeonConfig.js'; // To get enemy types list

/**
 * Generates a combat encounter (currently one enemy) based on dungeon configuration and level.
 * @param {object} dungeon - The current dungeon state object from gameState (contains id, level, etc.).
 * @param {boolean} [isBoss=false] - Whether to generate a boss encounter.
 * @returns {array} An array containing the generated enemy instance(s), or an empty array on failure.
 */
export function generateCombatEncounter(dungeon, isBoss = false) {
    if (!dungeon || !dungeon.id || dungeon.level === undefined) {
        console.error("Invalid dungeon data provided to generateCombatEncounter:", dungeon);
        return []; // Return empty array on error
    }

    const currentDungeonLevel = dungeon.level;
    const dungeonId = dungeon.id;

    if (isBoss) {
        // Use existing boss generation logic
        const boss = getDungeonBoss(dungeonId, currentDungeonLevel);
        return boss ? [boss] : []; // Return array with boss or empty array
    } else {
        // --- Generate Regular Encounter ---
        console.log(`Generating encounter for ${dungeonId} at level ${currentDungeonLevel}`);

        // 1. Determine the target monster level based on dungeon level probability
        const targetMonsterLevel = determineMonsterLevel(currentDungeonLevel);
        console.log(`Target Monster Level determined: ${targetMonsterLevel}`);

        // 2. Get the list of possible enemy *types* for this specific dungeon
        const possibleEnemyTypes = getPossibleDungeonEnemyTypes(dungeonId); // Use the helper
        if (!possibleEnemyTypes || possibleEnemyTypes.length === 0) {
            console.error(`No enemy types defined for dungeon ${dungeonId} in config.`);
            // Optionally generate a default enemy here?
            return [];
        }
        console.log(`Possible enemy types for ${dungeonId}:`, possibleEnemyTypes);


        // 3. Filter these types to find enemies matching the targetMonsterLevel
        const matchingEnemyIds = possibleEnemyTypes.filter(enemyId => {
            const enemyData = getEnemyData(enemyId); // Fetch data to check level
            return enemyData && enemyData.level === targetMonsterLevel;
        });

        console.log(`Enemy types matching level ${targetMonsterLevel}:`, matchingEnemyIds);


        // 4. Select the enemy
        let selectedEnemyId = null;
        if (matchingEnemyIds.length > 0) {
            // Randomly select one enemy ID from the matching ones
            selectedEnemyId = matchingEnemyIds[Math.floor(Math.random() * matchingEnemyIds.length)];
        } else {
            // --- Fallback Logic ---
            console.warn(`No enemies of level ${targetMonsterLevel} found for dungeon ${dungeonId}. Trying closest level.`);
            // Find the enemy type closest in level from the possible types
            let closestEnemyId = null;
            let minLevelDiff = Infinity;

            possibleEnemyTypes.forEach(enemyId => {
                const enemyData = getEnemyData(enemyId);
                if (enemyData) {
                    const diff = Math.abs(enemyData.level - targetMonsterLevel);
                    if (diff < minLevelDiff) {
                        minLevelDiff = diff;
                        closestEnemyId = enemyId;
                    }
                }
            });
            selectedEnemyId = closestEnemyId; // Use the closest match

            if (selectedEnemyId) {
                console.warn(`Using closest level enemy: ${selectedEnemyId} (Level ${getEnemyData(selectedEnemyId)?.level})`);
            } else {
                 console.error(`CRITICAL: No fallback enemy could be found for dungeon ${dungeonId}. Cannot generate encounter.`);
                 return []; // Return empty if absolutely no enemy can be found
            }
        }

        // 5. Generate the enemy instance (using the version without levelModifier)
        const enemyInstance = generateEnemy(selectedEnemyId);

        if (enemyInstance) {
            console.log(`Generated Enemy: ${enemyInstance.name} (Level ${enemyInstance.level})`);
            return [enemyInstance]; // Return as an array containing the single enemy
        } else {
            console.error(`Failed to generate enemy instance for ID: ${selectedEnemyId}`);
            return []; // Return empty array on failure
        }
    }
}