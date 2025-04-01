// ---- File: PotionShopScene.js ----

import BaseScene from './BaseScene.js';
import navigationManager from '../navigation/NavigationManager.js';
import gameState from '../utils/gameState.js';
import items from '../data/items.js'; // For item data
import { ASSET_PATHS } from '../config/AssetConfig.js';

const { getItemData } = items;

// --- Potion Data (Could also be fetched from items.js if defined there) ---
const POTIONS_FOR_SALE = [
    {
        id: 'hp-potion', // Matches itemId in items.js
        name: 'Health Potion',
        iconKey: 'HP_POTION', // Matches AssetConfig key
        description: 'Restores 50 HP',
        cost: 100,
    },
    {
        id: 'mana-potion', // Matches itemId in items.js
        name: 'Mana Potion',
        iconKey: 'MANA_POTION', // Matches AssetConfig key
        description: 'Restores 30 MP', // Corrected MP value from items.js
        cost: 50,
    }
];
// --- ---

class PotionShopScene extends BaseScene {
    constructor() {
        super({ key: 'PotionShopScene' });
        this.previousSceneKey = 'OverworldScene'; // Default return scene
        this.goldText = null;
        this.buyButtons = {}; // To store references for enabling/disabling

        this.sellListPanel = null; // Reference to the background panel
        this.sellListItemsGroup = null; // Group to hold items on the current page for easy clearing

        // --- Pagination State ---
        this.itemsPerPage = 4; // Default, will be calculated
        this.currentPage = 1;
        this.totalPages = 1;
        this.equipmentCache = []; // Store the filtered equipment list
        // --- End Pagination State ---

         // References for pagination UI
         this.prevPageButton = null;
         this.nextPageButton = null;
         this.pageIndicatorText = null;
    }

    init(data) {
        // Store the scene key we came from
        this.previousSceneKey = data?.previousScene || gameState.previousScene || 'OverworldScene';
        console.log(`PotionShopScene entered from: ${this.previousSceneKey}`);
        // Reset pagination on entry
        this.currentPage = 1;
    }

    preload() {
        console.log("PotionShopScene preload");
        // Load shop background
        if (!this.textures.exists('shop-bg')) {
            const shopBgPath = ASSET_PATHS.BACKGROUNDS.SHOP || ASSET_PATHS.BACKGROUNDS.DEFAULT; // Use fallback
            if (shopBgPath) {
                this.load.image('shop-bg', shopBgPath);
            } else {
                console.warn("No path found for shop background.");
            }
        }

        // Load static icons if not already loaded globally
        const iconsToLoad = ['GOLD', 'HP_POTION', 'MANA_POTION'];
        iconsToLoad.forEach(key => {
             const path = ASSET_PATHS.ITEMS[key];
             if (path && !this.textures.exists(key)) {
                 this.load.image(key, path);
             } else if (!path) {
                 console.warn(`Path for shop icon ${key} not found in ASSET_PATHS.ITEMS`);
             }
        });

        // Preload Equipment icons needed for the sell list (ideally done globally)
        // This is complex here, better rely on global preload or lazy loading/fallbacks
        console.log("Note: Equipment icons should be preloaded for sell list.");
    }

    create() {
        this.initializeScene(); // Initialize BaseScene components (this.ui, etc.)
        console.log("PotionShopScene create");

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background safely
        if (this.textures.exists('shop-bg')) {
             this.add.image(width / 2, height / 2, 'shop-bg').setDisplaySize(width, height).setDepth(0);
        } else {
             this.cameras.main.setBackgroundColor('#4a2d54'); // Fallback color
             console.warn("Shop background texture not found, using fallback color.");
        }

        // Title
        this.ui.createTitle(width / 2, height * 0.08, "Potion Shop", { fontSize: this.ui.fontSize.lg }).setDepth(1);

        // Potions Area
        this.createPotionsArea();

        // Gold Display
        this.createGoldDisplay();

        // Selling Area - Now uses pagination
        this.createSellingArea();

        // Exit Button
        this.createExitButton();

        // Initial UI updates (delay slightly to ensure buttons are ready)
        this.updateGoldDisplay();

        // Delay button state updates slightly
        this.time.delayedCall(50, () => {
             console.log("Updating buy button states after delay.");
             this.updateBuyButtonStates(); 
             // Note: Pagination button updates happen within displayCurrentPage, 
             // which might already be slightly delayed or implicitly handled correctly.
             // If pagination buttons still show errors, we might need to delay displayCurrentPage too.
        });

        // Fade In - Delay slightly
        this.time.delayedCall(50, () => {
            if (this.transitions) this.transitions.fadeIn();
        });
    }

    // --- UI Creation Functions ---

    createGoldDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const padding = this.ui?.spacing?.md || 15; // Padding inside the panel
        const iconSize = 24;

        // --- Match Potion Area Layout --- 
        const potionAreaStartX = width * 0.27;
        const potionCardWidth = width * 0.4;
        const potionCardHeight = height * 0.18; 
        const potionSpacingY = potionCardHeight + 30;
        const potionStartY = height * 0.25;
        const numPotions = POTIONS_FOR_SALE.length;

        // --- Calculate Gold Panel Position & Size --- 
        const panelWidth = potionCardWidth; // Match potion card width
        const panelHeight = 50; // Keep height reasonable
        const panelX = potionAreaStartX; // Align X with potion cards
        // Calculate Y position below the last potion card
        const lastPotionBottomY = potionStartY + (numPotions -1) * potionSpacingY + (potionCardHeight / 2);
        const panelY = lastPotionBottomY + (panelHeight / 2) + padding * 5; // Position below last potion + padding

        // Create the panel for the gold display
        const goldPanel = this.ui.createPanel(panelX, panelY, panelWidth, panelHeight, {
            fillColor: 0x2a1a3f, 
            borderColor: 0xaa8fbf, 
            depth: 10
        });

        // --- Elements are positioned relative to the panel's center (0,0) ---
        const iconX = -panelWidth / 2 + padding + iconSize / 2; // Icon on the far left
        const iconY = 0;
        const textX = iconX + iconSize / 2 + padding; // Text next to icon
        const textY = 0;

        // Gold Icon
        if (this.textures.exists('GOLD')) {
            const goldIcon = this.add.image(iconX, iconY, 'GOLD')
                .setDisplaySize(iconSize, iconSize)
                .setOrigin(0.5); 
            goldPanel.add(goldIcon); 
        }

        // Gold Text
        this.goldText = this.add.text(textX, textY, `Gold: ${gameState.player.gold || 0}`, {
            fontFamily: "'VT323'",
            fontSize: (this.ui?.fontSize?.md || 16) + 'px',
            fill: '#FFD700',
            align: 'left' 
        }).setOrigin(0, 0.5); 

        goldPanel.add(this.goldText); 
    }

    createPotionsArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const startX = width * 0.27; // Position left column center
        const startY = height * 0.34;
        const cardWidth = width * 0.4;
        const cardHeight = height * 0.18; // Increase height slightly
        const spacingY = cardHeight + 30;
        const iconSize = 40;
        const padding = this.ui?.spacing?.sm || 10; // Use UIManager spacing or a default

         POTIONS_FOR_SALE.forEach((potion, index) => {
             const cardY = startY + index * spacingY;

             const panel = this.ui.createPanel(startX, cardY, cardWidth, cardHeight, {
                 fillColor: 0x3a2a4f, borderColor: 0x8a6f9f, depth: 1
             });

             // Icon - Position relative to panel center (0,0)
             const iconRelX = -cardWidth * 0.5 + padding + (iconSize / 2);
             if (this.textures.exists(potion.iconKey)) {
                 const icon = this.add.image(iconRelX, 0, potion.iconKey)
                     .setDisplaySize(iconSize, iconSize)
                     .setOrigin(0.5); // Center the icon itself
                 panel.add(icon);
             }

             // Details Text (Name, Desc, Price) - Relative positioning
             const textRelX = iconRelX + iconSize / 2 + 15; // Start text right of icon
             const nameText = this.add.text(textRelX, -cardHeight * 0.25, potion.name, {
                 fontFamily: "'Press Start 2P'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: '#ffffff'
             }).setOrigin(0, 0.5); // Align left-middle

             const descText = this.add.text(textRelX, 0, potion.description, {
                 fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.xs || 10) + 'px', fill: '#cccccc'
             }).setOrigin(0, 0.5); // Align left-middle

             const priceText = this.add.text(textRelX, cardHeight * 0.25, `${potion.cost} Gold`, {
                 fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: '#FFD700'
             }).setOrigin(0, 0.5); // Align left-middle

             panel.add([nameText, descText, priceText]);

             // Buy Button - Position relative to panel center
             const buttonRelX = cardWidth * 0.5 - 50; // Position button near right edge
             const buyButton = this.ui.createButton(buttonRelX, 20, 'Buy', // Create relative to panel center
                 () => { this.buyPotion(potion); },
                 { width: 80, height: 35, fontSize: this.ui?.fontSize?.xs || 10 }
             );
             panel.add(buyButton.container); // Add button's container to panel

             this.buyButtons[potion.id] = buyButton;
         });
    }

    createSellingArea() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const panelWidth = width * 0.45;
        const panelHeight = height * 0.55; // Match height of other panels
        const panelX = width * 0.73; // Position right
        const panelTopY = height * 0.25; // Align top with other panels
        const panelCenterY = panelTopY + panelHeight / 2;

        // Selling Area Title
        const sellTitle = this.ui.createTitle(panelX, panelTopY - 25, "Sell Equipment", { // Position above panel
             fontSize: this.ui.fontSize.md, padding: { x: 10, y: 5 }
         }).setDepth(1);

         // Add background rectangle for the title
         const titleBounds = sellTitle.getBounds();
         const titleBgPadding = 15;
         const titleBg = this.add.rectangle(
             sellTitle.x, 
             sellTitle.y, 
             titleBounds.width + titleBgPadding * 2, 
             titleBounds.height + titleBgPadding,
             0x000000, // Black background
             0.6 // Semi-transparent
         );
         titleBg.setOrigin(sellTitle.originX, sellTitle.originY).setDepth(0.9); // Place behind title

         // Create the background Panel
         this.sellListPanel = this.ui.createPanel(
             panelX, panelCenterY, panelWidth, panelHeight,
             { padding: 10, backgroundColor: 0x4f3a2a, borderColor: 0x9f8a6f, depth: 1 }
         );

         // Create a Group to hold items currently displayed
         this.sellListItemsGroup = this.add.group();

         // Calculate Items Per Page based on panel height and desired item display height
         const itemDisplayHeight = 55 + 5; // item row height + padding
         const availableHeight = panelHeight - (this.sellListPanel.options?.padding || 10) * 2; // Inner height
         this.itemsPerPage = Math.max(1, Math.floor(availableHeight / itemDisplayHeight));
         console.log(`Calculated itemsPerPage: ${this.itemsPerPage}`);

         // Create Pagination Controls below the panel
         const paginationY = panelCenterY + panelHeight * 0.5 + 25;
         this.createPaginationButtons(panelX, paginationY);

         // Initial Population
         this.filterAndCacheEquipment(); // Filter equipment once
         this.displayCurrentPage(); // Display the first page
    }

    createPaginationButtons(centerX, y) {
        const buttonWidth = 80;
        const buttonHeight = 30;
        const spacing = 120; // Space between Prev/Next buttons

        // Previous Button
        this.prevPageButton = this.ui.createButton(
            centerX - spacing, y, '< Prev', this.prevPage, // Use arrow function for callback
            { width: buttonWidth, height: buttonHeight, fontSize: this.ui?.fontSize?.xs || 10 }
        );
        if(this.prevPageButton.container) this.prevPageButton.container.setDepth(10);

        // Page Indicator Text
        this.pageIndicatorText = this.add.text(centerX, y, `Page ${this.currentPage}/${this.totalPages}`, {
            fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: '#ffffff'
        }).setOrigin(0.5).setDepth(10);

        // Next Button
        this.nextPageButton = this.ui.createButton(
            centerX + spacing, y, 'Next >', this.nextPage, // Use arrow function for callback
            { width: buttonWidth, height: buttonHeight, fontSize: this.ui?.fontSize?.xs || 10 }
        );
         if(this.nextPageButton.container) this.nextPageButton.container.setDepth(10);

         this.updatePaginationControls(); // Set initial state
    }

    createExitButton() {
        const sceneWidth = this.cameras.main.width;
        const sceneHeight = this.cameras.main.height;

        // Button dimensions and desired padding from edges
        const buttonWidth = 180; // Width from previous correct version
        const buttonHeight = 45;  // Height from previous correct version
        const paddingX = this.ui?.spacing?.lg || 30; // Padding from right edge
        const paddingY = this.ui?.spacing?.lg || 30; // Padding from bottom edge

        // --- Calculate CENTER coordinates for Bottom-Right ---
        // Desired top-left corner would be: (sceneWidth - paddingX - buttonWidth, sceneHeight - paddingY - buttonHeight)
        // Center X = desired top-left X + half width
        // Center Y = desired top-left Y + half height
        const buttonCenterX = sceneWidth / 2; // Center horizontally
        const buttonCenterY = sceneHeight - paddingY - buttonHeight / 2;
        // --- End Calculation ---

        console.log(`Creating Exit button at center: (${buttonCenterX.toFixed(0)}, ${buttonCenterY.toFixed(0)})`);

        // Create the button using the calculated CENTER coordinates
        const exitButton = this.ui.createButton(
            buttonCenterX,
            buttonCenterY,
            'Exit', // Or 'Exit Shop'
            () => { // --- Callback Logic ---
                console.log("Exit Button Clicked. Returning to:", this.previousSceneKey); // Log destination
                this.safePlaySound('button-click'); // Assuming safePlaySound and sound key are correct

                // Use navigationManager safely
                if (navigationManager) {
                     // Ensure previousSceneKey is valid
                     const targetScene = this.previousSceneKey || 'OverworldScene'; // Fallback
                     navigationManager.navigateTo(this, targetScene);
                } else {
                     // Fallback if navigationManager is missing
                     console.warn("NavigationManager not available. Using direct scene start as fallback.");
                     const targetScene = this.previousSceneKey || 'OverworldScene';
                     this.scene.start(targetScene);
                }
            }, // --- End Callback ---
            {
                width: buttonWidth,
                height: buttonHeight,
                fontSize: this.ui?.fontSize?.sm || 12, // Match previous style
                depth: 10 // Ensure it's on top
            }
        );

        // --- NO .setOrigin() needed on the container ---

        // Optional: Verify button was created
        if (!exitButton || !exitButton.container) {
            console.error("Failed to create Exit button!");
        }
    } // End createExitButton

    updateGoldDisplay() {
        if (this.goldText) {
            this.goldText.setText(`Gold: ${gameState.player.gold || 0}`);
        }
    }

    updateBuyButtonStates() {
        const playerGold = gameState.player.gold || 0;
        POTIONS_FOR_SALE.forEach(potion => {
            const button = this.buyButtons[potion.id];
            if (button) {
                const canAfford = playerGold >= potion.cost;
                if (canAfford) {
                    button.enable();
                    if(button.container) button.container.setAlpha(1);
                } else {
                    button.disable();
                    if(button.container) button.container.setAlpha(0.5);
                }
            }
        });
    }

    buyPotion(potion) {
        this.safePlaySound('button-click');
        const playerGold = gameState.player.gold || 0;

        if (playerGold < potion.cost) {
            this.showFeedback("Not enough gold!", '#ffaaaa');
            return;
        }

        const confirmed = confirm(`Buy 1 ${potion.name} for ${potion.cost} Gold?`);

        if (confirmed) {
            gameState.player.gold -= potion.cost;
            if (!gameState.player.inventory) gameState.player.inventory = { items: [] };
            if (!gameState.player.inventory.items) gameState.player.inventory.items = [];

            const existingItemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === potion.id);
            if (existingItemIndex > -1) {
                gameState.player.inventory.items[existingItemIndex].quantity = (gameState.player.inventory.items[existingItemIndex].quantity || 0) + 1;
            } else {
                gameState.player.inventory.items.push({ itemId: potion.id, quantity: 1 });
            }

            console.log(`Bought ${potion.name}. Inventory now contains:`, JSON.parse(JSON.stringify(gameState.player.inventory.items)));
            this.updateGoldDisplay();
            this.updateBuyButtonStates();
            this.showFeedback(`+1 ${potion.name} added!`, '#aaffaa');
            this.safePlaySound('coin-sound'); // Need to load 'coin-sound' asset
            this.saveGameState(); // Optional: Save state
        }
    }

    filterAndCacheEquipment() {
        const inventoryItems = (gameState.player?.inventory?.items) || [];
        this.equipmentCache = inventoryItems.filter(itemInstance => {
            if (!itemInstance || itemInstance.itemId === undefined || itemInstance.itemId === null) return false;
            const itemData = getItemData(itemInstance.itemId);
            return itemData?.type === 'equipment';
        });
        this.totalPages = Math.ceil(this.equipmentCache.length / this.itemsPerPage) || 1;
        this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));
        console.log(`[Cache] Total equipment: ${this.equipmentCache.length}, Total Pages: ${this.totalPages}`);
    }

    displayCurrentPage() {
        this.sellListItemsGroup.clear(true, true); // Destroy children and remove them

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const itemsToShow = this.equipmentCache.slice(startIndex, endIndex);

        console.log(`Displaying page ${this.currentPage}/${this.totalPages}. Items ${startIndex}-${endIndex-1}`);

        // Panel details for positioning items
        if (!this.sellListPanel?.container) {
             console.error("Sell list panel container not available for positioning.");
             return;
        }
        const panelX = this.sellListPanel.container.x;
        const panelY = this.sellListPanel.container.y;
        const panelWidth = this.sellListPanel.width;
        const panelHeight = this.sellListPanel.height;
        const padding = this.sellListPanel.options?.padding || 10;
        const listStartX = -panelWidth / 2 + padding; // Relative X start inside panel
        const listStartY = -panelHeight / 2 + padding; // Relative Y start inside panel

        const itemHeight = 55;
        const itemPaddingY = 5;
        const itemWidth = panelWidth - (padding * 2);
        const iconSize = 30;

        if (itemsToShow.length === 0 && this.equipmentCache.length === 0) {
             const noItemText = this.add.text(0, 0, "No equipment to sell.", {
                 fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12)+'px', fill: '#cccccc', align: 'center'
             }).setOrigin(0.5);
             this.sellListItemsGroup.add(noItemText);
             // Add to panel container relative to its center
             this.sellListPanel.add(noItemText);
        } else {
             itemsToShow.forEach((itemInstance, indexOnPage) => {
                 try {
                     const itemData = getItemData(itemInstance.itemId);
                     if (!itemData) return;

                     // Calculate Y position relative to the panel's top start
                     const itemCenterY = listStartY + (indexOnPage * (itemHeight + itemPaddingY)) + itemHeight / 2;

                     // --- Create Item Row Container relative to Panel Center ---
                     const itemRow = this.add.container(0, itemCenterY); // Position row vertically relative to panel center

                     // --- Add elements relative to the ROW container (0,0) ---
                     const itemBg = this.add.rectangle(0, 0, itemWidth, itemHeight, 0x000000, 0.4).setOrigin(0.5).setDepth(0);
                     itemRow.add(itemBg);

                     // Start elements from the left edge relative to row center
                     let currentX = -itemWidth / 2 + 10;

                     // Icon
                     if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                         const icon = this.add.image(currentX + iconSize / 2, 0, itemData.iconKey)
                             .setDisplaySize(iconSize, iconSize).setOrigin(0.5).setDepth(1);
                         itemRow.add(icon);
                         currentX += iconSize + 10;
                     } else { currentX += iconSize + 10; }

                     // Name/Stats Text Block
                     const attack = itemData.effects?.attack || itemData.effects?.magicAttack || 0;
                     const defense = itemData.effects?.defense || 0;
                     const statsText = `ATK: ${attack} / DEF: ${defense}`;
                     const nameAndStats = this.add.text(currentX, 0,
                         `${itemData.inGameName}\n${statsText}`, {
                             fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.xs || 10) + 'px', fill: '#ffffff', lineSpacing: 4
                         }
                     ).setOrigin(0, 0.5).setDepth(1);
                     itemRow.add(nameAndStats);

                     // Sell Button - Position near right edge relative to row center
                     const buttonX = itemWidth / 2 - 50;
                     const sellButton = this.ui.createButton(0, 0, 'Sell',
                         () => {
                              const currentItem = gameState.player.inventory.items.find(invItem => invItem === itemInstance);
                              if(currentItem) {
                                   const currentIndex = gameState.player.inventory.items.indexOf(currentItem);
                                   if (currentIndex > -1) this.sellItem(currentItem, currentIndex);
                                   else { /* error */ this.showFeedback("Error selling item!", '#ffaaaa'); }
                              } else { /* error */ this.showFeedback("Item already gone?", '#ffaaaa');}
                         },
                         { width: 60, height: 25, fontSize: (this.ui?.fontSize?.xs || 10) - 2 }
                     );
                     if (!sellButton?.container) return; // Skip if button creation failed
                     sellButton.container.setPosition(buttonX, 0);
                     sellButton.container.setDepth(5);
                     itemRow.add(sellButton.container);

                     // Price Text - Position left of button relative to row center
                     const sellPrice = this.calculateSellPrice(itemData);
                     const priceTextX = buttonX - 45; // Position left of button center
                     const priceText = this.add.text(priceTextX, 0, // Vertically centered in row
                         `${sellPrice} G`, {
                             fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.xs || 10) + 'px', fill: '#FFD700', align: 'right'
                         }
                     ).setOrigin(1, 0.5).setDepth(1); // Align right edge
                     itemRow.add(priceText);

                     // Add the assembled row TO THE GROUP and TO THE PANEL CONTAINER
                     this.sellListItemsGroup.add(itemRow);
                     this.sellListPanel.add(itemRow); // Add row to the panel container

                 } catch (loopError) { console.error("Error creating item row:", loopError); }
             });
        }
        this.updatePaginationControls();
    }

    calculateSellPrice(itemData) {
        if (!itemData || !itemData.effects) return 5;
        const attack = itemData.effects.attack || itemData.effects.magicAttack || 0;
        const defense = itemData.effects.defense || 0;
        const tier = itemData.tier || 1;
        const baseValue = itemData.value || 10; // Use item's base value if available
        // Formula: More weight to stats, less to base value, tier multiplier
        const price = Math.max(5, Math.floor((attack * 3 + defense * 2) * (1 + tier * 0.25) + (baseValue * 0.1)));
        return price;
    }

    sellItem(itemInstance, inventoryIndex) {
        this.safePlaySound('button-click');
        const itemData = getItemData(itemInstance.itemId);
        if (!itemData) { /* ... error handling ... */ return; }

        const sellPrice = this.calculateSellPrice(itemData);
        const confirmed = confirm(`Sell ${itemData.inGameName} for ${sellPrice} Gold?`);

        if (confirmed) {
            gameState.player.gold = (gameState.player.gold || 0) + sellPrice;

            if (inventoryIndex > -1 && inventoryIndex < gameState.player.inventory.items.length &&
                gameState.player.inventory.items[inventoryIndex].itemId === itemInstance.itemId)
            {
                 gameState.player.inventory.items.splice(inventoryIndex, 1);
                 console.log(`Sold ${itemData.inGameName}.`);

                // Refresh List
                this.filterAndCacheEquipment();
                if (this.currentPage > this.totalPages) this.currentPage = Math.max(1, this.totalPages);
                this.displayCurrentPage();

                this.updateGoldDisplay();
                this.showFeedback(`Sold ${itemData.inGameName} for ${sellPrice} G!`, '#aaffaa');
                this.safePlaySound('coin-sound');
                this.saveGameState(); // Optional

            } else { /* ... error handling, refund gold ... */
                  console.error(`Item mismatch or invalid index ${inventoryIndex} when selling.`);
                  gameState.player.gold -= sellPrice; // Refund
                  this.showFeedback("Error selling item!", '#ffaaaa');
            }
        }
    }

    // Arrow function for page change callbacks to preserve 'this'
    nextPage = () => {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.displayCurrentPage();
            this.safePlaySound('button-click');
        }
    }

    prevPage = () => {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.displayCurrentPage();
            this.safePlaySound('button-click');
        }
    }

    updatePaginationControls() {
        if (!this.pageIndicatorText || !this.prevPageButton || !this.nextPageButton) return;

        this.pageIndicatorText.setText(`Page ${this.currentPage}/${this.totalPages}`);

        const canGoPrev = this.currentPage > 1;
        this.prevPageButton.enable(canGoPrev); // Assuming Button class has enable/disable(bool)
        if(this.prevPageButton.container) this.prevPageButton.container.setAlpha(canGoPrev ? 1 : 0.5);

        const canGoNext = this.currentPage < this.totalPages;
        this.nextPageButton.enable(canGoNext);
        if(this.nextPageButton.container) this.nextPageButton.container.setAlpha(canGoNext ? 1 : 0.5);

        // Hide buttons if only one page
        const showButtons = this.totalPages > 1;
         if(this.prevPageButton.container) this.prevPageButton.container.setVisible(showButtons);
         if(this.nextPageButton.container) this.nextPageButton.container.setVisible(showButtons);
         this.pageIndicatorText.setVisible(showButtons);
    }


    showFeedback(message, color = '#ffffff') {
         if (!this.ui || !this.cameras?.main) return;
         const width = this.cameras.main.width;
         const height = this.cameras.main.height;
         const feedbackText = this.add.text(width / 2, height / 2, message, {
             fontFamily: "'VT323'",
             fontSize: (this.ui?.fontSize?.sm || 12) + 'px',
             fill: color,
             backgroundColor: '#000000cc',
             padding: { x: 10, y: 5 },
             align: 'center'
         }).setOrigin(0.5).setDepth(100);

         this.tweens?.add({
             targets: feedbackText,
             alpha: 0,
             y: '-=20',
             delay: 1500,
             duration: 500,
             ease: 'Power1',
             onComplete: () => { if (feedbackText.active) feedbackText.destroy(); }
         });
     }

     saveGameState() {
        console.log("[PotionShopScene] Saving gameState to localStorage...");
        try {
            const stateToSave = { player: gameState.player /* Add other relevant state parts if needed */ };
            window.localStorage.setItem('gameState', JSON.stringify(stateToSave));
            console.log("[PotionShopScene] GameState saved.");
        } catch (e) { console.error("[PotionShopScene] Error saving gameState:", e); }
    }

     shutdown() {
         // Destroy items currently on display
         if (this.sellListItemsGroup) {
            this.sellListItemsGroup.destroy(true, true); // Destroy children and group itself
         }
         this.sellListItemsGroup = null;

         // Destroy pagination text if created with this.add.text
         if(this.pageIndicatorText) this.pageIndicatorText.destroy();

         // Buttons created via UIManager might be handled, but nullify refs
         this.prevPageButton = null;
         this.nextPageButton = null;
         this.pageIndicatorText = null;
         this.sellListPanel = null; // Nullify panel ref
         this.goldText = null;
         this.buyButtons = {};
         this.equipmentCache = [];

         console.log("PotionShopScene shutdown.");
     }
}

export default PotionShopScene;