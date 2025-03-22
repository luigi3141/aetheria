// Initialize Phaser game instance
// Wait for the DOM to load before starting the game
document.addEventListener('DOMContentLoaded', function() {
    const config = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'game-container',
        scene: [StartScene, CharacterSelectScene], // Add both scenes
        backgroundColor: '#000000',
        pixelArt: true, // Enable pixel art mode for crisp rendering
        roundPixels: true, // Avoid pixel interpolation
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            // Enable responsive scaling
            // Set minimum and maximum dimensions
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
    const game = new Phaser.Game(config);
});
