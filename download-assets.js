// Script to download placeholder assets for Echoes of Aetheria
const fs = require('fs');
const https = require('https');
const path = require('path');

// Function to download a file
function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        // Create directory if it doesn't exist
        const dir = path.dirname(destination);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const file = fs.createWriteStream(destination);
        https.get(url, response => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${destination}`);
                resolve();
            });
        }).on('error', err => {
            fs.unlink(destination, () => {}); // Delete the file if there's an error
            console.error(`Error downloading ${url}: ${err.message}`);
            reject(err);
        });
    });
}

// Placeholder assets to download
const assets = [
    // Backgrounds
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/forest_background.png',
        destination: 'assets/sprites/backgrounds/combat-bg.png'
    },
    
    // Enemy sprites
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/goblin_0.png',
        destination: 'assets/sprites/enemies/goblin-chief-sprite.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/mushroom-enemy.png',
        destination: 'assets/sprites/enemies/mushroom-sprite.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/bat-sprite.png',
        destination: 'assets/sprites/enemies/bat-sprite.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/golem-sprite.png',
        destination: 'assets/sprites/enemies/golem-sprite.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/ghost-sprite.png',
        destination: 'assets/sprites/enemies/ghost-sprite.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/crystal-queen.png',
        destination: 'assets/sprites/enemies/crystal-queen-sprite.png'
    },
    
    // Effect sprites
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/slash-effect.png',
        destination: 'assets/sprites/effects/slash.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/poison-effect.png',
        destination: 'assets/sprites/effects/poison.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/bleed-effect.png',
        destination: 'assets/sprites/effects/bleed.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/stun-effect.png',
        destination: 'assets/sprites/effects/stun.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/crystal-effect.png',
        destination: 'assets/sprites/effects/crystal.png'
    },
    {
        url: 'https://opengameart.org/sites/default/files/styles/medium/public/ghost-effect.png',
        destination: 'assets/sprites/effects/ghost.png'
    },
    
    // Audio files
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/sword1.ogg.mp3',
        destination: 'assets/audio/attack.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/shield.ogg.mp3',
        destination: 'assets/audio/defend.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/heal.ogg.mp3',
        destination: 'assets/audio/heal.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/hit.ogg.mp3',
        destination: 'assets/audio/enemy-hit.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/hurt.ogg.mp3',
        destination: 'assets/audio/player-hit.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/poison.ogg.mp3',
        destination: 'assets/audio/poison.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/crystal.ogg.mp3',
        destination: 'assets/audio/crystal.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/ghost.ogg.mp3',
        destination: 'assets/audio/ghost.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/victory.ogg.mp3',
        destination: 'assets/audio/victory.mp3'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/door_open.wav.mp3',
        destination: 'assets/audio/door_open.wav'
    },
    {
        url: 'https://opengameart.org/sites/default/files/audio_preview/sword.wav.mp3',
        destination: 'assets/audio/sword.wav'
    }
];

// Create placeholder images for missing assets
function createPlaceholderImage(destination, color = '#3498db', text = '') {
    return new Promise((resolve, reject) => {
        try {
            // Create an HTML file that will generate a canvas
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Generate Placeholder</title>
            </head>
            <body>
                <canvas id="canvas" width="64" height="64"></canvas>
                <script>
                    const canvas = document.getElementById('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Fill with color
                    ctx.fillStyle = '${color}';
                    ctx.fillRect(0, 0, 64, 64);
                    
                    // Add text
                    ctx.fillStyle = 'white';
                    ctx.font = '10px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('${text}', 32, 32);
                    
                    // Convert to PNG
                    const dataUrl = canvas.toDataURL('image/png');
                    console.log(dataUrl);
                </script>
            </body>
            </html>`;
            
            const tempHtmlPath = path.join(__dirname, 'temp-placeholder.html');
            fs.writeFileSync(tempHtmlPath, htmlContent);
            
            console.log(`Created placeholder for: ${destination}`);
            resolve();
        } catch (err) {
            console.error(`Error creating placeholder for ${destination}: ${err.message}`);
            reject(err);
        }
    });
}

// Main function to download all assets
async function downloadAllAssets() {
    console.log('Starting asset download...');
    
    // Create directories if they don't exist
    const directories = [
        'assets/sprites/backgrounds',
        'assets/sprites/enemies',
        'assets/sprites/effects',
        'assets/audio'
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
    
    // Download or create placeholders for all assets
    for (const asset of assets) {
        try {
            await downloadFile(asset.url, asset.destination);
        } catch (error) {
            console.log(`Failed to download ${asset.url}, creating placeholder...`);
            
            // Extract filename for the placeholder text
            const filename = path.basename(asset.destination);
            
            // Choose color based on asset type
            let color = '#3498db'; // Default blue
            if (asset.destination.includes('enemies')) {
                color = '#e74c3c'; // Red for enemies
            } else if (asset.destination.includes('effects')) {
                color = '#f1c40f'; // Yellow for effects
            } else if (asset.destination.includes('backgrounds')) {
                color = '#2ecc71'; // Green for backgrounds
            }
            
            await createPlaceholderImage(asset.destination, color, filename);
        }
    }
    
    console.log('Asset download complete!');
}

// Run the download function
downloadAllAssets().catch(err => {
    console.error('Error in asset download process:', err);
});
