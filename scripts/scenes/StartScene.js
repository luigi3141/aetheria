// ---- File: StartScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import gameState from '../utils/gameState.js';
import BaseScene from './BaseScene.js';
import { hasSaveGame, loadGame, clearSaveGame } from '../utils/SaveLoadManager.js';

class StartScene extends BaseScene {
    constructor() {
        super({ key: 'StartScene' });
        this.hasSavedGame = false; // Flag to track if save exists
    }

    preload() {
        this.load.image('title-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
        // Optionally load portal graphic
        // this.load.image('portal-icon', 'assets/sprites/ui/portal-icon.png');
    }

    create() {
         this.initializeScene(); // Initialize BaseScene components

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Check for Portal Entry ---
        const urlParams = new URLSearchParams(window.location.search);
        const portalParam = urlParams.get('portal');
        const refParam = urlParams.get('ref'); // Get referring game URL

        if (portalParam === 'true') {
            console.log("Detected portal entry. Checking for saved game...");
            const incomingUsername = urlParams.get('username'); // Get username
            if(refParam) gameState.portalReferrer = refParam;
            if(incomingUsername) gameState.portalUsername = incomingUsername; // Store username
            // User came from the portal - check if they have a saved game
            const savedState = window.localStorage.getItem('gameState');
            if (savedState) {
                console.log("Saved game found, resuming...");
                try {
                    const parsedState = JSON.parse(savedState);
                    // --- Deep merge or selective update of gameState ---
                    // Avoid overwriting everything, only update necessary parts
                    if (parsedState.player) {
                        // Selectively update player data
                        gameState.player = { ...gameState.player, ...parsedState.player };
                         // Ensure nested objects like inventory are handled (might need deep merge library or manual merge)
                         if (parsedState.player.inventory) {
                             gameState.player.inventory = { ...gameState.player.inventory, ...parsedState.player.inventory };
                             // Make sure items array isn't overwritten if gameState already has one, merge instead if needed
                             if (Array.isArray(parsedState.player.inventory.items)) {
                                  gameState.player.inventory.items = parsedState.player.inventory.items; // Replace for now, consider merging later
                             }
                         }
                    }
                    // Update other parts of gameState if needed (quests, dungeons etc.)
                    gameState.currentDungeon = parsedState.currentDungeon || null; // Example

                    console.log("GameState updated from save.");
                    // Store referring URL if provided
                    if(refParam) {
                        gameState.portalReferrer = refParam;
                        console.log(`Stored portal referrer: ${refParam}`);
                    }

                    // Directly navigate to OverworldScene (skip menus)
                    navigationManager.navigateTo(this, 'OverworldScene');
                    return; // Stop further execution of create
                } catch (e) {
                    console.error("Error parsing saved game state:", e);
                    // Proceed to normal menu creation if parsing fails
                    window.localStorage.removeItem('gameState'); // Clear corrupted save
                }
            } else {
                 console.log("No saved game found, proceeding to character select...");
                 // Store referring URL if provided
                 navigationManager.navigateTo(this, 'CharacterSelectScene', { portalUsername: incomingUsername }); // <<< Pass data
                 return; // Stop further execution
            }
        }
        // --- End Portal Entry Check ---


        // --- Normal Start Scene Setup ---
        this.add.image(width/2, height/2, 'title-bg').setDisplaySize(width, height);

        this.ui.createTitle(width/2, height * 0.15, 'Gates of Aetheria', {
            fontSize: this.ui.fontSize.xl
        });

        // --- Check for Existing Save Game ---
        this.hasSavedGame = hasSaveGame();
        console.log("Has saved game:", this.hasSavedGame);
        // ---

        this.createButtons();

        // Fade In
        if (this.transitions) this.transitions.fadeIn();
    }

    createButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonYStart = height * 0.40;
        const buttonSpacing = 70;

        // Create Resume Game button with initial disabled state
        const hasExistingSave = hasSaveGame();
        const resumeButton = this.ui.createButton(
            width / 2,
            buttonYStart,
            'RESUME GAME',
            () => {
                this.safePlaySound('button-click');
                if (loadGame()) {
                    console.log("Resuming game with loaded state.");
                    navigationManager.navigateTo(this, 'OverworldScene');
                } else {
                    console.error("Resume clicked but failed to load saved game!");
                }
            },
            { 
                width: 200, 
                height: 50,
                disabled: !hasExistingSave
            }
        );

        if (!hasExistingSave && resumeButton.container) {
            resumeButton.container.setAlpha(0.5);
        }

        // Create New Game button
        const newGameButton = this.ui.createButton(
            width / 2,
            buttonYStart + buttonSpacing,
            'NEW GAME',
            () => {
                console.log('New Game clicked');
                this.safePlaySound('button-click');
                this.startNewGame();
            },
            { width: 200, height: 50 }
        );

        // Create Settings button
        this.ui.createButton(
            width / 2,
            buttonYStart + buttonSpacing * 2,
            'SETTINGS',
            () => {
                console.log('Settings clicked');
                this.safePlaySound('button-click');
                navigationManager.navigateTo(this, 'SettingsScene');
            },
            { width: 200, height: 50 }
        );

        // Create Credits button
        this.ui.createButton(
            width / 2,
            buttonYStart + buttonSpacing * 3,
            'CREDITS',
            () => {
                console.log('Credits clicked');
                this.safePlaySound('button-click');
                /* Implement credits functionality */
            },
            { width: 200, height: 50 }
        );

        // Create Portal button
        this.ui.createButton(
            width / 2,
            buttonYStart + buttonSpacing * 4,
            'PORTAL',
            () => {
                console.log('Portal clicked');
                this.safePlaySound('button-click');
                this.enterPortal();
            },
            {
                width: 200, 
                height: 50,
                fillColor: 0x9b59b6, // Purple color for portal
                hoverColor: 0x8e44ad
            }
        );

        // Add version text
        this.add.text(width - 20, height - 20, 'v0.1.0', {
            fontFamily: 'VT323',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(1, 1);

        // Fade In
        if (this.transitions) this.transitions.fadeIn();
    }

    startNewGame() {
        console.log('Starting new game...');
        if (this.hasSavedGame) {
            const confirmed = confirm("Starting a new game will overwrite your existing save. Are you sure?");
            if (!confirmed) {
                return; // Stop if user cancels
            }
        }
        // Clear previous game state and navigate
        clearSaveGame();
        console.log('Cleared previous game state');
        // Reset gameState object
        gameState.player = null;
        gameState.currentDungeon = null;
        navigationManager.navigateTo(this, 'CharacterSelectScene');
    }

    enterPortal() {
         console.log('Entering Vibeverse Portal...');
         this.safePlaySound('button-click'); // Or a specific portal sound

         // 1. Gather Player Data
         const player = gameState.player; // Get current player data
         const username = player?.name || 'Adventurer';
         const playerClass = player?.class || 'warrior';
         // Determine color based on class (example)
         let color = 'gray';
         if (playerClass === 'mage') color = 'blue';
         else if (playerClass === 'warrior') color = 'red';
         else if (playerClass === 'rogue') color = 'green';
         else if (playerClass === 'cleric') color = 'yellow';
         // Add other optional params if available (speed, avatar_url, etc.)
         // const speed = player?.speed || 0; // Example if speed is tracked

         // 2. Construct URL
         const portalBaseUrl = 'http://portal.pieter.com/';
         const params = new URLSearchParams();
         params.append('username', username);
         params.append('color', color);
         // params.append('speed', speed.toString());
         params.append('ref', window.location.origin + window.location.pathname); // URL of *this* game

         const portalUrl = `${portalBaseUrl}?${params.toString()}`;
         console.log(`Redirecting to: ${portalUrl}`);

         // 3. Redirect
         // Optional: Add a small delay or visual effect before redirecting
         this.time.delayedCall(200, () => {
             window.location.href = portalUrl;
         });
    }
}

export default StartScene;