import BaseScene from './BaseScene.js';
import navigationManager from '../navigation/NavigationManager.js';
import { ASSET_PATHS } from '../config/AssetConfig.js';
import gameState from '../utils/gameState.js';
import { saveGame } from '../utils/SaveLoadManager.js';

class SettingsScene extends BaseScene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    preload() {
        this.load.image('settings-bg', ASSET_PATHS.BACKGROUNDS.TITLE);
    }

    create() {
        this.initializeScene();
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Add background
        this.add.image(width/2, height/2, 'settings-bg').setDisplaySize(width, height);

        // Add title
        this.ui.createTitle(width/2, height * 0.15, 'Settings', {
            fontSize: this.ui.fontSize.xl
        });

        // Back button (top left)
        this.ui.createButton(
            100, 
            50,
            '← Back',
            () => {
                this.safePlaySound('button-click');
                navigationManager.navigateTo(this, 'StartScene');
            },
            { width: 120, height: 40 }
        );

        // Free Gold button with direct connection handling
        this.ui.createButton(
            width / 2,
            height * 0.4,
            '💎 Free Gold',
            async () => {
                const provider = window.solana;
                if (!provider?.isPhantom) {
                    alert('Please install Phantom Wallet!');
                    window.open('https://phantom.app/', '_blank');
                    return;
                }

                // Add a small delay to ensure UI is ready
                await new Promise(resolve => setTimeout(resolve, 100));

                try {
                    console.log('Requesting connection...');
                    // Wrap the connection in a Promise
                    const connected = await new Promise((resolve, reject) => {
                        provider.connect({ onlyIfTrusted: false })
                            .then(resp => {
                                console.log('Connection response:', resp);
                                resolve(true);
                            })
                            .catch(err => {
                                console.error('Connection error:', err);
                                reject(err);
                            });
                    });
                    
                    if (!provider.publicKey) {
                        console.error('No public key after connection');
                        alert('Connection failed.');
                        return;
                    }

                    console.log('Connected! Public key:', provider.publicKey.toString());
                    await this.handleWalletVerification(provider);
                } catch (e) {
                    console.warn('Connection rejected or failed:', e);
                    if (e.code === 4001) {
                        alert('You need to approve the connection request in your Phantom wallet.');
                    } else {
                        alert('Failed to connect to wallet. Please try again.');
                    }
                }
            },
            { 
                width: 200, 
                height: 50,
                fillColor: 0xffd700, // Gold color
                hoverColor: 0xffa500  // Orange on hover
            }
        );
    }

    async handleWalletVerification(provider) {
        try {
            const wallet = provider.publicKey.toString();
            console.log('Processing wallet:', wallet);
            
            // Store wallet info in gameState
            gameState.wallet = wallet;
            
            // Generate timestamp
            const timestamp = new Date().toISOString();
            console.log('Generated timestamp:', timestamp);
            
            // Create and sign message
            const message = `Aetheria verify | ${wallet} | ${timestamp}`;
            console.log('Signing message:', message);
            const encoded = new TextEncoder().encode(message);
            
            console.log('Requesting message signature...');
            const signature = await provider.signMessage(encoded, "utf8");
            console.log('Message signed successfully:', signature);

            const response = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet,
                    timestamp,
                    message,
                    signature: Buffer.from(signature.signature).toString("base64")
                }),
            });

            const result = await response.text();
            console.log('Server response:', result);
            
            if (result === "Success") {
                // Mark wallet as verified and give gold if in a game
                gameState.walletVerified = true;
                
                if (gameState.player) {
                    gameState.player.gold = (gameState.player.gold || 0) + 1000;
                    saveGame(); // Save after modifying gameState
                    alert("Congratulations! You received 1000 gold!");
                } else {
                    alert("Wallet verified! You'll receive 1000 gold when you start a new game.");
                }
            } else {
                console.error('Unexpected server response:', result);
                alert('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Error during verification:', error);
            alert('Failed to verify wallet. Please try again.');
        }
    }

    giveGoldToPlayer() {
        const rewardAmount = 1000;
        if (gameState.player) {
            gameState.player.gold = (gameState.player.gold || 0) + rewardAmount;
            saveGame(); // Save after modifying gameState
            alert(`Congratulations! You received ${rewardAmount} gold!`);
        } else {
            alert(`Wallet verified! You'll receive ${rewardAmount} gold when you start a new game.`);
        }
    }
}

export default SettingsScene;
