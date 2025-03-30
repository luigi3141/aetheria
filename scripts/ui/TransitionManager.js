// ---- File: TransitionManager.js ----

class TransitionManager {
    constructor(scene) {
        this.scene = scene;
        // REMOVE isTransitioning flag for this simplified approach
        // this.isTransitioning = false;
        console.log(`[TransitionManager] Initialized for scene: ${scene.scene.key}`); // Add log
    }

    /**
     * Simple fade-to-black transition specifically for changing scenes.
     * Executes the callback WHEN the screen is fully black, BEFORE fading back in.
     * @param {Function} callback - Function to call to START the next scene.
     * @param {number} duration - Duration of the fade-in to black.
     */
    fade(callback, duration = 400) { // Reduced default duration slightly
        console.log(`[Fade] Starting fade transition for scene change in ${this.scene.scene.key}...`);

        // --- Safety Check ---
        if (!this.scene || !this.scene.sys.isActive()) {
            console.warn("[Fade] Scene is not active. Aborting fade.");
            // Optionally try to force callback if needed? Risky.
            // if(callback) callback();
            return;
        }

        // Get screen dimensions
        const width = this.scene.cameras.main.width;
        const height = this.scene.cameras.main.height;

        // Create fade rectangle - make sure it's on top
        const fadeRect = this.scene.add.rectangle(0, 0, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(0)
            .setDepth(9999); // Use a very high depth

        console.log("[Fade] Fade rectangle created.");

        // Disable input for the current scene during transition
        // Check if input system exists and is active
        if(this.scene.input?.enabled) {
            this.scene.input.enabled = false;
            console.log("[Fade] Scene input disabled.");
        }


        // Fade IN to black
        console.log("[Fade] Starting fade-in tween...");
        this.scene.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: duration,
            ease: 'Power2', // Smoother ease
            onComplete: () => {
                console.log("[Fade] Fade-in COMPLETE.");
                try {
                    if (callback) {
                        console.log("[Fade] Executing scene change callback...");
                        callback(); // <<< This should call navigationManager.navigateTo -> scene.start()
                        console.log("[Fade] Scene change callback finished.");
                    } else {
                        console.warn("[Fade] No callback provided for scene change.");
                         // If no callback, maybe just re-enable input and destroy rect?
                         if(this.scene.input) this.scene.input.enabled = true;
                         if(fadeRect.active) fadeRect.destroy();
                    }
                    // --- DO NOT START FADE-OUT HERE ---
                    // The fade-out should happen in the *next* scene's create method
                    // or be handled by a global transition layer.
                    // We also don't destroy fadeRect here because the new scene starts immediately.
                    // If the new scene DOESN'T handle fade-out, this rect will persist.

                } catch (e) {
                    console.error("[Fade] Error during scene change callback:", e);
                    // Re-enable input on error to prevent getting stuck
                    if(this.scene.input) this.scene.input.enabled = true;
                    console.log("[Fade - catch] Attempting to destroy fadeRect", fadeRect);

                    if(fadeRect.active) fadeRect.destroy(); // Clean up on error
                }
            },
            // Added onError handler for the tween itself
            onError: (tween, target) => {
                console.error("[Fade] Error occurred during fade-in tween.");
                if(this.scene.input) this.scene.input.enabled = true; // Re-enable input
                console.log("[Fade - onError] Attempting to destroy fadeRect", fadeRect);

                if(fadeRect.active) fadeRect.destroy(); // Clean up
            }
        });
    }

    // You might add a separate method for fading *in* when a new scene starts
    fadeIn(duration = 400) {
        console.log(`[FadeIn] Fading in scene: ${this.scene.scene.key}`);
         if (!this.scene || !this.scene.sys.isActive()) return;

        // Assume camera already has fade effect applied or create overlay
        this.scene.cameras.main.fadeIn(duration, 0, 0, 0, (camera, progress) => {
            if (progress === 1) {
                console.log(`[FadeIn] Scene ${this.scene.scene.key} fade-in complete.`);
                 // Re-enable input after fade-in
                 if(this.scene.input) {
                    this.scene.input.enabled = true;
                    console.log(`[FadeIn] Scene ${this.scene.scene.key} input enabled.`);
                 }
            }
        });
    }
}

export default TransitionManager;