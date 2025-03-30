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
        this.updateEquipmentSlotsDisplay(); // Populate slots based on current state
        this.updateTotalStatsDisplay();    // Populate total stats based on current state
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

        // Ensure slots container is visible and updated
        this.equipmentSlotsContainer?.setVisible(true);
        this.updateEquipmentSlotsDisplay(); // Update slots based on gameState

        // Create NEW Scrollable Equipment List
        const listWidth = width * 0.4;
        const listHeight = height * 0.6;
        const listX = width * 0.3;
        const listY = height * 0.55;
        this.equipmentListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });

        // Ensure container was created before proceeding
         if (!this.equipmentListContainer || !this.equipmentListContainer.valid) {
             console.error("Failed to create equipmentListContainer in displayEquipmentTab.");
             return;
         }

        // Remove previous listener if it exists (safety check)
        if (this.equipmentListContainer.interactiveArea) {
             this.equipmentListContainer.interactiveArea.removeListener('pointerdown');
        } else {
             console.warn("equipmentListContainer.interactiveArea not found when trying to remove listener.");
        }


        const inventory = gameState.player.inventory.items || [];
        const equipmentItems = inventory.filter(itemInstance => {
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.equipSlot && ['body', 'accessory', 'weapon'].includes(itemData.equipSlot);
        });

        console.log("Equipment Tab - Filtered items (includes weapons):", JSON.parse(JSON.stringify(equipmentItems)));

        if (equipmentItems.length === 0) {
            this.equipmentListContainer.addText('No equippable items found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            const itemHeight = 40;

            equipmentItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId);
                if (!itemData) return;

                // Create row container, position will be handled by addItem
                const itemRow = this.add.container(0, 0); 
                // Elements relative to itemRow (0,0)
                const itemBg = this.add.rectangle(0, 0, listWidth - 20, itemHeight, 0x2a2a3e, 0).setOrigin(0, 0);
                const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                let statsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join(', ') : '';
                const statsText = this.add.text(listWidth - 30, itemHeight / 2, statsString, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#aaffaa', align: 'right' }).setOrigin(1, 0.5);

                itemRow.add([itemBg, nameText, statsText]);
                itemRow.setSize(listWidth - 20, itemHeight); // Set size for bounds checking
                itemRow.setData('itemId', itemInstance.itemId); // Store ID for lookup

                // Optional: Add hover effect via the main listener later if desired
                // We are NOT making itemRow interactive here directly

                this.equipmentListContainer.addItem(itemRow); // Add row to scroll container
            });

            // --- ADD SINGLE LISTENER TO SCROLLABLE CONTAINER'S *INTERACTIVE AREA* ---
             if (this.equipmentListContainer && this.equipmentListContainer.interactiveArea) {
                  
                  this.equipmentListContainer.interactiveArea.setInteractive(); // Ensure it's interactive
                  this.equipmentListContainer.interactiveArea.input.cursor = 'default'; // Default cursor for the area

                  this.equipmentListContainer.interactiveArea.on('pointerdown', (pointer) => {
                      // Check if click is within the main container bounds first
                      const scrollContainerBounds = this.equipmentListContainer.background.getBounds(); 
                      if (!Phaser.Geom.Rectangle.Contains(scrollContainerBounds, pointer.worldX, pointer.worldY)) {
                          return; 
                      }

                      // Manually check against the VISIBLE bounds of each item row
                      const itemsInView = this.equipmentListContainer.getItems ? this.equipmentListContainer.getItems() : []; 
                      let clickedItemId = null;

                      for (const row of itemsInView) {
                           if (!row || !row.visible || !row.active) continue; // Skip invisible/inactive rows

                           const rowBounds = row.getBounds(); 
                           
                           // Check pointer against the row's world bounds
                           if (Phaser.Geom.Rectangle.Contains(rowBounds, pointer.worldX, pointer.worldY)) {
                                clickedItemId = row.getData('itemId');
                                console.log(`[SC Listener - Manual Check] Pointer hit row bounds for item ID: ${clickedItemId}`);
                                // Optional: Visual feedback on the specific row's BG
                                // const bgOfClickedRow = row.list.find(el => el instanceof Phaser.GameObjects.Rectangle);
                                // if(bgOfClickedRow) { /* briefly change color */ } 
                                break; 
                           }
                      }

                      if (clickedItemId) {
                           console.log(`[SC Listener - Manual Check] Click confirmed for item ID: ${clickedItemId}`);
                           pointer.event?.stopPropagation(); 
                           this.safePlaySound('button-click', { volume: 0.3 });
                           this.equipItem(clickedItemId);
                      } else {
                          console.log("[SC Listener - Manual Check] Clicked inside container, but not on any item bounds.");
                      }
                  });
                  console.log("Attached manual check pointerdown listener to scrollable container's interactive area.");
             } else {
                  console.error("Cannot attach equipment list listener: ScrollableContainer or its interactive area is missing.");
             }
        }

        this.equipmentListContainer?.updateMaxScroll();
        this.equipmentListContainer?.setVisible(true);
    }

    createEquipmentSlotsDisplay(container) {
        // --- Background Panel for the whole section ---
        const panelWidth = 240;
        const panelHeight = 350; // Adjusted height for slots + stats
        // Create panel safely
        try {
             const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.6)
                 .setStrokeStyle(1, 0x333333);
             container.add(panel);
        } catch (e) {
             console.error("Error creating equipment slots panel background:", e);
             // Optionally return or handle the error to prevent further issues
             return; 
        }


        // --- Define ONLY the Body (Armour) and Accessory Slots ---
        const slotData = [
             { key: 'body', name: 'Armour', x: 0, y: -80, placeholderTexture: 'slot-body' }, // Adjusted Y slightly up
             { key: 'accessory', name: 'Accessory/Weapon', x: 0, y: 20, placeholderTexture: 'slot-accessory' } // Adjusted Y slightly up
        ];

        // Reset equipmentSlots references IF creating slots fresh (e.g., in create, not just update)
        // If this function is ONLY called once in create(), this reset is fine here.
        // If it can be called multiple times to recreate slots, move reset elsewhere or handle carefully.
        this.equipmentSlots = {}; 

        slotData.forEach(slot => {
             try { // Add try...catch around individual slot creation for robustness
                 const slotContainer = this.add.container(slot.x, slot.y);
                 const slotBorder = this.add.rectangle(0, 0, 64, 64, 0x222222, 0.8)
                    .setStrokeStyle(1, 0x555555);
                 const placeholderIconKey = slot.placeholderTexture;
                 const iconDisplay = this.add.image(0, 0, placeholderIconKey);
                 iconDisplay.setScale(0.8);
                 if (!this.textures.exists(placeholderIconKey)) {
                     iconDisplay.setVisible(false);
                     console.warn(`Placeholder texture missing for slot ${slot.key}: ${placeholderIconKey}`);
                 }
                 // Label for Item Name + Modifiers (will be updated later)
                 const label = this.add.text(0, 45, slot.name, { // Position below icon
                    fontSize: '11px', // Start with smaller size
                    fill: '#ffffff',
                    align: 'center',
                    wordWrap: { width: 70 }, // Allow wrapping for long names/stats
                    lineSpacing: 4
                 }).setOrigin(0.5);

                 slotContainer.add([slotBorder, iconDisplay, label]);
                 container.add(slotContainer); // Add slot container to main equipment container

                 // Store references including the default slot name
                 this.equipmentSlots[slot.key] = {
                    container: slotContainer,
                    iconDisplay: iconDisplay,
                    border: slotBorder,
                    label: label, // Store label reference
                    placeholderTexture: placeholderIconKey,
                    name: slot.name // Store default name ('Armour' or 'Accessory/Weapon')
                };

                 // Add unequip listener to the border
                 slotBorder.setInteractive({ useHandCursor: true })
                     .on('pointerdown', () => {
                         console.log(`Clicked slot: ${slot.key}`);
                         this.unequipItem(slot.key);
                     });

             } catch (e) {
                  console.error(`Error creating UI elements for slot ${slot.key}:`, e);
             }
        }); // End forEach slotData

         // --- STATS DISPLAY (Robust Creation/Adding) ---
         const statsY = panelHeight / 2 - 40; // Adjust Y to be near the bottom of the panel

         // Check if the text object exists AND is still active in the scene
         // Use optional chaining for safety in case this.equipmentStatsText is null/undefined
         if (this.equipmentStatsText?.scene) { 
             console.log("equipmentStatsText exists and is in scene.");
             // Ensure it's positioned correctly and part of the container
             // Check if container exists before accessing its list
             if (container && !container.list.includes(this.equipmentStatsText)) {
                  console.log("Adding existing equipmentStatsText back to container.");
                  try {
                       container.add(this.equipmentStatsText); // Add if not already present
                  } catch (e) {
                       console.error("Error re-adding existing statsText to container:", e);
                       // If re-adding fails, maybe the text object is truly broken
                       if(this.equipmentStatsText) this.equipmentStatsText.destroy();
                       this.equipmentStatsText = null; 
                  }
             }
             // Only reposition/set active if it's still valid
             if (this.equipmentStatsText) { 
                  this.equipmentStatsText.setPosition(0, statsY); // Ensure position is correct
                  this.equipmentStatsText.setActive(true).setVisible(true); // Ensure visible/active
             }
         } 
         
         // If it doesn't exist OR adding it back failed, create a NEW one
         if (!this.equipmentStatsText) { 
              console.log("Creating NEW equipmentStatsText.");
              let statsText = null; // Declare outside try
              try {
                   statsText = this.add.text(0, statsY, '', { 
                        fontSize: '12px', fill: '#aaffaa', align: 'center', lineSpacing: 4 
                   }).setOrigin(0.5);
                   
                   // Attempt to add to container, handle potential errors
                   if (container) {
                        container.add(statsText); 
                        this.equipmentStatsText = statsText; // Store reference ONLY if added successfully
                   } else {
                        console.error("Cannot add statsText: Main container is invalid.");
                        if(statsText) statsText.destroy(); // Clean up if container missing
                        this.equipmentStatsText = null;
                   }
              } catch (e) {
                   console.error("Error creating/adding new statsText:", e);
                   if(statsText) statsText.destroy(); // Clean up if add failed
                   this.equipmentStatsText = null; // Ensure reference is nullified
              }
         }
         // --- END STATS DISPLAY ---

         // Initial update (safe to call even if text wasn't created due to error)
         this.updateTotalStatsDisplay(); 
    }
    updateEquipmentSlotsDisplay() {
        console.log("Updating Equipment Slots Display...");
        const equipped = gameState.player.inventory?.equipped || {};

        // Iterate ONLY over the defined slots (body, accessory)
        Object.entries(this.equipmentSlots).forEach(([slotKey, elements]) => {
            // Safety check for elements - ensure all expected parts exist
            if (!elements || !elements.iconDisplay || !elements.label || !elements.border || !elements.placeholderTexture || !elements.name) {
                console.warn(`Missing UI elements or default name for slot key: ${slotKey}. Skipping update for this slot.`);
                return; // Skip this iteration if elements are missing
            }

            let itemIdToDisplay = null;
            let itemData = null;

            // Determine which item ID (if any) should be displayed in this visual slot
            if (slotKey === 'body' && equipped.body) {
                itemIdToDisplay = equipped.body;
                // console.log(`Slot ${slotKey}: Checking equipped item ${itemIdToDisplay}`);
            } else if (slotKey === 'accessory') {
                // Check weapon first, then accessory for the shared visual slot
                itemIdToDisplay = equipped.weapon || equipped.accessory;
                // if (itemIdToDisplay) console.log(`Slot ${slotKey}: Checking equipped item ${itemIdToDisplay} (from weapon or accessory state)`);
            }

            // Get item data if an ID was found for the slot
            if (itemIdToDisplay) {
                itemData = getItemData(itemIdToDisplay);
                 if (!itemData) {
                     console.warn(`Could not retrieve item data for equipped ID: ${itemIdToDisplay} in slot ${slotKey}. Resetting slot.`);
                 }
            }

            // Update the slot based on the found and valid itemData
            if (itemData) {
                // Item IS equipped in this slot

                // 1. Update Icon
                const itemIconKey = itemData.iconKey;
                let usingPlaceholderIcon = false;
                if (itemIconKey && this.textures.exists(itemIconKey)) {
                    // Only change texture if it's different
                    if (elements.iconDisplay.texture.key !== itemIconKey) {
                        elements.iconDisplay.setTexture(itemIconKey);
                    }
                    elements.iconDisplay.setVisible(true).setScale(0.8);
                } else {
                    // Fallback to placeholder if item icon missing but placeholder texture exists
                    usingPlaceholderIcon = true;
                    if (this.textures.exists(elements.placeholderTexture)) {
                         if (elements.iconDisplay.texture.key !== elements.placeholderTexture) {
                            elements.iconDisplay.setTexture(elements.placeholderTexture);
                         }
                         elements.iconDisplay.setVisible(true).setScale(0.8);
                    } else {
                        // Hide if placeholder also missing
                        elements.iconDisplay.setVisible(false);
                    }
                    console.warn(`Icon texture '${itemIconKey}' not found for item ${itemIdToDisplay}. Using placeholder.`);
                }

                // 2. Update Label with Item Name + Modifiers
                let effectsString = "";
                if (itemData.effects) {
                    effectsString = Object.entries(itemData.effects)
                        // Example: Filter specific stats if needed
                        // .filter(([stat]) => ['attack', 'defense', 'magicAttack', 'health', 'mana'].includes(stat)) 
                        .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`)
                        .join('\n'); // Join with newline
                }
                
                const newLabelText = `${itemData.inGameName}${effectsString ? '\n' + effectsString : ''}`; // Add newline only if effects exist

                // Only update text content if it actually changed
                if (elements.label.text !== newLabelText) {
                    elements.label.setText(newLabelText);
                }
                // Apply styling suitable for multi-line text
                if (elements.label.style.fontSize !== '11px') elements.label.setFontSize('11px');
                if (elements.label.lineSpacing !== 4) elements.label.setLineSpacing(4);
                elements.label.y = 45; // Adjust Y position if needed to fit multiple lines

                // 3. Update Border (Highlight)
                elements.border.setStrokeStyle(2, 0xaaaaff); // Highlight color

            } else {
                // Slot is EMPTY - Reset to default placeholder and label

                // 1. Reset Icon to Placeholder
                if (this.textures.exists(elements.placeholderTexture)) {
                     if (elements.iconDisplay.texture.key !== elements.placeholderTexture) {
                        elements.iconDisplay.setTexture(elements.placeholderTexture);
                     }
                     elements.iconDisplay.setVisible(true).setScale(0.8);
                } else {
                    elements.iconDisplay.setVisible(false); // Hide if placeholder missing
                }

                // 2. Reset Label to Default Name
                if (elements.label.text !== elements.name) {
                    elements.label.setText(elements.name); // Use stored default name
                }
                // Reset styling
                if (elements.label.style.fontSize !== '14px') elements.label.setFontSize('14px');
                if (elements.label.lineSpacing !== 0) elements.label.setLineSpacing(0);
                elements.label.y = 40; // Reset Y position

                // 3. Reset Border
                elements.border.setStrokeStyle(1, 0x555555); // Default border color
            }
        });

        // IMPORTANT: Removed the call to this.updateTotalStatsDisplay(); from here
        // It should be called separately after this function completes.
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
    this.updateEquipmentSlotsDisplay(); // Update individual slots first
    this.updateTotalStatsDisplay();    // THEN update the total stats display

    // 11. Update UI (Slots & List)
    this.updateEquipmentSlotsDisplay(); // Update individual slots first
    this.updateTotalStatsDisplay();    // THEN update the total stats display

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

    // Add this function or integrate into updateEquipmentSlotsDisplay if preferred
    updateTotalStatsDisplay() {
        // Check if the text element exists and is active
        if (!this.equipmentStatsText || !this.equipmentStatsText.scene || !this.equipmentStatsText.active) { 
             console.warn("Cannot update total stats: equipmentStatsText is missing or destroyed.");
             // Optionally try to recreate it if it should exist? Or just return.
             // If recreating: this.createEquipmentSlotsDisplay(this.equipmentSlotsContainer); // Be careful of loops
             return; 
        }

        const player = gameState.player;
        // Ensure stats exist on player object, provide defaults if not
        const equipped = player.inventory?.equipped || {};
        const currentAttack = player.currentAttack || 0;
        const currentMagicAttack = player.currentMagicAttack || 0;
        const currentDefense = player.currentDefense || 0;

        // Determine which attack stat to display based on equipped weapon state
        let attackStatLabel = "Attack"; 
        let attackStatValue = currentAttack; 
        const weaponId = equipped.weapon; // Check the state
        
        if (weaponId) {
            const weaponData = getItemData(weaponId);
            // Check if the equipped weapon provides magicAttack
            if (weaponData?.effects?.hasOwnProperty('magicAttack')) { 
                attackStatLabel = "Magic Atk";
                attackStatValue = currentMagicAttack;
            }
        }
       
        const defenseStatValue = currentDefense;

        // Update the text element
        this.equipmentStatsText.setText(
             `${attackStatLabel}: ${attackStatValue}\n` +
             `Defense: ${defenseStatValue}`
             // Add other total stats like crit, dodge if needed
        );
        console.log("Updated total stats display:", this.equipmentStatsText.text);
   }
    
   
   unequipItem(slotKey) {
    console.log(`Attempting to unequip from slot: ${slotKey}`);
    // Ensure inventory and equipped object exist
    if (!gameState.player?.inventory?.equipped) {
        console.error("Cannot unequip: Player inventory or equipped object not found.");
        return; 
    }
    const equipped = gameState.player.inventory.equipped;
    let itemIdToUnequip = null;

    // Determine which actual state slot corresponds to the visual slot clicked
    // and clear the state slot if an item is found
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

    // Proceed only if an item was actually unequipped from the state
    if (itemIdToUnequip) {
         const itemData = getItemData(itemIdToUnequip); // Get data for logging
         console.log(`Unequipping ${itemData?.inGameName || itemIdToUnequip}`);

         // Add the item back to the main inventory list
         if (!gameState.player.inventory.items) gameState.player.inventory.items = []; // Ensure items array exists
         gameState.player.inventory.items.push({ itemId: itemIdToUnequip, quantity: 1 });

         this.safePlaySound('button-click', { volume: 0.2 }); // Play an unequip sound

         // Recalculate player stats AFTER modifying equipment state
         CharacterManager.recalculatePlayerStats();

         // Refresh UI: Update slots AND total stats display
         this.updateEquipmentSlotsDisplay(); 
         this.updateTotalStatsDisplay();    

         // Refresh the equipment list ONLY if the equipment tab is currently active
         // This prevents unnecessary list rebuilding if unequipping from another tab (though unlikely here)
          if (this.currentTab === 'Equipment' && this.equipmentListContainer) { 
              this.equipmentListContainer.destroy();
              this.equipmentListContainer = null;
              this.displayEquipmentTab(); // Recreate the list to show the unequipped item
          }
    } else {
        // No item was found in the corresponding state slot(s)
        console.log(`Nothing to unequip in slot: ${slotKey}`);
        // Optionally give visual feedback like a slight shake or red flash on the slot
    }
} // --- End of unequipItem method ---

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