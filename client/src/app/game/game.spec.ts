import { Orient } from './board';
import { GameState } from './game';
import { Colors, Coord, Player } from './player';

describe('Game', () => {
	let game: GameState;
	let players: Player[];

	beforeEach(() => {
		players = [0, 1, 2, 3].map((p, idx) => new Player(`Player ${idx}`, Colors[p]));
		game = new GameState;
		game.initPlayers(players);
		game.curPlayerIdx.set(0);
	});

	it('all empty', () => {
		game.players = [];
		const check = (y: number, x: number, toExpect: Coord[]) => {
			const possible = game.possibleMoves(y, x);

			expect(possible.length).toBe(toExpect.length);

			for(const coord of possible) {
				const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
				expect(idx).not.toBe(-1);
				toExpect.splice(idx, 1);
			}
		}

		for(let i = 0; i < game.board.board.length; i++) {
			for(let j = 0; j < game.board.board.length; j++) {
				let coords: Coord[] = [];

				const arr = [
					[i - 2, j],
					[i, j + 2],
					[i + 2, j],
					[i, j - 2]
				];

				for(const [y, x] of arr) {
					if(game.board.isYXInBounds(y, x)) coords.push(new Coord(y, x));
				}

				check(i, j, coords);
			}
		}
	});

	it('player movement with 2 possible moves', () => {
		game.board.placePlank(5, 4, Orient.H);
		game.board.placePlank(6, 5, Orient.V);
		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player with 1 possible move', () => {
		game.board.placePlank(5, 4, Orient.H);
		game.board.placePlank(7, 6, Orient.H);
		game.board.placePlank(6, 5, Orient.V);
		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(6, 8)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement', () => {
		game.players[0].y = 4; game.players[0].x = 6;

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(2, 6), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank (diag)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 4), new Coord(4, 8), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by 2 plank (diag-right)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.board.placePlank(3, 4, Orient.H);
		game.board.placePlank(4, 5, Orient.V);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 8), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by 2 plank (diag-left)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.board.placePlank(3, 4, Orient.H);
		game.board.placePlank(4, 7, Orient.V);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 4), new Coord(6, 4), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by 3 plank (both diags blocked)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.board.placePlank(3, 4, Orient.H);
		game.board.placePlank(4, 7, Orient.V);
		game.board.placePlank(4, 5, Orient.V);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by player', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 2; game.players[1].x = 6;

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 4), new Coord(4, 8), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank + player (diag right)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 4; game.players[1].x = 4;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 8), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank + player (diag left)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 4; game.players[1].x = 8;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 4), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank + 2 player (both diag blocked)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 4; game.players[1].x = 8;
		game.players[2].y = 4; game.players[2].x = 4;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank + 3 player (both diag blocked)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 4; game.players[1].x = 8;
		game.players[2].y = 4; game.players[2].x = 4;
		game.players[3].y = 2; game.players[3].x = 6;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('player jump over player movement blocked by plank + 3 player (both diag blocked)', () => {
		game.players[0].y = 4; game.players[0].x = 6;
		game.players[1].y = 4; game.players[1].x = 8;
		game.players[3].y = 2; game.players[3].x = 6;
		game.board.placePlank(3, 4, Orient.H);

		const possible = game.possibleMoves(6, 6);
		const toExpect = [new Coord(4, 4), new Coord(6, 4), new Coord(6, 8), new Coord(8, 6)];

		expect(possible.length).toBe(toExpect.length);

		for(const coord of possible) {
			const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
			expect(idx).not.toBe(-1);
			toExpect.splice(idx, 1);
		}
	});

	it('jumping over player on edge of board', () => {
		const check = (y: number, x: number, toExpect: Coord[]) => {
			const possible = game.possibleMoves(y, x);

			expect(possible.length).toBe(toExpect.length);

			for(const coord of possible) {
				const idx = toExpect.findIndex((it) => it.x === coord.x && it.y === coord.y);
				expect(idx).not.toBe(-1);
				toExpect.splice(idx, 1);
			}
		}

		game.players[0].y = 12; game.players[0].x = 14;
		game.players[1].y = 12; game.players[1].x = 16;

		check(12, 14, [new Coord(10, 16), new Coord(14, 16), new Coord(12, 12), new Coord(10, 14), new Coord(14, 14)]);

		game.players[0].y = 14; game.players[0].x = 2;
		game.players[1].y = 16; game.players[1].x = 2;

		check(14, 2, [new Coord(16, 0), new Coord(16, 4), new Coord(14, 0), new Coord(14, 4), new Coord(12, 2)]);

		game.players[0].y = 0; game.players[0].x = 0;
		game.players[1].y = 2; game.players[1].x = 0;

		check(2, 0, [new Coord(4, 0), new Coord(2, 2), new Coord(0, 2)]);
	});
});
