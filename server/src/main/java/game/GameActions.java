package game;

public interface GameActions {
	public void changeTurn();
	public void movePlayerById(String id, int y, int x);
	public void placePlankOfPlayer(String pid, int y, int x, Board.Orient orient);
	public boolean canPlacePlank(int y, int x, Board.Orient orient);
}
