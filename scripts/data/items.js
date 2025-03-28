/**
 * items.js
 * Contains data definitions for all items in the game.
 */

// Mapping from Item Category to AssetConfig key for icons
const categoryIconKeys = {
    Armour: 'ARMOUR',
    Branches: 'BRANCHES',
    Sharps: 'SHARPS',
    Strings: 'STRINGS',
    // Add more categories and their icon keys if needed (e.g., Potions, Accessories)
};

export const itemDatabase = {
    // --- Armour ---
    'bandit-armour': {
        itemId: 1, // Unique numeric ID
        itemName: 'bandit-armour', // Backend name/key
        inGameName: 'Bandit Armour', // Display name
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'], // Link to AssetConfig key
        value: 20, // Gold value
        tier: 2,
        description: 'Tattered yet functional armor looted from a fallen bandit. Still carries the scent of sweat and treachery.',
        stackable: false, // Armour typically isn't stackable
        equipSlot: 'body', // If equippable
        // Add potential stat bonuses here if equippable:
        // effects: { defense: 3, agility: -1 }
    },
    'briar-sprite-pelt': {
        itemId: 4,
        itemName: 'briar-sprite-pelt',
        inGameName: 'Briar Sprite Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 20,
        tier: 2,
        description: "Rough bark-like hide torn from a briar sprite's back. Surprisingly warm for something that bleeds sap.",
        stackable: true, // Assumed crafting material is stackable
        type: 'material' // Add a type if needed for filtering
    },
    'crystal-bat-hide': {
        itemId: 6,
        itemName: 'crystal-bat-hide',
        inGameName: 'Crystal Bat Hide',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 20,
        tier: 2,
        description: 'Glittering membrane hide, torn from a crystal bat mid-flight. Light yet unnaturally tough.',
        stackable: true,
        type: 'material'
    },
     'crystal-golem-plate': {
        itemId: 7,
        itemName: 'crystal-golem-plate',
        inGameName: 'Crystal Golem Plate',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 30,
        tier: 3,
        description: "Jagged plates broken from a crystal golem's torso. Sharp and unnervingly cold to the touch.",
        stackable: true,
        type: 'material'
    },
    'crystal-queen-robes': {
        itemId: 9,
        itemName: 'crystal-queen-robes',
        inGameName: 'Crystal Queen Robes',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 40,
        tier: 4,
        description: 'Regal silks shimmering with arcane energy, taken from the fallen Crystal Queen herself.',
        stackable: false,
        equipSlot: 'body',
        // effects: { defense: 8, intelligence: 2 }
    },
    'entling-pelt': {
        itemId: 12,
        itemName: 'entling-pelt',
        inGameName: 'Entling Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 30,
        tier: 3,
        description: "Rough bark-fur that once covered an entling's trunk. Smells faintly of moss and decay.",
        stackable: true,
        type: 'material'
    },
    'feral-druid-pelt': {
        itemId: 13,
        itemName: 'feral-druid-pelt',
        inGameName: 'Feral Druid Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 30,
        tier: 3,
        description: 'A cloak of matted fur torn from the back of a wild druid. The scent of beast lingers.',
        stackable: true,
        type: 'material'
    },
    'forest-wyrmling-pelt': {
        itemId: 16,
        itemName: 'forest-wyrmling-pelt',
        inGameName: 'Forest Wyrmling Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 50,
        tier: 5,
        description: 'Scaled and vibrant, this pelt was peeled from the green hide of a slain wyrmling.',
        stackable: true,
        type: 'material'
    },
    'goblin-chief-armour': {
        itemId: 17,
        itemName: 'goblin-chief-armour',
        inGameName: 'Goblin Chief Armour',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 30,
        tier: 3,
        description: 'Reinforced goblin armor, scavenged from the charred remains of a goblin chief.',
        stackable: false,
        equipSlot: 'body',
        // effects: { defense: 5 }
    },
    'goblin-leather': {
        itemId: 19,
        itemName: 'goblin-leather',
        inGameName: 'Goblin Leather',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 10,
        tier: 1,
        description: 'Tough leather harvested from goblin scraps. Smells worse than it looks.',
        stackable: true,
        type: 'material'
    },
    'horned-stag-pelt': {
        itemId: 23,
        itemName: 'horned-stag-pelt',
        inGameName: 'Horned Stag Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 30,
        tier: 3,
        description: "Luxurious fur from the forest's fiercest prey. Taken only by those fast and bold enough.",
        stackable: true,
        type: 'material'
    },
    'miner-gear': {
        itemId: 24,
        itemName: 'miner-gear',
        inGameName: 'Miner Gear',
        category: 'Armour', // Or maybe 'Accessory'? Decide category based on game mechanics
        iconKey: categoryIconKeys['Armour'], // Or a new 'Accessory' icon key
        value: 30,
        tier: 3,
        description: "A battered toolbelt and lamp looted from a fallen miner. Still smells of dust and sweat.",
        stackable: false,
        equipSlot: 'accessory', // Example slot
        // effects: { constitution: 1 }
    },
     'moss-troll-pelt': {
        itemId: 27,
        itemName: 'moss-troll-pelt',
        inGameName: 'Moss Troll Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 40,
        tier: 4,
        description: "Thick, damp hide peeled from a moss troll's hulking form. Carries the weight of the swamp.",
        stackable: true,
        type: 'material'
    },
    'mushroom-hide': {
        itemId: 30,
        itemName: 'mushroom-hide',
        inGameName: 'Mushroom Hide',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 10,
        tier: 1,
        description: "Spongy and fibrous, this hide was stripped from a mushroom creature's back.",
        stackable: true,
        type: 'material'
    },
    'owlbear-cub-pelt': {
        itemId: 33,
        itemName: 'owlbear-cub-pelt',
        inGameName: 'Owlbear Cub Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 20,
        tier: 2,
        description: 'Soft fur from a young owlbear. Stained with the struggle it took to claim.',
        stackable: true,
        type: 'material'
    },
    'spider-carapace': {
        itemId: 35,
        itemName: 'spider-carapace',
        inGameName: 'Spider Carapace',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 20,
        tier: 2,
        description: 'Cracked chitin plate from a slain forest spider. Gleams faintly in the dark.',
        stackable: true,
        type: 'material'
    },
    'thorn-lurker-pelt': {
        itemId: 39,
        itemName: 'thorn-lurker-pelt',
        inGameName: 'Thorn Lurker Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 20,
        tier: 2,
        description: 'Rugged and thorn-studded, this hide is taken from the body of a defeated thorn lurker.',
        stackable: true,
        type: 'material'
    },
    'wild-boar-pelt': {
        itemId: 41,
        itemName: 'wild-boar-pelt',
        inGameName: 'Wild Boar Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 10,
        tier: 1,
        description: 'Coarse, bristled pelt taken after a bloody struggle with a forest boar.',
        stackable: true,
        type: 'material'
    },
    'witch-hare-pelt': {
        itemId: 43,
        itemName: 'witch-hare-pelt',
        inGameName: 'Witch Hare Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 40,
        tier: 4,
        description: 'Silken fur harvested from an eerie witch hare. Glimmers faintly under moonlight.',
        stackable: true,
        type: 'material'
    },
    'wolf-pelt': {
        itemId: 47,
        itemName: 'wolf-pelt',
        inGameName: 'Wolf Pelt',
        category: 'Armour',
        iconKey: categoryIconKeys['Armour'],
        value: 10,
        tier: 1,
        description: 'A dense pelt stripped from a slain wolf. Carries the scent of the hunt.',
        stackable: true,
        type: 'material'
    },

    // --- Sharps ---
    'bandit-dagger': {
        itemId: 2,
        itemName: 'bandit-dagger',
        inGameName: 'Bandit Dagger',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 20,
        tier: 2,
        description: "A crude dagger taken from a bandit's cold grip. Quick to strike, if a little rusty.",
        stackable: false,
        equipSlot: 'weapon',
        // effects: { attack: 4 }
    },
    'crystal-bat-fangs': {
        itemId: 5,
        itemName: 'crystal-bat-fangs',
        inGameName: 'Crystal Bat Fangs',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 20,
        tier: 2,
        description: 'Shards of razor crystal once embedded in a bat\'s maw. Still hums with faint resonant energy.',
        stackable: true,
        type: 'material'
    },
    'crystal-golem-shard': {
        itemId: 8,
        itemName: 'crystal-golem-shard',
        inGameName: 'Crystal Golem Shard',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 30,
        tier: 3,
        description: 'A fragmented core piece of a shattered crystal golem. Glows faintly in moonlight.',
        stackable: true,
        type: 'material'
    },
     'forest-wyrmling-fang': {
        itemId: 15,
        itemName: 'forest-wyrmling-fang',
        inGameName: 'Forest Wyrmling Fang',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 50,
        tier: 5,
        description: 'A curved fang from a young forest wyrm. Its venom still seeps at the root.',
        stackable: true,
        type: 'material'
    },
    'goblin-chief-axe': {
        itemId: 18,
        itemName: 'goblin-chief-axe',
        inGameName: 'Goblin Chief Axe',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 30,
        tier: 3,
        description: 'A crude yet deadly axe, pried from the splintered skull of its former goblin wielder.',
        stackable: false,
        equipSlot: 'weapon',
        // effects: { attack: 7 }
    },
    'goblin-teeth': {
        itemId: 20,
        itemName: 'goblin-teeth',
        inGameName: 'Goblin Teeth',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 10,
        tier: 1,
        description: 'Jagged goblin molars yanked from twitching jaws. Ideal for unsettling talismans.',
        stackable: true,
        type: 'material'
    },
    'horned-stag-antler': {
        itemId: 22,
        itemName: 'horned-stag-antler',
        inGameName: 'Horned Stag Antler',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 30,
        tier: 3,
        description: 'A twisted antler shorn from a majestic - now fallen - horned stag.',
        stackable: true,
        type: 'material'
    },
     'miner-pickaxe': {
        itemId: 25,
        itemName: 'miner-pickaxe',
        inGameName: 'Miner Pickaxe',
        category: 'Sharps', // Or maybe a tool category if you have one
        iconKey: categoryIconKeys['Sharps'],
        value: 30,
        tier: 3,
        description: "Well-worn but sturdy, this pickaxe was taken from the hands of a miner who didn't see you coming.",
        stackable: false,
        equipSlot: 'weapon', // Can it be used as a weapon?
        // effects: { attack: 6 }
    },
    'moss-troll-shard': {
        itemId: 28,
        itemName: 'moss-troll-shard',
        inGameName: 'Moss Troll Shard',
        category: 'Sharps', // Or maybe a 'Magic' category?
        iconKey: categoryIconKeys['Sharps'],
        value: 40,
        tier: 4,
        description: "A glowing shard from a moss troll's enchanted heartstone. Still pulses faintly.",
        stackable: true,
        type: 'material' // Or 'reagent'
    },
    'mushroom-arms': {
        itemId: 29,
        itemName: 'mushroom-arms',
        inGameName: 'Mushroom Arms',
        category: 'Sharps', // Or 'Branches'?
        iconKey: categoryIconKeys['Sharps'],
        value: 10,
        tier: 1,
        description: 'Fleshy fungal limbs torn from a walking spore beast. Oozes strange spores when disturbed.',
        stackable: true,
        type: 'material'
    },
     'owlbear-cub-fang': {
        itemId: 32,
        itemName: 'owlbear-cub-fang',
        inGameName: 'Owlbear Cub Fang',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 20,
        tier: 2,
        description: 'A small yet vicious tooth pulled from the maw of a downed owlbear cub.',
        stackable: true,
        type: 'material'
    },
    'spider-fang': {
        itemId: 36,
        itemName: 'spider-fang',
        inGameName: 'Spider Fang',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 20,
        tier: 2,
        description: 'Venom-tipped fang extracted from a twitching spider corpse. Handle with care.',
        stackable: true,
        type: 'material'
    },
    'wild-boar-fang': {
        itemId: 40,
        itemName: 'wild-boar-fang',
        inGameName: 'Wild Boar Fang',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 10,
        tier: 1,
        description: 'A jagged tusk broken from the charging maw of a wild boar.',
        stackable: true,
        type: 'material'
    },
     'wolf-claws': {
        itemId: 46,
        itemName: 'wolf-claws',
        inGameName: 'Wolf Claws',
        category: 'Sharps',
        iconKey: categoryIconKeys['Sharps'],
        value: 10,
        tier: 1,
        description: "Razor claws cut from a snarling wolf's paw. Still sharp enough to wound.",
        stackable: true,
        type: 'material'
    },

    // --- Branches ---
    'briar-sprite-branch': {
        itemId: 3,
        itemName: 'briar-sprite-branch',
        inGameName: 'Briar Sprite Branch',
        category: 'Branches',
        iconKey: categoryIconKeys['Branches'],
        value: 20,
        tier: 2,
        description: 'A twisted, thorn-laced twig pulsing with faint magic, plucked from the smoldering remains of a briar sprite.',
        stackable: true,
        type: 'material'
    },
     'crystal-queen-wand': {
        itemId: 10,
        itemName: 'crystal-queen-wand',
        inGameName: 'Crystal Queen Wand',
        category: 'Branches', // Or 'Wand' category?
        iconKey: categoryIconKeys['Branches'], // Or WAND icon key
        value: 40,
        tier: 4,
        description: 'A radiant wand infused with cold elegance. Prized from the lifeless hand of the Crystal Queen.',
        stackable: false,
        equipSlot: 'weapon', // Assuming wands are weapons
        // effects: { magicAttack: 10, intelligence: 2 }
    },
    'entling-branch': {
        itemId: 11,
        itemName: 'entling-branch',
        inGameName: 'Entling Branch',
        category: 'Branches',
        iconKey: categoryIconKeys['Branches'],
        value: 30,
        tier: 3,
        description: "A splintered limb from a felled entling. Still saps resin like it's alive.",
        stackable: true,
        type: 'material'
    },
    'feral-druid-wand': {
        itemId: 14,
        itemName: 'feral-druid-wand',
        inGameName: 'Feral Druid Wand',
        category: 'Branches', // Or 'Wand' category?
        iconKey: categoryIconKeys['Branches'], // Or WAND icon key
        value: 30,
        tier: 3,
        description: 'A twisted wand imbued with wild magic, ripped from a druid\'s grasp mid-transformation.',
        stackable: false,
        equipSlot: 'weapon',
        // effects: { magicAttack: 8, natureDamageBonus: 5 } // Example effect
    },
    'thorn-lurker-branch': {
        itemId: 38,
        itemName: 'thorn-lurker-branch',
        inGameName: 'Thorn Lurker Branch',
        category: 'Branches',
        iconKey: categoryIconKeys['Branches'],
        value: 20,
        tier: 2,
        description: "Barbed limb ripped from a lurking forest predator. Still drips with its victim's sap.",
        stackable: true,
        type: 'material'
    },
    'witch-hare-wand': {
        itemId: 44,
        itemName: 'witch-hare-wand',
        inGameName: 'Witch Hare Wand',
        category: 'Branches', // Or 'Wand' category?
        iconKey: categoryIconKeys['Branches'], // Or WAND icon key
        value: 40,
        tier: 4,
        description: 'A peculiar wand crackling with residual enchantments. Claimed from a cursed hare.',
        stackable: false,
        equipSlot: 'weapon',
        // effects: { magicAttack: 9, agility: 1 }
    },

    // --- Strings ---
    'goblin-sinew': {
        itemId: 21,
        itemName: 'goblin-sinew',
        inGameName: 'Goblin Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 10,
        tier: 1,
        description: 'Resilient fibers stripped from goblin tendons. Surprisingly strong and useful in crafting.',
        stackable: true,
        type: 'material'
    },
    'miner-straps': {
        itemId: 26,
        itemName: 'miner-straps',
        inGameName: 'Miner Straps',
        category: 'Strings', // Or 'Leather'?
        iconKey: categoryIconKeys['Strings'],
        value: 30,
        tier: 3,
        description: "Leather straps used to carry ore and gear, stripped from a dead miner's pack.",
        stackable: true,
        type: 'material'
    },
    'mushroom-sinew': {
        itemId: 31,
        itemName: 'mushroom-sinew',
        inGameName: 'Mushroom Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 10,
        tier: 1,
        description: 'Elastic threads harvested from fungal beasts. Oddly durable for something so organic.',
        stackable: true,
        type: 'material'
    },
    'owlbear-cub-sinew': {
        itemId: 34,
        itemName: 'owlbear-cub-sinew',
        inGameName: 'Owlbear Cub Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 20,
        tier: 2,
        description: "Taut sinew taken from an owlbear cub's limb. Strong despite its age.",
        stackable: true,
        type: 'material'
    },
    'spider-silk': {
        itemId: 37,
        itemName: 'spider-silk',
        inGameName: 'Spider Silk',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 20,
        tier: 2,
        description: "Gossamer threads gathered from the webbed remains of a spider's lair.",
        stackable: true,
        type: 'material'
    },
     'wild-boar-sinew': {
        itemId: 42,
        itemName: 'wild-boar-sinew',
        inGameName: 'Wild Boar Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 10,
        tier: 1,
        description: 'Thick sinew stripped from boar legs. Ideal for rugged bowstrings.',
        stackable: true,
        type: 'material'
    },
    'witch-hare-sinew': {
        itemId: 45,
        itemName: 'witch-hare-sinew',
        inGameName: 'Witch Hare Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 40,
        tier: 4,
        description: "Thread-like sinew with unnatural elasticity, pulled from a witch hare's remains.",
        stackable: true,
        type: 'material'
    },
    'wolf-sinew': {
        itemId: 48,
        itemName: 'wolf-sinew',
        inGameName: 'Wolf Sinew',
        category: 'Strings',
        iconKey: categoryIconKeys['Strings'],
        value: 10,
        tier: 1,
        description: "Tough sinew removed from a wolf's haunch. Often used in hardy gear.",
        stackable: true,
        type: 'material'
    },

    // --- Placeholder / Key Items ---
    'forest-key': {
        itemId: 1001, // Example unique ID
        itemName: 'forest-key',
        inGameName: 'Forest Key',
        category: 'Key', // Special category
        iconKey: 'KEY_ICON', // Needs definition in AssetConfig
        value: 0, // Key items usually aren't sellable
        tier: 0, // Or a special tier
        description: 'A rusty key dropped by the Goblin Chieftain. Perhaps it unlocks something deeper in the woods?',
        stackable: false,
        type: 'key_item'
    },
    'cavern-key': {
        itemId: 1002,
        itemName: 'cavern-key',
        inGameName: 'Cavern Key',
        category: 'Key',
        iconKey: 'KEY_ICON',
        value: 0,
        tier: 0,
        description: 'A key made of pulsating crystal, obtained from the Crystal Queen. It likely opens the way out or deeper in.',
        stackable: false,
        type: 'key_item'
    },
     'rare_gem': { // Default Boss Drop Example
        itemId: 9001,
        itemName: 'rare_gem',
        inGameName: 'Rare Gem',
        category: 'Gem', // New category?
        iconKey: 'GEM_ICON', // Needs definition
        value: 100,
        tier: 3,
        description: 'A sparkling gemstone of considerable value.',
        stackable: true,
        type: 'material' // Or 'gem'
    },
    'epic_material': { // Default Boss Drop Example
        itemId: 9002,
        itemName: 'epic_material',
        inGameName: 'Epic Material',
        category: 'Material', // Generic category
        iconKey: 'MATERIAL_ICON', // Needs definition (or use existing?)
        value: 250,
        tier: 4,
        description: 'A very rare material pulsing with power, used in powerful crafting recipes.',
        stackable: true,
        type: 'material'
    },

    // Add other items (potions, equipment, quest items) here...
};

// --- HELPER FUNCTIONS ---

/**
 * Get full item data by Item ID (returns a deep copy)
 * @param {string} itemId - The backend ID of the item (e.g., 'goblin-leather')
 * @returns {object|null} - The item data object or null if not found
 */
export function getItemData(itemId) {
    const item = itemDatabase[itemId];
    if (!item) {
        console.warn(`Item data not found for ID: ${itemId}`);
        return null;
    }
    // Return a deep copy to prevent modification of original data
    return JSON.parse(JSON.stringify(item));
}

/**
 * Get all defined Item IDs
 * @returns {string[]} - An array of all item IDs in the database
 */
export function getAllItemIds() {
    return Object.keys(itemDatabase);
}

/**
 * Get all items belonging to a specific category
 * @param {string} category - The category name (e.g., 'Armour', 'Sharps')
 * @returns {object[]} - An array of item data objects matching the category
 */
export function getItemsByCategory(category) {
    return Object.values(itemDatabase)
        .filter(item => item.category === category)
        .map(item => JSON.parse(JSON.stringify(item))); // Return copies
}

/**
 * Get all items belonging to a specific tier
 * @param {number} tier - The item tier (1-5)
 * @returns {object[]} - An array of item data objects matching the tier
 */
export function getItemsByTier(tier) {
    return Object.values(itemDatabase)
        .filter(item => item.tier === tier)
        .map(item => JSON.parse(JSON.stringify(item))); // Return copies
}

// Default export can be the database itself or the functions
// Exporting functions is generally safer for controlled access
export default {
    itemDatabase, // Optionally export the raw data if needed elsewhere
    getItemData,
    getAllItemIds,
    getItemsByCategory,
    getItemsByTier
};