export enum Entity {
	Path = "Path",
	PlankPath = "PlankPath",
	Plank = "Plank",
}

export enum Orient { H = "hori", V = "vert" }

export class Board {
	board: Entity[][];
	mid: number;

	constructor(boardSize: number = 9) {
		if(boardSize % 2 === 0) throw Error("boardSize can't be even");

		const end = (boardSize * 2) - 1;
		this.mid = boardSize - 1;
		this.board = [];

		for (let i = 0; i < end; i++) {
			let row = [];
			if(i % 2 !== 0) {
				for (let j = 0; j < end; j++) {
					row.push(Entity.PlankPath);
				}
			} else {
				for (let j = 0; j < end; j++) {
					if(j % 2 !== 0) {
						row.push(Entity.PlankPath);
					} else {
						row.push(Entity.Path);
					}
				}
			}
			this.board.push(row);
		}
	}

	isYXInBounds(y: number, x: number) {
		const rows = this.board.length;
		const cols = this.board[0].length;

		return (0 <= y && y < rows) && (0 <= x && x < cols);
	}

	isYXPlank(y: number, x: number) {
		return this.board[y][x] === Entity.Plank;
	}

	canPlacePlank(y: number, x: number, orient: Orient): boolean {
		if(Number.isNaN(x) || Number.isNaN(y)) return false;

		const board = this.board;
		if(orient === Orient.V) {
			return board[y][x] === Entity.PlankPath &&
				board[y + 1][x] === Entity.PlankPath &&
				board[y + 2][x] === Entity.PlankPath;
		} else {
			return board[y][x] === Entity.PlankPath &&
				board[y][x + 1] === Entity.PlankPath &&
				board[y][x + 2] === Entity.PlankPath;
		}
	}

	placePlank(y: number, x: number, orient: Orient) {
		if(orient === Orient.V) {
			this.board[y][x] = Entity.Plank;
			this.board[y + 1][x] = Entity.Plank;
			this.board[y + 2][x] = Entity.Plank;
		} else {
			this.board[y][x] = Entity.Plank;
			this.board[y][x + 1] = Entity.Plank;
			this.board[y][x + 2] = Entity.Plank;
		}
	}

	unplacePlank(y: number, x: number, orient: Orient) {
		if(orient === Orient.V) {
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
