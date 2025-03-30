// ---- File: CraftingScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../gameState.js';
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

const CRAFTING_GOLD_COST = 500; // Define the gold cost


class CraftingScene extends BaseScene { // Extend BaseScene
    constructor() {
        super({ key: 'CraftingScene' }); // Call super constructor
        this.currentState = 'CATEGORY_SELECT'; // CATEGORY_SELECT, INPUT, RESULT
        this.currentCategory = null; // e.g., 'Melee', 'Armour'
        this.selectedMaterials = [null, null, null]; // Stores { itemInstance, originalIndex } for each slot
        this.materialSlots = []; // References to UI elements for the 3 input slots
        this.inventoryContainer = null; // ScrollableContainer for materials
        this.craftButton = null;
        this.tierSumText = null;
        this.tierSumBg = null; // Background for tier sum
        this.resultPopup = null; // Container for result display
        this.goldText = null;
        this.backButtonInstance = null; // <<-- ADDED: Store reference to the back button instance
        this.costText = null; // Add reference for cost text
        this.costTextBg = null; // Background for cost text
    }

    preload() {
        // --- Ensure BaseScene preload if it has one ---
        // super.preload(); // Uncomment if BaseScene has its own preload

        if (!this.textures.exists('crafting-bg')) {
            this.load.image('crafting-bg', ASSET_PATHS.BACKGROUNDS.CRAFTING);
        }
         // Load Gold Icon
        if (!this.textures.exists('gold-icon')) { // Use a consistent key
            this.load.image('gold-icon', ASSET_PATHS.ITEMS.GOLD);
        }

        // Load Category Icons (used for buttons and placeholders)
        const preloadIcon = (key, path) => {
            if (path && !this.textures.exists(key)) this.load.image(key, path);
             else if (!path) console.warn(`Preload Icon: Path missing for key ${key}`);
        };
        preloadIcon('icon-melee', categoryIconKeys.Weapon.Melee ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Melee] : ASSET_PATHS.EQUIPMENT.MELEE_WEAPON);
        preloadIcon('icon-ranged', categoryIconKeys.Weapon.Ranged ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Ranged] : ASSET_PATHS.EQUIPMENT.RANGED_WEAPON);
        preloadIcon('icon-wand', categoryIconKeys.Weapon.Wand ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Weapon.Wand] : ASSET_PATHS.EQUIPMENT.WAND);
        preloadIcon('icon-armour', categoryIconKeys.Armour ? ASSET_PATHS.EQUIPMENT[categoryIconKeys.Armour] : ASSET_PATHS.EQUIPMENT.ARMOUR);

        // Load Material Category Icons (used as placeholders in slots)
        preloadIcon(categoryIconKeys.Sharps, ASSET_PATHS.MATERIALS.SHARPS);
        preloadIcon(categoryIconKeys.Strings, ASSET_PATHS.MATERIALS.STRINGS);
        preloadIcon(categoryIconKeys.Branches, ASSET_PATHS.MATERIALS.BRANCHES);
        preloadIcon(categoryIconKeys.Armour, ASSET_PATHS.MATERIALS.ARMOUR);

        // Preload ALL material icons from item database
        Object.values(itemDatabase).forEach(item => {
            if (item.type === 'material' && item.iconKey) {
                 let path = null;
                 if (ASSET_PATHS.MATERIALS[item.iconKey]) path = ASSET_PATHS.MATERIALS[item.iconKey];
                 else if (ASSET_PATHS.ITEMS[item.iconKey]) path = ASSET_PATHS.ITEMS[item.iconKey];
                 if (path && !this.textures.exists(item.iconKey)) {
                     this.load.image(item.iconKey, path);
                 }
            }
        });

         // Preload ALL potential crafted item icons
         Object.values(itemDatabase).forEach(item => {
             if (item.type === 'equipment' && item.iconKey) {
                 let path = null;
                 if (ASSET_PATHS.EQUIPMENT[item.iconKey]) path = ASSET_PATHS.EQUIPMENT[item.iconKey];
                  else if (ASSET_PATHS.ITEMS[item.iconKey]) path = ASSET_PATHS.ITEMS[item.iconKey];
                 if (path && !this.textures.exists(item.iconKey)) {
                     this.load.image(item.iconKey, path);
                 }
             }
         });
    }

    create() {
        this.initializeScene(); // Call BaseScene setup **FIRST**
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.add.image(width / 2, height / 2, 'crafting-bg').setDisplaySize(width, height);
        this.ui.createTitle(width / 2, height * 0.08, 'Crafting Workshop', { fontSize: this.ui.fontSize.lg });

        this.createGoldDisplay(); // Add gold display
        this.createNavigationButtons(); // Create navigation buttons FIRST to store reference
        this.displayCategorySelection(); // Start with category selection

        // --- DEBUG START: Add debug key listener ---
        this.input.keyboard.on('keydown-M', () => { // Press 'M' for Materials
            console.warn("DEBUG: Giving materials via keypress!");
            this.giveDebugMaterials();
            // Refresh inventory display ONLY if in the INPUT state
            if (this.currentState === 'INPUT' && this.inventoryContainer) {
                 const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory];
                 this.updateInventoryDisplay(requiredMaterials || []); // Refresh with current filter
            }
        });
        console.log("Crafting Scene: Press 'M' to add debug materials.");
    }

    createGoldDisplay() {
        const width = this.cameras.main.width;
        const goldDisplayX = width * 0.85;
        const goldDisplayY = this.cameras.main.height * 0.08;
        const iconSize = 24;

        if (this.textures.exists('gold-icon')) {
            this.add.image(goldDisplayX - 40, goldDisplayY, 'gold-icon')
                .setDisplaySize(iconSize, iconSize)
                .setOrigin(1, 0.5);
        }

        this.goldText = this.add.text(goldDisplayX, goldDisplayY, `Gold: ${gameState.player.gold || 0}`, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md,
            fill: '#FFD700',
            align: 'left'
        }).setOrigin(0, 0.5);
    }

     updateGoldDisplay() {
         if (this.goldText) {
             this.goldText.setText(`Gold: ${gameState.player.gold || 0}`);
         }
     }


    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Back / Return to Overworld Button
        // Store the created Button instance in this.backButtonInstance
        this.backButtonInstance = this.ui.createButton(
            width * 0.15,
            height * 0.92,
            'Back', // Initial text can be 'Back' or 'Overworld'
            () => {
                this.safePlaySound('button-click');
                if (this.currentState === 'INPUT' || this.currentState === 'RESULT') {
                    this.clearInputState();
                    this.clearResultState();
                    this.displayCategorySelection(); // Go back to category select
                } else { // If in CATEGORY_SELECT
                    navigationManager.navigateTo(this, 'OverworldScene');
                }
            },
            { width: 120, height: 45, fontSize: this.ui.fontSize.sm }
        );
        // No need to set name on container: this.backButtonInstance.container.setName('backButton');
    }

 // --- DEBUG START: Helper function ---
 giveDebugMaterials() {
    if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 50, equipped: {} };
    if (!gameState.player.inventory.items) gameState.player.inventory.items = [];

    const addDebugItem = (itemId, quantity) => { /* ... same helper function as Option 1 ... */
        const itemData = getItemData(itemId); if (!itemData) { console.warn(`DEBUG: Item data not found for ${itemId}`); return; }
        const existingItemIndex = gameState.player.inventory.items.findIndex(i => i.itemId === itemId);
        if (existingItemIndex > -1) { gameState.player.inventory.items[existingItemIndex].quantity += quantity; }
        else { gameState.player.inventory.items.push({ itemId: itemId, quantity: quantity }); }
    };

    addDebugItem('goblin-teeth', 10); addDebugItem('wolf-claws', 10); addDebugItem('goblin-sinew', 10);
    addDebugItem('wild-boar-sinew', 10); addDebugItem('mushroom-arms', 10); addDebugItem('wolf-pelt', 10);
    addDebugItem('spider-fang', 5); addDebugItem('spider-silk', 5); addDebugItem('briar-sprite-branch', 5); addDebugItem('bandit-armour', 5);
    addDebugItem('crystal-golem-shard', 3); addDebugItem('entling-branch', 3); addDebugItem('miner-straps', 3); addDebugItem('goblin-chief-armour', 3);
    addDebugItem('witch-hare-sinew', 2); addDebugItem('moss-troll-shard', 2); addDebugItem('forest-wyrmling-fang', 1);
    // Give some gold too for testing cost
    gameState.player.gold = (gameState.player.gold || 0) + 5000;
    this.updateGoldDisplay(); // Update gold display immediately

    this.showTemporaryFeedback("Debug materials added!", '#aaffaa');
}
    // --- UI State Management ---

    clearAllUI() {
        // Destroy elements specific to input or result states
        if (this.categoryContainer) this.categoryContainer.destroy();
        if (this.inputContainer) this.inputContainer.destroy();
        if (this.inventoryContainer) this.inventoryContainer.destroy(); // ScrollableContainer needs destroy
        if (this.resultPopup) this.resultPopup.destroy();

        this.categoryContainer = null;
        this.inputContainer = null;
        this.inventoryContainer = null;
        this.resultPopup = null;
        this.materialSlots = [];
        this.craftButton = null;
        this.tierSumText = null;
    }

    clearInputState() {
        if (this.inputContainer) this.inputContainer.destroy();
        if (this.inventoryContainer) this.inventoryContainer.destroy();
        this.inputContainer = null;
        this.inventoryContainer = null;
        this.materialSlots = [];
        this.craftButton = null;
        this.tierSumText = null;
        this.selectedMaterials = [null, null, null];
        this.currentCategory = null;
    }

    clearResultState() {
         if (this.resultPopup) this.resultPopup.destroy();
         this.resultPopup = null;
    }

    displayCategorySelection() {
        this.clearAllUI();
        this.currentState = 'CATEGORY_SELECT';
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.categoryContainer = this.add.container(width / 2, height * 0.5);

        const categories = Object.keys(CRAFTING_CONFIG.crafting_recipes);
        const buttonWidth = 180;
        const buttonHeight = 60;
        const spacingY = 80;
        const startY = -((categories.length - 1) * spacingY) / 2;

        // Update Back button text for this state using the stored instance
        if (this.backButtonInstance) {
             this.backButtonInstance.setText('Overworld');
        }

        categories.forEach((categoryName, index) => {
            let iconKey = '';
            if (categoryName === 'Melee') iconKey = 'icon-melee';
            else if (categoryName === 'Ranged') iconKey = 'icon-ranged';
            else if (categoryName === 'Wand') iconKey = 'icon-wand';
            else if (categoryName === 'Armour') iconKey = 'icon-armour';

            const yPos = startY + index * spacingY;

            const button = this.ui.createButton(
                0, yPos, categoryName,
                () => this.selectCategory(categoryName),
                { width: buttonWidth, height: buttonHeight }
            );
            this.categoryContainer.add(button.container); // Add the button's Phaser container

            if (iconKey && this.textures.exists(iconKey)) {
                const icon = this.add.image(-buttonWidth/2 - 30, yPos, iconKey).setDisplaySize(40, 40);
                this.categoryContainer.add(icon);
            }
        });
    }

    selectCategory(categoryName) {
        console.log(`Category selected: ${categoryName}`);
        this.currentCategory = categoryName;
        this.displayCraftingInput(categoryName);
    }

    displayCraftingInput(categoryName) {
        this.clearAllUI();
        this.currentState = 'INPUT';
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.inputContainer = this.add.container(0, 0);

        const inputTitle = this.ui.createTitle(width / 2, height * 0.18, `Craft: ${categoryName}`, { fontSize: this.ui.fontSize.md });
        this.inputContainer.add(inputTitle.background);
        this.inputContainer.add(inputTitle);

        if (this.backButtonInstance) { this.backButtonInstance.setText('Back'); }

        const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[categoryName];
        const slotSize = 70;
        const slotSpacing = 90;
        const totalSlotWidth = (3 * slotSize) + (2 * (slotSpacing - slotSize));
        const startXSlots = width / 2 - totalSlotWidth / 2;
        const slotsY = height * 0.35;
        this.materialSlots = [];

        for (let i = 0; i < 3; i++) { /* ... slot creation logic - no changes ... */
            const slotX = startXSlots + i * slotSpacing; const requiredCategory = requiredMaterials[i]; const placeholderIconKey = categoryIconKeys[requiredCategory] || 'icon-default-material'; const slotContainer = this.add.container(slotX, slotsY); const border = this.add.rectangle(0, 0, slotSize, slotSize, 0x222233, 0.8).setStrokeStyle(2, 0x5599ff); const placeholderIcon = this.add.image(0, 0, placeholderIconKey); if (!this.textures.exists(placeholderIconKey)) { placeholderIcon.setVisible(false); } else { placeholderIcon.setDisplaySize(slotSize * 0.7, slotSize * 0.7).setAlpha(0.5); } const itemIcon = this.add.image(0, 0, '').setVisible(false).setDisplaySize(slotSize*0.8, slotSize*0.8); const tooltipText = this.add.text(0, slotSize / 2 + 10, `Requires: ${requiredCategory}`, { fontSize: '10px', fill: '#ccc' }).setOrigin(0.5).setVisible(false); slotContainer.add([border, placeholderIcon, itemIcon, tooltipText]); this.inputContainer.add(slotContainer); border.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.removeMaterialFromSlot(i)).on('pointerover', () => tooltipText.setVisible(true)).on('pointerout', () => tooltipText.setVisible(false)); this.materialSlots.push({ container: slotContainer, border: border, placeholder: placeholderIcon, itemIcon: itemIcon, requiredCategory: requiredCategory, currentItem: null, tooltip: tooltipText });
         }

        // --- Tier Sum Text with Background ---
        const tierSumY = slotsY + slotSize / 2 + 40; // Adjusted Y
        this.tierSumText = this.add.text(width / 2, tierSumY, 'Total Tier: 0', {
            fontSize: this.ui.fontSize.sm, fill: '#ffffaa', align: 'center'
        }).setOrigin(0.5);
        // Add background rectangle behind it
        this.tierSumBg = this.add.rectangle(width / 2, tierSumY, this.tierSumText.width + 20, this.tierSumText.height + 10, 0x000000, 0.6);
        this.inputContainer.add(this.tierSumBg); // Add BG first
        this.inputContainer.add(this.tierSumText); // Add Text on top
        // --- End Tier Sum ---

        // --- Gold Cost Text with Background ---
        const costY = height * 0.88 - 45; // Position above craft button
        this.costText = this.add.text(width / 2, costY, `Cost: ${CRAFTING_GOLD_COST} Gold`, {
            fontSize: this.ui.fontSize.sm, fill: '#FFD700', align: 'center' // Gold color
        }).setOrigin(0.5);
         // Add background rectangle behind it
        this.costTextBg = this.add.rectangle(width / 2, costY, this.costText.width + 20, this.costText.height + 10, 0x000000, 0.6);
        this.inputContainer.add(this.costTextBg); // Add BG first
        this.inputContainer.add(this.costText); // Add Text on top
        // --- End Gold Cost ---


        const invListWidth = width * 0.8;
        const invListHeight = height * 0.3;
        const invListX = width * 0.5;
        const invListY = height * 0.65; // Y position of the inventory list

        this.inventoryContainer = new ScrollableContainer(this, invListX, invListY, invListWidth, invListHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });
         if (this.inventoryContainer.background) this.inputContainer.add(this.inventoryContainer.background);
         if (this.inventoryContainer.border) this.inputContainer.add(this.inventoryContainer.border);
         if (this.inventoryContainer.container) this.inputContainer.add(this.inventoryContainer.container);
         if (this.inventoryContainer.scrollbarBg) this.inputContainer.add(this.inventoryContainer.scrollbarBg);
         if (this.inventoryContainer.scrollbarHandle) this.inputContainer.add(this.inventoryContainer.scrollbarHandle);

        this.updateInventoryDisplay(requiredMaterials);

        this.craftButton = this.ui.createButton(
            width / 2,
            height * 0.88, // Y position of the craft button
            'CRAFT',
            () => this.craftItem(),
            { width: 150, height: 50 }
        );
        this.craftButton.disable();
        this.craftButton.container.setAlpha(0.5);
        this.inputContainer.add(this.craftButton.container);
    }

    updateInventoryDisplay(filterCategories) {
        if (!this.inventoryContainer || !this.inventoryContainer.valid) { /* ... */ return; }
        this.inventoryContainer.clear();

        const inventory = gameState.player.inventory.items || [];
        const relevantMaterials = inventory.filter(itemInstance => { /* ... */
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.type === 'material' && itemInstance.quantity > 0 && filterCategories.includes(itemData.category);
        });

        if (relevantMaterials.length === 0) { /* ... */ }
        else {
            let currentY = 0; const itemHeight = 40; const iconSize = 30; const containerWidth = this.inventoryContainer.width || 0;

            relevantMaterials.forEach((itemInstance, inventoryIndex) => {
                const itemData = getItemData(itemInstance.itemId); if (!itemData) return;
                const itemRow = this.add.container(0, 0);
                const itemBg = this.add.rectangle( containerWidth / 2, itemHeight / 2, containerWidth - 20, itemHeight, 0x2a2a3e, 0.6 ).setOrigin(0.5);
                // --- Set itemBg interactive with its own bounds ---
                itemBg.setInteractive(new Phaser.Geom.Rectangle(0, 0, containerWidth - 20, itemHeight), Phaser.Geom.Rectangle.Contains);
                itemBg.input.cursor = 'pointer'; // Add hand cursor


                let icon = null; if (itemData.iconKey && this.textures.exists(itemData.iconKey)) { icon = this.add.image(20 + iconSize / 2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5); itemRow.add(icon); }
                const countInSlots = this.selectedMaterials.reduce((count, slot) => count + (slot && slot.itemInstance.itemId === itemInstance.itemId ? 1 : 0), 0);
                const availableQuantity = itemInstance.quantity - countInSlots;
                const text = `${itemData.inGameName} (T${itemData.tier}) x${availableQuantity}`;
                const itemText = this.add.text(20 + iconSize + 15, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add(itemBg); itemRow.add(itemText); itemRow.sendToBack(itemBg);

                const canAddMore = availableQuantity > 0;

                itemBg.removeListener('pointerdown'); itemBg.removeListener('pointerover'); itemBg.removeListener('pointerout');
                itemText.setAlpha(1); itemBg.setFillStyle(0x2a2a3e, 0.6); itemBg.setStrokeStyle();
                // Explicitly disable if needed, otherwise setInteractive above handles it
                // itemBg.input.enabled = canAddMore; // Control input enabled state

                if (!canAddMore) {
                    itemBg.setFillStyle(0x111111, 0.7); itemText.setAlpha(0.4);
                    itemBg.input.enabled = false; // Explicitly disable input
                } else {
                     itemBg.input.enabled = true; // Ensure input is enabled
                     itemBg.on('pointerdown', (pointer) => {
                        // Stop the event from propagating further up (like to the scroll container drag)
                        pointer.event.stopPropagation();
                        console.log(`[Crafting CLICK] Clicked on BG for: ${itemData.inGameName} (Available: ${availableQuantity})`);
                        const currentCountInSlotsOnClick = this.selectedMaterials.reduce((count, slot) => count + (slot && slot.itemInstance.itemId === itemInstance.itemId ? 1 : 0), 0);
                        if (itemInstance.quantity > currentCountInSlotsOnClick) { this.handleInventoryItemClick(itemInstance, inventoryIndex); }
                        else { console.warn(`[Crafting CLICK] Click denied for ${itemData.inGameName}. No longer available.`); this.showTemporaryFeedback("None available!"); }
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
        // console.log(`[Crafting handleInventoryItemClick] Processing click for ${itemInstance.itemId}`);
        const itemData = getItemData(itemInstance.itemId);
        if (!itemData) { /* ... error handling ... */ return; }

        const targetSlotIndex = this.materialSlots.findIndex((slot, index) =>
            !this.selectedMaterials[index] && slot.requiredCategory === itemData.category
        );

         // console.log(`[Crafting handleInventoryItemClick] Found target slot index: ${targetSlotIndex} for category ${itemData.category}`);

        if (targetSlotIndex !== -1) {
            this.addMaterialToSlot(itemInstance, inventoryIndex, targetSlotIndex);
        } else {
            // console.log("[Crafting handleInventoryItemClick] No suitable empty slot found.");
            this.showTemporaryFeedback("No suitable empty slot!");
        }
    }


    addMaterialToSlot(itemInstance, originalInventoryIndex, slotIndex) {
        // console.log(`[Crafting addMaterialToSlot] Adding ${itemInstance.itemId} to slot ${slotIndex}`);
        if (slotIndex < 0 || slotIndex >= 3 || this.selectedMaterials[slotIndex]) { /*...*/ return; }

        const itemData = getItemData(itemInstance.itemId);
        const slot = this.materialSlots[slotIndex];

        if (!itemData || itemData.category !== slot.requiredCategory) { /*...*/ this.showTemporaryFeedback("Wrong material type!"); return; }

        // --- Check Available Quantity Again ---
        const countInSlots = this.selectedMaterials.reduce((count, sl) => {
            return count + (sl && sl.itemInstance.itemId === itemInstance.itemId ? 1 : 0);
        }, 0);
        if (itemInstance.quantity <= countInSlots) {
            console.warn(`[Crafting addMaterialToSlot] Attempted to add ${itemInstance.itemId} but none available (In Slots: ${countInSlots}, Total: ${itemInstance.quantity}).`);
            this.showTemporaryFeedback("None available!");
            return; // Stop if none are actually available
        }
        // --- End Check Available Quantity ---


       this.selectedMaterials[slotIndex] = { itemInstance: itemInstance, originalIndex: originalInventoryIndex };
       // console.log(`[Crafting addMaterialToSlot] Stored material in selectedMaterials[${slotIndex}]`);

       if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
           slot.itemIcon.setTexture(itemData.iconKey).setVisible(true); slot.placeholder.setVisible(false); slot.border.setStrokeStyle(2, 0x00ff00);
           // console.log(`[Crafting addMaterialToSlot] Slot ${slotIndex} UI updated with item icon.`);
       } else { /* ... icon missing handling ... */ }

       const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory];
       // console.log("[Crafting addMaterialToSlot] Refreshing inventory display...");
       this.updateInventoryDisplay(requiredMaterials); // Refresh inventory

       this.updateCraftButtonState();
       this.updateTierSumDisplay();
   }

   removeMaterialFromSlot(slotIndex) {
    // console.log(`[Crafting removeMaterialFromSlot] Removing material from slot ${slotIndex}`);
    if (slotIndex < 0 || slotIndex >= 3 || !this.selectedMaterials[slotIndex]) { /*...*/ return; }

     // --- Store the item being removed to update inventory correctly ---
     const removedItemInstance = this.selectedMaterials[slotIndex].itemInstance;
     // --- End Store ---


    this.selectedMaterials[slotIndex] = null;

    const slot = this.materialSlots[slotIndex];
    slot.itemIcon.setVisible(false); slot.placeholder.setVisible(true); slot.border.setStrokeStyle(2, 0x5599ff);
    // console.log(`[Crafting removeMaterialFromSlot] Slot ${slotIndex} UI reset to placeholder.`);

    const requiredMaterials = CRAFTING_CONFIG.crafting_recipes[this.currentCategory];
    // console.log("[Crafting removeMaterialFromSlot] Refreshing inventory display...");
    this.updateInventoryDisplay(requiredMaterials); // Refresh inventory (This will make the removed item clickable again if available)

    this.updateCraftButtonState();
    this.updateTierSumDisplay();
}

    // ... (updateCraftButtonState, calculateTierSum, updateTierSumDisplay, craftItem, determineRarity, selectCraftedItem, showResult, showTemporaryFeedback) ...
    // Keep the rest of the code the same from this point down
    updateCraftButtonState() {
        const allSlotsFilled = this.selectedMaterials.every(material => material !== null);
        const hasEnoughGold = (gameState.player.gold || 0) >= CRAFTING_GOLD_COST;

        if (this.craftButton) {
            if (allSlotsFilled && hasEnoughGold) {
                this.craftButton.enable(); this.craftButton.container.setAlpha(1);
            } else {
                this.craftButton.disable(); this.craftButton.container.setAlpha(0.5);
            }
        }
        // Update the tier sum display as well, as gold status might affect its appearance
        this.updateTierSumDisplay();
    }


    calculateTierSum() {
        return this.selectedMaterials.reduce((sum, selected) => {
            if (selected?.itemInstance) { // Safely access itemInstance
                const itemData = getItemData(selected.itemInstance.itemId);
                return sum + (itemData?.tier || 0);
            }
            return sum;
        }, 0);
    }

    updateTierSumDisplay() {
        if (!this.tierSumText || !this.tierSumBg) return;
        const tierSum = this.calculateTierSum();
        this.tierSumText.setText(`Total Tier: ${tierSum}`);
        // Adjust background size to fit text
        this.tierSumBg.setSize(this.tierSumText.width + 20, this.tierSumText.height + 10);

        const hasEnoughGold = (gameState.player.gold || 0) >= CRAFTING_GOLD_COST;
        const allSlotsFilled = this.selectedMaterials.every(material => material !== null);

        if (allSlotsFilled && !hasEnoughGold) {
            this.tierSumText.setFill('#ffaaaa'); // Warning color if no gold
        } else {
            this.tierSumText.setFill('#ffffaa'); // Normal color otherwise
        }
    }

    craftItem() {
       // ... (initial checks remain the same) ...
       if (!this.craftButton || this.craftButton.disabled) return; if (!this.selectedMaterials.every(m => m !== null)) { this.showTemporaryFeedback("Fill all material slots!"); return; } if ((gameState.player.gold || 0) < CRAFTING_GOLD_COST) { this.showTemporaryFeedback(`Need ${CRAFTING_GOLD_COST} Gold!`); return; }
       console.log("Attempting to craft..."); let canAffordMaterials = true; const materialsToConsume = {};
       for (const selected of this.selectedMaterials) { const itemId = selected.itemInstance.itemId; materialsToConsume[itemId] = (materialsToConsume[itemId] || 0) + 1; }
       for (const itemId in materialsToConsume) { const needed = materialsToConsume[itemId]; const itemInInventory = gameState.player.inventory.items.find(invItem => invItem.itemId === itemId); if (!itemInInventory || itemInInventory.quantity < needed) { canAffordMaterials = false; this.showTemporaryFeedback(`Not enough ${getItemData(itemId)?.inGameName || itemId}!`); break; } }
       if (!canAffordMaterials) return;

       const tierSum = this.calculateTierSum();
       const craftedRarity = this.determineRarity(tierSum);
       if (!craftedRarity) { this.showTemporaryFeedback("Crafting Failed!"); return; }

       console.log(`[Crafting] Trying to select item: Category=${this.currentCategory}, Rarity=${craftedRarity}, Tier=${rarityToTier(craftedRarity)}`);
       const selectedItemKey = this.selectCraftedItemKey(this.currentCategory, craftedRarity); // Get the string key

       if (!selectedItemKey) {
            console.error(`[Crafting] FAILED to select item KEY for Category=${this.currentCategory}, Rarity=${craftedRarity}`);
            this.showTemporaryFeedback("Crafting Failed! (No matching item found)"); return;
       }
        console.log("[Crafting] Successfully selected item key:", selectedItemKey);

        // Now get the actual data using the key
        const craftedItemData = getItemData(selectedItemKey);
        if (!craftedItemData) {
             console.error(`[Crafting] CRITICAL ERROR: getItemData failed for selected KEY ${selectedItemKey}, even though it came from itemDatabase!`);
             this.showTemporaryFeedback("Crafting Failed! (Internal Error)");
             return; // Stop if data retrieval fails
        }
        console.log("[Crafting] Successfully retrieved item data for:", craftedItemData.inGameName);


       // --- Commit Crafting ---
       this.safePlaySound('anvil-hit');
       gameState.player.gold = (gameState.player.gold || 0) - CRAFTING_GOLD_COST; this.updateGoldDisplay();
       for (const selected of this.selectedMaterials) { const itemId = selected.itemInstance.itemId; const itemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === itemId); if (itemIndex > -1) { gameState.player.inventory.items[itemIndex].quantity -= 1; if (gameState.player.inventory.items[itemIndex].quantity <= 0) { gameState.player.inventory.items.splice(itemIndex, 1); } } }
       if (!gameState.player.inventory.items) gameState.player.inventory.items = []; const spaceAvailable = (gameState.player.inventory.maxItems || 20) > gameState.player.inventory.items.length; if (!spaceAvailable) { this.showTemporaryFeedback("Inventory Full!"); this.clearInputState(); this.displayCraftingInput(this.currentCategory); return; }
       gameState.player.inventory.items.push({ itemId: craftedItemData.itemId, quantity: 1 }); // Use numeric itemId here
       this.showResult(craftedItemData); this.selectedMaterials = [null, null, null];
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
               this.clearResultState();
               this.displayCategorySelection(); // Go back to category selection
          }, { width: 140, height: 40 });
          this.resultPopup.add(doneButton.container);

          // Craft Again Button
          const craftAgainButton = this.ui.createButton(buttonSpacing / 2, buttonY, 'Craft Again', () => {
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