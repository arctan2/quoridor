package game;

public class Board {
	public static enum Entity {
		Path,
		PlankPath,
		Plank,
	};

	public static enum Orient { H, V };

	public Entity[][] board;
	int mid;

	Board(int boardSize) {
		if(boardSize % 2 == 0) throw new IllegalArgumentException("boardSize can't be even");

		int end = (boardSize * 2) - 1;
		this.mid = boardSize - 1;
		this.board = new Entity[end][end];

		for (int i = 0; i < end; i++) {
			Entity[] row = new Entity[end];

			if(i % 2 != 0) {
				for(int j = 0; j < end; j++) {
					row[j] = Entity.PlankPath;
				}
			} else {
				for (int j = 0; j < end; j++) {
					if(j % 2 != 0) {
						row[j] = Entity.PlankPath;
					} else {
						row[j] = Entity.Path;
					}
				}
			}
			this.board[i] = row;
		}
	}

	boolean isYXInBounds(int y, int x) {
		int rows = this.board.length;
		int cols = this.board[0].length;

		return (0 <= y && y < rows) && (0 <= x && x < cols);
	}

	boolean isYXPlank(int y, int x) {
		return this.board[y][x] == Entity.Plank;
	}

	boolean canPlacePlank(int y, int x, Board.Orient orient) {
		if(!this.isYXInBounds(y, x)) return false;

		Entity[][] board = this.board;
		if(orient == Orient.V) {
			return board[y][x] == Entity.PlankPath &&
				board[y + 1][x] == Entity.PlankPath &&
				board[y + 2][x] == Entity.PlankPath;
		} else {
			return board[y][x] == Entity.PlankPath &&
				board[y][x + 1] == Entity.PlankPath &&
				board[y][x + 2] == Entity.PlankPath;
		}
	}

	void placePlank(int y, int x, Orient orient) {
		if(orient == Orient.V) {
			this.board[y][x] = Entity.Plank;
			this.board[y + 1][x] = Entity.Plank;
			this.board[y + 2][x] = Entity.Plank;
		} else {
			this.board[y][x] = Entity.Plank;
			this.board[y][x + 1] = Entity.Plank;
			this.board[y][x + 2] = Entity.Plank;
		}
	}

	void unplacePlank(int y, int x, Orient orient) {
		if(orient == Orient.V) {
			this.board[y][x] = Entity.PlankPath;
			this.board[y + 1][x] = Entity.PlankPath;
			this.board[y + 2][x] = Entity.PlankPath;
		} else {
			this.board[y][x] = Entity.PlankPath;
			this.board[y][x + 1] = Entity.PlankPath;
			this.board[y][x + 2] = Entity.PlankPath;
		}
	}
}
