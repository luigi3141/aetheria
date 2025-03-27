import { ASSET_PATHS } from '../config/AssetConfig.js';
import { LAYOUT } from '../config/Layout.js';
import gameState from '../gameState.js';

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
            LAYOUT.COMBAT.PLAYER_PANEL.x || width * 0.25,
            LAYOUT.COMBAT.PLAYER_PANEL.y || height * 0.25,
            LAYOUT.COMBAT.PLAYER_PANEL.width || width * 0.4,
            LAYOUT.COMBAT.PLAYER_PANEL.height || height * 0.2,
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
            LAYOUT.COMBAT.PLAYER_PANEL.x || width * 0.25, 
            (LAYOUT.COMBAT.PLAYER_PANEL.y || height * 0.25) - 30, 
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
            LAYOUT.COMBAT.PLAYER_HEALTH.x || width * 0.25,
            LAYOUT.COMBAT.PLAYER_HEALTH.y || height * 0.3,
            player.health,
            player.maxHealth,
            {
                barColor: 0x00ff00,
                textPrefix: 'HP',
                fontFamily: "'Press Start 2P'",
                fontSize: this.scene.ui.fontSize.sm
            }
        );
    }

    createPlayerManaDisplay() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        const player = gameState.player;

        this.statusBars.playerMana = this.scene.ui.createStatusBar(
            LAYOUT.COMBAT.PLAYER_MANA.x || width * 0.25,
            LAYOUT.COMBAT.PLAYER_MANA.y || height * 0.38,
            player.mana,
            player.maxMana,
            {
                barColor: 0x0066ff,
                textPrefix: 'MP',
                fontFamily: "'Press Start 2P'",
                fontSize: this.scene.ui.fontSize.sm
            }
        );
    }

    createEnemyPanel() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        this.scene.ui.createPanel(
            LAYOUT.COMBAT.ENEMY_PANEL.x || width * 0.75,
            LAYOUT.COMBAT.ENEMY_PANEL.y || height * 0.25,
            LAYOUT.COMBAT.ENEMY_PANEL.width || width * 0.4,
            LAYOUT.COMBAT.ENEMY_PANEL.height || height * 0.2,
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
            return btn; 
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

    updatePlayerHealth() {
        const player = gameState.player;
        this.statusBars.playerHealth.update(player.health, player.maxHealth);
    }

    updatePlayerMana() {
        const player = gameState.player;
        this.statusBars.playerMana.update(player.mana, player.maxMana);
    }

    createEnemyHealthBar(enemy) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        const enemyHealthBar = this.scene.ui.createStatusBar(
            LAYOUT.COMBAT.ENEMY_HEALTH.x || width * 0.75,
            LAYOUT.COMBAT.ENEMY_HEALTH.y || height * 0.3,
            enemy.health,
            enemy.maxHealth,
            {
                barColor: 0xff0000,
                textPrefix: 'HP',
                fontFamily: "'Press Start 2P'",
                fontSize: this.scene.ui.fontSize.sm
            }
        );
        
        const nameText = this.scene.add.text(
            LAYOUT.COMBAT.ENEMY_HEALTH.x || width * 0.75,
            (LAYOUT.COMBAT.ENEMY_HEALTH.y || height * 0.3) - 30,
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
        if (!enemy || !enemy.displayElements || !enemy.displayElements.healthBar) return;
        
        enemy.displayElements.healthBar.update(enemy.health, enemy.maxHealth);
    }
    
    enableActionButtons() {
        Object.values(this.buttons).forEach(button => button.bg.setInteractive());
    }

    disableActionButtons() {
        Object.values(this.buttons).forEach(button => button.bg.disableInteractive());
    }
}
