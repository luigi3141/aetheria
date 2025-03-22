/**
 * SelectionGrid - A reusable grid of selectable options
 */
class SelectionGrid {
    /**
     * Create a new selection grid
     * @param {Phaser.Scene} scene - The scene this grid belongs to
     * @param {number} x - X position of grid center
     * @param {number} y - Y position of grid start
     * @param {array} items - Array of items to display
     * @param {function} onSelect - Function to call when an item is selected
     * @param {object} options - Optional configuration
     */
    constructor(scene, x, y, items, onSelect, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.items = items;
        this.onSelect = onSelect;
        
        // Set default options
        this.columns = options.columns || 1;
        this.itemWidth = options.itemWidth || 160;
        this.itemHeight = options.itemHeight || 40;
        this.spacing = options.spacing || 16;
        this.fontSize = options.fontSize || 16;
        this.fontFamily = options.fontFamily || "'VT323'";
        this.primaryColor = options.primaryColor || 0x4a6fb2;
        this.secondaryColor = options.secondaryColor || 0x333333;
        this.accentColor = options.accentColor || 0xffd700;
        this.textColor = options.textColor || '#ffffff';
        this.initialSelection = options.initialSelection || 0;
        
        // Calculate rows
        this.rows = Math.ceil(this.items.length / this.columns);
        
        // Create buttons array
        this.buttons = [];
        this.selectedIndex = this.initialSelection;
        
        // Create the grid
        this.create();
    }
    
    /**
     * Create the selection grid
     */
    create() {
        // Calculate grid dimensions
        const gridWidth = (this.columns * this.itemWidth) + ((this.columns - 1) * this.spacing);
        const startX = this.x - (gridWidth / 2) + (this.itemWidth / 2);
        
        // Create buttons for each item
        this.items.forEach((item, index) => {
            // Calculate position in grid
            const col = index % this.columns;
            const row = Math.floor(index / this.columns);
            const itemX = startX + (col * (this.itemWidth + this.spacing));
            const itemY = this.y + (row * (this.itemHeight + this.spacing));
            
            const isSelected = index === this.selectedIndex;
            
            // Create button background
            const bg = this.scene.add.rectangle(
                itemX, 
                itemY, 
                this.itemWidth, 
                this.itemHeight, 
                isSelected ? this.primaryColor : this.secondaryColor
            )
                .setOrigin(0.5)
                .setInteractive()
                .setStrokeStyle(2, isSelected ? this.accentColor : 0x555555);
                
            // Create button text
            const text = this.scene.add.text(itemX, itemY, item, {
                fontFamily: this.fontFamily,
                fontSize: this.fontSize + 'px',
                fill: this.textColor,
                resolution: 3
            }).setOrigin(0.5);
            
            // Create button object
            const button = { bg, text, index, value: item };
            this.buttons.push(button);
            
            // Add click handler
            bg.on('pointerdown', () => this.selectItem(index));
        });
    }
    
    /**
     * Select an item in the grid
     * @param {number} index - Index of item to select
     */
    selectItem(index) {
        if (index >= 0 && index < this.buttons.length) {
            // Update selection
            this.selectedIndex = index;
            
            // Update all buttons to reflect selection
            this.buttons.forEach(btn => {
                const isSelected = btn.index === this.selectedIndex;
                btn.bg.fillColor = isSelected ? this.primaryColor : this.secondaryColor;
                btn.bg.setStrokeStyle(2, isSelected ? this.accentColor : 0x555555);
            });
            
            // Call selection handler
            if (this.onSelect) {
                this.onSelect(this.items[index], index);
            }
        }
    }
    
    /**
     * Get the currently selected item
     * @returns {string} Selected item
     */
    getSelectedItem() {
        return this.items[this.selectedIndex];
    }
    
    /**
     * Get the currently selected index
     * @returns {number} Selected index
     */
    getSelectedIndex() {
        return this.selectedIndex;
    }
    
    /**
     * Set the grid position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {SelectionGrid} This grid for chaining
     */
    setPosition(x, y) {
        // Calculate the offset
        const dx = x - this.x;
        const dy = y - this.y;
        
        // Update position
        this.x = x;
        this.y = y;
        
        // Update all buttons
        this.buttons.forEach(btn => {
            btn.bg.x += dx;
            btn.bg.y += dy;
            btn.text.x += dx;
            btn.text.y += dy;
        });
        
        return this;
    }
    
    /**
     * Destroy the grid
     */
    destroy() {
        this.buttons.forEach(btn => {
            btn.bg.destroy();
            btn.text.destroy();
        });
        
        this.buttons = [];
    }
}

export default SelectionGrid;
