import { getDungeonEnemies, getDungeonBoss } from '../data/enemies.js';

export function generateCombatEncounter(dungeon, isBoss = false) {
    const level = dungeon.level || 1;
    const count = isBoss ? 1 : Phaser.Math.Between(1, 2);
    return isBoss
        ? [getDungeonBoss(dungeon.id, level)]
        : getDungeonEnemies(dungeon.id, level, count);
}
