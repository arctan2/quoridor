export enum Entity {
	Path,
	Plank,
}

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
			for (let j = 0; j < end; j++) {
				row.push(Entity.Path);
			}
			this.board.push(row);
		}
	}

	placeObstacle(y: number, x: number) {
		this.board[y][x] = Entity.Plank;
	}
}
