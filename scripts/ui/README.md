# Aetheria UI System

This document outlines the UI architecture for the Aetheria project.

## Overview

The UI system follows a component-based architecture with centralized layout management and consistent styling. The system is designed to be maintainable, reusable, and easy to extend.

## Folder Structure

```
/scripts/ui/
├── components/           # Reusable UI components
│   ├── Button.js        # Interactive buttons
│   ├── Panel.js         # Container panels
│   ├── StatusBar.js     # Health/mana/progress bars
│   ├── InputField.js    # Text input fields
│   ├── SelectionGrid.js # Grid-based selection interface
│   └── DebugOverlay.js  # Debug visualization tools
├── Layout.js            # Layout constants and calculations
└── UIManager.js         # UI orchestration and configuration
```

## Key Components

### UIManager

Central coordinator for the UI system that:
- Manages global UI settings (colors, spacing, fonts)
- Creates and manages complex UI structures
- Provides consistent styling across components
- Handles scene-specific UI requirements

Key methods:
- `createButton()`: Interactive buttons with hover/click effects
- `createPanel()`: Styled containers for grouping elements
- `createStatusBar()`: Dynamic bars for health/mana/progress
- `createCharacterPreview()`: Character selection cards
- `createSectionLabel()`: Styled section headers with decorations

### Components

Each component is self-contained with its own:
- Initialization logic
- Event handling
- Cleanup methods
- Style configuration
- Animation system

Notable components:
- **SelectionGrid**: Grid-based selection interface with keyboard/mouse support
- **Panel**: Flexible container with consistent styling
- **StatusBar**: Animated progress bars with current/max values
- **InputField**: Text input with validation and formatting

## Layout System

The layout system provides:
- Consistent spacing and positioning
- Responsive design support
- Grid-based layouts
- Scene-specific layout configurations

## Usage Example

```javascript
// Create a character selection card
const preview = ui.createCharacterPreview(x, y, characterData, {
    size: 300,
    nameColor: '#ffffff',
    panelOptions: {
        fillColor: ui.colors.secondary,
        strokeColor: ui.colors.accent
    }
});

// Create a section header
const header = ui.createSectionLabel(x, y, 'INVENTORY', {
    sideMarkers: true,
    animate: true,
    background: true
});
```

## Best Practices

1. Use UIManager methods instead of direct Phaser.Scene calls
2. Follow the established color/spacing system
3. Clean up UI elements when scenes change
4. Use Layout constants for positioning
5. Group related elements in panels
6. Implement proper destroy methods for cleanup
