import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import TransitionManager from '../ui/TransitionManager.js';
import HealthManager from '../utils/HealthManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import BaseScene from './BaseScene.js';

class DungeonScene extends BaseScene {
    constructor() {
        super({ key: 'DungeonScene' });
    }

    preload() {
        const dungeon = gameState.currentDungeon;
        if (dungeon?.backgroundKey) {
            if (this.textures.exists('combat-bg')) {
                this.textures.remove('combat-bg');
            }
            this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS[dungeon.backgroundKey.toUpperCase().replace('-BG', '')]);
        } else {
            this.load.image('combat-bg', ASSET_PATHS.BACKGROUNDS.COMBAT);
        }

        const playerClass = gameState.player.class?.toUpperCase() || 'DEFAULT';
        const spriteKey = `player-${playerClass.toLowerCase()}`;
        const spritePath = ASSET_PATHS.PLAYERS[playerClass] || ASSET_PATHS.PLAYERS.DEFAULT;
        this.load.image(spriteKey, spritePath);
        this.playerSpriteKey = spriteKey;
    }

    init(data) {
        if (!gameState.currentDungeon) {
            this.initializeDungeon();
        }
    }

    create(data) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.ui = new UIManager(this);
        this.transitions = new TransitionManager(this);

        this.safeAddImage(width / 2, height / 2, 'combat-bg', null, { displayWidth: width, displayHeight: height });

        // Add dungeon title with background for contrast
        const dungeon = gameState.currentDungeon;
        this.add.rectangle(width / 2, height * 0.06, 400, 40, 0x000000, 0.6)
            .setOrigin(0.5);
        this.add.text(width / 2, height * 0.06, dungeon.name, {
            fontFamily: "'Press Start 2P'",
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.createPlayer();
        this.createExplorationUI();
    }

    initializeDungeon() {
        let dungeonId = gameState.dungeons?.current || 'verdant-woods';
        let dungeonTemplate = gameState.dungeonList.find(d => d.id === dungeonId) || gameState.dungeonList[0];

        gameState.currentDungeon = {
            id: dungeonTemplate.id,
            name: dungeonTemplate.name,
            level: dungeonTemplate.minLevel || 1,
            backgroundKey: dungeonTemplate.backgroundKey || 'COMBAT',
            enemies: dungeonTemplate.enemies || ['goblin']
        };
    }

    createPlayer() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.player = this.add.sprite(
            width / 2,
            height * 0.6,
            this.playerSpriteKey
        ).setScale(2);

        const playerHighlight = this.add.circle(
            width / 2,
            height * 0.75,
            25,
            0xffff00,
            0.3
        );

        this.tweens.add({
            targets: playerHighlight,
            alpha: 0.5,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    createExplorationUI() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.9;
        const buttonSpacing = width * 0.2;

        new Button(
            this,
            width * 0.2,
            buttonY,
            'INVENTORY',
            () => {
                gameState.previousScene = 'DungeonScene';
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'InventoryScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0x999999,
                hoverColor: 0x777777
            }
        );

        new Button(
            this,
            width * 0.5,
            buttonY,
            'ADVANCE',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'EncounterScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0x00cc00,
                hoverColor: 0x009900
            }
        );

        new Button(
            this,
            width * 0.8,
            buttonY,
            'RETREAT',
            () => {
                this.transitions.fade(() => {
                    navigationManager.navigateTo(this, 'OverworldScene');
                });
            },
            {
                width: 160,
                height: 50,
                fillColor: 0xcc0000,
                hoverColor: 0x990000
            }
        );

        HealthManager.validatePlayerHealth();

        const player = gameState.player;
        this.add.text(
            width * 0.15,
            height * 0.1,
            `${player.name || 'Adventurer'}\nHP: ${player.health}/${player.maxHealth}\nMP: ${player.mana}/${player.maxMana}`,
            {
                fontFamily: "'VT323'",
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    }
}

export default DungeonScene;
