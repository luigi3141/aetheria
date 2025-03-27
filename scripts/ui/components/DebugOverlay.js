/**
 * DebugOverlay - A component for displaying debug information and controls
 * Responsible for creating, toggling, and destroying debug panels, FPS counters, etc.
 */
import { LAYOUT } from '../layout/LayoutHelper.js';

class DebugOverlay {
    /**
     * Create a new debug overlay
     * @param {Phaser.Scene} scene - The scene this overlay belongs to
     */
    constructor(scene) {
        this.scene = scene;
        this.width = scene.cameras.main.width;
        this.height = scene.cameras.main.height;
        this.enabled = false;
        this.boundsVisible = false;
        this.panel = null;
        this.graphics = null;
        this.fpsText = null;
    }

    /**
     * Toggle the debug overlay visibility
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this._createPanel();
            this._drawBounds();
            this._setupFpsCounter();
        } else {
            this.destroy();
        }
    }

    /**
     * Create the debug panel
     * @private
     */
    _createPanel() {
        const layout = LAYOUT.DEBUG.PANEL;
        const x = layout.X * this.width;
        const y = layout.Y * this.height;
        const width = layout.WIDTH * this.width;
        const height = layout.HEIGHT * this.height;
    
        // Create container
        this.panel = this.scene.add.container(x, y);
    
        // Create background
        const bg = this.scene.add.rectangle(0, 0, width, height, 0x222222, 0.9)
            .setStrokeStyle(2, 0x00ff00);
    
        // Create toggle bounds button
        const buttonWidth = 150;
        const buttonHeight = 30;
        const button = this.scene.add.rectangle(0, -50, buttonWidth, buttonHeight, 0x4a6fb2)
            .setStrokeStyle(2, 0xffd700)
            .setInteractive({ useHandCursor: true });
            
        const buttonText = this.scene.add.text(0, -50, 'Toggle Bounds', {
            fontFamily: "'Press Start 2P'",
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        button.on('pointerdown', () => {
            this.toggleBounds();
        });
    
        // Create FPS text
        this.fpsText = this.scene.add.text(0, 30, 'FPS: 0', {
            fontFamily: "'Press Start 2P'",
            fontSize: '12px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    
        // Add all display objects to the panel container
        this.panel.add([bg, button, buttonText, this.fpsText]);
    
        // Set panel depth to ensure it appears above other elements
        this.panel.setDepth(9999);
    }

    /**
     * Set up the FPS counter
     * @private
     */
    _setupFpsCounter() {
        if (!this.enabled) return;
        
        // Update FPS text once per second
        this.fpsInterval = setInterval(() => {
            if (this.fpsText) {
                this.fpsText.setText(`FPS: ${Math.round(this.scene.game.loop.actualFps)}`);
            }
        }, 1000);
    }

    /**
     * Toggle visibility of debug bounds
     */
    toggleBounds() {
        this.boundsVisible = !this.boundsVisible;
        
        if (this.boundsVisible) {
            this._drawBounds();
        } else if (this.graphics) {
            this.graphics.clear();
        }
    }

    /**
     * Draw debug bounds for important screen elements
     * @private
     */
    _drawBounds() {
        if (!this.enabled || !this.boundsVisible) return;
        
        if (!this.graphics) {
            this.graphics = this.scene.add.graphics();
        }
        
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xff0000);
        
        // Draw screen bounds
        this.graphics.strokeRect(
            0, 0,
            this.width,
            this.height
        );
        
        // Draw bounds for all combat layout elements
        Object.values(LAYOUT.COMBAT).forEach(layout => {
            if (typeof layout === 'object' && (layout.X || layout.x) && (layout.WIDTH || layout.width || layout.Y || layout.y)) {
                const x = (layout.X || layout.x) * this.width;
                const y = (layout.Y || layout.y) * this.height;
                const width = (layout.WIDTH || layout.width || 50) * this.width;
                const height = (layout.HEIGHT || layout.height || 50) * this.height;
                
                this.graphics.strokeRect(
                    x - width/2, 
                    y - height/2,
                    width,
                    height
                );
            }
        });
        
        // Ensure graphics are above other elements but below debug panel
        this.graphics.setDepth(9998);
    }

    /**
     * Clean up all debug overlay resources
     */
    destroy() {
        if (this.panel) {
            this.panel.destroy();
            this.panel = null;
        }
        
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
        
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
            this.fpsInterval = null;
        }
        
        this.fpsText = null;
        this.enabled = false;
        this.boundsVisible = false;
    }
}

export default DebugOverlay;
