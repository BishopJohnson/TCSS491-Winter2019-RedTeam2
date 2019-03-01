
public class CameraData {

	private int minX;
	
	private int maxX;
	
	private int minY;
	
	private int maxY;
	
	public CameraData(int theMinX, int theMinY, int theMaxX, int theMaxY) {
		minX = theMinX;
		maxX = theMaxX;
		minY = theMinY;
		maxY = theMaxY;
	}
	
	public CameraData(int theMaxX, int theMaxY) {
		minX = 0;
		minY = 0;
		maxX = theMaxX;
		maxY = theMaxY;
	}

	public int getMinX() {
		return minX;
	}

	public void setMinX(int minX) {
		this.minX = minX;
	}

	public int getMaxX() {
		return maxX;
	}

	public void setMaxX(int maxX) {
		this.maxX = maxX;
	}

	public int getMinY() {
		return minY;
	}

	public void setMinY(int minY) {
		this.minY = minY;
	}

	public int getMaxY() {
		return maxY;
	}

	public void setMaxY(int maxY) {
		this.maxY = maxY;
	}
}
