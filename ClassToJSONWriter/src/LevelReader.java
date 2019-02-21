import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class LevelReader {

	private String[][] myLevel;
	private int maxY;
	private int maxX;
	private int maxTimeLimit;
	private int ID;
	private int nextLevel;
	private String background;
	
	public LevelReader(String file) {
		readLevel(file);
	}
	
	private void readLevel(String fileName) {
		FileReader file;
		try {
			file = new FileReader(fileName);
			BufferedReader reader = new BufferedReader(file);
			String[] size = reader.readLine().split("x");
			int width = Integer.valueOf(size[0]);
			int height = Integer.valueOf(size[1]);
			maxY = height * 32;
			maxX = width * 32;
			maxTimeLimit = Integer.valueOf(size[2]);
			ID = Integer.valueOf(size[3]);
			nextLevel = Integer.valueOf(size[4]);
			background = size[5];
			myLevel = new String[height][width];
			String line;
			int row = 0;
			while((line = reader.readLine()) != null) {
				char[] blocks = line.toCharArray();
				int column = 0;
				for(int index = 0; index < blocks.length; index += 2) {
					String block = ""+ blocks[index] + blocks[index + 1];
					myLevel[row][column] = block;
					column++;
				}
				row++;
			}
			reader.close();
		} catch(FileNotFoundException e){
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	public int getMaxY() {
		return maxY;
	}
	
	public int getMaxX() {
		return maxX;
	}
	
	public String[][] getLevelString() {
		return myLevel.clone();
	}
	
	public int getTimeLimit() {
		return maxTimeLimit;
	}
	
	public int getID() {
		return ID;
	}
	
	public int getNextLevel() {
		return nextLevel;
	}
	
	public String getBackground() {
		return background;
	}
}
