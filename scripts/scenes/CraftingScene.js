// ---- File: CraftingScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../utils/gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import items from '../data/items.js';
import BaseScene from './BaseScene.js'; // Correct import

const { getItemData, itemDatabase, categoryIconKeys, rarityToTier } = items;

// Crafting Configuration (from JSON)
const CRAFTING_CONFIG = {
  "crafting_recipes": {
    "Melee": ["Sharps", "Sharps", "Strings"],
    "Ranged": ["Branches", "Strings", "Strings"],
    "Wand": ["Branches", "Branches", "Strings"],
    "Armour": ["Armour", "Armour", "Strings"]
  },
  "tier_probability_chart": {
    "3": {"Common": 100.0,"Uncommon": 0.0,"Rare": 0.0,"Epic": 0.0,"Legendary": 0.0},
    "4": {"Common": 95.0,"Uncommon": 5.0,"Rare": 0.0,"Epic": 0.0,"Legendary": 0.0},
    "5": {"Common": 90.0,"Uncommon": 10.0,"Rare": 0.0,"Epic": 0.0,"Legendary": 0.0},
    "6": {"Common": 85.0,"Uncommon": 10.0,"Rare": 5.0,"Epic": 0.0,"Legendary": 0.0},
    "7": {"Common": 80.0,"Uncommon": 10.0,"Rare": 10.0,"Epic": 0.0,"Legendary": 0.0},
    "8": {"Common": 75.0,"Uncommon": 10.0,"Rare": 10.0,"Epic": 5.0,"Legendary": 0.0},
    "9": {"Common": 70.0,"Uncommon": 10.0,"Rare": 10.0,"Epic": 9.9,"Legendary": 0.1},
    "10": {"Common": 65.0,"Uncommon": 15.0,"Rare": 10.0,"Epic": 9.5,"Legendary": 0.5},
    "11": {"Common": 60.0,"Uncommon": 15.0,"Rare": 15.0,"Epic": 9.0,"Legendary": 1.0},
    "12": {"Common": 55.0,"Uncommon": 20.0,"Rare": 14.0,"Epic": 9.0,"Legendary": 2.0},
    "13": {"Common": 50.0,"Uncommon": 22.0,"Rare": 14.0,"Epic": 9.0,"Legendary": 5.0},
    "14": {"Common": 45.0,"Uncommon": 22.0,"Rare": 14.0,"Epic": 11.5,"Legendary": 7.5},
    "15": {"Common": 40.0,"Uncommon": 22.0,"Rare": 14.0,"Epic": 14.0,"Legendary": 10.0}
  }
};

// Mapping category names to target equipment types for crafting results
const categoryToEquipmentType = {
    "Melee": "Weapon",
    "Ranged": "Weapon",
    "Wand": "Weapon",
    "Armour": "Armour"
};

// Mapping category name to the specific Icon Key used for equipment items
const categoryToEquipmentIconKey = {
    "Melee": categoryIconKeys.Weapon.Melee,
    "Ranged": categoryIconKeys.Weapon.Ranged,
    "Wand": categoryIconKeys.Weapon.Wand,
    "Armour": categoryIconKeys.Armour
};

const rarityColors = {
    "Common": 0xaaaaaa,
    "Uncommon": 0x00ff00,
    "Rare": 0x0099ff,
    "Epic": 0x9900ff,
    "Legendary": 0xff9900
};

const CRAFTING_GOLD_COST = 500;


class CraftingScene extends BaseScene {
    constructor() {
        super({ key: 'CraftingScene' });
        this.currentState = 'CATEGORY_SELECT';
        this.currentCategory = null;
        this.selectedMaterials = [null, null, null];
        this.materialSlots = [];
        this.inventoryContainer = null;
        this.craftButton = null;
        this.tierSumText = null;
        this.tierSumBg = null; // Added reference
        this.resultPopup = null;
        this.goldText = null;
        this.backButtonInstance = null;
        this.costText = null;
        this.costTextBg = null; // Added reference
    }

    preload() {
        if (!this.textures.exists('crafting-bg')) { this.load.image('crafting-bg', ASSET_PATHS.BACKGROUNDS.CRAFTING); }
        if (!this.textures.exists('gold-icon')) { this.load.image('gold-icon', ASSET_PATHS.ITEMS.GOLD); }
        const preloadIcon = (key, path) => { if (path && !this.textures.exists(key)) this.load.image(key, path); else if (!path) console.warn(`Preload Icon: Path missing for key ${key}`); };
        preloadIcon('icon-melee', categoryIconKeys.Weapon.Melee ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Melee] : ASSET_PATHS.EQUIPMENT.MELEE_WEAPON);
        preloadIcon('icon-ranged', categoryIconKeys.Weapon.Ranged ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Ranged] : ASSET_PATHS.EQUIPMENT.RANGED_WEAPON);
        preloadIcon('icon-wand', categoryIconKeys.Weapon.Wand ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Wand] : ASSET_PATHS.EQUIPMENT.WAND);
        preloadIcon('icon-armour', categoryIconKeys.Armour ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Armour] : ASSET_PATHS.EQUIPMENT.ARMOUR);
        preloadIcon(categoryIconKeys.Sharps, ASSET_PATHS.MATERIALS.SHARPS);
        preloadIcon(categoryIconKeys.Strings, ASSET_PATHS.MATERIALS.STRINGS);
        preloadIcon(categoryIconKeys.Branches, ASSET_PATHS.MATERIALS.BRANCHES);
        preloadIcon(categoryIconKeys.Armour, ASSET_PATHS.MATERIALS.ARMOUR);
        Object.values(itemDatabase).forEach(item => { if (item.type === 'material' && item.iconKey) { let path = null; if (ASSET_PATHS.MATERIALS[item.iconKey]) path = ASSET_PATHS.MATERIALS[item.iconKey]; else if (ASSET_PATHS.ITEMS[item.iconKey]) path = ASSET_PATHS.ITEMS[item.iconKey]; if (path && !this.textures.exists(item.iconKey)) { this.load.image(item.iconKey, path); } } });
        Object.values(itemDatabase).forEach(item => { if (item.type === 'equipment' && item.iconKey) { let path = null; if (ASSET_PATHS.EQUIPMENT[item.iconKey]) path = ASSET_PATHS.EQUIPMENT[item.iconKey]; else if (ASSET_PATHS.ITEMS[item.iconKey]) path = ASSET_PATHS.ITEMS[item.iconKey]; if (path && !this.textures.exists(item.iconKey)) { this.load.image(item.iconKey, path); } } });
    }

    create() {
        this.initializeScene();
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        this.add.image(width / 2, height / 2, 'crafting-bg').setDisplaySize(width, height);
        this.ui.createTitle(width / 2, height * 0.08, 'Crafting Workshop', { fontSize: this.ui.fontSize.lg });
        this.createGoldDisplay(); this.createNavigationButtons(); this.displayCategorySelection();
        this.input.keyboard.on('keydown-M', () => { console.warn("DEBUG: Giving materials via keypress!"); this.giveDebugMaterials(); if (this.currentState === 'INPUT' && this.inventoryContainer) { const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory]; this.updateInventoryDisplay(requiredMaterials || []); } }); console.log("Crafting Scene: Press 'M' to add debug materials.");
    }

    createGoldDisplay() {
        const width = this.cameras.main.width; const goldDisplayX = width * 0.85; const goldDisplayY = this.cameras.main.height * 0.08; const iconSize = 24;
        if (this.textures.exists('gold-icon')) { this.add.image(goldDisplayX - 40, goldDisplayY, 'gold-icon').setDisplaySize(iconSize, iconSize).setOrigin(1, 0.5); }
        this.goldText = this.add.text(goldDisplayX, goldDisplayY, `Gold: ${gameState.player.gold || 0}`, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.md, fill: '#FFD700', align: 'left' }).setOrigin(0, 0.5);
    }

    updateGoldDisplay() { if (this.goldText) { this.goldText.setText(`Gold: ${gameState.player.gold || 0}`); } }

    createNavigationButtons() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        this.backButtonInstance = this.ui.createButton( width * 0.15, height * 0.92, 'Back', () => { this.safePlaySound('button-click'); if (this.currentState === 'INPUT' || this.currentState === 'RESULT') { this.clearInputState(); this.clearResultState(); this.displayCategorySelection(); } else { navigationManager.navigateTo(this, 'OverworldScene'); } }, { width: 120, height: 45, fontSize: this.ui.fontSize.sm, depth: 10 } );
    }

    giveDebugMaterials() {
        if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 50, equipped: {} };
        if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
        const addDebugItem = (itemId, quantity) => {
            const itemData = getItemData(itemId); // getItemData now expects the numeric ID
            if (!itemData) {
                console.warn(`[addDebugItem] Could not find item data for ID: ${itemId}`);
                return;
            }
            const existingItemIndex = gameState.player.inventory.items.findIndex(i => String(i.itemId) === String(itemId)); // Compare as strings for safety
            if (existingItemIndex > -1) {
                gameState.player.inventory.items[existingItemIndex].quantity += quantity;
            } else {
                gameState.player.inventory.items.push({ itemId: itemId, quantity: quantity });
            }
        };
    
        // Use NUMERIC IDs here:
        addDebugItem(20, 10);  // goblin-teeth
        addDebugItem(46, 10);  // wolf-claws
        addDebugItem(21, 10);  // goblin-sinew (Corrected from 9->10 for consistency)
        addDebugItem(42, 10);  // wild-boar-sinew
        addDebugItem(29, 10);  // mushroom-arms
        addDebugItem(47, 10);  // wolf-pelt
        addDebugItem(36, 5);   // spider-fang
        addDebugItem(37, 5);   // spider-silk
        addDebugItem(3, 5);    // briar-sprite-branch
        addDebugItem(1, 5);    // bandit-armour
        addDebugItem(8, 3);    // crystal-golem-shard
        addDebugItem(11, 3);   // entling-branch
        addDebugItem(26, 3);   // miner-straps
        addDebugItem(17, 3);   // goblin-chief-armour
        addDebugItem(45, 2);   // witch-hare-sinew
        addDebugItem(28, 2);   // moss-troll-shard
        addDebugItem(15, 1);   // forest-wyrmling-fang
    
        gameState.player.gold = (gameState.player.gold || 0) + 5000;
        this.updateGoldDisplay();
        this.showTemporaryFeedback("Debug materials added!", '#aaffaa');
    }

    clearAllUI() {
        // Destroy elements specific to input or result states
        if (this.categoryContainer) this.categoryContainer.destroy();
        if (this.inputContainer) this.inputContainer.destroy();
        if (this.inventoryContainer) this.inventoryContainer.destroy();
        if (this.resultPopup) this.resultPopup.destroy();

        this.categoryContainer = null;
        this.inputContainer = null;
        this.inventoryContainer = null;
        this.resultPopup = null;
        this.materialSlots = [];
        this.craftButton = null;
        this.tierSumText = null; this.tierSumBg = null;
        this.costText = null; this.costTextBg = null;
        // **DO NOT CLEAR this.currentCategory here**
    }

    clearInputState() {
        // Destroy only the UI elements associated with the input screen
        if (this.inputContainer) this.inputContainer.destroy();
        if (this.inventoryContainer) this.inventoryContainer.destroy();
        this.inputContainer = null;
        this.inventoryContainer = null;
        this.materialSlots = [];
        this.craftButton = null;
        this.tierSumText = null; this.tierSumBg = null;
        this.costText = null; this.costTextBg = null;
        // Reset only the selected materials, keep the category
        this.selectedMaterials = [null, null, null];
        // **DO NOT CLEAR this.currentCategory here**
    }
    clearResultState() { if (this.resultPopup) this.resultPopup.destroy(); this.resultPopup = null; }

    displayCategorySelection() {
        this.clearAllUI();
        this.currentState = 'CATEGORY_SELECT';
        this.currentCategory = null; // <<< Reset category only when going back to selection
        const width = this.cameras.main.width; const height = this.cameras.main.height; this.categoryContainer = this.add.container(width / 2, height * 0.5); const categories = Object.keys(CRAFTING_CONFIG.crafting_recipes); const buttonWidth = 180; const buttonHeight = 60; const spacingY = 80; const startY = -((categories.length - 1) * spacingY) / 2; if (this.backButtonInstance) { this.backButtonInstance.setText('Overworld'); }
        categories.forEach((categoryName, index) => { let iconKey = ''; if (categoryName === 'Melee') iconKey = 'icon-melee'; else if (categoryName === 'Ranged') iconKey = 'icon-ranged'; else if (categoryName === 'Wand') iconKey = 'icon-wand'; else if (categoryName === 'Armour') iconKey = 'icon-armour'; const yPos = startY + index * spacingY; const button = this.ui.createButton( 0, yPos, categoryName, () => this.selectCategory(categoryName), { width: buttonWidth, height: buttonHeight } ); this.categoryContainer.add(button.container); if (iconKey && this.textures.exists(iconKey)) { const icon = this.add.image(-buttonWidth/2 - 30, yPos, iconKey).setDisplaySize(40, 40); this.categoryContainer.add(icon); } });
    }

    selectCategory(categoryName) {
        console.log(`Category selected: ${categoryName}`);
        this.currentCategory = categoryName;
        // Set requiredMaterials based on the selected category
        this.requiredMaterials = CRAFTING_CONFIG.crafting_recipes[categoryName]; // Assuming this holds ['Sharps', 'Sharps', 'Strings'], etc.
        console.log("Required material categories set:", this.requiredMaterials);
        this.displayCraftingInput(categoryName); // Now displayCraftingInput will have access
    }
    
    displayCraftingInput(categoryName) {
        if (!categoryName || !CRAFTING_CONFIG.crafting_recipes[categoryName]) {
            console.error(`Invalid category name passed to displayCraftingInput: ${categoryName}. Returning to category select.`);
            this.displayCategorySelection();
            return;
        }this.clearAllUI();
        this.currentState = 'INPUT';
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.inputContainer = this.add.container(0, 0).setDepth(5); // Ensure input UI is above background

        const inputTitle = this.ui.createTitle(width / 2, height * 0.18, `Craft: ${categoryName}`, { fontSize: this.ui.fontSize.md });
        this.inputContainer.add(inputTitle.background);
        this.inputContainer.add(inputTitle);

        if (this.backButtonInstance) { this.backButtonInstance.setText('Back'); }

        const requiredMaterialCategories = CRAFTING_CONFIG.crafting_recipes[categoryName];
        if (!requiredMaterialCategories || !Array.isArray(requiredMaterialCategories) || requiredMaterialCategories.length !== 3) {
            console.error(`Invalid or missing recipe configuration for category: ${categoryName}`);
            this.showTemporaryFeedback("Error: Invalid recipe data.");
            this.displayCategorySelection(); // Go back safely
            return;
       }
        this.updateInventoryDisplay(requiredMaterialCategories); // Pass the categories
        const slotSize = 70;
        const slotSpacing = 90;
        const totalSlotWidth = (3 * slotSize) + (2 * (slotSpacing - slotSize));
        const startXSlots = width / 2 - totalSlotWidth / 2;
        const slotsY = height * 0.35;
        this.materialSlots = [];

        for (let i = 0; i < 3; i++) {
            const slotX = startXSlots + i * slotSpacing; 
            const requiredCategory = requiredMaterialCategories[i];
            const placeholderIconKey = categoryIconKeys[requiredCategory] || 'icon-default-material'; const slotContainer = this.add.container(slotX, slotsY); const border = this.add.rectangle(0, 0, slotSize, slotSize, 0x222233, 0.8).setStrokeStyle(2, 0x5599ff); const placeholderIcon = this.add.image(0, 0, placeholderIconKey); if (!this.textures.exists(placeholderIconKey)) { placeholderIcon.setVisible(false); } else { placeholderIcon.setDisplaySize(slotSize * 0.7, slotSize * 0.7).setAlpha(0.5); } const itemIcon = this.add.image(0, 0, '').setVisible(false).setDisplaySize(slotSize*0.8, slotSize*0.8); const tooltipText = this.add.text(0, slotSize / 2 + 10, `Requires: ${requiredCategory}`, { fontSize: '10px', fill: '#ccc' }).setOrigin(0.5).setVisible(false); slotContainer.add([border, placeholderIcon, itemIcon, tooltipText]); this.inputContainer.add(slotContainer); border.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.removeMaterialFromSlot(i)).on('pointerover', () => tooltipText.setVisible(true)).on('pointerout', () => tooltipText.setVisible(false)); this.materialSlots.push({ container: slotContainer, border: border, placeholder: placeholderIcon, itemIcon: itemIcon, requiredCategory: requiredCategory, currentItem: null, tooltip: tooltipText });
        }

        // --- Tier Sum Text & BG ---
        const tierSumY = height * 0.48; // Adjusted Y position (below slots)
        this.tierSumBg = this.add.rectangle(width / 2, tierSumY, 150, 30, 0x000000, 0.6);
        this.tierSumText = this.add.text(width / 2, tierSumY, 'Total Tier: 0', {
            fontSize: this.ui.fontSize.sm, fill: '#ffffaa', align: 'center'
        }).setOrigin(0.5);
        this.tierSumBg.setSize(this.tierSumText.width + 20, this.tierSumText.height + 10);
        this.inputContainer.add(this.tierSumBg);
        this.inputContainer.add(this.tierSumText);
        // --- End Tier Sum ---

        // --- Gold Cost Text & BG ---
        const costY = tierSumY + 30; // Position below tier sum
        this.costTextBg = this.add.rectangle(width / 2, costY, 150, 30, 0x000000, 0.6);
        this.costText = this.add.text(width / 2, costY, `Cost: ${CRAFTING_GOLD_COST} Gold`, {
            fontSize: this.ui.fontSize.sm, fill: '#FFD700', align: 'center'
        }).setOrigin(0.5);
        this.costTextBg.setSize(this.costText.width + 20, this.costText.height + 10);
        this.inputContainer.add(this.costTextBg);
        this.inputContainer.add(this.costText);
        // --- End Gold Cost ---


        const invListWidth = width * 0.8;
        const invListHeight = height * 0.3;
        const invListX = width * 0.5;
        const invListY = height * 0.7; // Position inventory list lower
        this.inventoryContainer = new ScrollableContainer(this, invListX, invListY, invListWidth, invListHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });
        // Add ScrollableContainer elements with depth
         if (this.inventoryContainer.background) this.inputContainer.add(this.inventoryContainer.background.setDepth(10));
         if (this.inventoryContainer.border) this.inputContainer.add(this.inventoryContainer.border.setDepth(11));
         if (this.inventoryContainer.container) this.inputContainer.add(this.inventoryContainer.container.setDepth(12));
         if (this.inventoryContainer.scrollbarBg) this.inputContainer.add(this.inventoryContainer.scrollbarBg.setDepth(13));
         if (this.inventoryContainer.scrollbarHandle) this.inputContainer.add(this.inventoryContainer.scrollbarHandle.setDepth(14));

        this.updateInventoryDisplay(requiredMaterialCategories);

        this.craftButton = this.ui.createButton(
            width / 2,
            height * 0.92, // Near bottom
            'CRAFT',
            () => this.craftItem(),
            { width: 150, height: 50 }
        );
        this.craftButton.disable();
        this.craftButton.container.setAlpha(0.5);
        this.inputContainer.add(this.craftButton.container);
    }

    updateInventoryDisplay(filterCategories) {
        if (!this.inventoryContainer || !this.inventoryContainer.valid) { return; }
        this.inventoryContainer.clear();

        const inventory = gameState.player.inventory.items || [];
        const currentInventoryState = JSON.parse(JSON.stringify(inventory));
        console.log('Updating inventory display for required materials:', filterCategories);

        console.log('Player inventory items:', gameState.player.inventory.items);
        const relevantMaterials = currentInventoryState.filter(itemInstance => {
            console.log('Processing invItem:', itemInstance);
            if (!itemInstance) {
                // This console.warn is already inside getItemData, but logging here confirms context
                console.warn(`[CraftingScene Loop] Item data not found for ID: ${itemInstance.itemId}`);
                return; // Skip this inventory item if data is missing
           }
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.type === 'material' && itemInstance.quantity > 0 && filterCategories.includes(itemData.category);
        });

        if (relevantMaterials.length === 0) {
            this.inventoryContainer.addText('No relevant materials found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0;
            const itemHeight = 40;
            const iconSize = 30;
            const containerWidth = this.inventoryContainer.width || 0;

            relevantMaterials.forEach((itemInstance, inventoryIndex) => {
                const itemData = getItemData(itemInstance.itemId);
                if (!itemData) {
                    console.warn(`[Crafting UpdateInv] Skipping item instance with invalid ID:`, itemInstance.itemId);
                    return;
                }

                const itemRow = this.add.container(0, 0);
                const itemBg = this.add.rectangle( containerWidth / 2, itemHeight / 2, containerWidth - 20, itemHeight, 0x2a2a3e, 0.6 ).setOrigin(0.5);
                // Define hit area relative to the Rectangle's origin (0.5, 0.5)
                const hitAreaRect = new Phaser.Geom.Rectangle(-itemBg.width / 2, -itemBg.height / 2, itemBg.width, itemBg.height);
                // **Crucially, make itemBg interactive within the itemRow container**
                itemBg.setInteractive(hitAreaRect, Phaser.Geom.Rectangle.Contains);
                itemBg.input.cursor = 'pointer';


                let icon = null; if (itemData.iconKey && this.textures.exists(itemData.iconKey)) { icon = this.add.image(20 + iconSize / 2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5); itemRow.add(icon); }
                const countInSlots = this.selectedMaterials.reduce((count, slot) => count + (slot && slot.itemInstance.itemId === itemInstance.itemId ? 1 : 0), 0);
                const availableQuantity = itemInstance.quantity - countInSlots;
                const text = `${itemData.inGameName} (T${itemData.tier}) x${availableQuantity}`;
                const itemText = this.add.text(20 + iconSize + 15, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add(itemBg); itemRow.add(itemText); itemRow.sendToBack(itemBg);

                const canAddMore = availableQuantity > 0;

                itemBg.removeListener('pointerdown'); itemBg.removeListener('pointerover'); itemBg.removeListener('pointerout');
                itemText.setAlpha(1); itemBg.setFillStyle(0x2a2a3e, 0.6); itemBg.setStrokeStyle();
                 // Default to input disabled unless explicitly enabled
                if(itemBg.input) itemBg.input.enabled = false;


                if (!canAddMore) {
                    itemBg.setFillStyle(0x111111, 0.7); itemText.setAlpha(0.4);
                    // Input remains disabled
                } else {
                    if (itemBg.input) { // Check if input component exists
                         itemBg.input.enabled = true; // Explicitly enable
                     } else { // If it doesn't exist (shouldn't happen often), setInteractive again
                          itemBg.setInteractive(hitAreaRect, Phaser.Geom.Rectangle.Contains);
                          itemBg.input.cursor = 'pointer';
                          console.warn("Re-enabled input for itemBg", itemData.itemId);
                     }

                     itemBg.on('pointerdown', (pointer) => {
                        pointer.event.stopPropagation(); // Prevent scroll container drag

                        const currentGameStateItem = gameState.player.inventory.items.find(invItem => invItem.itemId === itemInstance.itemId);
                        const actualQuantity = currentGameStateItem ? currentGameStateItem.quantity : 0;
                        const currentCountInSlotsOnClick = this.selectedMaterials.reduce((count, slot) => count + (slot && slot.itemInstance.itemId === itemInstance.itemId ? 1 : 0), 0);

                        if (actualQuantity > currentCountInSlotsOnClick) {
                             console.log(`[Crafting CLICK] Click OK for: ${itemData.inGameName} (Available: ${availableQuantity}, Actual: ${actualQuantity}, In Slots: ${currentCountInSlotsOnClick})`);
                             this.handleInventoryItemClick(itemInstance, inventoryIndex);
                        } else {
                             console.warn(`[Crafting CLICK] Click denied for ${itemData.inGameName}. No longer available (Actual Qty: ${actualQuantity}, In Slots: ${currentCountInSlotsOnClick}).`);
                             this.showTemporaryFeedback("None available!");
                             // Optional refresh: this.updateInventoryDisplay(filterCategories);
                        }
                    });
                    itemBg.on('pointerover', () => { if (itemBg.input?.enabled) itemBg.setFillStyle(0x3a3a4e, 0.8); });
                    itemBg.on('pointerout', () => { if (itemBg.input?.enabled) itemBg.setFillStyle(0x2a2a3e, 0.6); });
                }

                this.inventoryContainer.addItem(itemRow, currentY);
                currentY += itemHeight + 5;
            });
        }
        this.inventoryContainer.updateMaxScroll();
    }

    handleInventoryItemClick(itemInstance, inventoryIndex) {
        const itemData = getItemData(itemInstance.itemId); if (!itemData) { return; }
        const targetSlotIndex = this.materialSlots.findIndex((slot, index) => !this.selectedMaterials[index] && slot.requiredCategory === itemData.category );
        if (targetSlotIndex !== -1) { this.addMaterialToSlot(itemInstance, inventoryIndex, targetSlotIndex); }
        else { this.showTemporaryFeedback("No suitable empty slot!"); }
    }
    addMaterialToSlot(itemInstance, originalInventoryIndex, slotIndex) {
        if (slotIndex < 0 || slotIndex >= 3 || this.selectedMaterials[slotIndex]) { return; }
        const itemData = getItemData(itemInstance.itemId); const slot = this.materialSlots[slotIndex]; if (!itemData || itemData.category !== slot.requiredCategory) { this.showTemporaryFeedback("Wrong material type!"); return; }
        const countInSlots = this.selectedMaterials.reduce((count, sl) => count + (sl && sl.itemInstance.itemId === itemInstance.itemId ? 1 : 0), 0);
        if (itemInstance.quantity <= countInSlots) { this.showTemporaryFeedback("None available!"); return; }
        this.selectedMaterials[slotIndex] = { itemInstance: itemInstance, originalIndex: originalInventoryIndex };
        if (itemData.iconKey && this.textures.exists(itemData.iconKey)) { slot.itemIcon.setTexture(itemData.iconKey).setVisible(true); slot.placeholder.setVisible(false); slot.border.setStrokeStyle(2, 0x00ff00); }
        else { slot.itemIcon.setVisible(false); slot.placeholder.setVisible(true); slot.border.setStrokeStyle(2, 0xff0000); }
        const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory]; this.updateInventoryDisplay(requiredMaterials); this.updateCraftButtonState(); // updateTierSumDisplay called within updateCraftButtonState
    }
    removeMaterialFromSlot(slotIndex) {
        if (slotIndex < 0 || slotIndex >= 3 || !this.selectedMaterials[slotIndex]) { return; }
        const removedItemInstance = this.selectedMaterials[slotIndex].itemInstance; this.selectedMaterials[slotIndex] = null; const slot = this.materialSlots[slotIndex]; slot.itemIcon.setVisible(false); slot.placeholder.setVisible(true); slot.border.setStrokeStyle(2, 0x5599ff);
        const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory]; this.updateInventoryDisplay(requiredMaterials); this.updateCraftButtonState(); // updateTierSumDisplay called within updateCraftButtonState
    }

    updateCraftButtonState() {
        const allSlotsFilled = this.selectedMaterials.every(material => material !== null);
        const hasEnoughGold = (gameState.player.gold || 0) >= CRAFTING_GOLD_COST;
        if (this.craftButton) {
            if (allSlotsFilled && hasEnoughGold) { this.craftButton.enable(); this.craftButton.container.setAlpha(1); }
            else { this.craftButton.disable(); this.craftButton.container.setAlpha(0.5); }
        }
        this.updateTierSumDisplay(); // Update tier sum display when button state changes
    }
    calculateTierSum() { return this.selectedMaterials.reduce((sum, selected) => { if (selected?.itemInstance) { const itemData = getItemData(selected.itemInstance.itemId); return sum + (itemData?.tier || 0); } return sum; }, 0); }
    updateTierSumDisplay() {
        if (!this.tierSumText || !this.tierSumBg) return;
        const tierSum = this.calculateTierSum();
        this.tierSumText.setText(`Total Tier: ${tierSum}`);
        this.tierSumBg.setSize(this.tierSumText.width + 20, this.tierSumText.height + 10);
        const hasEnoughGold = (gameState.player.gold || 0) >= CRAFTING_GOLD_COST;
        const allSlotsFilled = this.selectedMaterials.every(material => material !== null);
        if (allSlotsFilled && !hasEnoughGold) { this.tierSumText.setFill('#ffaaaa'); }
        else { this.tierSumText.setFill('#ffffaa'); }
    }

    craftItem() {
        if (!this.craftButton || this.craftButton.disabled) {
             console.log("[Craft Check] Craft button disabled or non-existent.");
             return;
        }
        if (!this.selectedMaterials.every(m => m !== null)) {
             this.showTemporaryFeedback("Fill all material slots!");
             return;
        }
        if ((gameState.player.gold || 0) < CRAFTING_GOLD_COST) {
             this.showTemporaryFeedback(`Need ${CRAFTING_GOLD_COST} Gold!`);
             return;
        }
 
        console.log("Attempting to craft..."); // Line 445
        let canAffordMaterials = true;
        const materialsToConsume = {};
 
        // Tally up materials needed from the slots
        for (const selected of this.selectedMaterials) {
            if (!selected || !selected.itemInstance) { // Added safety check
                console.error("[Craft Tally] Invalid item found in selectedMaterials slot!");
                canAffordMaterials = false;
                break;
            }
            const itemId = selected.itemInstance.itemId;
            materialsToConsume[itemId] = (materialsToConsume[itemId] || 0) + 1;
        }
 
        if (!canAffordMaterials) { // Check if tallying failed
            this.showTemporaryFeedback("Error reading selected materials.");
            return;
        }
 
        console.log("[Craft Check] Materials needed:", JSON.stringify(materialsToConsume)); // Log the tally
 
        // Check if player has enough in their ACTUAL inventory
        for (const itemIdStr in materialsToConsume) { // Use itemIdStr to emphasize it's a key
            const needed = materialsToConsume[itemIdStr];
            // Ensure we search using the correct type (string if keys are strings, number if keys are numbers)
            const searchKey = itemIdStr; // Assuming itemId stored in inventory is consistent now
 
            console.log(`[Craft Check] Checking for ID: ${searchKey}, Needed: ${needed}`); // Log check start
 
            const itemInInventory = gameState.player.inventory.items.find(invItem => String(invItem.itemId) === String(searchKey)); // String comparison
 
            if (!itemInInventory) {
                console.error(`[Craft Check] FAILED: Item ${searchKey} not found in inventory.`);
                canAffordMaterials = false;
                this.showTemporaryFeedback(`Missing ${getItemData(searchKey)?.inGameName || searchKey}!`);
                break; // Stop checking
            } else {
                console.log(`[Craft Check] Found ID: ${searchKey}, Has Quantity: ${itemInInventory.quantity} (Type: ${typeof itemInInventory.quantity})`); // Log found item quantity and type
                // Explicitly check if quantity is a number and compare
                if (typeof itemInInventory.quantity !== 'number' || itemInInventory.quantity < needed) {
                    console.error(`[Craft Check] FAILED: Quantity check failed for ${searchKey}. Has: ${itemInInventory.quantity}, Needed: ${needed}`);
                    canAffordMaterials = false;
                    this.showTemporaryFeedback(`Not enough ${getItemData(searchKey)?.inGameName || searchKey}!`);
                    break; // Stop checking
                } else {
                    console.log(`[Craft Check] PASSED: Quantity check for ${searchKey}. Has: ${itemInInventory.quantity}, Needed: ${needed}`);
                }
            }
        }
        // Log final state of gameState inventory *right before* consumption logic
        console.log("[Craft Check] Inventory state before consumption:", JSON.parse(JSON.stringify(gameState.player.inventory.items)));
 
 
        if (!canAffordMaterials) {
            console.log("[Craft Check] Material check failed. Aborting craft.");
            return; // Exit if not enough materials
        }
 
        // --- If check passes, proceed with crafting ---
        console.log("[Craft Logic] Material check passed. Proceeding...");
 
        const tierSum = this.calculateTierSum();
        const craftedRarity = this.determineRarity(tierSum);
        // ... (rest of your crafting logic: determineRarity, selectCraftedItemKey, consume materials, add item, showResult) ...
 
        // Ensure consumption happens *after* successful checks and item selection
        console.log("[Craft Logic] Consuming materials...");
        gameState.player.gold = (gameState.player.gold || 0) - CRAFTING_GOLD_COST; this.updateGoldDisplay(); // Consume gold first
 
        for (const itemIdStr in materialsToConsume) {
             const consumedCount = materialsToConsume[itemIdStr];
             const itemIndex = gameState.player.inventory.items.findIndex(invItem => String(invItem.itemId) === String(itemIdStr));
             if (itemIndex > -1) {
                 console.log(`[Craft Logic] Consuming ${consumedCount} of ${itemIdStr} (Index: ${itemIndex}). Current Qty: ${gameState.player.inventory.items[itemIndex].quantity}`);
                 gameState.player.inventory.items[itemIndex].quantity -= consumedCount;
                 if (gameState.player.inventory.items[itemIndex].quantity <= 0) {
                     console.log(`[Craft Logic] Removing ${itemIdStr} from inventory as quantity reached zero.`);
                     gameState.player.inventory.items.splice(itemIndex, 1);
                 } else {
                     console.log(`[Craft Logic] New quantity for ${itemIdStr}: ${gameState.player.inventory.items[itemIndex].quantity}`);
                 }
             } else {
                  console.error(`[Craft Logic] CRITICAL ERROR: Could not find item ${itemIdStr} to consume, even though check passed!`);
             }
        }
 
        // ... (Generate crafted item, add to inventory, showResult) ...
        const selectedItemKey = this.selectCraftedItemKey(this.currentCategory, craftedRarity);
        if (!selectedItemKey) { /* ... error handling ... */ return; }
        const craftedItemData = getItemData(selectedItemKey);
        if (!craftedItemData) { /* ... error handling ... */ return; }
 
        // Add to inventory check
        if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
        const spaceAvailable = (gameState.player.inventory.maxItems || 20) > gameState.player.inventory.items.length;
        if (!spaceAvailable) {
             this.showTemporaryFeedback("Inventory Full!");
             // Consider refunding materials/gold here if desired?
             // Refresh UI
             this.clearInputState();
             this.displayCraftingInput(this.currentCategory);
             return;
        }
        gameState.player.inventory.items.push({ itemId: craftedItemData.itemId, quantity: 1 });
        console.log(`[Craft Logic] Added crafted item ${craftedItemData.itemId} to inventory.`);
 
        this.showResult(craftedItemData); // Show success popup
        this.selectedMaterials = [null, null, null]; // Reset slots for next craft (if needed by showResult flow)
 
    }



    determineRarity(tierSum) {
        const minTier = Math.min(...Object.keys(CRAFTING_CONFIG.tier_probability_chart).map(Number));
        const maxTier = Math.max(...Object.keys(CRAFTING_CONFIG.tier_probability_chart).map(Number));
        const effectiveTierSum = Math.max(minTier, Math.min(tierSum, maxTier));

        const probabilities = CRAFTING_CONFIG.tier_probability_chart[effectiveTierSum.toString()];
        if (!probabilities) {
            console.warn(`No probability data for effective tier sum: ${effectiveTierSum}. Defaulting to Common.`);
            return "Common";
        }

        const roll = Math.random() * 100;
        let cumulativeProb = 0;
        const rarityOrder = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

        for (const rarity of rarityOrder) {
            cumulativeProb += probabilities[rarity] || 0;
            if (roll < cumulativeProb) {
                return rarity;
            }
        }
        return "Common";
    }

    selectCraftedItemKey(category, rarity) { // Renamed to indicate it returns the key
        const targetTier = rarityToTier(rarity);
        const targetEquipmentType = categoryToEquipmentType[category];
        // console.log(`[selectCraftedItemKey] Args: category=${category}, rarity=${rarity}, targetTier=${targetTier}, targetEquipType=${targetEquipmentType}`);
        if (!targetEquipmentType) return null;

        const possibleItems = Object.values(itemDatabase).filter(item => {
             const isEquipment = item.type === 'equipment'; const tierMatch = item.tier === targetTier; const typeMatch = item.category === targetEquipmentType; let subtypeMatch = true;
             if (isEquipment && typeMatch && targetEquipmentType === 'Weapon') { const expectedIconKey = categoryToEquipmentIconKey[category]; const actualIconKey = items.getEquipmentIconKey(item.itemName, item.category); subtypeMatch = (actualIconKey === expectedIconKey); }
             return isEquipment && tierMatch && typeMatch && subtypeMatch;
        });
        // console.log(`[selectCraftedItemKey] Found ${possibleItems.length} possible items for Tier ${targetTier} ${category}:`, possibleItems.map(i => i.itemId));

        if (possibleItems.length === 0) { console.warn(`[selectCraftedItemKey] No items found matching criteria.`); return null; }

        const randomIndex = Math.floor(Math.random() * possibleItems.length);
        const selectedRawItem = possibleItems[randomIndex];
        // console.log(`[selectCraftedItemKey] Random index: ${randomIndex}, Selected raw item:`, selectedRawItem);

        if (!selectedRawItem || !selectedRawItem.itemName) { // Check for itemName (the string key)
             console.error(`[selectCraftedItemKey] Error: Selected item at index ${randomIndex} is invalid or missing itemName!`, selectedRawItem);
             return null;
        }
        // console.log(`[selectCraftedItemKey] Returning key: ${selectedRawItem.itemName}`);
        return selectedRawItem.itemName; // <<< RETURN THE STRING KEY
   }

    showResult(craftedItemData) {
         this.clearAllUI(); // Clear input UI
         this.currentState = 'RESULT';
         const width = this.cameras.main.width;
         const height = this.cameras.main.height;

         this.resultPopup = this.add.container(width / 2, height / 2);

         const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.7).setInteractive();
         this.resultPopup.add(overlay);

         const panelWidth = width * 0.6;
         const panelHeight = height * 0.5;
         const panelBorderColor = rarityColors[craftedItemData.rarity] || 0xffffff;
         const panel = this.ui.createPanel(0, 0, panelWidth, panelHeight, {
              borderColor: panelBorderColor
         });
         this.resultPopup.add(panel.container);


         const resultTitle = this.add.text(0, -panelHeight * 0.4, 'Crafting Successful!', {
              fontSize: this.ui.fontSize.md, fill: '#aaffaa'
         }).setOrigin(0.5);
         this.resultPopup.add(resultTitle);

          let itemIcon = null;
          if (craftedItemData.iconKey && this.textures.exists(craftedItemData.iconKey)) {
              itemIcon = this.add.image(0, -panelHeight * 0.15, craftedItemData.iconKey).setDisplaySize(80, 80);
              this.resultPopup.add(itemIcon);
          }

          const nameText = this.add.text(0, -panelHeight * 0.15 + 60, craftedItemData.inGameName, {
              fontSize: this.ui.fontSize.md, fill: '#ffffff'
          }).setOrigin(0.5);
          this.resultPopup.add(nameText);

          const rarityText = this.add.text(0, -panelHeight * 0.15 + 85, craftedItemData.rarity, {
               fontSize: this.ui.fontSize.sm, fill: panelBorderColor
          }).setOrigin(0.5);
          this.resultPopup.add(rarityText);


          let statsString = craftedItemData.effects ? Object.entries(craftedItemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join('\n') : 'No special effects.';
          const statsText = this.add.text(0, 0, statsString, {
              fontSize: this.ui.fontSize.sm, fill: '#cccccc', align: 'center', wordWrap: {width: panelWidth * 0.8}
          }).setOrigin(0.5);
          this.resultPopup.add(statsText);

          const buttonY = panelHeight * 0.4;
          const buttonSpacing = panelWidth * 0.3;

          // Done Button
          const doneButton = this.ui.createButton(-buttonSpacing / 2, buttonY, 'Done', () => {
            this.saveGameState(); // Call a new save function
            this.clearResultState();
            this.displayCategorySelection(); // Go back to category selection
          }, { width: 140, height: 40 });
          this.resultPopup.add(doneButton.container);

          // Craft Again Button
          const craftAgainButton = this.ui.createButton(buttonSpacing / 2, buttonY, 'Craft Again', () => {
            this.saveGameState(); // Call a new save function
            this.clearResultState();
            if (this.currentCategory) {
                this.displayCraftingInput(this.currentCategory);
            } else {
                this.displayCategorySelection();
            }
          }, { width: 140, height: 40 });
          this.resultPopup.add(craftAgainButton.container);


          this.resultPopup.setScale(0);
          this.tweens.add({
              targets: this.resultPopup,
              scale: 1,
              duration: 300,
              ease: 'Back.easeOut'
          });
    }
    saveGameState() {
        console.log("[CraftingScene] Saving gameState to localStorage...");
        try {
            // Only save essential parts to avoid bloating localStorage
            const stateToSave = {
                 player: {
                     // Include all necessary player data that might change
                     name: gameState.player.name,
                     class: gameState.player.class,
                     level: gameState.player.level,
                     health: gameState.player.health, // Current health might change? Unlikely in crafting
                     maxHealth: gameState.player.maxHealth,
                     mana: gameState.player.mana,
                     maxMana: gameState.player.maxMana,
                     experience: gameState.player.experience,
                     experienceToNextLevel: gameState.player.experienceToNextLevel,
                     gold: gameState.player.gold, // Gold definitely changes
                     inventory: gameState.player.inventory, // Save the whole inventory object
                     // Add other relevant stats if they can change outside combat/level up
                 }
                 // Add other top-level gameState parts if needed (e.g., quests, discovered dungeons)
            };
            window.localStorage.setItem('gameState', JSON.stringify(stateToSave));
             console.log("[CraftingScene] GameState saved.");
        } catch (e) {
            console.error("[CraftingScene] Error saving gameState:", e);
        }
    }
     showTemporaryFeedback(message, color = '#ffaaaa') {
          if (!this.scene || !this.scene.key) { // Check if scene is still valid
               console.warn("Scene context lost, cannot show feedback:", message);
               return;
          }
          const width = this.cameras.main.width;
          const height = this.cameras.main.height;
          const feedbackText = this.add.text(width / 2, height * 0.8, message, {
              fontSize: this.ui.fontSize.sm, fill: color, backgroundColor: '#000000cc', padding: { x: 10, y: 5 }, align: 'center'
          }).setOrigin(0.5).setDepth(100);

          if (this.tweens) {
               this.tweens.add({
                   targets: feedbackText,
                   alpha: 0,
                   y: '-=30',
                   delay: 1500,
                   duration: 500,
                   onComplete: () => { if (feedbackText.active) feedbackText.destroy(); } // Check active before destroy
               });
          } else {
               this.time.delayedCall(2000, () => { if (feedbackText.active) feedbackText.destroy(); });
          }
     }

}

export default CraftingScene;