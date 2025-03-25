import { ASSET_PATHS } from '../config/AssetConfig.js';
import gameState from '../gameState.js';

export default class CombatUI {
    constructor(scene) {
        this.scene = scene;
        this.buttons = {};
        this.healthBars = {};
        this.manaBars = {};
    }

    /**
     * Create the combat UI for turn-based combat
     */
    createCombatUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create title based on boss status
        const titleText = this.scene.isBoss ? 'Boss Battle!' : 'Combat Encounter';
        this.scene.ui.createTitle(width/2, height * 0.08, titleText, {
            fontSize: this.scene.ui.fontSize.lg
        });
        
        // Create player panel
        this.createPlayerPanel();
        
        // Create enemy panel
        this.createEnemyPanel();
        
        // Create action buttons
        this.createCombatActionButtons();
    }

    /**
     * Create player panel with stats
     */
    createPlayerPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create panel background
        this.scene.ui.createPanel(
            width * 0.25,
            height * 0.25,
            width * 0.4,
            height * 0.2,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );
        
        // Add player name
        const playerName = gameState.player.name || 'Adventurer';
        this.playerNameText = this.scene.add.text(width * 0.25, height * 0.2, playerName, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.scene.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add health display
        this.createPlayerHealthDisplay();
        
        // Add mana display
        this.createPlayerManaDisplay();
    }

    /**
     * Create player health display
     */
    createPlayerHealthDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;
        
        this.playerHealthText = this.scene.add.text(width * 0.25, height * 0.25, 
            `HP: ${player.health}/${player.maxHealth}`, {
                fontFamily: "'VT323'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        
        this.healthBars.player = this.makeHealthBar(width * 0.25, height * 0.3, 150, 15, 0x00ff00);
        this.updateHealthBar(this.healthBars.player, player.health, player.maxHealth);
    }

    /**
     * Create player mana display
     */
    createPlayerManaDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;
        
        this.playerManaText = this.scene.add.text(width * 0.25, height * 0.35, 
            `MP: ${player.mana}/${player.maxMana}`, {
                fontFamily: "'VT323'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        
        this.manaBars.player = this.makeManaBar(width * 0.25, height * 0.4, 150, 15, 0x0066ff);
        this.updateManaBar(this.manaBars.player, player.mana, player.maxMana);
    }

    /**
     * Create enemy panel
     */
    createEnemyPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create panel background
        this.scene.ui.createPanel(
            width * 0.75,
            height * 0.25,
            width * 0.4,
            height * 0.2,
            {
                fillColor: 0x221111,
                fillAlpha: 0.7,
                borderColor: 0xff3333,
                borderThickness: 2
            }
        );
    }

    /**
     * Create combat action buttons
     */
    createCombatActionButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create container for buttons
        const buttonContainer = this.scene.add.container(width * 0.85, height * 0.7);
        
        // Create attack button
        const attackButton = this.scene.ui.createButton(0, 0, 'Attack', () => {
            this.scene.combatEngine.processPlayerAttack('basic');
        });
        this.buttons.attack = attackButton.bg;
        
        // Create special button
        const specialButton = this.scene.ui.createButton(0, 50, 'Special', () => {
            this.scene.combatEngine.processPlayerAttack('special');
        });
        this.buttons.special = specialButton.bg;
        
        // Create item button
        const itemButton = this.scene.ui.createButton(0, 100, 'Items', () => {
            this.showItemMenu();
        });
        this.buttons.item = itemButton.bg;
        
        // Create retreat button
        const retreatButton = this.scene.ui.createButton(0, 150, 'Retreat', () => {
            this.scene.handleRetreat();
        });
        this.buttons.retreat = retreatButton.bg;
        
        // Add buttons to container
        buttonContainer.add([
            attackButton.bg, attackButton.text, 
            specialButton.bg, specialButton.text, 
            itemButton.bg, itemButton.text,
            retreatButton.bg, retreatButton.text
        ]);
    }

    /**
     * Show item menu
     */
    showItemMenu() {
        // Create menu container
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        const menuContainer = this.scene.add.container(width * 0.5, height * 0.5);
        
        // Create menu background
        const bg = this.scene.add.rectangle(0, 0, width * 0.3, height * 0.4, 0x000000, 0.8);
        menuContainer.add(bg);
        
        // Add items
        const items = gameState.player.inventory || [];
        items.forEach((item, index) => {
            const itemButton = this.scene.ui.createButton(0, -50 + (index * 40), item.name, () => {
                this.scene.combatEngine.processItemUse(item);
                menuContainer.destroy();
            });
            menuContainer.add(itemButton.bg);
            menuContainer.add(itemButton.text);
        });
        
        // Add close button
        const closeButton = this.scene.ui.createButton(0, height * 0.15, 'Close', () => {
            menuContainer.destroy();
        });
        menuContainer.add(closeButton.bg);
        menuContainer.add(closeButton.text);
    }

    /**
     * Create a health bar
     */
    makeHealthBar(x, y, width, height, color) {
        // Create background, bar and border
        const barX = x - width/2;
        const barY = y - height/2;
        
        const bar = {
            x: barX,
            y: barY,
            width: width,
            height: height,
            color: color,
            bg: this.scene.add.rectangle(x, y, width, height, 0x333333).setOrigin(0.5),
            bar: this.scene.add.graphics(),
            border: this.scene.add.graphics()
        };
        
        // Draw the initial health bar
        bar.bar.fillStyle(color, 1);
        bar.bar.fillRect(barX, barY, width, height);
        
        // Draw border
        bar.border.lineStyle(2, 0xffffff, 1);
        bar.border.strokeRect(barX, barY, width, height);
        
        return bar;
    }

    /**
     * Create a mana bar
     */
    makeManaBar(x, y, width, height, color) {
        return this.makeHealthBar(x, y, width, height, color);
    }

    /**
     * Update health bar display
     */
    updateHealthBar(bar, current, max) {
        if (!bar || !bar.bar) return;
        
        // Ensure health doesn't exceed maximum
        current = Math.min(current, max);
        
        // Calculate percentage
        const percent = Math.max(0, Math.min(current / max, 1));
        
        // Clear previous graphics
        bar.bar.clear();
        
        // Draw new health bar - only from left to right
        bar.bar.fillStyle(bar.color, 1);
        bar.bar.fillRect(
            bar.x, 
            bar.y, 
            bar.width * percent, 
            bar.height
        );
    }

    /**
     * Update mana bar display
     */
    updateManaBar(bar, current, max) {
        this.updateHealthBar(bar, current, max);
    }

    /**
     * Update player health display
     */
    updatePlayerHealth() {
        const player = gameState.player;
        this.updateHealthBar(this.healthBars.player, player.health, player.maxHealth);
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
    }

    /**
     * Update player mana display
     */
    updatePlayerMana() {
        const player = gameState.player;
        this.updateManaBar(this.manaBars.player, player.mana, player.maxMana);
        this.playerManaText.setText(`MP: ${player.mana}/${player.maxMana}`);
    }

    /**
     * Update player stats (health and mana)
     */
    updatePlayerStats() {
        this.updatePlayerHealth();
        this.updatePlayerMana();
    }

    /**
     * Update enemy health display
     */
    updateEnemyHealth(enemy) {
        // Call SpriteManager's method to update the health bar
        if (this.scene.spriteManager) {
            this.scene.spriteManager.updateEnemyHealthBar(enemy);
        }
    }

    /**
     * Enable action buttons
     */
    enableActionButtons() {
        Object.values(this.buttons).forEach(button => {
            button.setInteractive();
        });
    }

    /**
     * Disable action buttons
     */
    disableActionButtons() {
        Object.values(this.buttons).forEach(button => {
            button.disableInteractive();
        });
    }
}
