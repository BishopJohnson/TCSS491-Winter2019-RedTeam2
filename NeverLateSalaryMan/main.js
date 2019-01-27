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

    /* TODO: Have x,y position based on game world coordinates instead of canvas coordinates.
     */

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
    this.ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    Entity.prototype.draw.call(this);
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
    this.animation = this.animationIdleR; //initial animation
    this.ctx = game.ctx;
    this.speed = 2; //0.05;
    this.MAX_SPEED = 4;
    this.friction = 1.0;
    this.falling = false;
    this.platform = null;
    this.box = new BoundingBox(this.x, this.y,
                               this.animation.frameWidth * this.animation.scale,   //width
                               this.animation.frameHeight * this.animation.scale,  //height
                               "player");

    /* TODO: Have x,y position based on game world coordinates instead of canvas coordinates.
     */

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
    /*if (this.platform) {
        var collide = this.box.collide(this.platform.box);

        if (!collide.top) {
            this.falling = true;

            if (this.animation.direction == "right")
                this.animation = this.animationJumpR;
            else
                this.animation = this.animationJumpL;
        }
    }*/

    //checks if entity is falling
    if (!this.falling) {
        //checks for jump input
        if (this.game.keySpace) {
            this.velocityY = -2;
            this.falling = true;

            //checks the direction of the previous animation
            /*if (this.animation.direction == "right")
                this.animation = this.animationJumpR;
            else
                this.animation = this.animationJumpL;*/
        }
    } else {
        this.velocityY += 9.8 * 0.005; //applies gravity if falling
    }

    //checks for left-right input
    if (this.game.keyA) {
        this.velocityX = -this.speed; //Math.max(-this.MAX_SPEED, this.velocityX - this.speed); //accelerates the player

        //checks if player is not falling to switch to walk animation
        if (!this.falling) {
            //checks if player should be sliding
            if (Math.sign(this.velocityX) <= 0)
                this.animation = this.animationWalkL;
            /*else
                this.animation = this.animationReverseL;*/
        }
    } else if (this.game.keyD) {
        this.velocityX = this.speed; //Math.min(this.MAX_SPEED, this.velocityX + this.speed); //accelerates the player

        //checks if player is not falling to switch to walk animation
        if (!this.falling) {
            //checks if player should be sliding
            if (Math.sign(this.velocityX) >= 0)
                this.animation = this.animationWalkR;
            /*else
                this.animation = this.animationReverseR;*/
        }
    } else {
        this.velocityX = 0.0; //Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); //implements friction to simulate deceleration

        //checks if player is not moving to switch to idle animation
        if (!this.falling && this.velocityX == 0) {
            //checks the direction of the previous animation
            if (this.animation.direction == "right")
                this.animation = this.animationIdleR;
            else
                this.animation = this.animationIdleL;
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
            if (collide.top && lastBox.bottom <= entity.box.top /* TODO: Make sure not approaching from left/right */) { //landed on platform
                this.y = entity.box.top - this.box.height;
                this.velocityY = 0;
                this.falling = false;
                this.platform = entity;

                /* TODO: account for walking after landing
                 */
                //checks the direction of the previous animation
                if (this.animation.direction == "right")
                    this.animation = this.animationIdleR;
                else
                    this.animation = this.animationIdleL;
            } if (collide.left && lastBox.right <= entity.box.left /* TODO: Make sure not approaching from bottom */) { //ran into left side of platform
                this.x = entity.box.left - this.box.width;
                this.velocityX = 0;
            } if (collide.right && lastBox.left >= entity.box.right /* TODO: Make sure not approaching from bottom */) { //ran into right side of platform
                this.x = entity.box.right;
                this.velocityX = 0;
            } if (collide.bottom && lastBox.top >= entity.box.bottom) { //hit bottom of platform
                this.y = entity.box.bottom;
                this.velocityY = 0;
            }

            // Saves bounding box before updating
            var lastBox = this.box;

			// Update bounding box following shunt out of collision
			this.box = new BoundingBox(this.x, this.y,
                                       this.animation.frameWidth * this.animation.scale,   //width
                                       this.animation.frameHeight * this.animation.scale,  //height
                                       "player");
        }
    }

    Entity.prototype.update.call(this);
}

/**
 * 
 */
Yamada.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);

    var width = this.animation.frameWidth * this.animation.scale;
    var height = this.animation.frameHeight * this.animation.scale;

    //draws collider border for debugging
    this.ctx.strokeStyle = "green";
    this.ctx.strokeRect(this.x, this.y, width, height);

    Entity.prototype.draw.call(this);
}

//main code begins here

var AM = new AssetManager();

AM.queueDownload("./img/Yamada.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false; //disables pixel smoothing

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Yamada(gameEngine, AM.getAsset("./img/Yamada.png")));
    gameEngine.addEntity(new Platform(gameEngine, 0, 500, 500, 150)); //ground
    gameEngine.addEntity(new Platform(gameEngine, 650, 0, 150, 500)); //wall
    gameEngine.addEntity(new Platform(gameEngine, 0, 0, 500, 150));   //ceiling
    gameEngine.addEntity(new Platform(gameEngine, 50, 350, 200, 10)); //floating platform

    console.log("All Done!");
});
