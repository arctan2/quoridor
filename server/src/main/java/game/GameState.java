package game;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class GameState implements GameActions {
	public Board board = new Board(9);
	public List<Player> players = new ArrayList<>();
	public List<Player> ranks = new ArrayList<>();
	public int curPlayerIdx = -1;
	public boolean isStopInput = false;
	public boolean isGameOver = false;

	public GameState(List<Player> players) {
		Coord[] playerPos = {
			new Coord(this.board.board.length - 1, this.board.mid),
			new Coord(0, this.board.mid),
			new Coord(this.board.mid, 0),
			new Coord(this.board.mid, this.board.board.length - 1)
		};

		for (int i = 0; i < players.size(); i++) {
			players.get(i).setStart(playerPos[i].y, playerPos[i].x, this.board.board.length);
		}

		this.players = players;
		this.curPlayerIdx = 0;
	}

	@Override
	public void changeTurn() {
		int temp = curPlayerIdx + 1;
		if (temp >= this.players.size()) {
			temp = 0;
		}
		while (this.players.get(temp).isAtEnd()) {
			temp++;
			if (temp >= this.players.size())
				temp = 0;
			if (temp == curPlayerIdx)
				break;
		}
		curPlayerIdx = temp;
	}

	boolean isYXPlayer(int y, int x) {
		for (Player p : this.players) {
			if (p.x == x && p.y == y)
				return true;
		}

		return false;
	}

	static int[][] plankChecks = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

	static int[][][] diagChecks = {
		{{1, 0}, {-1, 0}},
		{{1, 0}, {-1, 0}},
		{{0, 1}, {0, -1}},
		{{0, 1}, {0, -1}}
	};

	public boolean isPlayerSessionIdValid(String sessionId) {
		for(Player p : players) {
			if(p.sessionId.equals(sessionId)) {
				return true;
			}
		}

		return false;
	}

	public void updateSessionIdOfPlayerId(String playerId, String sessionId) {
		for(Player p : players) {
			if(p.id.equals(playerId)) {
				p.setSessionId(sessionId);
				break;
			}
		}
	}

	List<Coord> possibleMoves(int fromY, int fromX) {
		List<Coord> coords = new ArrayList<>();

		for(int i = 0; i < plankChecks.length; i++) {
			int[] plankCheck = plankChecks[i];
			int curY = fromY + plankCheck[0];
			int curX = fromX + plankCheck[1];

			if(!this.board.isYXInBounds(curY, curX) || this.board.isYXPlank(curY, curX)) continue;
			curY += plankCheck[0];
			curX += plankCheck[1];

			if(!this.board.isYXInBounds(curY, curX)) {
				continue;
			}

			if(!this.isYXPlayer(curY, curX)) {
				coords.add(new Coord(curY, curX));
				continue;
			}

			int cy = curY + plankCheck[0];
			int cx = curX + plankCheck[1];


			if(this.board.isYXInBounds(cy, cx) && !this.board.isYXPlank(cy, cx)) {
				cy += plankCheck[0];
				cx += plankCheck[1];

				if(!this.isYXPlayer(cy, cx)) {
					coords.add(new Coord(cy, cx));
					continue;
				}
			}

			for(int[] diag : diagChecks[i]) {
				cy = curY + diag[0];
				cx = curX + diag[1];

				if(!this.board.isYXInBounds(cy, cx) || this.board.isYXPlank(cy, cx)) {
					continue;
				}

				cy += diag[0];
				cx += diag[1];

				if(!this.isYXPlayer(cy, cx)) {
					coords.add(new Coord(cy, cx));
				}
			}
		}

		return coords;
	}

	boolean dfs(int curY, int curX, Coord end, Set<String> visited) {
		if(!this.board.isYXInBounds(curY, curX)) return false;
		visited.add(String.format("%d_%d", curY, curX));

		if(end.x == -1 && curY == end.y) return true;
		if(end.y == -1 && curX == end.x) return true;

		List<Coord> possible = this.possibleMoves(curY, curX);

		for(Coord p : possible) {
			if(!visited.contains(String.format("%d_%d", p.y, p.x))) {
				if(this.dfs(p.y, p.x, end, visited)) {
					return true;
				}
			}
		}

		return false;
	}

	public boolean canPlacePlank(int y, int x, Board.Orient orient) {
		if(!this.board.canPlacePlank(y, x, orient)) {
			return false;
		}

		this.board.placePlank(y, x, orient);

		for(Player p : this.players) {
			if(!this.dfs(p.y, p.x, p.end, new HashSet<String>())) {
				this.board.unplacePlank(y, x, orient);
				return false;
			}
		}

		this.board.unplacePlank(y, x, orient);

		return true;
	}

	int ranksIndexOfId(String id) {
		int pos = 0;

		for(Player p : this.ranks) {
			if(p.id.equals(id)) return pos;
			pos++;
		}

		return -1;
	}

	int playersIndexOfId(String id) {
		int pos = 0;

		for(Player p : this.players) {
			if(p.id.equals(id)) return pos;
			pos++;
		}

		return -1;
	}

	void checkIsGameOver() {
		if(this.ranks.size() == this.players.size() - 1) {
			for(Player p : this.players) {
				if(this.ranksIndexOfId(p.id) == -1) {
					this.ranks.add(p);
					this.isGameOver = true;
					return;
				}
			}
		}
	}

	@Override
	public void movePlayerById(String id, int y, int x) {
		for(Player p : this.players) {
			if(p.id == id) {
				p.y = y;
				p.x = x;
				if(p.isAtEnd()) {
					this.ranks.add(p);
				}
				break;
			}
		}
	}

	@Override
	public void placePlankOfPlayer(String pid, int y, int x, Board.Orient orient) {
		int playerIdx = this.playersIndexOfId(pid);
		if(playerIdx == -1) return;
		this.board.placePlank(y, x, orient);
		this.players.get(playerIdx).planksLeft--;
		if(this.players.get(playerIdx).planksLeft < 0) {
			this.players.get(playerIdx).planksLeft = 0;
		}
	}
}
