/**
 * enemies.js
 * Contains data for all enemy types in the game and functions to manage them.
 */

// --- ENEMY DATA DEFINITIONS ---

const enemyData = {
    // == Verdant Woods enemies ==
    "forest-goblin": {
        name: "Forest Goblin",
        sprite: "GOBLIN",
        level: 1,
        baseHealth: 30,
        baseAttack: 7,
        baseDefense: 2,
        abilities: ["slash", "taunt"],
        lootTable: {
            gold: { min: 5, max: 5 },
            experience: { min: 10, max: 10 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "goblin-leather", chance: 0.5 }, // Tier 1
                { id: "goblin-teeth", chance: 0.25 },   // Tier 1
                { id: "goblin-sinew", chance: 0.25}    // Tier 1
            ]
        },
        description: "A small, green-skinned creature that inhabits the Verdant Woods."
    },
    "wolf": {
        name: "Forest Wolf",
        sprite: "WOLF",
        level: 2,
        baseHealth: 40,
        baseAttack: 9,
        baseDefense: 3,
        abilities: ["bite", "howl"],
        lootTable: {
            gold: { min: 10, max: 10 },
            experience: { min: 20, max: 20 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "wolf-pelt", chance: 0.25 },  // Tier 1
                { id: "wolf-claws", chance: 0.5 }, // Tier 1
                { id: "wolf-sinew", chance: 0.25}  // Tier 1
            ]
        },
        description: "A fierce predator with sharp teeth and keen senses."
    },
    "forest-spider": {
        name: "Giant Spider",
        sprite: "SPIDER",
        level: 2,
        baseHealth: 40,
        baseAttack: 9,
        baseDefense: 3,
        abilities: ["poison-bite", "web"],
        lootTable: {
            gold: { min: 10, max: 10 },
            experience: { min: 20, max: 20 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "spider-silk", chance: 0.25 },     // Tier 1
                { id: "spider-carapace", chance: 0.25 }, // Tier 1
                { id: "spider-fang", chance: 0.5 }      // Tier 1
            ]
        },
        description: "A large arachnid that spins webs between the trees of the forest."
    },
    "forest-bandit": {
        name: "Forest Bandit",
        sprite: "BANDIT",
        level: 3,
        baseHealth: 50,
        baseAttack: 11,
        baseDefense: 5,
        abilities: ["slash", "steal", "quick-shot"],
        lootTable: {
            gold: { min: 15, max: 15 },
            experience: { min: 30, max: 30 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "bandit-armour", chance: 0.5}, // Tier 2
                { id: "bandit-dagger", chance: 0.5}  // Tier 2
                // Note: The original 'leather-scraps', 'short-bow', 'stolen-goods' were removed as per the provided table. Add back if needed.
            ]
        },
        description: "An outlaw who preys on travelers passing through the forest."
    },
    "mushroom-creature": {
        name: "Myconid",
        sprite: "MUSHROOM",
        level: 4,
        baseHealth: 60,
        baseAttack: 13,
        baseDefense: 6,
        abilities: ["spore-cloud", "root-grab"],
        lootTable: {
            gold: { min: 20, max: 20 },
            experience: { min: 40, max: 40 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "mushroom-hide", chance: 0.25 }, // Tier 2
                { id: "mushroom-arms", chance: 0.5 }, // Tier 2
                { id: "mushroom-sinew", chance: 0.25 } // Tier 2
                // Note: Original 'glowing-spores', 'healing-cap' removed.
            ]
        },
        description: "A sentient fungus creature that defends its territory with toxic spores."
    },
    "wild-boar": {
        name: "Wild Boar",
        sprite: "BOAR", // Add to AssetConfig.js
        level: 4,
        baseHealth: 60,
        baseAttack: 13,
        baseDefense: 6,
        abilities: ["charge", "tough-hide"],
        lootTable: {
            gold: { min: 20, max: 20 },
            experience: { min: 40, max: 40 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "wild-boar-pelt", chance: 0.25}, // Tier 2
                { id: "wild-boar-fang", chance: 0.5 }, // Tier 2
                { id: "wild-boar-sinew", chance: 0.25 } // Tier 2
            ]
        },
        description: "A stubborn and aggressive boar that uses brute force to defend its territory."
    },
    "thorn-lurker": {
        name: "Thorn Lurker",
        sprite: "THORN_LURKER", // Add to AssetConfig.js
        level: 5,
        baseHealth: 70,
        baseAttack: 15,
        baseDefense: 8,
        abilities: ["piercing-thorns", "camouflage"],
        lootTable: {
            gold: { min: 25, max: 25 },
            experience: { min: 50, max: 50 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "thorn-lurker-pelt", chance: 0.5 },   // Tier 3
                { id: "thorn-lurker-branch", chance: 0.5 } // Tier 3
            ]
        },
        description: "A stealthy predator that hides among underbrush and lashes out with sharp thorns."
    },
    "owlbear-cub": {
        name: "Owlbear Cub",
        sprite: "OWLBEAR_CUB", // Add to AssetConfig.js
        level: 5,
        baseHealth: 70,
        baseAttack: 15,
        baseDefense: 8,
        abilities: ["maul", "shriek"],
        lootTable: {
            gold: { min: 25, max: 25 },
            experience: { min: 50, max: 50 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "owlbear-cub-pelt", chance: 0.25 },  // Tier 3
                { id: "owlbear-cub-fang", chance: 0.5 },  // Tier 3
                { id: "owlbear-cub-sinew", chance: 0.25 }  // Tier 3
            ]
        },
        description: "A young but dangerous beast with razor claws and a deafening screech."
    },
    "briar-sprite": {
        name: "Briar Sprite",
        sprite: "BRIAR_SPRITE", // Add to AssetConfig.js
        level: 6,
        baseHealth: 80,
        baseAttack: 17,
        baseDefense: 9,
        abilities: ["spike-burst", "life-drain"],
        lootTable: {
            gold: { min: 30, max: 30 },
            experience: { min: 30, max: 30 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "briar-sprite-pelt", chance: 0.5 },   // Tier 3
                { id: "briar-sprite-branch", chance: 0.5} // Tier 3
            ]
        },
        description: "A mischievous forest spirit that drains vitality and hurls thorns."
    },
    "entling": {
        name: "Entling",
        sprite: "ENTLING", // Add to AssetConfig.js
        level: 6,
        baseHealth: 80,
        baseAttack: 17,
        baseDefense: 9,
        abilities: ["branch-slam", "root-cage"],
        lootTable: {
            gold: { min: 30, max: 30 },
            experience: { min: 60, max: 60 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "entling-pelt", chance: 0.5 },   // Tier 3
                { id: "entling-branch", chance: 0.5 } // Tier 3
            ]
        },
        description: "A young tree guardian that binds enemies and crushes them with heavy limbs."
    },
    "horned-stag": {
        name: "Horned Stag",
        sprite: "HORNED_STAG", // Add to AssetConfig.js
        level: 7,
        baseHealth: 90,
        baseAttack: 19,
        baseDefense: 11,
        abilities: ["gore", "rally-call"],
        lootTable: {
            gold: { min: 35, max: 35 },
            experience: { min: 70, max: 70 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "horned-stag-pelt", chance: 0.5 },   // Tier 4
                { id: "horned-stag-antler", chance: 0.5 } // Tier 4
            ]
        },
        description: "A majestic creature with magical antlers that can summon forest allies."
    },
    "feral-druid": {
        name: "Feral Druid",
        sprite: "FERAL_DRUID", // Add to AssetConfig.js
        level: 8,
        baseHealth: 100,
        baseAttack: 21,
        baseDefense: 12,
        abilities: ["nature's-fury", "heal", "entangle"],
        lootTable: {
            gold: { min: 40, max: 40 },
            experience: { min: 80, max: 80 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "feral-druid-pelt", chance: 0.5 }, // Tier 4
                { id: "feral-druid-wand", chance: 0.5 }  // Tier 4
            ]
        },
        description: "A corrupted druid wielding powerful nature magic."
    },
    "witch-hare": {
        name: "Witch Hare",
        sprite: "WITCH_HARE", // Add to AssetConfig.js
        level: 8,
        baseHealth: 100,
        baseAttack: 21,
        baseDefense: 12,
        abilities: ["hex-bolt", "leap-strike", "blink"],
        lootTable: {
            gold: { min: 40, max: 40 },
            experience: { min: 40, max: 80 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "witch-hare-pelt", chance: 0.25 },  // Tier 4
                { id: "witch-hare-wand", chance: 0.5 }, // Tier 4
                { id: "witch-hare-sinew", chance: 0.25 }  // Tier 4
            ]
        },
        description: "A twisted hare imbued with dark magic and incredible speed."
    },
    "moss-troll": {
        name: "Moss Troll",
        sprite: "MOSS_TROLL", // Add to AssetConfig.js
        level: 9,
        baseHealth: 110,
        baseAttack: 23,
        baseDefense: 14,
        abilities: ["regenerate", "club-slam", "throw-rock"],
        lootTable: {
            gold: { min: 45, max: 45 },
            experience: { min: 90, max: 90 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "moss-troll-pelt", chance: 0.5 },  // Tier 5
                { id: "moss-troll-shard", chance: 0.5 } // Tier 5
            ]
        },
        description: "A slow-moving tank that heals over time and hurls boulders."
    },
    "forest-wyrmling": {
        name: "Forest Wyrmling",
        sprite: "FOREST_WYRMLING", // Add to AssetConfig.js
        level: 10,
        baseHealth: 120,
        baseAttack: 25,
        baseDefense: 15,
        abilities: ["acid-breath", "tail-whip", "wing-flurry"],
        lootTable: {
            gold: { min: 50, max: 50 },
            experience: { min: 50, max: 50 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "forest-wyrmling-pelt", chance: 0.5 }, // Tier 5
                { id: "forest-wyrmling-fang", chance: 0.5 }  // Tier 5
            ]
        },
        description: "A juvenile dragon-like beast awakened deep in the woods."

    },

    // == Crystal Caverns enemies ==
    "cave-bat": {
        name: "Crystal Bat",
        sprite: "BAT",
        level: 4,
        baseHealth: 30,
        baseAttack: 10,
        baseDefense: 3,
        abilities: ["sonic-screech", "dive-attack"],
        lootTable: {
            gold: { min: 20, max: 40 },
            experience: { min: 20, max: 40 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "crystal-bat-hide", chance: 0.4 }, // Tier 2
                { id: "crystal-bat-fangs", chance: 0.3 } // Tier 2
            ]
        },
        description: "A bat with crystalline growths on its wings that emits disorienting sonic pulses."
    },
    "crystal-golem": {
        name: "Crystal Golem",
        sprite: "CRYSTAL_GOLEM", // Add to AssetConfig.js (or use CRYSTAL if that's the key)
        level: 6,
        baseHealth: 80,
        baseAttack: 12,
        baseDefense: 10,
        abilities: ["crystal-smash", "reflect-light", "harden"],
        lootTable: {
            gold: { min: 30, max: 60 },
            experience: { min: 50, max: 70 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "crystal-golem-plate", chance: 0.3 }, // Tier 3
                { id: "crystal-golem-shard", chance: 0.2 }  // Tier 3
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
            gold: { min: 25, max: 50 },
            experience: { min: 40, max: 60 },
            items: [ // Updated with specific IDs and estimated chances
                { id: "miner-gear", chance: 0.25 },    // Tier 3
                { id: "miner-pickaxe", chance: 0.2 },  // Tier 3
                { id: "miner-straps", chance: 0.15 }   // Tier 3
            ]
        },
        description: "The restless spirit of a miner who died in a cave-in, still searching for precious gems."
    },

    // == Bosses ==
    "goblin-chief": { // Verdant Woods Boss
        name: "Goblin Chieftain",
        sprite: "GOBLIN_CHIEFTAIN",
        level: 5,
        baseHealth: 100,
        baseAttack: 12,
        baseDefense: 8,
        abilities: ["cleave", "rally", "throw-rock"],
        lootTable: {
            gold: { min: 25, max: 50 },
            experience: { min: 100, max: 150 },
            items: [ // Updated boss drops + key
                { id: "goblin-chief-armour", chance: 0.7 }, // Tier 3
                { id: "goblin-chief-axe", chance: 0.6 },    // Tier 3
                { id: "forest-key", chance: 1.0 }           // Quest/Key Item
            ]
        },
        isBoss: true,
        description: "The leader of the goblin tribe in the Verdant Woods. Larger and smarter than his followers."
    },
    "crystal-queen": { // Crystal Caverns Boss
        name: "Crystal Queen",
        sprite: "CRYSTAL_QUEEN",
        level: 8,
        baseHealth: 150,
        baseAttack: 18,
        baseDefense: 12,
        abilities: ["crystal-storm", "summon-shard", "blinding-light", "crystal-heal"],
        lootTable: {
            gold: { min: 40, max: 80 },
            experience: { min: 200, max: 300 },
            items: [ // Updated boss drops + key
                { id: "crystal-queen-robes", chance: 0.8 }, // Tier 4
                { id: "crystal-queen-wand", chance: 0.7 },  // Tier 4
                { id: "cavern-key", chance: 1.0 }           // Quest/Key Item
            ]
        },
        isBoss: true,
        description: "A majestic and deadly entity formed from the purest crystals in the cavern depths."
    }
};

// --- ABILITY DEFINITIONS ---
// (Includes placeholders for new abilities - Implement logic in CombatEngine)
const abilityDefinitions = {
    // == Basic & Existing Abilities ==
    "slash": { name: "Slash", type: "attack", damageMultiplier: 1.0, description: "A basic slashing attack." },
    "taunt": { name: "Taunt", type: "debuff", effect: { type: "attack", value: -2, duration: 3 }, description: "Taunts the target, lowering their Attack." },
    "bite": { name: "Bite", type: "attack", damageMultiplier: 1.2, statusEffect: { type: "bleed", chance: 0.3, damage: 2, duration: 3 }, description: "A powerful bite that may cause bleeding." },
    "howl": { name: "Howl", type: "buff", effect: { type: "attack", value: 3, duration: 3 }, description: "A fearsome howl that increases Attack." },
    "poison-bite": { name: "Poison Bite", type: "attack", damageMultiplier: 0.8, statusEffect: { type: "poison", chance: 0.6, damage: 3, duration: 3 }, description: "A venomous bite that poisons the target." },
    "web": { name: "Web", type: "debuff", statusEffect: { type: "immobilize", chance: 0.4, duration: 2 }, description: "Shoots a sticky web, potentially immobilizing the target." },
    "spore-cloud": { name: "Spore Cloud", type: "attack", damageMultiplier: 0.7, areaEffect: true, statusEffect: { type: "poison", chance: 0.7, damage: 2, duration: 3 }, description: "Releases a cloud of toxic spores." },
    "root-grab": { name: "Root Grab", type: "attack", damageMultiplier: 0.9, statusEffect: { type: "immobilize", chance: 0.6, duration: 2 }, description: "Roots erupt to immobilize and damage the target." },
    "steal": { name: "Steal", type: "special", stealGold: { min: 5, max: 15, chance: 0.5 }, description: "Attempts to steal gold." },
    "quick-shot": { name: "Quick Shot", type: "attack", damageMultiplier: 0.8, priority: true, description: "A fast arrow shot that strikes first." },
    "sonic-screech": { name: "Sonic Screech", type: "debuff", areaEffect: true, effect: { type: "defense", value: -3, duration: 2 }, description: "A high-pitched screech that lowers defense." },
    "dive-attack": { name: "Dive Attack", type: "attack", damageMultiplier: 1.3, cooldown: 2, description: "A powerful diving attack." },
    "crystal-smash": { name: "Crystal Smash", type: "attack", damageMultiplier: 1.5, cooldown: 3, description: "Smashes crystals into the target." },
    "reflect-light": { name: "Reflect Light", type: "special", reflectDamage: { chance: 0.7, percent: 0.3 }, duration: 2, description: "Reflects a portion of incoming damage." },
    "harden": { name: "Harden", type: "buff", effect: { type: "defense", value: 5, duration: 3 }, description: "Hardens crystal skin, increasing Defense." },
    "ghostly-pickaxe": { name: "Ghostly Pickaxe", type: "attack", damageMultiplier: 1.2, armorPiercing: 0.3, description: "A spectral pickaxe ignores some Defense." },
    "terrifying-wail": { name: "Terrifying Wail", type: "debuff", effect: { type: "attack", value: -4, duration: 2 }, statusEffect: { type: "fear", chance: 0.4, duration: 1 }, description: "A wail that lowers Attack and may cause fear." },
    "phase": { name: "Phase", type: "special", dodgeChance: 1.0, duration: 1, cooldown: 4, description: "Becomes intangible, avoiding the next attack." },

    // == Player Class Abilities (Examples) ==
    "cleave": { name: "Cleave", type: "attack", damageMultiplier: 1.3, areaEffect: true, manaCost: 15, description: "A sweeping attack hitting all enemies." },
    "shield-bash": { name: "Shield Bash", type: "attack", damageMultiplier: 0.8, statusEffect: { type: "stun", chance: 0.6, duration: 1 }, manaCost: 20, description: "Bash with shield, may stun." },
    "battle-cry": { name: "Battle Cry", type: "buff", effect: { type: "attack", value: 5, duration: 3 }, manaCost: 25, description: "A cry that increases Attack." },
    "fireball": { name: "Fireball", type: "attack", damageMultiplier: 1.5, statusEffect: { type: "burn", chance: 0.4, damage: 3, duration: 2 }, manaCost: 20, description: "Hurl a ball of fire." },
    "ice-spike": { name: "Ice Spike", type: "attack", damageMultiplier: 1.2, statusEffect: { type: "freeze", chance: 0.3, duration: 1 }, manaCost: 15, description: "Launch ice that may freeze." },
    "arcane-missiles": { name: "Arcane Missiles", type: "attack", damageMultiplier: 0.5, hits: 3, manaCost: 25, description: "Fire multiple arcane missiles." },
    "backstab": { name: "Backstab", type: "attack", damageMultiplier: 2.0, critChance: 0.3, critMultiplier: 1.5, manaCost: 15, description: "Deadly strike with high critical chance." },
    "poison-strike": { name: "Poison Strike", type: "attack", damageMultiplier: 0.8, statusEffect: { type: "poison", chance: 0.8, damage: 5, duration: 3 }, manaCost: 20, description: "Venomous strike." },
    "shadow-step": { name: "Shadow Step", type: "buff", effect: { type: "dodge", value: 50, duration: 2 }, manaCost: 25, description: "Increases dodge chance significantly." },
    "smite": { name: "Smite", type: "attack", damageMultiplier: 1.3, extraDamageToUndead: 1.5, manaCost: 15, description: "Holy attack, extra damage to undead." },
    "healing-word": { name: "Healing Word", type: "heal", healAmount: 30, scaling: { attribute: "wisdom", factor: 0.7 }, manaCost: 20, description: "A prayer that heals wounds." },
    "divine-protection": { name: "Divine Protection", type: "buff", effect: { type: "defense", value: 10, duration: 3 }, manaCost: 25, description: "Increases Defense." },

    // == Boss Abilities ==
    "rally": { name: "Rally Minions", type: "summon", summon: { type: "forest-goblin", count: { min: 1, max: 2 } }, cooldown: 4, description: "Calls for goblin reinforcements." },
    "throw-rock": { name: "Throw Rock", type: "attack", damageMultiplier: 1.1, statusEffect: { type: "stun", chance: 0.3, duration: 1 }, description: "Throws a large rock, may stun." },
    "crystal-storm": { name: "Crystal Storm", type: "attack", damageMultiplier: 1.4, areaEffect: true, statusEffect: { type: "bleed", chance: 0.5, damage: 4, duration: 2 }, cooldown: 3, description: "Unleashes a storm of crystal shards." },
    "summon-shard": { name: "Summon Crystal Shard", type: "summon", summon: { type: "crystal-golem", count: { min: 1, max: 1 } }, cooldown: 5, description: "Summons a crystal golem." },
    "blinding-light": { name: "Blinding Light", type: "debuff", areaEffect: true, effect: { type: "accuracy", value: -50, duration: 2 }, cooldown: 4, description: "Emits blinding light, reducing accuracy." },
    "crystal-heal": { name: "Crystal Regeneration", type: "heal", healPercent: 0.2, cooldown: 3, description: "Absorbs crystal energy to heal." },

    // == New Enemy Abilities (Placeholders - Need Implementation Details!) ==
    "charge": { name: "Charge", type: "attack", damageMultiplier: 1.4, statusEffect: { type: "stun", chance: 0.2, duration: 1}, description: "Charges at the target with force." },
    "tough-hide": { name: "Tough Hide", type: "passive_buff", effect: { type: "defense", value: 2 }, description: "Passively increases Defense."},
    "piercing-thorns": { name: "Piercing Thorns", type: "attack", damageMultiplier: 1.1, armorPiercing: 0.3, description: "Lashes out with thorns that pierce armor." },
    "camouflage": { name: "Camouflage", type: "buff", effect: { type: "dodge", value: 30, duration: 2 }, cooldown: 4, description: "Blends into surroundings, increasing dodge." },
    "maul": { name: "Maul", type: "attack", damageMultiplier: 1.3, statusEffect: { type: "bleed", chance: 0.4, damage: 3, duration: 2}, description: "A vicious attack with claws." },
    "shriek": { name: "Shriek", type: "debuff", areaEffect: true, effect: { type: "attack", value: -3, duration: 2}, description: "Deafening screech lowers enemy Attack." },
    "spike-burst": { name: "Spike Burst", type: "attack", damageMultiplier: 1.0, areaEffect: true, description: "Releases a burst of spikes hitting nearby enemies." },
    "life-drain": { name: "Life Drain", type: "attack_heal", damageMultiplier: 0.8, healPercentOfDamage: 0.5, description: "Drains life force, healing the attacker." },
    "branch-slam": { name: "Branch Slam", type: "attack", damageMultiplier: 1.5, cooldown: 2, description: "Slams a heavy branch onto the target." },
    "root-cage": { name: "Root Cage", type: "debuff", statusEffect: { type: "immobilize", chance: 0.7, duration: 2}, cooldown: 3, description: "Summons roots to trap the target." },
    "gore": { name: "Gore", type: "attack", damageMultiplier: 1.2, statusEffect: { type: "bleed", chance: 0.3, damage: 4, duration: 3}, description: "Impales the target with horns." },
    "rally-call": { name: "Rally Call", type: "summon", summon: { type: "wolf", count: { min: 1, max: 2 } }, cooldown: 4, description: "Calls nearby forest creatures for aid." },
    "nature's-fury": { name: "Nature's Fury", type: "attack", damageMultiplier: 1.4, elementType: "nature", cooldown: 3, description: "Unleashes raw nature power." },
    "heal": { name: "Heal", type: "heal", healAmount: 25, cooldown: 3, description: "Uses nature magic to heal wounds." },
    "entangle": { name: "Entangle", type: "debuff", statusEffect: { type: "immobilize", chance: 0.8, duration: 2}, cooldown: 3, description: "Vines erupt to immobilize the target." },
    "hex-bolt": { name: "Hex Bolt", type: "attack", damageMultiplier: 1.1, statusEffect: { type: "curse", chance: 0.5, effect: {type: "defense", value: -3}, duration: 3}, description: "Fires dark magic, may curse." },
    "leap-strike": { name: "Leap Strike", type: "attack", damageMultiplier: 1.3, priority: true, description: "Leaps for a quick, powerful strike." },
    "blink": { name: "Blink", type: "special", effect: { type: "dodge", value: 100, duration: 1 }, cooldown: 3, description: "Teleports, avoiding the next attack." },
    "regenerate": { name: "Regenerate", type: "passive_heal", healPercent: 0.1, trigger: "turn_start", description: "Passively regenerates health each turn." },
    "club-slam": { name: "Club Slam", type: "attack", damageMultiplier: 1.6, statusEffect: { type: "stun", chance: 0.3, duration: 1}, cooldown: 3, description: "Devastating slam with a heavy club." },
    "acid-breath": { name: "Acid Breath", type: "attack", damageMultiplier: 1.2, areaEffect: true, statusEffect: { type: "corrode", chance: 0.6, effect: {type: "defense", value: -4}, duration: 3}, cooldown: 3, description: "Breathes corrosive acid." },
    "tail-whip": { name: "Tail Whip", type: "attack", damageMultiplier: 1.0, areaEffect: true, knockback: true, description: "Whips tail, hitting nearby enemies." },
    "wing-flurry": { name: "Wing Flurry", type: "attack", damageMultiplier: 0.7, hits: 2, areaEffect: true, description: "Beats wings rapidly, creating damaging gusts." },
};

// --- HELPER FUNCTIONS ---

/**
 * Get enemy data by ID (returns a deep copy)
 * @param {string} enemyId - The ID of the enemy
 * @returns {object|null} - The enemy data object or null if not found
 */
function getEnemyData(enemyId) {
    const enemy = enemyData[enemyId];
    if (!enemy) {
        console.warn(`Enemy data not found for ID: ${enemyId}. Returning null.`);
        return null;
    }
    return JSON.parse(JSON.stringify({ ...enemy, maxHealth: enemy.baseHealth }));
}

/**
 * Get ability data by ID (returns a deep copy)
 * @param {string} abilityId - The ID of the ability
 * @returns {object|null} - The ability data object or null if not found
 */
function getAbilityData(abilityId) {
    const ability = abilityDefinitions[abilityId];
     if (!ability) {
        console.warn(`Ability definition not found for ID: ${abilityId}`);
        return null;
    }
    return JSON.parse(JSON.stringify(ability));
}

/**
 * Generate an enemy instance based on enemy ID and level modifier (returns a deep copy)
 * @param {string} enemyId - The ID of the enemy
 * @param {number} levelModifier - Optional level modifier (default: 0)
 * @returns {object|null} - An enemy instance with calculated stats or null if base data not found
 */
function generateEnemy(enemyId, levelModifier = 0) {
    const baseData = getEnemyData(enemyId);
    if (!baseData) {
        console.warn(`generateEnemy: Base data not found for ${enemyId}`);
        return null;
    }

    // Calculate the enemy's nominal level (can still be useful for display, XP, etc.)
    const level = Math.max(1, baseData.level + levelModifier);

    // --- Use BASE stats directly - REMOVED Level Multiplier ---
    const health = baseData.baseHealth;
    const attack = baseData.baseAttack;
    const defense = baseData.baseDefense;

    // --- Process abilities (remains the same) ---
    const abilities = [];
    if (baseData.abilities && Array.isArray(baseData.abilities)) {
        baseData.abilities.forEach(abilityId => {
            const abilityData = getAbilityData(abilityId);
            if (abilityData) {
                const cooldown = abilityData.cooldown ? abilityData.cooldown : 0;
                abilities.push({
                    id: abilityId,
                    ...abilityData, // Spread ability properties
                    cooldownRemaining: 0,
                    baseCooldown: cooldown
                });
            } else {
                console.warn(`Ability data for '${abilityId}' not found for enemy '${enemyId}'.`);
            }
        });
    }

    // --- Return the enemy object with base stats ---
    return {
        id: enemyId,
        name: baseData.name,
        sprite: baseData.sprite,
        level: level, // Keep the calculated level for potential display/XP use

        health: health,        // Use base health
        maxHealth: health,     // Use base health for maxHealth
        attack: attack,        // Use base attack (the base stat value itself)
        defense: defense,      // Use base defense (the base stat value itself)

        abilities: abilities,
        isBoss: baseData.isBoss || false,
        description: baseData.description,
        // Deep copy loot table if it exists
        lootTable: baseData.lootTable ? JSON.parse(JSON.stringify(baseData.lootTable)) : { gold: {min:0, max:0}, experience: {min:0, max:0}, items: [] },
        statusEffects: [], // Initialize empty status effects array

        // Initialize current combat stats directly from base stats
        currentAttack: attack,
        currentDefense: defense
    };
}

/**
 * Get enemies appropriate for a dungeon level
 * @param {string} dungeonId - The ID of the dungeon (e.g., 'verdant-woods', 'crystal-caverns')
 * @param {number} dungeonLevel - The current level/floor within the dungeon
 * @param {number} count - Number of enemies to generate
 * @returns {array} - Array of enemy instance objects
 */
function getDungeonEnemies(dungeonId, dungeonLevel, count = 1) {
    let possibleEnemies = [];
    switch (dungeonId) {
        case 'verdant-woods':
            if (dungeonLevel <= 2) possibleEnemies = ['forest-goblin', 'mushroom-creature', 'wild-boar'];
            else if (dungeonLevel <= 4) possibleEnemies = ['wolf', 'forest-spider', 'forest-bandit', 'thorn-lurker', 'wild-boar', 'owlbear-cub', 'briar-sprite'];
            else if (dungeonLevel <= 7) possibleEnemies = ['forest-bandit', 'thorn-lurker', 'owlbear-cub', 'briar-sprite', 'entling', 'horned-stag', 'feral-druid', 'witch-hare'];
            else possibleEnemies = ['entling', 'horned-stag', 'feral-druid', 'witch-hare', 'moss-troll', 'forest-wyrmling'];
            break;
        case 'crystal-caverns':
             if (dungeonLevel <= 5) possibleEnemies = ['cave-bat', 'miner-ghost'];
             else possibleEnemies = ['cave-bat', 'miner-ghost', 'crystal-golem'];
            break;
        default:
            console.warn(`Unknown dungeon ID: ${dungeonId}.`); return createDefaultEnemies(dungeonLevel, count);
    }
     if (possibleEnemies.length === 0) { console.warn(`No possible enemies defined for ${dungeonId} at level ${dungeonLevel}.`); return createDefaultEnemies(dungeonLevel, count); }

    const enemies = [];
    const levelVariance = Math.max(0, Math.min(1, Math.floor(dungeonLevel / 4)));

    for (let i = 0; i < count; i++) {
        const enemyId = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
        const levelMod = Math.floor(Math.random() * (levelVariance * 2 + 1)) - levelVariance;
        try {
            const enemy = generateEnemy(enemyId, levelMod);
            if (enemy) { enemy.level = Math.max(1, enemy.level); enemies.push(enemy); }
            else { console.error(`Failed to generate enemy instance for ${enemyId}.`); enemies.push(createDefaultEnemy(dungeonLevel)); }
        } catch (error) { console.error(`Error generating enemy ${enemyId}:`, error); enemies.push(createDefaultEnemy(dungeonLevel)); }
    }
    if (enemies.length === 0) { console.error(`Failed to generate any enemies for ${dungeonId} level ${dungeonLevel}.`); return createDefaultEnemies(dungeonLevel, count); }
    return enemies;
}

/** Create default enemies */
function createDefaultEnemies(level, count) { return Array.from({ length: count }, () => createDefaultEnemy(level)); }

/** Create a default enemy */
function createDefaultEnemy(level) {
    const types = ['Creature', 'Beast', 'Monster', 'Foe']; const type = types[Math.floor(Math.random() * types.length)];
    const adjLvl = Math.max(1, level); const health = 20 + (adjLvl * 5); const attack = 5 + adjLvl; const defense = 2 + Math.floor(adjLvl / 2);
    return { id: `default-${type.toLowerCase()}-${Date.now()}`, name: `Level ${adjLvl} ${type}`, sprite: 'DEFAULT', level: adjLvl, health: health, maxHealth: health, attack: attack, defense: defense, abilities: [{ id: 'basic-attack', name: 'Attack', type: 'attack', damageMultiplier: 1.0, description: 'A basic attack', cooldownRemaining: 0 }], isBoss: false, description: `A generic level ${adjLvl} opponent.`, lootTable: { gold: { min: adjLvl * 2, max: adjLvl * 5 }, experience: { min: adjLvl * 3, max: adjLvl * 7 }, items: [] }, statusEffects: [], currentAttack: attack, currentDefense: defense };
}

/** Generate loot from enemies */
function generateLoot(enemies) {
    const enemyArray = Array.isArray(enemies) ? enemies : [enemies];
    if (!enemyArray || enemyArray.length === 0) { return { gold: 0, experience: 0, items: [] }; }
    const totalLoot = { gold: 0, experience: 0, items: [] };
    enemyArray.forEach(enemy => {
        if (!enemy || !enemy.lootTable) return; const { gold, experience, items } = enemy.lootTable;
        if (gold?.min !== undefined && gold?.max !== undefined) totalLoot.gold += Math.floor(Math.random() * (gold.max - gold.min + 1)) + gold.min;
        if (experience?.min !== undefined && experience?.max !== undefined) totalLoot.experience += Math.floor(Math.random() * (experience.max - experience.min + 1)) + experience.min;
        if (items && Array.isArray(items)) items.forEach(itemDrop => { if (itemDrop?.id && itemDrop.chance && Math.random() < itemDrop.chance) totalLoot.items.push(itemDrop.id); });
    });
    totalLoot.gold = Math.max(0, Math.floor(totalLoot.gold)); totalLoot.experience = Math.max(0, Math.floor(totalLoot.experience));
    return totalLoot;
}

/** Get boss for a dungeon */
function getDungeonBoss(dungeonId, dungeonLevel) {
    let bossId = null;
    switch (dungeonId) {
        case 'verdant-woods': bossId = 'goblin-chief'; break;
        case 'crystal-caverns': bossId = 'crystal-queen'; break;
        default: console.warn(`No boss config for dungeon ID: ${dungeonId}.`); return createDefaultBoss(dungeonLevel);
    }
    if (!bossId) { console.log(`No boss ID for ${dungeonId}.`); return createDefaultBoss(dungeonLevel); }
    try {
        const boss = generateEnemy(bossId, 2); // Boss +2 levels
        if (boss) {
            boss.isBoss = true; boss.maxHealth = Math.floor(boss.maxHealth * 1.5); boss.health = boss.maxHealth;
            boss.currentAttack = Math.floor(boss.currentAttack * 1.2); return boss;
        } else { console.error(`Failed to generate boss ${bossId}.`); return createDefaultBoss(dungeonLevel); }
    } catch (error) { console.error(`Error generating boss ${bossId}:`, error); return createDefaultBoss(dungeonLevel); }
}

/** Create a default boss */
function createDefaultBoss(level) {
    const types = ['Guardian', 'Overlord', 'Tyrant', 'Behemoth']; const type = types[Math.floor(Math.random() * types.length)];
    const bossLvl = Math.max(1, level + 2); const health = 80+(bossLvl*15); const attack = 10+(bossLvl*2); const defense = 5+bossLvl;
    return { id: `default-boss-${type.toLowerCase()}-${Date.now()}`, name: `Level ${bossLvl} ${type}`, sprite: 'BOSS_DEFAULT', level: bossLvl, health: health, maxHealth: health, attack: attack, defense: defense, abilities: [{ id: 'power-attack', name: 'Power Attack', type: 'attack', damageMultiplier: 1.5, cooldown: 2, description: 'A powerful blow.', cooldownRemaining: 0 }, { id: 'reinforce', name: 'Reinforce', type: 'buff', effect: { type: 'defense', value: 5, duration: 3 }, cooldown: 4, description: 'Increases defense.', cooldownRemaining: 0 }], isBoss: true, description: `A formidable default boss of level ${bossLvl}.`, lootTable: { gold: { min: bossLvl * 20, max: bossLvl * 40 }, experience: { min: bossLvl * 30, max: bossLvl * 60 }, items: [{ id: "rare_gem", chance: 0.3 }, { id: "epic_material", chance: 0.1 }] }, statusEffects: [], currentAttack: attack, currentDefense: defense };
}

/** Apply a status effect */
function applyStatusEffect(target, statusEffect, chanceOverride) {
    if (!target?.statusEffects) { console.error("Invalid target for applyStatusEffect"); return false; }
    if (!statusEffect?.type || statusEffect.duration === undefined) { console.error("Invalid status effect definition"); return false; }
    const applyChance = chanceOverride ?? statusEffect.chance ?? 1.0;
    if (Math.random() >= applyChance) { console.log(`${target.name} resisted ${statusEffect.name || statusEffect.type}.`); return false; }
    const existingIdx = target.statusEffects.findIndex(e => e.type === statusEffect.type);
    const effectToApply = { ...statusEffect, remainingDuration: statusEffect.duration };
    if (existingIdx >= 0) { target.statusEffects[existingIdx].remainingDuration = effectToApply.duration; console.log(`Refreshed ${effectToApply.type} on ${target.name}.`); }
    else { target.statusEffects.push(effectToApply); console.log(`Applied ${effectToApply.type} to ${target.name}.`); }
    return true;
}

// --- EXPORTS ---
export {
    enemyData, abilityDefinitions, getEnemyData, getAbilityData, generateEnemy,
    getDungeonEnemies, generateLoot, getDungeonBoss, applyStatusEffect
};