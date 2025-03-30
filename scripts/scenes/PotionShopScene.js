// scripts/scenes/PotionShopScene.js

import BaseScene from './BaseScene.js';
import navigationManager from '../navigation/NavigationManager.js';
import gameState from '../gameState.js';
// Potentially import items.js if you need item data
// import items from '../data/items.js'; 

class PotionShopScene extends BaseScene {
    constructor() {
        super({ key: 'PotionShopScene' });
    }

    preload() {
        // Load shop-specific assets if needed (e.g., background, vendor sprite)
        // this.load.image('shop-bg', 'path/to/shop-bg.png');
        console.log("PotionShopScene preload");
    }

    create() {
        this.initializeScene(); // Initialize BaseScene components (this.ui, etc.)
        console.log("PotionShopScene create");

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Simple background color for now
        this.cameras.main.setBackgroundColor('#331a3f'); 

        // Title
        this.ui.createTitle(width / 2, height * 0.1, "Potion Shop", { fontSize: this.ui.fontSize.lg });

        // Placeholder text
        this.add.text(width / 2, height / 2, "Welcome!\nPotions and ingredients coming soon!", {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: "'VT323'",
            align: 'center'
        }).setOrigin(0.5);


        // Back Button (using ui manager from BaseScene)
        this.ui.createButton(
            width / 2,
            height * 0.9,
            'Back to Town',
            () => {
                this.safePlaySound('button-click');
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            { width: 200, height: 50 }
        );
    }
}

export default PotionShopScene;