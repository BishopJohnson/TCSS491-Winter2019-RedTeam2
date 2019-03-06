Level Editor README

The program runs without any user input. The only thing it requires is to have a text file to read.
In the "LevelEditor" class change the FILENAME and JSONNAME global values. FILENAME is the input file and JSONNAME is the output. Add the JSON jar file to the build path in order for the program to work.

To create a level you must use the following format.
The first line of the document must dictate the size of the level, time limit, its id, the next level, background path.
[WIDTH]x[HEIGHT]x[TIMELIMIT]x[ID]x[NEXTLEVEL]x[BACKGROUNDPATH]
Note: 'x' is necessary to parse out this first line of data. BACKGROUNDPATH is not implemented but requires some text.

Platforms - Integer, Letter. The integer is the id of the platform. The letter is to represent the starting point of the platform.
a - Represents the start of the platform builder. Must be either the top or the left piece.
b - Represents the continue extension of the platform.
c - represents the end of the platform.
s - used if the platform should only be 1 block.
Example: 0a0b0b0c - This would represent a platform that is 128 pixels wide by 32 pixels tall.

Enemies - 'e', Integer. Represents the enemy in our database. The integer is the value that exists in the array of enemies available.
e0 - Construction Worker
e1 - Bird
e2 - Security Guard

Checkpoints - 'c', Integer. Represents the checkpoints. The integer represents the checkpoint's id. Used to note the furthest checkpoint.
There must be a c0 above where the player should start.

Doors - 'd', Integer. Represents the door. The integer is the number of keys necessary to open the door.

Keys - 'k', Integer. Represents the key. The integer is the id of the key.

Player - pp. Where the player starts.

Goal - gg. Where the player wins.