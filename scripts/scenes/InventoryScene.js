import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

/**
 * InventoryScene - Scene for managing player's inventory and equipment
 */
class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InventoryScene' });
    }

    preload() {
        // Load inventory assets
        this.load.image('inventory-bg', 'https://labs.phaser.io/assets/skies/space1.png');
        this.load.image('item-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'inventory-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Inventory', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create tabs for different inventory sections
        this.createInventoryTabs();
        
        // Create the inventory grid
        this.createInventoryGrid();
        
        // Create the equipment display
        this.createEquipmentDisplay();
        
        // Create navigation buttons
        this.createNavigationButtons();
    }
    
    /**
     * Create tabs for different inventory sections
     */
    createInventoryTabs() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const tabY = height * 0.15;
        const tabWidth = 120;
        const tabHeight = 40;
        const tabSpacing = 10;
        
        // Create tabs
        const tabs = ['All', 'Weapons', 'Armor', 'Potions', 'Materials'];
        
        tabs.forEach((tabName, index) => {
            const tabX = width * 0.2 + (index * (tabWidth + tabSpacing));
            
            // Create tab button
            const tabButton = new Button(
                this,
                tabX,
                tabY,
                tabName,
                () => {
                    console.log(`Tab clicked: ${tabName}`);
                    this.setActiveTab(tabName);
                },
                {
                    width: tabWidth,
                    height: tabHeight,
                    fontSize: this.ui.fontSize.sm
                }
            );
            
            // Make the first tab active by default
            if (index === 0) {
                tabButton.setActive(true);
            }
        });
    }
    
    /**
     * Set the active inventory tab
     * @param {string} tabName - Name of the tab to activate
     */
    setActiveTab(tabName) {
        // In a real implementation, this would filter the inventory items
        console.log(`Setting active tab: ${tabName}`);
    }
    
    /**
     * Create the inventory grid
     */
    createInventoryGrid() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the inventory
        this.ui.createPanel(
            this,
            width * 0.35,
            height * 0.45,
            width * 0.6,
            height * 0.5,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Get inventory items from gameState or use sample data if empty
        const inventoryItems = gameState.inventory.items.length > 0 ? 
            gameState.inventory.items : 
            [
                { name: 'Health Potion', type: 'Consumable', rarity: 'Common', stats: '+50 HP' },
                { name: 'Mana Potion', type: 'Consumable', rarity: 'Common', stats: '+30 MP' },
                { name: 'Iron Sword', type: 'Weapon', rarity: 'Common', stats: '+5 ATK' },
                { name: 'Leather Armor', type: 'Armor', rarity: 'Common', stats: '+3 DEF' },
                { name: 'Fire Crystal', type: 'Material', rarity: 'Uncommon', stats: 'Crafting material' }
            ];
        
        // Create a grid layout for the items
        const gridCols = 4;
        const gridRows = Math.ceil(inventoryItems.length / gridCols);
        const cellSize = 70;
        const startX = width * 0.1;
        const startY = height * 0.25;
        
        // Draw grid cells and items
        if (Array.isArray(inventoryItems)) {
            inventoryItems.forEach((item, index) => {
                const col = index % gridCols;
                const row = Math.floor(index / gridCols);
                
                const cellX = startX + col * (cellSize + 10);
                const cellY = startY + row * (cellSize + 10);
                
                // Create item cell
                const cell = this.add.rectangle(
                    cellX + cellSize/2,
                    cellY + cellSize/2,
                    cellSize,
                    cellSize,
                    0x222233
                ).setStrokeStyle(1, 0x3399ff);
                
                // Add item icon
                const itemIcon = this.add.image(
                    cellX + cellSize/2,
                    cellY + cellSize/2,
                    'item-icon'
                ).setDisplaySize(50, 50);
                
                // Add item name as tooltip
                itemIcon.setInteractive({ useHandCursor: true });
                
                // Show tooltip on hover
                itemIcon.on('pointerover', () => {
                    this.showItemTooltip(item, cellX + cellSize/2, cellY + cellSize/2);
                });
                
                // Hide tooltip when not hovering
                itemIcon.on('pointerout', () => {
                    this.hideItemTooltip();
                });
            });
        } else {
            // Display a message if inventory is empty or not an array
            this.add.text(width * 0.35, height * 0.45, 'Your inventory is empty', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }
    }
    
    /**
     * Show tooltip for an inventory item
     * @param {object} item - The item to show tooltip for
     * @param {number} x - X position for the tooltip
     * @param {number} y - Y position for the tooltip
     */
    showItemTooltip(item, x, y) {
        // Create tooltip container
        this.itemTooltip = this.ui.createPanel(
            x + 100,
            y,
            200,
            120,
            {
                fillColor: 0x111122,
                fillAlpha: 0.9,
                borderColor: 0xffcc00,
                borderThickness: 2
            }
        );
        
        // Add item name with rarity color
        let nameColor = '#ffffff';
        switch (item.rarity) {
            case 'Uncommon':
                nameColor = '#00ff00';
                break;
            case 'Rare':
                nameColor = '#0099ff';
                break;
            case 'Epic':
                nameColor = '#9900ff';
                break;
            case 'Legendary':
                nameColor = '#ff9900';
                break;
        }
        
        this.add.text(x + 100, y - 40, item.name, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: nameColor,
            align: 'center'
        }).setOrigin(0.5);
        
        // Add item type
        this.add.text(x + 100, y - 15, item.type, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add item stats
        this.add.text(x + 100, y + 15, item.stats, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add rarity
        this.add.text(x + 100, y + 40, item.rarity, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: nameColor,
            align: 'center'
        }).setOrigin(0.5);
    }
    
    /**
     * Hide the item tooltip
     */
    hideItemTooltip() {
        if (this.itemTooltip) {
            this.itemTooltip.destroy();
            this.itemTooltip = null;
        }
    }
    
    /**
     * Create the equipment display
     */
    createEquipmentDisplay() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the equipment
        const equipmentPanel = this.ui.createPanel(
            width * 0.85,
            height * 0.45,
            width * 0.25,
            height * 0.5,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add equipment title
        this.add.text(width * 0.85, height * 0.25, 'EQUIPPED', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create equipment slots
        const slots = ['Weapon', 'Armor', 'Helmet', 'Boots', 'Accessory'];
        const slotSize = 60;
        const startY = height * 0.3;
        
        slots.forEach((slotName, index) => {
            const slotY = startY + index * (slotSize + 10);
            
            // Create slot background
            const slot = this.add.rectangle(
                width * 0.85,
                slotY,
                slotSize,
                slotSize,
                0x222233
            ).setStrokeStyle(1, 0x3399ff);
            
            // Add slot label
            this.add.text(width * 0.85 - slotSize/2 - 70, slotY, slotName + ':', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'right'
            }).setOrigin(1, 0.5);
            
            // Check if there's an equipped item for this slot
            const equippedItems = gameState.equipped || {};
            if (equippedItems[slotName.toLowerCase()]) {
                const item = equippedItems[slotName.toLowerCase()];
                
                // Add item icon
                const itemIcon = this.add.image(
                    width * 0.85,
                    slotY,
                    'item-icon'
                ).setDisplaySize(slotSize * 0.7, slotSize * 0.7);
                
                // Add item name
                this.add.text(width * 0.85 + slotSize/2 + 10, slotY, item.name, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#ffffff',
                    align: 'left'
                }).setOrigin(0, 0.5);
            } else {
                // Add empty slot text
                this.add.text(width * 0.85, slotY, 'Empty', {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#666666',
                    align: 'center'
                }).setOrigin(0.5);
            }
        });
    }
    
    /**
     * Create navigation buttons
     */
    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create back button
        const backButton = new Button(
            this,
            width * 0.25,
            height * 0.9,
            'BACK TO TOWN',
            () => {
                console.log('Back to town clicked');
                navigationManager.navigateTo(this, 'OverworldScene');
            },
            {
                width: 200,
                height: 50
            }
        );
        
        // Add shine effect to make the button more noticeable
        backButton.addShineEffect();
        
        // Create crafting button
        const craftingButton = new Button(
            this,
            width * 0.75,
            height * 0.9,
            'GO TO CRAFTING',
            () => {
                console.log('Go to crafting clicked');
                navigationManager.navigateTo(this, 'CraftingScene');
            },
            {
                width: 200,
                height: 50
            }
        );
    }
}

export default InventoryScene;
