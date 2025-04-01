// CombatEngine.js

import gameState from '../utils/gameState.js';
// We don't strictly need getAbilityData here anymore unless implementing enemy abilities
// import { getAbilityData } from '../data/enemies.js';
import HealthManager from '../utils/HealthManager.js';
// Import CharacterManager if needed to trigger stat recalculation on buffs/debuffs
// import CharacterManager from '../utils/CharacterManager.js';
import { processItemLoss } from '../utils/PenaltyManager.js'; // Import the new function
import navigationManager from '../navigation/NavigationManager.js';

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
        // HealthManager might not be needed if we update gameState directly
        // this.healthManager = new HealthManager();
    }

    setEnemies(enemies) {
        this.enemies = enemies;
        // Ensure enemies have currentDefense initialized if not done elsewhere
        this.enemies.forEach(enemy => {
            if (enemy.currentDefense === undefined) {
                enemy.currentDefense = enemy.defense || 0;
            }
             if (enemy.currentAttack === undefined) {
                 enemy.currentAttack = enemy.attack || 0;
             }
        });
    }

    startCombat() {
        // Ensure player stats are up-to-date before combat starts
        // This assumes CharacterManager exists and works
        if (typeof CharacterManager !== 'undefined' && CharacterManager.recalculatePlayerStats) {
             CharacterManager.recalculatePlayerStats();
        } else if (gameState.player && gameState.player.currentDefense === undefined) {
             // Fallback basic initialization if CharacterManager unavailable
             gameState.player.currentDefense = gameState.player.defense || 0;
             gameState.player.currentAttack = gameState.player.strength ? Math.floor(gameState.player.strength * 1.5) : 10;
             gameState.player.currentMagicAttack = gameState.player.intelligence ? Math.floor(gameState.player.intelligence * 1.2) : 10;
        }

        this.currentTurn = 'player';
        this.turnInProgress = false;
        this.gameOver = false;
        this.enablePlayerActions();
        this.scene.combatLog.addLogEntry("Combat started!", false, '#ffff00'); // Notify combat start
    }

    enablePlayerActions() {
        if (this.scene && this.scene.combatUI) { // Add safety check
            this.scene.combatUI.enableActionButtons();
        }
    }

    disablePlayerActions() {
         if (this.scene && this.scene.combatUI) { // Add safety check
            this.scene.combatUI.disableActionButtons();
        }
    }

    /**
     * Process a player attack on an enemy
     */
    processPlayerAttack(attackType = 'basic') {
        if (this.turnInProgress || this.gameOver) return;

        const player = gameState.player;
        const enemy = this.enemies[0]; // Assuming single enemy target for now

        if (!player || !enemy || enemy.health <= 0) {
            console.error('Invalid player or enemy state for attack.');
            return; // Exit if state is invalid
        }

        // --- Check Resources (e.g., Mana) ---
        let sufficientResources = true;
        if (attackType === 'special') { // Example check for special attack
            const manaCost = 10; // TODO: Get mana cost from ability data
            if (player.mana < manaCost) {
                this.scene.combatLog.addLogEntry("Not enough mana!", true, '#ffaaaa');
                sufficientResources = false;
                // Don't end turn here, let player choose another action
                return;
            }
             // Deduct resources ONLY if attack proceeds
             // gameState.player.mana -= manaCost; // Move deduction after damage calc
        }

        if (!sufficientResources) return; // Stop if resources insufficient

        this.turnInProgress = true;
        this.disablePlayerActions();

        // --- Calculate Damage ---
        // 1. Determine Base Attack Power
        let baseAttackPower = 0;
        if (attackType === 'special') {
            // TODO: Base this on the specific special ability being used
            // For now, use calculated magic attack
            baseAttackPower = player.currentMagicAttack || player.intelligence || 10;
        } else { // Basic attack
            baseAttackPower = player.currentAttack || player.strength || 10;
        }

        // 2. Apply Randomization (+/- 20%)
        const randomModifier = 1 + (Math.random() * 0.4 - 0.2); // Range: 0.8 to 1.2
        let randomizedRawDamage = Math.floor(baseAttackPower * randomModifier);

        // 3. Check for Critical Hit (Example: 10% chance, 1.5x damage)
        // TODO: Use player's crit chance stat
        let didCrit = false;
        if (Math.random() < 0.10) {
            randomizedRawDamage = Math.floor(randomizedRawDamage * 1.5);
            didCrit = true;
        }

        // 4. Get Target Defense
        const enemyDefense = enemy.currentDefense || 0;

        // 5. Apply Flat Defense Reduction (Minimum 1 Damage)
        const actualDamage = Math.max(1, randomizedRawDamage - enemyDefense);

        // --- Apply Effects ---
         // Deduct resources now that attack is confirmed
         if (attackType === 'special') {
            const manaCost = 10; // Example cost
            // Ensure mana doesn't go negative (should be checked earlier too)
            gameState.player.mana = Math.max(0, player.mana - manaCost);
            this.scene.combatUI.updatePlayerMana();
        }

        // Apply damage to enemy health
        enemy.health = Math.max(0, enemy.health - actualDamage);

        // --- Update UI and Log ---
        this.scene.combatUI.updateEnemyHealthBar(enemy);
        const message = this.scene.combatText.getAttackMessage('player', attackType, actualDamage, didCrit);
        this.scene.combatLog.addLogEntry(message, true); // Mark as player action for round count

        // --- Animation and Turn Progression ---
        // TODO: Add specific attack animations based on type
        this.scene.spriteManager.animateAttack('player', () => { // Simple animation placeholder
             if (enemy.health <= 0) {
                this.handleEnemyDefeat(enemy);
            } else {
                this.startEnemyTurn(); // Proceed to enemy turn
            }
        });
    }

    /**
     * Process an enemy attack on the player
     */
    processEnemyAttack(fromAnimation = false) {
        // Added check for gameOver at the start
        if (this.gameOver || !this.enemies.length || !gameState.player) return;

        // --- Enemy Action Selection (Currently only basic attack) ---
        const enemy = this.enemies[0]; // Assuming single enemy
        const attackType = 'basic'; // Defaulting to basic

        if (enemy.health <= 0) { // Double check enemy isn't already dead
             console.warn(`Enemy ${enemy.name} tried to attack while defeated.`);
             this.endEnemyTurn(); // Skip turn if enemy is dead
             return;
        }

        // Only trigger animation if this isn't being called from the animation completion
        if (!fromAnimation) {
            this.scene.processEnemyAttack();
            return;
        }

        // --- Calculate Damage ---
        // 1. Determine Base Attack Power
        let baseAttackPower = enemy.currentAttack || enemy.attack || 5; // Default to 5 if no attack stat

        // 2. Apply Randomization (+/- 20%)
        const randomModifier = 1 + (Math.random() * 0.4 - 0.2); // Range: 0.8 to 1.2
        let randomizedRawDamage = Math.floor(baseAttackPower * randomModifier);

        // 3. Check for Critical Hit (Optional for enemies)
        let didCrit = false;
        // if (Math.random() < 0.05) { // Lower crit chance for enemies?
        //     randomizedRawDamage = Math.floor(randomizedRawDamage * 1.5);
        //     didCrit = true;
        // }

        // 4. Get Target Defense (Player's defense)
        const playerDefense = gameState.player.currentDefense || 0;

        // 4. Apply Flat Defense Reduction (Minimum 1 Damage)
        const actualDamage = Math.max(1, randomizedRawDamage - playerDefense);

        // --- Apply Effects ---
        gameState.player.health = Math.max(0, gameState.player.health - actualDamage);

        // --- Update UI and Log ---
        this.scene.combatUI.updatePlayerHealth();
        const message = this.scene.combatText.getAttackMessage('enemy', attackType, actualDamage);
        this.scene.combatLog.addLogEntry(message, false); // Not player action

        // Check for player defeat
        if (gameState.player.health <= 0) {
            this.handlePlayerDefeat();
        } else {
            // End enemy turn if player survives
            this.endEnemyTurn();
        }
    }

    handleEnemyDefeat(enemy) {
        if (this.gameOver) return; // Prevent multiple triggers
        this.gameOver = true;
        this.disablePlayerActions(); // Ensure actions disabled

        // Log, animate, process victory (keep existing logic)
        this.scene.combatLog.addLogEntry(this.scene.combatText.getDefeatMessage('enemy', enemy), false, '#aaffaa'); // Green victory text
        this.scene.spriteManager.animateDefeat('enemy', () => {
             // Delay before transitioning to results
             this.scene.time.delayedCall(1000, () => {
                 if (this.scene && this.scene.scene.key === 'EncounterScene') { // Check if scene still active
                      this.scene.processVictory();
                 }
             });
        });
    }

    handlePlayerDefeat() {
        if (this.gameOver) return;
        this.gameOver = true;
        this.disablePlayerActions();

        // Log defeat
        this.scene.combatLog.addLogEntry(this.scene.combatText.getDefeatMessage('player'), false, '#ffaaaa');

        // --- >>> Process Item Loss on Defeat <<< ---
        const lostItems = processItemLoss(0.70); // 70% chance
        // --- >>> END Item Loss <<< ---

        // Animate defeat
        this.scene.spriteManager.animateDefeat('player', () => {
             this.scene.time.delayedCall(1500, () => {
                 if (this.scene && this.scene.scene.isActive()) { // Check if scene still active
                     // --- >>> Navigate to DefeatScene with Data <<< ---
                     console.log("[CombatEngine] Navigating to DefeatScene after player defeat.");
                     navigationManager.navigateTo(this.scene, 'DefeatScene', {
                          outcome: 'defeat',
                          lostItems: lostItems // Pass the array of lost item data
                     });
                     // --- >>> END Navigation <<< ---
                 }
             });
        });
    }

    processItemUse(item, callback) {
        // TODO: Needs significant update to use Item Database
        if (this.turnInProgress || this.gameOver) return;

        // Fetch item data
        const itemData = getItemData(item.id); // Assuming item has an 'id' property matching itemDatabase keys
        if (!itemData) {
            console.error(`Could not find item data for item:`, item);
            return; // Don't proceed, don't end turn
        }

        this.turnInProgress = true;
        this.disablePlayerActions();

        let success = false;
        let effectMessage = "";
        const player = gameState.player;

        // Handle based on item type or effect definition
        if (itemData.potionEffect) {
             const { stat, value } = itemData.potionEffect;
             if (stat === 'health') {
                 if (player.health < player.maxHealth) {
                    HealthManager.updatePlayerHealth(value, true);
                    effectMessage = `Healed for ${value} HP.`;
                    success = true;
                 } else { effectMessage = "Health already full!"; }
             } else if (stat === 'mana') {
                 if (player.mana < player.maxMana) {
                     HealthManager.updatePlayerMana(value, true);
                     effectMessage = `Restored ${value} MP.`;
                     success = true;
                 } else { effectMessage = "Mana already full!"; }
             } else {
                 effectMessage = "Unknown potion effect.";
             }
        } else {
             // Handle other item types (buffs, bombs, etc.) here
             effectMessage = "Item has no immediate effect in combat.";
        }

        this.scene.combatLog.addLogEntry(this.scene.combatText.getItemMessage(itemData.inGameName, effectMessage), true); // Player action

        if (success) {
            this.safePlaySound('heal'); // Use generic sound or item-specific sound
            // Remove ONE item from inventory
            const itemIndex = player.inventory.items.findIndex(invItem => invItem.itemId === item.id);
            if (itemIndex > -1) {
                 player.inventory.items[itemIndex].quantity = (player.inventory.items[itemIndex].quantity || 1) - 1;
                 if (player.inventory.items[itemIndex].quantity <= 0) {
                     player.inventory.items.splice(itemIndex, 1);
                 }
            }
            // Update UI
            this.scene.combatUI.updatePlayerHealth();
            this.scene.combatUI.updatePlayerMana();
        } else {
             // If not successful (e.g., HP full), don't consume item, re-enable actions? Or end turn?
             // For now, let's end the turn even if item wasn't usable.
        }

        if (callback) callback(); // e.g., close inventory menu

        // Proceed to enemy turn AFTER item use animation/delay
        this.scene.time.delayedCall(500, () => { // Short delay for effect
             this.startEnemyTurn();
        });
    }

    startEnemyTurn() {
        if (this.gameOver) return; // Check if combat ended during player turn/item use

        // Check if all enemies are defeated (redundant check, but safe)
        if (!this.enemies.some(enemy => enemy && enemy.health > 0)) {
            // Find the last enemy for the defeat message/logic
            const lastEnemy = this.enemies[this.enemies.length - 1] || {name:"Enemy"};
            this.handleEnemyDefeat(lastEnemy);
            return;
        }

        console.log("Starting Enemy Turn");
        this.currentTurn = 'enemy';
        this.turnInProgress = true; // Keep actions disabled

        // Add delay before enemy acts for pacing
        this.scene.time.delayedCall(1200, () => { // Increased delay
            if (this.gameOver) return; // Check again in case player conceded etc.
            // Start enemy attack with animation
            this.processEnemyAttack(false); // Start with animation
        });
    }

    // Added method to explicitly end the enemy turn and switch back to player
    endEnemyTurn() {
        if (this.gameOver) return; // Don't switch if game ended

        console.log("Ending Enemy Turn");
        this.currentTurn = 'player';
        this.turnInProgress = false;
        this.enablePlayerActions();
        // TODO: Process end-of-turn effects (like poison/regen) for the enemy here?
        this.scene.combatLog.addLogEntry("Your turn!", false, '#ffff00'); // Notify player
    }

    // Helper to safely play sounds
    safePlaySound(key, config = {}) {
        if (this.scene?.sound?.get(key)) {
            this.scene.sound.play(key, config);
        }
    }
}