/**
 * items.js
 * Contains data definitions for all items in the game.
 */

// Mapping from Item Category to AssetConfig key for icons
export const categoryIconKeys = {
    Armour: 'ARMOUR',
    Branches: 'BRANCHES',
    Sharps: 'SHARPS',
    Strings: 'STRINGS',
    // Mapping for Equipment Icons (using ASSET_PATHS.EQUIPMENT keys)
    Weapon: { // More specific mapping based on item name/type if needed
        Melee: 'MELEE_WEAPON',
        Ranged: 'RANGED_WEAPON',
        Wand: 'WAND'
    },
    Key: 'KEY_ICON', // Placeholder, define in AssetConfig if needed
    Gem: 'GEM_ICON', // Placeholder, define in AssetConfig if needed
    Material: 'MATERIAL_ICON', // Placeholder, define in AssetConfig if needed
    Potion: { // Specific potion icons
        Health: 'HP_POTION',
        Mana: 'MANA_POTION'
    }
    // Add more categories and their icon keys if needed
};

// Helper to map rarity string to tier number
const rarityToTier = (rarity) => {
    switch (rarity?.toLowerCase()) {
        case 'common': return 1;
        case 'uncommon': return 2;
        case 'rare': return 3;
        case 'epic': return 4;
        case 'legendary': return 5;
        default: return 1; // Default to common if undefined/unknown
    }
};

// Helper to determine equipment icon key
const getEquipmentIconKey = (itemName, category) => {
    const nameLower = itemName.toLowerCase();
    if (category === 'Armour') return categoryIconKeys.Armour;
    if (nameLower.includes('wand') || nameLower.includes('staff') || nameLower.includes('scepter') || nameLower.includes('rod') || nameLower.includes('channeler')) return categoryIconKeys.Weapon.Wand;
    if (nameLower.includes('bow') || nameLower.includes('slingshot') || nameLower.includes('chakram') || nameLower.includes('repeater') || nameLower.includes('arrow') || nameLower.includes('javelin') || nameLower.includes('bolter') || nameLower.includes('cannon') || nameLower.includes('blowpipe') || nameLower.includes('launcher')) return categoryIconKeys.Weapon.Ranged;
    // Default to melee for other weapons
    if (category === 'Weapon') return categoryIconKeys.Weapon.Melee;
    // Fallback for other types if needed
    return categoryIconKeys.Sharps; // Default fallback? Or handle error?
};

// Placeholder Gold Value based on Tier (Adjust these values as needed)
const tierValueMap = { 1: 15, 2: 40, 3: 100, 4: 300, 5: 1000 };

export const itemDatabase = {
    // --- Crafting Materials (IDs 1-1000) ---
    // (Keep all your existing material definitions here, ensuring they have type: 'material' and stackable: true)
    'bandit-armour': { itemId: 1, itemName: 'bandit-armour', inGameName: 'Bandit Leather Scrap', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 5, tier: 2, description: 'Tattered leather scrap from bandit armour.', stackable: true, type: 'material' }, // Renamed slightly for clarity
    'bandit-dagger': { itemId: 2, itemName: 'bandit-dagger', inGameName: 'Crude Dagger Hilt', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 5, tier: 2, description: 'The broken hilt of a bandit dagger.', stackable: true, type: 'material' }, // Changed to material
    'briar-sprite-branch': { itemId: 3, itemName: 'briar-sprite-branch', inGameName: 'Briar Sprite Branch', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 20, tier: 2, description: 'A twisted, thorn-laced twig pulsing with faint magic...', stackable: true, type: 'material'},
    'briar-sprite-pelt': { itemId: 4, itemName: 'briar-sprite-pelt', inGameName: 'Briar Sprite Bark', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 20, tier: 2, description: "Rough bark-like hide...", stackable: true, type: 'material'}, // Changed name
    'crystal-bat-fangs': { itemId: 5, itemName: 'crystal-bat-fangs', inGameName: 'Crystal Bat Fangs', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 20, tier: 2, description: 'Shards of razor crystal...', stackable: true, type: 'material'},
    'crystal-bat-hide': { itemId: 6, itemName: 'crystal-bat-hide', inGameName: 'Crystal Bat Wing', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 20, tier: 2, description: 'Glittering membrane hide...', stackable: true, type: 'material'}, // Changed name
    'crystal-golem-plate': { itemId: 7, itemName: 'crystal-golem-plate', inGameName: 'Crystal Golem Plate', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 30, tier: 3, description: "Jagged plates broken from a crystal golem...", stackable: true, type: 'material'},
    'crystal-golem-shard': { itemId: 8, itemName: 'crystal-golem-shard', inGameName: 'Crystal Golem Shard', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 30, tier: 3, description: 'A fragmented core piece...', stackable: true, type: 'material'},
    'crystal-queen-robes': { itemId: 9, itemName: 'crystal-queen-robes', inGameName: 'Shimmering Crystal Silk', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 40, tier: 4, description: 'Regal silks shimmering with arcane energy...', stackable: true, type: 'material'}, // Changed name
    'crystal-queen-wand': { itemId: 10, itemName: 'crystal-queen-wand', inGameName: 'Radiant Wand Core', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 40, tier: 4, description: 'The core of a radiant wand...', stackable: true, type: 'material'}, // Changed name
    'entling-branch': { itemId: 11, itemName: 'entling-branch', inGameName: 'Entling Branch', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 30, tier: 3, description: "A splintered limb from a felled entling...", stackable: true, type: 'material'},
    'entling-pelt': { itemId: 12, itemName: 'entling-pelt', inGameName: 'Entling Bark', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 30, tier: 3, description: "Rough bark-fur...", stackable: true, type: 'material'}, // Changed name
    'feral-druid-pelt': { itemId: 13, itemName: 'feral-druid-pelt', inGameName: 'Feral Druid Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 30, tier: 3, description: 'A cloak of matted fur...', stackable: true, type: 'material'},
    'feral-druid-wand': { itemId: 14, itemName: 'feral-druid-wand', inGameName: 'Twisted Druid Branch', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 30, tier: 3, description: 'A twisted branch imbued with wild magic...', stackable: true, type: 'material'}, // Changed name
    'forest-wyrmling-fang': { itemId: 15, itemName: 'forest-wyrmling-fang', inGameName: 'Forest Wyrmling Fang', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 50, tier: 5, description: 'A curved fang from a young forest wyrm...', stackable: true, type: 'material'},
    'forest-wyrmling-pelt': { itemId: 16, itemName: 'forest-wyrmling-pelt', inGameName: 'Forest Wyrmling Scale', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 50, tier: 5, description: 'Scaled and vibrant hide...', stackable: true, type: 'material'}, // Changed name
    'goblin-chief-armour': { itemId: 17, itemName: 'goblin-chief-armour', inGameName: 'Reinforced Goblin Scrap', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 15, tier: 3, description: 'Scrap metal used to reinforce goblin armor.', stackable: true, type: 'material'}, // Changed name & value
    'goblin-chief-axe': { itemId: 18, itemName: 'goblin-chief-axe', inGameName: 'Crude Axe Head', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 15, tier: 3, description: 'The head of a crude goblin axe.', stackable: true, type: 'material'}, // Changed name & value
    'goblin-leather': { itemId: 19, itemName: 'goblin-leather', inGameName: 'Goblin Leather', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 10, tier: 1, description: 'Tough leather harvested from goblin scraps...', stackable: true, type: 'material'},
    'goblin-teeth': { itemId: 20, itemName: 'goblin-teeth', inGameName: 'Goblin Teeth', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 10, tier: 1, description: 'Jagged goblin molars...', stackable: true, type: 'material'},
    'goblin-sinew': { itemId: 21, itemName: 'goblin-sinew', inGameName: 'Goblin Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 10, tier: 1, description: 'Resilient fibers stripped from goblin tendons...', stackable: true, type: 'material'},
    'horned-stag-antler': { itemId: 22, itemName: 'horned-stag-antler', inGameName: 'Horned Stag Antler', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 30, tier: 3, description: 'A twisted antler shorn from a majestic stag.', stackable: true, type: 'material'},
    'horned-stag-pelt': { itemId: 23, itemName: 'horned-stag-pelt', inGameName: 'Horned Stag Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 30, tier: 3, description: 'Luxurious fur from the forest\'s fiercest prey.', stackable: true, type: 'material'},
    'miner-gear': { itemId: 24, itemName: 'miner-gear', inGameName: 'Battered Miner Lamp', category: 'Material', iconKey: categoryIconKeys['Material'], value: 15, tier: 3, description: 'A battered lamp looted from a fallen miner.', stackable: true, type: 'material'}, // Changed name & category
    'miner-pickaxe': { itemId: 25, itemName: 'miner-pickaxe', inGameName: 'Sturdy Pickaxe Head', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 15, tier: 3, description: 'The head of a well-worn but sturdy pickaxe.', stackable: true, type: 'material'}, // Changed name
    'miner-straps': { itemId: 26, itemName: 'miner-straps', inGameName: 'Miner Straps', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 30, tier: 3, description: 'Leather straps used to carry ore and gear...', stackable: true, type: 'material'},
    'moss-troll-pelt': { itemId: 27, itemName: 'moss-troll-pelt', inGameName: 'Moss Troll Hide', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 40, tier: 4, description: 'Thick, damp hide peeled from a moss troll...', stackable: true, type: 'material'}, // Changed name
    'moss-troll-shard': { itemId: 28, itemName: 'moss-troll-shard', inGameName: 'Moss Troll Heartstone Shard', category: 'Gem', iconKey: categoryIconKeys['Gem'], value: 40, tier: 4, description: 'A glowing shard from a moss troll\'s enchanted heartstone.', stackable: true, type: 'material'}, // Changed name & category
    'mushroom-arms': { itemId: 29, itemName: 'mushroom-arms', inGameName: 'Fungal Spore Limb', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 10, tier: 1, description: 'Fleshy fungal limbs...', stackable: true, type: 'material'}, // Changed name & category
    'mushroom-hide': { itemId: 30, itemName: 'mushroom-hide', inGameName: 'Mushroom Cap Hide', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 10, tier: 1, description: 'Spongy and fibrous hide...', stackable: true, type: 'material'}, // Changed name
    'mushroom-sinew': { itemId: 31, itemName: 'mushroom-sinew', inGameName: 'Mushroom Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 10, tier: 1, description: 'Elastic threads harvested from fungal beasts...', stackable: true, type: 'material'},
    'owlbear-cub-fang': { itemId: 32, itemName: 'owlbear-cub-fang', inGameName: 'Owlbear Cub Fang', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 20, tier: 2, description: 'A small yet vicious tooth...', stackable: true, type: 'material'},
    'owlbear-cub-pelt': { itemId: 33, itemName: 'owlbear-cub-pelt', inGameName: 'Owlbear Cub Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 20, tier: 2, description: 'Soft fur from a young owlbear.', stackable: true, type: 'material'},
    'owlbear-cub-sinew': { itemId: 34, itemName: 'owlbear-cub-sinew', inGameName: 'Owlbear Cub Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 20, tier: 2, description: 'Taut sinew taken from an owlbear cub\'s limb.', stackable: true, type: 'material'},
    'spider-carapace': { itemId: 35, itemName: 'spider-carapace', inGameName: 'Spider Carapace', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 20, tier: 2, description: 'Cracked chitin plate from a slain forest spider.', stackable: true, type: 'material'},
    'spider-fang': { itemId: 36, itemName: 'spider-fang', inGameName: 'Spider Fang', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 20, tier: 2, description: 'Venom-tipped fang extracted from a twitching spider corpse.', stackable: true, type: 'material'},
    'spider-silk': { itemId: 37, itemName: 'spider-silk', inGameName: 'Spider Silk', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 20, tier: 2, description: 'Gossamer threads gathered from the webbed remains...', stackable: true, type: 'material'},
    'thorn-lurker-branch': { itemId: 38, itemName: 'thorn-lurker-branch', inGameName: 'Thorn Lurker Branch', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 20, tier: 2, description: 'Barbed limb ripped from a lurking forest predator.', stackable: true, type: 'material'},
    'thorn-lurker-pelt': { itemId: 39, itemName: 'thorn-lurker-pelt', inGameName: 'Thorn Lurker Hide', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 20, tier: 2, description: 'Rugged and thorn-studded hide...', stackable: true, type: 'material'}, // Changed name
    'wild-boar-fang': { itemId: 40, itemName: 'wild-boar-fang', inGameName: 'Wild Boar Fang', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 10, tier: 1, description: 'A jagged tusk broken from the charging maw...', stackable: true, type: 'material'},
    'wild-boar-pelt': { itemId: 41, itemName: 'wild-boar-pelt', inGameName: 'Wild Boar Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 10, tier: 1, description: 'Coarse, bristled pelt taken after a bloody struggle...', stackable: true, type: 'material'},
    'wild-boar-sinew': { itemId: 42, itemName: 'wild-boar-sinew', inGameName: 'Wild Boar Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 10, tier: 1, description: 'Thick sinew stripped from boar legs...', stackable: true, type: 'material'},
    'witch-hare-pelt': { itemId: 43, itemName: 'witch-hare-pelt', inGameName: 'Witch Hare Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 40, tier: 4, description: 'Silken fur harvested from an eerie witch hare.', stackable: true, type: 'material'},
    'witch-hare-wand': { itemId: 44, itemName: 'witch-hare-wand', inGameName: 'Cursed Hare Branch', category: 'Branches', iconKey: categoryIconKeys['Branches'], value: 40, tier: 4, description: 'A peculiar branch crackling with residual enchantments.', stackable: true, type: 'material'}, // Changed name
    'witch-hare-sinew': { itemId: 45, itemName: 'witch-hare-sinew', inGameName: 'Witch Hare Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 40, tier: 4, description: 'Thread-like sinew with unnatural elasticity...', stackable: true, type: 'material'},
    'wolf-claws': { itemId: 46, itemName: 'wolf-claws', inGameName: 'Wolf Claws', category: 'Sharps', iconKey: categoryIconKeys['Sharps'], value: 10, tier: 1, description: 'Razor claws cut from a snarling wolf\'s paw.', stackable: true, type: 'material'},
    'wolf-pelt': { itemId: 47, itemName: 'wolf-pelt', inGameName: 'Wolf Pelt', category: 'Armour', iconKey: categoryIconKeys['Armour'], value: 10, tier: 1, description: 'A dense pelt stripped from a slain wolf.', stackable: true, type: 'material'},
    'wolf-sinew': { itemId: 48, itemName: 'wolf-sinew', inGameName: 'Wolf Sinew', category: 'Strings', iconKey: categoryIconKeys['Strings'], value: 10, tier: 1, description: 'Tough sinew removed from a wolf\'s haunch.', stackable: true, type: 'material'},

    // --- Key/Placeholder Items (IDs 1001+) ---
    'forest-key': { itemId: 1001, itemName: 'forest-key', inGameName: 'Forest Key', category: 'Key', iconKey: 'KEY_ICON', value: 0, tier: 0, description: 'A rusty key dropped by the Goblin Chieftain...', stackable: false, type: 'key_item'},
    'cavern-key': { itemId: 1002, itemName: 'cavern-key', inGameName: 'Cavern Key', category: 'Key', iconKey: 'KEY_ICON', value: 0, tier: 0, description: 'A key made of pulsating crystal...', stackable: false, type: 'key_item'},
    'rare_gem': { itemId: 9001, itemName: 'rare_gem', inGameName: 'Rare Gem', category: 'Gem', iconKey: 'GEM_ICON', value: 100, tier: 3, description: 'A sparkling gemstone...', stackable: true, type: 'material'},
    'epic_material': { itemId: 9002, itemName: 'epic_material', inGameName: 'Epic Material', category: 'Material', iconKey: 'MATERIAL_ICON', value: 250, tier: 4, description: 'A very rare material...', stackable: true, type: 'material'},

    // --- Crafted Equipment (IDs 10000+) ---
    // == Melee Weapons ==
    'rusted-shortsword': { itemId: 10001, itemName: 'rusted-shortsword', inGameName: 'Rusted Shortsword', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A dull, worn blade...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    'wooden-club': { itemId: 10002, itemName: 'wooden-club', inGameName: 'Wooden Club', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A crude club...', stackable: false, equipSlot: 'weapon', effects: { attack: 2 }, type: 'equipment' },
    'cracked-dagger': { itemId: 10003, itemName: 'cracked-dagger', inGameName: 'Cracked Dagger', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A chipped dagger...', stackable: false, equipSlot: 'weapon', effects: { attack: 2 }, type: 'equipment' },
    'iron-mace': { itemId: 10004, itemName: 'iron-mace', inGameName: 'Iron Mace', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A basic mace...', stackable: false, equipSlot: 'weapon', effects: { attack: 4 }, type: 'equipment' },
    'worn-spear': { itemId: 10005, itemName: 'worn-spear', inGameName: 'Worn Spear', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A long, splintered spear...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    'training-sword': { itemId: 10006, itemName: 'training-sword', inGameName: 'Training Sword', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'Issued to recruits...', stackable: false, equipSlot: 'weapon', effects: { attack: 2 }, type: 'equipment' },
    'bone-shard-blade': { itemId: 10007, itemName: 'bone-shard-blade', inGameName: 'Bone Shard Blade', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A jagged blade carved from bone...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    'rusty-cleaver': { itemId: 10008, itemName: 'rusty-cleaver', inGameName: 'Rusty Cleaver', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A butcher’s cleaver...', stackable: false, equipSlot: 'weapon', effects: { attack: 4 }, type: 'equipment' },
    'blunt-hatchet': { itemId: 10009, itemName: 'blunt-hatchet', inGameName: 'Blunt Hatchet', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'A small axe with a dulled edge...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    'stone-knuckles': { itemId: 10010, itemName: 'stone-knuckles', inGameName: 'Stone Knuckles', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[1], tier: 1, description: 'Weighted stone rings...', stackable: false, equipSlot: 'weapon', effects: { attack: 2 }, type: 'equipment' },
    'iron-fang-blade': { itemId: 10011, itemName: 'iron-fang-blade', inGameName: 'Iron Fang Blade', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[2], tier: 2, description: 'A sharpened short sword forged with beast fang...', stackable: false, equipSlot: 'weapon', effects: { attack: 6 }, type: 'equipment' },
    'dual-hook-daggers': { itemId: 10012, itemName: 'dual-hook-daggers', inGameName: 'Dual Hook Daggers', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[2], tier: 2, description: 'Twin curved daggers...', stackable: false, equipSlot: 'weapon', effects: { attack: 5 }, type: 'equipment' },
    'emberbrand-hammer': { itemId: 10013, itemName: 'emberbrand-hammer', inGameName: 'Emberbrand Hammer', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[2], tier: 2, description: 'A slightly enchanted hammer...', stackable: false, equipSlot: 'weapon', effects: { attack: 6 }, type: 'equipment' }, // Add fire effect?
    'reinforced-spear': { itemId: 10014, itemName: 'reinforced-spear', inGameName: 'Reinforced Spear', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[2], tier: 2, description: 'A spear with a reinforced iron tip...', stackable: false, equipSlot: 'weapon', effects: { attack: 5 }, type: 'equipment' },
    'nightpiercer': { itemId: 10015, itemName: 'nightpiercer', inGameName: 'Nightpiercer', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[3], tier: 3, description: 'A shadow-forged blade...', stackable: false, equipSlot: 'weapon', effects: { attack: 8 }, type: 'equipment' },
    'runed-battle-axe': { itemId: 10016, itemName: 'runed-battle-axe', inGameName: 'Runed Battle Axe', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[3], tier: 3, description: 'A heavy axe engraved with forgotten runes...', stackable: false, equipSlot: 'weapon', effects: { attack: 9 }, type: 'equipment' },
    'serpents-fang': { itemId: 10017, itemName: 'serpents-fang', inGameName: 'Serpent’s Fang', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[3], tier: 3, description: 'A curved blade coated in perpetual venom...', stackable: false, equipSlot: 'weapon', effects: { attack: 10 }, type: 'equipment' }, // Add poison effect?
    'stormcaller-blade': { itemId: 10018, itemName: 'stormcaller-blade', inGameName: 'Stormcaller Blade', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[4], tier: 4, description: 'A longsword that hums with dormant lightning...', stackable: false, equipSlot: 'weapon', effects: { attack: 12 }, type: 'equipment' }, // Add lightning effect?
    'bloodbound-claymore': { itemId: 10019, itemName: 'bloodbound-claymore', inGameName: 'Bloodbound Claymore', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[4], tier: 4, description: 'This massive sword grows stronger...', stackable: false, equipSlot: 'weapon', effects: { attack: 13 }, type: 'equipment' }, // Add special effect?
    'aetherius-blade-of-dawn': { itemId: 10020, itemName: 'aetherius-blade-of-dawn', inGameName: 'Aetherius, Blade of Dawn', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Melee, value: tierValueMap[5], tier: 5, description: 'Forged in celestial fire...', stackable: false, equipSlot: 'weapon', effects: { attack: 18 }, type: 'equipment' }, // Add light effect?

    // == Ranged Weapons ==
    'crude-slingshot': { itemId: 10101, itemName: 'crude-slingshot', inGameName: 'Crude Slingshot', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[1], tier: 1, description: 'A simple wooden frame...', stackable: false, equipSlot: 'weapon', effects: { attack: 2 }, type: 'equipment' },
    'bent-shortbow': { itemId: 10102, itemName: 'bent-shortbow', inGameName: 'Bent Shortbow', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[1], tier: 1, description: 'A hastily strung bow...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    'throwing-knives': { itemId: 10103, itemName: 'throwing-knives', inGameName: 'Throwing Knives', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[1], tier: 1, description: 'Balanced steel knives...', stackable: false, equipSlot: 'weapon', effects: { attack: 3 }, type: 'equipment' },
    // ... Add remaining common ranged ...
    'ironwood-bow': { itemId: 10111, itemName: 'ironwood-bow', inGameName: 'Ironwood Bow', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[2], tier: 2, description: 'A bow carved from ironwood...', stackable: false, equipSlot: 'weapon', effects: { attack: 6 }, type: 'equipment' },
    'twin-chakrams': { itemId: 10112, itemName: 'twin-chakrams', inGameName: 'Twin Chakrams', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[2], tier: 2, description: 'Lightweight throwing rings...', stackable: false, equipSlot: 'weapon', effects: { attack: 5 }, type: 'equipment' },
    'clockwork-repeater': { itemId: 10113, itemName: 'clockwork-repeater', inGameName: 'Clockwork Repeater', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[2], tier: 2, description: 'A semi-mechanical crossbow...', stackable: false, equipSlot: 'weapon', effects: { attack: 6 }, type: 'equipment' },
    'ember-fletched-arrows': { itemId: 10114, itemName: 'ember-fletched-arrows', inGameName: 'Ember-Fletched Arrows', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[2], tier: 2, description: 'Arrows with magically treated fletching...', stackable: false, equipSlot: 'weapon', effects: { attack: 5 }, type: 'equipment' }, // Requires ammo?
    'widows-whisper': { itemId: 10115, itemName: 'widows-whisper', inGameName: 'Widow’s Whisper', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[3], tier: 3, description: 'A silent bow...', stackable: false, equipSlot: 'weapon', effects: { attack: 8 }, type: 'equipment' },
    // ... Add remaining rare, epic, legendary ranged ...
    'starshard-piercer': { itemId: 10120, itemName: 'starshard-piercer', inGameName: 'Starshard Piercer', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Ranged, value: tierValueMap[5], tier: 5, description: 'Forged from stardust...', stackable: false, equipSlot: 'weapon', effects: { attack: 18 }, type: 'equipment' },

    // == Wands / Staffs ==
    'charred-wand': { itemId: 10201, itemName: 'charred-wand', inGameName: 'Charred Wand', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[1], tier: 1, description: 'A brittle wand...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 2 }, type: 'equipment' }, // Using magicAttack
    'hollow-branch-wand': { itemId: 10202, itemName: 'hollow-branch-wand', inGameName: 'Hollow Branch Wand', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[1], tier: 1, description: 'A hollow stick...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 2 }, type: 'equipment' },
    'cracked-oak-staff': { itemId: 10203, itemName: 'cracked-oak-staff', inGameName: 'Cracked Oak Staff', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[1], tier: 1, description: 'A warped wooden staff...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 3 }, type: 'equipment' },
    // ... Add remaining common wands ...
    'wand-of-whispers': { itemId: 10211, itemName: 'wand-of-whispers', inGameName: 'Wand of Whispers', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[2], tier: 2, description: 'Channels soft, lingering echoes...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 5 }, type: 'equipment' },
    'staff-of-emberlight': { itemId: 10212, itemName: 'staff-of-emberlight', inGameName: 'Staff of Emberlight', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[2], tier: 2, description: 'Holds a fragment of eternal flame...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 6 }, type: 'equipment' },
    'glimmering-crystal-rod': { itemId: 10213, itemName: 'glimmering-crystal-rod', inGameName: 'Glimmering Crystal Rod', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[2], tier: 2, description: 'A short rod crowned with a glowing quartz...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 5 }, type: 'equipment' },
    'rootwoven-channel-staff': { itemId: 10214, itemName: 'rootwoven-channel-staff', inGameName: 'Rootwoven Channel Staff', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[2], tier: 2, description: 'Crafted from deep-forest roots...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 6 }, type: 'equipment' },
    'moonlit-arcwand': { itemId: 10215, itemName: 'moonlit-arcwand', inGameName: 'Moonlit Arcwand', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[3], tier: 3, description: 'Reflects moonlight...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 8 }, type: 'equipment' },
    // ... Add remaining rare, epic, legendary wands ...
    'aetherion-heart-of-realms': { itemId: 10220, itemName: 'aetherion-heart-of-realms', inGameName: 'Aetherion, Heart of Realms', category: 'Weapon', iconKey: categoryIconKeys.Weapon.Wand, value: tierValueMap[5], tier: 5, description: 'Formed from pure leyline crystal...', stackable: false, equipSlot: 'weapon', effects: { magicAttack: 18 }, type: 'equipment' },

    // == Crafted Armor == (Assuming 'body' slot for all listed)
    'tattered-cloth-robes': { itemId: 10301, itemName: 'tattered-cloth-robes', inGameName: 'Tattered Cloth Robes', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[1], tier: 1, description: 'Barely stitched together...', stackable: false, equipSlot: 'body', effects: { defense: 1 }, type: 'equipment' },
    'worn-leather-vest': { itemId: 10302, itemName: 'worn-leather-vest', inGameName: 'Worn Leather Vest', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[1], tier: 1, description: 'Cracked leather...', stackable: false, equipSlot: 'body', effects: { defense: 2 }, type: 'equipment' },
    'rusted-chainmail': { itemId: 10303, itemName: 'rusted-chainmail', inGameName: 'Rusted Chainmail', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[1], tier: 1, description: 'Offers minimal defense...', stackable: false, equipSlot: 'body', effects: { defense: 3 }, type: 'equipment' },
    // ... Add remaining common armor ...
    'hardened-leather-armor': { itemId: 10311, itemName: 'hardened-leather-armor', inGameName: 'Hardened Leather Armor', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[2], tier: 2, description: 'Treated with oils and flame...', stackable: false, equipSlot: 'body', effects: { defense: 5 }, type: 'equipment' },
    'echo-ring-mail': { itemId: 10312, itemName: 'echo-ring-mail', inGameName: 'Echo-Ring Mail', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[2], tier: 2, description: 'Emits a faint chime...', stackable: false, equipSlot: 'body', effects: { defense: 6 }, type: 'equipment' },
    'scalehide-harness': { itemId: 10313, itemName: 'scalehide-harness', inGameName: 'Scalehide Harness', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[2], tier: 2, description: 'Made from the hide of a scaled beast...', stackable: false, equipSlot: 'body', effects: { defense: 5 }, type: 'equipment' },
    'emberforged-vest': { itemId: 10314, itemName: 'emberforged-vest', inGameName: 'Emberforged Vest', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[2], tier: 2, description: 'Light armor warmed by ember runes...', stackable: false, equipSlot: 'body', effects: { defense: 6 }, type: 'equipment' }, // Add fire resist?
    'sentinels-bastion-plate': { itemId: 10315, itemName: 'sentinels-bastion-plate', inGameName: 'Sentinel’s Bastion Plate', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[3], tier: 3, description: 'Sturdy steel plate...', stackable: false, equipSlot: 'body', effects: { defense: 8 }, type: 'equipment' },
    // ... Add remaining rare, epic, legendary armor ...
    'aetheric-wardens-regalia': { itemId: 10320, itemName: 'aetheric-wardens-regalia', inGameName: 'Aetheric Warden’s Regalia', category: 'Armour', iconKey: categoryIconKeys.Armour, value: tierValueMap[5], tier: 5, description: 'The legendary armor...', stackable: false, equipSlot: 'body', effects: { defense: 18 }, type: 'equipment' },

     // --- POTIONS (Example) ---
     'hp-potion': {
        itemId: 20001,
        itemName: 'hp-potion',
        inGameName: 'Health Potion',
        category: 'Potion',
        iconKey: categoryIconKeys.Potion.Health,
        value: 25, tier: 1,
        description: 'A common potion that restores a small amount of health.',
        stackable: true,
        type: 'consumable',
        potionEffect: { stat: 'health', value: 50 } // Example effect
    },
    'mana-potion': {
        itemId: 20002,
        itemName: 'mana-potion',
        inGameName: 'Mana Potion',
        category: 'Potion',
        iconKey: categoryIconKeys.Potion.Mana,
        value: 30, tier: 1,
        description: 'A simple concoction that restores a bit of mana.',
        stackable: true,
        type: 'consumable',
        potionEffect: { stat: 'mana', value: 30 } // Example effect
    },

};


// --- HELPER FUNCTIONS ---



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

// --- HELPER FUNCTIONS --- (Keep existing: getItemData, getAllItemIds, etc.)
/**
 * Get full item data by Item ID (returns a deep copy)
 * @param {string} itemId - The backend ID of the item (e.g., 'goblin-leather', 'rusted-shortsword')
 * @returns {object|null} - The item data object or null if not found
 */
export function getItemData(itemId) {
    const item = itemDatabase[itemId];
    if (!item) {
        console.warn(`Item data not found for ID: ${itemId}`);
        return null;
    }
    return JSON.parse(JSON.stringify(item));
}



export default {
    itemDatabase,
    getItemData,
    getAllItemIds,
    getItemsByCategory,
    getItemsByTier,
    getEquipmentIconKey, // Export helper if needed elsewhere
    rarityToTier // Export helper if needed elsewhere
};