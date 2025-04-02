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

        if (!this.scene || !this.scene.sys.isActive() || !this.scene.cameras?.main) {
            console.warn("[Fade - Camera] Scene, system, or main camera not active/available. Aborting fade.");
            return;
        }

        if (this.scene.input?.enabled) {
            this.scene.input.enabled = false;
            console.log("[Fade - Camera] Scene input disabled.");
        }

        this.scene.cameras.main.fadeOut(duration, 0, 0, 0); // R, G, B set to 0 for black fade

        this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            console.log("[Fade - Camera] Fade-out COMPLETE.");
            try {
                if (callback) {
                    console.log("[Fade - Camera] Executing scene change callback...");
                    callback();
                    console.log("[Fade - Camera] Scene change callback finished.");
                } else {
                    console.warn("[Fade - Camera] No callback provided.");
                    if (this.scene.input) this.scene.input.enabled = true;
                }
            } catch (e) {
                console.error("[Fade - Camera] Error during scene change callback:", e);
                if (this.scene.input) this.scene.input.enabled = true;
            }
        });
    }


    /**
     * Fade in using a manual tween on the camera alpha.
     * @param {number} duration - Duration of the fade-in.
     */
    fadeIn(duration = 400) {
        // Check if already fading
        if (this.scene?.cameras?.main?.isFading) {
            console.warn(`[FadeIn - Manual Tween] Fade already in progress for scene: ${this.scene.scene.key}. Skipping.`);
            return;
        }
        console.log(`[FadeIn - Manual Tween] Attempting fade in for scene: ${this.scene.scene.key}`);
        if (!this.scene || !this.scene.sys.isActive() || !this.scene.cameras?.main) {
            console.warn("[FadeIn - Manual Tween] Scene, system, or main camera not active/available. Aborting fade.");
            return;
        }

        const camera = this.scene.cameras.main;
        // Ensure alpha starts at 0 before the tween begins
        camera.setAlpha(0);
        console.log(`[FadeIn - Manual Tween] Camera alpha BEFORE tween start: ${camera.alpha}`);

        // Use manual tween instead of camera.fadeIn
        this.scene.tweens.add({
            targets: camera,
            alpha: { from: 0, to: 1 }, // Explicitly tween alpha from 0 to 1
            duration: duration,
            ease: 'Linear', // Simple linear fade
            onComplete: () => {
                console.log(`[FadeIn - Manual Tween] Scene ${this.scene.scene.key} fade-in tween COMPLETE.`);
                 // Ensure alpha is EXACTLY 1 at the end
                 if(camera.alpha !== 1) {
                    console.warn(`[FadeIn - Manual Tween] Alpha was ${camera.alpha} after tween, forcing to 1.`);
                    camera.setAlpha(1);
                 }
                console.log(`[FadeIn - Manual Tween] Camera alpha AFTER tween: ${camera.alpha}`);
                if (this.scene.input) {
                    this.scene.input.enabled = true;
                    console.log(`[FadeIn - Manual Tween] Scene ${this.scene.scene.key} input enabled.`);
                } else {
                     console.warn(`[FadeIn - Manual Tween] Scene input not available to enable after fade.`);
                }
            },
            onCompleteScope: this // Ensure correct scope for onComplete
        });
        // --- End manual tween ---
    }
}

export default TransitionManager;