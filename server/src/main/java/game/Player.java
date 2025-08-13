package game;

public class Player extends Coord {
	public String name;
	public String color;
	public String id;
	public String sessionId;
	public int planksLeft;

	public Coord end;

	public Player(String id, String sessionId, String name, String color, int plankSlotsCount) {
		super(-1, -1);
		this.id = id;
		this.name = name;
		this.color = color;
		this.planksLeft = plankSlotsCount;
		this.sessionId = sessionId;
		this.end = new Coord(-1, -1);
	}

	public boolean isAtEnd() {
		if(this.end.x == -1 && this.y == this.end.y) return true;
		if(this.end.y == -1 && this.x == this.end.x) return true;
		return false;
	}

	public void setStart(int y, int x, int boardLen) {
		this.y = y;
		this.x = x;

		int half = boardLen / 2;

		if(x == half) {
			if(y == 0) this.end.y = boardLen - 1;
			else this.end.y = 0;
		} else {
			if(x == 0) this.end.x = boardLen - 1;
			else this.end.x = 0;
		}
	}
}

