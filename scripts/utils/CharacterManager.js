// Inside CharacterManager.js

import gameState from '../gameState.js';
import HealthManager from './HealthManager.js';
import items from '../data/items.js';
const { getItemData, categoryIconKeys } = items;

class CharacterManager {
    // --- Keep these if needed for initial character creation ---
    static getBaseStatsForClass(characterClass) {
        // Define base primary stats and HP/MP per class
        // NOTE: Base defense is removed/set to 0 implicitly later
        const classStats = {
            warrior: { strength: 14, agility: 12, intelligence: 8, constitution: 14, baseMaxHealth: 120, baseMaxMana: 30 },
            mage:    { strength: 6,  agility: 8,  intelligence: 16, constitution: 8,  baseMaxHealth: 80,  baseMaxMana: 120 },
            rogue:   { strength: 10, agility: 16, intelligence: 12, constitution: 8,  baseMaxHealth: 90,  baseMaxMana: 40 },
            cleric:  { strength: 8,  agility: 10, intelligence: 14, constitution: 12, baseMaxHealth: 100, baseMaxMana: 80 },
            ranger:  { strength: 12, agility: 14, intelligence: 10, constitution: 10, baseMaxHealth: 95,  baseMaxMana: 45 },
            bard:    { strength: 8,  agility: 12, intelligence: 14, constitution: 10, baseMaxHealth: 90,  baseMaxMana: 70 }
        };
        return classStats[characterClass] || { strength: 10, agility: 10, intelligence: 10, constitution: 10, baseMaxHealth: 100, baseMaxMana: 50 };
    }

    static createNewCharacter(name, characterClass) {
        const baseData = this.getBaseStatsForClass(characterClass);
        const character = {
            name: name, class: characterClass, level: 1,
            experience: 0, experienceToNextLevel: 100, gold: 50,
            inventory: { items: [], maxItems: 20, equipped: { weapon: null, body: null, head: null /* other slots */ } },
            abilities: [], // Add class-specific starting abilities if needed
            // Assign base stats
            strength: baseData.strength, agility: baseData.agility,
            intelligence: baseData.intelligence, constitution: baseData.constitution,
            // Store base max HP/MP for reference if needed for recalculation
            baseMaxHealth: baseData.baseMaxHealth, baseMaxMana: baseData.baseMaxMana,
            // Initialize current stats (calculated on demand or here)
            health: baseData.baseMaxHealth, maxHealth: baseData.baseMaxHealth,
            mana: baseData.baseMaxMana, maxMana: baseData.baseMaxMana,
            // Current combat stats start based on initial calculation
            currentAttack: 0, // Will be calculated
            currentMagicAttack: 0, // Will be calculated
            currentDefense: 0, // Starts at 0
        };
        this.recalculatePlayerStats(character); // Calculate initial current stats
        console.log(`Created new character: ${name} the ${characterClass}`);
        console.log('Initial Character stats:', character);
        return character;
    }
    // --- End character creation helpers ---


    /**
     * Calculate the player's current total stats, including equipment bonuses.
     * Stores the calculated values directly in gameState.player.
     * Accepts optional character object for use during creation before gameState is set.
     * @param {object} [character=gameState.player] - The character object to recalculate for. Defaults to gameState.player.
     */
    static recalculatePlayerStats(character = gameState.player) {
        if (!character) {
            console.error("Cannot recalculate stats: Invalid character object provided.");
            return;
        }

        // --- Base Primary Stats (from level ups, base class) ---
        const baseStrength = character.strength || 10;
        const baseAgility = character.agility || 10;
        const baseIntelligence = character.intelligence || 10;
        const baseConstitution = character.constitution || 10;

        // --- Initialize Current Combat Stats ---
        let currentDefense = 0; // Player base defense is 0
        let currentAttackBonus = 0; // Flat bonus from non-wand weapons
        let currentMagicAttackBonus = 0; // Flat bonus from wands/staves

        // Add other stat bonuses if needed (crit, dodge, etc.)
        let bonusMaxHealth = 0;
        let bonusMaxMana = 0;

        // --- Equipment Bonuses ---
        if (character.inventory && character.inventory.equipped) {
            for (const slot in character.inventory.equipped) {
                const itemId = character.inventory.equipped[slot];
                if (itemId) {
                    const itemData = getItemData(itemId);
                    if (itemData && itemData.effects) {
                        console.log(`Applying effects from ${itemData.inGameName} in slot ${slot}:`, itemData.effects);

                        // --- Apply DEFENSE bonus (only from items) ---
                        currentDefense += itemData.effects.defense || 0;

                        // --- Apply WEAPON bonuses ---
                        if (slot === 'weapon') {
                             // Check if it's a magic weapon (wand/staff etc.)
                             // Assuming iconKey tells us the type based on items.js setup
                            if (itemData.iconKey === categoryIconKeys.Weapon.Wand) { // Use the mapping from items.js
                                currentMagicAttackBonus += itemData.effects.magicAttack || 0;
                                // Wands might also add intelligence, apply that to base for recalculation below?
                                // baseIntelligence += itemData.effects.intelligence || 0;
                            } else {
                                // Assume other weapons add physical attack
                                currentAttackBonus += itemData.effects.attack || 0;
                                // Physical weapons might add strength etc.
                                // baseStrength += itemData.effects.strength || 0;
                            }
                        }

                         // --- Apply other bonuses ---
                         bonusMaxHealth += itemData.effects.health || 0; // Flat health bonus from items
                         bonusMaxMana += itemData.effects.mana || 0; // Flat mana bonus
                         // Add crit, dodge, primary stat bonuses from items if they exist
                         // currentCritChance += itemData.effects.critChance || 0;
                         // currentDodgeChance += itemData.effects.dodgeChance || 0;
                         // baseAgility += itemData.effects.agility || 0; // Example if boots add agility
                    }
                }
            }
        }

        // --- Final Derived Stat Calculations ---

        // Max Health/Mana: Base + Stat Scaling + Flat Item Bonus + Level Bonus
        character.maxHealth = (character.baseMaxHealth || 100) + (baseConstitution * 5) + bonusMaxHealth + (character.level * 10);
        character.maxMana = (character.baseMaxMana || 50) + (baseIntelligence * 3) + bonusMaxMana + (character.level * 5);

        // Current Attack: Base STR scaling + Flat Weapon Bonus
        character.currentAttack = Math.floor(baseStrength * 1.5) + currentAttackBonus;

        // Current Magic Attack: Base INT scaling + Flat Wand Bonus
        character.currentMagicAttack = Math.floor(baseIntelligence * 1.2) + currentMagicAttackBonus;

        // Current Defense: JUST from items
        character.currentDefense = currentDefense;

        // Ensure current health/mana aren't exceeding new max
        character.health = Math.min(character.health ?? character.maxHealth, character.maxHealth); // Default to full if undefined
        character.mana = Math.min(character.mana ?? character.maxMana, character.maxMana); // Default to full if undefined


        // --- Log Updated Stats ---
        console.log("Recalculated Player Stats:", {
            HP: `${character.health}/${character.maxHealth}`,
            MP: `${character.mana}/${character.maxMana}`,
            Attack: character.currentAttack,
            MagicAttack: character.currentMagicAttack,
            Defense: character.currentDefense,
            // Add others...
        });

        // --- Update UI (If possible and needed) ---
        // This part remains tricky without a direct reference or event system
        const currentScene = window.game?.scene.getScenes(true)[0]; // Attempt to find active scene
        if (currentScene) {
             // Update Combat UI if relevant
             if (currentScene.scene.key === 'EncounterScene' && currentScene.combatUI) {
                 currentScene.combatUI.updatePlayerHealth();
                 currentScene.combatUI.updatePlayerMana();
             }
             // Update Inventory Potion Tab UI if relevant
             else if (currentScene.scene.key === 'InventoryScene' && currentScene.currentTab === 'Potions') {
                  if(currentScene.potionsHpBar) currentScene.potionsHpBar.update(character.health, character.maxHealth);
                  if(currentScene.potionsMpBar) currentScene.potionsMpBar.update(character.mana, character.maxMana);
             }
             // Update Overworld/Dungeon UI? Needs specific implementation in those scenes
        }
    }

     /**
      * Apply level up bonuses to a character and recalculate stats.
      * @param {object} [character=gameState.player] - Character object to level up.
      * @returns {object} Character with applied level up bonuses.
      */
     static applyLevelUp(character = gameState.player) {
         if (!character) return null;

         // Get stat increases based on class
         const statIncreases = this.getLevelUpBonuses(character.class); // Keep this helper

         // Apply base stat increases
         character.strength = (character.strength || 10) + (statIncreases.strength || 0);
         character.agility = (character.agility || 10) + (statIncreases.agility || 0);
         character.intelligence = (character.intelligence || 10) + (statIncreases.intelligence || 0);
         character.constitution = (character.constitution || 10) + (statIncreases.constitution || 0);

         // Store base HP/MP increases separate from calculation if needed, or just recalculate total
         // character.baseMaxHealth = (character.baseMaxHealth || 100) + (statIncreases.maxHealth || 0);
         // character.baseMaxMana = (character.baseMaxMana || 50) + (statIncreases.maxMana || 0);

         // Increment level BEFORE recalculating stats that depend on level
         character.level += 1;

         // Calculate new experience threshold
         character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5); // Or your formula
         // character.experience = 0; // Reset XP overflow if needed, or handle in CombatResultScene

         // --- Recalculate all stats including new level and base stats ---
         this.recalculatePlayerStats(character);

         // Restore health and mana fully on level up AFTER recalculating max values
         character.health = character.maxHealth;
         character.mana = character.maxMana;


         console.log(`Character ${character.name} leveled up to ${character.level}! Stats recalculated.`);
         return character;
     }

     // Helper to get level up bonuses (keep this or adjust as needed)
     static getLevelUpBonuses(characterClass) {
          const classBonuses = {
              warrior: { strength: 2, agility: 1, intelligence: 0, constitution: 2, /*maxHealth: 15, maxMana: 3*/ }, // HP/MP now derived
              mage:    { strength: 0, agility: 1, intelligence: 3, constitution: 1, /*maxHealth: 7, maxMana: 15*/ },
              rogue:   { strength: 1, agility: 3, intelligence: 1, constitution: 0, /*maxHealth: 9, maxMana: 5*/ },
              cleric:  { strength: 0, agility: 1, intelligence: 2, constitution: 2, /*maxHealth: 12, maxMana: 10*/ },
              ranger:  { strength: 1, agility: 2, intelligence: 1, constitution: 1, /*maxHealth: 10, maxMana: 5*/ },
              bard:    { strength: 0, agility: 1, intelligence: 2, constitution: 1, /*maxHealth: 8, maxMana: 10*/ }
          };
          return classBonuses[characterClass] || { strength: 1, agility: 1, intelligence: 1, constitution: 1 };
     }

    // updatePlayerCharacter is essentially replaced by recalculatePlayerStats
    // static updatePlayerCharacter(updatedCharacter) { ... }
}

export default CharacterManager;