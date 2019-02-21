import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.json.simple.JSONObject;

public class LevelEditor {
	
	private static String[] enemies = {"ConWorker", "Bird"};
	private static String CHECKPOINT = "Checkpoint";
	private static String WIN_AREA = "WinArea";
	private static String FILENAME = "level1.txt";
	private static String JSONNAME = "level1.json";
	private static String[][] myLevel;
	private static ArrayList<Entity> myEntities = new ArrayList<>();
	private static ArrayList<Platform> myPlatforms = new ArrayList<>();
	private static Level jsonLevel;
	private static PlayerData myPlayer;
	
	public static void main(String[] args) {
		jsonLevel = new Level();
		myLevel = testLevelReader(FILENAME);
		System.out.println("Removing Empties");
		removeEmpty(myLevel);
		System.out.println("Removed Empties, finding entities");
		parseEntities(myLevel);
		System.out.println("Removed entities, parsing platforms");
		parsePlatforms(myLevel);
		System.out.println(myPlatforms.size());
		System.out.println(myEntities.size());
		convertLevelToJSON();
		//System.out.println(jsonLevel.getJSONObject().toJSONString());
		try {
			File file = new File(JSONNAME);
			file.createNewFile();
			FileWriter fileWriter = new FileWriter(file);
			JSONObject.writeJSONString(jsonLevel.getMap(), fileWriter);
			fileWriter.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		//JSONObject.writeJSONString(arg0, arg1);
	}
	
	private static String[][] testLevelReader(String fileName) {
		LevelReader levelReader = new LevelReader(fileName);
		String[][] level = levelReader.getLevelString();
		jsonLevel.setTimeLimit(levelReader.getTimeLimit());
		jsonLevel.setID(levelReader.getID());
		jsonLevel.setNextLevel(levelReader.getNextLevel());
		jsonLevel.setBackground(levelReader.getBackground());
		printLevel(level);
		return level;
	}
	
	private static Entity[] EntityListToArray(List<Entity> entities) {
		Entity[] array = new Entity[entities.size()];
		for(int i = 0; i < entities.size(); i++) {
			array[i] = entities.get(i);
		}
		return array;
	}
	
	private static Platform[] PlatformListToArray(List<Platform> platforms) {
		Platform[] array = new Platform[platforms.size()];
		for(int i = 0; i < platforms.size(); i++) {
			array[i] = platforms.get(i);
		}
		return array;
	}
	
	private static void printLevel(String[][] level) {
		for(int row = 0; row < level.length; row++) {
			for(int column = 0; column < level[0].length; column++) {
				System.out.print(level[row][column]);
			}
			System.out.println();
		}
	}
	
	private static void printLevel2(String[][] level) {
		for(int row = 0; row < level.length; row++) {
			for(int column = 0; column < level[0].length; column++)  {
				if(level[row][column] == null) {
					System.out.print(" ");
				} else {
					System.out.print(level[row][column].toCharArray()[0]);
				}
			}
			System.out.println();
		}
	}
	
	private static void removeEmpty(String[][] level) {
		for(int row = 0; row < level.length; row++) {
			for(int column = 0; column < level[0].length; column++) {
				if(level[row][column].equals("  ")) {
					level[row][column] = null;
				}
			}
		}
	}
	
	private static void parseEntities(String[][] level) {
		for(int row = 0; row < level.length; row++) {
			for(int column = 0; column < level[0].length; column++) {
				if(level[row][column] != null) {
					if(level[row][column].toCharArray()[0] == 'p') {
						//myEntities.add(new Entity("player", column * 32, row * 32));
						myPlayer = new PlayerData(column * 32, row * 32);
						level[row][column] = null;
					} else if(level[row][column].toCharArray()[0] == 'g') {
						myEntities.add(new Entity(WIN_AREA, column * 32, row * 32));
						level[row][column] = null;
					} else if(level[row][column].toCharArray()[0] == 'e') {
						myEntities.add(new Entity(
								enemies[Integer.valueOf("" + level[row][column].toCharArray()[1])],
								column * 32, row * 32));
						level[row][column] = null;
					} else if(level[row][column].toCharArray()[0] == 'c') {
						myEntities.add(new Entity(CHECKPOINT, column * 32, row * 32,
								Integer.valueOf("" + level[row][column].toCharArray()[1])));
						level[row][column] = null;
					}
				}
			}
		}
	}
	
	private static void parsePlatforms(String[][] level) {
		while(!checkArrayEmpty(level)) {
			int row = 0;
			int column = 0;
			Platform platform = null;
			while(platform == null && column < level[0].length && row < level.length) {
				char[] values = null;
				if(level[row][column] != null) {
					values = level[row][column].toCharArray();
				}
				if(level[row][column] != null && values != null) {
					//System.out.println(level[row][column]);
					if(values[1] == 'a' && platform == null) {
						platform = buildPlatform(row, column, level.length,
								level[0].length, values[0]);
						myPlatforms.add(platform);
						platform = null;
						column++;
					} else if(values[1] == 's' && platform == null){
						platform = new Platform();
						platform.setX(column * 32);
						platform.setY(row * 32);
						platform.setHeight(32);
						platform.setWidth(32);
						platform.setID(Integer.valueOf("" + values[0]));
						myPlatforms.add(platform);
						platform = null;
						level[row][column] = null;
						column++;
					}
				} else {
					column++;
					if(column >= level[0].length) {
						column = 0;
						row++;
					}
				}
				//printLevel2(level);
				//System.out.println();
			}
			//Save place
		}
	}
	
	private static Platform buildPlatform(int row, int column, int maxRow,
			int maxColumn, char symbol) {
		Platform platform = new Platform();
		platform.setX(column * 32);
		platform.setY(row * 32);
		platform.setHeight(32);
		platform.setWidth(32);
		platform.setID(Integer.valueOf("" + symbol));
		myLevel[row][column] = null;
		int checkColumn = column + 1;
		while(checkColumn < maxColumn && myLevel[row][checkColumn] != null 
				&& myLevel[row][checkColumn].toCharArray()[0] == symbol) {
			if(myLevel[row][checkColumn].toCharArray()[1] == 'c') {
				myLevel[row][checkColumn] = null;
				checkColumn = maxColumn;
				platform.increaseWidth();
			} else {
				platform.increaseWidth();
				myLevel[row][checkColumn] = null;
			}
			checkColumn++;
		}
		row++;
		while(row < maxRow && myLevel[row][column] != null
				&& myLevel[row][column].toCharArray()[0] == symbol) {
			if(myLevel[row][column].toCharArray()[1] == 'c') {
				myLevel[row][column] = null;
				row = maxRow;
				platform.increaseHeight();
			} else {
				platform.increaseHeight();
				myLevel[row][column] = null;
			}
			row++;
		}
		return platform;
	}
	
	private static boolean checkArrayEmpty(String[][] level) {
		for(int row = 0; row < level.length; row++) {
			for(int column = 0; column < level[0].length; column++) {
				if(level[row][column] != null) {
					return false;
				}
			}
		}
		return true;
	}
	
	private static void convertLevelToJSON() {
		int height = myLevel.length;
		int width = myLevel[0].length;
		jsonLevel.setCamData(new CameraData(0, 0, width * 32, height * 32));
		jsonLevel.setMaxYLimit(height * 32);
		jsonLevel.setPlayerData(myPlayer);
		jsonLevel.setEntities(EntityListToArray(myEntities));
		jsonLevel.setPlatforms(PlatformListToArray(myPlatforms));
	}
}
