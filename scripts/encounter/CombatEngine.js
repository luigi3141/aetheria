import gameState from '../gameState.js';
import { getAbilityData } from '../data/enemies.js';
import HealthManager from '../utils/HealthManager.js';

/**
 * Handles combat mechanics and turn management
 */
export default class CombatEngine {
    constructor(scene) {
        this.scene = scene;
        this.enemies = [];
        this.currentTurn = 'player';
        this.turnInProgress = false;
        this.gameOver = false;
        this.healthManager = new HealthManager();
    }
    
    /**
     * Sets the enemies for the encounter
     */
    setEnemies(enemies) {
        this.enemies = enemies;
    }
    
    /**
     * Start combat and initialize turn tracking
     */
    startCombat() {
        this.currentTurn = 'player';
        this.turnInProgress = false;
        this.gameOver = false;
        this.enablePlayerActions();
    }
    
    /**
     * Enable player action buttons
     */
    enablePlayerActions() {
        this.scene.combatUI.enableActionButtons();
    }
    
    /**
     * Disable player action buttons
     */
    disablePlayerActions() {
        this.scene.combatUI.disableActionButtons();
    }
    
    /**
     * Process a player attack on an enemy
     */
    processPlayerAttack(attackType = 'basic') {
        if (this.turnInProgress || this.gameOver) return;
        
        // Check mana cost for special attacks
        if (attackType === 'special') {
            const manaCost = 10; // Default mana cost for special attacks
            if (gameState.player.mana < manaCost) {
                this.scene.combatLog.addLogEntry("Not enough mana for special attack!");
                return;
            }
            gameState.player.mana -= manaCost;
            this.scene.combatUI.updatePlayerMana(); 
        }
        
        this.turnInProgress = true;
        this.disablePlayerActions();
        
        // Get active enemy
        const enemy = this.enemies[0];
        if (!enemy || enemy.health <= 0) {
            console.error('No valid enemy to attack');
            this.turnInProgress = false;
            this.enablePlayerActions();
            return;
        }
        
        // Calculate damage
        let damage = this.calculatePlayerDamage(attackType);
        let didCrit = false;
        
        // Check for critical hit (20% chance)
        if (Math.random() < 0.2) {
            damage *= 1.5;
            didCrit = true;
        }
        
        // Apply damage
        enemy.health = Math.max(0, enemy.health - damage);
        
        // Update enemy health display
        this.scene.combatUI.updateEnemyHealthBar(enemy);
        
        // Add combat log entry
        const message = this.scene.combatText.getAttackMessage('player', attackType, damage, didCrit);
        this.scene.combatLog.addLogEntry(message);
        
        // Play attack animation and sound
        this.scene.spriteManager.animateAttack('player', () => {
            // Check if enemy is defeated
            if (enemy.health <= 0) {
                this.handleEnemyDefeat(enemy);
            } else {
                // Start enemy turn
                this.scene.time.delayedCall(1000, () => {
                    this.startEnemyTurn();
                });
            }
        });
    }
    
    /**
     * Process an enemy attack on the player
     */
    processEnemyAttack() {
        const enemy = this.enemies[0];
        if (!enemy || enemy.health <= 0) return;
        
        // Calculate damage
        const damage = this.calculateEnemyDamage();
        
        // Apply damage to player
        const player = gameState.player;
        player.health = Math.max(0, player.health - damage);
        
        // Update player health display
        this.scene.combatUI.updatePlayerHealth();
        
        // Add combat log entry
        const message = this.scene.combatText.getAttackMessage('enemy', 'basic', damage);
        this.scene.combatLog.addLogEntry(message);
        
        // Play attack animation and sound
        this.scene.spriteManager.animateAttack('enemy', () => {
            // Check if player is defeated
            if (player.health <= 0) {
                this.handlePlayerDefeat();
            } else {
                this.turnInProgress = false;
                this.currentTurn = 'player';
                this.enablePlayerActions();
            }
        });
    }
    
    /**
     * Calculate damage for player attacks
     */
    calculatePlayerDamage(attackType = 'basic') {
        const player = gameState.player;
        const baseDamage = attackType === 'special' ? 15 : 10;
        const levelBonus = (player.level || 1) * 2;
        return baseDamage + levelBonus;
    }
    
    /**
     * Calculate damage for enemy attacks
     */
    calculateEnemyDamage() {
        const enemy = this.enemies[0];
        const baseDamage = enemy.damage || 5;
        return baseDamage + (enemy.level || 1);
    }
    
    /**
     * Handle defeating an enemy
     */
    handleEnemyDefeat(enemy) {
        // Mark game as over
        this.gameOver = true;
        
        // Log victory
        this.scene.combatLog.addLogEntry(this.scene.combatText.getDefeatMessage('enemy', enemy));
        
        // Animate defeat
        this.scene.spriteManager.animateDefeat('enemy', () => {
            this.scene.processVictory();
        });
    }
    
    /**
     * Handle player defeat
     */
    handlePlayerDefeat() {
        this.gameOver = true;
        this.scene.combatLog.addLogEntry(this.scene.combatText.getDefeatMessage('player'));
        this.scene.spriteManager.animateDefeat('player', () => {
            this.scene.handleDefeat();
        });
    }
    
    /**
     * Process item use
     */
    processItemUse(item, callback) {
        const player = gameState.player;
        
        switch (item.type) {
            case 'heal':
                const healAmount = item.value || 20;
                player.health = Math.min(player.maxHealth, player.health + healAmount);
                this.scene.combatUI.updatePlayerHealth();
                this.scene.combatLog.addLogEntry(this.scene.combatText.getItemMessage(item.name, `Healed for ${healAmount}`));
                this.scene.spriteManager.animateHeal('player');
                break;
                
            case 'mana':
                const manaAmount = item.value || 20;
                player.mana = Math.min(player.maxMana, player.mana + manaAmount);
                this.scene.combatUI.updatePlayerMana();
                this.scene.combatLog.addLogEntry(this.scene.combatText.getItemMessage(item.name, `Restored ${manaAmount} mana`));
                this.scene.spriteManager.animateHeal('player', 0x0066ff);
                break;
        }
        
        // Remove item from inventory
        const itemIndex = player.inventory.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
            player.inventory.splice(itemIndex, 1);
        }
        
        if (callback) callback();
    }
    
    /**
     * Start enemy turn
     */
    startEnemyTurn() {
        // Check if all enemies are defeated
        if (this.enemies.every(enemy => enemy.defeated || enemy.health <= 0)) {
            this.handleEnemyDefeat(this.enemies[0]);
            return;
        }
        
        this.currentTurn = 'enemy';
        this.turnInProgress = true;
        
        // Process enemy action after a delay
        this.scene.time.delayedCall(1000, () => {
            this.processEnemyAttack();
        });
    }
}
