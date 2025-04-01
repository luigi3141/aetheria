/**
 * AssetConfig - Centralized configuration for all game assets
 * This eliminates hardcoded asset paths and makes updating assets easier
 */
export const ASSET_PATHS = {
    // Backgrounds
    BACKGROUNDS: {
        COMBAT: 'assets/sprites/backgrounds/combat-bg.png',
        MENU: 'assets/sprites/backgrounds/menu-bg.png',
        CHARACTER: 'assets/sprites/backgrounds/character-bg.png',
        DEFEAT: 'assets/sprites/backgrounds/defeat-bg.png',
        INVENTORY: 'assets/sprites/backgrounds/inventory-bg.png',
        TITLE: 'assets/sprites/backgrounds/title-bg.png',
        OVERWORLD: 'assets/sprites/backgrounds/overworld-bg.png',
        DUNGEON: 'assets/sprites/backgrounds/dungeon-bg.png',
        BATTLE_RESULT: 'assets/sprites/backgrounds/battle-result-bg.png',
        FOREST: 'assets/sprites/backgrounds/forest-bg.png',
        CAVERNS: 'assets/sprites/backgrounds/caverns-bg.png',
        CRAFTING: 'assets/sprites/backgrounds/workshop-bg.png',
        SHOP: 'assets/sprites/backgrounds/shop-bg.png'
    },
    
    // Character sprites
    PLAYERS: {
        DEFAULT: 'assets/sprites/characters/warrior-sprite.png',
        WARRIOR: 'assets/sprites/characters/warrior-sprite.png',
        MAGE: 'assets/sprites/characters/mage-sprite.png',
        ROGUE: 'assets/sprites/characters/rogue-sprite.png',
        CLERIC: 'assets/sprites/characters/cleric-sprite.png',
        RANGER: 'assets/sprites/characters/ranger-sprite.png',
        BARD: 'assets/sprites/characters/bard-sprite.png'
    },
    
    // Enemy sprites
    ENEMIES: {
        DEFAULT: 'assets/sprites/enemies/default-enemy.png',
        BANDIT: 'assets/sprites/enemies/bandit-sprite.png',
        BAT: 'assets/sprites/enemies/bat-sprite.png',
        BRIAR_SPIRIT: 'assets/sprites/enemies/briar-spirit-sprite.png',
        ENTLING: 'assets/sprites/enemies/entling-sprite.png',
        FERAL_DRUID: 'assets/sprites/enemies/feral-druid-sprite.png',
        FOREST_WYRMLING: 'assets/sprites/enemies/forest-wyrmling-sprite.png',
        GOBLIN: 'assets/sprites/enemies/goblin-sprite.png',
        GOBLIN_CHIEF: 'assets/sprites/enemies/goblin-chief-sprite.png',
        HORNED_STAG: 'assets/sprites/enemies/horned-stag.png',
        MOSS_TROLL: 'assets/sprites/enemies/moss-troll-sprite.png',
        MUSHROOM: 'assets/sprites/enemies/mushroom-sprite.png',
        OWLBEAR_CUB: 'assets/sprites/enemies/owlbear-cub-sprite.png',
        SKELETON: 'assets/sprites/enemies/skeleton-sprite.png',
        SLIME: 'assets/sprites/enemies/slime-sprite.png',
        SPIDER: 'assets/sprites/enemies/spider-sprite.png',
        THORN_LURKER: 'assets/sprites/enemies/thorn-lurker-sprite.png',
        BOAR: 'assets/sprites/enemies/wild-boar-sprite.png',
        WITCH_HARE: 'assets/sprites/enemies/witch-hare-sprite.png',
        WOLF: 'assets/sprites/enemies/wolf-sprite.png',
        FOREST_WYRMLING: 'assets/sprites/enemies/forest-wyrmling-sprite.png'
    },
    
    // Effect sprites
    EFFECTS: {
        SLASH: 'assets/sprites/effects/slash.png',
        ARCANE: 'assets/sprites/effects/arcane.png',
        FIRE: 'assets/sprites/effects/fire.png',
        POISON: 'assets/sprites/effects/poison.png',
        BLEED: 'assets/sprites/effects/bleed.png',
        STUN: 'assets/sprites/effects/stun.png',
        CRYSTAL: 'assets/sprites/effects/crystal.png',
        GHOST: 'assets/sprites/effects/ghost.png'
    },
    
    // UI
    UI: {
        HEALTH_BAR: 'assets/sprites/ui/health-bar.png',
        MANA_BAR: 'assets/sprites/ui/mana-bar.png'
    },
    
    // UI sprites
    SPRITES: {
        ITEM: 'assets/sprites/ui/item-icon.png',
        MATERIAL: 'assets/sprites/ui/material-icon.png'
    },
    
    // Equipment sprites
    EQUIPMENT: {
        ARMOUR: 'assets/sprites/equipment/armour-sprite.png',
        MELEE_WEAPON: 'assets/sprites/equipment/melee-weapon-sprite.png',
        RANGED_WEAPON: 'assets/sprites/equipment/ranged-weapon-sprite.png',
        WAND: 'assets/sprites/equipment/wand-sprite.png'
    },

    // Equipment slot icons
    EQUIPMENT_SLOTS: {
        ARMOUR: 'assets/sprites/icons/slot-head-placeholder.png',
        ACCESSORY: 'assets/sprites/icons/slot-accessory-placeholder.png'
    },
    
    // Crafting material sprites
    MATERIALS: {
        ARMOUR: 'assets/sprites/loot-materials/armour-crafting-sprite.png',
        BRANCHES: 'assets/sprites/loot-materials/branches-crafting-sprite.png',
        SHARPS: 'assets/sprites/loot-materials/sharps-crafting-sprite.png',
        STRINGS: 'assets/sprites/loot-materials/strings-crafting-sprite.png'
    },

    // Crafting material sprites
    ITEMS: {
        GOLD: 'assets/sprites/icons/gold-icon-sprite.png',
        HP_ICON: 'assets/sprites/icons/hp-icon-sprite.png',
        MANA_ICON: 'assets/sprites/icons/mana-icon-sprite.png',
        HP_POTION: 'assets/sprites/icons/hp-potion-sprite.png',
        MANA_POTION: 'assets/sprites/icons/mana-potion-sprite.png',
        SLOT_HEAD: 'assets/sprites/icons/slot-head-placeholder.png',
        SLOT_ACCESSORY: 'assets/sprites/icons/slot-accessory-placeholder.png',
        SLOT_RANGED: 'assets/sprites/icons/slot-ranged-placeholder.png',
        SLOT_WAND: 'assets/sprites/icons/slot-wand-placeholder.png'
    },
    
    // Audio for combat
    SOUNDS: {
        combat: {
            attack: 'assets/audio/combat/attack.mp3',
            hit: 'assets/audio/combat/player-hit.mp3',
            victory: 'assets/audio/combat/victory.mp3',
            defeat: 'assets/audio/combat/defeat.mp3',
            levelUp: 'assets/audio/combat/level-up.mp3',
            heal: 'assets/audio/combat/heal.mp3',
            playerHit: 'assets/audio/combat/player-hit.mp3'
        },
        ui: {
            buttonClick: 'assets/audio/ui/button-click.mp3',
            menuOpen: 'assets/audio/ui/menu-open.mp3',
            menuClose: 'assets/audio/ui/menu-close.mp3'
        }
    },
    
    // Music
    MUSIC: {
        TITLE: 'assets/audio/music/title.mp3',
        BATTLE: 'assets/audio/music/battle.mp3',
        VICTORY: 'assets/audio/music/victory.mp3',
        DEFEAT: 'assets/audio/music/defeat.mp3',
        OVERWORLD: 'assets/audio/music/overworld.mp3',
        DUNGEON: 'assets/audio/music/dungeon.mp3'
    },
    
    // Character portraits
    PORTRAITS: {
        WARRIOR: 'assets/sprites/characters/warrior-portrait.png',
        MAGE: 'assets/sprites/characters/mage-portrait.png',
        ROGUE: 'assets/sprites/characters/rogue-portrait.png',
        CLERIC: 'assets/sprites/characters/cleric-portrait.png',
        RANGER: 'assets/sprites/characters/ranger-portrait.png',
        BARD: 'assets/sprites/characters/bard-portrait.png',
        DEFAULT: 'assets/sprites/characters/default-portrait.png'
    },
    
    // Icons
    ICONS: {
        PLAYER: 'assets/sprites/icons/player-icon.png',
        HEALTH: 'assets/sprites/icons/health-icon.png',
        MANA: 'assets/sprites/icons/mana-icon.png',
        STRENGTH: 'assets/sprites/icons/strength-icon.png',
        AGILITY: 'assets/sprites/icons/agility-icon.png',
        INTELLIGENCE: 'assets/sprites/icons/intelligence-icon.png',
        CONSTITUTION: 'assets/sprites/icons/constitution-icon.png'
    },
    
    // Fallback assets (used when actual assets not found)
    FALLBACKS: {
        PORTRAIT: 'assets/sprites/characters/default-portrait.png',
        ITEM: 'assets/sprites/items/default-item.png',
        ENEMY: 'assets/sprites/enemies/default-enemy.png'
    }
};

/**
 * Helper functions for asset management
 */
export const AssetHelper = {
    /**
     * Get portrait path for a character class
     * @param {string} characterClass - Class name in lowercase
     * @returns {string} Portrait path
     */
    getPortraitPath(characterClass) {
        const className = characterClass.toUpperCase();
        return ASSET_PATHS.PORTRAITS[className] || ASSET_PATHS.FALLBACKS.PORTRAIT;
    },
    
    /**
     * Get background path for a scene
     * @param {string} sceneName - Scene name in lowercase
     * @returns {string} Background path
     */
    getBackgroundPath(sceneName) {
        const sceneType = sceneName.replace('Scene', '').toUpperCase();
        return ASSET_PATHS.BACKGROUNDS[sceneType] || ASSET_PATHS.BACKGROUNDS.TITLE;
    }
};

export default {
    ASSET_PATHS,
    AssetHelper
};
