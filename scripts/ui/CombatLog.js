import { LAYOUT } from '../config/Layout.js';

/**
 * Handles the combat log display
 */
export default class CombatLog {
    constructor(scene) {
        this.scene = scene;
        this.entries = [];
        this.maxEntries = 3;
        this.logText = null;
    }

    /**
     * Create the combat log display
     */
    createCombatLog() {
        this.logText = this.scene.add.text(
            LAYOUT.COMBAT.LOG.x,
            LAYOUT.COMBAT.LOG.y,
            '',
            {
                fontSize: '18px',
                fill: '#ffffff',
                wordWrap: { width: LAYOUT.COMBAT.LOG.width }
            }
        );
    }

    /**
     * Add a new entry to the combat log
     */
    addLogEntry(message) {
        this.entries.push(message);
        
        // Keep only the last N entries
        if (this.entries.length > this.maxEntries) {
            this.entries.shift();
        }
        
        // Update display
        this.updateDisplay();
    }

    /**
     * Update the combat log display
     */
    updateDisplay() {
        if (this.logText) {
            this.logText.setText(this.entries.join('\n'));
        }
    }

    /**
     * Clear all entries from the combat log
     */
    clear() {
        this.entries = [];
        this.updateDisplay();
    }
}
