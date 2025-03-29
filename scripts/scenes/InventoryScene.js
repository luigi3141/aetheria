import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import Panel from '../ui/components/Panel.js';
import StatusBar from '../ui/components/StatusBar.js';
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import { getItemData } from '../data/items.js';
import HealthManager from '../utils/HealthManager.js';
import BaseScene from './BaseScene.js';

class InventoryScene extends BaseScene {
    constructor() {
        super({ key: 'InventoryScene' });
        this.currentTab = 'Equipment';
        this.tabButtons = {};
        this.equipmentSlots = {};
        this.returnSceneKey = 'OverworldScene';

        // Dynamic content containers (destroyed on tab switch)
        this.equipmentListContainer = null;
        this.materialsListContainer = null;
        this.potionsListContainer = null;
        this.potionsHpBar = null; // Renamed to avoid conflict if needed
        this.potionsMpBar = null; // Renamed
        this.materialsInfoMessage = null; // Reference for the static message

        // Static content container (created once)
        this.equipmentSlotsContainer = null;
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

        // Load equipment slot placeholder icons
        if (!this.textures.exists('slot-armour')) {
            this.load.image('slot-armour', ASSET_PATHS.EQUIPMENT_SLOTS.ARMOUR);
        }
        if (!this.textures.exists('slot-accessory')) {
            this.load.image('slot-accessory', ASSET_PATHS.EQUIPMENT_SLOTS.ACCESSORY);
        }

        // Load material icons
        for (const [key, path] of Object.entries(ASSET_PATHS.MATERIALS)) {
            if (!this.textures.exists(key)) this.load.image(key, path);
        }
        console.log('InventoryScene Preload End');
    }

    create() {
        console.log("InventoryScene Create Start");
        this.initializeScene();

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
        // This container persists across tab switches
        this.equipmentSlotsContainer = this.add.container(width * 0.75, height * 0.5);
        this.createEquipmentSlotsDisplay(this.equipmentSlotsContainer);
        // Initially hide it if the default tab is not Equipment
        this.equipmentSlotsContainer.setVisible(this.currentTab === 'Equipment');

        // Wait for scene to be fully active before displaying the initial tab
        this.events.once('create', () => {
            // Display the initial tab (which will create its dynamic content)
            this.setActiveTab(this.currentTab);
            console.log("InventoryScene Create End");
        });
    }

    // --- Tab Management ---

    createTabs() { /* ... Keep as is ... */
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

        // Equipment Slots container is static, just ensure it's visible and updated
        this.equipmentSlotsContainer?.setVisible(true);
        this.updateEquipmentSlotsDisplay(); // Update its content

        // Create NEW Scrollable Equipment List
        const listWidth = width * 0.4; const listHeight = height * 0.6;
        const listX = width * 0.3; const listY = height * 0.55;
        this.equipmentListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a1a2e, borderColor: 0x7f7fbf });
        // NOTE: Do NOT add this container to tabContentGroup anymore, cleanup is manual

        const inventory = gameState.player.inventory.items || [];
        const equipmentItems = inventory.filter(itemInstance => getItemData(itemInstance.itemId)?.equipSlot);

        if (equipmentItems.length === 0) {
            this.equipmentListContainer.addText('No equipment found.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0;
            const itemHeight = 40;
            const backgroundsToListen = [];

            equipmentItems.forEach(itemInstance => {
                const itemData = getItemData(itemInstance.itemId);
                if (!itemData) return;

                const itemRow = this.add.container(0, 0);
                const itemBg = this.add.rectangle(listWidth / 2, itemHeight / 2, listWidth - 20, itemHeight, 0x2a2a3e, 0).setOrigin(0.5);
                const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                let statsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join(', ') : '';
                const statsText = this.add.text(listWidth - 30, itemHeight / 2, statsString, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#aaffaa', align: 'right' }).setOrigin(1, 0.5);

                itemRow.add([itemBg, nameText, statsText]);
                this.equipmentListContainer.addItem(itemRow, currentY);
                backgroundsToListen.push({ bg: itemBg, itemId: itemInstance.itemId });
                currentY += itemHeight + 5;
            });

            this.time.delayedCall(10, () => {
                if (!this || !this.scene?.key || this.scene.key !== 'InventoryScene') return;
                backgroundsToListen.forEach(item => {
                    if (item.bg?.active && typeof item.bg.setInteractive === 'function') {
                         item.bg.setInteractive({ useHandCursor: true });
                         item.bg.on('pointerover', () => { if (item.bg?.active) item.bg.setFillStyle(0x3a3a4e, 0.7); });
                         item.bg.on('pointerout', () => { if (item.bg?.active) item.bg.setFillStyle(0x2a2a3e, 0); });
                         item.bg.on('pointerdown', () => { if (item.bg?.active) { this.safePlaySound('button-click', { volume: 0.3 }); this.equipItem(item.itemId); } });
                    } else { console.warn("Skipping listener attachment for invalid equip item background."); }
                });
            }, [], this);
        }

        this.equipmentListContainer.updateMaxScroll();
        this.equipmentListContainer.setVisible(true);
    }

    createEquipmentSlotsDisplay(container) {
        // Create background panel first
        const panelWidth = 240;
        const panelHeight = 300;
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.6)
            .setStrokeStyle(1, 0x333333);
        container.add(panel);

        const slotData = [
            { key: 'armour', name: 'Armour', x: 0, y: -60 },
            { key: 'accessory', name: 'Accessory', x: 0, y: 60 }
        ];

        this.equipmentSlots = {};
        
        slotData.forEach(slot => {
            const slotContainer = this.add.container(slot.x, slot.y);
            
            // Add slot background/placeholder
            const slotBg = this.add.image(0, 0, `slot-${slot.key}`);
            slotBg.setScale(0.8);
            
            // Add slot label
            const label = this.add.text(-60, -30, slot.name, {
                fontSize: '16px',
                fill: '#ffffff'
            });
            
            // Add slot highlight/border
            const slotBorder = this.add.rectangle(0, 0, 64, 64, 0x222222, 0.8)
                .setStrokeStyle(1, 0x555555);
            
            slotContainer.add([slotBorder, slotBg, label]);
            container.add(slotContainer);
            
            this.equipmentSlots[slot.key] = {
                container: slotContainer,
                background: slotBg,
                border: slotBorder
            };
        });

        this.updateEquipmentSlotsDisplay();
    }

    updateEquipmentSlotsDisplay() {
        const equipped = gameState.player.inventory?.equipped || {};
        
        Object.entries(this.equipmentSlots).forEach(([slot, elements]) => {
            const equippedItem = equipped[slot];
            if (equippedItem) {
                const itemData = getItemData(equippedItem);
                if (itemData) {
                    // Update the label to show what's equipped
                    elements.container.list[2].setText(`${slot}\n${itemData.name}`);
                    // Highlight the border
                    elements.border.setStrokeStyle(2, 0xaaaaff);
                }
            } else {
                // Reset to default label if nothing equipped
                elements.container.list[2].setText(slot === 'armour' ? 'Armour' : 'Accessory');
                // Reset border
                elements.border.setStrokeStyle(1, 0x555555);
            }
        });
    }

    equipItem(itemId) {
        const itemData = getItemData(itemId);
        if (!itemData) return;

        let slot;
        if (itemData.category === 'Armour') {
            slot = 'armour';
        } else if (['Melee', 'Ranged', 'Wand'].includes(itemData.category)) {
            slot = 'accessory';
            // Unequip any existing accessory
            if (gameState.player.inventory.equipped.accessory) {
                const oldItemId = gameState.player.inventory.equipped.accessory;
                const oldItemData = getItemData(oldItemId);
                console.log(`Unequipping ${oldItemData.name} from accessory slot`);
                gameState.player.inventory.equipped.accessory = null;
            }
        } else {
            console.warn(`Cannot equip item of category ${itemData.category}`);
            return;
        }

        gameState.player.inventory.equipped[slot] = itemId;
        console.log(`Equipped ${itemData.name} to ${slot} slot`);
        this.updateEquipmentSlotsDisplay();
        const slotToAnimate = this.equipmentSlots[slot];
        if (slotToAnimate?.background) this.playEquipAnimation(slotToAnimate.background);
    }

    displayMaterialsTab() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const listWidth = width * 0.8; const listHeight = height * 0.55;
        const listX = width * 0.5; const listY = height * 0.5;

        this.materialsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 15, backgroundColor: 0x2e1a2e, borderColor: 0xbf7fbf });

        const messageY = listY + listHeight / 2 - 20;
        this.materialsInfoMessage = this.add.text(listX, messageY,
            "Crafting materials can be used at the Crafting Workshop to create equipment",
            { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#cccccc', align: 'center', fontStyle: 'italic'}
        ).setOrigin(0.5);

        const inventory = gameState.player.inventory.items || [];
        console.log("Materials Tab - Initial inventory:", JSON.parse(JSON.stringify(inventory)));

        const materialItems = inventory.filter(itemInstance => {
            const itemData = getItemData(itemInstance.itemId);
            console.log(`Checking item ${itemInstance.itemId}:`, {
                itemData: itemData,
                type: itemData?.type,
                category: itemData?.category,
                isValid: itemData && (
                    itemData.type === 'material' || 
                    ['Armour', 'Branches', 'Sharps', 'Strings', 'Gem', 'Material'].includes(itemData.category)
                )
            });
            return itemData && (
                itemData.type === 'material' || 
                ['Armour', 'Branches', 'Sharps', 'Strings', 'Gem', 'Material'].includes(itemData.category)
            );
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
                 }
                const text = `${itemData.inGameName} x${itemInstance.quantity}`;
                const textObject = this.add.text(10 + iconSize + 10, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                itemRow.add(textObject);
                this.materialsListContainer.addItem(itemRow, currentY);
                currentY += itemHeight;
            });
        }
        this.materialsListContainer.updateMaxScroll();
        this.materialsListContainer.setVisible(true);
    }

    // displayPotionsTab - unchanged (except cleanup handled in setActiveTab)
    displayPotionsTab() { /* ... Keep as is, BUT remove the initial destroy lines for container/bars ... */
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const barWidth = 250; const barX = width * 0.5;
        const hpBarY = height * 0.3; const mpBarY = hpBarY + 30;

        // Create NEW status bars
        this.potionsHpBar = this.ui.createStatusBar(barX, hpBarY, gameState.player.health, gameState.player.maxHealth, { width: barWidth, textPrefix: 'HP', barColor: 0x00ff00 });
        this.potionsMpBar = this.ui.createStatusBar(barX, mpBarY, gameState.player.mana, gameState.player.maxMana, { width: barWidth, textPrefix: 'MP', barColor: 0x0000ff });

        const listWidth = width * 0.7; const listHeight = height * 0.35;
        const listX = width * 0.5; const listY = height * 0.65;
        this.potionsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 10, backgroundColor: 0x1a2e1a, borderColor: 0x7fbf7f });

        const inventory = gameState.player.inventory.items || [];
        const potionItems = inventory.filter(itemInstance => { /* ... filter logic ... */
            const itemData = getItemData(itemInstance.itemId);
            return itemData && (itemData.category === 'Potion' || itemData.type === 'consumable');
         });

        if (potionItems.length === 0) {
            this.potionsListContainer.addText('No potions or consumables.', { fill: '#aaaaaa', fontSize: this.ui.fontSize.sm });
        } else {
            let currentY = 0; const itemHeight = 45; const iconSize = 30;
            const backgroundsToListen = [];

            potionItems.forEach((itemInstance) => {
                const itemData = getItemData(itemInstance.itemId); if (!itemData?.potionEffect) return;
                const itemRow = this.add.container(0, 0);
                const itemBg = this.add.rectangle(listWidth / 2, itemHeight / 2, listWidth - 20, itemHeight, 0x2a3e2a, 0).setOrigin(0.5);
                let icon = null;
                if (itemData.iconKey && this.textures.exists(itemData.iconKey)) {
                     icon = this.add.image(20 + iconSize/2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5);
                    itemRow.add(icon);
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
                     if (item.bg?.active && typeof item.bg.setInteractive === 'function') {
                         item.bg.setInteractive({ useHandCursor: true });
                         item.bg.on('pointerover', () => { if (item.bg?.active) item.bg.setFillStyle(0x3a4e3a, 0.7); });
                         item.bg.on('pointerout', () => { if (item.bg?.active) item.bg.setFillStyle(0x2a3e2a, 0); });
                         item.bg.on('pointerdown', () => { if (item.bg?.active) this.consumePotion(item.itemId); });
                     } else { console.warn("Skipping listener attachment for invalid potion background."); }
                 });
             }, [], this);
        }
        this.potionsListContainer.updateMaxScroll();
        this.potionsListContainer.setVisible(true);
    }


    consumePotion(itemId) { /* ... Keep as is ... */
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

        if(this.ui?.createText) {
             const feedbackText = this.ui.createText(this.cameras.main.width / 2, this.cameras.main.height * 0.8, message, { fontSize: this.ui.fontSize.sm, color: success ? '#aaffaa' : '#ffaaaa'});
             this.tweens.add({ targets: feedbackText, y: '-=50', alpha: 0, duration: 1500, ease: 'Power1', onComplete: () => feedbackText.destroy()});
        } else console.log(message);

        if (success) {
            this.safePlaySound('heal', {volume: 0.4});
            const itemIndex = gameState.player.inventory.items.findIndex(invItem => invItem.itemId === itemId);
            if (itemIndex > -1) {
                gameState.player.inventory.items[itemIndex].quantity -= 1;
                if (gameState.player.inventory.items[itemIndex].quantity <= 0) gameState.player.inventory.items.splice(itemIndex, 1);
            }
            if(this.potionsHpBar) this.potionsHpBar.update(gameState.player.health, gameState.player.maxHealth); // Use correct var name
            if(this.potionsMpBar) this.potionsMpBar.update(gameState.player.mana, gameState.player.maxMana); // Use correct var name
            this.displayPotionsTab(); // Refresh list
        }
    }


    createReturnButton() { /* ... Keep as is ... */
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        this.ui.createButton( width / 2, height * 0.92, 'Return',
            () => { console.log(`InventoryScene: Returning to ${this.returnSceneKey}`); this.safePlaySound('menu-close'); navigationManager.navigateTo(this, this.returnSceneKey); },
            { width: 180, height: 50 }
        );
    }

    shutdown() {
        console.log("InventoryScene shutdown starting...");
        // Destroy DYNAMIC content containers
        if (this.equipmentListContainer) this.equipmentListContainer.destroy();
        if (this.materialsListContainer) this.materialsListContainer.destroy();
        if (this.potionsListContainer) this.potionsListContainer.destroy();
        if (this.potionsHpBar) this.potionsHpBar.destroy(); // Use correct var name
        if (this.potionsMpBar) this.potionsMpBar.destroy(); // Use correct var name
        if (this.materialsInfoMessage) this.materialsInfoMessage.destroy();

        // Destroy STATIC container (created in create)
        if (this.equipmentSlotsContainer) this.equipmentSlotsContainer.destroy(true); // true to destroy children

        // Destroy tab buttons
        for (const name in this.tabButtons) {
           if (this.tabButtons[name] && typeof this.tabButtons[name].destroy === 'function') {
               this.tabButtons[name].destroy();
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

        console.log("InventoryScene shutdown cleanup complete.");
        // No super.shutdown needed unless BaseScene implements it
    }
}

export default InventoryScene;