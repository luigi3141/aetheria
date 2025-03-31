// ---- File: CharacterSelectScene.js ----

import UIManager from '../ui/UIManager.js';
import Button from '../ui/components/Button.js';
import SelectionGrid from '../ui/components/SelectionGrid.js';
import gameState from '../gameState.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS, AssetHelper } from '../config/AssetConfig.js';
// --- Import CLASS_DEFINITIONS directly ---
import CharacterManager, {
    CLASS_DEFINITIONS,
    CON_HP_SCALE,
    INT_MAGIC_ATTACK_SCALE,
    STR_ATTACK_SCALE,
    AGI_ATTACK_SCALE
} from '../utils/CharacterManager.js';

class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
        // References for stat text objects
        this.strValueText = null;
        this.agiValueText = null;
        this.intValueText = null;
        this.conValueText = null;
        this.classGrid = null; // Initialize classGrid reference
        this.nameInput = null; // Initialize nameInput reference
        this.characterPreview = null; // Initialize preview reference
    }

    preload() {
        // Load background - Use a specific key
        if (!this.textures.exists('char_select_bg')) { // Use a unique key
            this.load.image('char_select_bg', ASSET_PATHS.BACKGROUNDS.CHARACTER);
        }

        // Load character PORTRAITS (used in preview) - Ensure keys match ASSET_PATHS
        const classes = ['warrior', 'mage', 'rogue', 'cleric', 'ranger', 'bard'];
        classes.forEach(className => {
            const upperClass = className.toUpperCase();
            const portraitPath = ASSET_PATHS.PORTRAITS[upperClass] || ASSET_PATHS.PORTRAITS.DEFAULT;
            // Use lowercase class name as the texture key to match updateCharacterPreview
            if (!this.textures.exists(className)) {
                this.load.image(className, portraitPath);
            }
        });
    }

    create() {
        console.log("CharacterSelectScene Create Start");
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Initialize UI Manager FIRST ---
        // Note: Extending BaseScene automatically creates this.ui if initializeScene is called
        // If not extending BaseScene, uncomment the line below
        // this.ui = new UIManager(this);
        // If extending BaseScene, call initializeScene (assuming it creates this.ui)
         if (typeof this.initializeScene === 'function') {
             this.initializeScene();
         } else {
             // Fallback if not extending BaseScene properly
             this.ui = new UIManager(this);
             console.warn("CharacterSelectScene is not extending BaseScene or initializeScene is missing. Manually created UIManager.");
         }


        // --- Add Background ---
        // Use the specific key loaded in preload and set depth to be behind everything
        this.add.image(width / 2, height / 2, 'char_select_bg')
            .setDisplaySize(width, height)
            .setDepth(0); // Ensure it's at the back

        // --- Create Title ---
        this.ui.createTitle(width / 2, height * 0.08, 'Character Creation', {
            fontSize: this.ui.fontSize.lg
        }).setDepth(1); // Ensure title is above background

        // --- Create Main Layout ---
        this.createMainLayout();

        // --- Create Bottom Buttons ---
        this.createNavigationButtons();

        // --- Initial Update ---
        this.time.delayedCall(50, () => { // Delay slightly
            console.log("Delayed initial update. CharacterManager:", CharacterManager);
            if (this.classGrid) {
                this.updateCharacterPreview(); // Update portrait and stats
            } else {
                console.warn("Class grid not initialized for initial update.");
            }
        });
        console.log("CharacterSelectScene Create End");
    }

    createMainLayout() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // --- Layout Adjustments ---
        const commonPanelHeight = height * 0.60; // Slightly taller again for more stats
        const commonTopY = height * 0.18; // Adjusted Downward more
        const commonCenterY = commonTopY + commonPanelHeight / 2;

        const previewPanelWidth = width * 0.28;
        const statsPanelWidth = width * 0.28;
        const classSelectWidth = width * 0.28;

        const totalPanelWidth = previewPanelWidth + statsPanelWidth + classSelectWidth;
        const totalSpacing = width - totalPanelWidth;
        const spacing = totalSpacing / 4;

        const previewX = spacing + previewPanelWidth / 2;
        const statsX = previewX + previewPanelWidth / 2 + spacing + statsPanelWidth / 2;
        const classSelectX = statsX + statsPanelWidth / 2 + spacing + classSelectWidth / 2;

        const nameInputY = commonTopY + commonPanelHeight + 40; // Position name input below panels

        console.log(`Layout X Positions: Preview=${previewX.toFixed(0)}, Stats=${statsX.toFixed(0)}, ClassSelect=${classSelectX.toFixed(0)}`);
        console.log(`Layout Common Center Y: ${commonCenterY.toFixed(0)}`);


        // --- Create Sections ---
        this.createCharacterPreviewSection(previewX, commonCenterY, previewPanelWidth, commonPanelHeight);
        this.createStatsPreviewSection(statsX, commonCenterY, statsPanelWidth, commonPanelHeight); // Pass height
        this.createClassSelectionSection(classSelectX, commonCenterY, classSelectWidth, commonPanelHeight); // Use same Y/Height
        this.createNameInputSection(width / 2, nameInputY); // Use new Y
    }

    createCharacterPreviewSection(x, y, panelWidth, panelHeight) {
         // --- Create Panel Manually ---
        const previewPanel = this.ui.createPanel(x, y, panelWidth, panelHeight, {
             fillColor: 0x222233, fillAlpha: 0.8, borderColor: 0x9999aa, borderThickness: 2, depth: 1
        });

        // Add Portrait Inside Panel
        const playerClass = this.classGrid ? this.classGrid.getSelectedItem().toLowerCase() : 'warrior'; // Get initial class
        const portraitY = y - panelHeight * 0.1; // Position portrait slightly higher within panel
        const portraitSize = Math.min(panelWidth * 0.7, panelHeight * 0.5); // Size relative to panel

        // Use this.add.image directly and store reference
        this.characterPortrait = this.add.image(x, portraitY, playerClass) // Use lowercase key matching preload
             .setDisplaySize(portraitSize, portraitSize)
             .setOrigin(0.5)
             .setDepth(2); // Above panel bg

        // Add Name Text Inside Panel
        this.characterNameText = this.add.text(x, y + panelHeight * 0.25, // Position name lower
            playerClass.charAt(0).toUpperCase() + playerClass.slice(1), {
            fontFamily: "'Press Start 2P'", fontSize: this.ui.fontSize.sm + 'px', fill: '#ffffff', align: 'center'
        }).setOrigin(0.5).setDepth(2);

        // Store panel reference if needed later
        this.characterPreviewPanel = previewPanel;

        // --- Remove the call to ui.createCharacterPreview ---
        /*
        this.characterPreview = this.ui.createCharacterPreview( ... );
        */
    }

    createStatsPreviewSection(x, y, panelWidth, panelHeight) {
        const statsPanel = this.ui.createPanel(x, y, panelWidth, panelHeight, {
            fillColor: 0x282835, fillAlpha: 0.85, borderColor: 0xaaaaaa, borderThickness: 1, depth: 1
        });

        const titleHeight = 30;
        const titleY = -panelHeight * 0.5 + titleHeight;
        const panelTitle = this.add.text(0, titleY, 'Base Stats (Lvl 1)', { // Clarify Level 1
            fontFamily: "'Press Start 2P'", fontSize: this.ui.fontSize.xs + 'px', fill: '#ffffff', align: 'center' // Smaller title
        }).setOrigin(0.5);
        statsPanel.add(panelTitle);

        const labelStyle = { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm + 'px', fill: '#cccccc', align: 'left' }; // Smaller stats text
        const valueStyle = { fontFamily: "'VT323'", fontSize: this.ui.fontSize.sm + 'px', fill: '#ffffaa', align: 'right' };

        // Positioning RELATIVE TO PANEL CENTER (0,0)
        const startY = titleY + 35; // Start stats lower
        const labelX = -panelWidth * 0.4;
        const valueX = panelWidth * 0.4;
        // --- Adjust Spacing for 7 stats ---
        const totalStatHeight = panelHeight - (titleHeight * 2) - 20; // Available height for stats
        const spacing = totalStatHeight / 7; // Divide by number of stats
        // --- End Spacing Adjustment ---

        // Create text objects using RELATIVE coordinates
        this.hpLabel = this.add.text(labelX, startY + spacing * 0, 'Health:', labelStyle).setOrigin(0, 0.5);
        this.hpValueText = this.add.text(valueX, startY + spacing * 0, '?', valueStyle).setOrigin(1, 0.5);

        this.manaLabel = this.add.text(labelX, startY + spacing * 1, 'Mana:', labelStyle).setOrigin(0, 0.5);
        this.manaValueText = this.add.text(valueX, startY + spacing * 1, '?', valueStyle).setOrigin(1, 0.5);

        this.baseDmgLabel = this.add.text(labelX, startY + spacing * 2, 'Base Damage:', labelStyle).setOrigin(0, 0.5);
        this.baseDmgValueText = this.add.text(valueX, startY + spacing * 2, '?', valueStyle).setOrigin(1, 0.5);

        this.strLabel = this.add.text(labelX, startY + spacing * 3, 'Strength:', labelStyle).setOrigin(0, 0.5);
        this.strValueText = this.add.text(valueX, startY + spacing * 3, '?', valueStyle).setOrigin(1, 0.5);

        this.agiLabel = this.add.text(labelX, startY + spacing * 4, 'Agility:', labelStyle).setOrigin(0, 0.5);
        this.agiValueText = this.add.text(valueX, startY + spacing * 4, '?', valueStyle).setOrigin(1, 0.5);

        this.intLabel = this.add.text(labelX, startY + spacing * 5, 'Intelligence:', labelStyle).setOrigin(0, 0.5);
        this.intValueText = this.add.text(valueX, startY + spacing * 5, '?', valueStyle).setOrigin(1, 0.5);

        this.conLabel = this.add.text(labelX, startY + spacing * 6, 'Constitution:', labelStyle).setOrigin(0, 0.5);
        this.conValueText = this.add.text(valueX, startY + spacing * 6, '?', valueStyle).setOrigin(1, 0.5);


        // Add to the panel's container
        statsPanel.add([
            this.hpLabel, this.hpValueText,
            this.manaLabel, this.manaValueText,
            this.baseDmgLabel, this.baseDmgValueText,
            this.strLabel, this.strValueText,
            this.agiLabel, this.agiValueText,
            this.intLabel, this.intValueText,
            this.conLabel, this.conValueText
        ]);
    }

    createClassSelectionSection(x, y, panelWidth, panelHeight) {
        const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Bard'];

        const classPanel = this.ui.createPanel(x, y, panelWidth, panelHeight, {
             fillColor: 0x223322, fillAlpha: 0.8, borderColor: 0xaaffaa, borderThickness: 1, depth: 1
        });

        const titleHeight = 30;
        const titleY = -panelHeight * 0.5 + titleHeight;
        const panelTitle = this.add.text(0, titleY, 'Select Class', { /* ... styles ... */ }).setOrigin(0.5);
        classPanel.add(panelTitle);

        // Adjust Selection Grid Positioning
        const gridOptions = {
            columns: 1,
            itemWidth: panelWidth * 0.8,
            itemHeight: 40,
            spacing: this.ui.spacing.sm,
            fontSize: this.ui.fontSize.sm
        };
        const totalGridHeight = classes.length * gridOptions.itemHeight + (classes.length - 1) * gridOptions.spacing;
        const gridStartY = titleY + titleHeight + (gridOptions.itemHeight / 2) + 10; // Start below title + padding

        this.classGrid = new SelectionGrid(
            this,
            0, // X relative to panel center
            gridStartY, // Use calculated start Y relative to panel center
            classes,
            (className, index) => { /* ... onSelect ... */ this.updateCharacterPreview(); },
            gridOptions
        );

        // --- Add grid buttons TO THE PANEL CONTAINER ---
        // --- Use RELATIVE positions provided by SelectionGrid ---
        this.classGrid.buttons.forEach(button => {
            // SelectionGrid should calculate positions relative to its own X,Y
            // When we add to the container, these become relative to the container's origin
            classPanel.add([button.bg, button.text]);
        });
        // --- End Grid Button Adding ---
    }

    createNameInputSection(x, y) {
        const labelWidthEstimate = 120; // Estimate width of the label text
        const inputWidth = 250;
        const spacing = 20;

        // Calculate positions to center the whole group
        const totalWidth = labelWidthEstimate + inputWidth + spacing;
        const startX = x - totalWidth / 2;

        const labelX = startX + labelWidthEstimate / 2;
        const inputX = startX + labelWidthEstimate + spacing + inputWidth / 2;


        // --- Use createTitle for the Label for better visibility ---
        this.nameLabel = this.ui.createTitle(
             labelX, y, 'Set Name:',
             {
                 fontSize: this.ui.fontSize.sm, // Smaller font
                 padding: { x: 8, y: 4 }, // Smaller padding
                 // No need to set depth here, createTitle handles it if necessary
             }
        );
        // --- End Label Change ---

        this.nameInput = this.ui.createInputField(
            inputX, y, 'Adventurer',
            (name) => { /* ... onChange ... */ },
            { width: inputWidth, height: 40, depth: 1 }
        );

        // --- Fix Name Input Highlight ---
        if (this.nameInput && this.nameInput.container) {
            const inputContainer = this.nameInput.container;
            const highlightWidth = 30;
            const highlightHeight = this.nameInput.height - 10;
            const startXRelative = -this.nameInput.width / 2 + highlightWidth / 2 + 5;
            const endXRelative = this.nameInput.width / 2 - highlightWidth / 2 - 5;

            const highlight = this.add.rectangle(
                startXRelative, 0, highlightWidth, highlightHeight, 0xffffff, 0.15
            ).setDepth(0);

            inputContainer.add(highlight);
            if(this.nameInput.text) this.nameInput.text.setDepth(1);

            // Check if tween already exists before adding a new one
            // (Though ideally this function is only called once in create)
            if (!this.nameHighlightTween || !this.nameHighlightTween.isPlaying()) {
                 this.nameHighlightTween = this.tweens.add({
                     targets: highlight,
                     x: endXRelative,
                     duration: 2500,
                     yoyo: true,
                     repeat: -1,
                     ease: 'Sine.easeInOut'
                 });
                 console.log("Name input highlight created and tween added.");
            }

        } else { /* Warn */ }

        // --- REMOVE STRAY ANIMATION ---
        // Carefully search this function and createMainLayout for any other
        // this.add.rectangle or this.tweens.add that targets a rectangle
        // that isn't part of a panel, the name input, or the highlight.
        // For example, the old highlight code might still be lingering:
        /*
        // DELETE THIS if it still exists:
        const highlightWidth_OLD = 40;
        const highlightHeight_OLD = this.nameInput.height; // Might error if nameInput is null
        const startX_OLD = this.nameInput.container.x - this.nameInput.width/2 + highlightWidth_OLD/2;
        const endX_OLD = this.nameInput.container.x + this.nameInput.width/2 - highlightWidth_OLD/2;
        const highlight_OLD = this.add.rectangle( startX_OLD, this.nameInput.container.y, highlightWidth_OLD, highlightHeight_OLD, 0xffffff, 0.1);
        this.tweens.add({ targets: highlight_OLD, x: endX_OLD, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
        */
    }


    createNavigationButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const buttonY = height * 0.92;

        // Back button
        const backButton = new Button(
            this, width * 0.3, buttonY, 'BACK',
            () => {
                if (typeof this.safePlaySound === 'function') this.safePlaySound('button-click');
                navigationManager.navigateTo(this, 'StartScene')
            },
            { width: 150, height: 45 }
        );
        if (backButton.container) backButton.container.setDepth(5); // Ensure buttons on top

        // Start game button
        this.startButton = new Button(
            this, width * 0.7, buttonY, 'START GAME',
            () => {
                console.log('Start game button clicked');
                if (typeof this.safePlaySound === 'function') this.safePlaySound('button-click');
                localStorage.removeItem('gameState');
                console.log('Cleared previous game state');

                const playerName = this.nameInput?.getValue() || 'Adventurer';
                if (!this.classGrid) { console.error("Class Grid not ready."); return; }
                const playerClass = this.classGrid.getSelectedItem().toLowerCase();

                const newPlayer = CharacterManager.createNewCharacter(playerName, playerClass);

                if (newPlayer) {
                    gameState.player = newPlayer;
                    const playerClassUpper = playerClass.toUpperCase();
                    gameState.player.sprite = ASSET_PATHS.PLAYERS[playerClassUpper] || ASSET_PATHS.PLAYERS.DEFAULT;
                    gameState.player.portrait = ASSET_PATHS.PORTRAITS[playerClassUpper] || ASSET_PATHS.PORTRAITS.DEFAULT;
                    console.log('Character created via Manager:', gameState.player);
                    navigationManager.navigateTo(this, 'OverworldScene');
                } else { /* Handle error */ }
            },
            { width: 180, height: 45 }
        );
        if (this.startButton.container) this.startButton.container.setDepth(5); // Ensure buttons on top
        this.startButton.addShineEffect();
    }


    updateCharacterPreview() {
        // --- Ensure text objects are created before updating ---
        if (!this.classGrid || !this.ui || !this.characterPortrait || !this.characterNameText ||
            !this.hpValueText || !this.manaValueText || !this.baseDmgValueText || !this.strValueText ||
            !this.agiValueText || !this.intValueText || !this.conValueText)
        {
            // console.warn("UI elements not ready yet in updateCharacterPreview");
            return; // Don't try to update if things aren't ready
        }
        // --- End Check ---

        const playerClass = this.classGrid.getSelectedItem().toLowerCase();

        // Update Portrait & Name Text
        if (this.textures.exists(playerClass)) {
            this.characterPortrait.setTexture(playerClass);
        } else { /* Warn, set default */ }
        this.characterNameText.setText(playerClass.charAt(0).toUpperCase() + playerClass.slice(1));

        // Update Stats Display
        const classDef = CLASS_DEFINITIONS[playerClass];

        if (classDef) {
            // --- Calculate Level 1 Derived Stats for Preview ---
            // Base Primary Stats
            const baseStr = classDef.baseStats?.strength || 10;
            const baseAgi = classDef.baseStats?.agility || 10;
            const baseInt = classDef.baseStats?.intelligence || 10;
            const baseCon = classDef.baseStats?.constitution || 10;

            // Calculate HP (Level 1 formula from recalculatePlayerStats)
            // HP = Base + (Growth * (Lvl-1)) + (CON * Scale) + EquipBonus
            // At level 1, Growth term is 0. No equipment bonus.
            const calculatedLvl1Hp = Math.floor(
                (classDef.baseHp || 40)
                + (baseCon * CON_HP_SCALE) // Uses imported CON_HP_SCALE
            );

            // Mana (Uses INT_MAGIC_ATTACK_SCALE)
            const calculatedLvl1Mana = Math.floor(
                (classDef.baseMana || 50)
                 // Make sure the formula here matches CharacterManager if mana depends on INT
                 + (baseInt * (INT_MAGIC_ATTACK_SCALE / 2)) // Uses imported INT_MAGIC_ATTACK_SCALE
            );

            // --- >>> CORRECTED Base Damage Calculation for PREVIEW <<< ---
            // Calculate contributions from STATS ONLY, using imported SCALES
            const physicalStatContribution = Math.floor(baseStr * STR_ATTACK_SCALE) + Math.floor(baseAgi * AGI_ATTACK_SCALE);
            const magicalStatContribution = Math.floor(baseInt * INT_MAGIC_ATTACK_SCALE);

            // Determine which stat contribution represents the primary damage type for display
            const primaryAttr = classDef.primaryAttribute;
            let displayedBaseDamage = 0;

            if (primaryAttr === 'strength' || primaryAttr === 'agility') {
                displayedBaseDamage = physicalStatContribution; // Show the scaled physical contribution
            } else if (primaryAttr === 'intelligence') {
                displayedBaseDamage = magicalStatContribution; // Show the scaled magical contribution
            } else {
                // Fallback if primary attribute isn't defined? Show physical?
                displayedBaseDamage = physicalStatContribution;
            }

            // --- Update Text Objects ---
            this.hpValueText.setText(calculatedLvl1Hp.toFixed(0));
            this.manaValueText.setText(calculatedLvl1Mana.toFixed(0));
            // --- Use the CORRECTLY calculated damage for display ---
            this.baseDmgValueText.setText(Math.max(0, displayedBaseDamage).toFixed(0)); // Ensure non-negative
            // --- Update primary stats ---
            this.strValueText.setText(baseStr.toFixed(0));
            this.agiValueText.setText(baseAgi.toFixed(0));
            this.intValueText.setText(baseInt.toFixed(0));
            this.conValueText.setText(baseCon.toFixed(0));
        } else {
            console.warn(`No class definition found for: ${playerClass}`);
            // Reset all stat values to '?'
            this.hpValueText.setText('?'); this.manaValueText.setText('?'); this.baseDmgValueText.setText('?');
            this.strValueText.setText('?'); this.agiValueText.setText('?'); this.intValueText.setText('?'); this.conValueText.setText('?');
        }
    }
}


export default CharacterSelectScene;