import { LAYOUT } from '../ui/layout/LayoutHelper.js';
import gameState from '../utils/gameState.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';

export default class CombatUI {
    constructor(scene) {
        this.scene = scene;
        this.buttons = {};
        this.statusBars = {}; 
    }

    createCombatUI() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        const titleText = 'Combat Encounter';
        this.scene.ui.createTitle(width/2, height * 0.08, titleText, {
            fontSize: this.scene.ui.fontSize.lg
        });

        this.createPlayerPanel();
        this.createEnemyPanel();
        this.createCombatActionButtons();
    }

    createPlayerPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        this.scene.ui.createPanel(
            width * LAYOUT.COMBAT.PLAYER_PANEL.x,
            height * LAYOUT.COMBAT.PLAYER_PANEL.y,
            width * LAYOUT.COMBAT.PLAYER_PANEL.width,
            height * LAYOUT.COMBAT.PLAYER_PANEL.height,
            {
                fillColor: 0x111122,
                fillAlpha: 0.7,
                borderColor: 0x3399ff,
                borderThickness: 2
            }
        );

        const player = gameState.player;
        const playerName = player.name || 'Adventurer';
        
        this.playerNameText = this.scene.add.text(
            width * LAYOUT.COMBAT.PLAYER_PANEL.x, 
            (height * LAYOUT.COMBAT.PLAYER_PANEL.y) - 30, 
            playerName, 
            {
                fontFamily: "'Press Start 2P'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        this.createPlayerHealthDisplay();
        this.createPlayerManaDisplay();
    }

    createPlayerHealthDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;

        this.statusBars.playerHealth = this.scene.ui.createStatusBar(
            width * LAYOUT.COMBAT.PLAYER_HEALTH.x,
            height * LAYOUT.COMBAT.PLAYER_HEALTH.y,
            player.health,
            player.maxHealth,
            {
                ...LAYOUT.COMBAT.PLAYER_HEALTH.style,
                textPrefix: 'HP',
                fontFamily: "'Press Start 2P'"
            }
        );
    }

    createPlayerManaDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;

        this.statusBars.playerMana = this.scene.ui.createStatusBar(
            width * LAYOUT.COMBAT.PLAYER_MANA.x,
            height * LAYOUT.COMBAT.PLAYER_MANA.y,
            player.mana,
            player.maxMana,
            {
                ...LAYOUT.COMBAT.PLAYER_MANA.style,
                textPrefix: 'MP',
                fontFamily: "'Press Start 2P'"
            }
        );
    }

    createEnemyPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        this.scene.ui.createPanel(
            width * LAYOUT.COMBAT.ENEMY_PANEL.x,
            height * LAYOUT.COMBAT.ENEMY_PANEL.y,
            width * LAYOUT.COMBAT.ENEMY_PANEL.width,
            height * LAYOUT.COMBAT.ENEMY_PANEL.height,
            {
                fillColor: 0x221111,
                fillAlpha: 0.7,
                borderColor: 0xff3333,
                borderThickness: 2
            }
        );
    }

    createCombatActionButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        // --- Adjust spacing/positioning if removing a button ---
        const buttonCount = 3; // Now only 3 buttons: Attack, Special, Retreat
        const totalButtonWidth = (buttonCount * 140) + ((buttonCount - 1) * 20); // Example width/spacing
        const spacing = 160; // Keep spacing or adjust as needed
        const startX = width / 2 - ((buttonCount - 1) * spacing) / 2; // Center the group

        const buttonY = height * 0.88;
        const buttonWidth = 140;
        const buttonHeight = 50;

        const createStyledButton = (x, label, color, hoverColor, callback) => {
            const btn = this.scene.ui.createButton(x, buttonY, label, callback, {
                width: buttonWidth,
                height: buttonHeight,
                fillColor: color,
                hoverColor: hoverColor
            });
            return btn;
        };

        this.buttons.attack = createStyledButton(startX, 'Attack', 0x2ecc71, 0x27ae60, () => {
            this.disableActionButtons();
            this.scene.processPlayerAttack('basic');
        });
        
        this.buttons.special = createStyledButton(startX + spacing, 'Special', 0x9b59b6, 0x8e44ad, () => {
            this.disableActionButtons();
            this.scene.processPlayerAttack('special');
        });
        /*
        this.buttons.inventory = createStyledButton(startX + spacing * 2, 'Inventory', 0x888888, 0x666666, () => {
            gameState.previousScene = 'EncounterScene';
            this.scene.scene.start('InventoryScene');
        });
        */
        
        this.buttons.retreat = createStyledButton(startX + spacing * 2, 'Retreat', 0xe74c3c, 0xc0392b, () => {
            this.scene.handleRetreat();
        });
    }

    showItemMenu() {}

    updatePlayerHealth() {
        const player = gameState.player;
        if (this.statusBars.playerHealth) { // Check existence
            this.statusBars.playerHealth.update(player.health, player.maxHealth);
        }
    }

    updatePlayerMana() {
        const player = gameState.player;
        if (this.statusBars.playerMana) { // Check existence
            this.statusBars.playerMana.update(player.mana, player.maxMana);
        }
    }

    createEnemyHealthBar(enemy) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        const enemyHealthBar = this.scene.ui.createStatusBar(
            width * LAYOUT.COMBAT.ENEMY_HEALTH.x,
            height * LAYOUT.COMBAT.ENEMY_HEALTH.y,
            enemy.health,
            enemy.maxHealth,
            {
                ...LAYOUT.COMBAT.ENEMY_HEALTH.style,
                textPrefix: 'HP',
                fontFamily: "'Press Start 2P'"
            }
        );
        
        const nameText = this.scene.add.text(
            width * LAYOUT.COMBAT.ENEMY_HEALTH.x,
            (height * LAYOUT.COMBAT.ENEMY_HEALTH.y) - 30,
            enemy.name,
            {
                fontFamily: "'Press Start 2P'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
                align: 'center'
            }
        ).setOrigin(0.5);
        
        enemy.displayElements = {
            nameText: nameText,
            healthBar: enemyHealthBar
        };
        
        return enemyHealthBar;
    }
    
    updateEnemyHealthBar(enemy) {
        if (!enemy?.displayElements?.healthBar) return; // Check existence safely
        enemy.displayElements.healthBar.update(enemy.health, enemy.maxHealth);
    }
    
    enableActionButtons() {
        console.log("[CombatUI] Enabling action buttons...");
        Object.values(this.buttons).forEach((button) => { // Simplified loop
            if (button && typeof button.enable === 'function') {
                 button.enable();
                 // if(button.container) button.container.setAlpha(1); // Optional alpha reset
            }
        });
    }

    disableActionButtons() {
        console.log("[CombatUI] Disabling action buttons...");
         Object.values(this.buttons).forEach((button) => { // Simplified loop
             if (button && typeof button.disable === 'function') {
                  button.disable();
                  // if(button.container) button.container.setAlpha(0.5); // Optional alpha set
             }
         });
     }
     
    playEffectAnimation(effectKey, targetX, targetY, onComplete = null) {
        const effect = this.scene.add.sprite(targetX, targetY, effectKey)
            .setScale(2)
            .setDepth(3000) // Increased depth to be above both player and enemy (1000)
            .setAlpha(0);

        // Create a simple fade in/out animation using tweens instead of sprite animation
        this.scene.tweens.add({
            targets: effect,
            alpha: { from: 0, to: 1 },
            duration: 300, // Increased duration to be more visible
            ease: 'Linear',
            yoyo: true,
            hold: 100, // Hold at full opacity for a moment
            onComplete: () => {
                effect.destroy();
                if (onComplete) onComplete();
            }
        });
    }

    destroy() {
        console.log("[CombatUI] Destroying UI elements...");

        // Destroy buttons
        console.log("- Destroying buttons...");
        Object.values(this.buttons).forEach(button => {
            if (button && typeof button.destroy === 'function') {
                try { button.destroy(); } catch (e) { console.warn("Error destroying button:", e); }
            }
        });
        this.buttons = {};

        // Destroy status bars
        console.log("- Destroying status bars...");
        Object.values(this.statusBars).forEach(statusBar => {
            if (statusBar && typeof statusBar.destroy === 'function') {
                try { statusBar.destroy(); } catch (e) { console.warn("Error destroying status bar:", e); }
            }
        });
        this.statusBars = {};

        // Destroy text elements created by CombatUI
        console.log("- Destroying text elements...");
        if (this.playerNameText && typeof this.playerNameText.destroy === 'function') {
             try { this.playerNameText.destroy(); } catch (e) { console.warn("Error destroying playerNameText:", e); }
        }
        this.playerNameText = null;

        // Destroy enemy name texts (if stored like this)
        Object.values(this.enemyNameText).forEach(text => {
             if (text && typeof text.destroy === 'function') {
                 try { text.destroy(); } catch (e) { console.warn("Error destroying enemy name text:", e); }
             }
        });
        this.enemyNameText = {};

        // Destroy panels if stored
        // if (this.playerPanel && typeof this.playerPanel.destroy === 'function') this.playerPanel.destroy();
        // if (this.enemyPanel && typeof this.enemyPanel.destroy === 'function') this.enemyPanel.destroy();
        // this.playerPanel = null;
        // this.enemyPanel = null;

        console.log("[CombatUI] UI elements destroyed.");
    }
}
