/**
 * enemies.js
 * Contains data for all enemy types in the game
 */

const enemyData = {
    // Verdant Woods enemies
    "forest-goblin": {
        name: "Forest Goblin",
        sprite: "GOBLIN",
        level: 1,
        baseHealth: 25,
        baseAttack: 5,
        baseDefense: 2,
        abilities: ["slash", "taunt"],
        lootTable: {
            gold: { min: 5, max: 15 },
            experience: { min: 10, max: 20 },
            items: [
                { id: "goblin-tooth", chance: 0.3 },
                { id: "crude-dagger", chance: 0.1 }
            ]
        },
        description: "A small, green-skinned creature that inhabits the Verdant Woods."
    },
    "wolf": {
        name: "Forest Wolf",
        sprite: "WOLF",
        level: 2,
        baseHealth: 35,
        baseAttack: 8,
        baseDefense: 3,
        abilities: ["bite", "howl"],
        lootTable: {
            gold: { min: 8, max: 20 },
            experience: { min: 15, max: 25 },
            items: [
                { id: "wolf-pelt", chance: 0.4 },
                { id: "sharp-fang", chance: 0.2 }
            ]
        },
        description: "A fierce predator with sharp teeth and keen senses."
    },
    "forest-spider": {
        name: "Giant Spider",
        sprite: "SPIDER",
        level: 3,
        baseHealth: 40,
        baseAttack: 7,
        baseDefense: 4,
        abilities: ["poison-bite", "web"],
        lootTable: {
            gold: { min: 10, max: 25 },
            experience: { min: 20, max: 30 },
            items: [
                { id: "spider-silk", chance: 0.5 },
                { id: "venom-sac", chance: 0.3 }
            ]
        },
        description: "A large arachnid that spins webs between the trees of the forest."
    },
    
    // New Verdant Woods enemies
    "forest-bandit": {
        name: "Forest Bandit",
        sprite: "BANDIT",
        level: 3,
        baseHealth: 45,
        baseAttack: 9,
        baseDefense: 5,
        abilities: ["slash", "steal", "quick-shot"],
        lootTable: {
            gold: { min: 15, max: 30 },
            experience: { min: 25, max: 35 },
            items: [
                { id: "leather-scraps", chance: 0.4 },
                { id: "short-bow", chance: 0.15 },
                { id: "stolen-goods", chance: 0.25 }
            ]
        },
        description: "An outlaw who preys on travelers passing through the forest."
    },
    "mushroom-creature": {
        name: "Myconid",
        sprite: "MUSHROOM",
        level: 2,
        baseHealth: 30,
        baseAttack: 6,
        baseDefense: 7,
        abilities: ["spore-cloud", "root-grab"],
        lootTable: {
            gold: { min: 5, max: 15 },
            experience: { min: 15, max: 25 },
            items: [
                { id: "glowing-spores", chance: 0.6 },
                { id: "healing-cap", chance: 0.3 }
            ]
        },
        description: "A sentient fungus creature that defends its territory with toxic spores."
    },
    
    // Crystal Caverns enemies
    "cave-bat": {
        name: "Crystal Bat",
        sprite: "BAT",
        level: 4,
        baseHealth: 30,
        baseAttack: 10,
        baseDefense: 3,
        abilities: ["sonic-screech", "dive-attack"],
        lootTable: {
            gold: { min: 10, max: 20 },
            experience: { min: 20, max: 30 },
            items: [
                { id: "bat-wing", chance: 0.5 },
                { id: "echo-crystal", chance: 0.2 }
            ]
        },
        description: "A bat with crystalline growths on its wings that emits disorienting sonic pulses."
    },
    "crystal-golem": {
        name: "Crystal Golem",
        sprite: "CRYSTAL",
        level: 6,
        baseHealth: 80,
        baseAttack: 12,
        baseDefense: 10,
        abilities: ["crystal-smash", "reflect-light", "harden"],
        lootTable: {
            gold: { min: 30, max: 60 },
            experience: { min: 50, max: 70 },
            items: [
                { id: "crystal-shard", chance: 0.7 },
                { id: "golem-core", chance: 0.3 }
            ]
        },
        description: "A lumbering construct formed from living crystal that absorbs and reflects light."
    },
    "miner-ghost": {
        name: "Spectral Miner",
        sprite: "GHOST",
        level: 5,
        baseHealth: 45,
        baseAttack: 15,
        baseDefense: 2,
        abilities: ["ghostly-pickaxe", "terrifying-wail", "phase"],
        lootTable: {
            gold: { min: 40, max: 70 },
            experience: { min: 40, max: 60 },
            items: [
                { id: "spectral-dust", chance: 0.4 },
                { id: "phantom-gem", chance: 0.2 },
                { id: "rusted-pickaxe", chance: 0.3 }
            ]
        },
        description: "The restless spirit of a miner who died in a cave-in, still searching for precious gems."
    },
    
    // Bosses
    "goblin-chief": {
        name: "Goblin Chieftain",
        sprite: "GOBLIN-CHIEFTAIN",
        level: 5,
        baseHealth: 100,
        baseAttack: 12,
        baseDefense: 8,
        abilities: ["cleave", "rally", "throw-rock"],
        lootTable: {
            gold: { min: 50, max: 100 },
            experience: { min: 100, max: 150 },
            items: [
                { id: "chieftain-club", chance: 0.8 },
                { id: "goblin-totem", chance: 0.5 },
                { id: "forest-key", chance: 1.0 }
            ]
        },
        isBoss: true,
        description: "The leader of the goblin tribe in the Verdant Woods. Larger and smarter than his followers."
    },
    "crystal-queen": {
        name: "Crystal Queen",
        sprite: "CRYSTAL-QUEEN",
        level: 8,
        baseHealth: 150,
        baseAttack: 18,
        baseDefense: 12,
        abilities: ["crystal-storm", "summon-shard", "blinding-light", "crystal-heal"],
        lootTable: {
            gold: { min: 100, max: 200 },
            experience: { min: 200, max: 300 },
            items: [
                { id: "queen-crystal", chance: 0.9 },
                { id: "crown-shard", chance: 0.6 },
                { id: "cavern-key", chance: 1.0 }
            ]
        },
        isBoss: true,
        description: "A majestic and deadly entity formed from the purest crystals in the cavern depths."
    }
};

// Ability definitions
const abilityDefinitions = {
    // Basic abilities
    "slash": {
        name: "Slash",
        type: "attack",
        damageMultiplier: 1.0,
        description: "A basic slashing attack"
    },
    "bite": {
        name: "Bite",
        type: "attack",
        damageMultiplier: 1.2,
        statusEffect: { type: "bleed", chance: 0.3, duration: 2 },
        description: "A powerful bite that may cause bleeding"
    },
    "taunt": {
        name: "Taunt",
        type: "debuff",
        effect: { type: "attack", value: -2, duration: 2 },
        description: "Taunts the opponent, lowering their attack"
    },
    "howl": {
        name: "Howl",
        type: "buff",
        effect: { type: "attack", value: 3, duration: 2 },
        description: "A howl that increases attack power"
    },
    "poison-bite": {
        name: "Poison Bite",
        type: "attack",
        damageMultiplier: 0.8,
        statusEffect: { type: "poison", chance: 0.5, damage: 3, duration: 3 },
        description: "A venomous bite that may poison the target"
    },
    "web": {
        name: "Web",
        type: "debuff",
        effect: { type: "speed", value: -5, duration: 2 },
        statusEffect: { type: "immobilize", chance: 0.3, duration: 1 },
        description: "Shoots a web that slows the target and may immobilize them"
    },
    
    // Player abilities by class
    // Warrior abilities
    "cleave": {
        name: "Cleave",
        type: "attack",
        damageMultiplier: 1.3,
        areaEffect: true,
        manaCost: 15,
        description: "A sweeping attack that hits all enemies"
    },
    "shield-bash": {
        name: "Shield Bash",
        type: "attack",
        damageMultiplier: 0.8,
        statusEffect: { type: "stun", chance: 0.6, duration: 1 },
        manaCost: 20,
        description: "Bash with your shield, potentially stunning the target"
    },
    "battle-cry": {
        name: "Battle Cry",
        type: "buff",
        effect: { type: "attack", value: 5, duration: 3 },
        manaCost: 25,
        description: "A powerful cry that increases your attack power"
    },
    
    // Mage abilities
    "fireball": {
        name: "Fireball",
        type: "attack",
        damageMultiplier: 1.5,
        statusEffect: { type: "burn", chance: 0.4, damage: 3, duration: 2 },
        manaCost: 20,
        description: "Hurl a ball of fire that may burn the target"
    },
    "ice-spike": {
        name: "Ice Spike",
        type: "attack",
        damageMultiplier: 1.2,
        statusEffect: { type: "freeze", chance: 0.3, duration: 1 },
        manaCost: 15,
        description: "Launch a spike of ice that may freeze the target"
    },
    "arcane-missiles": {
        name: "Arcane Missiles",
        type: "attack",
        damageMultiplier: 0.5,
        hits: 3,
        manaCost: 25,
        description: "Fire multiple arcane missiles at the target"
    },
    
    // Rogue abilities
    "backstab": {
        name: "Backstab",
        type: "attack",
        damageMultiplier: 2.0,
        critChance: 0.3,
        critMultiplier: 1.5,
        manaCost: 15,
        description: "A deadly strike from behind with high critical chance"
    },
    "poison-strike": {
        name: "Poison Strike",
        type: "attack",
        damageMultiplier: 0.8,
        statusEffect: { type: "poison", chance: 0.8, damage: 5, duration: 3 },
        manaCost: 20,
        description: "Coat your blade with poison for a venomous strike"
    },
    "shadow-step": {
        name: "Shadow Step",
        type: "buff",
        effect: { type: "dodge", value: 50, duration: 2 },
        manaCost: 25,
        description: "Step through the shadows, greatly increasing dodge chance"
    },
    
    // Cleric abilities
    "smite": {
        name: "Smite",
        type: "attack",
        damageMultiplier: 1.3,
        extraDamageToUndead: 1.5,
        manaCost: 15,
        description: "A holy attack that deals extra damage to undead"
    },
    "healing-word": {
        name: "Healing Word",
        type: "heal",
        healAmount: 30,
        scaling: {
            attribute: "wisdom",
            factor: 0.7
        },
        manaCost: 20,
        description: "A prayer that heals your wounds"
    },
    "divine-protection": {
        name: "Divine Protection",
        type: "buff",
        effect: { type: "defense", value: 10, duration: 3 },
        manaCost: 25,
        description: "Divine energy protects you, increasing defense"
    },
    
    // New abilities
    "spore-cloud": {
        name: "Spore Cloud",
        type: "attack",
        damageMultiplier: 0.7,
        areaEffect: true,
        statusEffect: { type: "poison", chance: 0.7, damage: 2, duration: 3 },
        description: "Releases a cloud of toxic spores that poison all enemies"
    },
    "root-grab": {
        name: "Root Grab",
        type: "attack",
        damageMultiplier: 0.9,
        statusEffect: { type: "immobilize", chance: 0.6, duration: 2 },
        description: "Underground roots grab the target, dealing damage and potentially immobilizing them"
    },
    "steal": {
        name: "Steal",
        type: "special",
        stealGold: { min: 5, max: 15, chance: 0.5 },
        description: "Attempts to steal gold from the target"
    },
    "quick-shot": {
        name: "Quick Shot",
        type: "attack",
        damageMultiplier: 0.8,
        priority: true,
        description: "A fast arrow shot that always strikes first"
    },
    "sonic-screech": {
        name: "Sonic Screech",
        type: "debuff",
        areaEffect: true,
        effect: { type: "defense", value: -3, duration: 2 },
        description: "A high-pitched screech that lowers defense of all enemies"
    },
    "dive-attack": {
        name: "Dive Attack",
        type: "attack",
        damageMultiplier: 1.3,
        cooldown: 2,
        description: "A powerful diving attack with a cooldown period"
    },
    "crystal-smash": {
        name: "Crystal Smash",
        type: "attack",
        damageMultiplier: 1.5,
        cooldown: 3,
        description: "Smashes crystals into the target for heavy damage"
    },
    "reflect-light": {
        name: "Reflect Light",
        type: "special",
        reflectDamage: { chance: 0.7, percent: 0.3 },
        duration: 2,
        description: "Reflects a portion of incoming damage back to the attacker"
    },
    "harden": {
        name: "Harden",
        type: "buff",
        effect: { type: "defense", value: 5, duration: 3 },
        description: "Hardens crystal skin to increase defense"
    },
    "ghostly-pickaxe": {
        name: "Ghostly Pickaxe",
        type: "attack",
        damageMultiplier: 1.2,
        armorPiercing: 0.3,
        description: "A spectral pickaxe that ignores a portion of defense"
    },
    "terrifying-wail": {
        name: "Terrifying Wail",
        type: "debuff",
        effect: { type: "attack", value: -4, duration: 2 },
        statusEffect: { type: "fear", chance: 0.4, duration: 1 },
        description: "A horrifying scream that lowers attack and may cause fear"
    },
    "phase": {
        name: "Phase",
        type: "special",
        dodgeChance: 1.0,
        duration: 1,
        cooldown: 4,
        description: "Becomes intangible, completely avoiding the next attack"
    },
    
    // Boss abilities
    "cleave": {
        name: "Cleave",
        type: "attack",
        damageMultiplier: 1.3,
        areaEffect: true,
        description: "A wide sweeping attack that hits all enemies"
    },
    "rally": {
        name: "Rally Minions",
        type: "special",
        summon: { type: "forest-goblin", count: { min: 1, max: 2 } },
        cooldown: 4,
        description: "Calls for goblin reinforcements"
    },
    "throw-rock": {
        name: "Throw Rock",
        type: "attack",
        damageMultiplier: 1.1,
        statusEffect: { type: "stun", chance: 0.3, duration: 1 },
        description: "Throws a large rock that may stun the target"
    },
    "crystal-storm": {
        name: "Crystal Storm",
        type: "attack",
        damageMultiplier: 1.4,
        areaEffect: true,
        statusEffect: { type: "bleed", chance: 0.5, duration: 2 },
        cooldown: 3,
        description: "Unleashes a storm of crystal shards that damage all enemies and may cause bleeding"
    },
    "summon-shard": {
        name: "Summon Crystal Shard",
        type: "special",
        summon: { type: "crystal-golem", count: { min: 1, max: 1 } },
        cooldown: 5,
        description: "Summons a crystal golem to fight alongside the queen"
    },
    "blinding-light": {
        name: "Blinding Light",
        type: "debuff",
        areaEffect: true,
        effect: { type: "accuracy", value: -50, duration: 2 },
        cooldown: 4,
        description: "Emits a blinding light that severely reduces accuracy"
    },
    "crystal-heal": {
        name: "Crystal Regeneration",
        type: "heal",
        healPercent: 0.2,
        cooldown: 3,
        description: "Absorbs energy from nearby crystals to heal wounds"
    }
};

/**
 * Get enemy data by ID
 * @param {string} enemyId - The ID of the enemy
 * @returns {object} - The enemy data object
 */
function getEnemyData(enemyId) {
    const enemy = enemyData[enemyId];
    if (!enemy) {
        console.warn(`Enemy data not found for ID: ${enemyId}`);
        return enemyData['wolf']; // Default to wolf if enemy not found
    }
    return {
        ...enemy,
        maxHealth: enemy.baseHealth
    };
}

/**
 * Get ability data by ID
 * @param {string} abilityId - The ID of the ability
 * @returns {object} - The ability data object
 */
function getAbilityData(abilityId) {
    return abilityDefinitions[abilityId] || null;
}

/**
 * Generate an enemy instance based on enemy ID and level
 * @param {string} enemyId - The ID of the enemy
 * @param {number} levelModifier - Optional level modifier (default: 0)
 * @returns {object} - An enemy instance with calculated stats
 */
function generateEnemy(enemyId, levelModifier = 0) {
    const baseData = getEnemyData(enemyId);
    
    if (!baseData) {
        console.error(`Enemy with ID ${enemyId} not found!`);
        return null;
    }
    
    const level = baseData.level + levelModifier;
    const levelMultiplier = 1 + (level - 1) * 0.2;
    
    // Calculate stats based on level
    const health = Math.floor(baseData.baseHealth * levelMultiplier);
    const attack = Math.floor(baseData.baseAttack * levelMultiplier);
    const defense = Math.floor(baseData.baseDefense * levelMultiplier);
    
    // Process abilities to include their full definitions
    const abilities = [];
    if (baseData.abilities && baseData.abilities.length > 0) {
        baseData.abilities.forEach(abilityId => {
            const abilityData = getAbilityData(abilityId);
            if (abilityData) {
                abilities.push({
                    id: abilityId,
                    ...abilityData,
                    cooldownRemaining: 0
                });
            }
        });
    }
    
    return {
        id: enemyId,
        name: baseData.name,
        sprite: baseData.sprite,
        level: level,
        health: health,
        maxHealth: health,
        attack: attack,
        defense: defense,
        abilities: abilities,
        isBoss: baseData.isBoss || false,
        description: baseData.description,
        lootTable: { ...baseData.lootTable },
        statusEffects: []
    };
}

/**
 * Get enemies appropriate for a dungeon level
 * @param {string} dungeonId - The ID of the dungeon
 * @param {number} dungeonLevel - The level of the dungeon
 * @param {number} count - Number of enemies to generate
 * @returns {array} - Array of enemy objects
 */
function getDungeonEnemies(dungeonId, dungeonLevel, count = 1) {
    let possibleEnemies = [];
    
    // Match enemies to dungeon
    switch (dungeonId) {
        case 'verdant-woods':
            if (dungeonLevel <= 3) {
                possibleEnemies = ['forest-goblin', 'wolf', 'forest-spider', 'mushroom-creature'];
            } else {
                possibleEnemies = ['wolf', 'forest-spider', 'forest-bandit', 'mushroom-creature'];
            }
            break;
        case 'crystal-caverns':
            possibleEnemies = ['cave-bat', 'crystal-golem', 'miner-ghost'];
            break;
        default:
            // Default fallback - create simple enemies based on level
            return createDefaultEnemies(dungeonLevel, count);
    }
    
    const enemies = [];
    const levelVariance = Math.max(1, Math.floor(dungeonLevel / 2));
    
    for (let i = 0; i < count; i++) {
        // Select a random enemy type
        const enemyId = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
        
        // Add some level variance
        const levelMod = Math.floor(Math.random() * levelVariance);
        
        // Generate the enemy and add to array
        try {
            const enemy = generateEnemy(enemyId, levelMod);
            if (enemy) {
                enemies.push(enemy);
            }
        } catch (error) {
            console.error(`Error generating enemy ${enemyId}:`, error);
            // Add a default enemy as fallback
            enemies.push(createDefaultEnemy(dungeonLevel));
        }
    }
    
    // If no enemies were successfully created, return default ones
    if (enemies.length === 0) {
        return createDefaultEnemies(dungeonLevel, count);
    }
    
    return enemies;
}

/**
 * Create default enemies when specific enemy generation fails
 * @param {number} level - The level for the enemies
 * @param {number} count - Number of enemies to generate
 * @returns {array} - Array of default enemy objects
 */
function createDefaultEnemies(level, count) {
    const enemies = [];
    for (let i = 0; i < count; i++) {
        enemies.push(createDefaultEnemy(level));
    }
    return enemies;
}

/**
 * Create a default enemy with basic properties
 * @param {number} level - The level for the enemy
 * @returns {object} - A default enemy object
 */
function createDefaultEnemy(level) {
    const types = ['Wolf', 'Bandit', 'Spider', 'Goblin'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
        name: `Forest ${type}`,
        level: level,
        health: 20 + (level * 5),
        maxHealth: 20 + (level * 5),
        damage: 5 + level,
        defense: 2,
        sprite: `${type.toLowerCase()}-sprite`,
        abilities: ['attack', 'defend']
    };
}

/**
 * Generate loot from an enemy
 * @param {object|array} enemies - The enemy object or array of enemies
 * @returns {object} - Loot object containing gold, experience, and items
 */
function generateLoot(enemies) {
    // Convert single enemy to array for consistent processing
    const enemyArray = Array.isArray(enemies) ? enemies : [enemies];
    
    if (!enemyArray || enemyArray.length === 0) {
        return { gold: 0, experience: 0, items: [] };
    }
    
    const loot = {
        gold: 0,
        experience: 0,
        items: []
    };
    
    // Process each enemy's loot
    enemyArray.forEach(enemy => {
        if (!enemy || !enemy.lootTable) return;
        
        const lootTable = enemy.lootTable;
        
        // Add gold
        loot.gold += Math.floor(Math.random() * (lootTable.gold.max - lootTable.gold.min + 1)) + lootTable.gold.min;
        
        // Add experience
        loot.experience += Math.floor(Math.random() * (lootTable.experience.max - lootTable.experience.min + 1)) + lootTable.experience.min;
        
        // Roll for items
        if (lootTable.items && lootTable.items.length > 0) {
            lootTable.items.forEach(itemDrop => {
                if (Math.random() < itemDrop.chance) {
                    loot.items.push(itemDrop.id);
                }
            });
        }
    });
    
    return loot;
}

/**
 * Get boss for a dungeon
 * @param {string} dungeonId - The ID of the dungeon
 * @param {number} dungeonLevel - The level of the dungeon
 * @returns {object} - Boss enemy object
 */
function getDungeonBoss(dungeonId, dungeonLevel) {
    let bossId;
    
    // Match boss to dungeon
    switch (dungeonId) {
        case 'verdant-woods':
            if (dungeonLevel <= 5) {
                bossId = 'goblin-chief';
            } else {
                bossId = 'alpha-wolf';
            }
            break;
        case 'crystal-caverns':
            bossId = 'crystal-guardian';
            break;
        default:
            // Return default boss if no dungeon match
            return createDefaultBoss(dungeonLevel);
    }
    
    try {
        // Generate boss with higher level
        const boss = generateEnemy(bossId, 2); // Boss is 2 levels higher
        
        if (boss) {
            // Add boss properties
            boss.isBoss = true;
            boss.maxHealth *= 1.5; // 50% more health
            boss.health = boss.maxHealth;
            
            return boss;
        }
    } catch (error) {
        console.error(`Error generating boss ${bossId}:`, error);
    }
    
    // Return default boss if generation failed
    return createDefaultBoss(dungeonLevel);
}

/**
 * Create a default boss with basic properties
 * @param {number} level - The level for the boss
 * @returns {object} - A default boss object
 */
function createDefaultBoss(level) {
    const types = ['Alpha Wolf', 'Bandit Chief', 'Spider Queen', 'Goblin King'];
    const type = types[Math.floor(Math.random() * types.length)];
    const bossLevel = level + 2;
    
    return {
        name: type,
        level: bossLevel,
        health: 50 + (bossLevel * 10),
        maxHealth: 50 + (bossLevel * 10),
        damage: 8 + (bossLevel * 2),
        defense: 4,
        sprite: `${type.toLowerCase().replace(' ', '-')}-sprite`,
        isBoss: true,
        abilities: ['power-attack', 'heal', 'taunt']
    };
}

/**
 * Apply a status effect to a target
 * @param {object} target - The target object (player or enemy)
 * @param {object} statusEffect - The status effect to apply
 */
function applyStatusEffect(target, statusEffect) {
    // Check if effect should be applied based on chance
    if (statusEffect.chance && Math.random() > statusEffect.chance) {
        return false; // Effect failed to apply
    }
    
    // Add effect to target's status effects array
    if (!target.statusEffects) {
        target.statusEffects = [];
    }
    
    // Check if this effect already exists and update it instead of adding a new one
    const existingEffectIndex = target.statusEffects.findIndex(effect => effect.type === statusEffect.type);
    
    if (existingEffectIndex >= 0) {
        // Update existing effect
        target.statusEffects[existingEffectIndex] = {
            ...statusEffect,
            remainingDuration: statusEffect.duration
        };
    } else {
        // Add new effect
        target.statusEffects.push({
            ...statusEffect,
            remainingDuration: statusEffect.duration
        });
    }
    
    return true; // Effect applied successfully
}

export { 
    getEnemyData,
    getAbilityData,
    generateLoot,
    applyStatusEffect,
    getDungeonBoss,
    getDungeonEnemies,
    enemyData,
    abilityDefinitions
};
