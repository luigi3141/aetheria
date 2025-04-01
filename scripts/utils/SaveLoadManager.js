// ---- File: scripts/utils/saveLoadManager.js ----
import gameState from '../utils/gameState.js';

const SAVE_KEY = 'gameState';

export function saveGame() {
    console.log("[SaveLoadManager] Saving gameState to localStorage...");
    try {
        // Ensure player exists before saving
        if (!gameState.player) {
             console.warn("[SaveLoadManager] Cannot save: gameState.player is null.");
             return;
        }
         // Prune unnecessary data if needed before saving
        const stateToSave = {
             player: gameState.player,
             currentDungeon: gameState.currentDungeon,
             // Add other critical state parts if needed
        };
        window.localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
        console.log("[SaveLoadManager] GameState saved.");
    } catch (e) {
        console.error("[SaveLoadManager] Error saving gameState:", e);
    }
}

export function loadGame(preserveCurrentHealth = false) {
     console.log("[SaveLoadManager] Loading gameState from localStorage...");
     const savedState = window.localStorage.getItem(SAVE_KEY);
     if (savedState) {
         try {
             const parsedState = JSON.parse(savedState);
             
             // Store current health/mana if needed
             const currentHealth = preserveCurrentHealth ? gameState.player?.health : undefined;
             const currentMana = preserveCurrentHealth ? gameState.player?.mana : undefined;
             console.log("[SaveLoadManager] Current health state:", { health: currentHealth, mana: currentMana });

             // --- Perform selective/deep merge ---
             if (parsedState.player) {
                  // Merge loaded player data into existing gameState.player if it exists,
                  // otherwise assign directly. Be careful with nested objects.
                  if(gameState.player) {
                      Object.assign(gameState.player, parsedState.player);
                      // Specifically handle inventory merge if necessary
                      if(parsedState.player.inventory) {
                           if(!gameState.player.inventory) gameState.player.inventory = {};
                           Object.assign(gameState.player.inventory, parsedState.player.inventory);
                           // Ensure arrays/objects within inventory are handled
                           if(!gameState.player.inventory.items) gameState.player.inventory.items = [];
                           if(!gameState.player.inventory.equipped) gameState.player.inventory.equipped = {};
                      }
                  } else {
                      gameState.player = parsedState.player;
                  }
                  // Ensure critical nested objects exist after load
                  if (!gameState.player.inventory) gameState.player.inventory = { items: [], equipped: {}, maxItems: 50 };
                  if (!gameState.player.inventory.items) gameState.player.inventory.items = [];
                  if (!gameState.player.inventory.equipped) gameState.player.inventory.equipped = {};

                  // Restore health/mana if needed
                  if (preserveCurrentHealth && currentHealth !== undefined && currentMana !== undefined) {
                      console.log("[SaveLoadManager] Restoring health state:", { health: currentHealth, mana: currentMana });
                      gameState.player.health = currentHealth;
                      gameState.player.mana = currentMana;
                  }
             }
             gameState.currentDungeon = parsedState.currentDungeon || null;
             // ... merge other state parts ...
             console.log("[SaveLoadManager] GameState loaded and merged.");
             return true; // Indicate success
         } catch (e) {
             console.error("[SaveLoadManager] Error parsing saved state:", e);
             window.localStorage.removeItem(SAVE_KEY); // Clear bad save
             return false; // Indicate failure
         }
     } else {
          console.log("[SaveLoadManager] No saved game found.");
          return false; // Indicate no save found
     }
}

export function hasSaveGame() {
     return window.localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSaveGame() {
     console.log("[SaveLoadManager] Clearing saved game state from localStorage.");
     window.localStorage.removeItem(SAVE_KEY);
}