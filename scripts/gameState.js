const gameState = {
    player: {
        name: 'Hero',
        class: 'Warrior',
        level: 1,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        agility: 8,
        intelligence: 6,
        defense: 5,
        experience: 0,
        experienceToNextLevel: 100,
        gold: 50,
        inventory: {
            items: [],
            maxItems: 20,
            equipped: {
                weapon: null,
                armor: null,
                accessory: null
            }
        },
        abilities: ['slash', 'block']
    },
    
    quests: {
        active: [],
        completed: []
    },
    
    dungeons: {
        discovered: ['verdant-woods'],
        current: null
    },
    
    currentDungeon: null,
    
    combat: {
        inCombat: false,
        enemies: [],
        turn: 'player',
        currentEnemy: 0,
        actionLog: [],
        loot: {
            gold: 0,
            items: [],
            experience: 0
        }
    },
    
    // Enemy templates for generating encounters
    enemyTemplates: {
        // Verdant Woods enemies
        'wolf': {
            name: 'Wolf',
            baseHealth: 30,
            baseDamage: 5,
            agility: 8,
            abilities: ['bite', 'howl'],
            loot: [
                { item: 'wolf-pelt', chance: 0.7 },
                { item: 'wolf-fang', chance: 0.3 }
            ],
            experienceReward: 20,
            goldReward: { min: 5, max: 15 }
        },
        'bandit': {
            name: 'Bandit',
            baseHealth: 40,
            baseDamage: 6,
            agility: 6,
            abilities: ['slash', 'steal'],
            loot: [
                { item: 'dagger', chance: 0.3 },
                { item: 'leather-scraps', chance: 0.5 },
                { item: 'gold-pouch', chance: 0.2 }
            ],
            experienceReward: 25,
            goldReward: { min: 10, max: 20 }
        },
        'spider': {
            name: 'Giant Spider',
            baseHealth: 25,
            baseDamage: 7,
            agility: 10,
            abilities: ['bite', 'web'],
            loot: [
                { item: 'spider-silk', chance: 0.6 },
                { item: 'venom-sac', chance: 0.4 }
            ],
            experienceReward: 22,
            goldReward: { min: 5, max: 12 }
        },
        // Verdant Woods bosses
        'alpha-wolf': {
            name: 'Alpha Wolf',
            baseHealth: 80,
            baseDamage: 12,
            agility: 9,
            abilities: ['fierce-bite', 'howl', 'pack-call'],
            loot: [
                { item: 'alpha-pelt', chance: 0.9 },
                { item: 'alpha-fang', chance: 0.7 },
                { item: 'forest-essence', chance: 0.5 }
            ],
            experienceReward: 100,
            goldReward: { min: 30, max: 50 }
        },
        'bandit-chief': {
            name: 'Bandit Chief',
            baseHealth: 100,
            baseDamage: 15,
            agility: 8,
            abilities: ['dual-slash', 'rally', 'smoke-bomb'],
            loot: [
                { item: 'chief-dagger', chance: 0.8 },
                { item: 'leather-armor', chance: 0.6 },
                { item: 'treasure-map', chance: 0.3 }
            ],
            experienceReward: 120,
            goldReward: { min: 50, max: 80 }
        }
    },
    
    // Dungeon definitions
    dungeonTemplates: {
        'verdant-woods': {
            id: 'verdant-woods',
            name: 'Verdant Woods',
            description: 'A dense forest teeming with wildlife and bandits.',
            level: 1,
            minRooms: 5,
            maxRooms: 8,
            enemies: ['wolf', 'bandit', 'spider'],
            bosses: ['alpha-wolf', 'bandit-chief'],
            treasureChance: 0.3,
            emptyRoomChance: 0.2
        }
    }
};

export default gameState;
