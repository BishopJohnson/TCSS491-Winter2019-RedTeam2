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
 */
function Animation(spriteSheet, animName, frameX, frameY, frameWidth, frameHeight, frameSpacing, frameDuration, frames, loop, scale, direction) {
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

    //
    if (this.isDone()) {
        if (this.loop)
            this.elapsedTime = 0;
    }

    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;

    xindex = this.frameX + frame * (this.frameWidth + this.frameSpacing);
    yindex = this.frameY;

    //draws the image on the canvas
    ctx.drawImage(this.spriteSheet,                  //
                  xindex, yindex,                    // source from sheet
                  this.frameWidth, this.frameHeight, //width and height in 
                  x, y,                              //position in canvas
                  this.frameWidth * this.scale,      //x scale
                  this.frameHeight * this.scale);    //y scale
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
 * @return {boolean} ...
 */
Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}
