/*
 * Class for a game object that has animation using a spritesheet
 *
 * Gilberto Echeverria
 * 2026-02-10
 */

"use strict";

/**
 * Class to control the animation of characters and objects.
 * Inherits from GameObject.
 */
class AnimatedObject extends GameObject {
    constructor(position, width, height, color, type, sheetCols) {
        super(position, width, height, color, type);

        // --- ANIMATION PROPERTIES ---
        
        this.frame = 0;
        // Range of frames to display
        this.minFrame = 0;
        this.maxFrame = 0;
        // Number of columns in the sprite sheet
        this.sheetCols = sheetCols;
        // Toggle for looping animation
        this.repeat = true;
        // Delay between frames (in milliseconds)
        this.frameDuration = 100;
        // Timer to track frame changes
        this.totalTime = 0;

        /** * FIX: Initialize the spriteRect object.
         * This defines the source rectangle area to crop from the spritesheet.
         * Uses the Rect class you recently created.
         */
        this.spriteRect = new Rect(0, 0, width, height);
    }

    /**
     * Set the specific animation range and duration.
     */
    setAnimation(minFrame, maxFrame, repeat, duration) {
        this.minFrame = minFrame;
        this.maxFrame = maxFrame;
        this.frame = minFrame;
        this.repeat = repeat;
        this.totalTime = 0;
        this.frameDuration = duration;
    }

    
    updateFrame(deltaTime) {
        this.totalTime += deltaTime;

        if (this.totalTime > this.frameDuration) {
            // Determine the frame to use when the range ends based on this.repeat
            let restartFrame = this.repeat ? this.minFrame : this.maxFrame;

            // Change the current frame to the next one or restart
            this.frame = (this.frame === this.maxFrame) ? restartFrame : this.frame + 1;

            // Update the top left corner of the rectangle to crop from the spritesheet
            // Calculation: (Current Frame % Columns) * Frame Width
            this.spriteRect.x = (this.frame % this.sheetCols) * this.spriteRect.width;
            
            // Calculation: Floor(Current Frame / Columns) * Frame Height
            this.spriteRect.y = Math.floor(this.frame / this.sheetCols) * this.spriteRect.height;

            // Reset the timer for the next frame transition
            this.totalTime = 0;
        }
    }
}