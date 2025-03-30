
**1. Equipping Click Area Still Offset**

This is frustrating! Since switching interactivity to `itemRow` didn't fix it, the issue likely lies deeper, possibly with how `ScrollableContainer` handles input coordinates or how the scene manages input zones, especially after scrolling.

**Let's try a more robust approach for the click listener:** Instead of attaching the listener directly in the loop, let's add a reference to the `itemInstance.itemId` to the `itemRow` container itself and attach a single listener to the `ScrollableContainer`'s *main internal container* that checks which row was clicked.

**Changes:**

A. **Modify `ScrollableContainer.js` (Optional but Recommended):** Add a way to easily get all added items.

   ```javascript
   // Inside ScrollableContainer class
   constructor(scene, x, y, width, height, options = {}) {
       // ... existing constructor ...
       this.items = []; // Add this array to track added items
       // ...
   }

   addItem(item, y = null) {
       // ... existing addItem logic ...
       if (addedItem === item) { // Check if item was successfully added
            this.items.push(item); // Track the added item container
       }
       // ...
       return addedItem;
   }
    
   clear() {
        if (!this.valid || !this.container) return;
        this.container.removeAll(true); 
        this.items = []; // Clear tracked items as well
        this.contentHeight = 0;
        this.scrollPosition = 0;
        // ... rest of clear ...
   }

   // Optional: Method to get tracked items
   getItems() {
       return this.items;
   }

    destroy() {
         // ... existing destroy logic ...
         this.items = []; // Clear items array on destroy
         // ...
    }
   ```

B. **Modify `displayEquipmentTab` in `InventoryScene.js`:**

   ```javascript
   displayEquipmentTab() {
       // ... (setup: width, height, list container creation) ...
       const listWidth = width * 0.4; // Use your actual width

       const inventory = gameState.player.inventory.items || [];
       const equipmentItems = inventory.filter(itemInstance => {
           const itemData = getItemData(itemInstance.itemId);
           return itemData && itemData.equipSlot && ['body', 'accessory', 'weapon'].includes(itemData.equipSlot);
       });

       console.log("Equipment Tab - Filtered items:", JSON.parse(JSON.stringify(equipmentItems)));

       if (equipmentItems.length === 0) {
           this.equipmentListContainer.addText('No equippable items found.', { /*...*/ });
       } else {
           let currentY = 0;
           const itemHeight = 40;

           equipmentItems.forEach(itemInstance => {
               const itemData = getItemData(itemInstance.itemId);
               if (!itemData) return;

               const itemRow = this.add.container(0, 0); // Position relative to scroll container
               const itemBg = this.add.rectangle(0, 0, listWidth - 20, itemHeight, 0x2a2a3e, 0).setOrigin(0, 0);
               const nameText = this.add.text(10, itemHeight / 2, itemData.inGameName, { /*...*/ }).setOrigin(0, 0.5);
               const statsText = this.add.text(listWidth - 30, itemHeight / 2, /*...*/ }).setOrigin(1, 0.5);

               itemRow.add([itemBg, nameText, statsText]);
               itemRow.setSize(listWidth - 20, itemHeight); // Set container size

               // --- STORE ITEM ID ON THE CONTAINER ---
               itemRow.setData('itemId', itemInstance.itemId); 
               // Add visual hover effect directly here (optional)
               itemRow.setInteractive() // Make row interactive for hover state
                  .on('pointerover', () => itemBg.setFillStyle(0x3a3a4e, 0.7))
                  .on('pointerout', () => itemBg.setFillStyle(0x2a2a3e, 0));


               this.equipmentListContainer.addItem(itemRow); // Add to scroll container
                // ScrollableContainer should handle Y positioning automatically if addItem supports it
                // Otherwise, manually set itemRow.y = currentY and increment currentY
           });

           // --- ADD SINGLE LISTENER TO SCROLLABLE CONTAINER'S *INTERNAL* CONTAINER ---
           if (this.equipmentListContainer && this.equipmentListContainer.container) {
                // Remove previous listener if exists
                this.equipmentListContainer.container.removeListener('pointerdown'); 
                
                // Add new listener
                this.equipmentListContainer.container.setInteractive(); // Make the inner container interactive
                this.equipmentListContainer.container.on('pointerdown', (pointer, gameObjects) => {
                    // gameObjects contains the list of items hit by the pointer, topmost first
                    if (gameObjects.length > 0) {
                        const clickedRow = gameObjects[0]; // Get the topmost item (should be our itemRow)
                        
                        // Check if the clicked object HAS an itemId stored
                        const clickedItemId = clickedRow.getData('itemId'); 
                        
                        if (clickedItemId) {
                            console.log(`[Container Listener] Clicked item ID: ${clickedItemId}`);
                             pointer.event?.stopPropagation(); // Still good practice
                             this.safePlaySound('button-click', { volume: 0.3 });
                             this.equipItem(clickedItemId);
                        } else {
                            console.log("[Container Listener] Clicked on something without an item ID.", clickedRow);
                        }
                    }
                });
                console.log("Attached main pointerdown listener to scrollable container's inner container.");
           } else {
                 console.error("Cannot attach equipment list listener: ScrollableContainer or its internal container is missing.");
           }
       }

       this.equipmentListContainer?.updateMaxScroll();
       this.equipmentListContainer?.setVisible(true);
   }
   ```

   *   **Key Changes:** We store the `itemId` directly on the `itemRow` container using `setData`. We remove individual listeners from `itemRow`. We add **one** `pointerdown` listener to the `ScrollableContainer`'s internal Phaser container (`this.equipmentListContainer.container`). This listener checks which `itemRow` (if any) was clicked using the `gameObjects` array provided by Phaser and retrieves the stored `itemId`. This often works better with scrolling and complex layouts.

**2. Show Item-Specific Modifiers in Slots**

Modify `updateEquipmentSlotsDisplay` to format and display only the effects of the *equipped* item below its name.

```javascript
    updateEquipmentSlotsDisplay() {
        console.log("Updating Equipment Slots Display...");
        const equipped = gameState.player.inventory?.equipped || {};

        Object.entries(this.equipmentSlots).forEach(([slotKey, elements]) => {
            if (!elements || !elements.iconDisplay || !elements.label || !elements.border) { /* ... */ return; }

            let itemIdToDisplay = null;
            let itemData = null;

            // Determine which item (if any) should be displayed in this visual slot
            if (slotKey === 'body' && equipped.body) {
                itemIdToDisplay = equipped.body;
            } else if (slotKey === 'accessory') {
                itemIdToDisplay = equipped.weapon || equipped.accessory; // Check weapon first, then accessory
            }

            if (itemIdToDisplay) {
                itemData = getItemData(itemIdToDisplay);
            }

            // Update the slot based on the found itemData
            if (itemData) {
                // Update Icon
                const itemIconKey = itemData.iconKey;
                if (itemIconKey && this.textures.exists(itemIconKey)) {
                    elements.iconDisplay.setTexture(itemIconKey).setVisible(true).setScale(0.8);
                } else { /* Handle missing icon */ elements.iconDisplay.setTexture(elements.placeholderTexture).setVisible(true).setScale(0.8); }
                
                // --- UPDATE LABEL WITH ITEM NAME + MODIFIERS ---
                let effectsString = "";
                if (itemData.effects) {
                    effectsString = Object.entries(itemData.effects)
                        .map(([stat, value]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${value > 0 ? '+' : ''}${value}`)
                        .join('\n'); // Join with newline
                }
                elements.label.setText(`${itemData.inGameName}\n${effectsString}`);
                elements.label.setLineSpacing(4); // Adjust line spacing if needed
                elements.label.setFontSize('11px'); // May need smaller font
                elements.label.y = 45; // Adjust Y position to fit text
                // --- END LABEL UPDATE ---

                // Update Border (Highlight)
                elements.border.setStrokeStyle(2, 0xaaaaff);

            } else {
                // Slot is empty - Reset to default placeholder
                elements.iconDisplay.setTexture(elements.placeholderTexture).setVisible(true).setScale(0.8);
                elements.label.setText(elements.name); // Reset to default name ('Armour' or 'Accessory/Weapon')
                elements.label.setFontSize('14px'); // Reset font size
                elements.label.setLineSpacing(0); // Reset line spacing
                elements.label.y = 40; // Reset Y position
                elements.border.setStrokeStyle(1, 0x555555); // Default border
            }
        });
         // Keep the separate total stats display logic if you implemented it
         this.updateTotalStatsDisplay(); // Call the function to update totals
    }
```

**3. Update Total Stats Display (Single Attack Stat)**

Create or modify the function that updates the separate total stats text to show only the relevant attack stat.

```javascript
    // Add this function or integrate into updateEquipmentSlotsDisplay if preferred
    updateTotalStatsDisplay() {
         if (!this.equipmentStatsText) return; // Check if the text element exists

         const player = gameState.player;
         const equipped = player.inventory?.equipped || {};

         // Determine which attack stat to display
         let attackStatLabel = "Attack"; // Default to physical
         let attackStatValue = player.currentAttack || 0; 
         const weaponId = equipped.weapon;
         
         if (weaponId) {
             const weaponData = getItemData(weaponId);
             // Check if the weapon provides magicAttack
             if (weaponData && weaponData.effects && weaponData.effects.hasOwnProperty('magicAttack')) { 
                 attackStatLabel = "Magic Atk";
                 attackStatValue = player.currentMagicAttack || 0;
             }
         }
        
         const defenseStatValue = player.currentDefense || 0;

         // Update the text element
         this.equipmentStatsText.setText(
              `${attackStatLabel}: ${attackStatValue}\n` +
              `Defense: ${defenseStatValue}`
              // Add other total stats like crit, dodge if needed
         );
          console.log("Updated total stats display:", this.equipmentStatsText.text);
    }
```

*   **Important:** Make sure you call `this.updateTotalStatsDisplay()` after `CharacterManager.recalculatePlayerStats()` is called (e.g., at the end of `equipItem` and `unequipItem`, and maybe once in `create` after `createEquipmentSlotsDisplay`).
*   You'll also need to create `this.equipmentStatsText` in `createEquipmentSlotsDisplay` as shown in the previous answer if you haven't already.

Try these adjustments. Attaching the listener to the `ScrollableContainer`'s internal container is often the most reliable way to handle clicks within scrolled lists in Phaser.