import gameState from '../gameState.js';

/**
 * HealthManager - Utility for managing player health consistently across scenes
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
     * Validate player health values to ensure consistency
     * This should be called when entering any scene that displays player health
     */
    static validatePlayerHealth() {
        // Ensure gameState is initialized
        if (!gameState.player) {
            console.error('Player state not initialized');
            return;
        }
        
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
        
        console.log(`Player health validated: ${gameState.player.health}/${gameState.player.maxHealth}`);
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
}

export default HealthManager;
