import { LAYOUT } from './path/to/ui/layout/LayoutHelper.js';
import gameState from '../gameState.js';

/**
 * Handles combat UI elements
 */
export default class CombatUI {
    constructor(scene) {
        this.scene = scene;
        this.buttons = {};
        this.healthBars = {};
        this.itemMenu = null;
    }

    /**
     * Create the combat UI
     */
    createCombatUI() {
        this.createHealthBars();
        this.createActionButtons();
    }

    /**
     * Create health bars for player and enemy
     */
    createHealthBars() {
        // Player health and mana
        const player = gameState.player;
        
        // Create background bars first
        this.healthBars.playerBg = this.scene.add.rectangle(
            LAYOUT.COMBAT.PLAYER_HEALTH.x,
            LAYOUT.COMBAT.PLAYER_HEALTH.y + 12,
            200, 20, 0x333333
        ).setOrigin(0, 0.5);

        this.healthBars.manaBg = this.scene.add.rectangle(
            LAYOUT.COMBAT.PLAYER_HEALTH.x,
            LAYOUT.COMBAT.PLAYER_HEALTH.y + 42,
            200, 20, 0x333333
        ).setOrigin(0, 0.5);

        // Create health bar container
        const healthBarContainer = this.scene.add.container(LAYOUT.COMBAT.PLAYER_HEALTH.x, LAYOUT.COMBAT.PLAYER_HEALTH.y + 12);
        const healthBarMask = this.scene.add.rectangle(0, 0, 200, 20, 0xffffff).setOrigin(0, 0.5);
        healthBarContainer.setMask(healthBarMask.createGeometryMask());

        this.healthBars.player = {
            text: this.scene.add.text(
                LAYOUT.COMBAT.PLAYER_HEALTH.x,
                LAYOUT.COMBAT.PLAYER_HEALTH.y,
                `HP: ${player.health}/${player.maxHealth}`,
                { fontSize: '24px', fill: '#00ff00' }
            ),
            bar: this.scene.add.rectangle(
                0, 0, 200, 20, 0x00ff00
            ).setOrigin(0, 0.5),
            container: healthBarContainer,
            mask: healthBarMask
        };
        healthBarContainer.add(this.healthBars.player.bar);

        // Create mana bar container
        const manaBarContainer = this.scene.add.container(LAYOUT.COMBAT.PLAYER_HEALTH.x, LAYOUT.COMBAT.PLAYER_HEALTH.y + 42);
        const manaBarMask = this.scene.add.rectangle(0, 0, 200, 20, 0xffffff).setOrigin(0, 0.5);
        manaBarContainer.setMask(manaBarMask.createGeometryMask());

        this.healthBars.mana = {
            text: this.scene.add.text(
                LAYOUT.COMBAT.PLAYER_HEALTH.x,
                LAYOUT.COMBAT.PLAYER_HEALTH.y + 30,
                `MP: ${player.mana}/${player.maxMana}`,
                { fontSize: '24px', fill: '#0088ff' }
            ),
            bar: this.scene.add.rectangle(
                0, 0, 200, 20, 0x0088ff
            ).setOrigin(0, 0.5),
            container: manaBarContainer,
            mask: manaBarMask
        };
        manaBarContainer.add(this.healthBars.mana.bar);

        // Enemy health and name
        const enemy = this.scene.enemies[0];
        
        // Enemy background bar
        this.healthBars.enemyBg = this.scene.add.rectangle(
            LAYOUT.COMBAT.ENEMY_HEALTH.x,
            LAYOUT.COMBAT.ENEMY_HEALTH.y + 12,
            200, 20, 0x333333
        ).setOrigin(0, 0.5);
        
        // Create enemy health bar container
        const enemyBarContainer = this.scene.add.container(LAYOUT.COMBAT.ENEMY_HEALTH.x, LAYOUT.COMBAT.ENEMY_HEALTH.y + 12);
        const enemyBarMask = this.scene.add.rectangle(0, 0, 200, 20, 0xffffff).setOrigin(0, 0.5);
        enemyBarContainer.setMask(enemyBarMask.createGeometryMask());

        // Enemy name
        this.healthBars.enemyName = this.scene.add.text(
            LAYOUT.COMBAT.ENEMY_HEALTH.x,
            LAYOUT.COMBAT.ENEMY_HEALTH.y - 40,
            enemy.name,
            { fontSize: '32px', fill: '#ffffff', align: 'center' }
        ).setOrigin(0, 0.5);

        // Enemy health
        this.healthBars.enemy = {
            text: this.scene.add.text(
                LAYOUT.COMBAT.ENEMY_HEALTH.x,
                LAYOUT.COMBAT.ENEMY_HEALTH.y,
                `HP: ${enemy.health}/${enemy.maxHealth}`,
                { fontSize: '24px', fill: '#ff0000' }
            ),
            bar: this.scene.add.rectangle(
                0, 0, 200, 20, 0xff0000
            ).setOrigin(0, 0.5),
            container: enemyBarContainer,
            mask: enemyBarMask
        };
        enemyBarContainer.add(this.healthBars.enemy.bar);
    }

    /**
     * Create action buttons
     */
    createActionButtons() {
        // Attack button
        const attackButton = this.scene.add.text(
            LAYOUT.COMBAT.BUTTONS.ATTACK.x,
            LAYOUT.COMBAT.BUTTONS.ATTACK.y,
            'Attack',
            { fontSize: '24px', fill: '#ffffff' }
        )
        .setInteractive()
        .on('pointerdown', () => {
            if (!this.scene.combatEngine.turnInProgress) {
                this.scene.combatEngine.processPlayerAttack('basic');
            }
        })
        .on('pointerover', () => attackButton.setStyle({ fill: '#ff0' }))
        .on('pointerout', () => attackButton.setStyle({ fill: '#fff' }));
        
        this.buttons.attack = attackButton;

        // Special attack button
        const specialButton = this.scene.add.text(
            LAYOUT.COMBAT.BUTTONS.SPECIAL.x,
            LAYOUT.COMBAT.BUTTONS.SPECIAL.y,
            'Special',
            { fontSize: '24px', fill: '#ffffff' }
        )
        .setInteractive()
        .on('pointerdown', () => {
            if (!this.scene.combatEngine.turnInProgress) {
                this.scene.combatEngine.processPlayerAttack('special');
            }
        })
        .on('pointerover', () => specialButton.setStyle({ fill: '#ff0' }))
        .on('pointerout', () => specialButton.setStyle({ fill: '#fff' }));
        
        this.buttons.special = specialButton;

        // Item button
        const itemButton = this.scene.add.text(
            LAYOUT.COMBAT.BUTTONS.ITEM.x,
            LAYOUT.COMBAT.BUTTONS.ITEM.y,
            'Items',
            { fontSize: '24px', fill: '#ffffff' }
        )
        .setInteractive()
        .on('pointerdown', () => {
            if (!this.scene.combatEngine.turnInProgress) {
                // Store current scene for return
                gameState.previousScene = 'EncounterScene';
                this.scene.scene.start('InventoryScene');
            }
        })
        .on('pointerover', () => itemButton.setStyle({ fill: '#ff0' }))
        .on('pointerout', () => itemButton.setStyle({ fill: '#fff' }));
        
        this.buttons.item = itemButton;
    }

    /**
     * Update player health display
     */
    updatePlayerHealth() {
        const player = gameState.player;
        const healthPercent = player.health / player.maxHealth;
        const manaPercent = player.mana / player.maxMana;

        // Update health
        this.healthBars.player.text.setText(`HP: ${player.health}/${player.maxHealth}`);
        this.healthBars.player.mask.x = LAYOUT.COMBAT.PLAYER_HEALTH.x;
        this.healthBars.player.mask.width = 200 * healthPercent;
        
        if (healthPercent < 0.3) {
            this.healthBars.player.text.setStyle({ fill: '#ff0000' });
            this.healthBars.player.bar.setFillStyle(0xff0000);
        } else if (healthPercent < 0.6) {
            this.healthBars.player.text.setStyle({ fill: '#ffff00' });
            this.healthBars.player.bar.setFillStyle(0xffff00);
        }

        // Update mana
        this.healthBars.mana.text.setText(`MP: ${player.mana}/${player.maxMana}`);
        this.healthBars.mana.mask.x = LAYOUT.COMBAT.PLAYER_HEALTH.x;
        this.healthBars.mana.mask.width = 200 * manaPercent;
    }

    /**
     * Update enemy health display
     */
    updateEnemyHealth(enemy) {
        const healthPercent = enemy.health / enemy.maxHealth;

        // Update health text and bar
        this.healthBars.enemy.text.setText(`HP: ${enemy.health}/${enemy.maxHealth}`);
        this.healthBars.enemy.mask.x = LAYOUT.COMBAT.ENEMY_HEALTH.x;
        this.healthBars.enemy.mask.width = 200 * healthPercent;
        
        if (healthPercent < 0.3) {
            this.healthBars.enemy.text.setStyle({ fill: '#ff0000' });
            this.healthBars.enemy.bar.setFillStyle(0xff0000);
        } else if (healthPercent < 0.6) {
            this.healthBars.enemy.text.setStyle({ fill: '#ffff00' });
            this.healthBars.enemy.bar.setFillStyle(0xffff00);
        }
    }

    /**
     * Enable all action buttons
     */
    enableButtons() {
        Object.values(this.buttons).forEach(button => {
            button.setAlpha(1);
            button.setInteractive();
        });
    }

    /**
     * Disable all action buttons
     */
    disableButtons() {
        Object.values(this.buttons).forEach(button => {
            button.setAlpha(0.5);
            button.disableInteractive();
        });
    }
}
