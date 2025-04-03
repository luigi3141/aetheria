// ---- File: scripts/utils/AudioManager.js ----

import { ASSET_PATHS } from '../config/AssetConfig.js';

class AudioManager {
    constructor() {
        this.music = null; // Reference to the currently playing music track
        this.currentMusicKey = null; // Key of the current track
        this.scene = null; // Reference to the *current* active Phaser scene
        this.isMusicEnabled = true; // Default state
        this.isSfxEnabled = true;   // Default state
        this.musicVolume = 0.6;     // Default volume (0 to 1)
        this.sfxVolume = 0.8;       // Default volume (0 to 1)
        this.loadingMusicKey = null; // Track which key we are currently waiting for
        this.pendingMusicConfig = null; // Store config for pending music
        console.log("[AudioManager] Initialized.");
        this.loadSettings(); // Load settings from localStorage on init
    }

    // Call this when a scene starts/resumes to give AudioManager context
    setScene(scene) {
        if (!scene || !scene.sound) {
            console.warn("[AudioManager] setScene received invalid scene.");
            return;
        }
        // Only update if the scene reference changes or is initially null
        if (this.scene !== scene) {
             // console.log(`[AudioManager] Scene context updated to: ${scene.scene.key}`);
             this.scene = scene;
             // Ensure the current music's volume is correct in the new scene context
             if (this.music) {
                 this.music.setVolume(this.isMusicEnabled ? this.musicVolume : 0);
             }
        }
    }

    playMusic(key, config = {}) {
        if (!this.scene || !this.scene.sound) {
            console.warn(`[AudioManager] Cannot play music "${key}". No active scene context.`);
            return;
        }

        // If same music is playing, just ensure volume and exit
        if (this.music && this.currentMusicKey === key && this.music.isPlaying) {
            console.log(`[AudioManager] Music "${key}" already playing.`);
            this.setMusicVolume(this.musicVolume); // Ensure volume
            return;
        }

         // If we are requesting the key that is currently loading, do nothing yet
         if (this.loadingMusicKey === key) {
            console.log(`[AudioManager] Music "${key}" is currently loading. Play will start on completion.`);
            return;
         }


        // Stop previous music
        this.stopMusic(this.music ? 300 : 0); // Fade out if music was playing

        console.log(`[AudioManager] Requesting music: ${key}`);
        this.currentMusicKey = key; // Tentatively set the desired key

        // --- Check Cache and Loader State ---
        if (this.scene.cache.audio.exists(key)) {
            // Already loaded, proceed to play
            console.log(`[AudioManager] Music "${key}" found in cache. Playing.`);
            this._playLoadedMusic(key, config);
        } else if (this.scene.load.isLoading(key)) {
            // Already queued for loading by AssetLoader or elsewhere
            console.log(`[AudioManager] Music "${key}" is already loading. Setting up listener.`);
            this.loadingMusicKey = key;
            this._listenForLoadComplete(key, config);
        } else {
            // Not loaded and not currently loading - manually load it NOW using the current scene's loader
            console.log(`[AudioManager] Music "${key}" not loaded or loading. Starting manual load.`);
            const path = ASSET_PATHS.MUSIC[key] || ASSET_PATHS.MUSIC[Object.keys(ASSET_PATHS.MUSIC).find(k => ASSET_PATHS.MUSIC[k] === key)]; // Find path by value if key isn't direct
            if (path) {
                 this.loadingMusicKey = key;
                 this.scene.load.audio(key, path);
                 this._listenForLoadComplete(key, config);
                 // IMPORTANT: Start the loader IF it wasn't already running (e.g., if AssetLoader hasn't started yet or finished)
                 if (!this.scene.load.isLoading()) {
                      console.log("[AudioManager] Manually starting scene loader for music.");
                      this.scene.load.start();
                 }
            } else {
                 console.error(`[AudioManager] Cannot load music "${key}". Path not found in ASSET_PATHS.`);
                 this.currentMusicKey = null; // Reset desired key
            }
        }
    }


    // ---- File: scripts/utils/AudioManager.js ----
// Inside the AudioManager class

stopMusic(fadeOutDuration = 300) {
    // --- Capture the current music object ---
    const musicToStop = this.music;
    const keyToStop = this.currentMusicKey;
    // ---

    if (musicToStop && musicToStop.isPlaying) {
        console.warn(`[AudioManager] stopMusic called for key: ${keyToStop}. Initiating stop/fade...`);
        // console.trace(); // Keep trace if needed for further debugging

        // Clear current music reference IMMEDIATELY so subsequent playMusic calls don't interfere
         this.music = null;
         this.currentMusicKey = null;

        // Fade out smoothly
        if (this.scene && this.scene.tweens && fadeOutDuration > 0) {
            this.scene.tweens.add({
                targets: musicToStop, // <<< Target the captured object
                volume: 0,
                duration: fadeOutDuration,
                ease: 'Linear',
                onComplete: () => {
                    // --- Operate on the captured object ---
                    if (musicToStop) {
                        console.warn(`[AudioManager] stopMusic fade complete. Stopping sound object for: ${keyToStop}`);
                        musicToStop.stop();
                        console.warn(`[AudioManager] stopMusic stopped sound object. Destroying for: ${keyToStop}`);
                        // Check destroy exists before calling
                        if (typeof musicToStop.destroy === 'function') {
                            musicToStop.destroy();
                        }
                    }
                    // --- No need to touch this.music or this.currentMusicKey here ---
                }
            });
        } else {
            // Stop immediately
            console.warn(`[AudioManager] stopMusic called (no fade). Stopping sound object for: ${keyToStop}`);
            // console.trace();
            musicToStop.stop();
            console.warn(`[AudioManager] stopMusic stopped sound object (no fade). Destroying for: ${keyToStop}`);
            if (typeof musicToStop.destroy === 'function') {
                musicToStop.destroy();
            }
            // No need to touch this.music or this.currentMusicKey here either
        }
    } else {
         // If music reference exists but isn't playing (e.g., stopped by error) clean it up.
         // Or if called when nothing is playing.
         if (musicToStop && typeof musicToStop.destroy === 'function') {
             // Only destroy if it wasn't the one we explicitly stopped above
             if(this.music !== musicToStop) musicToStop.destroy();
         }
         // Ensure global state is null if nothing was playing or ref was bad
         this.music = null;
         this.currentMusicKey = null;
    }
}

    playSoundEffect(key, config = {}) {
        if (!this.scene || !this.scene.sound || !this.isSfxEnabled) {
            // console.warn(`[AudioManager] Cannot play SFX "${key}". No scene or SFX disabled.`);
            return;
        }
        if (!this.scene.cache.audio.exists(key)) {
             console.error(`[AudioManager] SFX key "${key}" not found in cache. Cannot play.`);
             return;
        }

        try {
             const sfxConfig = {
                volume: config.volume ?? this.sfxVolume, // Use configured SFX volume
                 ...config // Allow overriding volume etc.
             };
             this.scene.sound.play(key, sfxConfig);
        } catch (error) {
             console.error(`[AudioManager] Error playing SFX "${key}":`, error);
        }
    }

    // --- Settings Methods ---

    toggleMusic(enabled) {
        this.isMusicEnabled = enabled;
        console.log(`[AudioManager] Music ${this.isMusicEnabled ? 'Enabled' : 'Disabled'}`);
        if (this.music) {
            this.music.setVolume(this.isMusicEnabled ? this.musicVolume : 0);
        } else if (this.isMusicEnabled && this.currentMusicKey) {
             // If music was off and is now on, try restarting the track if we know its key
             // You might need more sophisticated logic here depending on desired behavior
             this.playMusic(this.currentMusicKey);
        }
        this.saveSettings();
    }

    toggleSfx(enabled) {
        this.isSfxEnabled = enabled;
        console.log(`[AudioManager] SFX ${this.isSfxEnabled ? 'Enabled' : 'Disabled'}`);
        this.saveSettings();
    }

    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        console.log(`[AudioManager] Music Volume set to: ${this.musicVolume}`);
        if (this.music && this.isMusicEnabled) {
            this.music.setVolume(this.musicVolume);
        }
        this.saveSettings();
    }

    setSfxVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        console.log(`[AudioManager] SFX Volume set to: ${this.sfxVolume}`);
        this.saveSettings();
    }

    // --- Persistence ---

    saveSettings() {
        try {
            localStorage.setItem('aetheriaAudioSettings', JSON.stringify({
                musicEnabled: this.isMusicEnabled,
                sfxEnabled: this.isSfxEnabled,
                musicVolume: this.musicVolume,
                sfxVolume: this.sfxVolume
            }));
        } catch (e) {
            console.error("[AudioManager] Failed to save settings:", e);
        }
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('aetheriaAudioSettings'));
            if (settings) {
                this.isMusicEnabled = settings.musicEnabled !== undefined ? settings.musicEnabled : true;
                this.isSfxEnabled = settings.sfxEnabled !== undefined ? settings.sfxEnabled : true;
                this.musicVolume = settings.musicVolume !== undefined ? Phaser.Math.Clamp(settings.musicVolume, 0, 1) : 0.6;
                this.sfxVolume = settings.sfxVolume !== undefined ? Phaser.Math.Clamp(settings.sfxVolume, 0, 1) : 0.8;
                console.log("[AudioManager] Loaded settings:", { music: this.isMusicEnabled, sfx: this.isSfxEnabled, musicVol: this.musicVolume, sfxVol: this.sfxVolume });
            } else {
                 console.log("[AudioManager] No saved settings found, using defaults.");
            }
        } catch (e) {
            console.error("[AudioManager] Failed to load settings:", e);
            // Use defaults if loading fails
            this.isMusicEnabled = true;
            this.isSfxEnabled = true;
            this.musicVolume = 0.6;
            this.sfxVolume = 0.8;
        }
    }
    _listenForLoadComplete(key, config) {
        // Use the scene's loader events
        const listenerKey = `filecomplete-audio-${key}`;
        console.log(`[AudioManager] Setting up listener for: ${listenerKey}`);

        // Remove previous listener for this specific key IF IT EXISTS to avoid duplicates
        this.scene.load.off(listenerKey, this._onMusicLoadComplete, this);
        // Add the new listener
        this.scene.load.once(listenerKey, this._onMusicLoadComplete, this);

        // Store config for when load completes
        this.pendingMusicConfig = { key: key, config: config };
    }

    _onMusicLoadComplete(loadedKey, type, data) {
         console.log(`[AudioManager] File complete event received for key: ${loadedKey}`);
        // Check if this is the music we were waiting for
        if (this.loadingMusicKey === loadedKey) {
            console.log(`[AudioManager] Music "${loadedKey}" finished loading.`);
            this.loadingMusicKey = null; // Clear loading flag

            // Check if the user wants *this* music key to be playing currently
            if (this.currentMusicKey === loadedKey) {
                console.log(`[AudioManager] Playing loaded music: ${loadedKey}`);
                this._playLoadedMusic(loadedKey, this.pendingMusicConfig?.config || {});
            } else {
                console.log(`[AudioManager] Music "${loadedKey}" loaded, but current desired key is now "${this.currentMusicKey}". Not playing.`);
            }
            this.pendingMusicConfig = null; // Clear pending config
        }
    }

    _playLoadedMusic(key, config = {}) {
        this.loadingMusicKey = null;
        this.pendingMusicConfig = null;

        // --- Add verbose logging ---
        console.log(`[AudioManager._playLoadedMusic] START - Key: ${key}`);
        if (!this.scene) { console.error(`[AudioManager._playLoadedMusic] FAILED - No scene context!`); return; }
        if (!this.scene.sound) { console.error(`[AudioManager._playLoadedMusic] FAILED - No scene.sound object!`); return; }
        if (!this.scene.cache.audio.exists(key)) { console.error(`[AudioManager._playLoadedMusic] FAILED - Key "${key}" not in cache (should not happen here)!`); return; }
        // --- End verbose logging ---

        try {
            console.log(`[AudioManager._playLoadedMusic] Creating sound object for key: ${key}`);
            this.music = this.scene.sound.add(key, {
                loop: config.loop !== undefined ? config.loop : true,
                volume: this.isMusicEnabled ? (config.volume ?? this.musicVolume) : 0
            });
            console.log(`[AudioManager._playLoadedMusic] Sound object created. Attempting play...`);

            // --- Add immediate listeners BEFORE play ---
            this.music.once('play', () => console.log(`[AudioManager] >>> Event: Music "${key}" started successfully.`));
            this.music.once('locked', () => console.warn(`[AudioManager] >>> Event: Audio "${key}" is locked.`));
            this.music.once('playerror', (sound, error) => {
                console.error(`[AudioManager] >>> Event: Error playing music "${key}":`, error);
                if (this.music === sound) { this.music = null; this.currentMusicKey = null; }
            });
            this.music.once('stop', () => console.log(`[AudioManager] >>> Event: Music "${key}" stopped.`)); // Listen for stop
            this.music.once('destroy', () => console.log(`[AudioManager] >>> Event: Music "${key}" destroyed.`)); // Listen for destroy
            // --- End listeners ---

            const playResult = this.music.play(); // Store result? Phaser's play might return the sound object or boolean? Usually just plays.
            console.log(`[AudioManager._playLoadedMusic] play() called for key: ${key}`); //. Play return value:`, playResult);

            // --- Check state immediately after play ---
            if (this.music && this.music.isPlaying) {
               console.log(`[AudioManager._playLoadedMusic] Play called. Status immediately after: isPlaying=true`);
               this.currentMusicKey = key; // Confirm key ONLY if play seems to have started
            } else if (this.music) {
               console.warn(`[AudioManager._playLoadedMusic] Play called. Status immediately after: isPlaying=false. State: ${this.music.state}`);
               // Don't set currentMusicKey if it didn't start
            } else {
                console.error(`[AudioManager._playLoadedMusic] Sound object became null immediately after play()!`);
            }
            // ---

        } catch (error) {
            console.error(`[AudioManager] _playLoadedMusic - Error adding/playing music "${key}":`, error);
            this.music = null;
            this.currentMusicKey = null;
        }
   }
}

// Create and export a single instance
const audioManager = new AudioManager();
export default audioManager;