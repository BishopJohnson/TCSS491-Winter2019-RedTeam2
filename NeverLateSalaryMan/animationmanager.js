/**
 * An animation object used to draw entities on screen.
 * 
 * @param {any} spriteSheet The sprite sheet being used.
 * @param {string} animName The name of the animation.
 * @param {number} frameX The starting x coordinate on the sprite sheet.
 * @param {number} frameY The starting y coordinate on the sprite sheet.
 * @param {number} frameWidth The width of the animation frame.
 * @param {number} frameHeight The height of the animation frame.
 * @param {number} frameSpacing The pixel spacing between each frame.
 * @param {number} frameDuration The amount of time each frame is on the screen.
 * @param {number} frames The number of frames in the animation.
 * @param {boolean} loop If the frame loops.
 * @param {number} scale The scale of the image when drawn.
 * @param {string} direction The direction the animation is facing.
 * @param {number} offsetX (Optional) The x offset of the animation's hit box.
 * @param {number} offsetY (Optional) The y offset of the animation's hit box.
 * @param {number} boxWidth (Optional) The width of the animation's hit box.
 * @param {number} boxHeight (Optional) The height of the animation's hit box.
 * @param {number} hotspotX (Optional) The x coordinate of the animation's hotspot.
 * @param {number} hotspotY (Optional) The y coordinate of the animation's hotspot.
 */
function Animation(spriteSheet, animName, frameX, frameY, frameWidth, frameHeight, frameSpacing, frameDuration, frames, loop, scale, direction, offsetX = 0, offsetY = 0, boxWidth = 0, boxHeight = 0, hotspotX = 0, hotspotY = 0) {
    this.spriteSheet = spriteSheet;
    this.animName = animName;
    this.frameX = frameX;
    this.frameY = frameY;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.frameSpacing = frameSpacing;
    this.frameDuration = frameDuration;
    this.frames = frames;
    this.totalTime = frameDuration * frames; //the total time length of the animation
    this.elapsedTime = 0;                    //the time since the animation started
    this.loop = loop;
    this.scale = scale;
    this.direction = direction;
    this.offsetX = offsetX * scale;
    this.offsetY = offsetY * scale;
    this.boxWidth = boxWidth * scale;
    this.boxHeight = boxHeight * scale;
    this.hotspotX = hotspotX * scale;
    this.hotspotY = hotspotY * scale;
}

/**
 * 
 * 
 * @param {number} tick
 * @param {any} ctx The context of the canvas (expected 2d).
 * @param {number} x The x position of the image in the canvas.
 * @param {number} y The y position of the image in the canvas.
 */
Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;

    if (this.isDone()) { // Checks if animation cycle is done
        if (this.loop)
            this.elapsedTime = 0;
    }

    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;

    // Gets the x and y position in the sprite sheet
    xindex = this.frameX + frame * (this.frameWidth + this.frameSpacing);
    yindex = this.frameY;

    // Draws the image on the canvas
    ctx.drawImage(this.spriteSheet,                  // spriteSheet
                  xindex, yindex,                    // x, y          (in spriteSheet)
                  this.frameWidth, this.frameHeight, // width, height (in spriteSheet)
                  x, y,                              // x, y          (in canvas)
                  this.frameWidth * this.scale,      // width         (in canvas)
                  this.frameHeight * this.scale);    // height        (in canvas)
}

/**
 * Returns the current frame the animation is on.
 * 
 * @return {number} The current frame the animation is on.
 */
Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

/**
 * Returns if the animation is done.
 * 
 * @return {boolean} True if the animation is done, false otherwise.
 */
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

/**
 * Checks if two animations are the same.
 * 
 * @param {Animation} other The other animation.
 * @return {boolean} True if the animations are the same, false otherwise.
 */
Animation.prototype.equals = function (other) {
    if (other == null) // Asserts animation was passed for comparision
        throw "No animation passed for comparision!";

    if (this.spriteSheet == other.spriteSheet
        && this.animName == other.animName
        && this.frameX == other.frameX
        && this.frameY == other.frameY
        && this.frameWidth == other.frameWidth
        && this.frameHeight == other.frameHeight
        && this.frameSpacing == other.frameSpacing
        && this.frameDuration == other.frameDuration
        && this.frames == other.frames
        && this.loop == other.loop
        && this.scale == other.scale
        && this.direction == other.direction
        && this.offsetX == other.offsetX
        && this.offsetY == other.offsetY
        && this.boxWidth == other.boxWidth
        && this.boxHeight == other.boxHeight
        && this.hotspotX == other.hotspotX
        && this.hotspotY == other.hotspotY)
        return true;

    return false;
}
