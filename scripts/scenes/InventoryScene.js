// ---- File: InventoryScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
// Panel import likely not needed directly if using ui.createPanel
// import Panel from '../ui/components/Panel.js';
import StatusBar from '../ui/components/StatusBar.js';
// ScrollableContainer needed for Materials tab
import ScrollableContainer from '../ui/components/ScrollableContainer.js';
import gameState from '../utils/gameState.js'; // Corrected path
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import items from '../data/items.js';
const { getItemData } = items;
import HealthManager from '../utils/HealthManager.js';
import BaseScene from './BaseScene.js';
import CharacterManager from '../utils/CharacterManager.js';
import { loadGame, saveGame } from '../utils/SaveLoadManager.js'; // Corrected path

class InventoryScene extends BaseScene {
    // --- constructor remains unchanged ---
    constructor() {
        super({ key: 'InventoryScene' });

        this.activeTab = 'Equipment';
        this.tabButtons = {};
        this.equipmentSlots = {};
        this.returnSceneKey = 'OverworldScene';

        // Dynamic content containers
        this.equipmentListContainer = null; // Basic container for equipment items
        this.equipmentListBackground = null; // Reference for equipment list background rect
        this.materialsListContainer = null;
        this.potionsListContainer = null; // Likely unused now
        this.potionsHpBar = null;
        this.potionsMpBar = null;
        this.materialsInfoMessage = null;

        // Potion tab elements
        this.potionDisplayGroup = null;
        this.hpPotionInfo = { text: null, button: null, data: null };
        this.manaPotionInfo = { text: null, button: null, data: null };
        this.isConsuming = false;

        // Static equipment/stats display elements
        this.equipmentSlotsContainer = null;
        this.equipmentStatsText = null;

        // UI Element references for shutdown
        this.sceneTitle = null;
        this.returnButtonInstance = null;

        // Pagination for Equipment Tab
        this.itemsPerPage = 6;
        this.currentPage = 1;
        this.totalPages = 1;
        this.pageText = null;
        this.prevButton = null;
        this.nextButton = null;

        // State flags
        this.isSwitchingTabs = false;

        // Data passed from previous scene
        this.dungeonData = null;
    }

    // --- init and preload remain unchanged ---
    init(data) {
        console.log(`[${this.constructor.name}] Init with data:`, data);
        this.dungeonData = data?.dungeonData;
        this.returnSceneKey = data?.returnSceneKey || gameState.previousScene || 'OverworldScene';
        console.log(`InventoryScene init - Will return/wake to ${this.returnSceneKey}`);
        loadGame();
        if (!gameState.player) {
            console.warn("No player data in gameState after load, initializing default.");
            gameState.player = { name: 'Hero', class: 'Warrior', level: 1, health: 100, maxHealth: 100, mana: 50, maxMana: 50, experience: 0, experienceToNextLevel: 100, gold: 0, inventory: { items: [], equipped: {}, maxItems: 50 } };
        }
        if (!gameState.player.inventory) gameState.player.inventory = { items: [], equipped: {}, maxItems: 50 };
        console.log('InventoryScene init - Final Inventory state:', { itemCount: gameState.player.inventory?.items?.length || 0, equipped: gameState.player.inventory?.equipped || {} });
    }
    preload() {
        console.log('InventoryScene Preload Start');
        if (!this.textures.exists('inventory-bg')) { const bgPath = ASSET_PATHS.BACKGROUNDS.INVENTORY || ASSET_PATHS.BACKGROUNDS.DEFAULT; if (bgPath) this.load.image('inventory-bg', bgPath); }
        const placeholders = { 'slot-body': ASSET_PATHS.ITEMS.SLOT_HEAD, 'slot-accessory': ASSET_PATHS.ITEMS.SLOT_ACCESSORY };
        for (const key in placeholders) { if (placeholders[key] && !this.textures.exists(key)) this.load.image(key, placeholders[key]); }
        if (items && items.itemDatabase) { Object.values(items.itemDatabase).forEach(item => { if (item.iconKey && !this.textures.exists(item.iconKey)) { let path = ASSET_PATHS.EQUIPMENT[item.iconKey] || ASSET_PATHS.ITEMS[item.iconKey] || ASSET_PATHS.MATERIALS[item.iconKey]; if (path) this.load.image(item.iconKey, path); } }); }
        console.log('InventoryScene Preload End');
    }

    // --- create remains unchanged ---
    create() {
        console.log(`[${this.constructor.name}] Create Start`);
        this.initializeScene();

        const { width, height } = this.scale;
        console.log(`${this.scene.key} Create - Initial camera dimensions: W=${width}, H=${height}`);

        if (!gameState.player || !gameState.player.inventory) {
             console.error("InventoryScene Create Error: Player data or inventory not found.");
             navigationManager.navigateTo(this, this.returnSceneKey || 'OverworldScene');
             return;
        }
        console.log('InventoryScene create - Inventory state:', gameState.player.inventory);

        const bgPathKey = 'inventory-bg';
        if (this.textures.exists(bgPathKey)) this.add.image(width / 2, height / 2, bgPathKey).setDisplaySize(width, height).setDepth(0);
        else this.add.rectangle(width / 2, height / 2, width, height, 0x100510).setDepth(0);

        this.sceneTitle = this.ui.createTitle(width / 2, height * 0.08, 'Inventory', { fontSize: this.ui.fontSize.lg });
         if (this.sceneTitle?.background) this.sceneTitle.background.setDepth(1);
         if (this.sceneTitle) this.sceneTitle.setDepth(2);

        console.log("InventoryScene Create - Calling createTabs...");
        this.createTabs();

        console.log("InventoryScene Create - Calling createReturnButton...");
        this.returnButtonInstance = this.createReturnButton();
        if (this.returnButtonInstance?.container) this.returnButtonInstance.container.setDepth(100);
        else console.error("Return button failed creation.");

        console.log("InventoryScene Create - Creating equipment slots container...");
        this.equipmentSlotsContainer = this.add.container(width * 0.75, height * 0.5); // Position on the right
        this.createEquipmentSlotsDisplay(this.equipmentSlotsContainer);

        this.updateEquipmentSlotsDisplay();
        this.updateTotalStatsDisplay();

        if (this.equipmentSlotsContainer) this.equipmentSlotsContainer.setVisible(this.activeTab === 'Equipment');

        console.log(`InventoryScene Create - Setting initial active tab: ${this.activeTab}`);
        this.setActiveTab(this.activeTab);

        if (this.transitions) { this.time.delayedCall(50, () => { if (this && this.scene && this.sys.isActive()) this.transitions.fadeIn(); else console.warn(`Scene ${this.scene?.key} inactive before delayed fadeIn.`); }); }
        else { console.warn(`TransitionManager not found in ${this.scene.key}.`); }

        console.log(`[${this.constructor.name}] Create End`);
    }

    createReturnButton() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonX = width / 2;
        const buttonY = height * 0.92;
        console.log(`[createReturnButton] Camera dimensions: width=${width}, height=${height}`);
        console.log(`[createReturnButton] Calculated button position: x=${buttonX.toFixed(0)}, y=${buttonY.toFixed(0)}`);
        if (width === 0 || height === 0) console.error("[createReturnButton] CRITICAL: Camera dimensions are zero!");

        const button = this.ui.createButton( buttonX, buttonY, 'Return', () => {
            console.log('[InventoryScene] Return button CLICKED!');
            this.safePlaySound('button-click');
            const dataToReturn = { fromInventory: true }; // Data to pass if needed
            try {
                // --- FIX: Use scene.start() to return because OverworldScene was stopped ---
                console.log(`[InventoryScene] Starting scene: ${this.returnSceneKey}`);
                // Stop this scene BEFORE starting the next one cleanly
                this.scene.stop();
                // Start the target scene (OverworldScene in this case)
                this.scene.start(this.returnSceneKey, dataToReturn);
                // --- END FIX ---

            } catch (e) {
                console.error("[InventoryScene Return Error]", e);
                 // Fallback navigation
                 try {
                    this.scene.stop();
                    this.scene.start('OverworldScene');
                 } catch (finalError) {
                      console.error("[InventoryScene Critical Error] Failed fallback navigation:", finalError);
                 }
            }
        }, { width: 180, height: 50 });

        console.log("[createReturnButton] Button instance created:", button);
        if (!button || !button.container) console.error("[createReturnButton] CRITICAL: Button creation failed!");
        else console.log(`[createReturnButton] Button container pos: x=${button.container.x.toFixed(0)}, y=${button.container.y.toFixed(0)}`);
        return button;
    }
    // --- createTabs unchanged ---
    createTabs() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const tabY = height * 0.18;
        const tabs = ['Equipment', 'Materials', 'Potions'];
        const tabWidth = 150; const tabSpacing = 20;
        const startX = (width / 2) - ((tabs.length * (tabWidth + tabSpacing)) - tabSpacing) / 2;
        this.tabButtons = {};
        tabs.forEach((tabName, index) => {
            const tabButton = this.ui.createButton( startX + index * (tabWidth + tabSpacing) + tabWidth/2, tabY, tabName, () => this.setActiveTab(tabName), { width: tabWidth, height: 40, fontSize: this.ui.fontSize.sm });
            if (tabButton?.container) tabButton.container.setDepth(50);
            this.tabButtons[tabName] = tabButton;
        });
    }
    // --- updateTabDisplay unchanged ---
    updateTabDisplay() { if (!this.tabButtons) return; Object.entries(this.tabButtons).forEach(([tabName, button]) => { if (button?.setActive) button.setActive(tabName === this.activeTab); }); }
    // --- setActiveTab unchanged ---
     setActiveTab(tabName) {
        if (!this.tabButtons || !this.tabButtons[tabName]) { console.warn(`Invalid tab switch request: ${tabName}`); return; }
        if (this.isSwitchingTabs) return;
        this.isSwitchingTabs = true; this.activeTab = tabName; this.updateTabDisplay();
        this.destroyEquipmentTabUI();
        if (this.materialsListContainer) { this.materialsListContainer.destroy(); this.materialsListContainer = null; }
        if (this.potionDisplayGroup) { this.potionDisplayGroup.destroy(true); this.potionDisplayGroup = null; }
        if (this.potionsHpBar) { this.potionsHpBar.destroy(); this.potionsHpBar = null; }
        if (this.potionsMpBar) { this.potionsMpBar.destroy(); this.potionsMpBar = null; }
        if (this.materialsInfoMessage) { this.materialsInfoMessage.destroy(); this.materialsInfoMessage = null; }
        this.equipmentSlotsContainer?.setVisible(tabName === 'Equipment');
        this.time.delayedCall(1, () => {
             if (!this.isSwitchingTabs || this.activeTab !== tabName) return;
             console.log(`[setActiveTab Delayed] Displaying content for ${tabName}`);
             switch (tabName) {
                 case 'Equipment': this.displayEquipmentTab(); break;
                 case 'Materials': this.displayMaterialsTab(); break;
                 case 'Potions': this.displayPotionsTab(); break;
             }
             console.log(`[setActiveTab Delayed] Finished displaying ${tabName}`);
             this.isSwitchingTabs = false;
        });
    }
    // --- destroyEquipmentTabUI unchanged ---
    destroyEquipmentTabUI() {
        if (this.equipmentListContainer) { this.equipmentListContainer.destroy(); this.equipmentListContainer = null; }
        if (this.equipmentListBackground) { this.equipmentListBackground.destroy(); this.equipmentListBackground = null; } // Destroy background too
        if (this.prevButton) { this.prevButton.destroy(); this.prevButton = null; }
        if (this.pageText) { this.pageText.destroy(); this.pageText = null; }
        if (this.nextButton) { this.nextButton.destroy(); this.nextButton = null; }
    }

    // --- Content Display Functions ---

    // ---- **** MODIFIED displayEquipmentTab() **** ----
    displayEquipmentTab() {
        console.log("[displayEquipmentTab] Creating Equipment Tab UI...");
        const { width, height } = this.scale;

        // Ensure static elements are visible and updated
        this.equipmentSlotsContainer?.setVisible(true);
        this.updateEquipmentSlotsDisplay();
        this.updateTotalStatsDisplay();

        // --- Define Layout ---
        const listWidth = width * 0.45; // Make list slightly wider
        const listHeight = height * 0.6;
        const listMarginLeft = width * 0.05; // Margin from left edge
        const listX = listMarginLeft; // Position based on left margin
        const listY = height * 0.25;
        const paginationY = listY + listHeight + 25;
        const pageTextX = listX + listWidth / 2; // Center text within the list width
        // --- End Layout ---

        // Clean up old elements if they exist (should be handled by setActiveTab, but belt-and-suspenders)
        this.destroyEquipmentTabUI();

        // --- Create Background Rectangle (Added to Scene) ---
        this.equipmentListBackground = this.add.rectangle(
            listX, listY, listWidth, listHeight,
            0x1a1a2e, // Dark background color
            0.7       // Semi-transparent
        ).setOrigin(0, 0).setStrokeStyle(1, 0x4a4a5e); // Optional border
        this.equipmentListBackground.setDepth(5); // Ensure it's behind list items
        // --- End Background ---

        // Create container for list items (positioned relative to scene)
        this.equipmentListContainer = this.add.container(listX, listY);
        this.equipmentListContainer.setSize(listWidth, listHeight); // For reference, container size adjusts to children
        this.equipmentListContainer.setDepth(10); // Ensure items are above background

        // --- Create Pagination Controls (Added directly to the Scene) ---
        this.prevButton = this.ui.createButton(pageTextX - 80, paginationY, '<', () => this.previousPage(), { width: 50, height: 30, fontSize: this.ui.fontSize.sm });
        this.pageText = this.add.text(pageTextX, paginationY, 'Page 1 / 1', { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0.5);
        this.nextButton = this.ui.createButton(pageTextX + 80, paginationY, '>', () => this.nextPage(), { width: 50, height: 30, fontSize: this.ui.fontSize.sm });

         // Set depth for pagination controls
         if (this.prevButton?.container) this.prevButton.container.setDepth(60);
         if (this.pageText) this.pageText.setDepth(60);
         if (this.nextButton?.container) this.nextButton.container.setDepth(60);
        // --- End Pagination ---

        // Reset pagination and populate the first page
        this.currentPage = 1;
        this.populateEquipmentList(); // Populates items into the container
        console.log("[displayEquipmentTab] Equipment Tab UI created.");
    }

    // --- getFilteredAndSortedItems unchanged ---
    getFilteredAndSortedItems() {
        let items = gameState.player?.inventory?.items || [];
        items = items.filter(itemInstance => {
            if (!itemInstance?.itemId) return false;
            const itemData = getItemData(itemInstance.itemId);
            return itemData && itemData.equipSlot && ['body', 'accessory', 'weapon'].includes(itemData.equipSlot);
        });
        // Add sorting logic here if needed
        return items;
    }

    // --- populateEquipmentList unchanged ---
    populateEquipmentList() {
        if (!gameState.player?.inventory || !this.equipmentListContainer) { console.error("[populateEquipmentList] Error: Elements not initialized"); return; }
        // console.log(`[populateEquipmentList] Populating page ${this.currentPage}`);

        const childrenToRemove = this.equipmentListContainer.list.slice(0);
        if(childrenToRemove.length > 0) this.equipmentListContainer.remove(childrenToRemove, true);

        let filteredItems = this.getFilteredAndSortedItems();
        const totalItems = filteredItems.length;
        this.totalPages = Math.ceil(totalItems / this.itemsPerPage) || 1;
        this.currentPage = Phaser.Math.Clamp(this.currentPage, 1, this.totalPages);
        // console.log(`[populateEquipmentList] Total Items: ${totalItems}, Total Pages: ${this.totalPages}, Current Page: ${this.currentPage}`);

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const itemsToShow = filteredItems.slice(startIndex, endIndex);
        // console.log(`[populateEquipmentList] Showing items ${startIndex} to ${endIndex - 1}`);

        const listWidth = this.equipmentListContainer.width || (this.scale.width * 0.45); // Use container's intended width
        const itemHeight = 40;
        const padding = 10;

        if (itemsToShow.length === 0) {
             const noItemsText = this.add.text(listWidth / 2, 50, 'No equipment found.', { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#aaaaaa' }).setOrigin(0.5);
             this.equipmentListContainer.add(noItemsText); // Add to the container
        } else {
             itemsToShow.forEach((itemInstance, index) => {
                 const itemData = getItemData(itemInstance.itemId);
                 if (!itemData) { console.warn(`Skipping item ID: ${itemInstance.itemId}`); return; }

                 // Position items relative to the container's origin (top-left)
                 const yPos = padding + index * (itemHeight + 5);
                 const itemRow = this.add.container(padding, yPos); // X starts at padding

                 const rowWidth = listWidth - padding * 2;
                 const itemBg = this.add.rectangle(0, 0, rowWidth, itemHeight, 0x2a2a3e, 0).setOrigin(0, 0);
                 const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5);
                 let statsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join(', ') : '';
                 const statsText = this.add.text(rowWidth - 10, itemHeight / 2, statsString, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.xs, fill: '#aaffaa', align: 'right' }).setOrigin(1, 0.5);

                 itemRow.add([itemBg, nameText, statsText]);
                 itemRow.setSize(rowWidth, itemHeight);

                 itemRow.setInteractive(new Phaser.Geom.Rectangle(0, 0, rowWidth, itemHeight), Phaser.Geom.Rectangle.Contains)
                     .on('pointerover', () => itemBg.setFillStyle(0x3a3a4e, 0.7))
                     .on('pointerout', () => itemBg.setFillStyle(0x2a2a3e, 0))
                     .on('pointerdown', (pointer) => { pointer.event.stopPropagation(); this.safePlaySound('button-click', { volume: 0.3 }); this.equipItem(itemInstance.itemId); });

                 this.equipmentListContainer.add(itemRow);
             });
        }
        this.updatePaginationControls();
    }

    // --- updatePaginationControls, previousPage, nextPage unchanged ---
    updatePaginationControls() {
        if (!this.pageText || !this.prevButton || !this.nextButton) return;
        this.pageText.setText(`Page ${this.currentPage} / ${this.totalPages}`);
        const canGoPrev = this.currentPage > 1;
        this.prevButton.enable(canGoPrev); if (this.prevButton.container) this.prevButton.container.setAlpha(canGoPrev ? 1 : 0.5);
        const canGoNext = this.currentPage < this.totalPages;
        this.nextButton.enable(canGoNext); if (this.nextButton.container) this.nextButton.container.setAlpha(canGoNext ? 1 : 0.5);
        const showControls = this.totalPages > 1;
        if (this.prevButton.container) this.prevButton.container.setVisible(showControls);
        if (this.pageText) this.pageText.setVisible(showControls);
        if (this.nextButton.container) this.nextButton.container.setVisible(showControls);
    }
    previousPage() { if (this.currentPage > 1) { this.currentPage--; this.safePlaySound('button-click'); this.populateEquipmentList(); } }
    nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.safePlaySound('button-click'); this.populateEquipmentList(); } }

    // --- createEquipmentSlotsDisplay, updateEquipmentSlotsDisplay, updateTotalStatsDisplay unchanged ---
    createEquipmentSlotsDisplay(container) {
        const panelWidth = 240; const panelHeight = 350;
        try { const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x111111, 0.6).setStrokeStyle(1, 0x333333); container.add(panel); } catch (e) { /*...*/ }
        const slotData = [ { key: 'body', name: 'Armour', x: 0, y: -80, placeholderTexture: 'slot-body' }, { key: 'accessory', name: 'Accessory/Weapon', x: 0, y: 20, placeholderTexture: 'slot-accessory' }];
        this.equipmentSlots = {};
        slotData.forEach(slot => {
             try {
                 const slotContainer = this.add.container(slot.x, slot.y);
                 const slotBorder = this.add.rectangle(0, 0, 64, 64, 0x222222, 0.8).setStrokeStyle(1, 0x555555);
                 const iconDisplay = this.add.image(0, 0, slot.placeholderTexture).setScale(0.8); if (!this.textures.exists(slot.placeholderTexture)) iconDisplay.setVisible(false);
                 const label = this.add.text(0, 45, slot.name, { fontSize: '11px', fill: '#ffffff', align: 'center', wordWrap: { width: 70 }, lineSpacing: 4 }).setOrigin(0.5);
                 slotContainer.add([slotBorder, iconDisplay, label]); container.add(slotContainer);
                 this.equipmentSlots[slot.key] = { container: slotContainer, iconDisplay, border: slotBorder, label, placeholderTexture: slot.placeholderTexture, name: slot.name };
                 slotBorder.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.unequipItem(slot.key));
             } catch (e) { /*...*/ }
        });
        const statsY = panelHeight / 2 - 40;
        if (this.equipmentStatsText) this.equipmentStatsText.destroy();
        try { this.equipmentStatsText = this.add.text(0, statsY, '', { fontSize: '12px', fill: '#aaffaa', align: 'center', lineSpacing: 4 }).setOrigin(0.5); if (container) container.add(this.equipmentStatsText); else { /*...*/ } } catch (e) { /*...*/ this.equipmentStatsText = null; }
        this.updateTotalStatsDisplay();
    }
    updateEquipmentSlotsDisplay() {
        if (!this.equipmentSlots) return; const equipped = gameState.player?.inventory?.equipped || {};
        Object.entries(this.equipmentSlots).forEach(([slotKey, elements]) => {
            if (!elements || !elements.iconDisplay || !elements.label || !elements.border) return;
            let itemIdToDisplay = null; let itemData = null;
            if (slotKey === 'body' && equipped.body) itemIdToDisplay = equipped.body; else if (slotKey === 'accessory') itemIdToDisplay = equipped.weapon || equipped.accessory;
            if (itemIdToDisplay) itemData = getItemData(itemIdToDisplay);
            if (itemData) { const itemIconKey = itemData.iconKey; if (itemIconKey && this.textures.exists(itemIconKey)) { if (elements.iconDisplay.texture.key !== itemIconKey) elements.iconDisplay.setTexture(itemIconKey); elements.iconDisplay.setVisible(true).setScale(0.8); } else { if (this.textures.exists(elements.placeholderTexture)) { if (elements.iconDisplay.texture.key !== elements.placeholderTexture) elements.iconDisplay.setTexture(elements.placeholderTexture); elements.iconDisplay.setVisible(true).setScale(0.8); } else elements.iconDisplay.setVisible(false); } let effectsString = itemData.effects ? Object.entries(itemData.effects).map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`).join('\n') : ''; elements.label.setText(`${itemData.inGameName}\n${effectsString}`).setFontSize('11px').setLineSpacing(4).setY(45); elements.border.setStrokeStyle(2, 0xaaaaff); }
            else { if (this.textures.exists(elements.placeholderTexture)) { if (elements.iconDisplay.texture.key !== elements.placeholderTexture) elements.iconDisplay.setTexture(elements.placeholderTexture); elements.iconDisplay.setVisible(true).setScale(0.8); } else elements.iconDisplay.setVisible(false); elements.label.setText(elements.name).setFontSize('14px').setLineSpacing(0).setY(40); elements.border.setStrokeStyle(1, 0x555555); }
        });
    }
     updateTotalStatsDisplay() {
        if (!this.equipmentStatsText || !this.equipmentStatsText.active) return;
        const player = gameState.player; const equipped = player?.inventory?.equipped || {};
        const currentAttack = player?.currentAttack || 0; const currentMagicAttack = player?.currentMagicAttack || 0; const currentDefense = player?.currentDefense || 0;
        let attackStatLabel = "Attack"; let attackStatValue = currentAttack;
        const weaponId = equipped.weapon; if (weaponId) { const weaponData = getItemData(weaponId); if (weaponData?.effects?.hasOwnProperty('magicAttack')) { attackStatLabel = "Magic Atk"; attackStatValue = currentMagicAttack; } }
        this.equipmentStatsText.setText(`${attackStatLabel}: ${attackStatValue}\nDefense: ${currentDefense}`);
    }

    // --- equipItem, unequipItem, playEquipAnimation unchanged ---
     equipItem(itemId) {
        if (!gameState.player?.inventory) return; const itemData = getItemData(itemId); if (!itemData?.equipSlot || !['body', 'weapon', 'accessory'].includes(itemData.equipSlot)) return;
        const intendedSlot = itemData.equipSlot; const equipped = gameState.player.inventory.equipped; let itemToReturnToInventoryId = null;
        if (intendedSlot === 'body') { if (equipped.body) itemToReturnToInventoryId = equipped.body; equipped.body = null; }
        else { if (equipped.weapon) itemToReturnToInventoryId = equipped.weapon; else if (equipped.accessory) itemToReturnToInventoryId = equipped.accessory; equipped.weapon = null; equipped.accessory = null; }
        const itemIndexInInventory = gameState.player.inventory.items.findIndex(invItem => String(invItem?.itemId) === String(itemId)); if (itemIndexInInventory === -1) { console.error(`Item ${itemId} not found.`); return; }
        gameState.player.inventory.items.splice(itemIndexInInventory, 1); equipped[intendedSlot] = itemId;
        if (itemToReturnToInventoryId) gameState.player.inventory.items.push({ itemId: itemToReturnToInventoryId, quantity: 1 });
        CharacterManager.recalculatePlayerStats(); this.updateEquipmentSlotsDisplay(); this.updateTotalStatsDisplay(); this.populateEquipmentList();
        const targetDisplaySlotKey = (intendedSlot === 'body') ? 'body' : 'accessory'; const slotElements = this.equipmentSlots[targetDisplaySlotKey]; if (slotElements?.iconDisplay?.active) this.playEquipAnimation(slotElements.iconDisplay); saveGame();
    }
    unequipItem(slotKey) {
        if (!gameState.player?.inventory?.equipped) return; const equipped = gameState.player.inventory.equipped; let itemIdToUnequip = null; let actualSlotUnequipped = null;
        if (slotKey === 'body' && equipped.body) { itemIdToUnequip = equipped.body; equipped.body = null; actualSlotUnequipped = 'body'; }
        else if (slotKey === 'accessory') { if (equipped.weapon) { itemIdToUnequip = equipped.weapon; equipped.weapon = null; actualSlotUnequipped = 'weapon'; } else if (equipped.accessory) { itemIdToUnequip = equipped.accessory; equipped.accessory = null; actualSlotUnequipped = 'accessory'; } }
        if (itemIdToUnequip) { console.log(`Unequipping item ${itemIdToUnequip} from state slot ${actualSlotUnequipped}`); if (!gameState.player.inventory.items) gameState.player.inventory.items = []; gameState.player.inventory.items.push({ itemId: itemIdToUnequip, quantity: 1 }); this.safePlaySound('button-click', { volume: 0.2 }); CharacterManager.recalculatePlayerStats(); this.updateEquipmentSlotsDisplay(); this.updateTotalStatsDisplay(); this.populateEquipmentList(); saveGame(); }
        else { console.log(`Nothing to unequip in visual slot: ${slotKey}`); }
    }
    playEquipAnimation(targetIcon) { if (!targetIcon || typeof targetIcon.setScale !== 'function' || !targetIcon.scene || !targetIcon.active) return; const finalScaleX = targetIcon.scaleX || 1; const finalScaleY = targetIcon.scaleY || 1; targetIcon.setScale(finalScaleX * 1.5, finalScaleY * 1.5).setAlpha(0.5); this.tweens.add({ targets: targetIcon, scaleX: finalScaleX, scaleY: finalScaleY, alpha: 1, duration: 300, ease: 'Back.easeOut' }); }


    // --- displayMaterialsTab, displayPotionsTab, createPotionCard, getPotionQuantity, consumePotion, canConsumePotion, updatePotionDisplaysAndBars, updateConsumeButtonStates, showTemporaryFeedback unchanged ---
     displayMaterialsTab() {
        const { width, height } = this.scale; const listWidth = width * 0.8; const listHeight = height * 0.55; const listX = width * 0.5; const listY = height * 0.5;
        if (this.materialsListContainer) this.materialsListContainer.destroy();
        this.materialsListContainer = new ScrollableContainer(this, listX, listY, listWidth, listHeight, { padding: 15, backgroundColor: 0x2e1a2e, borderColor: 0xbf7fbf });
        if (!this.materialsListContainer?.valid) return;
        const messageY = listY + listHeight / 2 + 30; if (this.materialsInfoMessage) this.materialsInfoMessage.destroy();
        this.materialsInfoMessage = this.add.text(listX, messageY, "Crafting materials...", { /* styles */ }).setOrigin(0.5);
        const inventory = gameState.player.inventory.items || []; const materialItems = inventory.filter(itemInstance => getItemData(itemInstance?.itemId)?.type === 'material');
        if (materialItems.length === 0) this.materialsListContainer.addText('No materials found.', { /* styles */ });
        else { materialItems.forEach((itemInstance, index) => { const itemData = getItemData(itemInstance.itemId); if (!itemData) return; const itemHeight = 30; const iconSize = 24; const itemY = index * (itemHeight + 5); const itemRow = this.add.container(0, 0); if (itemData.iconKey && this.textures.exists(itemData.iconKey)) { const icon = this.add.image(10 + iconSize/2, itemHeight / 2, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5); itemRow.add(icon); } const text = `${itemData.inGameName} x${itemInstance.quantity}`; const textObject = this.add.text(10 + iconSize + 10, itemHeight / 2, text, { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm, fill: '#ffffff' }).setOrigin(0, 0.5); itemRow.add(textObject); this.materialsListContainer.addItem(itemRow, itemY); }); }
        this.materialsListContainer.updateMaxScroll(); this.materialsListContainer.setVisible(true);
    }
    displayPotionsTab() {
        const { width, height } = this.scale;
        const barWidth = 250;
        const barX = width * 0.5;
        const hpBarY = height * 0.3;
        const mpBarY = hpBarY + 40;
    
        if (this.potionsHpBar) { this.potionsHpBar.destroy(); this.potionsHpBar = null; }
        if (this.potionsMpBar) { this.potionsMpBar.destroy(); this.potionsMpBar = null; }
    
        // --- FIX IS HERE ---
        // Explicit options for HP Bar
        this.potionsHpBar = this.ui.createStatusBar(
            barX, hpBarY,
            gameState.player.health, gameState.player.maxHealth,
            {
                width: barWidth, height: 20,
                barColor: 0x00ff00, // Green
                textPrefix: 'HP',   // HP Prefix
                fontFamily: "'Press Start 2P'", fontSize: this.ui?.fontSize?.sm || 12
            }
        );
    
        // Explicit options for MP Bar
        this.potionsMpBar = this.ui.createStatusBar(
            barX, mpBarY,
            gameState.player.mana, gameState.player.maxMana,
            {
                width: barWidth, height: 20,
                barColor: 0x3399ff, // Blue
                textPrefix: 'MP',   // MP Prefix
                fontFamily: "'Press Start 2P'", fontSize: this.ui?.fontSize?.sm || 12
            }
        );
        // --- END FIX ---
    
        if (this.potionDisplayGroup) { this.potionDisplayGroup.destroy(true); this.potionDisplayGroup = null; }
        this.potionDisplayGroup = this.add.group();
    
        const potionAreaWidth = width * 0.7; const potionAreaHeight = height * 0.45; const potionAreaX = width * 0.5; const potionAreaY = height * 0.65; const cardWidth = potionAreaWidth * 0.45; const cardHeight = potionAreaHeight * 0.9; const spacingX = potionAreaWidth * 0.05; const hpCardX = potionAreaX - spacingX / 2 - cardWidth / 2; const mpCardX = potionAreaX + spacingX / 2 + cardWidth / 2; const cardY = potionAreaY;
    
        this.createPotionCard('hp-potion', hpCardX, cardY, cardWidth, cardHeight, this.hpPotionInfo);
        this.createPotionCard('mana-potion', mpCardX, cardY, cardWidth, cardHeight, this.manaPotionInfo);
        this.updateConsumeButtonStates();
    }
    createPotionCard(itemId, x, y, width, height, infoObject) { /* Function unchanged */ const itemData = getItemData(itemId); if (!itemData) return; infoObject.data = itemData; const panel = this.ui.createPanel(x, y, width, height, {}); if (!this.potionDisplayGroup) this.potionDisplayGroup = this.add.group(); this.potionDisplayGroup.add(panel.container); const iconSize = 40; const contentTopMargin = 25; const iconTextSpacing = 15; const textBlockLineHeight = 18; const textBlockHeight = textBlockLineHeight * 3; const buttonHeightForLayout = 40; const buttonBottomMargin = 20; const iconY = -height * 0.5 + contentTopMargin + iconSize / 2; const textStartY = iconY + iconSize / 2 + iconTextSpacing; const buttonY = height * 0.5 - buttonBottomMargin - buttonHeightForLayout / 2; if (itemData.iconKey && this.textures.exists(itemData.iconKey)) { const icon = this.add.image(0, iconY, itemData.iconKey).setDisplaySize(iconSize, iconSize).setOrigin(0.5); panel.add(icon); this.potionDisplayGroup.add(icon); } const quantity = this.getPotionQuantity(itemId); const effectValue = itemData.potionEffect?.value || '?'; const effectStat = itemData.potionEffect?.stat?.toUpperCase() || '???'; const effectText = `Restores ${effectValue} ${effectStat}`; const infoStr = `${itemData.inGameName}\nQuantity: ${quantity}\n${effectText}`; infoObject.text = this.add.text(0, textStartY, infoStr, { fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: '#ffffff', align: 'center', lineSpacing: 6 }).setOrigin(0.5, 0); panel.add(infoObject.text); this.potionDisplayGroup.add(infoObject.text); infoObject.button = this.ui.createButton(0, buttonY, 'Consume', () => this.consumePotion(itemId), { width: width * 0.7, height: buttonHeightForLayout, fontSize: this.ui?.fontSize?.sm || 12 }); panel.add(infoObject.button.container); this.potionDisplayGroup.add(infoObject.button.container); const canConsume = this.canConsumePotion(itemId) && !this.isConsuming; if (infoObject.button) { infoObject.button.enable(canConsume); if(infoObject.button.container) infoObject.button.container.setAlpha(canConsume ? 1 : 0.5); } }
    getPotionQuantity(itemId) { const itemInstance = gameState.player?.inventory?.items?.find(invItem => invItem.itemId === itemId); return itemInstance ? itemInstance.quantity : 0; }
    consumePotion(itemId) { if (this.isConsuming || !this.canConsumePotion(itemId)) return; this.isConsuming = true; this.safePlaySound('button-click'); const itemData = getItemData(itemId); if (!itemData?.potionEffect) { this.isConsuming = false; return; } const { stat, value } = itemData.potionEffect; const player = gameState.player; let success = false; let message = ""; if (stat === 'health') { const needed = player.maxHealth - player.health; if (needed <= 0) message = "Health full!"; else { const healed = Math.min(needed, value); HealthManager.updatePlayerHealth(healed, true); success = true; message = `+${healed} HP.`; } } else if (stat === 'mana') { const needed = player.maxMana - player.mana; if (needed <= 0) message = "Mana full!"; else { const restored = Math.min(needed, value); HealthManager.updatePlayerMana(restored, true); success = true; message = `+${restored} MP.`; } } else message = `Unknown effect: ${stat}`; this.showTemporaryFeedback(message, success ? '#aaffaa' : '#ffaaaa'); if (success) { this.safePlaySound('heal'); const itemIndex = player.inventory.items.findIndex(invItem => invItem.itemId === itemId); if (itemIndex > -1) { player.inventory.items[itemIndex].quantity -= 1; if (player.inventory.items[itemIndex].quantity <= 0) player.inventory.items.splice(itemIndex, 1); } this.updatePotionDisplaysAndBars(); saveGame(); } this.time.delayedCall(300, () => { this.isConsuming = false; this.updateConsumeButtonStates(); }); }
    canConsumePotion(itemId) { const quantity = this.getPotionQuantity(itemId); if (quantity <= 0) return false; const itemData = getItemData(itemId); if (!itemData?.potionEffect) return false; const player = gameState.player; if (!player) return false; if (itemData.potionEffect.stat === 'health') return player.health < player.maxHealth; else if (itemData.potionEffect.stat === 'mana') return player.mana < player.maxMana; return false; }
    updatePotionDisplaysAndBars() { if (this.potionsHpBar) this.potionsHpBar.update(gameState.player.health, gameState.player.maxHealth); if (this.potionsMpBar) this.potionsMpBar.update(gameState.player.mana, gameState.player.maxMana); if (this.hpPotionInfo.text && this.hpPotionInfo.data) { const q = this.getPotionQuantity('hp-potion'); this.hpPotionInfo.text.setText(`${this.hpPotionInfo.data.inGameName}\nQuantity: ${q}\nRestores ${this.hpPotionInfo.data.potionEffect?.value || '?'} HP`); } if (this.manaPotionInfo.text && this.manaPotionInfo.data) { const q = this.getPotionQuantity('mana-potion'); this.manaPotionInfo.text.setText(`${this.manaPotionInfo.data.inGameName}\nQuantity: ${q}\nRestores ${this.manaPotionInfo.data.potionEffect?.value || '?'} MP`); } this.updateConsumeButtonStates(); }
    updateConsumeButtonStates() { if (this.hpPotionInfo.button) { const can = this.canConsumePotion('hp-potion') && !this.isConsuming; this.hpPotionInfo.button.enable(can); if(this.hpPotionInfo.button.container) this.hpPotionInfo.button.container.setAlpha(can ? 1 : 0.5); } if (this.manaPotionInfo.button) { const can = this.canConsumePotion('mana-potion') && !this.isConsuming; this.manaPotionInfo.button.enable(can); if(this.manaPotionInfo.button.container) this.manaPotionInfo.button.container.setAlpha(can ? 1 : 0.5); } }
    showTemporaryFeedback(message, color = '#ffffff') { if (!this.ui || !this.cameras?.main) return; const {width, height} = this.scale; const feedbackText = this.add.text(width / 2, height - 40, message, { fontFamily: "'VT323'", fontSize: (this.ui?.fontSize?.sm || 12) + 'px', fill: color, backgroundColor: '#000000cc', padding: { x: 10, y: 5 }, align: 'center' }).setOrigin(0.5).setDepth(100); this.tweens?.add({ targets: feedbackText, alpha: 0, y: '-=20', delay: 1500, duration: 500, ease: 'Power1', onComplete: () => { if (feedbackText?.active) feedbackText.destroy(); } }); }

    // --- shutdown unchanged ---
    shutdown() {
        console.log(`[${this.constructor.name}] shutdown starting...`);
        this.destroyEquipmentTabUI(); // Destroys list, bg, pagination
        if (this.materialsListContainer) { this.materialsListContainer.destroy(); this.materialsListContainer = null; }
        if (this.potionDisplayGroup) { this.potionDisplayGroup.destroy(true); this.potionDisplayGroup = null; }
        if (this.potionsHpBar) { this.potionsHpBar.destroy(); this.potionsHpBar = null; }
        if (this.potionsMpBar) { this.potionsMpBar.destroy(); this.potionsMpBar = null; }
        if (this.materialsInfoMessage) { this.materialsInfoMessage.destroy(); this.materialsInfoMessage = null; }
        if (this.equipmentSlotsContainer) { this.equipmentSlotsContainer.destroy(true); this.equipmentSlotsContainer = null; }
        console.log("- Destroying tab buttons..."); Object.values(this.tabButtons).forEach(button => button?.destroy()); this.tabButtons = {};
        if (this.sceneTitle) { console.log("- Destroying scene title..."); if(this.sceneTitle.background) this.sceneTitle.background.destroy(); this.sceneTitle.destroy(); this.sceneTitle = null; }
        if (this.returnButtonInstance) { console.log("- Destroying return button..."); this.returnButtonInstance.destroy(); this.returnButtonInstance = null; }
        if (this.equipmentStatsText) { console.log("- Destroying equipment stats text..."); try { this.equipmentStatsText.destroy(); } catch (e) {} this.equipmentStatsText = null; }
        this.equipmentSlots = {}; this.hpPotionInfo = { text: null, button: null, data: null }; this.manaPotionInfo = { text: null, button: null, data: null }; this.isConsuming = false; this.isSwitchingTabs = false;
        console.log(`[${this.constructor.name}] shutdown cleanup complete.`);
        if (super.shutdown) super.shutdown();
    }

} // End of InventoryScene Class

export default InventoryScene;