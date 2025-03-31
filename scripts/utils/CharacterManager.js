// ---- File: CharacterManager.js ----

import gameState from '../gameState.js';
import items from '../data/items.js';
const { getItemData } = items;

// --- NEW: Define Class Definitions ---
const CLASS_DEFINITIONS = {    
    'warrior': {
        name: 'Warrior',
        primaryAttribute: 'strength',
        baseDamage: 8.0,
        baseStats: { strength: 12.0, agility: 8.0, intelligence: 8.0, constitution: 12.0 },
        growthPerLevel: { strength: 2.5, agility: 0.5, intelligence: 0.5, constitution: 1.5 },
        baseHp: 40.0,
        hpGrowth: 10.0,
        // Define base mana if needed, or default
        baseMana: 30.0, // Example base mana
        manaGrowth: 2.0  // Example mana growth per level
    },
    'mage': {
        name: 'Mage',
        primaryAttribute: 'intelligence',
        baseDamage: 7.0,
        baseStats: { strength: 10.0, agility: 10.0, intelligence: 12.0, constitution: 8.0 }, // Corrected base STR/AGI/CON
        growthPerLevel: { strength: 0.5, agility: 1.0, intelligence: 3.0, constitution: 0.5 },
        baseHp: 60.0,
        hpGrowth: 6.0,
        baseMana: 100.0,
        manaGrowth: 10.0
    },
    'rogue': {
        name: 'Rogue',
        primaryAttribute: 'agility',
        baseDamage: 6.0,
        baseStats: { strength: 10.0, agility: 12.0, intelligence: 10.0, constitution: 8.0 }, // Corrected base STR/INT/CON
        growthPerLevel: { strength: 1.0, agility: 2.0, intelligence: 1.0, constitution: 1.0 },
        baseHp: 60.0,
        hpGrowth: 8.0,
        baseMana: 40.0,
        manaGrowth: 3.0
    },
    'cleric': {
        name: 'Cleric',
        primaryAttribute: 'intelligence', // Primary listed as INT
        baseDamage: 5.0,
        baseStats: { strength: 10.0, agility: 10.0, intelligence: 10.0, constitution: 10.0 }, // Corrected base STR/AGI/INT/CON
        growthPerLevel: { strength: 1.5, agility: 1.0, intelligence: 1.5, constitution: 1.0 },
        baseHp: 50.0,
        hpGrowth: 8.0,
        baseMana: 80.0,
        manaGrowth: 6.0
    },
    'ranger': {
        name: 'Ranger',
        primaryAttribute: 'agility', // Primary listed as AGI
        baseDamage: 6.0,
        baseStats: { strength: 10.0, agility: 12.0, intelligence: 10.0, constitution: 8.0 }, // Corrected base STR/INT/CON
        growthPerLevel: { strength: 1.0, agility: 2.0, intelligence: 1.5, constitution: 0.5 },
        baseHp: 60.0,
        hpGrowth: 8.0,
        baseMana: 45.0,
        manaGrowth: 3.0
    },
    'bard': {
        name: 'Bard',
        primaryAttribute: 'intelligence', // Primary listed as INT
        baseDamage: 5.0,
        baseStats: { strength: 10.0, agility: 10.0, intelligence: 10.0, constitution: 10.0 }, // Corrected base STR/AGI/INT/CON
        growthPerLevel: { strength: 1.0, agility: 1.5, intelligence: 2.0, constitution: 0.5 },
        baseHp: 50.0,
        hpGrowth: 8.0,
        baseMana: 70.0,
        manaGrowth: 5.0
    },
    // Add 'spare' if needed, using defaults or specific values
     'spare': {
        name: 'Spare',
        primaryAttribute: 'strength',
        baseDamage: 5.0,
        baseStats: { strength: 5.0, agility: 5.0, intelligence: 5.0, constitution: 5.0 },
        growthPerLevel: { strength: 0.5, agility: 0.5, intelligence: 0.5, constitution: 0.5 },
        baseHp: 75.0,
        hpGrowth: 10.0,
        baseMana: 20.0,
        manaGrowth: 1.0
    }
};

// Define Scaling factors (adjust these to balance damage)
const STR_ATTACK_SCALE = 0.8;
const AGI_ATTACK_SCALE = 0.4; // Agility contributes less directly to raw attack than STR
const INT_MAGIC_ATTACK_SCALE = 1.5;
const CON_HP_SCALE = 5; // How much 1 CON point adds to Max HP (in addition to level growth)

class CharacterManager {

    // REMOVE getBaseStatsForClass and getLevelUpBonuses functions

    /**
     * Create a new character based on the CLASS_DEFINITIONS.
     * @param {string} name - Character name.
     * @param {string} characterClass - Class key (lowercase).
     * @returns {object|null} The newly created character object or null on error.
     */
    static createNewCharacter(name, characterClass) {
        const classDef = CLASS_DEFINITIONS[characterClass.toLowerCase()];
        if (!classDef) {
            console.error(`Invalid character class provided: ${characterClass}`);
            return null;
        }

        const character = {
            name: name,
            class: characterClass.toLowerCase(), // Store lowercase key
            level: 1,
            experience: 0,
            experienceToNextLevel: 100, // Initial XP threshold
            gold: 50,
            inventory: { items: [], maxItems: 20, equipped: { weapon: null, body: null, accessory: null } }, // Adjusted slots
            abilities: [], // TODO: Add starting abilities based on classDef if needed

            // --- Set Initial Primary Stats from Base ---
            strength: classDef.baseStats.strength,
            agility: classDef.baseStats.agility,
            intelligence: classDef.baseStats.intelligence,
            constitution: classDef.baseStats.constitution,

            // --- Derived stats calculated by recalculatePlayerStats ---
            health: 0, // Will be set by recalculate
            maxHealth: 0, // Will be set by recalculate
            mana: 0, // Will be set by recalculate
            maxMana: 0, // Will be set by recalculate
            currentAttack: 0, // Will be set by recalculate
            currentMagicAttack: 0, // Will be set by recalculate
            currentDefense: 0, // Will be set by recalculate

            // Store base values from definition for recalculation reference
            _baseHp: classDef.baseHp,
            _hpGrowth: classDef.hpGrowth,
            _baseMana: classDef.baseMana || 50, // Use defined or default
            _manaGrowth: classDef.manaGrowth || 3, // Use defined or default
            _baseDamage: classDef.baseDamage,
            _primaryAttribute: classDef.primaryAttribute
        };

        this.recalculatePlayerStats(character); // Calculate initial derived stats

        // Set current HP/MP to max after initial calculation
        character.health = character.maxHealth;
        character.mana = character.maxMana;

        console.log(`Created new character: ${name} the ${character.class}`);
        console.log('Initial Character stats:', JSON.parse(JSON.stringify(character))); // Log clean copy
        return character;
    }

    /**
      * Apply level up bonuses based on CLASS_DEFINITIONS.
      * @param {object} [character=gameState.player] - Character object to level up.
      * @returns {object} Character with applied level up bonuses.
      */
     static applyLevelUp(character = gameState.player) {
         if (!character || !character.class) {
             console.error("Cannot apply level up: Invalid character or missing class.");
             return null;
         }

         const classDef = CLASS_DEFINITIONS[character.class];
         if (!classDef) {
             console.error(`Cannot apply level up: Class definition not found for ${character.class}`);
             return character; // Return character unchanged
         }

         const growth = classDef.growthPerLevel;

         // Increment level first, as stat calculations might depend on it
         character.level += 1;

         // Apply primary stat increases from growth rates
         character.strength += growth.strength || 0;
         character.agility += growth.agility || 0;
         character.intelligence += growth.intelligence || 0;
         character.constitution += growth.constitution || 0;

         // Calculate new experience threshold
         character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5); // Example formula
         // Note: XP overflow handling should happen in CombatResultScene *before* calling this

         // --- Recalculate all derived stats ---
         this.recalculatePlayerStats(character);

         // Restore health partially and mana fully on level up AFTER recalculating max values
         character.health = Math.min(character.health + 10, character.maxHealth);
         character.mana = character.maxMana;

         console.log(`Character ${character.name} leveled up to ${character.level}! Stats recalculated.`);
         return character;
     }


    /**
     * Calculate the player's current total stats based on level, stats, and equipment.
     * Incorporates the new CLASS_DEFINITIONS.
     * @param {object} [character=gameState.player] - The character object to recalculate for.
     */
    static recalculatePlayerStats(character = gameState.player) {
        if (!character || !character.class) {
             console.error("Cannot recalculate stats: Invalid character or missing class.");
            return;
        }

         const classDef = CLASS_DEFINITIONS[character.class];
         if (!classDef) {
             console.error(`Cannot recalculate stats: Class definition not found for ${character.class}`);
             return;
         }

        // --- Current Primary Stats (already updated by level up) ---
        const currentStrength = character.strength || 0;
        const currentAgility = character.agility || 0;
        const currentIntelligence = character.intelligence || 0;
        const currentConstitution = character.constitution || 0;
        const currentLevel = character.level || 1;

        // --- Equipment Bonuses Initialization ---
        let bonusMaxHealth = 0;
        let bonusMaxMana = 0;
        let bonusDefense = 0;
        let bonusAttack = 0;        // Physical attack from equipment
        let bonusMagicAttack = 0; // Magic attack from equipment
        // Add other bonus stats if needed (crit, dodge, etc.)

        // --- Process Equipment ---
        if (character.inventory && character.inventory.equipped) {
            for (const slot in character.inventory.equipped) {
                const itemId = character.inventory.equipped[slot];
                if (itemId) {
                    const itemData = getItemData(itemId);
                    if (itemData && itemData.effects) {
                        // console.log(`Applying effects from ${itemData.inGameName} in slot ${slot}:`, itemData.effects);
                        bonusMaxHealth += itemData.effects.health || 0;
                        bonusMaxMana += itemData.effects.mana || 0;
                        bonusDefense += itemData.effects.defense || 0;
                        bonusAttack += itemData.effects.attack || 0; // Directly add weapon attack
                        bonusMagicAttack += itemData.effects.magicAttack || 0; // Directly add magic weapon attack
                        // Add other effects like crit, dodge, primary stats from gear if implemented
                    }
                }
            }
        }

        // --- Calculate Derived Stats ---

        // Max Health = Base + Growth Per Level + CON Scaling + Equipment Bonus
        character.maxHealth = Math.floor(
            (character._baseHp || 40)
             + ((character._hpGrowth || 0) * (currentLevel - 1)) // Growth applies starting level 2
             + (currentConstitution * CON_HP_SCALE)
             + bonusMaxHealth
        );

        // Max Mana = Base + Growth Per Level + INT Scaling + Equipment Bonus
         character.maxMana = Math.floor(
             (character._baseMana || 50)
             + ((character._manaGrowth || 0) * (currentLevel - 1)) // Growth applies starting level 2
             + (currentIntelligence * (INT_MAGIC_ATTACK_SCALE / 2)) // Example: Mana scales with INT too, adjust factor
             + bonusMaxMana
         );


        // --- Calculate Base Damage Contributions ---
        // Calculate base contributions from stats *before* adding class base damage
        const physicalStatContribution = Math.floor(currentStrength * STR_ATTACK_SCALE) + Math.floor(currentAgility * AGI_ATTACK_SCALE);
        const magicalStatContribution = Math.floor(currentIntelligence * INT_MAGIC_ATTACK_SCALE);
        // Initialize attack values with stat contributions
        let finalAttack = physicalStatContribution;
        let finalMagicAttack = magicalStatContribution;

        // Add the class's base damage to the appropriate attack type based on primary attribute
        const classBaseDamage = character._baseDamage || 0;
        const primaryAttr = character._primaryAttribute;

        if (primaryAttr === 'strength' || primaryAttr === 'agility') {
            finalAttack += classBaseDamage;
        } else if (primaryAttr === 'intelligence') {
            finalMagicAttack += classBaseDamage;
        }

        // --- Set current attack based *only* on scaled stats + equipment ---
        character.currentAttack = Math.max(0, Math.floor(physicalStatContribution + bonusAttack));
        character.currentMagicAttack = Math.max(0, Math.floor(magicalStatContribution + bonusMagicAttack));
        character.currentDefense = Math.max(0, Math.floor(bonusDefense)); // Defense primarily from gear

        // Ensure current health/mana aren't exceeding new max
        character.health = Math.min(character.health ?? character.maxHealth, character.maxHealth);
        character.mana = Math.min(character.mana ?? character.maxMana, character.maxMana);

        // --- Log Updated Stats ---
        console.log(`Recalculated Stats for Level ${currentLevel} ${character.class}:`, {
            HP: `${character.health}/${character.maxHealth}`,
            MP: `${character.mana}/${character.maxMana}`,
            STR: currentStrength, AGI: currentAgility, INT: currentIntelligence, CON: currentConstitution,
            Attack: character.currentAttack, MagicAttack: character.currentMagicAttack, Defense: character.currentDefense
        });

         // --- Update UI (If possible and needed) ---
         const currentScene = window.game?.scene.getScenes(true)[0];
         if (currentScene) { /* ... UI update logic ... */ }
    }
}

export default CharacterManager;
export {
    CLASS_DEFINITIONS,
    CON_HP_SCALE,
    INT_MAGIC_ATTACK_SCALE,
    STR_ATTACK_SCALE,
    AGI_ATTACK_SCALE
}; 