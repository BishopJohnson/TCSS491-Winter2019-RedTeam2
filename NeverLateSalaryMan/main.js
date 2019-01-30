// no inheritance
/*
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet, this.x, this.y);
};

Background.prototype.update = function () {
};
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

Camera.prototype.update = function() {
	this.x = this.player.x - this.ctx.canvas.width / 2;
	this.y = this.player.y - this.ctx.canvas.height / 2;
	this.box = new BoundingBox(this.x, this.y,
							this.ctx.canvas.width, this.ctx.canvas.height, "camera");
	Entity.prototype.update.call(this);
}

/**
Required for inheritance. Camera is not a drawn entity.
*/
Camera.prototype.draw = function() {};

//inheritance
/**
 * 
 * 
 * @param {any} game
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
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
    //no image

    //draws collider border for debugging
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    
    Entity.prototype.draw.call(this);
}

function Hook(player, dirVector) {
	this.player = player;
	this.game = player.game;
	this.ctx = player.game.ctx;
	this.x = player.x;
	this.y = player.y
	this.direction = dirVector;
	this.box = new BoundingBox(this.x, this.y, 0, 0, "hook");
	this.attached = false;
}

Hook.prototype = new Entity();
Hook.prototype.constructor = Hook;

Hook.prototype.update = function() {
	var minDist = 900;
	var intPoint = null;
	for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
		if (entity !== this.player && entity !== this.game.camera) { // No interaction between player and hook
			// Check collision with top of box
			var collPoint = lineIntersect(this.player.x, this.x, this.player.y, this.y, entity.box.left, entity.box.right, entity.box.top, entity.box.top);			
			if (collPoint) {
				thisDist = dist(this.player.x, this.player.y, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with bottom of box
			collPoint = lineIntersect(this.player.x, this.x, this.player.y, this.y, entity.box.left, entity.box.right, entity.box.bottom, entity.box.bottom);
			if (collPoint) {
				thisDist = dist(this.player.x, this.player.y, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with left of box
			collPoint = lineIntersect(this.player.x, this.x, this.player.y, this.y, entity.box.left, entity.box.left, entity.box.bottom, entity.box.top);
			if (collPoint) {
				thisDist = dist(this.player.x, this.player.y, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
			// Check collision with left of box
			collPoint = lineIntersect(this.player.x, this.x, this.player.y, this.y, entity.box.right, entity.box.right, entity.box.bottom, entity.box.top);
			if (collPoint) {
				thisDist = dist(this.player.x, this.player.y, collPoint.x, collPoint.y);
				if (thisDist <= minDist) {
					intPoint = collPoint;
					minDist = thisDist;
				}
			}
		}
	}
	if (intPoint && !this.attached) { //Collided with something, move hook to that point
		this.x = intPoint.x;
		this.y = intPoint.y;
		this.box = new BoundingBox(this.x, this.y, 0, 0);
		this.attached = true;
		this.player.aiming = false;
		this.player.grappling = true;
	} else if (!this.attached) {
		this.x += this.direction.x;
		this.y += this.direction.y;		

		if (dist(this.x, this.y, this.player.x, this.player.y) > 520) {
			// Hook is at max distance and found no target
			this.player.aiming = false;
			this.player.hook = null;
			this.removeFromWorld = true;
		}
	}
	
	Entity.prototype.update.call(this);
}

Hook.prototype.draw = function() {
	this.ctx.beginPath();
	this.ctx.lineWidth = 2;
	this.ctx.strokeStyle = "brown";
	this.ctx.moveTo(this.player.x - this.game.camera.x, this.player.y - this.game.camera.y);
	this.ctx.lineTo(this.x - this.game.camera.x, this.y - this.game.camera.y);
	this.ctx.stroke();
	this.ctx.closePath();
	
	this.ctx.strokeStyle = "grey";
	this.ctx.fillRect(this.x - 1 - this.game.camera.x, this.y - 1 - this.game.camera.y, 3, 3);
}
//inheritance
/**
 * 
 * 
 * @param {any} game
 * @param {any} spritesheet
 */
function Yamada(game, spritesheet) {
    this.spritesheet = spritesheet;
    this.animationIdleR = new Animation(spritesheet, "idle", 0, 0, 32, 32, 0, 0.10, 8, true, 2, "right");
    this.animationIdleL = new Animation(spritesheet, "idle", 0, 32, 32, 32, 0, 0.10, 8, true, 2, "left");
    this.animationWalkR = new Animation(spritesheet, "walk", 0, 64, 32, 32, 0, 0.10, 8, true, 2, "right");
    this.animationWalkL = new Animation(spritesheet, "walk", 0, 96, 32, 32, 0, 0.10, 8, true, 2, "left");
	this.animationFallR = new Animation(spritesheet, "fall", 0, 160, 32, 32, 0, 1, 1, true, 2, "right"); 
    this.animationFallL = new Animation(spritesheet, "fall", 224, 160, 32, 32, 0, 1, 1, true, 2, "left");
    this.animationAimStandUpR = new Animation(spritesheet, "aim", 64, 128, 32, 32, 0, 1, 1, true, 2, "right");
    this.animationAimStandUpL = new Animation(spritesheet, "aim", 160, 128, 32, 32, 0, 1, 1, true, 2, "left");
	this.animationAimDiagonalR = new Animation(spritesheet, "aim", 32, 128, 32, 32, 0, 1, 1, true, 2, "right");
	this.animationAimDiagonalL = new Animation(spritesheet, "aim", 192, 128, 32, 32, 0, 1, 1, true, 2, "left");
	this.animationAimStraightR = new Animation(spritesheet, "aim", 0, 128, 32, 32, 0, 1, 1, true, 2, "right");
	this.animationAimStraightL = new Animation(spritesheet, "aim", 224, 128, 32, 32, 0, 1, 1, true, 2, "left");
	this.animationAimFallUpR = new Animation(spritesheet, "aim", 96, 160, 32, 32, 0, 1, 1, true, 2, "right");
	this.animationAimFallUpL = new Animation(spritesheet, "aim", 128, 160, 32, 32, 0, 1, 1, true, 2, "left");
	this.animationAimFallDiagonalR = new Animation(spritesheet, "aim", 32, 160, 32, 32, 0, 1, 1, true, 2, "right");
	this.animationAimFallDiagonalL = new Animation(spritesheet, "aim", 192, 160, 32, 32, 0, 1, 1, true, 2, "left");
    this.animation = this.animationIdleR; //initial animation
    this.ctx = game.ctx;
    this.speed = .65;
    this.MAX_SPEED = 2.5;
    this.friction = .5;
    this.falling = false;
	this.aiming = false;
	this.grappling = false;
	this.hook = null;
	this.aimVector = new Vector(0, 0);
	/* TODO: Define a "hotspot" on the aiming and grappling animations to define what point of the player that the grappling hook comes from.
	*/
	this.hookSpeed = .02;
    this.platform = null;
    this.box = new BoundingBox(this.x, this.y,
                               this.animation.frameWidth * this.animation.scale,   //width
                               this.animation.frameHeight * this.animation.scale,  //height
                               "player");


    /* TODO: Keep animations in an array/list.
     */

    Entity.call(this, game, 300, 300);
}

Yamada.prototype = new Entity();
Yamada.prototype.constructor = Yamada;

/**
 * 
 */
Yamada.prototype.update = function () {
	//checks if still on platform
    if (this.platform) {
		// Check with temporary hitbox, as shunted out after last collision
		var tempBox = new BoundingBox(this.x, this.y + 1,
                               this.animation.frameWidth * this.animation.scale,   //width
                               this.animation.frameHeight * this.animation.scale,  //height
                               "player");
        var collide = tempBox.collide(this.platform.box);

        if (!collide.top) {
            this.falling = true;
			this.platform = null;
        }
    } else this.falling = true; // No platform reference, must be falling
	
	if(!this.grappling) {	// Grapple overrides gravity
        this.velocityY += 9.8 * 0.012; //applies gravity if falling
    }
	
	if (this.game.keyShift) {	// Begin aiming, cut existing grapple if needed
		this.aiming = true;
		if(this.hook) this.hook.removeFromWorld = true;
		this.hook = null;
		this.grappling = false;
		this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
    } else if (this.aiming && !this.game.keyShift &&
				!this.hook) {// Fire in aiming direction
		this.aimVector.multiply(40);
		this.hook = new Hook(this, this.aimVector);
		this.game.addEntity(this.hook);
	}
	
	if (this.game.keyA) {   //checks for left-right input
		if (this.aiming) {
			this.aimVector = new Vector(-1,0);
			//Set left aiming animation
			if(!this.falling)
				this.animation = this.animationAimStraightL;
			else
				this.animation = this.animationFallL;
		} else if (!this.grappling){
			this.velocityX = Math.max(-this.MAX_SPEED, this.velocityX - this.speed); //accelerates the player

			//checks if player is not falling to switch to walk animation
			if (!this.falling)
				this.animation = this.animationWalkL;
			else this.animation = this.animationFallL;
		}
    } else if (this.game.keyD) {
		if (this.aiming) {
			this.aimVector = new Vector(1,0);
			//Set right aiming animation
			if(!this.falling)
				this.animation = this.animationAimStraightR;
			else
				this.animation = this.animationFallR;
		} else if (!this.grappling) {
			this.velocityX = Math.min(this.MAX_SPEED, this.velocityX + this.speed); //accelerates the player

			//checks if player is not falling to switch to walk animation
			if (!this.falling)
				this.animation = this.animationWalkR
			else this.animation = this.animationFallR;
        }
	} else if (this.game.keyW) {
		if (this.aiming) {
			this.aimVector = new Vector(0,-1);
			if(this.animation.direction == "right") {
				// Set up right aiming animation
				if(this.falling) 
					this.animation = this.animationAimFallUpR;
				else
					this.animation = this.animationAimStandUpR;
			} else {
				// Set up left aiming animation
				if(this.falling)
					this.animation = this.animationAimFallUpL;
				else
					this.animation = this.animationAimStandUpL;
			}
		}
    } else {
		if (this.aiming) { // No direction, default to 45 degrees
			if (this.animation.direction == "right")
				this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
			else this.aimVector = new Vector(-Math.sqrt(2)/2, -Math.sqrt(2)/2);
			
			//Set the aiming animation for Diagonal.
			if(this.animation.direction == "right") {
				if(this.falling)
					this.animation = this.animationAimFallDiagonalR;
				else
					this.animation = this.animationAimDiagonalR;
			} else {
				if(this.falling)
					this.animation = this.animationAimFallDiagonalL;
				else
					this.animation = this.animationAimDiagonalL;
			}
		}
	}
	if (this.game.keyX && this.grappling) { // Sever grappling hook
		if(this.hook) this.hook.removeFromWorld = true;
		this.hook = null;
		this.grappling = false;
		this.aimVector = new Vector(Math.sqrt(2)/2, -Math.sqrt(2)/2);
	}
		
	if (this.grappling) {
		// Create direction vector to hook point
		var dirVect = new Vector(this.hook.x - this.x, this.hook.y - this.y);
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

    //updates position
    this.x += this.velocityX;
    this.y += this.velocityY;

    //saves bounding box before updating
    var lastBox = this.box;

    //updates bounding box
    this.box = new BoundingBox(this.x, this.y,
                               this.animation.frameWidth * this.animation.scale,   //width
                               this.animation.frameHeight * this.animation.scale,  //height
                               "player");

    //iterates over game entities to check for collision
    for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var collide = this.box.collide(entity.box); //the collision results

        //checks if entity collided with a wall
        if (entity !== this && collide.object == "platform") {
            //checks the collision direction
            if (collide.top && lastBox.bottom <= entity.box.top) { //landed on platform
                this.y = entity.box.top - this.box.height;
                this.velocityY = 0;
                this.falling = false;
                this.platform = entity;

                /* TODO: account for walking after landing
                 */
            } if (collide.left && lastBox.right <= entity.box.left) { //ran into left side of platform
                this.x = entity.box.left - this.box.width;
                this.velocityX = 0;
            } if (collide.right && lastBox.left >= entity.box.right) { //ran into right side of platform
                this.x = entity.box.right;
                this.velocityX = 0;
            } if (collide.bottom && lastBox.top >= entity.box.bottom) { //hit bottom of platform
                this.y = entity.box.bottom;
                this.velocityY = 0;
            }
			// Update bounding box following shunt out of collision
			this.box = new BoundingBox(this.x, this.y,
                               this.animation.frameWidth * this.animation.scale,   //width
                               this.animation.frameHeight * this.animation.scale,  //height
                               "player");
        }
    }
	
	if (!this.falling && !this.grappling){ // No friction in air to allow speed building
		this.velocityX = Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); //implements friction to simulate deceleration

		//checks if player is not moving to switch to idle animation
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
	}  else if(this.falling && !this.grappling && !this.aiming) {
		if (this.animation.direction == "right") {
				this.animation = this.animationAimFallDiagonalR;
		} else {
				this.animation = this.animationAimFallDiagonalL;
		}
	}
	
    Entity.prototype.update.call(this);
}

/**
 * 
 */
Yamada.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, this.y - this.game.camera.y);

    var width = this.box.width;
    var height = this.box.height;

    //draws collider border for debugging
    this.ctx.strokeStyle = "green";
    this.ctx.strokeRect(this.box.x - this.game.camera.x, this.box.y - this.game.camera.y, width, height);

    Entity.prototype.draw.call(this);
}

//main code begins here

var AM = new AssetManager();

AM.queueDownload("./NeverLateSalaryMan/img/Yamada.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false; //disables pixel smoothing

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();
    var player = new Yamada(gameEngine, AM.getAsset("./NeverLateSalaryMan/img/Yamada.png"))
    gameEngine.addEntity(player);	
	gameEngine.player = player;
    gameEngine.addEntity(new Platform(gameEngine, 0, 500, 500, 150)); //ground
    gameEngine.addEntity(new Platform(gameEngine, 650, 0, 150, 500)); //wall
    gameEngine.addEntity(new Platform(gameEngine, 0, 0, 500, 150));   //ceiling
    gameEngine.addEntity(new Platform(gameEngine, 50, 350, 200, 10)); //floating platform
	var cam = new Camera(gameEngine, 0 , 0);
	gameEngine.addEntity(cam);
	gameEngine.camera = cam;
    console.log("All Done!");
});
