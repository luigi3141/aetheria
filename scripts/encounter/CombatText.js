/**
 * Handles text generation for combat events
 */
export default class CombatText {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Get attack message based on type
     * @param {string} attacker - Who is attacking ('player' or 'enemy')
     * @param {string} attackType - Type of attack
     * @param {number} damage - Amount of damage dealt
     * @param {boolean} isCritical - Whether the attack was a critical hit
     * @returns {string} Attack message
     */
    getAttackMessage(attacker, attackType, damage, isCritical = false) {
        const attackerName = attacker === 'player' ? 'You' : this.scene.enemies[0].name;
        const targetName = attacker === 'player' ? this.scene.enemies[0].name : 'you';
        
        let message = `${attackerName} `;
        
        if (attackType === 'special') {
            message += 'used a special attack on ';
        } else {
            message += 'attacked ';
        }
        
        message += `${targetName}`;
        
        if (isCritical) {
            message += ' (CRITICAL HIT!)';
        }
        
        message += ` for ${damage} damage!`;
        
        return message;
    }

    /**
     * Get a message for when a combatant is defeated
     * @param {string} defeated - Who was defeated ('player' or 'enemy')
     * @param {object} enemy - The enemy object (if an enemy was defeated)
     * @returns {string} Defeat message
     */
    getDefeatMessage(defeated, enemy = null) {
        if (defeated === 'player') {
            return 'You have been defeated!';
        } else {
            return `You defeated the ${enemy.name}!`;
        }
    }

    /**
     * Get a victory message
     * @param {object} enemy - The defeated enemy
     * @returns {string} Victory message
     */
    getVictoryMessage(enemy = null) {
        if (enemy) {
            return `Victory! You have defeated ${enemy.name}!`;
        }
        return 'Victory!';
    }

    /**
     * Get a message for item usage
     * @param {string} itemName - Name of the item
     * @param {string} effect - Effect of the item
     * @returns {string} Item usage message
     */
    getItemMessage(itemName, effect) {
        return `Used ${itemName}! ${effect}`;
    }

    /**
     * Get a random enemy dialogue text
     * @param {string} type - The type of dialogue ('attack', 'taunt', 'defeat', etc)
     * @param {object} enemy - The enemy object
     * @returns {string} A random dialogue text
     */
    getRandomEnemyText(type, enemy) {
        const dialogues = {
            attack: [
                `${enemy.name} prepares to strike!`,
                `${enemy.name} eyes you menacingly!`,
                `${enemy.name} moves to attack!`
            ],
            taunt: [
                `${enemy.name} laughs mockingly!`,
                `${enemy.name} growls threateningly!`,
                `${enemy.name} challenges you!`
            ],
            defeat: [
                `${enemy.name} staggers back!`,
                `${enemy.name} is weakening!`,
                `${enemy.name} looks wounded!`
            ]
        };
        
        const options = dialogues[type] || dialogues.attack;
        return options[Math.floor(Math.random() * options.length)];
    }
}
