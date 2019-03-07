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
        this.mute = false;
        this.soundEffects = [];
        this.counter = 0;
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
            var that = this;
            var sound = { id: that.counter++, audio: AM.getAsset(path).cloneNode() }; // Clones audio to allow concurrent playback

            this.soundEffects.push(sound); // Adds sound to the sound effects array

            if (this.mute) // Checks if audio is muted
                sound.audio.muted = true;

            sound.audio.addEventListener("ended", function () { // Removes sound effect from array once it has ended for garbage collection
                var idx = that.soundEffects.findIndex(function (el) { // Gets the index of the sound
                    return el.id == sound.id;
                });

                that.soundEffects.splice(idx, 1); // Removes the sound from the array
            });

            sound.audio.play().catch(function (error) {
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

                if (this.mute) // Checks if audio is muted
                    this.levelTrack.muted = true;

                this.levelTrack.loop = loop;
                this.unpauseLevelTrack();
            }
        }
    }

    /**
     * Pauses all sound.
     */
    pauseSound() {
        this.levelTrack.pause();

        this.soundEffects.forEach(function (el) { // Pause all sound effects
            el.audio.pause();
        });
    }

    /**
     * Unpauses all sound.
     */
    unpauseSound() {
        if (this.active) { // Checks if Audio Manager is active
            this.levelTrack.play().catch(function (error) {
                console.log("Promise Rejected: " + error);
            });

            this.soundEffects.forEach(function (el) { // Plays all sound effects
                el.audio.play().catch(function (error) {
                    console.log("Promise Rejected: " + error);
                });
            });
        }
    }

    /**
     * Pauses the level track.
     */
    pauseLevelTrack() {
        this.levelTrack.pause();
    }

    /**
     * Unpauses the level track.
     */
    unpauseLevelTrack() {
        if (this.active) { // Checks if Audio Manager is active
            this.levelTrack.play().catch(function (error) {
                console.log("Promise Rejected: " + error);
            });
        }
    }

    /**
     * Toggles audio.
     */
    toggleSound() {
        // Toggles mute
        var mute = !this.mute;
        this.mute = mute;

        this.levelTrack.muted = mute; // Mutes level track
        
        this.soundEffects.forEach(function (el) { // Mutes all sound effects
            el.audio.muted = mute;
        });
    }
}
