function SceneManager(game) {
	this.game = game;
	this.game.sceneManager = this; // Reference so entities can call for scenes
	this.nextLevel = 0;
	this.timeLimit = 0;
	this.playLevel = false;
	this.activeCheckpoint = null;
	this.score = 0;
	this.box = new BoundingBox("manager", 0, 0, 0, 0);
	// Hardcode each level's time and other properties as JSON objects
	this.levelProps = [];
	// Push each JSON object into the level properties according to indexing rule
	this.levelProps.push(JSON.stringify(
		{playLevel: false, nextLevel: 1, timeLimit: 0, camData: null, deathPlane: 0, playerData: null,
		entities:[{msg: "A and D to move\nHold K to aim\nHold W while aiming to aim up\nPress A or D while aiming to aim straight left or right\nRelease K to fire hook\nPress L to detatch hook\n\nYou can stand on the worker's beam, but touching him\nwill damage you.\nVending machines are checkpoints.\n\nGet to the bus stop before time runs out!\n\nClick to start", transitionID: 1, x: 50, y: 100}], platforms: null, background: null}));
	this.levelProps.push(level1);
	this.levelProps.push(level2);
	this.levelProps.push(level3);
	this.levelProps.push(JSON.stringify(
		{playLevel: false, nextLevel: 0, timeLimit: 0, camData: null, deathPlane: 0, playerData: null,
		entities:[{msg: "You won!\nClick to return to splash screen", transitionID: 0, x: 100, y: 100}], platforms: null, background: null}));
	this.levelProps.push(JSON.stringify(
		{playLevel: false, nextLevel: 0, timeLimit: 0, camData: null, deathPlane: 0, playerData: null,
		entities:[{msg: "You lost!\nClick to return to splash screen", transitionID: 0, x: 100, y: 100}], platforms: null, background: null}));
}

/*
Level properties JSON Definition:
Prop.playLevel: True if the level is a gameplay stage
Prop.nextLevel: ID of next level to transition to
Prop.timeLimit: Level Time limit (seconds)
Prop.camData: object {minX, maxX, minY, maxY} or null if not a play level
Prop.deathPlane: y position to define death plane or null if not a play level
Prop.playerData: object {x, y} or null if not a play level
Prop.entities: array of objects, format depending if stage is gameplay or not
	if gameplay: objects of format {tag, x, y, otherFields...}
	if not gameplay: objects of format {msg, transitionID, x, y}
Prop.platforms: array of objects, of format {x, y, width, height}
Prop.background: URL for asset as a string
*/

/**
Updates the timer based on the actual elapsed time.
*/
SceneManager.prototype.update = function() {
	if (this.playLevel) {
		this.timeLimit -= this.game.clockTick;
		
		// Respawn player at checkpoint if they fall below death plane
		if (this.game.player.y > this.deathPlane)
			this.game.player.knockout();
		
		
		// Game ends if player runs out of time
		if (this.timeLimit <= 0) {
			this.loadLevel(4);
		}
	}
}

/**
Required for inheritance. SceneManager is not a drawn entity.
*/
SceneManager.prototype.draw = function() {
}

/**
Unloads the current level and loads the next scene as needed.
@param ID number of the level to transition to.
*/
SceneManager.prototype.loadLevel = function(sceneID) {
	var properties = JSON.parse(this.levelProps[sceneID]);
	this.playLevel = properties.playLevel;
	this.nextLevel = properties.nextLevel;
	this.timeLimit = properties.timeLimit;
	this.activeCheckpoint = null;
	this.game.entities = []; // Remove all objects from current level
	
	if (properties.playLevel) {
		// Create the player entity
        var newPlayer = new Yamada(this.game,
			properties.playerData.x, properties.playerData.y,			 
			AM.getAsset("./NeverLateSalaryMan/img/Yamada.png"));
		this.game.player = newPlayer;
		this.game.addEntity(newPlayer);
		
		// Set up the level's camera properties
		var newCam = new Camera(this.game, properties.camData.minX, properties.camData.maxX, properties.camData.minY, properties.camData.maxY);
		this.game.camera = newCam;
		this.game.addEntity(newCam);
		this.deathPlane = properties.deathPlane;	
		
		// Add all platforms for the level
		for(i = 0; i < properties.platforms.length; i++) {
			var newPlat = properties.platforms[i];
			this.game.addEntity(new Platform(this.game, newPlat.x, newPlat.y, 
				newPlat.width, newPlat.height, properties.platforms[i].ID));
		}
		
		// Add all nonPlayer entities
		for (i = 0; i < properties.entities.length; i++) {
            var newThing = properties.entities[i];

			// Determine which type of entity is needed by entity tags
			if (newThing.tag == "Bird")
                this.game.addEntity(new Bird(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/Bird.png")));
            else if (newThing.tag == "ConWorker")
                this.game.addEntity(new ConWorker(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/ConstrWorker.png")));
			else if (newThing.tag == "WinArea")
				this.game.addEntity(new WinArea(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/BusStop.png")));
			else if (newThing.tag == "Checkpoint")
				this.game.addEntity(new Checkpoint(this.game, newThing.x, newThing.y, newThing.ID, AM.getAsset("./NeverLateSalaryMan/img/Checkpoint.png")));
			else if (newThing.tag == "SecurityGuard")
				this.game.addEntity(new SecurityGuard(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/PoliceOfficer.png")));
			else if (newThing.tag == "SumoWrestler")
				this.game.addEntity(new SumoWrestler(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/SumoWrestler.png")));
			else if (newThing.tag == "Monsoon")
                this.game.addEntity(new Weather(this.game, newThing.x, newThing.y, newThing.width, newThing.height, newThing.dir, AM.getAsset("./NeverLateSalaryMan/img/Rain.png")));
            else if (newThing.tag == "Key")
                this.game.addEntity(new KeyItem(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/KeyItems.png")));
			else if (newThing.tag == "Door")
                this.game.addEntity(new Door(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/KeyItems.png"), newThing.id));
		}
		
		// Add the background for the level
		if (properties.background)
            this.game.background = new Background(this.game, AM.getAsset(properties.background));
        else
            this.game.background = null;

        /* Enemy Spawner Test Code */
        //var spawner = new EnemySpawner(this.game, this.game.player.x + 200, this.game.player.y, undefined, 5);
        //this.game.addEntity(spawner);
        /***************************/

	} else { // Scene is not a gameplay level, get other assets
		this.game.camera = null;
		this.game.player = null;
		this.game.background = null;
		var menuData = properties.entities[0];
		this.game.addEntity(new MenuDisplay(menuData.msg, menuData.transitionID,
							menuData.x, menuData.y, this.game));
	}
		
	// Re-add this manager to the game to keep timer running
    this.game.addEntity(this);
}

function MenuDisplay(msg, levelID, x, y, game) {
	this.string = msg.split("\n");
	this.transitionID = levelID;
	this.x = x;
	this.y = y;
	this.game = game;
	this.ctx = game.ctx;
	this.zIndex = 0;
}

MenuDisplay.prototype.update = function() {
	// When clicked, change game ID
	if (this.game.click)
		// Shift to appropriate scene
		this.game.sceneManager.loadLevel(this.transitionID);
}

MenuDisplay.prototype.draw = function() {
	this.ctx.font = "30px serif";
	for (var i = 0; i < this.string.length; i++) {
		this.ctx.fillText(this.string[i], this.x, this.y + i * 30);
	}
}
