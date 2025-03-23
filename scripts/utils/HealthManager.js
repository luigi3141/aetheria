import gameState from '../gameState.js';

/**
 * HealthManager - Utility for managing player health and mana consistently across scenes
 */
class HealthManager {
    /**
     * Update player health
     * @param {number} newHealth - New health value
     * @param {boolean} relative - If true, add to current health; if false, set directly
     */
    static updatePlayerHealth(newHealth, relative = false) {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Ensure maxHealth is set
        if (!gameState.player.maxHealth) {
            gameState.player.maxHealth = 100;
        }
        
        // Update health
        if (relative) {
            gameState.player.health = Math.max(0, (gameState.player.health || 0) + newHealth);
        } else {
            gameState.player.health = newHealth;
        }
        
        // Ensure health doesn't exceed maximum
        gameState.player.health = Math.min(gameState.player.health, gameState.player.maxHealth);
        
        console.log(`Player health updated: ${gameState.player.health}/${gameState.player.maxHealth}`);
    }
    
    /**
     * Update player max health
     * @param {number} newMaxHealth - New max health value
     * @param {boolean} relative - If true, add to current max health; if false, set directly
     * @param {boolean} healToFull - If true, heal player to full after increasing max health
     */
    static updatePlayerMaxHealth(newMaxHealth, relative = false, healToFull = false) {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Update max health
        if (relative) {
            gameState.player.maxHealth = Math.max(1, (gameState.player.maxHealth || 100) + newMaxHealth);
        } else {
            gameState.player.maxHealth = Math.max(1, newMaxHealth);
        }
        
        // Ensure current health doesn't exceed new maximum
        gameState.player.health = Math.min(gameState.player.health || 0, gameState.player.maxHealth);
        
        // Heal to full if requested
        if (healToFull) {
            gameState.player.health = gameState.player.maxHealth;
        }
        
        console.log(`Player max health updated: ${gameState.player.health}/${gameState.player.maxHealth}`);
    }
    
    /**
     * Update player mana
     * @param {number} newMana - New mana value
     * @param {boolean} relative - If true, add to current mana; if false, set directly
     */
    static updatePlayerMana(newMana, relative = false) {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Ensure maxMana is set
        if (!gameState.player.maxMana) {
            gameState.player.maxMana = 50;
        }
        
        // Update mana
        if (relative) {
            gameState.player.mana = Math.max(0, (gameState.player.mana || 0) + newMana);
        } else {
            gameState.player.mana = newMana;
        }
        
        // Ensure mana doesn't exceed maximum
        gameState.player.mana = Math.min(gameState.player.mana, gameState.player.maxMana);
        
        console.log(`Player mana updated: ${gameState.player.mana}/${gameState.player.maxMana}`);
    }
    
    /**
     * Update player max mana
     * @param {number} newMaxMana - New max mana value
     * @param {boolean} relative - If true, add to current max mana; if false, set directly
     * @param {boolean} restoreToFull - If true, restore player mana to full after increasing max mana
     */
    static updatePlayerMaxMana(newMaxMana, relative = false, restoreToFull = false) {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Update max mana
        if (relative) {
            gameState.player.maxMana = Math.max(1, (gameState.player.maxMana || 50) + newMaxMana);
        } else {
            gameState.player.maxMana = Math.max(1, newMaxMana);
        }
        
        // Ensure current mana doesn't exceed new maximum
        gameState.player.mana = Math.min(gameState.player.mana || 0, gameState.player.maxMana);
        
        // Restore to full if requested
        if (restoreToFull) {
            gameState.player.mana = gameState.player.maxMana;
        }
        
        console.log(`Player max mana updated: ${gameState.player.mana}/${gameState.player.maxMana}`);
    }
    
    /**
     * Validate player health and mana values to ensure consistency
     * This should be called when entering any scene that displays player stats
     */
    static validatePlayerHealth() {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
        // Validate health values
        // Ensure maxHealth is set to a valid value
        if (!gameState.player.maxHealth || gameState.player.maxHealth <= 0) {
            console.warn('Invalid maxHealth detected, resetting to default');
            gameState.player.maxHealth = 100;
        }
        
        // Ensure health is initialized
        if (gameState.player.health === undefined || gameState.player.health === null) {
            console.warn('Health not initialized, setting to max');
            gameState.player.health = gameState.player.maxHealth;
        }
        
        // Ensure health doesn't exceed maximum
        if (gameState.player.health > gameState.player.maxHealth) {
            console.warn(`Health exceeds maximum (${gameState.player.health}/${gameState.player.maxHealth}), capping at max`);
            gameState.player.health = gameState.player.maxHealth;
        }
        
        // Ensure health isn't negative
        if (gameState.player.health < 0) {
            console.warn('Negative health detected, setting to 0');
            gameState.player.health = 0;
        }
        
        // Validate mana values
        // Ensure maxMana is set to a valid value
        if (!gameState.player.maxMana || gameState.player.maxMana <= 0) {
            console.warn('Invalid maxMana detected, resetting to default');
            gameState.player.maxMana = 50;
        }
        
        // Ensure mana is initialized
        if (gameState.player.mana === undefined || gameState.player.mana === null) {
            console.warn('Mana not initialized, setting to max');
            gameState.player.mana = gameState.player.maxMana;
        }
        
        // Ensure mana doesn't exceed maximum
        if (gameState.player.mana > gameState.player.maxMana) {
            console.warn(`Mana exceeds maximum (${gameState.player.mana}/${gameState.player.maxMana}), capping at max`);
            gameState.player.mana = gameState.player.maxMana;
        }
        
        // Ensure mana isn't negative
        if (gameState.player.mana < 0) {
            console.warn('Negative mana detected, setting to 0');
            gameState.player.mana = 0;
        }
        
        console.log(`Player stats validated: HP ${gameState.player.health}/${gameState.player.maxHealth}, MP ${gameState.player.mana}/${gameState.player.maxMana}`);
    }
    
    /**
     * Get player health percentage
     * @returns {number} Health percentage (0-1)
     */
    static getPlayerHealthPercentage() {
        if (!gameState.player || !gameState.player.maxHealth) {
            return 1;
        }
        
        return Math.max(0, Math.min(gameState.player.health / gameState.player.maxHealth, 1));
    }
    
    /**
     * Get player mana percentage
     * @returns {number} Mana percentage (0-1)
     */
    static getPlayerManaPercentage() {
        if (!gameState.player || !gameState.player.maxMana) {
            return 1;
        }
        
        return Math.max(0, Math.min(gameState.player.mana / gameState.player.maxMana, 1));
    }
    
    /**
     * Heal player by percentage
     * @param {number} percentage - Percentage to heal (0-1)
     */
    static healPlayerByPercentage(percentage) {
        if (!gameState.player || !gameState.player.maxHealth) {
            return;
        }
        
        const healAmount = Math.floor(gameState.player.maxHealth * percentage);
        this.updatePlayerHealth(healAmount, true);
    }
    
    /**
     * Restore player mana by percentage
     * @param {number} percentage - Percentage to restore (0-1)
     */
    static restorePlayerManaByPercentage(percentage) {
        if (!gameState.player || !gameState.player.maxMana) {
            return;
        }
        
        const manaAmount = Math.floor(gameState.player.maxMana * percentage);
        this.updatePlayerMana(manaAmount, true);
    }
    
    /**
     * Damage player by percentage
     * @param {number} percentage - Percentage to damage (0-1)
     */
    static damagePlayerByPercentage(percentage) {
        if (!gameState.player || !gameState.player.maxHealth) {
            return;
        }
        
        const damageAmount = Math.floor(gameState.player.maxHealth * percentage);
        this.updatePlayerHealth(-damageAmount, true);
    }
    
    /**
     * Consume player mana by percentage
     * @param {number} percentage - Percentage to consume (0-1)
     */
    static consumePlayerManaByPercentage(percentage) {
        if (!gameState.player || !gameState.player.maxMana) {
            return;
        }
        
        const manaAmount = Math.floor(gameState.player.maxMana * percentage);
        this.updatePlayerMana(-manaAmount, true);
    }
}

export default HealthManager;
