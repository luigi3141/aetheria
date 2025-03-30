// ---- File: data/monsterLevelProbabilities.js ----

/**
 * monsterLevelProbabilities.js
 * Defines the probability of encountering monsters of specific levels
 * based on the current dungeon level.
 */

const monsterLevelProbabilities = [
    // Dungeon Level: 1-7 (Easy Difficulty)
    { "dungeon_level": 1, "difficulty": "Easy", "monster_level_probability": { "1": "75.0%", "2": "25.0%" } },
    { "dungeon_level": 2, "difficulty": "Easy", "monster_level_probability": { "1": "75.0%", "2": "25.0%" } },
    { "dungeon_level": 3, "difficulty": "Easy", "monster_level_probability": { "1": "50.0%", "2": "50.0%" } },
    { "dungeon_level": 4, "difficulty": "Easy", "monster_level_probability": { "2": "50.0%", "3": "25.0%", "4": "25.0%" } },
    { "dungeon_level": 5, "difficulty": "Easy", "monster_level_probability": { "2": "25.0%", "3": "50.0%", "4": "25.0%" } },
    { "dungeon_level": 6, "difficulty": "Easy", "monster_level_probability": { "3": "50.0%", "4": "50.0%" } },
    { "dungeon_level": 7, "difficulty": "Easy", "monster_level_probability": { "3": "50.0%", "4": "50.0%" } },
  
    // Dungeon Level: 8-14 (Medium Difficulty)
    { "dungeon_level": 8, "difficulty": "Medium", "monster_level_probability": { "5": "50.0%", "6": "50.0%" } },
    { "dungeon_level": 9, "difficulty": "Medium", "monster_level_probability": { "5": "50.0%", "6": "50.0%" } },
    { "dungeon_level": 10, "difficulty": "Medium", "monster_level_probability": { "6": "50.0%", "7": "50.0%" } },
    { "dungeon_level": 11, "difficulty": "Medium", "monster_level_probability": { "6": "50.0%", "7": "40.0%", "8": "10.0%" } },
    { "dungeon_level": 12, "difficulty": "Medium", "monster_level_probability": { "6": "50.0%", "7": "30.0%", "8": "20.0%", "9": "10.0%" } },
    { "dungeon_level": 13, "difficulty": "Medium", "monster_level_probability": { "6": "50.0%", "7": "30.0%", "8": "20.0%", "9": "10.0%" } },
    { "dungeon_level": 14, "difficulty": "Medium", "monster_level_probability": { "6": "50.0%", "7": "30.0%", "8": "20.0%", "9": "10.0%" } },
  
    // Dungeon Level: 15-20 (Hard Difficulty)
    { "dungeon_level": 15, "difficulty": "Hard", "monster_level_probability": { "8": "50.0%", "9": "50.0%" } },
    { "dungeon_level": 16, "difficulty": "Hard", "monster_level_probability": { "8": "50.0%", "9": "40.0%", "10": "10.0%" } },
    { "dungeon_level": 17, "difficulty": "Hard", "monster_level_probability": { "8": "40.0%", "9": "40.0%", "10": "20.0%" } },
    { "dungeon_level": 18, "difficulty": "Hard", "monster_level_probability": { "8": "30.0%", "9": "40.0%", "10": "30.0%" } },
    { "dungeon_level": 19, "difficulty": "Hard", "monster_level_probability": { "8": "20.0%", "9": "40.0%", "10": "40.0%" } },
    { "dungeon_level": 20, "difficulty": "Hard", "monster_level_probability": { "8": "10.0%", "9": "40.0%", "10": "50.0%" } }
  ];
  
  /**
   * Determines the monster level for an encounter based on the current dungeon level.
   * @param {number} dungeonLevel - The current level within the dungeon.
   * @returns {number} The determined monster level for the encounter.
   */
  function determineMonsterLevel(dungeonLevel) {
      // Clamp dungeonLevel to the range defined in the probabilities table
      const minDungeonLevel = monsterLevelProbabilities[0]?.dungeon_level || 1;
      const maxDungeonLevel = monsterLevelProbabilities[monsterLevelProbabilities.length - 1]?.dungeon_level || 20;
      const effectiveDungeonLevel = Math.max(minDungeonLevel, Math.min(dungeonLevel, maxDungeonLevel));
  
      const levelData = monsterLevelProbabilities.find(data => data.dungeon_level === effectiveDungeonLevel);
  
      if (!levelData || !levelData.monster_level_probability) {
          console.warn(`No monster level probability data found for effective dungeon level ${effectiveDungeonLevel}. Defaulting to level ${effectiveDungeonLevel} monster.`);
          return effectiveDungeonLevel; // Fallback
      }
  
      const probabilities = levelData.monster_level_probability;
      const roll = Math.random() * 100;
      let cumulativeProb = 0;
  
      // Sort keys numerically to ensure correct probability summing order
      const sortedLevels = Object.keys(probabilities).sort((a, b) => parseInt(a) - parseInt(b));
  
      for (const levelStr of sortedLevels) {
          const probability = parseFloat(probabilities[levelStr]); // Remove '%' and convert to float
          if (isNaN(probability)) {
              console.warn(`Invalid probability format for level ${levelStr} at dungeon level ${effectiveDungeonLevel}: ${probabilities[levelStr]}`);
              continue;
          }
          cumulativeProb += probability;
          if (roll < cumulativeProb) {
              return parseInt(levelStr); // Return the monster level (as number)
          }
      }
  
      // Fallback if probabilities don't sum to 100 or other issues
      console.warn(`Probability roll failed or probabilities incomplete for dungeon level ${effectiveDungeonLevel}. Defaulting to lowest level.`);
      return parseInt(sortedLevels[0]) || effectiveDungeonLevel; // Default to lowest defined level or dungeon level
  }
  
  export { monsterLevelProbabilities, determineMonsterLevel };