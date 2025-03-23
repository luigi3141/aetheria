import gameState from '../gameState.js';
import HealthManager from './HealthManager.js';

/**
 * CharacterManager - Utility for character stat calculations and updates
 * Centralizes character-related logic to prevent duplication across scenes
 */
class CharacterManager {
    /**
     * Calculate base stats for a character class
     * @param {string} characterClass - Character class (warrior, mage, etc.)
     * @returns {object} Base stats for the class
     */
    static getBaseStatsForClass(characterClass) {
        // Default base stats
        const defaultStats = {
            strength: 10,
            agility: 10,
            intelligence: 10,
            constitution: 10,
            maxHealth: 100,
            maxMana: 50
        };
        
        // Class-specific stat modifiers
        const classStats = {
            warrior: {
                strength: 14,
                agility: 12,
                intelligence: 8,
                constitution: 14,
                maxHealth: 120,
                maxMana: 30
            },
            mage: {
                strength: 6,
                agility: 8,
                intelligence: 16,
                constitution: 8,
                maxHealth: 80,
                maxMana: 120
            },
            rogue: {
                strength: 10,
                agility: 16,
                intelligence: 12,
                constitution: 8,
                maxHealth: 90,
                maxMana: 40
            },
            cleric: {
                strength: 8,
                agility: 10,
                intelligence: 14,
                constitution: 12,
                maxHealth: 100,
                maxMana: 80
            },
            ranger: {
                strength: 12,
                agility: 14,
                intelligence: 10,
                constitution: 10,
                maxHealth: 95,
                maxMana: 45
            },
            bard: {
                strength: 8,
                agility: 12,
                intelligence: 14,
                constitution: 10,
                maxHealth: 90,
                maxMana: 70
            }
        };
        
        // Return class stats or default stats if class not found
        return classStats[characterClass] || defaultStats;
    }
    
    /**
     * Initialize a new character with base stats
     * @param {string} name - Character name
     * @param {string} characterClass - Character class
     * @returns {object} New character object
     */
    static createNewCharacter(name, characterClass) {
        // Get base stats for class
        const baseStats = this.getBaseStatsForClass(characterClass);
        
        // Create character object
        const character = {
            name: name,
            class: characterClass,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100,
            gold: 50,
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            skills: [],
            ...baseStats
        };
        
        // Initialize health and mana to max values
        character.health = character.maxHealth;
        character.mana = character.maxMana;
        
        console.log(`Created new character: ${name} the ${characterClass}`);
        console.log('Character stats:', character);
        
        return character;
    }
    
    /**
     * Calculate derived stats based on primary stats and equipment
     * @param {object} character - Character object
     * @returns {object} Derived stats
     */
    static calculateDerivedStats(character) {
        // Ensure character object exists
        if (!character) {
            console.error('Cannot calculate derived stats for undefined character');
            return {};
        }
        
        // Extract base stats
        const strength = character.strength || 10;
        const agility = character.agility || 10;
        const intelligence = character.intelligence || 10;
        const constitution = character.constitution || 10;
        
        // Calculate derived stats
        const derivedStats = {
            attackPower: Math.floor(strength * 1.5),
            defense: Math.floor(constitution * 0.8 + agility * 0.2),
            magicPower: Math.floor(intelligence * 1.2),
            critChance: Math.min(5 + Math.floor(agility * 0.25), 30), // Cap at 30%
            dodgeChance: Math.min(Math.floor(agility * 0.2), 20), // Cap at 20%
            healthRegen: Math.floor(constitution * 0.1),
            manaRegen: Math.floor(intelligence * 0.2)
        };
        
        // Add equipment bonuses if any
        if (character.equipment) {
            // Process weapon
            if (character.equipment.weapon) {
                derivedStats.attackPower += character.equipment.weapon.attackPower || 0;
                derivedStats.magicPower += character.equipment.weapon.magicPower || 0;
            }
            
            // Process armor
            if (character.equipment.armor) {
                derivedStats.defense += character.equipment.armor.defense || 0;
            }
            
            // Process accessory
            if (character.equipment.accessory) {
                // Apply accessory-specific bonuses
                const accessory = character.equipment.accessory;
                if (accessory.critBonus) derivedStats.critChance += accessory.critBonus;
                if (accessory.dodgeBonus) derivedStats.dodgeChance += accessory.dodgeBonus;
            }
        }
        
        return derivedStats;
    }
    
    /**
     * Apply level up bonuses to a character
     * @param {object} character - Character object
     * @returns {object} Character with applied level up bonuses
     */
    static applyLevelUp(character) {
        // Ensure character object exists
        if (!character) {
            console.error('Cannot apply level up to undefined character');
            return null;
        }
        
        // Calculate stat increases based on class
        const statIncreases = this.getLevelUpBonuses(character.class);
        
        // Apply stat increases
        character.strength += statIncreases.strength;
        character.agility += statIncreases.agility;
        character.intelligence += statIncreases.intelligence;
        character.constitution += statIncreases.constitution;
        
        // Update max health and mana
        character.maxHealth += statIncreases.maxHealth;
        character.maxMana += statIncreases.maxMana;
        
        // Restore health and mana to max
        character.health = character.maxHealth;
        character.mana = character.maxMana;
        
        // Increment level
        character.level += 1;
        
        // Calculate new experience threshold (increases each level)
        character.experienceToNextLevel = Math.floor(character.experienceToNextLevel * 1.5);
        
        // Reset current experience
        character.experience = 0;
        
        console.log(`Character ${character.name} leveled up to ${character.level}!`);
        
        return character;
    }
    
    /**
     * Get level up bonuses for a specific class
     * @param {string} characterClass - Character class
     * @returns {object} Stat bonuses for level up
     */
    static getLevelUpBonuses(characterClass) {
        // Default level up bonuses
        const defaultBonuses = {
            strength: 1,
            agility: 1,
            intelligence: 1,
            constitution: 1,
            maxHealth: 10,
            maxMana: 5
        };
        
        // Class-specific level up bonuses
        const classBonuses = {
            warrior: {
                strength: 2,
                agility: 1,
                intelligence: 0,
                constitution: 2,
                maxHealth: 15,
                maxMana: 3
            },
            mage: {
                strength: 0,
                agility: 1,
                intelligence: 3,
                constitution: 1,
                maxHealth: 7,
                maxMana: 15
            },
            rogue: {
                strength: 1,
                agility: 3,
                intelligence: 1,
                constitution: 0,
                maxHealth: 9,
                maxMana: 5
            },
            cleric: {
                strength: 0,
                agility: 1,
                intelligence: 2,
                constitution: 2,
                maxHealth: 12,
                maxMana: 10
            },
            ranger: {
                strength: 1,
                agility: 2,
                intelligence: 1,
                constitution: 1,
                maxHealth: 10,
                maxMana: 5
            },
            bard: {
                strength: 0,
                agility: 1,
                intelligence: 2,
                constitution: 1,
                maxHealth: 8,
                maxMana: 10
            }
        };
        
        // Return class bonuses or default bonuses if class not found
        return classBonuses[characterClass] || defaultBonuses;
    }
    
    /**
     * Updates the player character in gameState
     * @param {object} updatedCharacter - Updated character data
     */
    static updatePlayerCharacter(updatedCharacter) {
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Update player in gameState
        Object.assign(gameState.player, updatedCharacter);
        
        // Validate health and mana values
        HealthManager.validatePlayerHealth();
        
        console.log('Player character updated:', gameState.player);
    }
}

export default CharacterManager;
