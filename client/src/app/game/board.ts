export enum Entity {
	Path,
	PlankPath,
	Plank,
}

export enum Orient { H = "hori", V = "vert" }

export class Board {
	board: Entity[][];
	size: number;
	mid: number;

	constructor(size: number = 9) {
		this.size = size;
		this.mid = Math.floor(size / 2);
		this.board = [];

		const end = (size * 2) - 1;

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

	tryPlacePlank(y: number, x: number, orient: Orient) {
		if(this.canPlacePlank(y, x, orient)) {
			this.placePlank(y, x, orient);
		}
	}
}
