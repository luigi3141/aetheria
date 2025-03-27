/**
 * TransitionManager - Handles scene transitions with animations and effects
 */
class TransitionManager {
    /**
     * Initialize the transition manager
     * @param {Phaser.Scene} scene - The scene to attach this manager to
     */
    constructor(scene) {
        this.scene = scene;
        this.isTransitioning = false;
    }

    /**
     * Dungeon entry transition with fade effect and animation
     * @param {Function} callback - Function to call after transition completes
     */
    dungeonEntry(callback) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Get screen dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create fade rectangle
        const fadeRect = this.scene.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(1000); // Ensure it's above everything
        
        // Play door sound if available
        try {
            if (this.scene.sound.get('door-open')) {
                this.scene.sound.play('door-open', { volume: 0.5 });
            }
        } catch (e) {
            console.warn('Door open sound not available:', e);
        }
        
        // Create door animation if not exists
        if (!this.scene.anims.exists('door-open')) {
            try {
                this.scene.anims.create({
                    key: 'door-open',
                    frames: this.scene.anims.generateFrameNumbers('door', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: 0
                });
            } catch (e) {
                console.warn('Door animation creation failed:', e);
            }
        }
        
        // Add door sprite in center
        let door;
        try {
            door = this.scene.add.sprite(width / 2, height / 2, 'door')
                .setDepth(1001) // Above the fade rectangle
                .setScale(3)
                .setAlpha(0);
        } catch (e) {
            console.warn('Door sprite creation failed:', e);
            // Create a fallback rectangle instead
            door = this.scene.add.rectangle(width / 2, height / 2, 100, 100, 0x3366ff)
                .setDepth(1001)
                .setAlpha(0);
        }
        
        // Fade in
        this.scene.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 250,
            onComplete: () => {
                // Show door and play animation
                this.scene.tweens.add({
                    targets: door,
                    alpha: 1,
                    duration: 100,
                    onComplete: () => {
                        // Try to play animation if it's a sprite
                        if (door.play && typeof door.play === 'function') {
                            try {
                                door.play('door-open');
                                
                                // Wait for animation to finish
                                door.on('animationcomplete', () => {
                                    this.completeFadeTransition(fadeRect, door, callback);
                                });
                            } catch (e) {
                                console.warn('Door animation play failed:', e);
                                // If animation fails, just wait a bit then continue
                                this.scene.time.delayedCall(500, () => {
                                    this.completeFadeTransition(fadeRect, door, callback);
                                });
                            }
                        } else {
                            // If it's not a sprite (fallback rectangle), just wait a bit then continue
                            this.scene.time.delayedCall(500, () => {
                                this.completeFadeTransition(fadeRect, door, callback);
                            });
                        }
                    }
                });
            }
        });
    }
    
    /**
     * Helper method to complete the fade transition
     * @private
     */
    completeFadeTransition(fadeRect, transitionObject, callback) {
        // Execute callback (scene change)
        if (callback) callback();
        
        // Fade out
        this.scene.tweens.add({
            targets: [fadeRect, transitionObject],
            alpha: 0,
            duration: 250,
            onComplete: () => {
                // Clean up
                fadeRect.destroy();
                transitionObject.destroy();
                this.isTransitioning = false;
            }
        });
    }
    
    /**
     * Enemy encounter transition with flash effect and enemy animations
     * @param {Array} enemies - Array of enemy sprites to animate
     * @param {Function} callback - Function to call after transition completes
     */
    enemyEncounter(enemies = [], callback) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Get screen dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create flash rectangle
        const flashRect = this.scene.add.rectangle(0, 0, width, height, 0xffffff)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(1000); // Ensure it's above everything
        
        // Play combat sound if available
        try {
            if (this.scene.sound.get('combat-start')) {
                this.scene.sound.play('combat-start', { volume: 0.6 });
            }
        } catch (e) {
            console.warn('Combat start sound not available:', e);
        }
        
        // Flash effect
        this.scene.tweens.add({
            targets: flashRect,
            alpha: 0.5,
            duration: 150,
            yoyo: true,
            onComplete: () => {
                // Animate enemies if they exist and are valid
                if (enemies && enemies.length > 0) {
                    enemies.forEach(enemy => {
                        try {
                            // Store original scale if it exists
                            const originalScale = enemy.scale || 1;
                            
                            // Set initial scale to 0
                            enemy.setScale(0);
                            
                            // Bounce in
                            this.scene.tweens.add({
                                targets: enemy,
                                scale: originalScale,
                                duration: 300,
                                ease: 'Back.Out',
                            });
                        } catch (e) {
                            console.warn('Enemy animation failed:', e);
                        }
                    });
                }
                
                // Clean up
                this.scene.tweens.add({
                    targets: flashRect,
                    alpha: 0,
                    duration: 100,
                    onComplete: () => {
                        flashRect.destroy();
                        this.isTransitioning = false;
                        if (callback) callback();
                    }
                });
            }
        });
    }
    
    /**
     * Simple fade transition between scenes
     * @param {Function} callback - Function to call after fade completes
     * @param {number} duration - Duration of the fade in milliseconds
     */
    fade(callback, duration = 500) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Get screen dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create fade rectangle
        const fadeRect = this.scene.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(1000); // Ensure it's above everything
            
        // Simple fade in and out
        this.scene.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: duration,
            onComplete: () => {
                // Execute callback at peak of fade
                if (callback) callback();
                
                // Fade out and cleanup
                this.scene.tweens.add({
                    targets: fadeRect,
                    alpha: 0,
                    duration: duration,
                    onComplete: () => {
                        fadeRect.destroy();
                        this.isTransitioning = false;
                    }
                });
            }
        });
    }
}

export default TransitionManager;
