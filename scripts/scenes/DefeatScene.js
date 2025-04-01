// ---- File: DefeatScene.js ----

import BaseScene from './BaseScene.js';
import navigationManager from '../navigation/NavigationManager.js'; // For navigation
import UIManager from '../ui/UIManager.js'; // For UI elements
import { ASSET_PATHS } from '../config/AssetConfig.js'; // For background
import { saveGame } from '../utils/SaveLoadManager.js'; // Added import

class DefeatScene extends BaseScene {
    constructor() {
      super({ key: 'DefeatScene' });
      this.outcome = 'defeat'; // Default outcome
      this.lostItems = []; // Default empty array
    }

    init(data) {
        console.log("DefeatScene Init Data:", data);
        this.outcome = data?.outcome || 'defeat'; // Get outcome ('defeat' or 'retreat')
        // Ensure lostItems is always an array, even if data is missing
        this.lostItems = Array.isArray(data?.lostItems) ? data.lostItems : [];
        console.log(`Outcome: ${this.outcome}, Items Lost: ${this.lostItems.length}`);
    }

    preload() {
      console.log("DefeatScene.preload() called");
      // Use a specific background key if defined, otherwise fallback
       const bgPath = ASSET_PATHS.BACKGROUNDS.DEFEAT || ASSET_PATHS.BACKGROUNDS.DEFAULT;
      if (bgPath && !this.textures.exists('defeat-bg')) {
          this.load.image('defeat-bg', bgPath);
      }
    }

    create() {
      console.log("DefeatScene.create() called");
      this.initializeScene(); // Initializes this.ui

      const width = this.cameras.main.width;
      const height = this.cameras.main.height;

      // --- Background ---
      if (this.textures.exists('defeat-bg')) {
          this.add.image(width / 2, height / 2, 'defeat-bg').setDisplaySize(width, height).setDepth(0);
      } else {
          this.cameras.main.setBackgroundColor('#330000'); // Dark red fallback
      }

      // --- Title based on Outcome ---
      let titleText = this.outcome === 'retreat' ? 'Retreat Successful' : 'You Have Been Defeated';
      let titleColor = this.outcome === 'retreat' ? '#cccccc' : '#ff4444';
      this.ui.createTitle(width / 2, height * 0.15, titleText, {
          fontSize: this.ui.fontSize.lg, color: titleColor
      }).setDepth(1);

      // --- Explanation Text ---
      let explanation = '';
      if (this.outcome === 'retreat') {
          explanation = "You managed to escape the battle, returning to the safety of town.\nHowever, in your haste, some items may have been left behind...";
      } else { // Defeat
          explanation = "Overcome by your foe, you collapse.\nKind souls brought you back to town to recover.\nUnfortunately, some belongings were lost in the ordeal...";
      }

      // Add a dark rectangle behind the text
const textWidth = width * 0.7;
const textHeight = 70; // Adjust height as needed
const rect = this.add.rectangle(width / 2, height * 0.30, textWidth, textHeight, 0x000000, 0.7)
    .setOrigin(0.5)
    .setDepth(1);

    // Add the explanation text
      this.add.text(width / 2, height * 0.30, explanation, {
          fontFamily: "'VT323'", fontSize: this.ui.fontSize.md + 'px', fill: '#ffffff',
          align: 'center', wordWrap: { width: width * 0.7 }
      }).setOrigin(0.5).setDepth(1);


      // --- Display Lost Items ---
      const lostItemsYStart = height * 0.45;
      const lostItemsPanelHeight = height * 0.3;
      const lostItemsPanel = this.ui.createPanel(width / 2, lostItemsYStart + lostItemsPanelHeight/2, width * 0.6, lostItemsPanelHeight, {
            fillColor: 0x1a1a1a, fillAlpha: 0.8, borderColor: 0x555555, depth: 1
      });

      // Title for lost items section
       this.add.text(width / 2, lostItemsYStart +20, 'Items Lost:', {
            fontFamily: "'Press Start 2P'", fontSize: this.ui.fontSize.sm + 'px', fill: '#ffdddd'
       }).setOrigin(0.5, 0).setDepth(2); // Place above panel content slightly

        const textStyle = {
             fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm + 'px', fill: '#dddddd'
        };
        const itemSpacing = 20;
        const textStartX = width * 0.5; // Center text
        let currentY = lostItemsYStart + 50; // Start below title

        if (this.lostItems.length === 0) {
            const noLossText = this.outcome === 'retreat'
                ? "Fortunately, you didn't drop anything while fleeing!"
                : "Miraculously, all your belongings were recovered!";
             // Add text relative to the panel's container for centering
             const noLossMsg = this.add.text(0, 0, noLossText, textStyle).setOrigin(0.5);
             lostItemsPanel.add(noLossMsg); // Add to panel container
        } else {
            // Create text objects for each lost item and add to panel container
            this.lostItems.forEach((itemInfo, index) => {
                 // Position relative to panel center
                 const relativeY = currentY - (lostItemsYStart + lostItemsPanelHeight/2); // Adjust for panel center origin
                 const itemText = this.add.text(0, relativeY, `- ${itemInfo.name} (x${itemInfo.quantityLost})`, textStyle).setOrigin(0.5);
                 lostItemsPanel.add(itemText);
                 currentY += itemSpacing; // Increment for next item (only matters if list becomes scrollable)
            });
             // TODO: If many items can be lost, replace this text list with a ScrollableContainer
        }


      // --- Return Button ---
      this.ui.createButton(width / 2, height * 0.85, 'Overworld', () => {
          saveGame(); // Save after items are lost
          navigationManager.navigateTo(this, 'OverworldScene');
      }, { width: 200, height: 50, depth: 5 }); // Ensure button on top
    } // End create()
}

export default DefeatScene;