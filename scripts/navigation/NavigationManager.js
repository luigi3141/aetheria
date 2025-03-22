/**
 * NavigationManager.js
 * Handles scene transitions and navigation flow throughout the game
 */
class NavigationManager {
    constructor() {
        // Define the navigation flow map
        this.navigationFlow = [
            { from: "StartScene", to: "CharacterSelectScene" },
            { from: "CharacterSelectScene", to: "OverworldScene" },
            { from: "OverworldScene", to: "DungeonSelectScene" },
            { from: "OverworldScene", to: "InventoryScene" },
            { from: "OverworldScene", to: "CraftingScene" },
            { from: "OverworldScene", to: "CharacterSheetScene" },
            { from: "DungeonSelectScene", to: "DungeonScene" },
            { from: "DungeonScene", to: "EncounterScene" },
            { from: "EncounterScene", to: "DungeonScene" },
            { from: "DungeonScene", to: "CombatResultScene" },
            { from: "CombatResultScene", to: "DungeonScene", condition: "Next Level" },
            { from: "CombatResultScene", to: "PostRunSummaryScene", condition: "Retreat with Loot" },
            { from: "PostRunSummaryScene", to: "OverworldScene" },
            { from: "DungeonScene", to: "OverworldScene" },
            { from: "InventoryScene", to: "CraftingScene" },
            { from: "InventoryScene", to: "OverworldScene" },
            { from: "CraftingScene", to: "OverworldScene" },
            { from: "CraftingScene", to: "InventoryScene" },
            { from: "CharacterSheetScene", to: "OverworldScene" }
        ];
    }

    /**
     * Navigate from one scene to another
     * @param {Phaser.Scene} currentScene - The current scene
     * @param {string} targetSceneName - The name of the scene to navigate to
     * @param {object} data - Optional data to pass to the next scene
     * @param {string} condition - Optional condition for conditional navigation
     */
    navigateTo(currentScene, targetSceneName, data = {}, condition = null) {
        const currentSceneName = currentScene.constructor.name;
        
        // Check if the navigation is allowed
        const isValidNavigation = this.isValidNavigation(currentSceneName, targetSceneName, condition);
        
        if (isValidNavigation) {
            console.log(`Navigating from ${currentSceneName} to ${targetSceneName}`);
            currentScene.scene.start(targetSceneName, data);
        } else {
            console.warn(`Invalid navigation attempt from ${currentSceneName} to ${targetSceneName}`);
        }
    }

    /**
     * Check if navigation between scenes is valid based on the flow map
     * @param {string} fromScene - The name of the current scene
     * @param {string} toScene - The name of the target scene
     * @param {string} condition - Optional condition for conditional navigation
     * @returns {boolean} True if navigation is valid, false otherwise
     */
    isValidNavigation(fromScene, toScene, condition = null) {
        // Special case for the key-based scene name vs. class name
        const fromSceneKey = fromScene === 'DungeonScene' ? 'DungeonScene' : fromScene;
        
        // Find all valid navigation paths from this scene
        const validPaths = this.navigationFlow.filter(path => 
            path.from === fromSceneKey && 
            path.to === toScene && 
            (condition === null || path.condition === undefined || path.condition === condition)
        );
        
        return validPaths.length > 0;
    }

    /**
     * Get all possible destinations from a given scene
     * @param {string} fromScene - The name of the current scene
     * @returns {Array} - Array of possible destination scene names
     */
    getPossibleDestinations(fromScene) {
        return this.navigationFlow
            .filter(flow => flow.from === fromScene)
            .map(flow => ({ to: flow.to, condition: flow.condition }));
    }
}

// Create a singleton instance
const navigationManager = new NavigationManager();
export default navigationManager;
