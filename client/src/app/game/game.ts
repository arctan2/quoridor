import { Board } from "./board";
import { Coord, Player } from "./player";

export class GameState implements GameActions {
	board: Board;
	players: Player[];
	curPlayerIdx: number = -1;

	constructor() {
		this.board = new Board;
		this.players = [];
	}

	initPlayers(players: Player[]) {
		const playerPos = [
			new Coord(this.board.mid, 0),
			new Coord(this.board.mid, this.board.size - 1),
			new Coord(0, this.board.mid),
			new Coord(this.board.size - 1, this.board.mid),
		];

		for(let i = 0; i < players.length; i++) {
			players[i].setStart(playerPos[i].x, playerPos[i].y, this.board.size);
		}

		this.players = players;
	}

	changeTurn() {
		this.curPlayerIdx++;
		if (this.curPlayerIdx >= this.players.length) {
			this.curPlayerIdx = 0;
		}
	}

	tryMovePlayer(player: Player, y: number, x: number) {
		return false;
	}

	placeObstacle(y: number, x: number) {
	}
}

export interface GameActions {
	changeTurn: () => void,
	tryMovePlayer: (player: Player, y: number, x: number) => boolean,
	placeObstacle: (y: number, x: number) => void
}

