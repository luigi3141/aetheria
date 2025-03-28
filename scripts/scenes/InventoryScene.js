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
        this.equipmentSlotsDisplay = {};
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
        console.log(`InventoryScene: Will return to ${this.returnSceneKey}`);
    }

    preload() {
        console.log("InventoryScene Preload Start");
        if (!this.textures.exists('inventory-bg')) this.load.image('inventory-bg', ASSET_PATHS.BACKGROUNDS.INVENTORY);
        for (const [key, path] of Object.entries(ASSET_PATHS.MATERIALS)) if (!this.textures.exists(key)) this.load.image(key, path);
        for (const [key, path] of Object.entries(ASSET_PATHS.EQUIPMENT)) {
            if (!this.textures.exists(`SLOT_${key}`)) this.load.image(`SLOT_${key}`, path);
            if (!this.textures.exists(key)) this.load.image(key, path);
        }
        if (!this.textures.exists('HP_POTION')) this.load.image('HP_POTION', ASSET_PATHS.ITEMS.HP_POTION);
        if (!this.textures.exists('MANA_POTION')) this.load.image('MANA_POTION', ASSET_PATHS.ITEMS.MANA_POTION);
        if (!this.textures.exists('HP_ICON')) this.load.image('HP_ICON', ASSET_PATHS.ITEMS.HP_ICON);
        if (!this.textures.exists('MANA_ICON')) this.load.image('MANA_ICON', ASSET_PATHS.ITEMS.MANA_ICON);
        const placeholderSlots = {
            SLOT_HEAD: 'assets/sprites/icons/slot-head-placeholder.png',
            SLOT_ACCESSORY: 'assets/sprites/icons/slot-accessory-placeholder.png',
        };
        for (const key in placeholderSlots) if (!this.textures.exists(key)) this.load.image(key, placeholderSlots[key]);
        console.log("InventoryScene Preload End");
    }

    create() {
        console.log("InventoryScene Create Start");
        this.initializeScene();
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

        // Display the initial tab (which will create its dynamic content)
        this.setActiveTab(this.currentTab);

        console.log("InventoryScene Create End");
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
                    } else { console.warn("Skipping listener attachment for invalid/destroyed equip item background."); }
                });
            }, [], this);
        }

        this.equipmentListContainer.updateMaxScroll();
        this.equipmentListContainer.setVisible(true);
    }

    // createEquipmentSlotsDisplay should be called ONCE in create()
    createEquipmentSlotsDisplay(container) { /* ... Keep as is ... */
        if (!container) { console.error("Equipment slots container is invalid in createEquipmentSlotsDisplay."); return; }
        const slotSize = 60; const slotSpacing = 15;
        const slots = ['head', 'body', 'weapon', 'shield', 'accessory1', 'accessory2']; // Example slots
        const panelWidth = 220; const panelHeight = (slots.length * (slotSize + slotSpacing)) + slotSpacing;
        const panel = this.ui.createPanel(0, 0, panelWidth, panelHeight, {fillColor: 0x111111, fillAlpha: 0.6});
        if(panel?.container) container.add(panel.container);

        const startY = -((slots.length * (slotSize + slotSpacing)) - slotSpacing) / 2 + slotSize/2;
        this.equipmentSlotsDisplay = {};

        slots.forEach((slotKey, index) => {
            const y = startY + index * (slotSize + slotSpacing);
            const labelX = -panelWidth/2 + 10;
            const itemX = panelWidth/2 - slotSize/2 - 10;

            const label = this.add.text(labelX, y, slotKey.charAt(0).toUpperCase() + slotKey.slice(1) + ':', { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#cccccc' }).setOrigin(0, 0.5);
            const slotBg = this.add.rectangle(itemX, y, slotSize, slotSize, 0x222222, 0.8).setStrokeStyle(1, 0x555555).setOrigin(0.5);
            const icon = this.add.image(itemX, y, '').setDisplaySize(slotSize * 0.8, slotSize * 0.8).setOrigin(0.5).setVisible(false);
            const nameText = this.add.text(itemX, y + slotSize / 2 + 10, '', { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#ffffff', align: 'center' }).setOrigin(0.5);

            this.equipmentSlotsDisplay[slotKey] = { bg: slotBg, icon: icon, nameText: nameText, label: label };
            container.add([label, slotBg, icon, nameText]);
        });

        this.updateEquipmentSlotsDisplay(); // Initial population
    }

    // updateEquipmentSlotsDisplay - unchanged, but called more deliberately
    updateEquipmentSlotsDisplay() { /* ... Keep as is ... */
         if (!this.equipmentSlotsDisplay || Object.keys(this.equipmentSlotsDisplay).length === 0) {
            // console.warn("Equipment slot display not initialized or empty when trying to update.");
            return; // Don't try to update if not ready
         }
        const equipped = gameState.player.inventory.equipped || {};

        for (const slotKey in this.equipmentSlotsDisplay) {
            const slotDisplay = this.equipmentSlotsDisplay[slotKey];
            if (!slotDisplay || !slotDisplay.bg || !slotDisplay.icon || !slotDisplay.nameText) {
                 console.warn(`Display elements missing for slotKey: ${slotKey} during update`);
                 continue;
            }

            const equippedItemId = equipped[slotKey];

            if (equippedItemId) {
                const itemData = getItemData(equippedItemId);
                if (itemData) {
                    let iconKey = itemData.iconKey;
                    let slotIconKey = '';
                    if (itemData.equipSlot === 'weapon' && itemData.category === 'Sharps') slotIconKey = 'SLOT_MELEE_WEAPON';
                    else if (itemData.equipSlot === 'weapon' && itemData.category === 'Branches') slotIconKey = 'SLOT_WAND';
                    else if (itemData.equipSlot === 'body') slotIconKey = 'SLOT_ARMOUR';
                    else if (itemData.equipSlot === 'head') slotIconKey = 'SLOT_HEAD';
                    else if (itemData.equipSlot && itemData.equipSlot.startsWith('accessory')) slotIconKey = 'SLOT_ACCESSORY';

                    if (slotIconKey && this.textures.exists(slotIconKey)) iconKey = slotIconKey;
                    else if (!this.textures.exists(iconKey)) iconKey = '';

                    if (iconKey) {
                        slotDisplay.icon.setTexture(iconKey); // This is where the error happened
                        slotDisplay.icon.setVisible(true).setAlpha(1); // Reset alpha
                    } else {
                        slotDisplay.icon.setVisible(false);
                    }
                    slotDisplay.nameText.setText(itemData.inGameName);
                    slotDisplay.bg.setStrokeStyle(2, 0xaaaaff);
                } else {
                    slotDisplay.icon.setVisible(false);
                    slotDisplay.nameText.setText('Error!');
                    slotDisplay.bg.setStrokeStyle(1, 0xff0000);
                }
            } else {
                let placeholderKey = '';
                if(slotKey === 'head') placeholderKey = 'SLOT_HEAD';
                else if (slotKey.startsWith('accessory')) placeholderKey = 'SLOT_ACCESSORY';
                 // ... other placeholders

                if (placeholderKey && this.textures.exists(placeholderKey)) {
                     slotDisplay.icon.setTexture(placeholderKey);
                     slotDisplay.icon.setVisible(true).setAlpha(0.5);
                } else {
                     slotDisplay.icon.setVisible(false);
                }
                slotDisplay.nameText.setText('(Empty)');
                slotDisplay.bg.setStrokeStyle(1, 0x555555);
            }
        }
    }

    // equipItem - unchanged
    equipItem(itemId) { /* ... Keep as is ... */
        if (!gameState.player?.inventory) return;
        const itemData = getItemData(itemId);
        if (!itemData?.equipSlot) { console.warn(`Cannot equip item ${itemId}: No data or not equippable.`); return; }
        const slot = itemData.equipSlot;
        if (!gameState.player.inventory.equipped) gameState.player.inventory.equipped = {};
        gameState.player.inventory.equipped[slot] = itemId;
        console.log(`Equipped ${itemData.inGameName} to ${slot} slot.`);
        this.updateEquipmentSlotsDisplay();
        const slotToAnimate = this.equipmentSlotsDisplay[slot];
        if (slotToAnimate?.icon) this.playEquipAnimation(slotToAnimate.icon);
    }

    // playEquipAnimation - unchanged
    playEquipAnimation(targetIcon) { /* ... Keep as is ... */
         if (!targetIcon || !targetIcon.scene || targetIcon.scene !== this) return;
         const originalScaleX = targetIcon.scaleX; // Use current scale as base
         const originalScaleY = targetIcon.scaleY;
         targetIcon.setScale(originalScaleX * 1.5, originalScaleY * 1.5);
         targetIcon.setAlpha(0.5);
         this.tweens.add({ targets: targetIcon, scaleX: originalScaleX, scaleY: originalScaleY, alpha: 1, duration: 500, ease: 'Back.easeOut' });
    }

    // displayMaterialsTab - unchanged (except cleanup handled in setActiveTab)
    displayMaterialsTab() { /* ... Keep as is, BUT remove the initial this.materialsListContainer.destroy() line ... */
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const listWidth = width * 0.8; const listHeight = height * 0.55;
        const listX = width * 0.5; const listY = height * 0.5;

        this.materialsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 15, backgroundColor: 0x2e1a2e, borderColor: 0xbf7fbf });
        // No need to add to tabContentGroup if cleanup is manual

        const messageY = listY + listHeight / 2 + 30;
        // Store reference to the message for cleanup
        this.materialsInfoMessage = this.add.text(listX, messageY,
            "Crafting materials can be used at the Crafting Workshop.",
            { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#cccccc', align: 'center', fontStyle: 'italic'}
        ).setOrigin(0.5);

        const inventory = gameState.player.inventory.items || [];
        const materialItems = inventory.filter(itemInstance => { /* ... filter logic ... */
            const itemData = getItemData(itemInstance.itemId);
            return itemData && (itemData.type === 'material' || ['Armour', 'Branches', 'Sharps', 'Strings', 'Gem', 'Material'].includes(itemData.category));
        });

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