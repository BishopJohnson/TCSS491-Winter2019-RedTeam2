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
 * @param {any} game
 * @param {number} x The x coordinate of the camera.
 * @param {number} y The y coordinate of the camera.
 */
function Camera(game, x, y) {
	this.x = x;
	this.y = y;
	this.game = game;
	this.ctx = this.game.ctx;
	this.player = this.game.player;
	// Box not used for interaction but can help with debugging
	this.box = new BoundingBox(this.x, this.y, this.ctx.canvas.width, this.ctx.canvas.height, "camera");
	
	Entity.call(this, game, x, y);
}

Camera.prototype = new Entity();
Camera.prototype.constructor = Camera;

/**
 * 
 */
Camera.prototype.update = function() {
	this.x = this.player.x - this.ctx.canvas.width / 2;
	this.y = this.player.y - this.ctx.canvas.height / 2;
	this.box = new BoundingBox(this.x, this.y,
							   this.ctx.canvas.width, this.ctx.canvas.height, "camera");
	Entity.prototype.update.call(this);
}

/**
 * Required for inheritance. Camera is not a drawn entity.
 */
Camera.prototype.draw = function() {};

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
function ConWorkerPlatform(game, x, y, width, height) {
    this.ctx = game.ctx;
    this.width = width;
    this.height = height;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "platform");
    this.riders = []; // Array of entities riding the platform

    Entity.call(this, game, x, y);
}

ConWorkerPlatform.prototype = new Entity();
ConWorkerPlatform.prototype.constructor = ConWorkerPlatform;

/**
 * 
 */
ConWorkerPlatform.prototype.update = function () {
    // Iterates over platform riders to check for collision
    for (var i = 0; i < this.riders.length; i++) {
        var rider = this.riders[i];
        var collide = this.box.collide(entity.box); // The collision results

        if (!collide.top) { // Rider is not colliding with the platform anymore
            // Removes entity from array
            for (var j = i; j < this.riders.length - 1; j++) {
                this.riders[j] = this.riders[j + 1];
            }

            this.riders.pop();
            i--;
        }
    }

    // Iterates over game entities to check for collision
    for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var collide = this.box.collide(entity.box); // The collision results

        if (entity !== this && (collide.object == "player" || collide.object == "enemy") && !this.riders.includes(entity)) { // Player or enemy is colliding with the platform
            // Checks if entity is on top of platform
            if (collide.top) {
                this.riders.push(entity); // Registers entity as a rider.
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

	for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
		if (entity !== this.player && entity !== this.game.camera) { // No interaction between player and hook
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
function ConWorker(game, spritesheet) {
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

    this.movingPlatform = new ConWorkerPlatform(game, this.x, this.y, this.box.width, this.x - this.box.x);

    game.addEntity(this.movingPlatform); // Adds the platform to the list of entities
    Entity.call(this, game, 300, 300);
}

ConWorker.prototype = new Entity();
ConWorker.prototype.constructor = ConWorker;

/**
 * 
 */
ConWorker.prototype.update = function () {
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
    this.updateBox("enemy");                  //

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

    this.movingPlatform.box = new BoundingBox(this.x, this.y, this.box.width, this.x - this.box.x, "platform");

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

// Inheritance from Entity
/**
 * 
 * 
 * @param {any} game
 * @param {any} spritesheet
 */
function Yamada(game, spritesheet) {
    this.spritesheet = spritesheet;
    this.animationIdleR = new Animation(spritesheet, "idle", 0, 0, 32, 32, 0, 0.10, 8, true, 2, "right", 7, 0, 18, 32);
    this.animationIdleL = new Animation(spritesheet, "idle", 0, 32, 32, 32, 0, 0.10, 8, true, 2, "left", 7, 0, 18, 32);
    this.animationWalkR = new Animation(spritesheet, "walk", 0, 64, 32, 32, 0, 0.10, 8, true, 2, "right", 7, 0, 18, 32);
    this.animationWalkL = new Animation(spritesheet, "walk", 0, 96, 32, 32, 0, 0.10, 8, true, 2, "left", 7, 0, 18, 32);
    this.animationFallR = new Animation(spritesheet, "fall", 0, 160, 32, 32, 0, 1, 1, true, 2, "right", 7, 0, 25, 32, 28, 11);
    this.animationFallL = new Animation(spritesheet, "fall", 224, 160, 32, 32, 0, 1, 1, true, 2, "left", 0, 0, 25, 32, 3, 11);
    this.animationAimStandUpR = new Animation(spritesheet, "aim", 64, 128, 32, 32, 0, 1, 1, true, 2, "right", 1, 0, 25, 32, 12, 2);
    this.animationAimStandUpL = new Animation(spritesheet, "aim", 160, 128, 32, 32, 0, 1, 1, true, 2, "left", 6, 0, 25, 32, 20, 2);
    this.animationAimDiagonalR = new Animation(spritesheet, "aim", 32, 128, 32, 32, 0, 1, 1, true, 2, "right", 7, 0, 20, 32, 23, 3);
    this.animationAimDiagonalL = new Animation(spritesheet, "aim", 192, 128, 32, 32, 0, 1, 1, true, 2, "left", 5, 0, 20, 32, 8, 3);
    this.animationAimStraightR = new Animation(spritesheet, "aim", 0, 128, 32, 32, 0, 1, 1, true, 2, "right", 7, 0, 25, 32, 29, 11);
    this.animationAimStraightL = new Animation(spritesheet, "aim", 224, 128, 32, 32, 0, 1, 1, true, 2, "left", 0, 0, 25, 32, 2, 11);
    this.animationAimFallUpR = new Animation(spritesheet, "aim", 96, 160, 32, 32, 0, 1, 1, true, 2, "right", 2, 0, 19, 32, 12, 2);
    this.animationAimFallUpL = new Animation(spritesheet, "aim", 128, 160, 32, 32, 0, 1, 1, true, 2, "left", 11, 0, 19, 32, 20, 2);
    this.animationAimFallDiagonalR = new Animation(spritesheet, "aim", 32, 160, 32, 32, 0, 1, 1, true, 2, "right", 7, 0, 22, 32, 26, 3);
    this.animationAimFallDiagonalL = new Animation(spritesheet, "aim", 192, 160, 32, 32, 0, 1, 1, true, 2, "left", 3, 0, 22, 32, 6, 3);
    this.animation = this.animationIdleR; // Initial animation
    this.ctx = game.ctx;
    this.speed = .65;
    this.MAX_SPEED = 2.5;
    this.friction = .5;
    this.falling = false;
	this.aiming = false;
	this.grappling = false;
	this.hook = null;
	this.aimVector = new Vector(0, 0);
	this.hookSpeed = .02;
    this.platform = null;
    this.box = null;

    /* TODO: Make animations callable through a function.
     */

    this.updateBox("player");
    Entity.call(this, game, 100, 100);
}

Yamada.prototype = new Entity();
Yamada.prototype.constructor = Yamada;

/**
 * 
 */
Yamada.prototype.update = function () {
	// Checks if still on platform
    if (this.platform) {
        // Check with temporary hitbox, as shunted out after last collision
        var tempBox = new BoundingBox(this.box.x, this.box.y + 1, this.box.width, this.box.height, this.box.tag);
        var collide = tempBox.collide(this.platform.box);

        if (!collide.top) {
            this.falling = true;
            this.platform = null;
        }
    } else {
        this.falling = true; // No platform reference, must be falling
    }
	
	if (!this.grappling)	// Grapple overrides gravity
        this.velocityY += 9.8 * 0.012; // Applies gravity if falling
    
    // Begin aiming, cut existing grapple if needed
    if (this.game.keyShift) {
        this.aiming = true;

        if (this.hook)
            this.hook.removeFromWorld = true;

		this.hook = null;
		this.grappling = false;
		this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
    } else if (this.aiming && !this.game.keyShift && !this.hook) { // Fire in aiming direction
		this.aimVector.multiply(40);
		this.hook = new Hook(this, this.aimVector);
		this.game.addEntity(this.hook);
	}

    // Checks for left-right input
	if (this.game.keyA) {
		if (this.aiming && !this.hook) {
            this.aimVector = new Vector(-1, 0);

			// Set left aiming animation
            if (!this.falling) {
                this.animation = this.animationAimStraightL;
            } else {
                this.animation = this.animationFallL;
            }
		} else if (!this.grappling && !this.hook){
			this.velocityX = Math.max(-this.MAX_SPEED, this.velocityX - this.speed); // Accelerates the player

			// Checks if player is not falling to switch to walk animation
            if (!this.falling) {
                this.animation = this.animationWalkL;
            } else {
                this.animation = this.animationFallL;
            }
		}
    } else if (this.game.keyD) {
		if (this.aiming && !this.hook) {
			this.aimVector = new Vector(1,0);
			// Set right aiming animation
            if (!this.falling) {
                this.animation = this.animationAimStraightR;
            } else {
                this.animation = this.animationFallR;
            }
		} else if (!this.grappling && !this.hook) {
			this.velocityX = Math.min(this.MAX_SPEED, this.velocityX + this.speed); // Accelerates the player

			// Checks if player is not falling to switch to walk animation
            if (!this.falling) {
                this.animation = this.animationWalkR;
            } else {
                this.animation = this.animationFallR;
            }
        }
	} else if (this.game.keyW) {
		if (this.aiming && !this.hook) {
			this.aimVector = new Vector(0,-1);
			if (this.animation.direction == "right") {
				// Set up right aiming animation
                if (this.falling) {
                    this.animation = this.animationAimFallUpR;
                } else {
                    this.animation = this.animationAimStandUpR;
                }
			} else {
				// Set up left aiming animation
                if (this.falling) {
                    this.animation = this.animationAimFallUpL;
                } else {
                    this.animation = this.animationAimStandUpL;
                }
			}
		}
    } else {
		if (this.aiming && !this.hook) { // No direction, default to 45 degrees
			if (this.animation.direction == "right")
				this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
            else
                this.aimVector = new Vector(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
			
			//Set the aiming animation for Diagonal.
			if (this.animation.direction == "right") {
				if(this.falling)
					this.animation = this.animationAimFallDiagonalR;
				else
                    this.animation = this.animationAimDiagonalR;
			} else {
				if (this.falling)
					this.animation = this.animationAimFallDiagonalL;
				else
                    this.animation = this.animationAimDiagonalL;
            }
		}
    }

    // Sever grappling hook
	if (this.game.keyX && this.grappling) {
		if(this.hook) this.hook.removeFromWorld = true;
		this.hook = null;
		this.grappling = false;
		this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
	}
		
	if (this.grappling) {
		// Create direction vector to hook point
        var dirVect = new Vector(this.hook.x - (this.x + this.animation.hotspotX), this.hook.y - (this.y + this.animation.hotspotY));

		// Multiply by hook speed coefficient to get movement vector
        dirVect.multiply(this.hookSpeed);

		this.velocityX = dirVect.x;
		this.velocityY = dirVect.y;
		if (this.falling) {
            if (this.animation == this.animationAimDiagonalL)
                this.animation = this.animationAimFallDiagonalL;
            else if (this.animation == this.animationAimStandUpL)
                this.animation = this.animationAimFallUpL;
            else if (this.animation == this.animationAimStraightL)
                this.animation = this.animationFallL;
            else if (this.animation == this.animationAimDiagonalR)
                this.animation = this.animationAimFallDiagonalR;
            else if (this.animation == this.animationAimStandUpR)
                this.animation = this.animationAimFallUpR;
            else if (this.animation == this.animationAimStraightR)
                this.animation = this.animationFallR;
		}
	}

    // Updates position
    this.x += this.velocityX;
    this.y += this.velocityY;

	   // Saves bounding box before updating
    var lastBox = this.box;
	
    // Updates bounding box
    this.updateBox("player");                  //

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

                /* TODO: Switch to walking animation if moving after landing
                 */
            }

            // Ran into left side of platform
            if (collide.left && lastBox.right <= entity.box.left) {
                this.x = entity.box.left - this.box.width + (this.x - this.box.left);
                this.velocityX = 0;
            }

            // Ran into right side of platform
            if (collide.right && lastBox.left >= entity.box.right) {
                this.x = entity.box.right - (this.box.left - this.x);
                this.velocityX = 0;
            }

            // Hit bottom of platform
            if (collide.bottom && lastBox.top >= entity.box.bottom) {
                this.y = entity.box.bottom + (this.y - this.box.top);
                this.velocityY = 0;
            }

			// Update bounding box following shunt out of collision
            this.updateBox("player");                  //
        }
    }

    // No friction in air to allow speed building
	if (!this.falling && !this.grappling) {
		this.velocityX = Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); // Implements friction to simulate deceleration

		// Checks if player is not moving to switch to idle animation
		if (!this.falling && !this.aiming && this.velocityX == 0) {
		//checks the direction of the previous animation
			if (this.animation.direction == "right") {
				if (!(this.animation == this.animationIdleR))				
					this.animationIdleR.elapsedTime = 0;
				this.animation = this.animationIdleR;
			} else {
				if (!(this.animation == this.animationIdleL))
					this.animationIdleL.elapsedTime = 0;
				this.animation = this.animationIdleL;
            }
		}
	}  else if (this.falling && !this.grappling && !this.aiming) {
		if (this.animation.direction == "right") {
            this.animation = this.animationFallR;
		} else {
            this.animation = this.animationFallL;
		}
	}
	
    Entity.prototype.update.call(this);
}

/**
 * 
 */
Yamada.prototype.draw = function () {
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
 * 
 * 
 * @param {string} character The character who's animation set will be used.
 * @param {string} name The name of the animation.
 * @param {string} direction The direction the animation is facing.
 */
Yamada.prototype.animate = function (character, name, direction) {
    /* TODO: Sets new animation for actor and update their bounding box.
     */
}

/** TODO: Have all Actors inherit this prototype.
 * Updates the bounding box of the actor using their animation data.
 * 
 * @param {string} tag The tag attached to the box.
 * @param {number} offsetX (Optional) Specified offsets for the x coordinate.
 * @param {number} offsetY (Optional) Specified offsets for the y coordinate.
 */
Yamada.prototype.updateBox = function (tag, offsetX, offsetY) {
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

/**
 * Knocks out character.
 */
Yamada.prototype.knockout = function () {

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
    gameEngine.init(ctx);
    gameEngine.start();

    // Adds background
    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./NeverLateSalaryMan/img/PrototypeLevel.png")));

    // Adds the player
    var player = new Yamada(gameEngine, AM.getAsset("./NeverLateSalaryMan/img/Yamada.png"));
    gameEngine.addEntity(player);	
    gameEngine.player = player;

    // Adds the camera
    var cam = new Camera(gameEngine, 0, 0);
    gameEngine.addEntity(cam);
    gameEngine.camera = cam;

    // Adds platforms
	/**
    gameEngine.addEntity(new Platform(gameEngine, 0, 500, 500, 150)); // Ground
    gameEngine.addEntity(new Platform(gameEngine, 650, 0, 150, 500)); // Wall
    gameEngine.addEntity(new Platform(gameEngine, 0, 0, 500, 150));   // Ceiling
    gameEngine.addEntity(new Platform(gameEngine, 50, 350, 200, 10)); // Floating platform*/
	gameEngine.addEntity(new Platform(gameEngine, 0, 0, 1992, 34)); //Ceiling
	gameEngine.addEntity(new Platform(gameEngine, 0, 34, 30, 287)); //First column.
	gameEngine.addEntity(new Platform(gameEngine, 0, 322, 502, 30));//Floor 1.
	gameEngine.addEntity(new Platform(gameEngine, 377, 222, 124, 99)); //Box 1
	gameEngine.addEntity(new Platform(gameEngine, 439, 353, 504, 30)); //Floor 2.
	gameEngine.addEntity(new Platform(gameEngine, 817, 228, 126, 125)); //Box 2
	gameEngine.addEntity(new Platform(gameEngine, 643, 34, 30, 192)); //Second column.
	gameEngine.addEntity(new Platform(gameEngine, 1315, 34, 30, 192)); //Third column.
	gameEngine.addEntity(new Platform(gameEngine, 1961, 34, 30, 319)); //Last column.
	gameEngine.addEntity(new Platform(gameEngine, 1173, 353, 818, 30)); //Floor 3.
	gameEngine.addEntity(new Platform(gameEngine, 1173, 258, 62, 95)); //Box 3.
	gameEngine.addEntity(new Platform(gameEngine, 1488, 259, 126, 94)); //Box 4.
	
	
	
    // Adds enemies
    //gameEngine.addEntity(new ConWorker(gameEngine, AM.getAsset("./NeverLateSalaryMan/img/ConstrWorker.png")));

    console.log("All Done!");
});
