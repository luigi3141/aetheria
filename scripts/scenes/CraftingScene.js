import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';

/**
 * CraftingScene - Scene for crafting items from materials
 */
class CraftingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CraftingScene' });
    }

    preload() {
        // Load crafting assets
        this.load.image('crafting-bg', 'https://labs.phaser.io/assets/skies/space2.png');
        this.load.image('item-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
        this.load.image('material-icon', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create UI Manager
        this.ui = new UIManager(this);
        
        // Add background
        this.add.image(width/2, height/2, 'crafting-bg').setDisplaySize(width, height);

        // Add decorative corners
        this.ui.addScreenCorners();
        
        // Create the title
        this.ui.createTitle(width/2, height * 0.08, 'Crafting Workshop', {
            fontSize: this.ui.fontSize.lg
        });
        
        // Create tabs for different crafting categories
        this.createCraftingTabs();
        
        // Create the recipe list
        this.createRecipeList();
        
        // Create the crafting preview
        this.createCraftingPreview();
        
        // Create the materials list
        this.createMaterialsList();
        
        // Create navigation buttons
        this.createNavigationButtons();
    }
    
    /**
     * Create tabs for different crafting categories
     */
    createCraftingTabs() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const tabY = height * 0.15;
        const tabWidth = 120;
        const tabHeight = 40;
        const tabSpacing = 10;
        
        // Create tabs
        const tabs = ['Weapons', 'Armor', 'Potions', 'Accessories'];
        
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
     * Set the active crafting tab
     * @param {string} tabName - Name of the tab to activate
     */
    setActiveTab(tabName) {
        // In a real implementation, this would filter the recipes
        console.log(`Setting active tab: ${tabName}`);
    }
    
    /**
     * Create the recipe list
     */
    createRecipeList() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the recipes
        const recipesPanel = this.ui.createPanel(
            width * 0.25,
            height * 0.45,
            width * 0.4,
            height * 0.5,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add recipes title
        this.add.text(width * 0.25, height * 0.25, 'RECIPES', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Sample recipes - in a real implementation, this would be filtered by the active tab
        const recipes = [
            { name: 'Iron Sword', type: 'Weapon', rarity: 'Common', materials: ['Iron Ore x3', 'Wood x1'] },
            { name: 'Steel Sword', type: 'Weapon', rarity: 'Uncommon', materials: ['Steel Ingot x2', 'Leather x1', 'Wood x1'] },
            { name: 'Flame Blade', type: 'Weapon', rarity: 'Rare', materials: ['Steel Ingot x3', 'Fire Crystal x2', 'Leather x1'] },
            { name: 'Leather Armor', type: 'Armor', rarity: 'Common', materials: ['Leather x5', 'Iron Ore x1'] }
        ];
        
        // Display the recipes
        const startY = height * 0.3;
        const spacing = height * 0.08;
        
        recipes.forEach((recipe, index) => {
            const y = startY + (index * spacing);
            
            // Create recipe container
            const recipeContainer = this.add.rectangle(
                width * 0.25,
                y,
                width * 0.35,
                50,
                0x222233
            ).setStrokeStyle(1, 0x3399ff);
            
            // Make container interactive
            recipeContainer.setInteractive();
            
            // Add hover effect
            recipeContainer.on('pointerover', () => {
                recipeContainer.setStrokeStyle(2, 0xffcc00);
            });
            
            recipeContainer.on('pointerout', () => {
                recipeContainer.setStrokeStyle(1, 0x3399ff);
            });
            
            // Add click handler
            recipeContainer.on('pointerdown', () => {
                console.log(`Recipe selected: ${recipe.name}`);
                this.selectRecipe(recipe);
            });
            
            // Add recipe icon
            this.add.image(
                width * 0.1,
                y,
                'item-icon'
            ).setDisplaySize(40, 40);
            
            // Add recipe name with rarity color
            let nameColor = '#ffffff';
            switch (recipe.rarity) {
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
            
            this.add.text(width * 0.15, y - 10, recipe.name, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: nameColor,
                align: 'left'
            }).setOrigin(0, 0.5);
            
            // Add recipe type
            this.add.text(width * 0.15, y + 10, recipe.type, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#aaaaaa',
                align: 'left'
            }).setOrigin(0, 0.5);
        });
    }
    
    /**
     * Select a recipe to craft
     * @param {object} recipe - The recipe to select
     */
    selectRecipe(recipe) {
        // In a real implementation, this would update the crafting preview
        this.selectedRecipe = recipe;
        
        // Update the crafting preview
        this.updateCraftingPreview();
    }
    
    /**
     * Create the crafting preview
     */
    createCraftingPreview() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the preview
        this.previewPanel = this.ui.createPanel(
            width * 0.7,
            height * 0.35,
            width * 0.5,
            height * 0.3,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x9966ff,
                borderThickness: 2
            }
        );
        
        // Add preview title
        this.add.text(width * 0.7, height * 0.25, 'CRAFTING PREVIEW', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Create placeholder for preview content
        this.previewContent = this.add.container(width * 0.7, height * 0.35);
        
        // Add default text
        this.previewText = this.add.text(0, 0, 'Select a recipe to craft', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        this.previewContent.add(this.previewText);
    }
    
    /**
     * Update the crafting preview with the selected recipe
     */
    updateCraftingPreview() {
        // Clear previous content
        this.previewContent.removeAll();
        
        if (!this.selectedRecipe) {
            return;
        }
        
        const recipe = this.selectedRecipe;
        
        // Add item icon
        const itemIcon = this.add.image(
            0,
            -40,
            'item-icon'
        ).setDisplaySize(60, 60);
        
        // Set tint based on rarity
        switch (recipe.rarity) {
            case 'Common':
                itemIcon.setTint(0xffffff);
                break;
            case 'Uncommon':
                itemIcon.setTint(0x00ff00);
                break;
            case 'Rare':
                itemIcon.setTint(0x0099ff);
                break;
            case 'Epic':
                itemIcon.setTint(0x9900ff);
                break;
            case 'Legendary':
                itemIcon.setTint(0xff9900);
                break;
        }
        
        // Add item name
        const nameText = this.add.text(0, 0, recipe.name, {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add required materials
        const materialsText = this.add.text(0, 30, 'Required Materials:', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.sm + 'px',
            fill: '#aaaaaa',
            align: 'center'
        }).setOrigin(0.5);
        
        // Add each material
        const materials = recipe.materials;
        materials.forEach((material, index) => {
            const materialText = this.add.text(0, 50 + (index * 20), material, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        });
        
        // Add craft button
        const craftButton = new Button(
            this,
            0,
            80,
            'CRAFT',
            () => {
                console.log(`Crafting: ${recipe.name}`);
                this.craftItem(recipe);
            },
            {
                width: 120,
                height: 40
            }
        );
        
        // Add all elements to the container
        this.previewContent.add([itemIcon, nameText, materialsText, craftButton]);
    }
    
    /**
     * Craft an item from a recipe
     * @param {object} recipe - The recipe to craft
     */
    craftItem(recipe) {
        // In a real implementation, this would check if the player has the required materials
        // and then craft the item
        
        // For now, just show a success message
        this.showCraftingResult(true, recipe);
    }
    
    /**
     * Show the result of a crafting attempt
     * @param {boolean} success - Whether the crafting was successful
     * @param {object} recipe - The recipe that was crafted
     */
    showCraftingResult(success, recipe) {
        // Clear previous content
        this.previewContent.removeAll();
        
        if (success) {
            // Show success message
            const successText = this.add.text(0, -20, 'Crafting Successful!', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#00ff00',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add glow effect
            successText.preFX.addGlow(0x00ff00, 4);
            
            // Add item name
            const itemText = this.add.text(0, 20, `You crafted: ${recipe.name}`, {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add item to inventory
            if (!gameState.inventory) gameState.inventory = [];
            gameState.inventory.push({
                name: recipe.name,
                type: recipe.type,
                rarity: recipe.rarity,
                stats: '+10 Power' // Placeholder stats
            });
            
            // Add back button
            const backButton = new Button(
                this,
                0,
                60,
                'CRAFT ANOTHER',
                () => {
                    console.log('Crafting another item');
                    this.updateCraftingPreview();
                },
                {
                    width: 180,
                    height: 40
                }
            );
            
            // Add all elements to the container
            this.previewContent.add([successText, itemText, backButton]);
        } else {
            // Show failure message
            const failureText = this.add.text(0, 0, 'Crafting Failed!\nNot enough materials.', {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.md + 'px',
                fill: '#ff0000',
                align: 'center'
            }).setOrigin(0.5);
            
            // Add back button
            const backButton = new Button(
                this,
                0,
                60,
                'TRY AGAIN',
                () => {
                    console.log('Trying again');
                    this.updateCraftingPreview();
                },
                {
                    width: 120,
                    height: 40
                }
            );
            
            // Add all elements to the container
            this.previewContent.add([failureText, backButton]);
        }
    }
    
    /**
     * Create the materials list
     */
    createMaterialsList() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Create a panel for the materials
        const materialsPanel = this.ui.createPanel(
            width * 0.7,
            height * 0.65,
            width * 0.5,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add materials title
        this.add.text(width * 0.7, height * 0.55, 'YOUR MATERIALS', {
            fontFamily: "'VT323'",
            fontSize: this.ui.fontSize.md + 'px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        
        // Sample materials - in a real implementation, this would come from gameState
        const materials = [
            { name: 'Iron Ore', quantity: 15 },
            { name: 'Wood', quantity: 8 },
            { name: 'Leather', quantity: 5 },
            { name: 'Fire Crystal', quantity: 2 },
            { name: 'Steel Ingot', quantity: 3 }
        ];
        
        // Create a grid layout for the materials
        const gridCols = 5;
        const gridRows = Math.ceil(materials.length / gridCols);
        const cellSize = 60;
        const startX = width * 0.5;
        const startY = height * 0.6;
        
        // Draw grid cells and materials
        materials.forEach((material, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);
            
            const cellX = startX + col * (cellSize + 10);
            const cellY = startY + row * (cellSize + 10);
            
            // Create material cell
            const cell = this.add.rectangle(
                cellX + cellSize/2,
                cellY + cellSize/2,
                cellSize,
                cellSize,
                0x222233
            ).setStrokeStyle(1, 0x3399ff);
            
            // Add material icon
            const materialIcon = this.add.image(
                cellX + cellSize/2,
                cellY + cellSize/2,
                'material-icon'
            ).setDisplaySize(cellSize * 0.7, cellSize * 0.7);
            
            // Add material quantity
            this.add.text(cellX + cellSize - 5, cellY + cellSize - 5, material.quantity.toString(), {
                fontFamily: "'VT323'",
                fontSize: this.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                align: 'right'
            }).setOrigin(1);
            
            // Make the material interactive
            materialIcon.setInteractive();
            
            // Add hover effect
            materialIcon.on('pointerover', () => {
                cell.setStrokeStyle(2, 0xffcc00);
                
                // Show material name
                this.materialNameText = this.add.text(cellX + cellSize/2, cellY - 20, material.name, {
                    fontFamily: "'VT323'",
                    fontSize: this.ui.fontSize.sm + 'px',
                    fill: '#ffffff',
                    backgroundColor: '#111122',
                    padding: { x: 5, y: 2 }
                }).setOrigin(0.5);
            });
            
            materialIcon.on('pointerout', () => {
                cell.setStrokeStyle(1, 0x3399ff);
                
                // Hide material name
                if (this.materialNameText) {
                    this.materialNameText.destroy();
                    this.materialNameText = null;
                }
            });
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
        
        // Create inventory button
        const inventoryButton = new Button(
            this,
            width * 0.75,
            height * 0.9,
            'GO TO INVENTORY',
            () => {
                console.log('Go to inventory clicked');
                navigationManager.navigateTo(this, 'InventoryScene');
            },
            {
                width: 200,
                height: 50
            }
        );
    }
}

export default CraftingScene;
