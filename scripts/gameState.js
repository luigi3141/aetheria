// Central game state to be used across scenes
const gameState = {
    player: {
        name: '',
        class: 'Warrior', // Default class
        race: 'Human',    // Default race
        level: 1,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        agility: 10,
        intelligence: 10,
        constitution: 10,
        experience: 0,
        experienceToNextLevel: 100
    },
    inventory: {
        items: [],
        maxItems: 50
    },
    quests: {
        active: [],
        completed: []
    },
    dungeons: {
        discovered: ['Verdant Woods'],
        completed: []
    }
};

export default gameState;
