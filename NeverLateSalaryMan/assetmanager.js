function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    console.log("Queueing " + path);
    this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function () {
    return this.downloadQueue.length === this.successCount + this.errorCount;
}

AssetManager.prototype.downloadAll = function (callback) {
    for (var i = 0; i < this.downloadQueue.length; i++) {
        var flag = true;
        var img = new Image();
        var audio = new Audio();
        var that = this;

        var path = this.downloadQueue[i];
        console.log(path);

        
        img.addEventListener("load", function () {
            console.log("Loaded " + this.src);
            that.successCount++;
            if (that.isDone()) callback();
        });

        img.addEventListener("error", function () {
            console.log("Error loading " + this.src);
            that.errorCount++;
            if (that.isDone()) callback();
        });
        
        img.src = path;
        this.cache[path] = img;
        
        /*
        img.addEventListener("load", function () {
            console.log("Loaded " + this.src);
            console.log(this + "\n" + this.src + "\n" + path);
            that.successCount++;
            if(that.isDone()) callback();
        });

        img.addEventListener("error", function () {
            console.log("Error loading " + this.src);
            that.errorCount++;
            if (that.isDone()) callback();
        });

        img.src = path;
        this.cache[path] = img;
        */
        /*
        audio.addEventListener("loadeddata", function () {
            console.log("Loaded " + this.src);
            console.log(this + "\n" + this.src + "\n" + path);
            that.successCount++;
            if (that.isDone()) callback();
        });

        audio.addEventListener("error", function () {
            console.log("Error loading " + this.src);
            that.errorCount++;
            if (that.isDone()) callback();
        });

        audio.src = path;
        this.cache[path] = audio.src;
        */
    }
}

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}
