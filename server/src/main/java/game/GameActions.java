package game;

public interface GameActions {
	public void changeTurn();
	public void movePlayerBySessionId(String id, int y, int x);
	public void placePlankBySessionId(String sessionId, int y, int x, Board.Orient orient);
}
