// ---- File: StartScene.js ----

import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import gameState from '../utils/gameState.js';
import BaseScene from './BaseScene.js';
import { hasSaveGame, loadGame, clearSaveGame, saveGame } from '../utils/SaveLoadManager.js';
import { AssetLoader } from '../utils/AssetLoader.js'; // Import the utility class
import audioManager from '../utils/AudioManager.js'; // CORRECT - Imports the default export instance

class StartScene extends BaseScene {
    constructor() {
        super({ key: 'StartScene' });
        this.hasSavedGame = false;
    }

    preload() {
        console.log("[StartScene] Preload: Loading essential assets...");
        // Load ONLY what StartScene absolutely needs to display immediately
        // Use tryLoadImage pattern for safety
        const tryLoadImage = (key, path) => {
            if (path && !this.textures.exists(key)) {
                console.log(`[StartScene Preload] Loading: ${key}`);
                this.load.image(key, path);
            } else if (!path) { console.warn(`Image path missing for ${key}`); }
        };
        tryLoadImage('title-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
        const buttonClickKey = ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY;
    const buttonClickPath = ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK;
    if (buttonClickKey && buttonClickPath && !this.cache.audio.exists(buttonClickKey)) {
        console.log(`[StartScene Preload] Loading: ${buttonClickKey}`);
        this.load.audio(buttonClickKey, buttonClickPath);
    }
        console.log("[StartScene] Preload finished.");
    }

    // ---- **** FULL create() METHOD **** ----
    create() {
        console.log("[StartScene] Create started.");
        this.initializeScene(); // Initialize BaseScene components

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Resume Audio Context on Interaction ---
        // Add listener once per game session start
        const resumeAudio = () => {
            if (this.sound.context.state === 'suspended') {
                 console.log("AudioContext suspended, attempting resume...");
                 this.sound.context.resume().then(() => {
                     console.log("AudioContext resumed successfully.");
                 }).catch(e => console.error("Error resuming AudioContext:", e));
                 // Remove listener after first attempt (or success)
                 window.removeEventListener('pointerdown', resumeAudio);
                 document.removeEventListener('keydown', resumeAudio); // Also resume on keydown
            }
        };
        // Listen for first click OR keypress
        window.addEventListener('pointerdown', resumeAudio, { once: true });
        document.addEventListener('keydown', resumeAudio, { once: true });
        // --- End Audio Context ---
        console.log("[StartScene] Requesting title music via AudioManager.");
        audioManager.playMusic(ASSET_PATHS.MUSIC.TITLE_KEY || ASSET_PATHS.MUSIC.TITLE); // Use Key if defined, else Path
        // --- Check for Portal Entry ---
        const urlParams = new URLSearchParams(window.location.search);
        const portalParam = urlParams.get('portal');
        if (portalParam === 'true') {
            console.log("Detected portal entry.");
            const refParam = urlParams.get('ref');
            const incomingUsername = urlParams.get('username');
            if(refParam) gameState.portalReferrer = refParam;
            if(incomingUsername) gameState.portalUsername = incomingUsername;

            if (loadGame()) { // Tries to load game into gameState
                console.log("Saved game found and loaded, resuming directly to Overworld...");
                navigationManager.navigateTo(this, 'OverworldScene');
                return; // Stop further execution of this create()
            } else {
                console.log("No valid saved game found, proceeding to character select for portal user...");
                // Pass portal username if available
                navigationManager.navigateTo(this, 'CharacterSelectScene', { portalUsername: gameState.portalUsername });
                return; // Stop further execution of this create()
            }
        }
        // --- End Portal Entry Check ---

        // --- Normal Start Scene Setup ---
        // Display essential UI immediately using preloaded assets
        // Use safeAddImage from BaseScene
        this.safeAddImage(width / 2, height / 2, 'title-bg', {
             displayWidth: width, displayHeight: height
        }).setDepth(0); // Ensure background is at the back


        // Use UIManager for title
        this.ui.createTitle(width / 2, height * 0.15, 'Gates of Aetheria', {
            fontSize: this.ui.fontSize.xl
        }).setDepth(1); // Ensure title is on top

        // Check save state for buttons
        this.hasSavedGame = hasSaveGame();
        console.log("Has saved game:", this.hasSavedGame);

        // Create buttons (Resume enabled/disabled based on hasSavedGame)
        this.createButtons();

        // Add version text
        this.add.text(width - 20, height - 20, 'v0.1.0', {
            fontFamily: "'VT323'", fontSize: '16px', fill: '#cccccc', resolution: 2
        }).setOrigin(1, 1).setDepth(100); // Ensure version is on top

        // --- Trigger Background Asset Loading ---
        console.log("[StartScene] Triggering background asset load...");
        // Ensure AssetLoader is correctly imported and method exists
        if (typeof AssetLoader?.loadSharedAssetsInBackground === 'function') {
            AssetLoader.loadSharedAssetsInBackground(this);
            
        } else {
            console.error("[StartScene] AssetLoader or loadSharedAssetsInBackground method not found!");
        }
        // --- End Background Loading ---

        // --- TEMPORARY TEST: Force Visibility ---
    console.log("[StartScene Create] Forcing camera alpha to 1, skipping fade.");
    this.cameras.main.setAlpha(1);
    if(this.input) this.input.enabled = true; // Ensure input enabled too
    // --- END TEMPORARY TEST ---

       // Fade In - Delayed slightly and with extra check
       /*
    if (this.transitions) {
        this.cameras.main.setAlpha(0); // Set alpha before delay
        this.time.delayedCall(50, () => {
            // --- ADD THIS CHECK ---
            if (this && this.scene?.isActive) { // Check if scene is still active
                console.log("[StartScene] Fading in...");
                this.transitions.fadeIn();
            } else {
                console.warn("StartScene became inactive before delayed fadeIn could run.");
            }
            // --- END CHECK ---
            
        });
    } else {
        console.warn("TransitionManager not found for StartScene fade.");
        this.cameras.main.setAlpha(1);
        if (this.input) this.input.enabled = true;
    }
        */
    console.log("[StartScene] Create finished.");
    }
    // --- END OF create() METHOD ---

    // createButtons method (ensure safePlaySound is called correctly)
    createButtons() {
        const width = this.cameras.main.width; const height = this.cameras.main.height;
        const buttonYStart = height * 0.40; const buttonSpacing = 70;

        // --- Resume Game Button ---
        const resumeButton = this.ui.createButton( width / 2, buttonYStart, 'RESUME GAME',
         () => {
            this.safePlaySound(ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY); // Use the KEY
            if (loadGame()) { // Try to load
                console.log("Resuming game with loaded state.");
                navigationManager.navigateTo(this, 'OverworldScene');
            } else {
                console.error("Resume clicked but failed to load saved game!");
                // Optionally visually disable the button again if load fails
                resumeButton?.disable(); // Use optional chaining
                if(resumeButton?.container) resumeButton.container.setAlpha(0.5);
            }
         },
         { width: 260, height: 50, disabled: !this.hasSavedGame } // Initial disabled state
        );
        // Set initial alpha based on disabled state
        if (!this.hasSavedGame && resumeButton?.container) {
             resumeButton.container.setAlpha(0.5);
        }
        // --- End Resume Button ---

        // --- New Game Button ---
        this.ui.createButton( width / 2, buttonYStart + buttonSpacing, 'NEW GAME',
        () => this.startNewGame(), // Calls helper
        { width: 260, height: 50 });
        // --- End New Game Button ---

        // --- Settings Button ---
        this.ui.createButton( width / 2, buttonYStart + buttonSpacing * 2, 'SETTINGS',
            () => {
                 this.safePlaySound(ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY);
                 console.log('Settings clicked');
                 navigationManager.navigateTo(this, 'SettingsScene'); // <<< ADD THIS
            },
            { width: 260, height: 50 });
        // --- End Settings Button ---

        /*
        // --- Credits Button ---
        this.ui.createButton( width / 2, buttonYStart + buttonSpacing * 3, 'CREDITS',
        () => {
             this.safePlaySound(ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY);
             console.log('Credits clicked'); 
             // navigationManager.navigateTo(this, 'CreditsScene');
        },
        { width: 260, height: 50 });
        // --- End Credits Button ---
*/
        // --- Portal Button ---
        this.ui.createButton( width / 2, buttonYStart + buttonSpacing * 4, 'VIBEVERSE PORTAL',
        () => this.enterPortal(), // Calls helper
        { width: 260, height: 50, fillColor: 0x9b59b6, hoverColor: 0x8e44ad });
        // --- End Portal Button ---
    }

    // startNewGame method (ensure safePlaySound is called correctly)
    startNewGame() {
         this.safePlaySound(ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY); // Play sound first
         console.log('New Game clicked');
         if (this.hasSavedGame) {
              // Use confirm for simple confirmation
             const confirmed = confirm("Starting a new game will overwrite your existing save. Are you sure?");
             if (!confirmed) {
                 console.log("New game cancelled by user.");
                 return; // Stop if user cancels
             }
         }
         clearSaveGame(); // Use manager to clear save
         console.log('Cleared previous game state');
         gameState.player = null; // Reset runtime state
         gameState.currentDungeon = null;
         // Reset portal info if needed
         gameState.portalReferrer = null;
         gameState.portalUsername = null;
         navigationManager.navigateTo(this, 'CharacterSelectScene');
    }

    // enterPortal method (ensure safePlaySound is called correctly)
    enterPortal() {
        this.safePlaySound(ASSET_PATHS.SOUNDS.ui.BUTTON_CLICK_KEY); // Play sound first
        console.log('Entering Vibeverse Portal...');
        // --- Save game state BEFORE redirecting ---
        if (this.hasSavedGame) { // Only save if a game is actually in progress
             saveGame(); // Use manager - make sure saveGame is imported
             console.log("Game state saved before entering portal.");
        } else {
             console.log("No active game to save before entering portal.");
        }
        // ---

        const player = gameState.player; // Get current player data OR defaults
        const username = player?.name || 'Adventurer';
        const playerClass = player?.class || 'warrior';
        let color = 'gray'; // Determine color based on class
        if (playerClass === 'mage') color = 'blue';
        else if (playerClass === 'warrior') color = 'red';
        else if (playerClass === 'rogue') color = 'green';
        else if (playerClass === 'cleric') color = 'yellow';
        // Add other colors for Ranger, Bard etc.

        const portalBaseUrl = 'http://portal.pieter.com/';
        const params = new URLSearchParams();
        params.append('username', username);
        params.append('color', color);
        // Add other relevant params if tracked (speed, avatar_url)
        // params.append('speed', (player?.speed || 0).toString());
        // params.append('avatar_url', player?.portrait || ''); // Example
        params.append('ref', window.location.origin + window.location.pathname);

        const portalUrl = `${portalBaseUrl}?${params.toString()}`;
        console.log(`Redirecting to: ${portalUrl}`);

        // Redirect after a short delay
        this.time.delayedCall(200, () => {
            window.location.href = portalUrl;
        });
    }
}

export default StartScene;