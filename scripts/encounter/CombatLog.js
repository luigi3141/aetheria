/**
 * Manages the combat log for displaying combat events
 */
export default class CombatLog {
    constructor(scene) {
        this.scene = scene;
        this.logEntries = [];
        this.maxEntries = 5;
        this.logContainer = null;
        this.logTexts = [];
    }
    
    /**
     * Create the combat log display
     */
    createCombatLog() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create log container
        this.logContainer = this.scene.add.container(width * 0.75, height * 0.7);
        
        // Create background
        const bg = this.scene.add.rectangle(0, 0, width * 0.4, height * 0.2, 0x000000, 0.7);
        this.logContainer.add(bg);
        
        // Create initial empty log entries
        for (let i = 0; i < this.maxEntries; i++) {
            const logText = this.scene.add.text(-width * 0.18, -height * 0.08 + (i * 25), '', {
                fontFamily: "'VT323'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff'
            });
            this.logContainer.add(logText);
            this.logTexts.push(logText);
        }
    }
    
    /**
     * Add a new entry to the combat log
     */
    addLogEntry(text) {
        // Add timestamp
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const entry = `[${timestamp}] ${text}`;
        
        // Add new entry to the beginning of the array
        this.logEntries.unshift(entry);
        
        // Keep only the most recent entries
        if (this.logEntries.length > this.maxEntries) {
            this.logEntries = this.logEntries.slice(0, this.maxEntries);
        }
        
        // Update the display
        this.updateLogDisplay();
        
        // Also log to console for debugging
        console.log(`Combat Log: ${text}`);
    }
    
    /**
     * Update the combat log display
     */
    updateLogDisplay() {
        // Update each log text object
        this.logTexts.forEach((text, index) => {
            if (index < this.logEntries.length) {
                text.setText(this.logEntries[index]);
            } else {
                text.setText('');
            }
        });
    }
    
    /**
     * Clear all log entries
     */
    clearLog() {
        this.logEntries = [];
        this.updateLogDisplay();
    }
}
