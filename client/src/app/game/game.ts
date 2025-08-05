import { Board, Orient } from "./board";
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

	placePlankOfCurPlayer(plankIdx: number, y: number, x: number, orient: Orient) {
		if(this.curPlayerIdx < 0 || this.curPlayerIdx >= this.players.length) return;
		this.board.placePlank(y, x, orient);
		this.players[this.curPlayerIdx].plankSlots.removePlank(plankIdx);
	}
}

export interface GameActions {
	changeTurn: () => void,
	tryMovePlayer: (player: Player, y: number, x: number) => boolean,
	placePlankOfCurPlayer: (plankIdx: number, y: number, x: number, orient: Orient) => void
}

