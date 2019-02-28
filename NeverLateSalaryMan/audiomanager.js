/**
 * 
 */
class AudioManager {

    /**
     * 
     */
    constructor() {
        this.active = false;
    }

    start() {

        if (!this.active) {                                                  /////////////////
            this.active = true;                                              /////////////////
            this.playSound("./NeverLateSalaryMan/audio/DeathByGlamour.mp3"); // DELETE THIS //
        }                                                                    /////////////////

        this.active = true;
    }

    /**
     * 
     * 
     * @param {string} path
     */
    playSound(path) {
        if (this.active) { // Checks if audiomanager is active
            var sound = new Audio(path);

            sound.addEventListener("loadeddata", () => {
                var promise = sound.play();

                if (promise) { // Checks if promise is defined
                    promise.then(function (val) { // Promise fulfilled
                        console.log("Sound playing; Val: " + val);
                    }).catch(function (reason) { // Promise rejected
                        console.log("Promise Rejected: " + reason);
                    });
                }
            });
        }
    }
}
