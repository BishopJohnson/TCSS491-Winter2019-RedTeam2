// No inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.box = new BoundingBox(0, 0, 0, 0, "scene");
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x - this.game.camera.x, this.y - this.game.camera.y);
};

Background.prototype.update = function () {
};

// Inheritance from Entity
/**
 * 
 * 
 * @param {GameEngine} game
 * @param {number} mixX The minimum x coordinate the camera may move to.
 * @param {number} maxX The maximum x coordinate the camera may move to.
 * @param {number} mixY The minimum y coordinate the camera may move to.
 * @param {number} maxY The maximum y coordinate the camera may move to.
 */
function Camera(game, minX, maxX, minY, maxY) {
	this.x = 0;
	this.y = 0;
	this.minX = minX;
	this.maxX = maxX;
	this.minY = minY;
	this.maxY = maxY;
	this.game = game;
	this.ctx = this.game.ctx;
	this.player = this.game.player;
	// Box not used for interaction but can help with debugging
	this.box = new BoundingBox(this.x, this.y, this.ctx.canvas.width, this.ctx.canvas.height, "camera");
	
	Entity.call(this, game, this.x, this.y);
}

Camera.prototype = new Entity();
Camera.prototype.constructor = Camera;

/**
 * 
 */
Camera.prototype.update = function() {
	var oldX = this.x;
	var oldY = this.y;
	
	this.x = this.player.x - this.ctx.canvas.width / 2;
	// Verify camera is within defined level bounds
	if (this.x + this.ctx.canvas.width > this.maxX) this.x = oldX;
	else if (this.x < this.minX) this.x = this.minX;
	
	this.y = this.player.y - this.ctx.canvas.height / 2;
	// Verify camera is within defined level bounds
	if (this.y + this.ctx.canvas.height > this.maxY) this.y = oldY;
	else if (this.y < this.minY) this.y = this.minY;
	this.box = new BoundingBox(this.x, this.y,
							   this.ctx.canvas.width, this.ctx.canvas.height, "camera");
							   
	Entity.prototype.update.call(this);
}

/**
 * Required for inheritance. Camera is not a drawn entity.
 */
Camera.prototype.draw = function() {
	this.ctx.font = "30px serif";
	this.ctx.fillStyle = "black";	
	this.ctx.fillRect(29, 5, 118, 30);
	this.ctx.fillStyle = "yellow";	
	var time = Math.ceil(this.game.sceneManager.timeLimit);
	this.ctx.fillText("Time:" + time, 30, 30);
	/**************************************************
	Can be expanded to display energy, power up status
	**************************************************/
};

// Inheritance from Entity
/**
 * 
 * 
 * @param {any} game The game engine.
 * @param {number} x The x coordinate of the platform.
 * @param {number} y The y coordinate of the platform.
 * @param {number} width The width of the platform.
 * @param {number} height The height of the platform.
 */
function Platform(game, x, y, width, height) {
    this.ctx = game.ctx;
    this.width = width;
    this.height = height;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "platform");

    Entity.call(this, game, x, y);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

/**
 * 
 */
Platform.prototype.update = function () {
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "platform");

    Entity.prototype.update.call(this);
}

/**
 * 
 */
Platform.prototype.draw = function () {
    // No sprite to draw

    // Draws collider border for debugging
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    
    Entity.prototype.draw.call(this);
}

// Inheritance from Entity
/**
 * A moving platform used by the Construction Worker enemy.
 * 
 * @param {any} game The game engine.
 * @param {number} x The x coordinate of the platform.
 * @param {number} y The y coordinate of the platform.
 * @param {number} width The width of the platform.
 * @param {number} height The height of the platform.
 */
function ConWorkerPlatform(game, x, y, width, height, owner) {
    this.ctx = game.ctx;
    this.width = width;
    this.height = height;
	this.owner = owner;
	this.deltaX = 0;
	this.deltaY = 0;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "platform");

    Entity.call(this, game, x, y);
}

ConWorkerPlatform.prototype = new Entity();
ConWorkerPlatform.prototype.constructor = ConWorkerPlatform;

/**
 * 
 */
ConWorkerPlatform.prototype.update = function () {
	
    // Iterates over game entities to check for collision
    for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var tempBox = new BoundingBox(this.box.x, this.box.y, this.box.width, this.box.height + 1, this.box.tag);
        var collide = tempBox.collide(entity.box);

        if (entity !== this && entity !== this.owner && (collide.object == "player" || collide.object == "enemy"|| collide.object == "hook")) { // Player, hook, or enemy is colliding with the platform
            // Checks if entity is on top of platform
            if (collide.bottom || collide.left || collide.right) {
				// Apply shift from construction worker to all colliding entities
                entity.x += this.deltaX;
				entity.y += this.deltaY;
            }
        }
    }
    Entity.prototype.update.call(this);
}

/**
 * 
 */
ConWorkerPlatform.prototype.draw = function () {
    // No sprite to draw

    // Draws collider border for debugging
    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);

    Entity.prototype.draw.call(this);
}

/**
Defines the area that Yamada must reach to win the level.
*/
function WinArea(game, x, y, width, height) {
	this.game = game;
	this.ctx = game.ctx;
    this.width = width;
    this.height = height;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "win");
	
	Entity.call(this, game, x, y);
}

WinArea.prototype = new Entity();
WinArea.prototype.constructor = WinArea;

WinArea.prototype.update = function () {
	this.box = new BoundingBox(this.x, this.y, this.width, this.height, "win");
	var wincon = this.box.collide(this.game.player.box);
	if(wincon.object == "player")
		this.game.sceneManager.loadLevel(this.game.sceneManager.nextLevel);
	
	Entity.prototype.update.call(this);
}

WinArea.prototype.draw = function () {
	this.ctx.strokeStyle = "yellow";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
}

/**
A checkpoint for Yamada to respawn at when he runs out of stamina.
*/
function Checkpoint(game, x, y, pointID) {
	this.game = game;
	this.ctx = game.ctx;
	this.scene = game.sceneManager;
	this.ID = pointID;
	this.active = false;
	// Set animation to use inactive sprite
    this.box = new BoundingBox(this.x, this.y, 32, 64, "checkpoint");
	
	Entity.call(this, game, x, y);
}

Checkpoint.prototype = new Entity();
Checkpoint.prototype.constructor = Checkpoint;

Checkpoint.prototype.update = function () {
	this.box = new BoundingBox(this.x, this.y, 32, 64, "checkpoint");
	var playerCheck = this.box.collide(this.game.player.box);
	if(playerCheck.object == "player") {
		this.active = true;
		// In future set checkpoint to use active sprite
		if (!this.scene.activeCheckpoint || this.scene.activeCheckpoint.ID < this.ID)
			this.game.sceneManager.activeCheckpoint = this;
	}
	Entity.prototype.update.call(this);
}

Checkpoint.prototype.draw = function () {
	this.ctx.strokeStyle = "Blue";
	if(this.active) this.ctx.strokeStyle = "Lime";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, 32, 64);
}

// Inheritance from Entity
/**
 * 
 * 
 * @param {any} player
 * @param {any} dirVector
 */
function Hook(player, dirVector) {
    this.player = player;
	this.game = player.game;
	this.ctx = player.game.ctx;
    this.x = player.x + player.animation.hotspotX;
    this.y = player.y + player.animation.hotspotY;
	this.direction = dirVector;
	this.box = new BoundingBox(this.x, this.y, 0, 0, "hook");
    this.attached = false;
}

Hook.prototype = new Entity();
Hook.prototype.constructor = Hook;

/**
 * 
 */
Hook.prototype.update = function() {
    const originX = this.player.x + this.player.animation.hotspotX; // x position of the barrel
    const originY = this.player.y + this.player.animation.hotspotY; // y position of the barrel
    var minDist = 900;
    var intPoint = null;
	this.box = new BoundingBox(this.x, this.y, 0, 0, "hook");

	for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
		if (entity.box.tag == "platform") { // TEMPORARY, only check platforms
			// Check collision with top of box
            var collPoint = lineIntersect(originX, this.x, originY, this.y, entity.box.left, entity.box.right, entity.box.top, entity.box.top);			
			if (collPoint) {
                thisDist = dist(originX, originY, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with bottom of box
            collPoint = lineIntersect(originX, this.x, originY, this.y, entity.box.left, entity.box.right, entity.box.bottom, entity.box.bottom);
			if (collPoint) {
                thisDist = dist(originX, originY, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with left of box
            collPoint = lineIntersect(originX, this.x, originY, this.y, entity.box.left, entity.box.left, entity.box.bottom, entity.box.top);
			if (collPoint) {
                thisDist = dist(originX, originY, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with left of box
            collPoint = lineIntersect(originX, this.x, originY, this.y, entity.box.right, entity.box.right, entity.box.bottom, entity.box.top);
			if (collPoint) {
                thisDist = dist(originX, originX, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
		}
	}
	if (intPoint && !this.attached) { // Collided with something, move hook to that point
		this.x = intPoint.x;
		this.y = intPoint.y;
		this.box = new BoundingBox(this.x, this.y, 0, 0);
		this.attached = true;
		this.player.aiming = false;
		this.player.grappling = true;
	} else if (!this.attached) {
		this.x += this.direction.x;
		this.y += this.direction.y;		

        if (dist(this.x, this.y, originX, originY) > 520) {
			// Hook is at max distance and found no target
			this.player.aiming = false;
			this.player.hook = null;
            this.removeFromWorld = true;
		}
	}
	
	Entity.prototype.update.call(this);
}

/**
 * 
 */
Hook.prototype.draw = function () {
    const originX = this.player.x + this.player.animation.hotspotX; // x position of the barrel
    const originY = this.player.y + this.player.animation.hotspotY; // y position of the barrel

	this.ctx.beginPath();
	this.ctx.lineWidth = 2;
	this.ctx.strokeStyle = "brown";
    this.ctx.moveTo(originX - this.game.camera.x, originY - this.game.camera.y);
	this.ctx.lineTo(this.x - this.game.camera.x, this.y - this.game.camera.y);
	this.ctx.stroke();
	this.ctx.closePath();
	
	this.ctx.strokeStyle = "grey";
	this.ctx.fillRect(this.x - 1 - this.game.camera.x, this.y - 1 - this.game.camera.y, 3, 3);
}

// Inheritance from Entity
/**
 * 
 * 
 * @param {any} game
 * @param {any} spritesheet
 */
function ConWorker(game, spritesheet, x, y) {
    this.spritesheet = spritesheet;
    this.animationWalkR = new Animation(spritesheet, "walk", 0, 0, 42, 42, 0, 0.10, 8, true, 2, "right", 0, 7, 42, 35);
    this.animationWalkL = new Animation(spritesheet, "walk", 0, 42, 42, 42, 0, 0.10, 8, true, 2, "left", 0, 7, 42, 35);
    this.animation = this.animationWalkR; // Initial animation
    this.ctx = game.ctx;
    this.speed = 2;
    this.falling = false;
    this.platform = null;
    this.box = null;

    this.updateBox("enemy");

    this.movingPlatform = new ConWorkerPlatform(game, this.x, this.y, this.box.width, this.box.y - this.y, this);

    game.addEntity(this.movingPlatform); // Adds the platform to the list of entities
    Entity.call(this, game, x, y);
}

ConWorker.prototype = new Entity();
ConWorker.prototype.constructor = ConWorker;

/**
 * 
 */
ConWorker.prototype.update = function () {
	
	var oldX = this.x;
	var oldY = this.y;
	
    // Checks if still on platform
    if (this.platform) {
        // Check with temporary hitbox, as shunted out after last collision
        var tempBox = new BoundingBox(this.box.x, this.box.y + 1, this.box.width, this.box.height, this.box.tag);
        var collide = tempBox.collide(this.platform.box);

        if (!collide.top) {
            this.falling = true;
            this.platform = null;
        } else if (this.box.x + (this.box.width / 2) < this.platform.x) {
            this.animation = this.animationWalkR;
        } else if (this.box.x + (this.box.width / 2) > this.platform.x + this.platform.width) {
            this.animation = this.animationWalkL;
        }
    } else {
        this.falling = true; // No platform reference, must be falling
        this.velocityY += 9.8 * 0.012; // Applies gravity if falling
    }

    if (this.animation.direction == "right")
        this.velocityX = this.speed;
    else
        this.velocityX = -this.speed;

    // Updates position
    this.x += this.velocityX;
    this.y += this.velocityY;

    // Saves bounding box before updating
    var lastBox = this.box;

    // Updates bounding box
    this.updateBox("enemy");

    // Iterates over game entities to check for collision
    for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var collide = this.box.collide(entity.box); // The collision results

        // Checks if entity collided with a wall
        if (entity !== this && collide.object == "platform") {
            // Landed on platform
            if (collide.top && lastBox.bottom <= entity.box.top) {
                this.y = entity.box.top - this.box.height - (this.box.top - this.y);
                this.velocityY = 0;
                this.falling = false;
                this.platform = entity;
            }

            // Ran into left side of platform
            if (collide.left && lastBox.right <= entity.box.left) {
                this.x = entity.box.left - this.box.width + (this.x - this.box.left);
                this.animation = this.animationWalkL;
            }

            // Ran into right side of platform
            if (collide.right && lastBox.left >= entity.box.right) {
                this.x = entity.box.right - (this.box.left - this.x);
                this.animation = this.animationWalkR;
            }

            // Hit bottom of platform
            if (collide.bottom && lastBox.top >= entity.box.bottom) {
                this.y = entity.box.bottom + (this.y - this.box.top);
                this.velocityY = 0;
            }

            // Update bounding box following shunt out of collision
            this.updateBox("enemy");                  //
        } else if (entity !== this && collide.object == "player") { // Knocks out the player
            entity.knockout();
        }
    }

    this.movingPlatform.box = new BoundingBox(this.x, this.y, this.box.width, this.box.y - this.y, "platform");
	
	this.movingPlatform.deltaX = this.x - oldX;
	this.movingPlatform.deltaY = this.y - oldY;

    Entity.prototype.update.call(this);
}

/**
 * 
 */
ConWorker.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, this.y - this.game.camera.y);

    var animWidth = this.animation.frameWidth * this.animation.scale;
    var animHeight = this.animation.frameHeight * this.animation.scale;
    var boxWidth = this.box.width;
    var boxHeight = this.box.height;

    // Draws animation border for debugging
    this.ctx.strokeStyle = "green";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, animWidth, animHeight);

    // Draws collider border for debugging
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(this.box.x - this.game.camera.x, this.box.y - this.game.camera.y, boxWidth, boxHeight);

    Entity.prototype.draw.call(this);
}

/** TODO: Have all Actors inherit this prototype.
 * Updates the bounding box of the actor using their animation data.
 * 
 * @param {string} tag The tag attached to the box.
 * @param {number} offsetX (Optional) Specified offsets for the x coordinate.
 * @param {number} offsetY (Optional) Specified offsets for the y coordinate.
 */
ConWorker.prototype.updateBox = function (tag, offsetX, offsetY) {
    // Sets value to zero for any offset not passed
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;

    // Asserts tag was passed and is a string
    if (tag.constructor !== String)
        throw "Bounding box tag is not ";

    var scale = this.animation.scale;

    this.box = new BoundingBox(this.x + this.animation.offsetX + (offsetX * scale), // x
        this.y + this.animation.offsetY + (offsetY * scale), // y
        this.animation.boxWidth,                             // width
        this.animation.boxHeight,                            // height
        tag);                                                // tag

    /* TODO: Return the new bounding box after Actor.animate has been implemented.
     */
}

// Main code begins here

var AM = new AssetManager();

AM.queueDownload("./NeverLateSalaryMan/img/Yamada.png");
AM.queueDownload("./NeverLateSalaryMan/img/ConstrWorker.png");
AM.queueDownload("./NeverLateSalaryMan/img/PrototypeLevel.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false; // Disables pixel smoothing

    var gameEngine = new GameEngine();
	gameEngine.SceneManager = new SceneManager(gameEngine);
    gameEngine.init(ctx);
    gameEngine.start();

	// Display basic splash screen
	gameEngine.SceneManager.loadLevel(0);

    console.log("All Done!");
});
