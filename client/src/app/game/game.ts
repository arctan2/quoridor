import { signal, WritableSignal } from "@angular/core";
import { Board, Orient } from "./board";
import { Coord, Player } from "./player";

export class GameState implements GameActions {
	board: Board = new Board;
	players: Player[] = [];
	ranks: Player[] = [];
	curPlayerIdx: WritableSignal<number> = signal(-1);
	isStopInput: WritableSignal<boolean> = signal(false);
	isGameOver: WritableSignal<boolean> = signal(false);

	initPlayers(players: Player[]) {
		const playerPos = [
			new Coord(this.board.board.length - 1, this.board.mid),
			new Coord(0, this.board.mid),
			new Coord(this.board.mid, 0),
			new Coord(this.board.mid, this.board.board.length - 1),
		];

		for(let i = 0; i < players.length; i++) {
			players[i].setStart(playerPos[i].y, playerPos[i].x, this.board.board.length);
		}

		this.players = players;
	}

	changeTurn() {
		this.curPlayerIdx.update(v => {
			let temp = v + 1;
			if(temp >= this.players.length) {
				temp = 0;
			}
			while(this.players[temp].isAtEnd()) {
				temp++;
				if(temp >= this.players.length) temp = 0;
				if(temp === v) return temp;
			}
			return temp;
		});
	}

	isYXPlayer(y: number, x: number) {
		for(const p of this.players) {
			if(p.x === x && p.y === y) return true;
		}

		return false;
	}

	possibleMoves(fromY: number, fromX: number): Coord[] {
		const coords: Coord[] = [];
		const checks = [
			{
				plankCheck: [0, 1],
				diagCheck: [[1, 0], [-1, 0]]
			},
			{
				plankCheck: [0, -1],
				diagCheck: [[1, 0], [-1, 0]]
			},
			{
				plankCheck: [1, 0],
				diagCheck: [[0, 1], [0, -1]]
			},
			{
				plankCheck: [-1, 0],
				diagCheck: [[0, 1], [0, -1]]
			},
		];

		for(const { plankCheck, diagCheck } of checks) {
			let curY = fromY + plankCheck[0];
			let curX = fromX + plankCheck[1];

			if(!this.board.isYXInBounds(curY, curX) || this.board.isYXPlank(curY, curX)) continue;
			curY += plankCheck[0];
			curX += plankCheck[1];

			if(!this.board.isYXInBounds(curY, curX)) {
				continue;
			}

			if(!this.isYXPlayer(curY, curX)) {
				coords.push(new Coord(curY, curX));
				continue;
			}

			let cy = curY + plankCheck[0];
			let cx = curX + plankCheck[1];


			if(this.board.isYXInBounds(cy, cx) && !this.board.isYXPlank(cy, cx)) {
				cy += plankCheck[0];
				cx += plankCheck[1];

				if(!this.isYXPlayer(cy, cx)) {
					coords.push(new Coord(cy, cx));
					continue;
				}
			}

			for(const diag of diagCheck) {
				cy = curY + diag[0];
				cx = curX + diag[1];

				if(!this.board.isYXInBounds(cy, cx) || this.board.isYXPlank(cy, cx)) {
					continue;
				}

				cy += diag[0];
				cx += diag[1];

				if(!this.isYXPlayer(cy, cx)) {
					coords.push(new Coord(cy, cx));
				}
			}
		}

		return coords;
	}

	dfs(curY: number, curX: number, end: Coord, visited: Set<string>): boolean {
		if(!this.board.isYXInBounds(curY, curX)) return false;
		visited.add(`${curY}_${curX}`);

		if(end.x === -1 && curY === end.y) return true;
		if(end.y === -1 && curX === end.x) return true;

		const possible = this.possibleMoves(curY, curX);

		for(const p of possible) {
			if(!visited.has(`${p.y}_${p.x}`)) {
				if(this.dfs(p.y, p.x, end, visited)) {
					return true;
				}
			}
		}

		return false;
	}

	canPlacePlank(y: number, x: number, orient: Orient): boolean {
		if(!this.board.canPlacePlank(y, x, orient)) {
			return false;
		}

		this.board.placePlank(y, x, orient);

		for(const p of this.players) {
			if(!this.dfs(p.y, p.x, p.end, new Set)) {
				this.board.unplacePlank(y, x, orient);
				return false;
			}
		}

		this.board.unplacePlank(y, x, orient);

		return true;
	}

	checkIsGameOver() {
		if(this.ranks.length === this.players.length - 1) {
			for(const p of this.players) {
				if(this.ranks.findIndex(r => r.id === p.id) === -1) {
					this.ranks.push(p);
					this.isGameOver.set(true);
					return;
				}
			}
		}
	}

	movePlayerById(id: string, y: number, x: number) {
		for(const p of this.players) {
			if(p.id === id) {
				p.y = y;
				p.x = x;
				if(p.isAtEnd()) {
					this.ranks.push(p);
				}
				break;
			}
		}
	}

	placePlankOfPlayer(pid: string, y: number, x: number, orient: Orient) {
		const playerIdx = this.players.findIndex(p => p.id === pid);
		if(playerIdx === -1) return;
		this.board.placePlank(y, x, orient);
		this.players[playerIdx].planksLeft.update(v => Math.max(v - 1, 0));
	}
}

export interface GameActions {
	changeTurn: () => void,
	movePlayerById: (id: string, y: number, x: number) => void,
	placePlankOfPlayer: (pid: string, y: number, x: number, orient: Orient) => void
	canPlacePlank: (y: number, x: number, orient: Orient) => boolean;
}

