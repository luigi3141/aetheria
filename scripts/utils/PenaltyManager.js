// ---- File: utils/PenaltyManager.js ----

import gameState from './gameState.js';
import items from '../data/items.js'; // Use the default export

const { getItemData } = items; // Destructure needed function

/**
 * Processes potential item loss based on a given chance.
 * Modifies gameState.player.inventory.items directly.
 *
 * @param {number} lossChance - The probability (0.0 to 1.0) of losing each item.
 * @returns {Array<object>} An array of item data objects for the items that were lost.
 */
function processItemLoss(lossChance) {
    console.log(`[PenaltyManager] Processing item loss with chance: ${lossChance * 100}%`);
    if (!gameState.player?.inventory?.items || gameState.player.inventory.items.length === 0) {
        console.log("[PenaltyManager] No items in inventory to potentially lose.");
        return []; // No items to lose
    }

    const lostItemsData = []; // Store data of lost items
    const itemsToRemoveIndexes = []; // Store indexes to remove later

    // Iterate backwards to safely remove items without messing up indexes
    for (let i = gameState.player.inventory.items.length - 1; i >= 0; i--) {
        const itemInstance = gameState.player.inventory.items[i];
        if (!itemInstance) continue; // Skip if somehow null/undefined

        // --- Roll for loss ---
        const roll = Math.random();
        if (roll < lossChance) {
            // --- Item Lost ---
            const itemData = getItemData(itemInstance.itemId); // Get full data for display later
            const lostItemInfo = {
                itemId: itemInstance.itemId,
                name: itemData?.inGameName || `Unknown Item (${itemInstance.itemId})`,
                quantityLost: itemInstance.quantity // Assume entire stack is lost
            };
            lostItemsData.push(lostItemInfo); // Add info to the list of lost items
            itemsToRemoveIndexes.push(i); // Mark index for removal

            console.log(`[PenaltyManager] Rolled ${roll.toFixed(3)} vs ${lossChance}. Lost: ${lostItemInfo.name} (Index: ${i})`);
        } else {
            // console.log(`[PenaltyManager] Rolled ${roll.toFixed(3)} vs ${lossChance}. Kept item at index ${i}`);
        }
    }

    // Remove items marked for removal (indexes are already in descending order)
    itemsToRemoveIndexes.forEach(index => {
        gameState.player.inventory.items.splice(index, 1);
    });

    console.log("[PenaltyManager] Item loss processing complete. Items lost:", lostItemsData.length);
    console.log("[PenaltyManager] Inventory items remaining:", gameState.player.inventory.items.length);

    // Return data of lost items (name is important for DefeatScene)
    return lostItemsData;
}

export { processItemLoss };