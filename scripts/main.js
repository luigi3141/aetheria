// Import all scene classes
import PreloadScene from './scenes/PreloadScene.js';
import StartScene from './scenes/StartScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import OverworldScene from './scenes/OverworldScene.js';
import DungeonSelectScene from './scenes/DungeonSelectScene.js';
import DungeonScene from './scenes/DungeonScene.js';
import EncounterScene from './scenes/EncounterScene.js';
import CombatResultScene from './scenes/CombatResultScene.js';
import PostRunSummaryScene from './scenes/PostRunSummaryScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import CraftingScene from './scenes/CraftingScene.js';
import CharacterSheetScene from './scenes/CharacterSheetScene.js';
import DefeatScene from './scenes/DefeatScene.js';
import PotionShopScene from './scenes/PotionShopScene.js';
import SettingsScene from './scenes/SettingsScene.js';

// Initialize Phaser game instance
window.addEventListener('load', function() {
    console.log('Window loaded');
    console.log('Phaser version:', Phaser.VERSION);
    
    // Add debugging for module loading
    console.log('Checking module imports:');
    
    // Create a function to check if modules are loaded
    function checkModule(name, module) {
        console.log(`Module ${name}: ${module ? 'Loaded successfully' : 'Failed to load'}`);
        return module;
    }
    
    // Check each module
    const modules = {
        PreloadScene: checkModule('PreloadScene', PreloadScene),
        StartScene: checkModule('StartScene', StartScene),
        CharacterSelectScene: checkModule('CharacterSelectScene', CharacterSelectScene),
        OverworldScene: checkModule('OverworldScene', OverworldScene),
        DungeonSelectScene: checkModule('DungeonSelectScene', DungeonSelectScene),
        DungeonScene: checkModule('DungeonScene', DungeonScene),
        EncounterScene: checkModule('EncounterScene', EncounterScene),
        CombatResultScene: checkModule('CombatResultScene', CombatResultScene),
        PostRunSummaryScene: checkModule('PostRunSummaryScene', PostRunSummaryScene),
        InventoryScene: checkModule('InventoryScene', InventoryScene),
        CraftingScene: checkModule('CraftingScene', CraftingScene),
        CharacterSheetScene: checkModule('CharacterSheetScene', CharacterSheetScene),
        DefeatScene: checkModule('DefeatScene', DefeatScene),
        PotionShopScene: checkModule('PotionShopScene', PotionShopScene),
        SettingsScene: checkModule('SettingsScene', SettingsScene),
    };
    
    try {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game-container',
            scene: [
                modules.StartScene, 
                modules.CharacterSelectScene,
                modules.OverworldScene,
                modules.DungeonSelectScene,
                modules.DungeonScene,
                modules.EncounterScene,
                modules.CombatResultScene,
                modules.PostRunSummaryScene,
                modules.InventoryScene,
                modules.CraftingScene,
                modules.CharacterSheetScene,
                modules.DefeatScene,
                modules.PotionShopScene,
                modules.PreloadScene,
                modules.SettingsScene,
            ],
            backgroundColor: '#000000',
            pixelArt: true,
            roundPixels: true,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                min: {
                    width: 400,
                    height: 300
                },
                max: {
                    width: 1600,
                    height: 1200
                }
            },
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 0 },
                    debug: false
                }
            }
        };
        
        // Create the game instance
        console.log('Creating Phaser game instance');
        window.game = new Phaser.Game(config);
        // Validate scene keys
        const allScenes = game.scene.scenes;
        const keys = allScenes.map(scene => scene.scene.key);
        const duplicates = keys.filter((key, index, arr) => arr.indexOf(key) !== index);

        if (duplicates.length > 0) {
            console.warn(`⚠️ Duplicate scene keys found: ${duplicates.join(', ')}`);
}

        console.log('Phaser game instance created successfully');
    } catch (error) {
        console.error('Error initializing Phaser game:', error);
    }
});
