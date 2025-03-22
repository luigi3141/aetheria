/**
 * StartScene - The title screen and entry point for the game
 */
class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    preload() {
        // Preload assets like images, spritesheets, and audio
        // Since we don't have actual assets yet, we'll use placeholders
        this.load.image('background', 'https://labs.phaser.io/assets/skies/space3.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add a background
        this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.2, 'Echoes of Aetheria', {
            fontSize: this.ui.fontSize.xl
        });
        
        // Create buttons using the Button component
        this.createButtons();
        
        // Add a version number at the bottom
        this.add.text(width - 20, height - 20, 'v0.1.0', {
            fontFamily: "'VT323'",
            fontSize: '16px',
            fill: '#cccccc',
            resolution: 3
        }).setOrigin(1, 1);
    }
    
    /**
     * Create the main menu buttons
     */
    createButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Start Game button
        const startButton = new Button(
            this,
            width/2, 
            height/2, 
            'START GAME', 
            () => {
                console.log('Start Game clicked');
                this.scene.start('CharacterSelectScene');
            },
            {
                width: 240,
                height: 50
            }
        );

        // Settings button
        const settingsButton = new Button(
            this,
            width/2, 
            height/2 + 80, 
            'SETTINGS', 
            () => {
                console.log('Settings clicked');
                // Open settings in the future
            },
            {
                width: 240,
                height: 50
            }
        );
        
        // Credits button
        const creditsButton = new Button(
            this,
            width/2, 
            height/2 + 160, 
            'CREDITS', 
            () => {
                console.log('Credits clicked');
                // Show credits in the future
            },
            {
                width: 240,
                height: 50
            }
        );
    }
}
