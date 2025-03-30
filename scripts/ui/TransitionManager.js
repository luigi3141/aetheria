// ---- File: TransitionManager.js ----

class TransitionManager {
    constructor(scene) {
        this.scene = scene;
        console.log(`[TransitionManager] Initialized for scene: ${scene.scene.key}`);
    }

    /**
     * Fade transition using the Scene Camera's fadeOut effect.
     * @param {Function} callback - Function to call to START the next scene.
     * @param {number} duration - Duration of the fade-out.
     */
    fade(callback, duration = 400) {
        console.log(`[Fade - Camera] Starting fade-out for scene change in ${this.scene.scene.key}...`);

        // --- Safety Check ---
        if (!this.scene || !this.scene.sys.isActive() || !this.scene.cameras?.main) {
            console.warn("[Fade - Camera] Scene, system, or main camera not active/available. Aborting fade.");
            return;
        }

        // Disable input for the current scene during transition
        if (this.scene.input?.enabled) {
            this.scene.input.enabled = false;
            console.log("[Fade - Camera] Scene input disabled.");
        }

        // Use camera fadeOut
        this.scene.cameras.main.fadeOut(duration, 0, 0, 0, (camera, progress) => {
            // This callback runs *during* the fade. We want the one *after*.
        });

        // Listen for the fade-out complete event
        this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            console.log("[Fade - Camera] Fade-out COMPLETE.");
            try {
                if (callback) {
                    console.log("[Fade - Camera] Executing scene change callback...");
                    callback(); // Execute the scene change
                    console.log("[Fade - Camera] Scene change callback finished.");
                } else {
                    console.warn("[Fade - Camera] No callback provided.");
                    // Re-enable input if no scene change happens
                    if (this.scene.input) this.scene.input.enabled = true;
                }
            } catch (e) {
                console.error("[Fade - Camera] Error during scene change callback:", e);
                // Re-enable input on error
                if (this.scene.input) this.scene.input.enabled = true;
            }
        });
    }

    /**
     * Fade in using the Scene Camera's fadeIn effect.
     * @param {number} duration - Duration of the fade-in.
     */
    fadeIn(duration = 400) {
        console.log(`[FadeIn - Camera] Fading in scene: ${this.scene.scene.key}`);
        if (!this.scene || !this.scene.sys.isActive() || !this.scene.cameras?.main) {
             console.warn("[FadeIn - Camera] Scene, system, or main camera not active/available. Aborting fade-in.");
             return;
        }

        // Use camera fadeIn
        this.scene.cameras.main.fadeIn(duration, 0, 0, 0, (camera, progress) => {
            // This callback runs *during* the fade.
        });

         // Listen for fade-in complete event to re-enable input
         this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (cam, effect) => {
             console.log(`[FadeIn - Camera] Scene ${this.scene.scene.key} fade-in complete.`);
             if (this.scene.input) {
                 this.scene.input.enabled = true;
                 console.log(`[FadeIn - Camera] Scene ${this.scene.scene.key} input enabled.`);
             }
         });
    }
}

export default TransitionManager;