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
		entities:[{msg: "A moves left\nD moves right\nHold Left Shift to aim\nPress W while aiming to aim up\nPress A or D while aiming to aim straight left or right\nRelease Left Shift to fire hook\nPress X to detatch hook\n\nYou can stand on the worker's beam, but\ntouching the worker will send you back to the start.\n\nGet to the yellow area at the end in three minutes to win.\n\nClick to start", transitionID: 1, x: 100, y: 100}], platforms: null, background: null}));
	this.levelProps.push(JSON.stringify(
		{playLevel: true, nextLevel: 2, timeLimit: 180, 
		camData: {minX: 0, maxX: 1991, minY: 0, maxY: 1000}, deathPlane: 1000,
		playerData: {x: 100, y: 255},
		entities: [{tag: "ConWorker", x: 600, y: 237},
                   {tag: "Bird", x: 800, y: 100},
				   {tag: "Checkpoint", x: 100, y: 255, ID: 0},
				   {tag: "Checkpoint", x: 900, y: 160, ID: 1},
				   {tag: "WinArea", x: 1900, y: 300, width: 50, height:50}],
		platforms: [{x: 0, y: 0, width: 1992, height: 34},
					{x: 0, y: 34, width: 30, height: 287},
					{x: 0, y: 322, width: 502, height: 30},
					{x: 377, y: 222, width: 124, height: 99},
					{x: 439, y: 353, width: 504, height: 30},
					{x: 817, y: 228, width: 126, height: 125},
					{x: 643, y: 34, width: 30, height: 151},
					{x: 1315, y: 34, width: 30, height: 192},
					{x: 1961, y: 34, width: 30, height: 319},
					{x: 1173, y: 353, width: 818, height: 30},
					{x: 1173, y: 258, width: 62, height: 95},
					{x: 1488, y: 259, width: 126, height: 94}],
		background: "./NeverLateSalaryMan/img/PrototypeLevel.png"}));
	this.levelProps.push('{"timeLimit":100,"playLevel":true,"entities":[{"x":2016,"y":128,"tag":"Checkpoint","ID":4},{"x":1408,"y":192,"tag":"Checkpoint","ID":3},{"x":1248,"y":384,"tag":"ConWorker","ID":0},{"x":1120,"y":768,"tag":"ConWorker","ID":0},{"x":1184,"y":768,"tag":"Checkpoint","ID":2},{"x":1376,"y":768,"tag":"ConWorker","ID":0},{"x":2336,"y":768,"tag":"WinArea","ID":0},{"x":512,"y":800,"tag":"Checkpoint","ID":1},{"x":480,"y":896,"tag":"ConWorker","ID":0},{"x":544,"y":896,"tag":"ConWorker","ID":0},{"x":832,"y":896,"tag":"ConWorker","ID":0}],"background":".\/NeverLateSalaryMan\/img\/PrototypeLevel.png","camData":{"minY":0,"minX":0,"maxY":960,"maxX":2368},"nextLevel":4,"ID":3,"deathPlane":992,"playerData":{"x":32,"y":896},"platforms":[{"x":2016,"width":192,"y":0,"ID":0,"height":32},{"x":1216,"width":32,"y":32,"ID":2,"height":576},{"x":1248,"width":128,"y":32,"ID":0,"height":32},{"x":2176,"width":32,"y":32,"ID":2,"height":576},{"x":1696,"width":32,"y":64,"ID":2,"height":32},{"x":1856,"width":32,"y":64,"ID":2,"height":32},{"x":1536,"width":32,"y":96,"ID":2,"height":32},{"x":1664,"width":96,"y":160,"ID":0,"height":32},{"x":1824,"width":96,"y":160,"ID":0,"height":32},{"x":2016,"width":32,"y":160,"ID":2,"height":640},{"x":1472,"width":32,"y":192,"ID":4,"height":32},{"x":1408,"width":160,"y":224,"ID":0,"height":32},{"x":1536,"width":32,"y":256,"ID":2,"height":320},{"x":1248,"width":32,"y":288,"ID":2,"height":32},{"x":1248,"width":160,"y":416,"ID":0,"height":32},{"x":832,"width":384,"y":544,"ID":0,"height":32},{"x":832,"width":32,"y":576,"ID":1,"height":32},{"x":1408,"width":160,"y":576,"ID":0,"height":32},{"x":0,"width":864,"y":608,"ID":0,"height":32},{"x":1408,"width":32,"y":608,"ID":2,"height":192},{"x":0,"width":32,"y":640,"ID":1,"height":288},{"x":704,"width":32,"y":640,"ID":1,"height":64},{"x":928,"width":32,"y":768,"ID":2,"height":32},{"x":1152,"width":32,"y":768,"ID":2,"height":32},{"x":672,"width":96,"y":800,"ID":0,"height":32},{"x":864,"width":576,"y":800,"ID":0,"height":32},{"x":2016,"width":352,"y":800,"ID":0,"height":32},{"x":512,"width":32,"y":832,"ID":2,"height":32},{"x":864,"width":32,"y":832,"ID":1,"height":96},{"x":224,"width":32,"y":864,"ID":2,"height":32},{"x":320,"width":32,"y":864,"ID":2,"height":32},{"x":512,"width":32,"y":864,"ID":2,"height":32},{"x":192,"width":32,"y":896,"ID":2,"height":32},{"x":224,"width":32,"y":896,"ID":2,"height":32},{"x":320,"width":32,"y":896,"ID":2,"height":32},{"x":352,"width":32,"y":896,"ID":2,"height":32},{"x":512,"width":32,"y":896,"ID":2,"height":32},{"x":0,"width":896,"y":928,"ID":0,"height":32}]}');
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
		// Game ends if player runs out of time
		if (this.timeLimit <= 0) {
			this.loadLevel(3);
		}
		
		// Respawn player at checkpoint if they fall below death plane
		if (this.game.player.y > this.deathPlane)
			this.game.player.knockout();
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
		newCam.x = newPlayer.x;
		newCam.y = newPlayer.y-450;
		this.game.camera = newCam;
		this.game.addEntity(newCam);
		this.deathPlane = properties.deathPlane;
		
		// Add all nonPlayer entities
		for(i = 0; i < properties.entities.length; i++) {
			var newThing = properties.entities[i];
			// Determine which type of entity is needed by entity tags
			if (newThing.tag == "Bird")
                this.game.addEntity(new Bird(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/Bird.png")));
            else if (newThing.tag == "ConWorker")
                this.game.addEntity(new ConWorker(this.game, newThing.x, newThing.y, AM.getAsset("./NeverLateSalaryMan/img/ConstrWorker.png")));
			else if (newThing.tag == "WinArea")
				this.game.addEntity(new WinArea(this.game, newThing.x, newThing.y, 50, 50));
			else if (newThing.tag == "Checkpoint")
				this.game.addEntity(new Checkpoint(this.game, newThing.x, 50, 50));
			// else if (newThing.tag == something)
		}
		
		// Add all platforms for the level
		for(i = 0; i < properties.platforms.length; i++) {
			var newPlat = properties.platforms[i];
			this.game.addEntity(new Platform(this.game, newPlat.x, newPlat.y, 
				newPlat.width, newPlat.height));
		}
		
		// Add the background for the level
		this.game.background = new Background(this.game, 
								AM.getAsset(properties.background));
		
	} else { // Scene is not a gameplay level, get other assets
		this.game.camera = null;
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