import java.util.HashMap;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class Level {

	/**
	 * ID of the next level.
	 */
	private int ID;
	
	/**
	 * The time limit in ms. 
	 */
	private int timeLimit;
	
	private CameraData camData;
	
	private int maxYLimit;
	
	private PlayerData playerData;
	
	private Entity[] entities;
	
	private Platform[] platforms;
	
	private int nextLevel;
	
	private String background;

	public Level(int iD, int timeLimit, CameraData camData, int maxYLimit, PlayerData playerData, Entity[] entities,
			Platform[] platforms) {
		ID = iD;
		this.timeLimit = timeLimit;
		this.camData = camData;
		this.maxYLimit = maxYLimit;
		this.playerData = playerData;
		this.entities = entities;
		this.platforms = platforms;
	}

	public Level() {
		ID = 0;
		timeLimit = 0;
		this.camData = null;
		maxYLimit = 0;
		playerData = null;
		entities = null;
		platforms = null;
	}
	
	public int getID() {
		return ID;
	}

	public void setID(int iD) {
		ID = iD;
	}

	public int getTimeLimit() {
		return timeLimit;
	}

	public void setTimeLimit(int timeLimit) {
		this.timeLimit = timeLimit;
	}

	public CameraData getCamData() {
		return camData;
	}

	public void setCamData(CameraData camData) {
		this.camData = camData;
	}

	public int getMaxYLimit() {
		return maxYLimit;
	}

	public void setMaxYLimit(int maxYLimit) {
		this.maxYLimit = maxYLimit;
	}

	public PlayerData getPlayerData() {
		return playerData;
	}

	public void setPlayerData(PlayerData playerData) {
		this.playerData = playerData;
	}

	public Entity[] getEntities() {
		return entities;
	}

	public void setEntities(Entity[] entities) {
		this.entities = entities;
	}

	public Platform[] getPlatforms() {
		return platforms;
	}

	public void setPlatforms(Platform[] platforms) {
		this.platforms = platforms;
	}
	
	public void setNextLevel(int theNextLevel) {
		this.nextLevel = theNextLevel;
	}
	
	public void setBackground(String back) {
		this.background = back;
	}
	
	public JSONObject getJSONObject() {
		JSONObject json = null;
		HashMap<String, Object> level = new HashMap<>();
		level.put("ID", this.ID);
		level.put("timeLimit", this.timeLimit);
		level.put("maxYLimit", this.maxYLimit);
		level.put("nextLevel", this.nextLevel);
		level.put("background", this.background);
		
		HashMap<String, Integer> camMap = new HashMap<>();
		camMap.put("minX", camData.getMinX());
		camMap.put("minY", camData.getMinY());
		camMap.put("maxX", camData.getMaxX());
		camMap.put("maxY", camData.getMaxY());
		level.put("camData", new JSONObject(camMap));

		HashMap<String, Integer> playerMap = new HashMap<>();
		playerMap.put("x", playerData.getX());
		playerMap.put("y", playerData.getY());
		level.put("playerData", new JSONObject(playerMap));
		
		JSONArray entityArray = new JSONArray();
		for(Entity entity : entities) {
			HashMap<String, Object> entityMap = new HashMap<>();
			entityMap.put("type", entity.getType());
			entityMap.put("x", entity.getX());
			entityMap.put("y", entity.getY());
			entityArray.add(new JSONObject(entityMap));
		}
		JSONArray platformArray = new JSONArray();
		for(Platform platform : platforms) {
			HashMap<String, Object> data = new HashMap<>();
			data.put("x", platform.getX());
			data.put("y", platform.getY());
			data.put("width", platform.getWidth());
			data.put("height", platform.getHeight());
			platformArray.add(new JSONObject(data));
		}
		level.put("entities", entityArray);
		level.put("platforms", platformArray);
		json = new JSONObject(level);
		return json;
	}
	
	public HashMap<String, Object> getMap() {
		HashMap<String, Object> level = new HashMap<>();
		level.put("playLevel", true);
		level.put("ID", this.ID);
		level.put("timeLimit", this.timeLimit);
		level.put("deathPlane", this.maxYLimit+32);
		level.put("nextLevel", this.nextLevel);
		//level.put("background", this.background);
		
		HashMap<String, Integer> camMap = new HashMap<>();
		camMap.put("minX", camData.getMinX());
		camMap.put("minY", camData.getMinY());
		camMap.put("maxX", camData.getMaxX());
		camMap.put("maxY", camData.getMaxY());
		level.put("camData", new JSONObject(camMap));

		HashMap<String, Integer> playerMap = new HashMap<>();
		playerMap.put("x", playerData.getX());
		playerMap.put("y", playerData.getY());
		level.put("playerData", new JSONObject(playerMap));
		
		JSONArray entityArray = new JSONArray();
		for(Entity entity : entities) {
			HashMap<String, Object> entityMap = new HashMap<>();
			entityMap.put("tag", entity.getType());
			entityMap.put("x", entity.getX());
			entityMap.put("y", entity.getY());
			entityMap.put("ID", entity.getID());
			entityArray.add(new JSONObject(entityMap));
		}
		JSONArray platformArray = new JSONArray();
		for(Platform platform : platforms) {
			HashMap<String, Object> data = new HashMap<>();
			data.put("x", platform.getX());
			data.put("y", platform.getY());
			data.put("width", platform.getWidth());
			data.put("height", platform.getHeight());
			data.put("ID", platform.getID());
			platformArray.add(new JSONObject(data));
		}
		level.put("entities", entityArray);
		level.put("platforms", platformArray);
		return level;
	}
}
