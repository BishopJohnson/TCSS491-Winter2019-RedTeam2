/**
 * Entity class for entities with velocity.
 */
class EntityClass {

    /**
     * The constructor for the Entity class.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x (Optional) The x position to spawn the entity at.
     * @param {number} y (Optional) The y position to spawn the entity at.
     */
    constructor(game, x = 0, y = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.initialX = x;
        this.initialY = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.removeFromWorld = false;
    }

    /**
     * Resets the Entity's attributes.
     */
    reset() {
        this.x = initialX;
        this.y = initialY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.removeFromWorld = false;
    }

    /**
     * Update method to be inherited by all subclasses.
     */
    update() {
        // Do nothing
    }

    /**
     * 
     * 
     * @param {any} ctx (Optional)
     */
    draw(ctx) {
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
    rotateAndCache(image, angle) {
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
}

/**
 * Actor class for entities with gravity and platform collisions.
 */
class ActorClass extends EntityClass {

    /**
     * The constructor for the Actor class.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position to spawn the actor at.
     * @param {number} y The y position to spawn the actor at.
     * @param {string} spritesheet The file path of the spritesheet in the asset manager.
     * @param {string} tag (Optional) The tag of the bounding box. Default is TAG_EMPTY.
     * @param {boolean} gravity (Optional) Determines if the actor is affected by gravity. Default is enabled (true).
     * @param {boolean} collision (Optional) Determines if the actor collides with platforms. Default is enabled (true).
     */
    constructor(game, x, y, spritesheet, tag = TAG_EMPTY, gravity = true, collision = true) {
        super(game, x, y); // Call to super constructor

        this.ctx = game.ctx;
        this.spritesheet = spritesheet;
        this.tag = tag;
        this.gravity = gravity;
        this.collision = collision;
        this.initialGravity = gravity;
        this.initialCollision = collision;
        this.animation = null;
        this.box = null;
        this.falling = false;
        this.platform = null;

        this.updateBox(); // Initializes a bounding box
    }

    /**
     * Resets the Actor's attributes.
     */
    reset() {
        super.reset(); // Call to super method

        this.gravity = initialGravity;
        this.collision = initialCollision;
        this.falling = false;
        this.platform = null;

        this.updateBox();
    }

    /**
     * Updates the Actor's position and check for collision with platforms.
     * 
     * @see EntityClass.update
     */
    update() {
        super.update(); // Call to super method

        if (this.platform) { // Checks if still on platform
            // Check with temporary hitbox if shunted out after last collision
            var tempBox = new BoundingBox(this.box.x, this.box.y + 1, this.box.width, this.box.height, this.tag);
            var collide = tempBox.collide(this.platform.box);

            if (!collide.top) { // Not on top of platform anymore
                this.falling = true;
                this.platform = null;
            }
        } else { // No platform reference
            this.falling = true;

            if (this.gravity)
                this.velocityY += 9.8 * 0.012; // Applies gravity

        }

        // Updates position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Saves bounding box before updating
        var lastBox = this.box;

        // Updates bounding box
        this.updateBox();

        // Iterates over game entities to check for collision
        for (var i = 0; i < this.game.entities.length; i++) {
            var entity = this.game.entities[i];
            var collide = this.box.collide(entity.box); // The collision results

            if (entity !== this && collide.object == TAG_PLATFORM && this.collision) { // Checks if entity collided with a platform
                if (collide.top && lastBox.bottom <= entity.box.top) { // Landed on platform
                    this.y = entity.box.top - this.box.height - (this.box.top - this.y);
                    this.velocityY = 0;
                    this.falling = false;
                    this.platform = entity;
                }

                if (collide.left && lastBox.right <= entity.box.left) { // Ran into left side of platform
                    this.x = entity.box.left - this.box.width + (this.x - this.box.left);
                    this.velocityX = 0;
                }

                if (collide.right && lastBox.left >= entity.box.right) { // Ran into right side of platform
                    this.x = entity.box.right - (this.box.left - this.x);
                    this.velocityX = 0;
                }

                if (collide.bottom && lastBox.top >= entity.box.bottom) { // Hit bottom of platform
                    this.y = entity.box.bottom + (this.y - this.box.top);
                    this.velocityY = 0;
                }

                // Update bounding box following after shunting from collision
                this.updateBox();
            }
        }
    }

    /**
     * Updates the bounding box of the Actor.
     * 
     * <p>Creates a box using Actor's animation data or a box with a width and height of 0 if no animation is assigned.</p>
     * 
     * @param {number} offsetX (Optional) Specified offsets for the x coordinate.
     * @param {number} offsetY (Optional) Specified offsets for the y coordinate.
     */
    updateBox(offsetX = 0, offsetY = 0) {
        if (this.animation) { // Checks if actor currently has an animation
            var scale = this.animation.scale;

            this.box = new BoundingBox(this.x + this.animation.offsetX + (offsetX * scale), // x
                                       this.y + this.animation.offsetY + (offsetY * scale), // y
                                       this.animation.boxWidth,                             // width
                                       this.animation.boxHeight,                            // height
                                       this.tag);                                           // tag
        } else {
            // Creates a default bounding box
            this.box = new BoundingBox(this.x + offsetX, // x
                                       this.y + offsetY, // y
                                       0,                // width
                                       0,                // height
                                       this.tag);        // tag
        }
    }

    /**
     * Draws the actor's sprite.
     */
    draw() {
        super.draw(); // Call to super method

        if (this.animation)
            this.animation.drawFrame(this.game.clockTick, this.ctx, this.x - this.game.camera.x, this.y - this.game.camera.y);
        /*else*/

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
    }

    /**
     * Updates the Actor's animation with the new animation.
     * 
     * @param {Animation} animation The animation to apply to the actor.
     */
    animate(animation) {
        if (!this.animation.equals(animation)) // Checks if animation is already playing
            this.animation = animation;
    }
}

/**
 * Enemy class for entities that are enemies to the player.
 */
class EnemyClass extends ActorClass {

    /**
     * The constructor for the Enemy class.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position to spawn the enemy at.
     * @param {number} y The x position to spawn the enemy at.
     * @param {string} spritesheet The file path of the spritesheet in the asset manager.
     * @param {number} damage
     * @param {number} stunTime
     * @param {boolean} gravity (Optional) Determines if the actor is affected by gravity. Default is enabled (true).
     * @param {boolean} collision (Optional) Determines if the actor collides with platforms. Default is enabled (true).
     */
    constructor(game, x, y, spritesheet, damage = 10, stunTime = 3, gravity = true, collision = true) {
        super(game, x, y, spritesheet, TAG_ENEMY, gravity, collision); // Call to super constructor

        this.awake = false;
        this.stunned = false;
        this.damage = damage;
        this.stunTime = stunTime;
        this.stunTimer = 0;
        this.dead = false;

        /* TODO: Remove call to awaken from constructor once dynamic awaken from the player
         * approaching enemies is incorporated into the game.
         */
        this.awaken();
    }

    /**
     * Wakes the Enemy up so that they may start updating.
     */
    awaken() {
        this.awake = true;
    }

    /**
     * Resets the Enemy's attributes.
     */
    reset() {
        super.reset(); // Call to super method

        this.awake = false;
        this.stunned = false;
        this.stunTimer = 0;
    }

    /**
     * Updates the Enemy's status and checks for collision with the player.
     *
     * @see ActorClass.update
     */
    update() {
        if (this.awake) { // Checks if enemy actor is awake
            if (this.stunned) { // Checks if enemy is stunned
                this.stunTimer = Math.max(0, this.stunTimer - this.game.clockTick); // Updates timer

                if (this.stunTimer == 0) // Unstuns the enemy once timer is zero
                    this.stunned = false;
            } else {
                super.update(); // Call to super method

                var collide = this.box.collide(this.game.player.box); // The collision results with the player

                if (collide.object == TAG_PLAYER && !this.dead) // Damages the player
                    this.game.player.damage();
            }
        }
    }

    /**
     * Stuns the Enemy.
     */
    stun() {
        if (this.awake && !this.dead) {
            this.stunned = true;
            this.stunTimer = this.stunTime;
        }
    }
}

/**
 * Yamada class for actor controllable by the player.
 */
class Yamada extends ActorClass {

    /**
     * The constructor for the Yamada class.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position to spawn the entity at.
     * @param {number} y The y position to spawn the entity at.
     * @param {string} spritesheet The file path of the spritesheet in the asset manager.
     */
    constructor(game, x, y, spritesheet) {
        super(game, x, y, spritesheet, TAG_PLAYER); // Call to super constructor

        this.maxhealth = 30;
        this.health = this.maxhealth;
        this.damageTime = 3;
        this.damageTimer = 0;
        this.speed = 0.65;
        this.MAX_SPEED = 2.5;
        this.friction = 0.5;
        this.aiming = false;
        this.grappling = false;
        this.hook = null;
        this.aimVector = new Vector(0, 0);
        this.hookSpeed = 0.02;

        this.animation = new Animation(spritesheet, "idle", 0, 0, 32, 32, 0, 0.10, 8, true, 2, DIR_RIGHT, 7, 0, 18, 32); // Initial animation
    }

    /**
     * Updates Yamada and processes player input.
     * 
     * @see ActorClass.update
     */
    update() {
        super.update();

        if (this.damageTimer > 0) { // Updates damageTimer
            this.damageTimer = Math.max(0, this.damageTimer - this.game.clockTick);
        }

        if (this.grappling) // Grappling overrides gravity
            this.gravity = false;
        else
            this.gravity = true;

        if (this.game.keyShift) { // Begin aiming
            this.aiming = true;

            if (this.hook) // Removes grappling hook if one exists
                this.hook.removeFromWorld = true;

            this.hook = null;
            this.grappling = false;
            this.aimVector = new Vector(Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
        } else if (this.aiming && !this.game.keyShift && !this.hook) { // Fire in aimed direction
            this.aimVector.multiply(40);
            this.hook = new Hook(this, this.aimVector);
            this.game.addEntity(this.hook);
        }

        if (this.game.keyA) { // Left input

            if (this.aiming && !this.hook)
                this.aimVector = new Vector(-1, 0);
            else if (!this.grappling && !this.hook)
                this.velocityX = Math.max(-this.MAX_SPEED, this.velocityX - this.speed); // Accelerates the player

        } else if (this.game.keyD) { // Right input

            if (this.aiming && !this.hook)
                this.aimVector = new Vector(1, 0);
            else if (!this.grappling && !this.hook)
                this.velocityX = Math.min(this.MAX_SPEED, this.velocityX + this.speed); // Accelerates the player

        } else if (this.game.keyW) { // Up input

            if (this.aiming && !this.hook)
                this.aimVector = new Vector(0, -1);

        } else { // No input

            if (this.aiming && !this.hook) { // Default aiming direction to 45 degrees
                if (this.animation.direction == DIR_RIGHT)
                    this.aimVector = new Vector(Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
                else
                    this.aimVector = new Vector(-Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
            }

        }

        if (this.game.keyX && this.grappling) { // Sever grappling hook
            if (this.hook)
                this.hook.removeFromWorld = true;

            this.hook = null;
            this.grappling = false;
            this.aimVector = new Vector(Math.sqrt(2) / 2, -Math.sqrt(2) / 2);
        }

        if (this.grappling) { // Pulls Yamada towards grappling hook
            // Create direction vector to hook point
            var dirVect = new Vector(this.hook.x - (this.x + this.animation.hotspotX), this.hook.y - (this.y + this.animation.hotspotY));

            // Multiply by hook speed coefficient to get movement vector
            dirVect.multiply(this.hookSpeed);

            this.velocityX = dirVect.x;
            this.velocityY = dirVect.y;
        }

        // No friction in air to allow speed building
        if (!this.falling)
            this.velocityX = Math.sign(this.velocityX) * Math.max(0, Math.abs(this.velocityX) - this.friction); // Implements friction to simulate deceleration

        this.animate(); // Call to update animation
    }

    /**
     * Updates Yamada's animation based on their current state.
     */
    animate() {
        let animation = this.animation;

        if (this.platform && !this.falling && !this.grappling) { // Is standing on a surface

            if (this.velocityX != 0) { // Is moving

                if (this.game.keyD && !this.game.keyA) // Walking right
                    animation = new Animation(this.spritesheet, "walk", 0, 64, 32, 32, 0, 0.10, 8, true, 2, DIR_RIGHT, 7, 0, 18, 32);
                else if (this.game.keyA) // Walking left
                    animation = new Animation(this.spritesheet, "walk", 0, 96, 32, 32, 0, 0.10, 8, true, 2, DIR_LEFT, 7, 0, 18, 32);

            } else { // Is not moving

                if (this.aiming) { // Is aiming

                    if (this.game.keyW && this.game.keyShift) { // Up
                        if (animation.direction == DIR_RIGHT)
                            animation = new Animation(this.spritesheet, "g_aim_u", 64, 128, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 1, 0, 25, 32, 12, 2);
                        else
                            animation = new Animation(this.spritesheet, "g_aim_u", 160, 128, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 6, 0, 25, 32, 20, 2);
                    } else if (this.game.keyD && this.game.keyShift) { // Right-Straight
                        animation = new Animation(this.spritesheet, "g_aim_s", 0, 128, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 25, 32, 29, 11);
                    } else if (this.game.keyA) { // Left-Straight
                        animation = new Animation(this.spritesheet, "g_aim_s", 224, 128, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 0, 0, 25, 32, 2, 11);
                    } else if (this.game.keyShift) { // Diagonal
                        if (animation.direction == DIR_RIGHT)
                            animation = new Animation(this.spritesheet, "g_aim_d", 32, 128, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 20, 32, 23, 3);
                        else
                            animation = new Animation(this.spritesheet, "g_aim_d", 192, 128, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 5, 0, 20, 32, 8, 3);
                    }

                } else { // Is not aiming

                    if (animation.direction == DIR_RIGHT)
                        animation = new Animation(this.spritesheet, "idle", 0, 0, 32, 32, 0, 0.10, 8, true, 2, DIR_RIGHT, 7, 0, 18, 32);
                    else
                        animation = new Animation(this.spritesheet, "idle", 0, 32, 32, 32, 0, 0.10, 8, true, 2, DIR_LEFT, 7, 0, 18, 32);
                }

            }
            
        } else { // Is not standing on a surface

            if (this.grappling) { // Is grappling

                if (animation.animName == "g_aim_u" || animation.animName == "f_aim_u") { // Up
                    if (animation.direction == DIR_RIGHT)
                        animation = new Animation(this.spritesheet, "f_aim_u", 96, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 2, 0, 19, 32, 12, 2);
                    else
                        animation = new Animation(this.spritesheet, "f_aim_u", 128, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 11, 0, 19, 32, 20, 2);
                } else if (animation.animName == "g_aim_s" || animation.animName == "f_aim_s") { // Straight
                    if (animation.direction == DIR_RIGHT)
                        animation = new Animation(this.spritesheet, "f_aim_s", 0, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 25, 32, 28, 11);
                    else
                        animation = new Animation(this.spritesheet, "f_aim_s", 224, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 0, 0, 25, 32, 3, 11);
                } else { // Diagonal
                    if (animation.direction == DIR_RIGHT)
                        animation = new Animation(this.spritesheet, "f_aim_d", 32, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 22, 32, 26, 3);
                    else
                        animation = new Animation(this.spritesheet, "f_aim_d", 192, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 3, 0, 22, 32, 6, 3);
                }

            } else { // Is not grappling

                if (this.aiming) { // Is aiming
					if (this.hook) { // Hook is out, keep same animation
						animation = animation;
					}else if (this.game.keyW) { // Up
                        if (animation.direction == DIR_RIGHT)
                            animation = new Animation(this.spritesheet, "f_aim_u", 96, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 2, 0, 19, 32, 12, 2);
                        else
                            animation = new Animation(this.spritesheet, "f_aim_u", 128, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 11, 0, 19, 32, 20, 2);
                    } else if (this.game.keyD) { // Right-Straight
                        animation = new Animation(this.spritesheet, "f_aim_s", 0, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 25, 32, 28, 11);
                    } else if (this.game.keyA) { // Left-Straight
                        animation = new Animation(this.spritesheet, "f_aim_s", 224, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 0, 0, 25, 32, 3, 11);
                    } else { // Diagonal
                        if (animation.direction == DIR_RIGHT)
                            animation = new Animation(this.spritesheet, "f_aim_d", 32, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 22, 32, 26, 3);
                        else
                            animation = new Animation(this.spritesheet, "f_aim_d", 192, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 3, 0, 22, 32, 6, 3);
                    }

                } else { // Is not aiming

                    /* Implicit 'Is falling' at this stage of the state check.
                     */

                    if (this.game.keyD || (animation.direction == DIR_RIGHT && !this.game.keyA)) // Moving right
                        animation = new Animation(this.spritesheet, "f_aim_s", 0, 160, 32, 32, 0, 1, 1, true, 2, DIR_RIGHT, 7, 0, 25, 32, 28, 11);
                    else if (this.game.keyA || animation.direction == DIR_LEFT) // Moving left
                        animation = new Animation(this.spritesheet, "f_aim_s", 224, 160, 32, 32, 0, 1, 1, true, 2, DIR_LEFT, 0, 0, 25, 32, 3, 11);

                }
            }

        }

        super.animate(animation); // Call to super method
    }

    /**
     * Applies damage to Yamada and knocks him out if his health falls to zero or below.
     * 
     * @param {number} damage (Optional) The amount of damage Yamada recieves. Default is 10.
     */
    damage(damage = 10) {
        if (this.damageTimer == 0) { // Checks if Yamada may be damaged
            console.log("damaged");

            this.damageTimer = this.damageTime;
            this.health -= damage;

            if (this.health <= 0)
                this.knockout();
        } else {
            console.log("invulnerable");
        }
    }

    /**
     * Sends Yamada to the last checkpoint.
     */
    knockout() {
        console.log("knockout");

        // Resets relavent values
        this.aiming = false;
        this.grappling = false;
        this.x = this.game.sceneManager.activeCheckpoint.x;
        this.y = this.game.sceneManager.activeCheckpoint.y;
		this.health = this.maxhealth;
        this.velocityX = 0;
        this.velocityY = 0;

        if (this.hook) { // Removes grappling hook if present
            this.hook.removeFromWorld = true;
            this.hook = null;
        }

        this.updateBox();
    }
}

/**
 * Class for the Bird enemy type.
 */
class Bird extends EnemyClass {

    /**
     * The constructor for the Bird class.
     *
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position to spawn the enemy at.
     * @param {number} y The y position to spawn the enemy at.
     * @param {string} spritesheet The file path of the spritesheet in the asset manager.
     * @param {boolean} collision (Optional) Determines if the bird collides with platforms.
     */
    constructor(game, x, y, spritesheet, collision = false) {
        super(game, x, y, spritesheet, undefined/* default damage */, undefined/* default stunTimer */, false, collision); // Call to super constructor

        this.speed = 2;

        this.velocityX = -this.speed; // Initial speed
        this.animation = new Animation(spritesheet, "fly", 0, 0, 32, 32, 0, 0.10, 2, true, 2, DIR_RIGHT, 5, 11, 21, 9); // Initial animation
    }

    /**
     * Updates the Bird.
     * 
     * @see EnemyClass.update
     */
    update() {
        super.update(); // Call to super method

        // Iterates over game entities to check for collision
        for (var i = 0; i < this.game.entities.length; i++) {
            // Check with temporary hitbox from before the super class update
            var entity = this.game.entities[i];
            var tempBox = new BoundingBox(this.box.x + this.velocityX, this.box.y, this.box.width, this.box.height, this.tag);
            var collide = tempBox.collide(entity.box); // The collision results

            if (entity !== this && collide.object == TAG_PLATFORM && this.collision) { // Checks if entity collided with a platform
                if (collide.right && this.box.left >= entity.box.right) { // Ran into right side of a platform
                    this.velocityX = this.speed;
                }

                if (collide.left && this.box.right <= entity.box.left) { // Ran into left side of a platform
                    this.velocityX = -this.speed;
                }
            }
        }

        this.animate(); // Call to update animation
    }

    /**
     * Updates the Bird's animation based on its current state.
     */
    animate() {
        let animation = this.animation;

        if (this.velocityX > 0) { // Is walking right
            animation = new Animation(this.spritesheet, "fly", 0, 0, 32, 32, 0, 0.10, 2, true, 2, DIR_RIGHT, 5, 11, 21, 9);
        } else if (this.velocityX < 0) { // Is walking left
            animation = new Animation(this.spritesheet, "fly", 0, 32, 32, 32, 0, 0.10, 2, true, 2, DIR_LEFT, 5, 11, 21, 9);
        }

        super.animate(animation); // Call to super method
    }
}

/**
 * Class for the Construction Worker enemy type.
 */
class ConWorker extends EnemyClass {

    /**
     * The constructor for the Construction Worker class.
     * 
     * @param {GameEngine} game The game engine.
     * @param {number} x The x position to spawn the enemy at.
     * @param {number} y The y position to spawn the enemy at.
     * @param {string} spritesheet The file path of the spritesheet in the asset manager.
     */
    constructor(game, x, y, spritesheet) {
        super(game, x, y, spritesheet, TAG_ENEMY); // Call to super constructor


        this.speed = 1.9;

        this.velocityX = this.speed; // Initial speed
        this.animation = new Animation(spritesheet, "walk", 0, 0, 42, 42, 0, 0.10, 8, true, 2, DIR_RIGHT, 0, 7, 42, 35); // Initial animation

        // Creates a platform that follows the construction worker
        this.movingPlatform = new ConWorkerPlatform(game, this.x, this.y, this.box.width, this.box.y - this.y, this);
        game.addEntity(this.movingPlatform);
    }

    /**
     * Updates the Construction Worker.
     * 
     * @see EnemyClass.update
     */
    update() {
		
        super.update(); // Call to super method

        // Checks if still on platform
        if (this.platform) {
            // Check with temporary hitbox, as shunted out after last collision
            var tempBox = new BoundingBox(this.box.x, this.box.y + 1, this.box.width, this.box.height, this.tag);
            var collide = tempBox.collide(this.platform.box);

            if (!collide.top) {
                if (this.box.x + (this.box.width / 2) < this.platform.x)
                    this.velocityX = this.speed;
                else if (this.box.x + (this.box.width / 2) > this.platform.x + this.platform.width)
                    this.velocityX = -this.speed;
            }
        }

        // Iterates over game entities to check for collision
        for (var i = 0; i < this.game.entities.length; i++) {
            // Check with temporary hitbox from before the super class update
            var entity = this.game.entities[i];
            var tempBox = new BoundingBox(this.box.x + this.velocityX, this.box.y, this.box.width, this.box.height, this.tag);
            var collide = tempBox.collide(entity.box); // The collision results

            if (entity !== this && collide.object == TAG_PLATFORM && this.collision) { // Checks if entity collided with a platform
                if (collide.right && this.box.left >= entity.box.right) { // Ran into right side of a platform
                    this.velocityX = this.speed;
                }

                if (collide.left && this.box.right <= entity.box.left) { // Ran into left side of a platform
                    this.velocityX = -this.speed;
                }
            }
        }

        this.movingPlatform.box = new BoundingBox(this.x, this.y, this.box.width, this.box.y - this.y, TAG_PLATFORM); // Updates platform's box

        this.animate(); // Call to update animation
    }

    /**
     * Updates the Construction Worker's animation based on its current state.
     */
    animate() {
        let animation = this.animation;

        if (this.velocityX > 0) { // Is walking right
            animation = new Animation(this.spritesheet, "walk", 0, 0, 42, 42, 0, 0.10, 8, true, 2, DIR_RIGHT, 0, 7, 42, 35);
        } else if (this.velocityX < 0) { // Is walking left
            animation = new Animation(this.spritesheet, "walk", 0, 42, 42, 42, 0, 0.10, 8, true, 2, DIR_LEFT, 0, 7, 42, 35);
        }
        
        super.animate(animation); // Call to super method
    }
}