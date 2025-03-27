/**
 * Manages the combat log for displaying combat events
 */
export default class CombatLog {
    constructor(scene) {
        this.scene = scene;
        this.logEntries = [];
        this.maxEntries = 4;
        this.logContainer = null;
        this.logTexts = [];
        this.entryHeight = 45; // Height allocation per entry to accommodate wrapped text
        this.currentRound = 1;
        this.isPlayerTurn = true; // Tracks if it's player's turn in the round
    }
    
    /**
     * Create the combat log display
     */
    createCombatLog() {
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;
        
        // Create log container - moved higher up on screen
        this.logContainer = this.scene.add.container(width * 0.5, height * 0.65);
        
        // Create background - increased height
        const bg = this.scene.add.rectangle(0, 0, width * 0.4, height * 0.35, 0x000000, 0.7);
        this.logContainer.add(bg);
        
        // Create initial empty log entries with more spacing
        const startY = -height * 0.15; // Start higher up
        for (let i = 0; i < this.maxEntries; i++) {
            const logText = this.scene.add.text(-width * 0.18, startY + (i * this.entryHeight), '', {
                fontFamily: "'VT323'",
                fontSize: this.scene.ui.fontSize.sm + 'px',
                fill: '#ffffff',
                wordWrap: { width: width * 0.36, useAdvancedWrap: true }, // Enable advanced word wrapping
                lineSpacing: 5
            });
            this.logContainer.add(logText);
            this.logTexts.push(logText);
        }
    }
    
    /**
     * Add a new entry to the combat log
     * @param {string} text - The text to add
     * @param {boolean} isPlayerAction - Whether this is a player action (affects round counter)
     */
    addLogEntry(text, isPlayerAction = false) {
        // Handle round prefix
        let prefix = '';
        if (isPlayerAction || !this.isPlayerTurn) {
            prefix = `Round ${this.currentRound}: `;
            
            // Update round counter logic
            if (isPlayerAction) {
                this.isPlayerTurn = false; // Next action will be enemy's turn
            } else {
                if (!this.isPlayerTurn) {
                    // If it was player's turn and now it's enemy's turn, prepare for next round
                    this.isPlayerTurn = true;
                    this.currentRound++; // Increment round after enemy's action
                }
            }
        }

        // Wrap text at 40 characters
        const maxLineLength = 40;
        let wrappedText = '';
        
        // Simple word-based wrapping
        let currentLine = prefix; // Start with the round prefix
        const words = text.split(' ');
        
        for (const word of words) {
            // Check if adding this word would exceed the max line length
            if (currentLine.length + word.length + 1 > maxLineLength && currentLine.length > 0) {
                // Add current line to wrapped text and start a new line
                wrappedText += currentLine + '\n';
                // Start new line with proper indentation if there was a prefix
                currentLine = prefix ? ' '.repeat(prefix.length) : '';
                currentLine += word;
            } else {
                // Add word to current line
                currentLine = currentLine.length === 0 ? word : currentLine + ' ' + word;
            }
        }
        
        // Add the last line
        if (currentLine.length > 0) {
            wrappedText += currentLine;
        }
        
        // Add new entry to the beginning of the array
        this.logEntries.unshift(wrappedText);
        
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
