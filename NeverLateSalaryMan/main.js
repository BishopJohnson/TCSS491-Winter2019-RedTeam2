// No inheritance
function Background(game, spritesheet) {
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;	
    this.x = 0;
    this.y = this.game.camera.maxY - 2048;
    this.box = new BoundingBox(0, 0, 0, 0, "scene");
	this.animation = new Animation(this.spritesheet, "bkgd", 0, 0, 512, 1024, 0, 1, 1, true, 2, DIR_RIGHT)
};

Background.prototype.draw = function () {
	var repeats = this.game.camera.maxX / (this.animation.frameWidth * this.animation.scale);
	for (var i = 0; i < repeats; i++) {
		this.animation.drawFrame(this.game.clockTick, this.ctx, this.x + (i * this.animation.scale * this.animation.frameWidth) - this.game.camera.x, this.y - this.game.camera.y);
	}
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
	
	this.x = this.player.x - this.ctx.canvas.width / 2;
	// Verify camera is within defined level bounds
	if (this.x + this.ctx.canvas.width > this.maxX) this.x = this.maxX - this.ctx.canvas.width;
	else if (this.x < this.minX) this.x = this.minX;
	
	this.y = this.player.y - this.ctx.canvas.height / 2;
	// Verify camera is within defined level bounds
	if (this.y + this.ctx.canvas.height > this.maxY) this.y = this.maxY - this.ctx.canvas.height;
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
	this.ctx.fillRect(29, 5, 118, 61);
	this.ctx.fillRect(this.ctx.canvas.width - 147, 5, 118, 61);
	this.ctx.fillStyle = "yellow";	
	var time = Math.ceil(this.game.sceneManager.timeLimit);
	this.ctx.fillText("Time:" + time, 30, 30);
	this.ctx.fillText("HP: ", 30, 61);
	this.ctx.fillText("Keys:" + this.game.player.keyCount, this.ctx.canvas.width - 146, 30)
	this.ctx.font = "24px serif";
	this.ctx.fillText("Hook:", this.ctx.canvas.width - 146, 61);
	this.ctx.fillStyle = "lime";
	for (var i = 1; i <= this.game.player.health; i++) {
		this.ctx.fillRect(55 + (23 * i), 42, 20, 21);
	}
	this.ctx.fillRect(this.ctx.canvas.width - 84, 42, 52 * (1 - 2 * this.game.player.grappleCooldown), 21);
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
 * @param {number} id The id of the platform.
 */
function Platform(game, x, y, width, height, id) {
    this.ctx = game.ctx;
    this.width = width;
    this.height = height;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, TAG_PLATFORM);
	this.id = id;
	this.blocks = null;
	this.zIndex = 0;
	//this.blocks = levelImages;
	this.animation = new Animation(AM.getAsset("./NeverLateSalaryMan/img/tileset/Blocks.png"), "Block", 0, 0, 32, 32, 0, 1, 1, true, 1, "right");
    Entity.call(this, game, x, y);
}

Platform.prototype = new Entity();
Platform.prototype.constructor = Platform;

/**
 * 
 */
Platform.prototype.update = function () {
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, TAG_PLATFORM);

    Entity.prototype.update.call(this);
}

/**
 * 
 */
Platform.prototype.draw = function () {

    if (this.game.showOutlines) { // Draws collider border for debugging
        this.ctx.strokeStyle = "red";
        this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    }
    
	this.blocks = LoadLevelImages(this.id);
	/**
	for(let i = 0; i < this.width; i += 32) {
		//this.animation.drawFrame(this.game.clockTick, this.ctx, (this.x + (i * 1)) - this.game.camera.x, this.y - this.game.camera.y);
		for(let j = 0; j < this.height; j += 32) {
			//this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, (this.y + (j * 1)) - this.game.camera.y);
			this.animation.drawFrame(this.game.clockTick, this.ctx, (this.x + (i * 1)) - this.game.camera.x,
				(this.y + (j * 1)) - this.game.camera.y);
		}
	}
	*/
	if(this.id > -1) {
		for(let i = 0; i < this.width; i += 32) {
			var drawBlock;
			if(i == 0) {
				drawBlock = this.blocks[0];
			} else if(i + 32 == this.width) {
				drawBlock = this.blocks[2];
			} else {
				drawBlock = this.blocks[1];
			}
			drawBlock.drawFrame(this.game.clockTick, this.ctx, (this.x + (i * 1)) - this.game.camera.x, this.y - this.game.camera.y);
		}
		for(let j = 0; j < this.height; j += 32) {
			//this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, (this.y + (j * 1)) - this.game.camera.y);
			var drawBlock;
			if(i == 0) {
				drawBlock = this.blocks[0];
			} else if(i + 32 == this.height) {
				drawBlock = this.blocks[2];
			} else {
				drawBlock = this.blocks[1];
			}
			drawBlock.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, (this.y + (j * 1)) - this.game.camera.y);
		}
	}
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
	this.x = x;
	this.y = y;
	this.deltaX = 0;
	this.deltaY = 0;
	this.zIndex = 0;
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, TAG_PLATFORM);

    Entity.call(this, game, x, y);
}

ConWorkerPlatform.prototype = new Entity();
ConWorkerPlatform.prototype.constructor = ConWorkerPlatform;

/**
 * 
 */
ConWorkerPlatform.prototype.update = function () {
	var oldX = this.x;
	var oldY = this.y;
	this.x = this.box.x;
	this.y = this.box.y;
	this.deltaX = this.x - oldX;
	this.deltaY = this.y - oldY;
    // Iterates over game entities to check for collision
    for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var tempBox = new BoundingBox(this.box.x, this.box.y - 1, this.box.width, this.box.height, this.box.tag);
        var collide = tempBox.collide(entity.box);

        if (entity !== this
            && entity !== this.owner
            && (collide.object == TAG_PLAYER || collide.object == TAG_ENEMY || collide.object == TAG_HOOK)) { 
			// Player, hook, or enemy is colliding with the platform
			// Apply shift from construction worker to all colliding entities
                entity.x += this.deltaX;
				entity.y += this.deltaY;
            }
        }
    Entity.prototype.update.call(this);
}

/**
 * 
 */
ConWorkerPlatform.prototype.draw = function () {
    // No sprite to draw

    if (this.game.showOutlines) { // Draws collider border for debugging
        this.ctx.strokeStyle = "blue";
        this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    }

    Entity.prototype.draw.call(this);
}

/**
Defines the area that Yamada must reach to win the level.
*/
function WinArea(game, x, y, spritesheet) {
	this.game = game;
	this.ctx = game.ctx;
	this.spritesheet = spritesheet;
    this.width = 24;
    this.height = 64;
	this.zIndex = 0;
	this.animation = new Animation(this.spritesheet, "sign", 0, 0, 16, 32, 0, 1, 1, true, 2, DIR_RIGHT); 
    this.box = new BoundingBox(this.x, this.y, this.width, this.height, "win");
	
	Entity.call(this, game, x, y);
}

WinArea.prototype = new Entity();
WinArea.prototype.constructor = WinArea;

WinArea.prototype.update = function () {
	this.box = new BoundingBox(this.x, this.y, this.width, this.height, "win");
	var wincon = this.box.collide(this.game.player.box);
    if (wincon.object == TAG_PLAYER)
		this.game.sceneManager.loadLevel(this.game.sceneManager.nextLevel);
	
	Entity.prototype.update.call(this);
}

WinArea.prototype.draw = function () {
    if (this.game.showOutlines) { // Draws collider border for debugging
        this.ctx.strokeStyle = "yellow";
        this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.width, this.height);
    }

	this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, this.y - this.game.camera.y);
}

/**
A checkpoint for Yamada to respawn at when he runs out of stamina.
*/
function Checkpoint(game, x, y, pointID, spritesheet) {
	this.game = game;
	this.ctx = game.ctx;
	this.scene = game.sceneManager;
	this.ID = pointID;
	this.active = false;
	this.spritesheet = spritesheet;
	this.zIndex = 0;
	// Set animation to use inactive sprite
	this.animation = new Animation(this.spritesheet, "off", 0, 0, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT); 
    this.box = new BoundingBox(this.x, this.y, 64, 64, "checkpoint");
	
	Entity.call(this, game, x, y);
}

Checkpoint.prototype = new Entity();
Checkpoint.prototype.constructor = Checkpoint;

Checkpoint.prototype.update = function () {
	this.box = new BoundingBox(this.x, this.y, 64, 64, "checkpoint");
	var playerCheck = this.box.collide(this.game.player.box);
    
    if (playerCheck.object == TAG_PLAYER) {
		this.active = true;
        this.animation = new Animation(this.spritesheet, "on", 33, 0, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT); 

        if (!this.scene.activeCheckpoint || this.scene.activeCheckpoint.ID < this.ID) { // Sets player checkpoint to this checkpoint
            this.game.sceneManager.activeCheckpoint = this;
            this.game.player.health = this.game.player.maxhealth; // Restores Yamada's health
        }
    }

	Entity.prototype.update.call(this);
}

Checkpoint.prototype.draw = function () {
    if (this.game.showOutlines) { // Draws collider border for debugging
        this.ctx.strokeStyle = "Blue";

        if (this.active)
            this.ctx.strokeStyle = "Lime";

        this.ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, 32, 64);
    }

	this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, this.y - this.game.camera.y);
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
    this.box = new BoundingBox(this.x - 1, this.y - 1, 3, 3, TAG_HOOK);
	this.zIndex = 1;
    this.attached = false;
}

Hook.prototype = new Entity();
Hook.prototype.constructor = Hook;

/**
 * 
 */
Hook.prototype.update = function () {
    const originX = this.player.x + this.player.animation.hotspotX; // x position of the barrel
    const originY = this.player.y + this.player.animation.hotspotY; // y position of the barrel
    var minDist = 900;
    var intPoint = null;
	this.box = new BoundingBox(this.x - 1, this.y - 1, 3, 3, TAG_HOOK);

	for (var i = 0; i < this.game.entities.length; i++) {
        var entity = this.game.entities[i];
        var collPoint = this.boxIntersect(entity.box);

        if (collPoint && entity.box.tag == TAG_PLATFORM) { // Hook hit a platform
            intPoint = collPoint;
        } else if (collPoint && entity.box.tag == TAG_ENEMY) { // Hook or rope hit an enemy
            if (this.box.collide(entity.box).object == TAG_ENEMY && entity.stunTimer == 0) {
				// Checks if the hook itself hit the enemy
                entity.stun();
				this.player.cancelAction();
				
			} else if (entity.stunTimer == 0){
				this.player.cancelAction();
			}
        }
    }

	if (intPoint && !this.attached) { // Collided with something, move hook to that point
		this.x = intPoint.x;
		this.y = intPoint.y;
		this.box = new BoundingBox(this.x, this.y, 0, 0, TAG_EMPTY); // Attached hook can't stun, so tag is omitted
		this.attached = true;
		this.player.aiming = false;
		this.player.grappling = true;
	} else if (!this.attached) {
		this.x += this.direction.x;
		this.y += this.direction.y;		

        if (dist(this.x, this.y, originX, originY) > 520) { // Hook is at max distance and found no target
            this.player.cancelAction();
            this.removeFromWorld = true;
		}
	}
	this.box = new BoundingBox(this.x - 1, this.y - 1, 3, 3, TAG_HOOK);
	Entity.prototype.update.call(this);
}

/**
 * A method that checks for collision between the hook and a bounding box.
 * 
 * @param {BoundingBox} other The bounding box of the entity collision is checked for.
 * @return {x: xpos, y: ypos} The x,y coordinate for point of collision. Null if no collision occured.
 */
Hook.prototype.boxIntersect = function (other) {
    const originX = this.player.x + this.player.animation.hotspotX; // x position of the barrel
    const originY = this.player.y + this.player.animation.hotspotY; // y position of the barrel
    var minDist = 900;
    var intPoint = null; // Final collision point to be returned

    /* TODO: Have minDist distance be a attribute of the hook.
     */

    let collPoint; // Variable for collision point

    // Check collision with top of box
    collPoint = lineIntersect(originX, this.x, originY, this.y, other.left, other.right, other.top, other.top);
    if (collPoint) {
        thisDist = dist(originX, originY, collPoint.x, collPoint.y);

        if (thisDist <= minDist) {
            intPoint = collPoint;
            minDist = thisDist;
        }
    }

    // Check collision with bottom of box
    collPoint = lineIntersect(originX, this.x, originY, this.y, other.left, other.right, other.bottom, other.bottom);
    if (collPoint) {
        thisDist = dist(originX, originY, collPoint.x, collPoint.y);

        if (thisDist <= minDist) {
            intPoint = collPoint;
            minDist = thisDist;
        }
    }

    // Check collision with left of box
    collPoint = lineIntersect(originX, this.x, originY, this.y, other.left, other.left, other.top, other.bottom);
    if (collPoint) {
        thisDist = dist(originX, originY, collPoint.x, collPoint.y);

        if (thisDist <= minDist) {
            intPoint = collPoint;
            minDist = thisDist;
        }
    }

    // Check collision with right of box
    collPoint = lineIntersect(originX, this.x, originY, this.y, other.right, other.right, other.top, other.bottom);
    if (collPoint) {
        thisDist = dist(originX, originY, collPoint.x, collPoint.y);

        if (thisDist <= minDist) {
            intPoint = collPoint;
            minDist = thisDist;
        }
    }

    return intPoint;
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
	
	this.ctx.fillStyle = "grey";
	this.ctx.fillRect(this.x - 1 - this.game.camera.x, this.y - 1 - this.game.camera.y, 3, 3);
}

function LoadLevelImages(id) {
	var locationArray = [];
	//Horizontal Grinder
	if(id == 0) {
		var path = "./NeverLateSalaryMan/img/tileset/Platforms.png";
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 0, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 32, 0, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 64, 0, 32, 32, 0, 1, 1, true, 1, "right"));
	} else if(id == 1) {
		//Vertical Grinder
		var path = "./NeverLateSalaryMan/img/tileset/Columns.png";
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 0, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 32, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 64, 32, 32, 0, 1, 1, true, 1, "right"));
	} else if(id == 2) {
		var path = "./NeverLateSalaryMan/img/tileset/Blocks.png";
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 32, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 64, 32, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 64, 32, 32, 32, 0, 1, 1, true, 1, "right"));
	} else {
		var path = "./NeverLateSalaryMan/img/tileset/Blocks.png";
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 32, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 32, 32, 32, 0, 1, 1, true, 1, "right"));
		locationArray.push(new Animation(AM.getAsset(path), "Block", 0, 32, 32, 32, 0, 1, 1, true, 1, "right"));
	}
	
	return locationArray;
}

// Main code begins here

var AM = new AssetManager();            // Initializes AssetManager
var AUDIO_MANAGER = new AudioManager(); // Initializes AudioManager

// Download all of the character spritesheets
AM.queueDownload("./NeverLateSalaryMan/img/Yamada.png");
AM.queueDownload("./NeverLateSalaryMan/img/Bird.png");
AM.queueDownload("./NeverLateSalaryMan/img/ConstrWorker.png");
AM.queueDownload("./NeverLateSalaryMan/img/PrototypeLevel.png");
AM.queueDownload("./NeverLateSalaryMan/img/Checkpoint.png");
AM.queueDownload("./NeverLateSalaryMan/img/BusStop.png");
AM.queueDownload("./NeverLateSalaryMan/img/PoliceOfficer.png");
AM.queueDownload("./NeverLateSalaryMan/img/SumoWrestler.png");
AM.queueDownload("./NeverLateSalaryMan/img/Rain.png");
AM.queueDownload("./NeverLateSalaryMan/img/KeyItems.png");

// Download all of the background tile set.
AM.queueDownload("./NeverLateSalaryMan/img/tileset/Blocks.png");
AM.queueDownload("./NeverLateSalaryMan/img/tileset/Bricks.png");
AM.queueDownload("./NeverLateSalaryMan/img/tileset/Columns.png");
AM.queueDownload("./NeverLateSalaryMan/img/tileset/BricksWide.png");
AM.queueDownload("./NeverLateSalaryMan/img/tileset/Platforms.png");
AM.queueDownload("./NeverLateSalaryMan/img/tileset/BKG01.png");

// Download all of the audio files
AM.queueDownload("./NeverLateSalaryMan/audio/DeathByGlamour.mp3");

var levelImages = LoadLevelImages();

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
    const debug = document.getElementById("debug_btn");
    const nextLevel = document.getElementById("level_btn");
	ctx.imageSmoothingEnabled = false; // Disables pixel smoothing

    var gameEngine = new GameEngine();
	gameEngine.SceneManager = new SceneManager(gameEngine);
    gameEngine.init(ctx);
    gameEngine.start();

	// Display basic splash screen
	gameEngine.SceneManager.loadLevel(0);

    debug.addEventListener('click', function (event) { // Activates Debug Mode on click
        gameEngine.debugMode();
    });

    nextLevel.addEventListener('click', function (event) { // Transitions to next level on click
        gameEngine.SceneManager.loadLevel(gameEngine.sceneManager.nextLevel);
    });

    console.log("All Done!");
});
