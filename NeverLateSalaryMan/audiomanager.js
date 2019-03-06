/**
 * Audio Manager used to play level music and sound effects.
 * 
 * <p>The Audio Manager uses cached audio in the Asset Manager to play music.</p>
 */
class AudioManager {

    /**
     * The constructor for the Audio Manager.
     */
    constructor() {
        this.active = false;
        this.levelTrack = new Audio(); // Place holder audio
    }

    /**
     * Starts the Audio Manager.
     */
    start() {

        if (!this.active) {                                                                // TODO: Delete this sectio once Audio Manager is implemented across
            this.active = true;                                                            // all levels.
            this.playLevelTrack("./NeverLateSalaryMan/audio/DeathByGlamour.mp3");          //
        }                                                                                  //

        this.active = true;
    }

    /**
     * Plays an audio track.
     * 
     * @param {string} path The path of the audio file in the Asset Manager.
     */
    playSound(path) {
        if (this.active) { // Checks if Audio Manager is active
            var sound = AM.getAsset(path).cloneNode(); // Clones audio to allow concurrent playback

            sound.play().catch(function (error) {
                console.log("Promise Rejected: " + error);
            });
        }
    }

    /**
     * Stops the current level music track and plays a new music track.
     * 
     * <p>If no path for a new track is passed, then the method only stops the current track.</p>
     * 
     * @param {string} path (Optional) The path of the audio file in the Asset Manager.
     * @param {boolean} loop (Optional) Determines if the music track will loop. Default value is true.
     */
    playLevelTrack(path, loop = true) {
        if (this.active) { // Checks if Audio Manager is active
            // Pauses track for garbage collection
            if (!this.levelTrack.paused) { // Checks if level track is playing
                this.levelTrack.pause();
            }

            if (path) { // Checks if path to audio was passed
                this.levelTrack = AM.getAsset(path).cloneNode(); // Clones audio from Asset Manager

                this.levelTrack.loop = loop;
                this.unpauseLevelTrack();
            }
        }
    }

    pauseLevelTrack() {
        this.levelTrack.pause();
    }

    unpauseLevelTrack() {
        this.levelTrack.play().catch(function (error) {
            console.log("Promise Rejected: " + error);
        });
    }
}
