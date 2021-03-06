// This game shell was happily copied from Googler Seth Ladd's "Bad Aliens" game and his Google IO talk in 2011

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

/**
 * 
 */
function Timer() {
    this.gameTime = 0;
    this.maxStep = 0.05;
    this.wallLastTimestamp = 0;
}

/**
 * 
 */
Timer.prototype.tick = function () {
    var wallCurrent = Date.now();
    var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
    this.wallLastTimestamp = wallCurrent;

    var gameDelta = Math.min(wallDelta, this.maxStep);
    this.gameTime += gameDelta;

    return gameDelta;
}

/**
 * 
 */
function GameEngine() {
    this.entities = [];
    this.showOutlines = false;
    this.ctx = null;
    this.player = null;
    this.camera = null;
    this.isPaused = true; // Paused by default
    this.click = null;
    this.mouse = null;
    this.wheel = null;
    this.keyUp = false;
    this.keyLeft = false;
    this.keyRight = false;
    this.keySever = false;
    this.keyGrapple = false;
    this.surfaceWidth = null;
    this.surfaceHeight = null;
}

/**
 * 
 * 
 * @param {any} ctx
 */
GameEngine.prototype.init = function (ctx) {
    this.ctx = ctx;
    this.surfaceWidth = this.ctx.canvas.width;
    this.surfaceHeight = this.ctx.canvas.height;
    this.startInput();
    this.timer = new Timer();

    console.log('game initialized');
}

/**
 * 
 */
GameEngine.prototype.start = function () {
    console.log("starting game");

    var that = this;

    (function gameLoop() {
        that.loop();
        requestAnimFrame(gameLoop, that.ctx.canvas);
    })();
}

/**
 * 
 */
GameEngine.prototype.startInput = function () {
    console.log('Starting input');
    var that = this;

    /**
     * 
     * 
     * @param {any} e
     */
    var getXandY = function (e) {
        var x = e.clientX - that.ctx.canvas.getBoundingClientRect().left;
        var y = e.clientY - that.ctx.canvas.getBoundingClientRect().top;

        return { x: x, y: y };
    }

    this.ctx.canvas.addEventListener("focusin", function (e) {
        that.isPaused = false;
        AUDIO_MANAGER.unpauseSound();
    }, false);

    this.ctx.canvas.addEventListener("focusout", function (e) {
        that.isPaused = true;
        AUDIO_MANAGER.pauseSound();
    }, false);

    this.ctx.canvas.addEventListener("mousemove", function (e) {
        that.mouse = getXandY(e);
    }, false);

    this.ctx.canvas.addEventListener("click", function (e) {
        that.click = getXandY(e);

        AUDIO_MANAGER.start();
    }, false);
    /*
    this.ctx.canvas.addEventListener("wheel", function (e) {
        that.wheel = e;
        e.preventDefault();
    }, false);*/

    this.ctx.canvas.addEventListener("contextmenu", function (e) {
        that.rightclick = getXandY(e);
        e.preventDefault();
    }, false);

    this.ctx.canvas.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 65: //A key
                that.keyLeft = true;
                break;
            case 68: //D key
                that.keyRight = true;
                break;
			case 87: // W key
				that.keyUp = true;
				break;
			case 76: //L key
				that.keySever = true;
				break;
            case 75: //K key
                that.keyGrapple = true;
                break;
            default:
            //default action
        }
    }, false);

    this.ctx.canvas.addEventListener("keyup", function (e) {
        switch (e.keyCode) {
            case 65: //A key
                that.keyLeft = false;
                break;
            case 68: //D key
                that.keyRight = false;
                break;
			case 87: // W key
				that.keyUp = false;
				break;
			case 76: // L key
				that.keySever = false;
				break;
            case 75: //K key
                that.keyGrapple = false;
                break;
            default:
                //default action
        }
    }, false);

    console.log('Input started');
}

/**
 * 
 * 
 * @param {any} entity
 */
GameEngine.prototype.addEntity = function (entity) {
    this.entities.push(entity);
    //console.log('added entity');
}

/**
 * 
 */
GameEngine.prototype.draw = function () {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.save();	
	if (this.background) this.background.draw();
	for (var j = 0; j <= 2; j++) {
		for (var i = 0; i < this.entities.length; i++) {
			var entity = this.entities[i];
			if (entity.zIndex == j)
				entity.draw();
		}
	}
	if (this.camera) this.camera.draw();
    this.ctx.restore();
}

/**
 * 
 */
GameEngine.prototype.update = function () {
    if (!this.isPaused) { // Checks if the game is not paused
        // Iterates over all entities tracked by the game.
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (!entity.removeFromWorld) { // Checks if the entity is marked for removal
                entity.update();
            }/* else {
            this.entities.splice(i, 1);
            i--;
        }*/
        }

        for (var i = this.entities.length - 1; i >= 0; --i) {
            if (this.entities[i].removeFromWorld) {
                this.entities.splice(i, 1);
                //console.log('removed entity');
            }
        }
    }
}

/**
 * 
 */
GameEngine.prototype.loop = function () {
    this.clockTick = this.timer.tick();
    this.update();
    this.draw();
    this.click = null;
    this.rightclick = null;
    this.wheel = null;
}

/**
 * Toggles the debug mode for the game.
 */
GameEngine.prototype.debugMode = function () {
    if (this.showOutlines) { // Checks if debug mode is enabled
        console.log("Debug Mode Disabled");
        this.showOutlines = false;
    } else {
        console.log("Debug Mode Enabled");
        this.showOutlines = true;
    }
}

/**
 * 
 * 
 * @param {any} game
 * @param {number} x
 * @param {number} y
 */
function Entity(game, x, y) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.removeFromWorld = false;
}

/**
 * 
 */
Entity.prototype.update = function () {
}

/**
 * 
 * 
 * @param {any} ctx
 */
Entity.prototype.draw = function (ctx) {
    if (this.game.showOutlines && this.radius) {
        this.game.ctx.beginPath();
        this.game.ctx.strokeStyle = "green";
        this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.game.ctx.stroke();
        this.game.ctx.closePath();
    }
}

/**
 * 
 * 
 * @param {any} image
 * @param {any} angle
 */
Entity.prototype.rotateAndCache = function (image, angle) {
    var offscreenCanvas = document.createElement('canvas');
    var size = Math.max(image.width, image.height);
    offscreenCanvas.width = size;
    offscreenCanvas.height = size;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
    offscreenCtx.translate(size / 2, size / 2);
    offscreenCtx.rotate(angle);
    offscreenCtx.translate(0, 0);
    offscreenCtx.drawImage(image, -(image.width / 2), -(image.height / 2));
    offscreenCtx.restore();
    //offscreenCtx.strokeStyle = "red";
    //offscreenCtx.strokeRect(0,0,size,size);
    return offscreenCanvas;
}

/**
 * 
 * 
 * @param {number} x
 * @param {number} y
 * @param {number} width (Optional)
 * @param {number} height (Optional)
 * @param {string} tag (Optional)
 */
function BoundingBox(x, y, width = 0, height = 0, tag = TAG_EMPTY) {
    if (width < 0) // Asserts width is greater than or equal to zero
        throw "Bounding box width is less than 0!";
    if (height < 0) // Asserts height is greater than or equal to zero
        throw "Bounding box height is less than 0!";

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.tag = tag;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

/**
 * 
 * 
 * @param {BoundingBox} other
 * @returns { object: string, top: boolean, bottom: boolean, left: boolean, right: boolean }
 */
BoundingBox.prototype.collide = function (other) {
    var collide = { object: TAG_EMPTY, top: false, bottom: false, left: false, right: false, engulf: false }; // Collision data to return

    if (other === undefined || other == null) // Checks if other bounding box exists
        return collide;

    if (this.bottom > other.top && this.top < other.top && !(this.left >= other.right) && !(this.right <= other.left)) // Collided with top side of other
        collide.top = true;
    if (this.top < other.bottom && this.bottom > other.bottom && !(this.left >= other.right) && !(this.right <= other.left)) // Collided with bottom side of other
        collide.bottom = true;
    if (this.right > other.left && this.left < other.left && !(this.top >= other.bottom) && !(this.bottom <= other.top)) // Collided with left side of other
        collide.left = true;
    if (this.left < other.right && this.right > other.right && !(this.top >= other.bottom) && !(this.bottom <= other.top)) // Collided with right side of other
        collide.right = true;
	if (this.left > other.left && this.right < other.right && this.top > other.top && this.bottom < other.bottom) // Box is inside the other
		collide.engulf = true;

    if (collide.top || collide.bottom || collide.left || collide.right || collide.engulf) // Sets tag if collision occured
        collide.object = other.tag;

    return collide;
}

/**
Represents a two-dimensional vector.
@param {integer} x
@param {integer} y
*/
function Vector(x, y) {
	this.x = x;
	this.y = y;
}

/**
Multiplies the vector by a scalar.
*/
Vector.prototype.multiply = function (coeff) {
	this.x *= coeff;
	this.y *= coeff;
}

/**
Returns the magnitude of the vector.
@return {number} vector's magnitude
*/
Vector.prototype.magnitude = function () {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}

/**
 * Creates a normalized vector in the direction of this vector.
 * 
 * @return {Vector} The normalized vector.
 */
Vector.prototype.normalize = function () {
    var m = this.magnitude();

    return new Vector(this.x / m, this.y / m);
}

/**
Returns the distance between two points.
@return {number} distance between points
*/
function dist(x1, y1, x2, y2) {
	deltaX = x2 - x1;
	deltaY = y2 - y1;
	return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
Finds the point of intersection between line segment A and line segment B, if it exists.
@return {x: xpos, y: ypos} or null
*/
function lineIntersect(x1A, x2A, y1A, y2A, x1B, x2B, y1B, y2B) {
	// Determine intersection of two lines using matrix algebra
    var det = (y2B - y1B) * (x2A - x1A) - (x2B - x1B) * (y2A - y1A);

    if (det == 0) // Parallel lines, treat as no intersect
        return null;

	var sc1 = ((x2B - x1B) * (y1A - y1B) - (y2B - y1B) * (x1A - x1B)) / det;
    var sc2 = ((x2A - x1A) * (y1A - y1B) - (y2A - y1A) * (x1A - x1B)) / det;

    if (sc1 >= 0 && sc1 <= 1 && sc2 >= 0 && sc2 <= 1) { // Intersection is within defined segments, return the point
		return {x: Math.floor(x1A + sc1 * (x2A - x1A)), 
				y: Math.floor(y1A + sc1 * (y2A - y1A))}
    }

	return null; // Lines intersect outside defined segment
}
