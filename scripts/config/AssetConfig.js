/**
 * AssetConfig - Centralized configuration for all game assets
 * This eliminates hardcoded asset paths and makes updating assets easier
 */
export const ASSET_PATHS = {
    // Backgrounds
    BACKGROUNDS: {
        COMBAT: 'assets/sprites/backgrounds/combat-bg.png',
        CHARACTER: 'assets/sprites/backgrounds/character-bg.png',
        INVENTORY: 'assets/sprites/backgrounds/inventory-bg.png',
        TITLE: 'assets/sprites/backgrounds/title-bg.png',
        OVERWORLD: 'assets/sprites/backgrounds/overworld-bg.png',
        DUNGEON: 'assets/sprites/backgrounds/dungeon-bg.png',
        BATTLE_RESULT: 'assets/sprites/backgrounds/battle-result-bg.png'
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
    
    // Effects
    EFFECTS: {
        SLASH: 'assets/sprites/effects/slash.png',
        FIRE: 'assets/sprites/effects/fire.png',
        ICE: 'assets/sprites/effects/ice.png',
        ARCANE: 'assets/sprites/effects/arcane.png',
        POISON: 'assets/sprites/effects/poison.png',
        BLEED: 'assets/sprites/effects/bleed.png',
        STUN: 'assets/sprites/effects/stun.png',
        HEAL: 'assets/sprites/effects/heal.png',
        SHIELD: 'assets/sprites/effects/shield.png',
        CRYSTAL: 'assets/sprites/effects/crystal.png',
        GHOST: 'assets/sprites/effects/ghost.png'
    },
    
    // Enemy sprites
    ENEMIES: {
        GOBLIN: 'assets/sprites/enemies/goblin-sprite.png',
        WOLF: 'assets/sprites/enemies/wolf-sprite.png',
        MUSHROOM: 'assets/sprites/enemies/mushroom-sprite.png',
        BAT: 'assets/sprites/enemies/bat-sprite.png',
        SKELETON: 'assets/sprites/enemies/skeleton-sprite.png',
        SLIME: 'assets/sprites/enemies/slime-sprite.png',
        SPIDER: 'assets/sprites/enemies/spider-sprite.png',
        GHOST: 'assets/sprites/enemies/ghost-sprite.png',
        GOLEM: 'assets/sprites/enemies/golem-sprite.png',
        DRAGON: 'assets/sprites/enemies/dragon-sprite.png',
        DEFAULT: 'assets/sprites/enemies/default-enemy.png'
    },
    
    // Player sprites
    PLAYERS: {
        WARRIOR: 'assets/sprites/characters/warrior-sprite.png',
        MAGE: 'assets/sprites/characters/mage-sprite.png',
        ROGUE: 'assets/sprites/characters/rogue-sprite.png',
        CLERIC: 'assets/sprites/characters/cleric-sprite.png',
        RANGER: 'assets/sprites/characters/ranger-sprite.png',
        DEFAULT: 'assets/sprites/characters/default-player.png'
    },
    
    // Audio
    SOUNDS: {
        ATTACK: 'assets/audio/attack.mp3',
        ENEMY_HIT: 'assets/audio/enemy-hit.mp3',
        PLAYER_HIT: 'assets/audio/player-hit.mp3',
        HEAL: 'assets/audio/heal.mp3',
        DEFEND: 'assets/audio/defend.mp3',
        VICTORY: 'assets/audio/victory.mp3',
        DEFEAT: 'assets/audio/defeat.mp3',
        MENU_SELECT: 'assets/audio/menu-select.mp3',
        LEVEL_UP: 'assets/audio/level-up.mp3'
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
