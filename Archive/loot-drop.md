[
  {
    "analysis_area": "Debugging CombatResultScene 'undefined' Issue",
    "problem": "CombatResultScene displays 'undefined' for enemy name, experience, and gold, and shows 'No items found' even after a victory.",
    "root_cause": "Mismatch between how `EncounterScene.js` (specifically `processVictory`) calculates/sets reward data and how `CombatResultScene.js` expects to read it. `EncounterScene` attempts to read properties directly from the enemy object (`enemy.experienceReward`, `enemy.goldReward`, `enemy.loot`), but the actual data structure in `enemies.js` (and likely generated enemy instances) nests these within an `enemy.lootTable` object. Additionally, `CombatResultScene` expects gold/experience inside `combatResult.loot`, but `EncounterScene` sets them directly on `combatResult`.",
    "files_involved": [
      "scripts/scenes/EncounterScene.js",
      "scripts/scenes/CombatResultScene.js",
      "scripts/data/enemies.js"
    ]
  },
  {
    "fix_area": "Refactoring EncounterScene.js (`processVictory`)",
    "description": "Modify `processVictory` to correctly access reward data from the `enemy.lootTable` object and calculate rewards based on the nested structure.",
    "steps": [
      {
        "action": "Modify Reward Calculation",
        "description": "Update how `experienceReward` and `goldReward` are determined.",
        "find_block": [
          "const experienceReward = enemy.experienceReward || 10;",
          "const goldReward = enemy.goldReward ? ",
          "    Math.floor(Math.random() * (enemy.goldReward.max - enemy.goldReward.min + 1)) + enemy.goldReward.min :",
          "    Math.floor(Math.random() * 10) + 5;"
        ],
        "replace_with_block": [
          "let experienceReward = 10; // Default experience",
          "let goldReward = Math.floor(Math.random() * 10) + 5; // Default gold",
          "",
          "if (enemy.lootTable) {",
          "    if (enemy.lootTable.experience) {",
          "        experienceReward = Math.floor(Math.random() * (enemy.lootTable.experience.max - enemy.lootTable.experience.min + 1)) + enemy.lootTable.experience.min;",
          "    }",
          "    if (enemy.lootTable.gold) {",
          "        goldReward = Math.floor(Math.random() * (enemy.lootTable.gold.max - enemy.lootTable.gold.min + 1)) + enemy.lootTable.gold.min;",
          "    }",
          "}"
        ]
      },
      {
        "action": "Modify Item Loot Processing",
        "description": "Update item loot generation to use `enemy.lootTable.items`.",
        "find_block": [
          "if (enemy.loot && enemy.loot.length > 0) {",
          "    enemy.loot.forEach(lootItem => {",
          "        if (Math.random() <= lootItem.chance) {",
          "            if (!gameState.player.inventory) gameState.player.inventory = [];",
          "            gameState.player.inventory.push({ id: lootItem.item, name: lootItem.item });",
          "            lootItems.push(lootItem.item);",
          "            this.combatLog.addLogEntry(`You found a ${lootItem.item}!`);",
          "        }",
          "    });",
          "}"
        ],
        "replace_with_block": [
          "if (enemy.lootTable && enemy.lootTable.items && enemy.lootTable.items.length > 0) {",
          "    enemy.lootTable.items.forEach(lootItem => {",
          "        if (Math.random() <= lootItem.chance) {",
          "            // Ensure inventory exists (might need a more robust check/initialization)",
          "            if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 20, equipped: {} };",
          "            if (!gameState.player.inventory.items) gameState.player.inventory.items = [];",
          "            ",
          "            // Add item ID to loot list and log",
          "            lootItems.push(lootItem.id); // Store the item ID",
          "            this.combatLog.addLogEntry(`You found a ${lootItem.id}!`);",
          "            ",
          "            // Add item to actual player inventory (can be done here or in CombatResultScene)",
          "            // Example: gameState.player.inventory.items.push({ id: lootItem.id, name: lootItem.id }); ",
          "            // Note: Consider fetching full item details from an item database later",
          "        }",
          "    });",
          "}"
        ]
      },
      {
        "action": "Modify gameState.combatResult Assignment",
        "description": "Ensure the correct properties are assigned.",
        "find": "enemy: enemy.name,",
        "replace_with": "enemyName: enemy.name, // Use a distinct property name",
        "notes": "Ensure the `loot` property is assigned the `lootItems` array containing item IDs."
      }
    ]
  },
  {
    "fix_area": "Refactoring CombatResultScene.js (`createResultsDisplay`)",
    "description": "Modify `createResultsDisplay` to read the correctly named properties from `gameState.combatResult`.",
    "steps": [
      {
        "action": "Update Enemy Name Access",
        "description": "Use the `enemyName` property set by `processVictory`.",
        "find": "resultTitle = `You defeated the ${enemy ? enemy.name : 'enemy'}!`;",
        "replace_with": "resultTitle = `You defeated the ${combatResult.enemyName || 'enemy'}!`;",
        "notes": "Remove the local `enemy` and `enemies` variable declarations within this method as they are not needed if accessing `combatResult.enemyName`."
      },
      {
        "action": "Update Experience/Gold Access",
        "description": "Access `experienceGained` and `goldGained` directly from `combatResult`.",
        "find": "`Experience gained: ${combatResult.loot.experience}`",
        "replace_with": "`Experience gained: ${combatResult.experienceGained}`"
      },
      {
        "action": "Update Experience/Gold Access",
        "find": "`Gold gained: ${combatResult.loot.gold}`",
        "replace_with": "`Gold gained: ${combatResult.goldGained}`"
      }
    ]
  },
  {
    "fix_area": "Refactoring CombatResultScene.js (`createLootDisplay`)",
    "description": "Ensure `createLootDisplay` correctly processes the array of item IDs.",
    "steps": [
      {
        "action": "Verify Loot Access",
        "description": "The current code reads `loot.items` which should align with `combatResult.loot` being set as an array of item IDs. This part likely needs no change, provided `processVictory` is fixed correctly.",
        "find": "const loot = combatResult.loot || { gold: 0, items: [], experience: 0 };",
        "replace_with": "const lootItemsArray = combatResult.loot || []; // Get the array of item IDs",
        "notes": "Then update the logic to use `lootItemsArray` instead of `loot.items`."
      },
       {
        "action": "Update Item Display Loop",
        "description": "Modify the loop to iterate over the array of item IDs.",
        "find_block": [
          "if (loot.items && loot.items.length > 0) {",
          "    // Display up to 5 items",
          "    const displayItems = loot.items.slice(0, 5);",
          "    const startY = height * 0.5;",
          "    const spacing = 30;",
          "    ",
          "    displayItems.forEach((item, index) => {",
          "        // Try to get item name from templates",
          "        let itemName = item;",
          "        ",
          "        this.add.text(width/2, startY + (index * spacing), `- ${itemName}`, {",
          "            fontFamily: \"'VT323'\",",
          "            fontSize: this.ui.fontSize.md + 'px',",
          "            fill: '#ffffff',",
          "            align: 'center'",
          "        }).setOrigin(0.5);",
          "    });",
          "    ",
          "    // If there are more items, show a message",
          "    if (loot.items.length > 5) {",
          "        const moreCount = loot.items.length - 5;",
          "        this.add.text(width/2, startY + (5 * spacing), `...and ${moreCount} more items`, {",
          "            fontFamily: \"'VT323'\",",
          "            fontSize: this.ui.fontSize.sm + 'px',",
          "            fill: '#aaaaaa',",
          "            align: 'center'",
          "        }).setOrigin(0.5);",
          "    }",
          "} else {",
          "    // No items message",
          "    // ...",
          "}"
        ],
        "replace_with_block": [
          "const lootItemsArray = combatResult.loot || []; // Get the array of item IDs",
          "if (lootItemsArray.length > 0) {",
          "    // Display up to 5 items",
          "    const displayItems = lootItemsArray.slice(0, 5);",
          "    const startY = height * 0.5;",
          "    const spacing = 30;",
          "    ",
          "    displayItems.forEach((itemId, index) => {",
          "        // Display the item ID (or fetch item name from an item database if available)",
          "        let itemName = itemId; // Replace with item lookup if you have item data",
          "        ",
          "        this.add.text(width/2, startY + (index * spacing), `- ${itemName}`, {",
          "            fontFamily: \"'VT323'\",",
          "            fontSize: this.ui.fontSize.md + 'px',",
          "            fill: '#ffffff',",
          "            align: 'center'",
          "        }).setOrigin(0.5);",
          "    });",
          "    ",
          "    // If there are more items, show a message",
          "    if (lootItemsArray.length > 5) {",
          "        const moreCount = lootItemsArray.length - 5;",
          "        this.add.text(width/2, startY + (5 * spacing), `...and ${moreCount} more items`, {",
          "            fontFamily: \"'VT323'\",",
          "            fontSize: this.ui.fontSize.sm + 'px',",
          "            fill: '#aaaaaa',",
          "            align: 'center'",
          "        }).setOrigin(0.5);",
          "    }",
          "} else {",
          "    // No items message",
          "    this.add.text(width/2, height * 0.55, 'No items found', {",
          "        fontFamily: \"'VT323'\",",
          "        fontSize: this.ui.fontSize.md + 'px',",
          "        fill: '#aaaaaa',",
          "        align: 'center'",
          "    }).setOrigin(0.5);",
          "}"
        ]
      }
    ]
  },
  {
    "fix_area": "Player Inventory Update (`updatePlayerStats`)",
    "description": "Ensure player inventory update logic correctly handles the array of item IDs from `loot.items`.",
    "steps": [
        {
            "action": "Modify Inventory Update Loop",
            "description": "Update the loop to add item IDs to the player's inventory.",
            "find_block": [
                "if (loot.items && loot.items.length > 0) {",
                "    loot.items.forEach(item => {",
                "        // Only add if there's space",
                "        if (gameState.player.inventory.items.length < gameState.player.inventory.maxItems) {",
                "            gameState.player.inventory.items.push(item);",
                "        }",
                "    });",
                "}"
            ],
            "replace_with_block": [
                "// Add items to inventory",
                "const lootItemsArray = loot.items || []; // Assuming loot is the object { gold, experience, items: [...] }",
                "if (lootItemsArray.length > 0) {",
                "    // Ensure inventory structure exists",
                "    if (!gameState.player.inventory) gameState.player.inventory = { items: [], maxItems: 20, equipped: {} };",
                "    if (!gameState.player.inventory.items) gameState.player.inventory.items = [];",
                "    ",
                "    lootItemsArray.forEach(itemId => {",
                "        // Only add if there's space",
                "        if (gameState.player.inventory.items.length < gameState.player.inventory.maxItems) {",
                "            // Add the item ID (or a placeholder object)",
                "            // TODO: Replace this with proper item object creation if you have an item database",
                "            gameState.player.inventory.items.push({ id: itemId, name: itemId, type: 'Unknown' }); ",
                "        }",
                "    });",
                "}"
            ],
            "notes": "This assumes `loot` passed to `updatePlayerStats` is the sub-object `{ gold, experience, items: [...] }`. If `loot` is just the array of items, adjust accordingly. The `TODO` comment highlights that ideally, you'd fetch full item details here."
        }
    ]
  }
]