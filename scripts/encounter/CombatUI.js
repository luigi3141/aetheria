import { ASSET_PATHS } from '../config/AssetConfig.js';
import gameState from '../gameState.js';

export default class CombatUI {
    constructor(scene) {
        this.scene = scene;
        this.buttons = {};
        this.healthBars = {};
        this.manaBars = {};
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

        const playerName = gameState.player.name || 'Adventurer';
        this.playerNameText = this.scene.add.text(width * 0.25, height * 0.2, playerName, {
            fontFamily: "'Press Start 2P'",
            fontSize: this.scene.ui.fontSize.sm + 'px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.createPlayerHealthDisplay();
        this.createPlayerManaDisplay();
    }

    createPlayerHealthDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;

        this.healthBars.player = this.makeHealthBar(width * 0.25, height * 0.3, 200, 20, 0x00ff00);
        this.playerHealthText = this.scene.add.text(width * 0.25, height * 0.3, 
            `HP: ${player.health}/${player.maxHealth}`, {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
    }

    createPlayerManaDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;

        this.manaBars.player = this.makeManaBar(width * 0.25, height * 0.38, 200, 20, 0x0066ff);
        this.playerManaText = this.scene.add.text(width * 0.25, height * 0.38, 
            `MP: ${player.mana}/${player.maxMana}`, {
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
    }

    createEnemyPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

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

    createCombatActionButtons() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const spacing = 160;
        const buttonY = height * 0.88;
        const buttonWidth = 140;
        const buttonHeight = 50;
        const startX = width / 2 - spacing * 1.5;

        const createStyledButton = (x, label, color, hoverColor, callback) => {
            const btn = this.scene.ui.createButton(x, buttonY, label, callback, {
                width: buttonWidth,
                height: buttonHeight,
                fillColor: color,
                hoverColor: hoverColor
            });
            return btn; // return full button object, not just .bg
        };

        this.buttons.attack = createStyledButton(startX, 'Attack', 0x2ecc71, 0x27ae60, () => {
            this.scene.combatEngine.processPlayerAttack('basic');
        });
        
        this.buttons.special = createStyledButton(startX + spacing, 'Special', 0x9b59b6, 0x8e44ad, () => {
            this.scene.combatEngine.processPlayerAttack('special');
        });
        
        this.buttons.inventory = createStyledButton(startX + spacing * 2, 'Inventory', 0x888888, 0x666666, () => {
            gameState.previousScene = 'EncounterScene';
            this.scene.scene.start('InventoryScene');
        });
        
        this.buttons.retreat = createStyledButton(startX + spacing * 3, 'Retreat', 0xe74c3c, 0xc0392b, () => {
            this.scene.handleRetreat();
        });
        
    }

    showItemMenu() {}

    makeHealthBar(x, y, width, height, color) {
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

        bar.bar.fillStyle(color, 1);
        bar.bar.fillRect(barX, barY, width, height);

        bar.border.lineStyle(2, 0xffffff, 1);
        bar.border.strokeRect(barX, barY, width, height);

        return bar;
    }

    makeManaBar(x, y, width, height, color) {
        return this.makeHealthBar(x, y, width, height, color);
    }

    updateHealthBar(bar, current, max) {
        if (!bar || !bar.bar) return;

        current = Math.min(current, max);
        const percent = Math.max(0, Math.min(current / max, 1));

        bar.bar.clear();
        bar.bar.fillStyle(bar.color, 1);
        bar.bar.fillRect(
            bar.x, 
            bar.y, 
            bar.width * percent, 
            bar.height
        );
    }

    updateManaBar(bar, current, max) {
        this.updateHealthBar(bar, current, max);
    }

    updatePlayerHealth() {
        const player = gameState.player;
        this.updateHealthBar(this.healthBars.player, player.health, player.maxHealth);
        this.playerHealthText.setText(`HP: ${player.health}/${player.maxHealth}`);
    }

    updatePlayerMana() {
        const player = gameState.player;
        this.updateManaBar(this.manaBars.player, player.mana, player.maxMana);
        this.playerManaText.setText(`MP: ${player.mana}/${player.maxMana}`);
    }

    updatePlayerStats() {
        this.updatePlayerHealth();
        this.updatePlayerMana();
    }

    updateEnemyHealth(enemy) {
        if (this.scene.spriteManager) {
            this.scene.spriteManager.updateEnemyHealthBar(enemy, `HP: ${enemy.health}/${enemy.maxHealth}`);
        }
    }

    enableActionButtons() {
        Object.values(this.buttons).forEach(button => button.bg.setInteractive());
    }

    disableActionButtons() {
        Object.values(this.buttons).forEach(button => button.bg.disableInteractive());
    }
}
