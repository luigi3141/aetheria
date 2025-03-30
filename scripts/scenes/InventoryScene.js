// ---- File: InventoryScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import Panel from '../ui/components/Panel.js';
import StatusBar from '../ui/components/StatusBar.js';
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import items from '../data/items.js';
const { getItemData } = items;
import HealthManager from '../utils/HealthManager.js';
import BaseScene from './BaseScene.js';
import CharacterManager from '../utils/CharacterManager.js';

class InventoryScene extends BaseScene {
    constructor() {
        super({ key: 'InventoryScene' });
        this.currentTab = 'Equipment';
        this.tabButtons = {};
        // Stores UI elements for each equipment slot { container, iconDisplay, border, label }
        this.equipmentSlots = {};
        this.returnSceneKey = 'OverworldScene';

        // Dynamic content containers (destroyed on tab switch)
        this.equipmentListContainer = null;
        this.materialsListContainer = null;
        this.potionsListContainer = null;
        this.potionsHpBar = null;
        this.potionsMpBar = null;
        this.materialsInfoMessage = null;

        // Static content container (created once)
        this.equipmentSlotsContainer = null; // The main container holding all slot visuals
        this.isSwitchingTabs = false; // Flag to prevent issues with rapid tab switching
    }

    init(data) {
        this.returnSceneKey = gameState.previousScene || 'OverworldScene';
        console.log(`InventoryScene init - Will return to ${this.returnSceneKey}`);

        // Load saved state
        const savedState = window.localStorage.getItem('gameState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.player) {
                // Update only inventory and stats, not scene-specific data
                gameState.player.inventory = parsedState.player.inventory;
                gameState.player.gold = parsedState.player.gold;
                gameState.player.experience = parsedState.player.experience;
                gameState.player.experienceToNextLevel = parsedState.player.experienceToNextLevel;
            }
        }

        // Log inventory state on scene init
        console.log('InventoryScene init - Inventory state:', {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });
    }

    preload() {
        console.log('InventoryScene Preload Start');
        if (!this.textures.exists('inventory-bg')) {
            this.load.image('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
        }

        // --- Load Specific Equipment Slot Placeholders ---
        // Load the Head image but assign it the texture key 'slot-body' for logical consistency
        if (!this.textures.exists('slot-body')) {
            this.load.image('slot-body', ASSET_PATHS.ITEMS.SLOT_HEAD);
        }
        // Load the Accessory image with the texture key 'slot-accessory'
        if (!this.textures.exists('slot-accessory')) {
            this.load.image('slot-accessory', ASSET_PATHS.ITEMS.SLOT_ACCESSORY);
        }
        // --- End Placeholder Loading ---


        // --- Load Item Icons ---
        // This assumes itemDatabase icons refer to keys in ASSET_PATHS.MATERIALS, .ITEMS, .EQUIPMENT etc.
        // Preload all possible item icons based on categoryIconKeys and itemDatabase definitions
        const preloadIcon = (iconKey) => {
            if (iconKey && typeof iconKey === 'string' && !this.textures.exists(iconKey)) {
                 // Find the path for this icon key in ASSET_PATHS
                 let path = null;
                 if (ASSET_PATHS.MATERIALS[iconKey]) path = ASSET_PATHS.MATERIALS[iconKey];
                 else if (ASSET_PATHS.ITEMS[iconKey]) path = ASSET_PATHS.ITEMS[iconKey];
                 else if (ASSET_PATHS.EQUIPMENT[iconKey]) path = ASSET_PATHS.EQUIPMENT[iconKey];
                 // Add more checks if icons are in other categories (e.g., EQUIPMENT_SLOTS if they double as icons)

                 if (path) {
                     this.load.image(iconKey, path);
                 } else {
                      console.warn(`Preload: Icon path not found in ASSET_PATHS for key: ${iconKey}`);
                 }
            }
        };

        // Preload icons defined in categoryIconKeys
        Object.values(items.categoryIconKeys).forEach(value => {
             if (typeof value === 'string') preloadIcon(value);
             else if (typeof value === 'object') {
                 Object.values(value).forEach(subValue => {
                     if (typeof subValue === 'string') preloadIcon(subValue);
                     else if (typeof subValue === 'object') { // Handle nested objects like Potion
                          Object.values(subValue).forEach(nestedValue => preloadIcon(nestedValue));
                     }
                 });
             }
        });

        // Preload icons explicitly defined in itemDatabase
        Object.values(items.itemDatabase).forEach(item => preloadIcon(item.iconKey));
        // --- End Item Icon Loading ---


        console.log('InventoryScene Preload End');
    }

    create() {
        console.log("InventoryScene Create Start");
        this.initializeScene(); // Sets up this.ui

        // Log inventory state at the start of scene creation
        console.log('InventoryScene create - Inventory state:', {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.add.image(width / 2, height / 2, 'inventory-bg').setDisplaySize(width, height);
        this.ui.createTitle(width / 2, height * 0.08, 'Inventory', { fontSize: this.ui.fontSize.lg });

        // Create tabs and return button (these are static for the scene)
        this.createTabs();
        this.createReturnButton();

        // --- Create Static Equipment Slots Container ---
        this.equipmentSlotsContainer = this.add.container(width * 0.75, height * 0.5);
        this.createEquipmentSlotsDisplay(this.equipmentSlotsContainer); // Create the visual slots
        this.updateEquipmentSlotsDisplay(); // Populate with current equipment
        // Initially hide it if the default tab is not Equipment
        this.equipmentSlotsContainer.setVisible(this.currentTab === 'Equipment');

        // Display the initial tab (which will create its dynamic content)
        // No need for events.once('create'), create() completes synchronously here
        this.setActiveTab(this.currentTab);
        console.log("InventoryScene Create End");

    }

    // --- Tab Management ---

    createTabs() {
        const width = this.cameras.main.width;
        const tabY = this.cameras.main.height * 0.18;
        const tabs = ['Equipment', 'Materials', 'Potions'];
        const tabWidth = 150;
        const tabSpacing = 20;
        const startX = (width / 2) - ((tabs.length * (tabWidth + tabSpacing)) - tabSpacing) / 2;

        this.tabButtons = {}; // Ensure it's reset if scene restarts
        tabs.forEach((tabName, index) => {
            const tabButton = this.ui.createButton(
                startX + index * (tabWidth + tabSpacing) + tabWidth/2,
                tabY,
                tabName,
                () => this.setActiveTab(tabName),
                { width: tabWidth, height: 40, fontSize: this.ui.fontSize.sm }
            );
            this.tabButtons[tabName] = tabButton;
        });
    }

    setActiveTab(tabName) {
        if (!this.tabButtons[tabName] || this.isSwitchingTabs) return; // Prevent rapid switching issues

        this.isSwitchingTabs = true; // Flag to prevent re-entry
        this.currentTab = tabName;
        console.log(`Switching to tab: ${tabName}`);

        // Update button states
        for (const name in this.tabButtons) {
            if (this.tabButtons[name]) { // Check button exists
                 this.tabButtons[name].setActive(name === tabName);
            }
        }

        // --- Clean up DYNAMIC content from PREVIOUS tab ---
        console.log("setActiveTab: Cleaning up previous tab content...");
        if (this.equipmentListContainer) { this.equipmentListContainer.destroy(); this.equipmentListContainer = null; }
        if (this.materialsListContainer) { this.materialsListContainer.destroy(); this.materialsListContainer = null; }
        if (this.potionsListContainer) { this.potionsListContainer.destroy(); this.potionsListContainer = null; }
        if (this.potionsHpBar) { this.potionsHpBar.destroy(); this.potionsHpBar = null; }
        if (this.potionsMpBar) { this.potionsMpBar.destroy(); this.potionsMpBar = null; }
        if (this.materialsInfoMessage) { this.materialsInfoMessage.destroy(); this.materialsInfoMessage = null; }
        console.log("setActiveTab: Cleanup complete.");
        // --- End Cleanup ---

        // --- Manage visibility of STATIC equipment slots ---
        this.equipmentSlotsContainer?.setVisible(tabName === 'Equipment'); // Use optional chaining

        // --- Create/Show content for the NEW active tab ---
        console.log(`setActiveTab: Displaying content for ${tabName}`);
        switch (tabName) {
            case 'Equipment':
                this.displayEquipmentTab();
                break;
            case 'Materials':
                this.displayMaterialsTab();
                break;
            case 'Potions':
                this.displayPotionsTab();
                break;
        }
        console.log(`setActiveTab: Finished displaying ${tabName}`);

        // Reset flag after a short delay to allow setup
        this.time.delayedCall(50, () => { this.isSwitchingTabs = false; });
    }

    // --- Content Display Functions ---

    displayEquipmentTab() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Equipment Slots container is static, ensure it's visible and updated
        this.equipmentSlotsContainer?.setVisible(true);
        this.updateEquipmentSlotsDisplay(); // Refresh content based on gameState

        // Create NEW Scrollable Equipment List
        const listWidth = width * 0.4; const listHeight = height * 0.6;
        const listX = width * 0.3; const listY = height * 0.55;
        this.equipmentListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });

        const inventory = gameState.player.inventory.items || [];
        // Filter for items that can go in the 'body' or 'accessory' slots
        const equipmentItems = inventory.filter(itemInstance => {
             const itemData = getItemData(itemInstance.itemId);
             return itemData && itemData.equipSlot && ['body', 'accessory', 'weapon'].includes(itemData.equipSlot); 
        });

        console.log("Equipment Tab - Filtered items:", JSON.parse(JSON.stringify(equipmentItems))); // Add log to verify filter

        if (equipmentItems.length === 0) {
            this.equipmentListContainer.addText('No equippable items found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0;
            const itemHeight = 40;

            equipmentItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId);
                if (!itemData) return;
                const itemRow = this.add.container(0, currentY); // Position container at currentY


                const itemBg = this.add.rectangle(0, 0, listWidth - 20, itemHeight, 0x2a2a3e, 0).setOrigin(0, 0); 
                const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                let statsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join(', ') : '';
                const statsText = this.add.text(listWidth - 30, itemHeight / 2, statsString, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#aaffaa', align: 'right' }).setOrigin(1, 0.5);

                itemRow.add([itemBg, nameText, statsText]);
                try {
                    // Define the hit area using the row's calculated size
                    itemRow.setSize(listWidth - 20, itemHeight); // Important: Set container size!
                    itemRow.setInteractive({ useHandCursor: true }); // Use default shape (its size)
                     console.log(`[Row Interactive] Set interactive for item ID: ${itemInstance.itemId}`);

                    // Clear potential old listeners
                    itemRow.off('pointerover');
                    itemRow.off('pointerout');
                    itemRow.off('pointerdown');

                    // Attach listeners to itemRow
                    itemRow.on('pointerover', () => {
                        if (itemRow.active) itemBg.setFillStyle(0x3a3a4e, 0.7); // Still control bg visual
                    });
                    itemRow.on('pointerout', () => {
                        if (itemRow.active) itemBg.setFillStyle(0x2a2a3e, 0); // Revert bg visual
                    });
                    itemRow.on('pointerdown', (pointer) => {
                        console.log(`[Row Pointer Down] Item ID: ${itemInstance.itemId}`);
                        pointer.event?.stopPropagation();
                        if (itemRow.active) {
                            this.safePlaySound('button-click', { volume: 0.3 });
                            this.equipItem(itemInstance.itemId);
                        }
                    });
                     console.log(`[Row Interactive] Listeners attached for item ID: ${itemInstance.itemId}`);
                } catch (e) {
                    console.warn(`Error setting interactivity on itemRow for ${itemInstance.itemId}:`, e);
                }
                this.equipmentListContainer.addItem(itemRow); // Let ScrollableContainer manage Y
                // --- ATTACH LISTENERS IMMEDIATELY TO itemBg ---
             try {
                // Define the hit area based on the background's dimensions
                const hitAreaRect = new Phaser.Geom.Rectangle(-itemBg.width / 2, -itemBg.height / 2, itemBg.width, itemBg.height);
                
                // Set itemBg interactive within its container (itemRow)
                itemBg.setInteractive(hitAreaRect, Phaser.Geom.Rectangle.Contains).setScrollFactor(0); // Prevent scroll factor issues
                itemBg.input.cursor = 'pointer'; // Set cursor explicitly

                console.log(`[Immediate Attach] Set interactive for item ID: ${itemInstance.itemId}`); // Log

                // Clear previous listeners if any (important if refreshing)
                itemBg.off('pointerover');
                itemBg.off('pointerout');
                itemBg.off('pointerdown');

                // Attach new listeners
                itemBg.on('pointerover', () => {
                    // console.log(`[Hover Over] Item ID: ${itemInstance.itemId}`); // Optional log
                    if (itemBg.active) itemBg.setFillStyle(0x3a3a4e, 0.7); // Use fill color for hover
                });
                itemBg.on('pointerout', () => {
                    // console.log(`[Hover Out] Item ID: ${itemInstance.itemId}`); // Optional log
                    if (itemBg.active) itemBg.setFillStyle(0x2a2a3e, 0); // Revert to transparent/original fill
                });
                itemBg.on('pointerdown', (pointer) => {
                    console.log(`[Pointer Down] Item ID: ${itemInstance.itemId}`); // Log click
                    pointer.event?.stopPropagation(); // Stop propagation to scroll container
                    if (itemBg.active) {
                        this.safePlaySound('button-click', { volume: 0.3 });
                        this.equipItem(itemInstance.itemId);
                    }
                });
                console.log(`[Immediate Attach] Listeners attached for item ID: ${itemInstance.itemId}`); // Log success
            } catch (e) {
                console.warn(`Error setting interactivity/listeners for equip item ${itemInstance.itemId}:`, e);
            }
                currentY += itemHeight + 5;
            });


        }

        this.equipmentListContainer.updateMaxScroll();
        this.equipmentListContainer.setVisible(true);
    }

    createEquipmentSlotsDisplay(container) {
        // --- Background Panel for the whole section ---
        const panelWidth = 240; // Adjust as needed
        const panelHeight = 250; // Adjusted height for two slots
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.6)
            .setStrokeStyle(1, 0x333333);
        container.add(panel);

        // --- Define ONLY the Armour (Body) and Accessory Slots ---
        const slotData = [
             { key: 'body', name: 'Armour', x: 0, y: -60, placeholderTexture: 'slot-body' }, // Use 'slot-body' texture key (head image)
             { key: 'accessory', name: 'Accessory', x: 0, y: 60, placeholderTexture: 'slot-accessory' }
        ];

        this.equipmentSlots = {}; // Reset object

        slotData.forEach(slot => {
            const slotContainer = this.add.container(slot.x, slot.y); // Position relative to the main container

            // --- Slot Background/Border ---
            const slotBorder = this.add.rectangle(0, 0, 64, 64, 0x222222, 0.8)
                .setStrokeStyle(1, 0x555555); // Default border

            // --- Slot Icon Display (starts as placeholder) ---
            const placeholderIconKey = slot.placeholderTexture; // Use defined placeholder texture key
            const iconDisplay = this.add.image(0, 0, placeholderIconKey);
            iconDisplay.setScale(0.8); // Adjust scale as needed
             // Ensure placeholder exists, otherwise hide it
             if (!this.textures.exists(placeholderIconKey)) {
                 console.warn(`Placeholder texture '${placeholderIconKey}' not found for slot '${slot.key}'. Hiding icon.`);
                 iconDisplay.setVisible(false);
             }

            // --- Slot Label ---
            const label = this.add.text(0, 40, slot.name, { // Position below the icon
                fontSize: '14px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

            // --- Add elements to the slot's container ---
            slotContainer.add([slotBorder, iconDisplay, label]);
            container.add(slotContainer); // Add the slot's container to the main equipment container

            // --- ADD STATS DISPLAY ---
            const statsY = 150; // Position below the slots
            const statsText = this.add.text(0, statsY, '', { // Start empty
                 fontSize: '12px', fill: '#aaffaa', align: 'center', lineSpacing: 4
            }).setOrigin(0.5);
            container.add(statsText);
            this.equipmentStatsText = statsText; // Store reference
            this.updateEquipmentSlotsDisplay(); // Call initially to populate slots AND stats

            // --- Store references ---
            this.equipmentSlots[slot.key] = {
                container: slotContainer,
                iconDisplay: iconDisplay, // Reference to the Image object that shows the icon/placeholder
                border: slotBorder,
                label: label,
                placeholderTexture: placeholderIconKey // Store the placeholder key for resetting
            };
            slotBorder.setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    console.log(`Clicked slot: ${slot.key}`);
                    this.unequipItem(slot.key); // Call a new unequip function
                });
        });
    }
    unequipItem(slotKey) {
        console.log(`Attempting to unequip from slot: ${slotKey}`);
        const equipped = gameState.player.inventory?.equipped || {};
        let itemIdToUnequip = null;

        // Determine which actual state slot corresponds to the visual slot clicked
        if (slotKey === 'body' && equipped.body) {
            itemIdToUnequip = equipped.body;
            equipped.body = null; // Clear the state slot
        } else if (slotKey === 'accessory') { // Visual 'accessory' slot clicked
            if (equipped.weapon) {          // Check if weapon is equipped first
                itemIdToUnequip = equipped.weapon;
                equipped.weapon = null;      // Clear weapon state
            } else if (equipped.accessory) { // Otherwise check accessory state
                itemIdToUnequip = equipped.accessory;
                equipped.accessory = null;   // Clear accessory state
            }
        }

        if (itemIdToUnequip) {
             const itemData = getItemData(itemIdToUnequip);
             console.log(`Unequipping ${itemData?.inGameName || itemIdToUnequip}`);

             // Add the item back to the main inventory list
             if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
             gameState.player.inventory.items.push({ itemId: itemIdToUnequip, quantity: 1 });

             this.safePlaySound('button-click', { volume: 0.2 }); // Play a sound

             // Recalculate stats
             CharacterManager.recalculatePlayerStats();

             // Refresh UI
             this.updateEquipmentSlotsDisplay(); // Update the slots visuals
              if (this.currentTab === 'Equipment' && this.equipmentListContainer) { // Refresh list only if on equipment tab
                  this.equipmentListContainer.destroy();
                  this.equipmentListContainer = null;
                  this.displayEquipmentTab();
              }
        } else {
            console.log(`Nothing to unequip in slot: ${slotKey}`);
        }
    }
    updateEquipmentSlotsDisplay() {
        console.log("Updating Equipment Slots Display...");
    const equipped = gameState.player.inventory?.equipped || {};

    // --- Handle 'body' slot (Armour) - No change ---
    const bodySlotKey = 'body';
    const bodyElements = this.equipmentSlots[bodySlotKey];
    if (bodyElements) {
        const bodyItemId = equipped[bodySlotKey];
        if (bodyItemId) {
            const itemData = getItemData(bodyItemId);
            if (itemData && itemData.equipSlot === bodySlotKey) {
                // Display equipped body item (icon, name, border)
                const itemIconKey = itemData.iconKey;
                if (itemIconKey && this.textures.exists(itemIconKey)) {
                    bodyElements.iconDisplay.setTexture(itemIconKey).setVisible(true).setScale(0.8);
                } else { /* Handle missing icon */ bodyElements.iconDisplay.setTexture(bodyElements.placeholderTexture).setVisible(true).setScale(0.8);}
                bodyElements.label.setText(itemData.inGameName);
                bodyElements.border.setStrokeStyle(2, 0xaaaaff);
            } else { /* Reset body slot if invalid item */ bodyElements.iconDisplay.setTexture(bodyElements.placeholderTexture).setVisible(true).setScale(0.8); bodyElements.label.setText(bodyElements.name); bodyElements.border.setStrokeStyle(1, 0x555555);}
        } else { // Reset body slot if empty
            bodyElements.iconDisplay.setTexture(bodyElements.placeholderTexture).setVisible(true).setScale(0.8);
            bodyElements.label.setText(bodyElements.name);
            bodyElements.border.setStrokeStyle(1, 0x555555);
        }
    }

    // --- Handle 'accessory' slot (Accessory OR Weapon) ---
    const accessorySlotKey = 'accessory';
    const accessoryElements = this.equipmentSlots[accessorySlotKey];
    if (accessoryElements) {
        const weaponItemId = equipped['weapon']; // Check weapon slot first
        const accessoryItemId = equipped['accessory'];
        let itemToShowId = null;
        let itemToShowData = null;

        // Prioritize showing weapon if equipped
        if (weaponItemId) {
            itemToShowId = weaponItemId;
            itemToShowData = getItemData(weaponItemId);
            console.log(`Accessory Slot Display: Showing WEAPON ${itemToShowData?.inGameName}`);
        } else if (accessoryItemId) { // Otherwise, show accessory if equipped
            itemToShowId = accessoryItemId;
            itemToShowData = getItemData(accessoryItemId);
            console.log(`Accessory Slot Display: Showing ACCESSORY ${itemToShowData?.inGameName}`);
        }

        if (itemToShowData) {
            // Display the determined item (weapon or accessory)
            const itemIconKey = itemToShowData.iconKey;
            if (itemIconKey && this.textures.exists(itemIconKey)) {
                accessoryElements.iconDisplay.setTexture(itemIconKey).setVisible(true).setScale(0.8);
            } else { /* Handle missing icon */ accessoryElements.iconDisplay.setTexture(accessoryElements.placeholderTexture).setVisible(true).setScale(0.8);}
            accessoryElements.label.setText(itemToShowData.inGameName);
            accessoryElements.border.setStrokeStyle(2, 0xaaaaff); // Highlight border
        } else { // Neither weapon nor accessory is equipped
             console.log(`Accessory Slot Display: Empty`);
            // Reset accessory slot to placeholder
            accessoryElements.iconDisplay.setTexture(accessoryElements.placeholderTexture).setVisible(true).setScale(0.8);
            accessoryElements.label.setText(accessoryElements.name); // Use default name ('Accessory/Weapon')
            accessoryElements.border.setStrokeStyle(1, 0x555555); // Default border
        }
         // --- UPDATE STATS TEXT ---
         if (this.equipmentStatsText) {
            const player = gameState.player;
            // Access the calculated stats (assuming CharacterManager.recalculatePlayerStats updated them)
            const attack = player.currentAttack || 0;
            const magicAttack = player.currentMagicAttack || 0;
            const defense = player.currentDefense || 0;
            // Add other relevant stats (crit, dodge, etc.) if calculated

            this.equipmentStatsText.setText(
                 `Attack: ${attack}\n` +
                 `Magic Atk: ${magicAttack}\n` +
                 `Defense: ${defense}`
                 // Add more stats here
            );
        }
    }
}

equipItem(itemId) {
    // 1. Validate Player and Inventory State (keep as is)
    if (!gameState.player?.inventory) { /* ... error ... */ return; }

    // 2. Get Item Data (keep as is)
    const itemData = getItemData(itemId);

    // 3. Validate Item Data and Intended Slot (keep as is)
    if (!itemData || !itemData.equipSlot) { /* ... error ... */ return; }
    const intendedSlot = itemData.equipSlot; // This is 'body', 'weapon', or 'accessory'

    // 4. Check if the intended slot is one we handle ('body', 'weapon', 'accessory')
    if (!['body', 'weapon', 'accessory'].includes(intendedSlot)) {
        console.error(`Cannot equip item ${itemId}: Unsupported equipSlot '${intendedSlot}'.`);
        return;
    }

    // 5. Ensure 'equipped' object exists (keep as is)
    if (!gameState.player.inventory.equipped) { gameState.player.inventory.equipped = {}; }
    const equipped = gameState.player.inventory.equipped; // Alias for convenience

    // 6. --- UNEQUIP PHASE: Determine what to unequip and return ---
    let itemToReturnToInventoryId = null; // ID of the item currently in the target slot(s)

    if (intendedSlot === 'body') {
        // Simple case: only check the 'body' slot
        if (equipped.body) {
            itemToReturnToInventoryId = equipped.body;
            equipped.body = null; // Clear the state slot
            console.log(`Unequipping previous body item: ${itemToReturnToInventoryId}`);
        }
    } else { // Intended slot is 'weapon' OR 'accessory' - clear BOTH state slots
        if (equipped.weapon) {
            itemToReturnToInventoryId = equipped.weapon;
            equipped.weapon = null; // Clear the weapon state slot
            console.log(`Unequipping previous weapon: ${itemToReturnToInventoryId}`);
        } else if (equipped.accessory) { // Check accessory only if weapon wasn't equipped
            itemToReturnToInventoryId = equipped.accessory;
            equipped.accessory = null; // Clear the accessory state slot
            console.log(`Unequipping previous accessory: ${itemToReturnToInventoryId}`);
        }
        // Both equipped.weapon and equipped.accessory are now null
    }

    // 7. --- Remove the NEW item from the inventory list --- (keep as is)
    const itemIndexInInventory = gameState.player.inventory.items.findIndex(invItem => String(invItem.itemId) === String(itemId)); // Use String comparison
    if (itemIndexInInventory === -1) {
         console.error(`Item ${itemId} to be equipped not found in inventory list! Cannot proceed.`);
         // IMPORTANT: If we already unequipped something, we should ideally put it back here!
         // This logic can get complex, for now, we'll just error out.
         // A cleaner way might be to check if the item is in the list *before* unequipping.
         return;
    } else {
        gameState.player.inventory.items.splice(itemIndexInInventory, 1);
        console.log(`Removed ${itemId} from inventory list.`);
    }

    // 8. --- Equip the NEW item into its INTENDED state slot ---
    equipped[intendedSlot] = itemId; // Put 'weapon' in equipped.weapon, 'accessory' in equipped.accessory
    console.log(`Equipped ${itemData.inGameName} to STATE slot: ${intendedSlot}`);

    // 9. --- Add the PREVIOUSLY equipped item back to the inventory list ---
    if (itemToReturnToInventoryId) {
        const prevItemData = getItemData(itemToReturnToInventoryId);
        gameState.player.inventory.items.push({ itemId: itemToReturnToInventoryId, quantity: 1 });
        console.log(`Added ${prevItemData?.inGameName || 'previous item'} (ID: ${itemToReturnToInventoryId}) back to inventory list.`);
    }

    // 10. Recalculate Stats (keep as is)
    CharacterManager.recalculatePlayerStats();

    // 11. Update UI (Slots & List)
    this.updateEquipmentSlotsDisplay(); // Update the visual slots
    if (this.equipmentListContainer) { // Refresh the equipment list
        this.equipmentListContainer.destroy();
        this.equipmentListContainer = null;
        this.displayEquipmentTab();
    }

    // 12. Play Animation
    // Determine the VISUAL slot key based on the intended slot
    const targetDisplaySlotKey = (intendedSlot === 'body') ? 'body' : 'accessory';
    const slotElements = this.equipmentSlots[targetDisplaySlotKey];
    if (slotElements?.iconDisplay?.active) {
        this.playEquipAnimation(slotElements.iconDisplay);
    } else {
        console.warn(`Could not find valid icon display to animate for visual slot: ${targetDisplaySlotKey}`);
    }

    // 13. Optional other UI updates (keep as is)
    // ...
}

    // playEquipAnimation method - Targets the iconDisplay Image object
    playEquipAnimation(targetIcon) {
        // Add more robust checks
        if (!targetIcon || typeof targetIcon.setScale !== 'function' || !targetIcon.scene || targetIcon.scene !== this || !targetIcon.active) {
            console.warn("playEquipAnimation: Invalid targetIcon provided or scene context lost.", targetIcon);
            return;
        }

        // Use current scale as the final target scale
        const finalScaleX = targetIcon.scaleX || 1; // Default to 1 if scale is 0
        const finalScaleY = targetIcon.scaleY || 1;

        // Start slightly larger and faded
        targetIcon.setScale(finalScaleX * 1.5, finalScaleY * 1.5);
        targetIcon.setAlpha(0.5);

        // Tween back to normal scale and full alpha
        this.tweens.add({
            targets: targetIcon,
            scaleX: finalScaleX,
            scaleY: finalScaleY,
            alpha: 1,
            duration: 300, // Faster animation
            ease: 'Back.easeOut', // Gives a nice little bounce effect
        });
    }

    displayMaterialsTab() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const listWidth = width * 0.8; const listHeight = height * 0.55;
        const listX = width * 0.5; const listY = height * 0.5;

        this.materialsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 15, backgroundColor: 0x2e1a2e, borderColor: 0xbf7fbf });

        const messageY = listY + listHeight / 2 + 30; // Position below the list
        this.materialsInfoMessage = this.add.text(listX, messageY,
            "Crafting materials can be used at the Crafting Workshop to create equipment.",
            { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#cccccc', align: 'center', fontStyle: 'italic', wordWrap: { width: listWidth - 40 } }
        ).setOrigin(0.5);

        const inventory = gameState.player.inventory.items || [];
        console.log("Materials Tab - Initial inventory:", JSON.parse(JSON.stringify(inventory)));

        const materialItems = inventory.filter(itemInstance => {
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.type === 'material'; // Filter strictly by type: 'material'
        });

        console.log("Materials Tab - Filtered items:", JSON.parse(JSON.stringify(materialItems)));

        if (materialItems.length === 0) {
            this.materialsListContainer.addText('No materials found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0; const itemHeight = 30; const iconSize = 24;
            materialItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId); if (!itemData) return;
                const itemRow = this.add.container(0, 0);
                let icon = null;
                if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                     icon = this.add.image(10 + iconSize/2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
                    itemRow.add(icon);
                 } else {
                      console.warn(`Icon texture '${itemData.iconKey}' not found for material ${itemData.itemId}`);
                 }
                const text = `${itemData.inGameName} x${itemInstance.quantity}`;
                const textObject = this.add.text(10 + iconSize + 10, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add(textObject);
                this.materialsListContainer.addItem(itemRow, currentY);
                currentY += itemHeight + 5; // Add spacing
            });
        }
        this.materialsListContainer.updateMaxScroll();
        this.materialsListContainer.setVisible(true);
    }


    displayPotionsTab() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const barWidth = 250; const barX = width * 0.5;
        const hpBarY = height * 0.3; const mpBarY = hpBarY + 40; // Increased spacing

        // Create NEW status bars
        this.potionsHpBar = this.ui.createStatusBar(barX, hpBarY, gameState.player.health, gameState.player.maxHealth, { width: barWidth, textPrefix: 'HP', barColor: 0x00ff00 });
        this.potionsMpBar = this.ui.createStatusBar(barX, mpBarY, gameState.player.mana, gameState.player.maxMana, { width: barWidth, textPrefix: 'MP', barColor: 0x0000ff });

        const listWidth = width * 0.7; const listHeight = height * 0.35;
        const listX = width * 0.5; const listY = height * 0.65;
        this.potionsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a2e1a, borderColor: 0x7fbf7f });

        const inventory = gameState.player.inventory.items || [];
        const potionItems = inventory.filter(itemInstance => {
            const itemData = getItemData(itemInstance.itemId);
            // Filter specifically for items with a potionEffect defined
            return itemData && itemData.potionEffect;
         });

        if (potionItems.length === 0) {
            this.potionsListContainer.addText('No potions or consumables.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0; const itemHeight = 45; const iconSize = 30;
            const backgroundsToListen = [];

            potionItems.forEach((itemInstance) => {
                const itemData = getItemData(itemInstance.itemId); if (!itemData?.potionEffect) return; // Should not happen due to filter, but safe check
                const itemRow = this.add.container(0, 0);
                const itemBg = this.add.rectangle(listWidth / 2, itemHeight / 2, listWidth - 20, itemHeight, 0x2a3e2a, 0).setOrigin(0.5);
                let icon = null;
                if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                     icon = this.add.image(20 + iconSize/2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
                    itemRow.add(icon);
                 } else {
                      console.warn(`Icon texture '${itemData.iconKey}' not found for potion ${itemData.itemId}`);
                 }
                const effectStat = itemData.potionEffect.stat || '???'; const effectValue = itemData.potionEffect.value || 0;
                const effectText = `Restores ${effectValue} ${effectStat.toUpperCase()}`; const fullText = `${itemData.inGameName} (x${itemInstance.quantity}) - ${effectText}`;
                const itemText = this.add.text(20 + iconSize + 15, itemHeight / 2, fullText, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add([itemBg, itemText]);
                this.potionsListContainer.addItem(itemRow, currentY);
                backgroundsToListen.push({ bg: itemBg, itemId: itemInstance.itemId });
                currentY += itemHeight + 5;
            });

             this.time.delayedCall(10, () => {
                 if (!this || !this.scene?.key || this.scene.key !== 'InventoryScene') return;
                 backgroundsToListen.forEach(item => {
                      // Double check if bg is still valid and part of the scene
                     if (item.bg && item.bg.scene === this && item.bg.active) {
                          try {
                             item.bg.setInteractive({ useHandCursor: true });
                             item.bg.on('pointerover', () => { if (item.bg?.active) item.bg.setFillStyle(0x3a4e3a, 0.7); });
                             item.bg.on('pointerout', () => { if (item.bg?.active) item.bg.setFillStyle(0x2a3e2a, 0); });
                             item.bg.on('pointerdown', () => { if (item.bg?.active) this.consumePotion(item.itemId); });
                         } catch (e) {
                              console.warn(`Error setting interactivity for potion item ${item.itemId}:`, e);
                         }
                     } else {
                          console.warn("Skipping listener attachment for destroyed or invalid potion background.");
                     }
                 });
             }, [], this);
        }
        this.potionsListContainer.updateMaxScroll();
        this.potionsListContainer.setVisible(true);
    }


    consumePotion(itemId) {
        if (!gameState.player?.inventory?.items) return;
        const itemData = getItemData(itemId); if (!itemData?.potionEffect) return;
        const { stat, value } = itemData.potionEffect;
        let success = false; let message = "";

        if (stat === 'health') {
            if (gameState.player.health >= gameState.player.maxHealth) message = "Health is already full!";
            else { HealthManager.updatePlayerHealth(value, true); success = true; message = `Used ${itemData.inGameName}. Restored ${value} HP.`; }
        } else if (stat === 'mana') {
            if (gameState.player.mana >= gameState.player.maxMana) message = "Mana is already full!";
            else { HealthManager.updatePlayerMana(value, true); success = true; message = `Used ${itemData.inGameName}. Restored ${value} MP.`; }
        } else message = `Unknown potion effect: ${stat}`;

        // --- Create Feedback Text ---
        // Ensure UI Manager and createText are available
        if (this.ui && typeof this.ui.createText === 'function') {
             const feedbackText = this.ui.createText(this.cameras.main.width / 2, this.cameras.main.height * 0.8, message, { fontSize: this.ui.fontSize.sm, color: success ? '#aaffaa' : '#ffaaaa'});
             // Add a simple fade-out tween
             this.tweens.add({ targets: feedbackText, alpha: 0, duration: 1500, ease: 'Power1', onComplete: () => feedbackText.destroy()});
        } else {
             console.log(message); // Fallback logging
        }


        if (success) {
            this.safePlaySound('heal', {volume: 0.4});
            const itemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === itemId);
            if (itemIndex > -1) {
                gameState.player.inventory.items[itemIndex].quantity -= 1;
                if (gameState.player.inventory.items[itemIndex].quantity <= 0) gameState.player.inventory.items.splice(itemIndex, 1);
            }

             // --- Refresh UI Elements ---
             // Ensure bars exist before updating
             if(this.potionsHpBar && typeof this.potionsHpBar.update === 'function') this.potionsHpBar.update(gameState.player.health, gameState.player.maxHealth);
             if(this.potionsMpBar && typeof this.potionsMpBar.update === 'function') this.potionsMpBar.update(gameState.player.mana, gameState.player.maxMana);

             // Ensure list exists before destroying and recreating
             if (this.potionsListContainer) {
                this.potionsListContainer.destroy(); // Destroy the old list
                this.potionsListContainer = null;
                this.displayPotionsTab(); // Recreate the list to show updated quantities/removed items
             }
        }
    }


    createReturnButton() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        this.ui.createButton( width / 2, height * 0.92, 'Return',
            () => {
                 console.log(`InventoryScene: Returning to ${this.returnSceneKey}`);
                 this.safePlaySound('menu-close');
                 // Use navigationManager safely
                 if (navigationManager && typeof navigationManager.navigateTo === 'function') {
                      navigationManager.navigateTo(this, this.returnSceneKey);
                 } else {
                      console.warn("NavigationManager not available, attempting direct scene start.");
                      this.scene.start(this.returnSceneKey);
                 }
            },
            { width: 180, height: 50 }
        );
    }

    shutdown() {
        console.log("InventoryScene shutdown starting...");
        // Destroy DYNAMIC content containers safely
        if (this.equipmentListContainer && typeof this.equipmentListContainer.destroy === 'function') this.equipmentListContainer.destroy();
        if (this.materialsListContainer && typeof this.materialsListContainer.destroy === 'function') this.materialsListContainer.destroy();
        if (this.potionsListContainer && typeof this.potionsListContainer.destroy === 'function') this.potionsListContainer.destroy();
        if (this.potionsHpBar && typeof this.potionsHpBar.destroy === 'function') this.potionsHpBar.destroy();
        if (this.potionsMpBar && typeof this.potionsMpBar.destroy === 'function') this.potionsMpBar.destroy();
        if (this.materialsInfoMessage && typeof this.materialsInfoMessage.destroy === 'function') this.materialsInfoMessage.destroy();

        // Destroy STATIC container (created in create) safely
        if (this.equipmentSlotsContainer && typeof this.equipmentSlotsContainer.destroy === 'function') this.equipmentSlotsContainer.destroy(true); // true to destroy children

        // Destroy tab buttons safely
        for (const name in this.tabButtons) {
           if (this.tabButtons[name] && typeof this.tabButtons[name].destroy === 'function') {
               try {
                    this.tabButtons[name].destroy();
               } catch (e) {
                    console.warn(`Error destroying tab button ${name}:`, e);
               }
           }
        }
        this.tabButtons = {}; // Clear references

        // Nullify references to dynamic content
        this.equipmentListContainer = null;
        this.materialsListContainer = null;
        this.potionsListContainer = null;
        this.potionsHpBar = null;
        this.potionsMpBar = null;
        this.materialsInfoMessage = null;
        this.equipmentSlotsContainer = null; // Also nullify static container reference
        this.equipmentSlots = {}; // Clear slot element references

        console.log("InventoryScene shutdown cleanup complete.");
        // If BaseScene has a shutdown, call it: super.shutdown();
    }
}

export default InventoryScene;