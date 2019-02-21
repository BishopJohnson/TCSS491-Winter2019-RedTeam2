
public class Entity {

	private String type;
	
	private int x;
	
	private int y;
	
	private int ID;

	public Entity(String type, int x, int y, int id) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.ID = id;
	}

	public Entity(String type, int x, int y) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.ID = 0;
	}
	
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public int getX() {
		return x;
	}

	public void setX(int x) {
		this.x = x;
	}

	public int getY() {
		return y;
	}

	public void setY(int y) {
		this.y = y;
	}
	
	public void setID(int id) {
		this.ID = id;
	}
	
	public int getID() {
		return ID;
	}
}
