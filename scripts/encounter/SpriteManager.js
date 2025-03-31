import { ASSET_PATHS } from '../config/AssetConfig.js';
import { LAYOUT } from '../ui/layout/LayoutHelper.js';
import gameState from '../gameState.js';

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
        // Preload player sprite
        const playerClass = gameState.player.class?.toUpperCase() || 'DEFAULT';
        const spriteKey = `player-${playerClass.toLowerCase()}`;
        const spritePath = ASSET_PATHS.PLAYERS[playerClass] || ASSET_PATHS.PLAYERS.DEFAULT;
        this.scene.load.image(spriteKey, spritePath);
        this.playerSpriteKey = spriteKey;
      
        // Dynamically preload enemy sprites from ASSET_PATHS.ENEMIES
        Object.entries(ASSET_PATHS.ENEMIES).forEach(([key, path]) => {
          this.scene.load.image(key, path); // Use the config key directly
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
        const key = this.playerSpriteKey || 'player'; // fallback
        this.playerSprite = this.scene.add.sprite(
          LAYOUT.COMBAT.SPRITES.PLAYER.x * this.scene.scale.width,
          LAYOUT.COMBAT.SPRITES.PLAYER.y * this.scene.scale.height,
          key
        )
        .setScale(1)
        .setDepth(1000); // Set player sprite depth
        
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
    
        // Use the sprite key directly as provided by the enemy data
        const spriteKey = enemy.sprite || 'DEFAULT';
        if (!this.scene.textures.exists(spriteKey)) {
            console.warn(`Sprite with key "${spriteKey}" was not preloaded!`);
        }

        // Create enemy sprite
        this.enemySprite = this.scene.add.sprite(
            LAYOUT.COMBAT.SPRITES.ENEMY.x * this.scene.scale.width,
            LAYOUT.COMBAT.SPRITES.ENEMY.y * this.scene.scale.height,
            spriteKey
        )
        .setScale(1)
        .setDepth(1000) // Keep enemy sprite depth consistent with player
        .setVisible(true);
    
        // Add a slight bobbing animation to make the enemy sprite feel alive
        this.scene.tweens.add({
            targets: this.enemySprite,
            y: this.enemySprite.y + 8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    
        // Store the sprite reference with the enemy
        enemy.displayElements = enemy.displayElements || {};
        enemy.displayElements.sprite = this.enemySprite;
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
