/**
 * The Asset Manager function.
 * 
 * <p>Queues and downloads files to be cached and used in the game as assets.</p>
 */
function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = []; // The cache of the HTML media elements
    this.downloadQueue = [];
}

/**
 * Queues a file for download.
 * 
 * @param {string} path The path of the file being queued.
 */
AssetManager.prototype.queueDownload = function (path) {
    console.log("Queueing " + path);
    this.downloadQueue.push(path);
}

/**
 * Determines if all downloads are finished.
 * 
 * @returns {boolean} True if the sum of successful and unsuccessful downloads equals the queue's length, otherwise false.
 */
AssetManager.prototype.isDone = function () {
    return this.downloadQueue.length === this.successCount + this.errorCount;
}

/**
 * Attempts to download all of the files queued in the Asset Manager.
 * 
 * @param {Function} callback The callback function.
 */
AssetManager.prototype.downloadAll = function (callback) {
    var that = this;

    for (var i = 0; i < this.downloadQueue.length; i++) { // Loops for each queued element
        var path = this.downloadQueue[i];
        var type = this.getFileType(path); // The file type

        /* Creates an HTML media element and attempts to download it. Once the attempt is finished
         * the success or error counter is incremented. Once the sum of both counters equals the number
         * of media elements queued, the callback function is called.
         */

        if (type == TYPE_IMAGE) { // Checks if file is an image file
            var img = new Image();

            img.addEventListener("load", function () {
                console.log("Loaded " + TYPE_IMAGE + ": " + this.src);
                that.successCount++;

                if (that.isDone())
                    callback();
            });

            img.addEventListener("error", function () {
                console.log("Error loading " + TYPE_IMAGE + ": " + this.src);
                that.errorCount++;

                if (that.isDone())
                    callback();
            });

            img.src = path; // Sets the empty Image object's source to the path

            this.cache[path] = img; // Caches the HTML image element
        } else if (type == TYPE_AUDIO) { // Checks if file is an audio file
            var audio = new Audio();

            audio.addEventListener("loadeddata", function () {
                console.log("Loaded " + TYPE_AUDIO + ": " + this.src);
                that.successCount++;

                if (that.isDone())
                    callback();
            });

            audio.addEventListener("error", function () {
                console.log("Error loading " + TYPE_AUDIO + ": " + this.src);
                that.errorCount++;

                if (that.isDone())
                    callback();
            });

            audio.src = path; // Sets the empty Audio object's source to the path

            this.cache[path] = audio; // Caches the HTML audio element
        }
    }
}

/**
 * Gets the HTML media element that was downloaded by the Asset Manager.
 * 
 * @param {string} path The file path of the asset.
 */
AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
}

/**
 * Determines the type of file based on its extension.
 * 
 * <p>If the extension is not determined, then an empty string is returned.</p>
 * 
 * @param {string} path A file path.
 * @return {string} The type of file in the path.
 */
AssetManager.prototype.getFileType = function (path) {
    var ext = path.split(".").pop(); // Gets the file extension

    if (ext == "png") { // Checks if file is a image
        return TYPE_IMAGE;
    } else if (ext == "mp3") { // Checks if 
        return TYPE_AUDIO;
    }

    return "";
}
