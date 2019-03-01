
public class Platform {

	private int myId;
	
	private int x;
	
	private int y;
	
	private int width;
	
	private int height;

	public Platform(int x, int y, int width, int height, int id) {
		super();
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.myId = id;
	}

	public Platform() {
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.myId = 0;
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

	public int getWidth() {
		return width;
	}

	public void setWidth(int width) {
		this.width = width;
	}

	public int getHeight() {
		return height;
	}

	public void setHeight(int height) {
		this.height = height;
	}
	
	public void increaseHeight() {
		this.height+=32;
	}
	
	public void increaseWidth() {
		this.width+=32;
	}
	
	public int getID() {
		return myId;
	}
	
	public void setID(int id) {
		myId = id;
	}
}
