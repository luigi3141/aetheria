import { ASSET_PATHS } from '../config/AssetConfig.js';
import { LAYOUT } from '../config/Layout.js';

export default class SpriteManager {
    constructor(scene) {
        this.scene = scene;
        this.sprites = {};
        this.playerSprite = null;
        this.enemySprite = null;
    }

    /**
     * Preload sprite assets
     */
    preloadSprites() {
        // Player sprite
        this.scene.load.image('player', ASSET_PATHS.PLAYERS.DEFAULT);
        
        // Enemy sprites
        const enemyTypes = ['DEFAULT', 'GOBLIN', 'SPIDER', 'WOLF'];
        enemyTypes.forEach(type => {
            this.scene.load.image(type.toLowerCase(), ASSET_PATHS.ENEMIES[type]);
        });
    }

    /**
     * Create player sprite
     */
    createPlayerSprite() {
        // Remove existing sprite if any
        if (this.playerSprite) {
            this.playerSprite.destroy();
        }

        // Create player sprite
        this.playerSprite = this.scene.add.sprite(
            LAYOUT.COMBAT.SPRITES.PLAYER.x,
            LAYOUT.COMBAT.SPRITES.PLAYER.y,
            'player'
        ).setScale(3);
        
        // Add a slight bobbing animation
        this.scene.tweens.add({
            targets: this.playerSprite,
            y: this.playerSprite.y + 8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Create enemy sprite display
     */
    createEnemyDisplay(enemy) {
        // Remove existing enemy sprite if any
        if (this.enemySprite) {
            this.enemySprite.destroy();
        }

        // Get sprite key from enemy type
        const spriteKey = enemy.sprite ? enemy.sprite.replace('-sprite', '') : 
                         (enemy.type ? enemy.type.toLowerCase() : 'default');
        
        // Create enemy sprite
        this.enemySprite = this.scene.add.sprite(
            LAYOUT.COMBAT.SPRITES.ENEMY.x,
            LAYOUT.COMBAT.SPRITES.ENEMY.y,
            spriteKey
        ).setScale(3);
        
        // Add a slight bobbing animation to make the enemy sprite feel alive
        this.scene.tweens.add({
            targets: this.enemySprite,
            y: this.enemySprite.y + 8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Create enemy health bar
        this.createEnemyHealthBar(enemy);
    }
    
    /**
     * Create enemy health bar
     */
    createEnemyHealthBar(enemy) {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Health bar dimensions
        const healthBarWidth = 200;
        const healthBarHeight = 20;
        const healthBarX = width * 0.75;
        const healthBarY = height * 0.3;
        
        // Create health bar background
        const healthBarBg = this.scene.add.rectangle(
            healthBarX,
            healthBarY,
            healthBarWidth,
            healthBarHeight,
            0x333333
        ).setOrigin(0.5);
        
        // Create health bar foreground
        const healthBar = this.scene.add.graphics();
        
        // Draw initial health bar
        const healthPercentage = enemy.health / enemy.maxHealth;
        healthBar.fillStyle(0xff0000, 1);
        healthBar.fillRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
        
        // Add border
        const healthBarBorder = this.scene.add.graphics();
        healthBarBorder.lineStyle(2, 0xffffff, 1);
        healthBarBorder.strokeRect(
            healthBarX - healthBarWidth / 2,
            healthBarY - healthBarHeight / 2,
            healthBarWidth,
            healthBarHeight
        );
        
        // Add health text
        const healthText = this.scene.add.text(
            healthBarX,
            healthBarY,
            `${enemy.health}/${enemy.maxHealth}`,
            {
                fontFamily: "'VT323'",
                fontSize: '18px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Add enemy name above health bar
        const nameText = this.scene.add.text(
            healthBarX,
            healthBarY - 30,
            enemy.name,
            {
                fontFamily: "'VT323'",
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
        
        // Store display elements with the enemy
        enemy.displayElements = {
            sprite: this.enemySprite,
            nameText: nameText,
            healthBar: {
                bg: healthBarBg,
                bar: healthBar,
                border: healthBarBorder,
                x: healthBarX - healthBarWidth / 2,
                y: healthBarY - healthBarHeight / 2,
                width: healthBarWidth,
                height: healthBarHeight,
                color: 0xff0000
            },
            healthText: healthText
        };
    }

    /**
     * Update enemy health bar
     */
    updateEnemyHealthBar(enemy) {
        if (!enemy || !enemy.displayElements || !enemy.displayElements.healthBar) return;
        
        const healthBar = enemy.displayElements.healthBar;
        const currentHealth = enemy.health;
        const maxHealth = enemy.maxHealth;
        
        // Ensure health doesn't exceed maximum
        const adjustedHealth = Math.min(currentHealth, maxHealth);
        
        // Calculate percentage
        const percentage = Math.max(0, Math.min(adjustedHealth / maxHealth, 1));
        
        // Clear previous graphics
        healthBar.bar.clear();
        
        // Draw new health bar - only from left to right
        healthBar.bar.fillStyle(healthBar.color, 1);
        healthBar.bar.fillRect(
            healthBar.x, 
            healthBar.y, 
            healthBar.width * percentage, 
            healthBar.height
        );
        
        // Update health text
        if (enemy.displayElements.healthText) {
            enemy.displayElements.healthText.setText(`${adjustedHealth}/${maxHealth}`);
        }
    }

    /**
     * Animate an attack
     */
    animateAttack(source, onComplete) {
        // Just call onComplete since we're not animating
        if (onComplete) {
            onComplete();
        }
    }

    /**
     * Play hit effect at a position
     * @param {number} x - X position
     * @param {number} y - Y position
     * @returns {Promise} Resolves when animation completes
     */
    playHitEffect(x, y) {
        return new Promise((resolve) => {
            const effect = this.scene.add.sprite(x, y, 'hitEffect');
            effect.play('hit-effect');
            effect.once('animationcomplete', () => {
                effect.destroy();
                resolve();
            });
        });
    }

    /**
     * Shake a sprite
     */
    shakeSprite(target, intensity = 5, duration = 200) {
        const sprite = this.sprites[target];
        if (!sprite) return;
        
        const originalX = sprite.x;
        const originalY = sprite.y;
        
        this.scene.tweens.add({
            targets: sprite,
            x: originalX + intensity,
            y: originalY + intensity,
            duration: 50,
            yoyo: true,
            repeat: Math.floor(duration / 100),
            ease: 'Power1',
            onComplete: () => {
                sprite.x = originalX;
                sprite.y = originalY;
            }
        });
    }

    /**
     * Flash a sprite white (for damage)
     */
    flashSprite(target, duration = 100) {
        const sprite = this.sprites[target];
        if (!sprite) return;
        
        sprite.setTint(0xffffff);
        this.scene.time.delayedCall(duration, () => {
            sprite.clearTint();
        });
    }

    /**
     * Fade out a sprite
     */
    fadeOutSprite(target, duration = 500) {
        const sprite = this.sprites[target];
        if (!sprite) return;
        
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0,
            duration: duration,
            ease: 'Power2'
        });
    }

    /**
     * Animate defeat of a character
     * @param {string} target - 'player' or 'enemy'
     * @param {function} onComplete - Callback when animation completes
     */
    animateDefeat(target, onComplete) {
        const sprite = target === 'player' ? this.playerSprite : this.enemySprite;
        
        if (!sprite) {
            if (onComplete) onComplete();
            return;
        }
        
        // Create a sequence of animations for defeat
        this.scene.tweens.add({
            targets: sprite,
            alpha: 0.7,
            y: sprite.y + 30,
            angle: target === 'player' ? -90 : 90,
            scale: sprite.scale * 0.8,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Fade out completely
                this.scene.tweens.add({
                    targets: sprite,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2',
                    onComplete: () => {
                        // Call the completion callback
                        if (onComplete) onComplete();
                    }
                });
            }
        });
        
        // If it's an enemy, also fade out their health bar elements
        if (target === 'enemy' && this.scene.enemies && this.scene.enemies[0] && 
            this.scene.enemies[0].displayElements) {
            
            const elements = this.scene.enemies[0].displayElements;
            const fadeTargets = [
                elements.nameText,
                elements.healthText,
                elements.healthBar.bg,
                elements.healthBar.border
            ];
            
            this.scene.tweens.add({
                targets: fadeTargets,
                alpha: 0,
                duration: 500,
                ease: 'Power2'
            });
            
            // Handle the graphics object separately
            this.scene.tweens.add({
                targets: {},
                duration: 500,
                onUpdate: (tween) => {
                    const alpha = 1 - tween.progress;
                    elements.healthBar.bar.clear();
                    elements.healthBar.bar.fillStyle(elements.healthBar.color, alpha);
                    elements.healthBar.bar.fillRect(
                        elements.healthBar.x,
                        elements.healthBar.y,
                        elements.healthBar.width * (this.scene.enemies[0].health / this.scene.enemies[0].maxHealth),
                        elements.healthBar.height
                    );
                }
            });
        }
    }
}
