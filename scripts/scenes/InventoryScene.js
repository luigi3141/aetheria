// ---- File: InventoryScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import Panel from '../ui/components/Panel.js';
import StatusBar from '../ui/components/StatusBar.js';
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../utils/gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import items from '../data/items.js';
const { getItemData } = items;
import HealthManager from '../utils/HealthManager.js';
import BaseScene from './BaseScene.js';
import CharacterManager from '../utils/CharacterManager.js';
import { loadGame } from '../utils/SaveLoadManager.js'; // Added import

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

        // Add references for the new static potion UI
        this.potionDisplayGroup = null; // Container/Group for potion elements
        this.hpPotionInfo = { text: null, button: null, data: null };
        this.manaPotionInfo = { text: null, button: null, data: null };
        this.isConsuming = false; // Flag to prevent double clicks

        // Static content container (created once)
        this.equipmentSlotsContainer = null; // The main container holding all slot visuals
        this.isSwitchingTabs = false; // Flag to prevent issues with rapid tab switching

        // --- Store references for key UI elements to ensure proper cleanup ---
        this.sceneTitle = null;
        this.returnButtonInstance = null;
        this.equipmentStatsText = null; // Reference for total stats text
    }

    init(data) {
        this.returnSceneKey = data?.returnSceneKey || gameState.previousScene || 'OverworldScene';
        console.log(`InventoryScene init - Will return/wake to ${this.returnSceneKey}`);
        console.log("[Inv Init] gameState inventory BEFORE load:", JSON.parse(JSON.stringify(gameState.player?.inventory?.items || 'No Inventory')));

        // Load saved state using SaveLoadManager
        loadGame();

        // Ensure player and inventory exist even if no save data
        if (!gameState.player) gameState.player = { name: 'Hero', class: 'Warrior', level: 1 /* ... other defaults ... */ };
        if (!gameState.player.inventory) gameState.player.inventory = { items: [], equipped: {}, maxItems: 50 };

        // Log inventory state on scene init
        console.log('InventoryScene init - Final Inventory state:', {
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
        if (!this.textures.exists('slot-body')) {
            this.load.image('slot-body', ASSET_PATHS.ITEMS.SLOT_HEAD);
        }
        if (!this.textures.exists('slot-accessory')) {
            this.load.image('slot-accessory', ASSET_PATHS.ITEMS.SLOT_ACCESSORY);
        }
        // --- End Placeholder Loading ---


        // --- Load Item Icons ---
        const preloadIcon = (iconKey) => {
            if (iconKey && typeof iconKey === 'string' && !this.textures.exists(iconKey)) {
                 let path = null;
                 if (ASSET_PATHS.MATERIALS[iconKey]) path = ASSET_PATHS.MATERIALS[iconKey];
                 else if (ASSET_PATHS.ITEMS[iconKey]) path = ASSET_PATHS.ITEMS[iconKey];
                 else if (ASSET_PATHS.EQUIPMENT[iconKey]) path = ASSET_PATHS.EQUIPMENT[iconKey];
                 if (path) {
                     this.load.image(iconKey, path);
                 } else {
                      // console.warn(`Preload: Icon path not found in ASSET_PATHS for key: ${iconKey}`);
                 }
            }
        };

        if (items && items.categoryIconKeys) {
            Object.values(items.categoryIconKeys).forEach(value => {
                 if (typeof value === 'string') preloadIcon(value);
                 else if (typeof value === 'object') {
                     Object.values(value).forEach(subValue => {
                         if (typeof subValue === 'string') preloadIcon(subValue);
                         else if (typeof subValue === 'object') {
                              Object.values(subValue).forEach(nestedValue => preloadIcon(nestedValue));
                         }
                     });
                 }
            });
        }
        if (items && items.itemDatabase) {
             Object.values(items.itemDatabase).forEach(item => preloadIcon(item.iconKey));
        }
        // --- End Item Icon Loading ---


        console.log('InventoryScene Preload End');
    }

    // ---- **** CORRECTED create() **** ----
    create() {
        console.log("InventoryScene Create Start");
        this.initializeScene(); // Sets up this.ui

        // Get dimensions first
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        console.log(`InventoryScene Create - Initial camera dimensions: W=${width}, H=${height}`);

        // Log inventory state
        console.log('InventoryScene create - Inventory state:', {
            itemCount: gameState.player.inventory?.items?.length || 0,
            items: JSON.parse(JSON.stringify(gameState.player.inventory?.items || [])),
            equipped: gameState.player.inventory?.equipped || {}
        });

        // 1. Add Background FIRST
        this.add.image(width / 2, height / 2, 'inventory-bg').setDisplaySize(width, height);

        // 2. Create Title (Store reference for shutdown)
        this.sceneTitle = this.ui.createTitle(width / 2, height * 0.08, 'Inventory', { fontSize: this.ui.fontSize.lg });
         if (this.sceneTitle?.background) this.sceneTitle.background.setDepth(1); // Ensure bg behind text
         if (this.sceneTitle) this.sceneTitle.setDepth(2); // Ensure text on top

        // 3. Create Tabs (These create buttons which add themselves)
        this.createTabs(); // Buttons stored in this.tabButtons

        // 4. Create Return Button NOW and store the instance
        console.log("InventoryScene Create - Calling createReturnButton...");
        this.returnButtonInstance = this.createReturnButton(); // This now calls the function below

        // 5. Validate and Set Depth for the Return Button
        if (this.returnButtonInstance && this.returnButtonInstance.container) {
            console.log(`Return button created. Initial container position: x=${this.returnButtonInstance.container.x.toFixed(0)}, y=${this.returnButtonInstance.container.y.toFixed(0)}`);
            this.returnButtonInstance.container.setDepth(100); // High depth
            console.log(`Return button depth set to 100.`);
        } else {
            console.error("FAILED to get returnButtonInstance or its container after creation!");
        }

        // --- Create Static Equipment Slots Container ---
        this.equipmentSlotsContainer = this.add.container(width * 0.75, height * 0.5); // Depth defaults usually ok here
        this.createEquipmentSlotsDisplay(this.equipmentSlotsContainer);
        this.updateEquipmentSlotsDisplay(); // Populate slots based on current state
        this.updateTotalStatsDisplay();    // Populate total stats based on current state
        // Initially hide it if the default tab is not Equipment
        if(this.equipmentSlotsContainer) this.equipmentSlotsContainer.setVisible(this.currentTab === 'Equipment');

        // Display the initial tab
        this.setActiveTab(this.currentTab);
        console.log("InventoryScene Create End");


        // --- Fade In ---
        if (this.transitions) {
            this.time.delayedCall(50, () => {
                if (this && this.scene && this.sys.isActive()) {
                     this.transitions.fadeIn();
                } else {
                    console.warn(`Scene ${this.scene?.key || 'Unknown'} became inactive before delayed fadeIn.`);
                }
            });
        } else {
            console.warn(`TransitionManager not found in ${this.scene.key}, skipping fade-in.`);
             if(this.input) this.input.enabled = true;
        }
        // --- END MODIFICATION ---

        console.log(`${this.scene.key} Create End`);
    }
    createReturnButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonX = width / 2;
        const buttonY = height * 0.92;

        // --- >>> LOGS <<< ---
        console.log(`[createReturnButton] Camera dimensions: width=${width}, height=${height}`);
        console.log(`[createReturnButton] Calculated button position: x=${buttonX.toFixed(0)}, y=${buttonY.toFixed(0)}`);
        // --- >>> END LOGS <<< ---

        if (width === 0 || height === 0) {
             console.error("[createReturnButton] CRITICAL: Camera dimensions are zero! Button position will be incorrect.");
        }

        const button = this.ui.createButton( buttonX, buttonY, 'Return',
            () => {
                 // --- >>> CLICK LOG <<< ---
                 console.log('[InventoryScene] Return button CLICKED!');
                 // --- >>> END CLICK LOG <<< ---
                 this.safePlaySound('menu-close');
                 // const dataToReturn = { fromInventory: true }; // Data for wake/start, not switch

                 // --- >>> USE scene.switch() <<< ---
                 console.log(`[InventoryScene] Switching to scene: ${this.returnSceneKey}`);
                 try {
                     // scene.switch(key) stops the current scene and starts the target one.
                     // If the target scene was previously slept, start will resume it.
                     this.scene.switch(this.returnSceneKey);

                 } catch (e) {
                     console.error(`Error during scene switch to ${this.returnSceneKey}:`, e);
                      try {
                          console.log("Attempting fallback navigation to OverworldScene via start.");
                          this.scene.start('OverworldScene');
                      } catch (e2) {
                          console.error("Fallback navigation failed:", e2);
                      }
                 }
                 // --- >>> END scene.switch() <<< ---
            },
            { width: 180, height: 50 } // Options for the button
        );

        console.log("[createReturnButton] Button instance created:", button);
        if (!button || !button.container) {
            console.error("[createReturnButton] CRITICAL: UIManager failed to create button or its container!");
        } else {
            console.log(`[createReturnButton] Button container position after creation: x=${button.container.x.toFixed(0)}, y=${button.container.y.toFixed(0)}`);
        }

        return button; // <<< Return the instance
    }
    // --- Tab Management ---
    createTabs() {
        const width = this.cameras.main.width; // Correctly scoped width/height
        const height = this.cameras.main.height;
        const tabY = height * 0.18;
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
             if (tabButton && tabButton.container) tabButton.container.setDepth(50); // Ensure tabs above some elements
            this.tabButtons[tabName] = tabButton; // Store the Button instance
        });
    }

    setActiveTab(tabName) {
        if (!this.tabButtons[tabName] || this.isSwitchingTabs) return;

        this.isSwitchingTabs = true;
        this.currentTab = tabName;
        console.log(`Switching to tab: ${tabName}`);

        // Update button states
        for (const name in this.tabButtons) {
            if (this.tabButtons[name]) {
                 this.tabButtons[name].setActive(name === tabName);
            }
        }

        // Clean up DYNAMIC content
        if (this.equipmentListContainer) { this.equipmentListContainer.destroy(); this.equipmentListContainer = null; }
        if (this.materialsListContainer) { this.materialsListContainer.destroy(); this.materialsListContainer = null; }
        if (this.potionDisplayGroup) { this.potionDisplayGroup.destroy(true); this.potionDisplayGroup = null; }
        this.hpPotionInfo = { text: null, button: null, data: null };
        this.manaPotionInfo = { text: null, button: null, data: null };
        if (this.potionsHpBar) { this.potionsHpBar.destroy(); this.potionsHpBar = null; }
        if (this.potionsMpBar) { this.potionsMpBar.destroy(); this.potionsMpBar = null; }
        if (this.materialsInfoMessage) { this.materialsInfoMessage.destroy(); this.materialsInfoMessage = null; }

        // Manage STATIC equipment slots visibility
        this.equipmentSlotsContainer?.setVisible(tabName === 'Equipment');

        // Create/Show content for the NEW active tab
        switch (tabName) {
            case 'Equipment': this.displayEquipmentTab(); break;
            case 'Materials': this.displayMaterialsTab(); break;
            case 'Potions': this.displayPotionsTab(); break;
        }
        console.log(`setActiveTab: Finished displaying ${tabName}`);

        this.time.delayedCall(50, () => { this.isSwitchingTabs = false; });
    }

    // --- Content Display Functions ---
    displayEquipmentTab() {
        const width = this.cameras.main.width; // Correctly scoped
        const height = this.cameras.main.height;

        this.equipmentSlotsContainer?.setVisible(true);
        this.updateEquipmentSlotsDisplay(); // Refresh slot visuals
        this.updateTotalStatsDisplay();    // Refresh total stats

        const listWidth = width * 0.4;
        const listHeight = height * 0.6;
        const listX = width * 0.3;
        const listY = height * 0.55;

        // Ensure existing container is destroyed before creating new
        if (this.equipmentListContainer) {
             console.warn("[displayEquipmentTab] Destroying existing equipmentListContainer before recreating.");
             this.equipmentListContainer.destroy();
             this.equipmentListContainer = null;
        }

        this.equipmentListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });

         if (!this.equipmentListContainer || !this.equipmentListContainer.valid) {
             console.error("Failed to create equipmentListContainer in displayEquipmentTab.");
             return;
         }

        const inventory = gameState.player.inventory.items || [];
        const equipmentItems = inventory.filter(itemInstance => {
             if (!itemInstance || typeof itemInstance.itemId === 'undefined') return false; // Guard against invalid items
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.equipSlot && ['body', 'accessory', 'weapon'].includes(itemData.equipSlot);
        });

        if (equipmentItems.length === 0) {
            this.equipmentListContainer.addText('No equippable items found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            const itemHeight = 40;

            equipmentItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId);
                if (!itemData) return;

                const itemRow = this.add.container(0, 0);
                 // Background for interaction, initially transparent
                const itemBg = this.add.rectangle(0, 0, listWidth - 20, itemHeight, 0x2a2a3e, 0).setOrigin(0, 0);
                const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                let statsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join(', ') : '';
                const statsText = this.add.text(listWidth - 30, itemHeight / 2, statsString, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#aaffaa', align: 'right' }).setOrigin(1, 0.5);

                itemRow.add([itemBg, nameText, statsText]);
                itemRow.setSize(listWidth - 20, itemHeight);
                itemRow.setData('itemId', itemInstance.itemId);

                // Make the ROW interactive for hover/click detection within the container listener
                itemRow.setInteractive(new Phaser.Geom.Rectangle(0, 0, listWidth-20, itemHeight), Phaser.Geom.Rectangle.Contains)
                    .on('pointerover', () => { itemBg.setFillStyle(0x3a3a4e, 0.7); }) // Show hover on bg
                    .on('pointerout', () => { itemBg.setFillStyle(0x2a2a3e, 0); }); // Hide hover effect

                this.equipmentListContainer.addItem(itemRow);
            });

           // --- Attach listener to the SCROLLABLE CONTAINER's internal container ---
           if (this.equipmentListContainer && this.equipmentListContainer.container) {
                const internalContainer = this.equipmentListContainer.container;
                internalContainer.removeListener('pointerdown'); // Remove previous listener if exists

                // Set interactive area for the internal container
                internalContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, listWidth - 20, listHeight), Phaser.Geom.Rectangle.Contains); // Adjust width slightly if padding matters

                internalContainer.on('pointerdown', (pointer, gameObjects) => {
                     if (gameObjects.length > 0) {
                         // Find the first ancestor container with itemData (our itemRow)
                         let clickedRow = gameObjects[0];
                         let clickedItemId = clickedRow.getData('itemId');
                         let depth = 0;
                         const maxDepth = 5; // Limit traversal depth

                         // Traverse up if the direct hit wasn't the main row container
                         while (!clickedItemId && clickedRow.parentContainer && depth < maxDepth) {
                             clickedRow = clickedRow.parentContainer;
                             clickedItemId = clickedRow.getData('itemId');
                             depth++;
                         }

                         if (clickedItemId) {
                             console.log(`[Container Listener] Clicked item ID: ${clickedItemId} on row:`, clickedRow);
                             pointer.event?.stopPropagation(); // Prevent potential drag start on the container
                             this.safePlaySound('button-click', { volume: 0.3 });
                             this.equipItem(clickedItemId);
                         } else {
                             // console.log("[Container Listener] Clicked background or element without item ID.", gameObjects[0]);
                         }
                     }
                 });
                 console.log("Attached pointerdown listener to scrollable container's inner container.");
            } else {
                  console.error("Cannot attach equipment list listener: ScrollableContainer or its internal container is missing.");
            }
        }

        this.equipmentListContainer?.updateMaxScroll();
        this.equipmentListContainer?.setVisible(true);
    }

    createEquipmentSlotsDisplay(container) {
        // --- Background Panel ---
        const panelWidth = 240;
        const panelHeight = 350;
        try {
             const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.6)
                 .setStrokeStyle(1, 0x333333);
             container.add(panel);
        } catch (e) { console.error("Error creating equipment slots panel background:", e); return; }

        // --- Slots ---
        const slotData = [
             { key: 'body', name: 'Armour', x: 0, y: -80, placeholderTexture: 'slot-body' },
             { key: 'accessory', name: 'Accessory/Weapon', x: 0, y: 20, placeholderTexture: 'slot-accessory' }
        ];

        this.equipmentSlots = {}; // Reset references

        slotData.forEach(slot => {
             try {
                 const slotContainer = this.add.container(slot.x, slot.y);
                 const slotBorder = this.add.rectangle(0, 0, 64, 64, 0x222222, 0.8).setStrokeStyle(1, 0x555555);
                 const placeholderIconKey = slot.placeholderTexture;
                 const iconDisplay = this.add.image(0, 0, placeholderIconKey).setScale(0.8);
                 if (!this.textures.exists(placeholderIconKey)) iconDisplay.setVisible(false);

                 const label = this.add.text(0, 45, slot.name, { fontSize: '11px', fill: '#ffffff', align: 'center', wordWrap: { width: 70 }, lineSpacing: 4 }).setOrigin(0.5);

                 slotContainer.add([slotBorder, iconDisplay, label]);
                 container.add(slotContainer);

                 this.equipmentSlots[slot.key] = { container: slotContainer, iconDisplay, border: slotBorder, label, placeholderTexture: placeholderIconKey, name: slot.name };

                 slotBorder.setInteractive({ useHandCursor: true })
                     .on('pointerdown', () => this.unequipItem(slot.key));

             } catch (e) { console.error(`Error creating UI elements for slot ${slot.key}:`, e); }
        });

         // --- STATS DISPLAY ---
         const statsY = panelHeight / 2 - 40;

         // Destroy old text if it exists
         if (this.equipmentStatsText) {
             this.equipmentStatsText.destroy();
             this.equipmentStatsText = null;
         }

         // Create new text
         try {
             this.equipmentStatsText = this.add.text(0, statsY, '', { fontSize: '12px', fill: '#aaffaa', align: 'center', lineSpacing: 4 }).setOrigin(0.5);
             if (container) {
                  container.add(this.equipmentStatsText);
             } else {
                  console.error("Cannot add statsText: Main container is invalid.");
                  if(this.equipmentStatsText) this.equipmentStatsText.destroy();
                  this.equipmentStatsText = null;
             }
         } catch (e) {
             console.error("Error creating/adding new statsText:", e);
             this.equipmentStatsText = null;
         }

         this.updateTotalStatsDisplay(); // Initial update
    }

    updateEquipmentSlotsDisplay() {
        // --- This function remains unchanged ---
        console.log("Updating Equipment Slots Display...");
        const equipped = gameState.player.inventory?.equipped || {};

        Object.entries(this.equipmentSlots).forEach(([slotKey, elements]) => {
            if (!elements || !elements.iconDisplay || !elements.label || !elements.border || !elements.placeholderTexture || !elements.name) {
                // console.warn(`Missing UI elements for slot key: ${slotKey}.`); // Reduced logging verbosity
                return;
            }

            let itemIdToDisplay = null; let itemData = null;
            if (slotKey === 'body' && equipped.body) itemIdToDisplay = equipped.body;
            else if (slotKey === 'accessory') itemIdToDisplay = equipped.weapon || equipped.accessory;

            if (itemIdToDisplay) itemData = getItemData(itemIdToDisplay);

            if (itemData) { // Item equipped
                const itemIconKey = itemData.iconKey;
                if (itemIconKey && this.textures.exists(itemIconKey)) {
                    if (elements.iconDisplay.texture.key !== itemIconKey) elements.iconDisplay.setTexture(itemIconKey);
                    elements.iconDisplay.setVisible(true).setScale(0.8);
                } else {
                     if (this.textures.exists(elements.placeholderTexture)) {
                         if (elements.iconDisplay.texture.key !== elements.placeholderTexture) elements.iconDisplay.setTexture(elements.placeholderTexture);
                         elements.iconDisplay.setVisible(true).setScale(0.8);
                     } else elements.iconDisplay.setVisible(false);
                    // console.warn(`Icon texture missing for item ${itemIdToDisplay}.`);
                }

                let effectsString = "";
                if (itemData.effects) effectsString = Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join('\n');
                const newLabelText = `${itemData.inGameName}${effectsString ? '\n' + effectsString : ''}`;
                if (elements.label.text !== newLabelText) elements.label.setText(newLabelText);
                if (elements.label.style.fontSize !== '11px') elements.label.setFontSize('11px');
                if (elements.label.lineSpacing !== 4) elements.label.setLineSpacing(4);
                elements.label.y = 45;
                elements.border.setStrokeStyle(2, 0xaaaaff);

            } else { // Slot empty
                if (this.textures.exists(elements.placeholderTexture)) {
                     if (elements.iconDisplay.texture.key !== elements.placeholderTexture) elements.iconDisplay.setTexture(elements.placeholderTexture);
                     elements.iconDisplay.setVisible(true).setScale(0.8);
                } else elements.iconDisplay.setVisible(false);
                if (elements.label.text !== elements.name) elements.label.setText(elements.name);
                if (elements.label.style.fontSize !== '14px') elements.label.setFontSize('14px');
                if (elements.label.lineSpacing !== 0) elements.label.setLineSpacing(0);
                elements.label.y = 40;
                elements.border.setStrokeStyle(1, 0x555555);
            }
        });
    }

    equipItem(itemId) {
        // --- This function remains unchanged ---
        if (!gameState.player?.inventory) return;
        const itemData = getItemData(itemId);
        if (!itemData || !itemData.equipSlot) return;
        const intendedSlot = itemData.equipSlot;
        if (!['body', 'weapon', 'accessory'].includes(intendedSlot)) return;
        if (!gameState.player.inventory.equipped) gameState.player.inventory.equipped = {};
        const equipped = gameState.player.inventory.equipped;

        let itemToReturnToInventoryId = null;
        if (intendedSlot === 'body') {
            if (equipped.body) { itemToReturnToInventoryId = equipped.body; equipped.body = null; }
        } else {
            if (equipped.weapon) { itemToReturnToInventoryId = equipped.weapon; equipped.weapon = null; }
            else if (equipped.accessory) { itemToReturnToInventoryId = equipped.accessory; equipped.accessory = null; }
        }

        const itemIndexInInventory = gameState.player.inventory.items.findIndex(invItem => String(invItem?.itemId) === String(itemId)); // Added optional chaining
        if (itemIndexInInventory === -1) return;
        gameState.player.inventory.items.splice(itemIndexInInventory, 1);

        equipped[intendedSlot] = itemId;

        if (itemToReturnToInventoryId) {
            gameState.player.inventory.items.push({ itemId: itemToReturnToInventoryId, quantity: 1 });
        }

        CharacterManager.recalculatePlayerStats();
        this.updateEquipmentSlotsDisplay();
        this.updateTotalStatsDisplay();

        if (this.equipmentListContainer) {
            this.equipmentListContainer.destroy(); this.equipmentListContainer = null;
            this.displayEquipmentTab();
        }

        const targetDisplaySlotKey = (intendedSlot === 'body') ? 'body' : 'accessory';
        const slotElements = this.equipmentSlots[targetDisplaySlotKey];
        if (slotElements?.iconDisplay?.active) this.playEquipAnimation(slotElements.iconDisplay);
    }

    updateTotalStatsDisplay() {
        // --- This function remains unchanged ---
        if (!this.equipmentStatsText || !this.equipmentStatsText.active) { // Simplified check
             // console.warn("Cannot update total stats: equipmentStatsText is missing or inactive."); // Less verbosity
             return;
        }

        const player = gameState.player;
        const equipped = player?.inventory?.equipped || {}; // Safer access
        const currentAttack = player?.currentAttack || 0;
        const currentMagicAttack = player?.currentMagicAttack || 0;
        const currentDefense = player?.currentDefense || 0;

        let attackStatLabel = "Attack"; let attackStatValue = currentAttack;
        const weaponId = equipped.weapon;
        if (weaponId) {
            const weaponData = getItemData(weaponId);
            if (weaponData?.effects?.hasOwnProperty('magicAttack')) {
                attackStatLabel = "Magic Atk"; attackStatValue = currentMagicAttack;
            }
        }
        const defenseStatValue = currentDefense;

        this.equipmentStatsText.setText(`${attackStatLabel}: ${attackStatValue}\nDefense: ${defenseStatValue}`);
        // console.log("Updated total stats display:", this.equipmentStatsText.text); // Less verbosity
    }

   unequipItem(slotKey) {
       // --- This function remains unchanged ---
        if (!gameState.player?.inventory?.equipped) return;
        const equipped = gameState.player.inventory.equipped;
        let itemIdToUnequip = null;

        if (slotKey === 'body' && equipped.body) { itemIdToUnequip = equipped.body; equipped.body = null; }
        else if (slotKey === 'accessory') {
            if (equipped.weapon) { itemIdToUnequip = equipped.weapon; equipped.weapon = null; }
            else if (equipped.accessory) { itemIdToUnequip = equipped.accessory; equipped.accessory = null; }
        }

        if (itemIdToUnequip) {
             const itemData = getItemData(itemIdToUnequip);
             if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
             gameState.player.inventory.items.push({ itemId: itemIdToUnequip, quantity: 1 });
             this.safePlaySound('button-click', { volume: 0.2 });
             CharacterManager.recalculatePlayerStats();
             this.updateEquipmentSlotsDisplay();
             this.updateTotalStatsDisplay();
              if (this.currentTab === 'Equipment' && this.equipmentListContainer) {
                  this.equipmentListContainer.destroy(); this.equipmentListContainer = null;
                  this.displayEquipmentTab();
              }
        } else { console.log(`Nothing to unequip in slot: ${slotKey}`); }
    }

   playEquipAnimation(targetIcon) {
       // --- This function remains unchanged ---
        if (!targetIcon || typeof targetIcon.setScale !== 'function' || !targetIcon.scene || targetIcon.scene !== this || !targetIcon.active) return;
        const finalScaleX = targetIcon.scaleX || 1; const finalScaleY = targetIcon.scaleY || 1;
        targetIcon.setScale(finalScaleX * 1.5, finalScaleY * 1.5).setAlpha(0.5);
        this.tweens.add({ targets: targetIcon, scaleX: finalScaleX, scaleY: finalScaleY, alpha: 1, duration: 300, ease: 'Back.easeOut' });
    }

    displayMaterialsTab() {
        // --- This function remains unchanged ---
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const listWidth = width * 0.8; const listHeight = height * 0.55; const listX = width * 0.5; const listY = height * 0.5;

        if (this.materialsListContainer) this.materialsListContainer.destroy();
        this.materialsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 15, backgroundColor: 0x2e1a2e, borderColor: 0xbf7fbf });
        if (!this.materialsListContainer.valid) return;

        const messageY = listY + listHeight / 2 + 30;
        if (this.materialsInfoMessage) this.materialsInfoMessage.destroy();
        this.materialsInfoMessage = this.add.text(listX, messageY, "Crafting materials...", { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#cccccc', align: 'center', fontStyle: 'italic', wordWrap: { width: listWidth - 40 } }).setOrigin(0.5);

        const inventory = gameState.player.inventory.items || [];
        const materialItems = inventory.filter(itemInstance => getItemData(itemInstance?.itemId)?.type === 'material'); // Optional chaining

        if (materialItems.length === 0) this.materialsListContainer.addText('No materials.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        else {
            let currentY = 0; const itemHeight = 30; const iconSize = 24;
            materialItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId); if (!itemData) return;
                const itemRow = this.add.container(0, 0);
                if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                     const icon = this.add.image(10 + iconSize/2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
                     itemRow.add(icon);
                }
                const text = `${itemData.inGameName} x${itemInstance.quantity}`;
                const textObject = this.add.text(10 + iconSize + 10, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add(textObject);
                this.materialsListContainer.addItem(itemRow, currentY); // Use addItem with Y offset
                currentY += itemHeight + 5;
            });
        }
        this.materialsListContainer.updateMaxScroll();
        this.materialsListContainer.setVisible(true);
    }


    displayPotionsTab() {
        // --- This function remains unchanged ---
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const barWidth = 250; const barX = width * 0.5; const hpBarY = height * 0.3; const mpBarY = hpBarY + 40;

        if (this.potionsHpBar) this.potionsHpBar.destroy();
        if (this.potionsMpBar) this.potionsMpBar.destroy();
        this.potionsHpBar = this.ui.createStatusBar(barX, hpBarY, gameState.player.health, gameState.player.maxHealth, { width: barWidth, textPrefix: 'HP', barColor: 0x00ff00 });
        this.potionsMpBar = this.ui.createStatusBar(barX, mpBarY, gameState.player.mana, gameState.player.maxMana, { width: barWidth, textPrefix: 'MP', barColor: 0x0000ff });

        if (this.potionDisplayGroup) this.potionDisplayGroup.destroy(true);
        this.potionDisplayGroup = this.add.group();

        const potionAreaWidth = width * 0.7; const potionAreaHeight = height * 0.45;
        const potionAreaX = width * 0.5; const potionAreaY = height * 0.65;
        const cardWidth = potionAreaWidth * 0.45; const cardHeight = potionAreaHeight * 0.9; const spacingX = potionAreaWidth * 0.05;
        const hpCardX = potionAreaX - spacingX / 2 - cardWidth / 2;
        const mpCardX = potionAreaX + spacingX / 2 + cardWidth / 2;
        const cardY = potionAreaY;

        this.createPotionCard('hp-potion', hpCardX, cardY, cardWidth, cardHeight, this.hpPotionInfo);
        this.createPotionCard('mana-potion', mpCardX, cardY, cardWidth, cardHeight, this.manaPotionInfo);
        this.updateConsumeButtonStates();
    }

    createPotionCard(itemId, x, y, width, height, infoObject) {
        // --- This function remains unchanged ---
        const itemData = getItemData(itemId); if (!itemData) return; infoObject.data = itemData;
        const panel = this.ui.createPanel(x, y, width, height, {});
        if (!this.potionDisplayGroup) this.potionDisplayGroup = this.add.group();
        this.potionDisplayGroup.add(panel.container);

        const iconSize = 40; const contentTopMargin = 25; const iconTextSpacing = 15;
        const textBlockLineHeight = 18; const textBlockHeight = textBlockLineHeight * 3;
        const buttonHeightForLayout = 40; const buttonBottomMargin = 20;
        const iconY = -height * 0.5 + contentTopMargin + iconSize / 2;
        const textStartY = iconY + iconSize / 2 + iconTextSpacing;
        const buttonY = height * 0.5 - buttonBottomMargin - buttonHeightForLayout / 2;

        if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
            const icon = this.add.image(0, iconY, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
            panel.add(icon); this.potionDisplayGroup.add(icon);
        }

        const quantity = this.getPotionQuantity(itemId);
        const effectValue = itemData.potionEffect?.value || '?'; const effectStat = itemData.potionEffect?.stat?.toUpperCase() || '???';
        const effectText = `Restores ${effectValue} ${effectStat}`; const infoStr = `${itemData.inGameName}\nQuantity: ${quantity}\n${effectText}`;

        infoObject.text = this.add.text(0, textStartY, infoStr, { fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: '#ffffff', align: 'center', lineSpacing: 6 }).setOrigin(0.5, 0);
        panel.add(infoObject.text); this.potionDisplayGroup.add(infoObject.text);

        infoObject.button = this.ui.createButton(0, buttonY, 'Consume', () => this.consumePotion(itemId), { width: width * 0.7, height: buttonHeightForLayout, fontSize: this.ui?.fontSize?.sm || 12 });
        panel.add(infoObject.button.container); this.potionDisplayGroup.add(infoObject.button.container);

        const canConsume = this.canConsumePotion(itemId) && !this.isConsuming;
        if (infoObject.button) {
             infoObject.button.enable(canConsume);
             if(infoObject.button.container) infoObject.button.container.setAlpha(canConsume ? 1 : 0.5);
        }
    }

    getPotionQuantity(itemId) {
        // --- This function remains unchanged ---
        const itemInstance = gameState.player?.inventory?.items?.find(invItem => invItem.itemId === itemId); // Added safety checks
        return itemInstance ? itemInstance.quantity : 0;
    }

    consumePotion(itemId) {
        // --- This function remains unchanged ---
        if (this.isConsuming || !this.canConsumePotion(itemId)) return;
        this.isConsuming = true; this.safePlaySound('button-click');
        const itemData = getItemData(itemId); if (!itemData?.potionEffect) { this.isConsuming = false; return; }

        const { stat, value } = itemData.potionEffect; const player = gameState.player; let success = false; let message = "";

        if (stat === 'health') {
            const needed = player.maxHealth - player.health;
            if (needed <= 0) message = "Health full!"; else { const healed = Math.min(needed, value); HealthManager.updatePlayerHealth(healed, true); success = true; message = `+${healed} HP.`; }
        } else if (stat === 'mana') {
             const needed = player.maxMana - player.mana;
             if (needed <= 0) message = "Mana full!"; else { const restored = Math.min(needed, value); HealthManager.updatePlayerMana(restored, true); success = true; message = `+${restored} MP.`; }
        } else message = `Unknown effect: ${stat}`;

        this.showTemporaryFeedback(message, success ? '#aaffaa' : '#ffaaaa');

        if (success) {
            this.safePlaySound('heal');
            const itemIndex = player.inventory.items.findIndex(invItem => invItem.itemId === itemId);
            if (itemIndex > -1) {
                player.inventory.items[itemIndex].quantity -= 1;
                if (player.inventory.items[itemIndex].quantity <= 0) player.inventory.items.splice(itemIndex, 1);
            }
            this.updatePotionDisplaysAndBars(); this.saveGameState();
        }
        this.time.delayedCall(300, () => { this.isConsuming = false; this.updateConsumeButtonStates(); });
    }

    canConsumePotion(itemId) {
        // --- This function remains unchanged ---
        const quantity = this.getPotionQuantity(itemId); if (quantity <= 0) return false;
        const itemData = getItemData(itemId); if (!itemData?.potionEffect) return false;
        const player = gameState.player;
        if (!player) return false; // Added player check
        if (itemData.potionEffect.stat === 'health') return player.health < player.maxHealth;
        else if (itemData.potionEffect.stat === 'mana') return player.mana < player.maxMana;
        return false;
    }

    updatePotionDisplaysAndBars() {
        // --- This function remains unchanged ---
        if (this.potionsHpBar) this.potionsHpBar.update(gameState.player.health, gameState.player.maxHealth);
        if (this.potionsMpBar) this.potionsMpBar.update(gameState.player.mana, gameState.player.maxMana);
        if (this.hpPotionInfo.text && this.hpPotionInfo.data) {
            const quantity = this.getPotionQuantity('hp-potion');
            const effectText = `Restores ${this.hpPotionInfo.data.potionEffect?.value || '?'} HP`;
            this.hpPotionInfo.text.setText(`${this.hpPotionInfo.data.inGameName}\nQuantity: ${quantity}\n${effectText}`);
        }
        if (this.manaPotionInfo.text && this.manaPotionInfo.data) {
            const quantity = this.getPotionQuantity('mana-potion');
            const effectText = `Restores ${this.manaPotionInfo.data.potionEffect?.value || '?'} MP`;
            this.manaPotionInfo.text.setText(`${this.manaPotionInfo.data.inGameName}\nQuantity: ${quantity}\n${effectText}`);
        }
        this.updateConsumeButtonStates();
    }

    updateConsumeButtonStates() {
        // --- This function remains unchanged ---
        if (this.hpPotionInfo.button) { const can = this.canConsumePotion('hp-potion') && !this.isConsuming; this.hpPotionInfo.button.enable(can); if(this.hpPotionInfo.button.container) this.hpPotionInfo.button.container.setAlpha(can ? 1 : 0.5); }
        if (this.manaPotionInfo.button) { const can = this.canConsumePotion('mana-potion') && !this.isConsuming; this.manaPotionInfo.button.enable(can); if(this.manaPotionInfo.button.container) this.manaPotionInfo.button.container.setAlpha(can ? 1 : 0.5); }
    }

    saveGameState() {
        // --- This function remains unchanged ---
        console.log("[InventoryScene] Saving gameState to localStorage...");
        try {
            const stateToSave = { player: gameState.player }; // Save relevant state
            window.localStorage.setItem('gameState', JSON.stringify(stateToSave));
            console.log("[InventoryScene] GameState saved.");
        } catch (e) { console.error("[InventoryScene] Error saving gameState:", e); }
    }

    showTemporaryFeedback(message, color = '#ffffff') {
        // --- This function remains unchanged ---
         if (!this.ui || !this.cameras?.main) return;
         const width = this.cameras.main.width; const height = this.cameras.main.height;
         const feedbackText = this.add.text(width / 2, height - 40, message, { fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: color, backgroundColor: '#000000cc', padding: { x: 10, y: 5 }, align: 'center' }).setOrigin(0.5).setDepth(100);
         this.tweens?.add({ targets: feedbackText, alpha: 0, y: '-=20', delay: 1500, duration: 500, ease: 'Power1', onComplete: () => { if (feedbackText && feedbackText.active) feedbackText.destroy(); } }); // Added check
     }

     // ---- **** CORRECTED shutdown() **** ----
     shutdown() {
        console.log("InventoryScene shutdown starting...");

        // Destroy dynamic content (ScrollableContainers, Groups, Bars, Text)
        if (this.equipmentListContainer && typeof this.equipmentListContainer.destroy === 'function') this.equipmentListContainer.destroy();
        if (this.materialsListContainer && typeof this.materialsListContainer.destroy === 'function') this.materialsListContainer.destroy();
        if (this.potionDisplayGroup) this.potionDisplayGroup.destroy(true); // Destroy group and children
        if (this.potionsHpBar && typeof this.potionsHpBar.destroy === 'function') this.potionsHpBar.destroy();
        if (this.potionsMpBar && typeof this.potionsMpBar.destroy === 'function') this.potionsMpBar.destroy();
        if (this.materialsInfoMessage && typeof this.materialsInfoMessage.destroy === 'function') this.materialsInfoMessage.destroy(); // Added check

        // Destroy static container holding equipment slots visuals
        if (this.equipmentSlotsContainer) this.equipmentSlotsContainer.destroy(true); // Destroy container and children

        // --- >>> Cleanup Stored UI Elements <<< ---

        // Destroy tab buttons explicitly using their destroy method
        console.log("Destroying tab buttons...");
        for (const name in this.tabButtons) {
            if (this.tabButtons[name] && typeof this.tabButtons[name].destroy === 'function') {
                // console.log(`- Destroying tab button: ${name}`); // Less verbosity
                try { this.tabButtons[name].destroy(); } catch (e) { console.warn(`Error destroying tab button ${name}:`, e); }
            } else {
                // console.warn(`- Could not destroy tab button: ${name} (Instance: ${this.tabButtons[name]})`);
            }
        }
        this.tabButtons = {}; // Clear the reference object

        // Destroy the main scene title
        if (this.sceneTitle) {
            console.log("Destroying scene title...");
            try {
                if(this.sceneTitle.background) this.sceneTitle.background.destroy();
                this.sceneTitle.destroy();
            } catch (e) { console.warn("Error destroying scene title:", e); }
            this.sceneTitle = null;
        }

        // Destroy the return button
        if (this.returnButtonInstance) {
            console.log("Destroying return button in shutdown...");
            try {
                this.returnButtonInstance.destroy(); // Use Button class's destroy method
            } catch(e) { console.warn("Error destroying return button:", e); }
            this.returnButtonInstance = null;
        }

         // Destroy total stats text
         if (this.equipmentStatsText) {
             console.log("Destroying equipment stats text...");
             try {
                 this.equipmentStatsText.destroy();
             } catch (e) { console.warn("Error destroying equipment stats text:", e); }
             this.equipmentStatsText = null;
         }


        // --- >>> END Cleanup Stored UI Elements <<< ---

        // Nullify other references (as before)
        this.equipmentListContainer = null;
        this.materialsListContainer = null;
        this.potionDisplayGroup = null;
        this.potionsHpBar = null;
        this.potionsMpBar = null;
        this.materialsInfoMessage = null;
        this.equipmentSlotsContainer = null;
        this.equipmentSlots = {};
        this.hpPotionInfo = { text: null, button: null, data: null };
        this.manaPotionInfo = { text: null, button: null, data: null };
        this.isConsuming = false;
        this.isSwitchingTabs = false;

        console.log("InventoryScene shutdown cleanup complete.");

        // Call BaseScene shutdown if needed
        if (super.shutdown) {
            super.shutdown();
        }
    }

} // End of InventoryScene Class

export default InventoryScene;