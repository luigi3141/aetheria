// Import all scene classes
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

// Initialize Phaser game instance
window.addEventListener('load', function() {
    console.log('Window loaded');
    console.log('Phaser version:', Phaser.VERSION);
    
    try {
        const config = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: 'game-container',
            scene: [
                StartScene, 
                CharacterSelectScene,
                OverworldScene,
                DungeonSelectScene,
                DungeonScene,
                EncounterScene,
                CombatResultScene,
                PostRunSummaryScene,
                InventoryScene,
                CraftingScene,
                CharacterSheetScene
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
        console.log('Phaser game instance created successfully');
    } catch (error) {
        console.error('Error initializing Phaser game:', error);
    }
});
