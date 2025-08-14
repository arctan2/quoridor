import { Orient } from "../../../game/board";
import { GameActions, GameState } from "../../../game/game";
import { WebsocketService } from "../../../websocket/websocket-service";

export class OnlineGameActions implements GameActions{
	game: GameState;
	ws: WebsocketService;

	constructor(game: GameState, ws: WebsocketService) {
		this.game = game;
		this.ws = ws;
	}

	changeTurn() {
		this.game.changeTurn();
	}

	movePlayerById(id: string, y: number, x: number) {
		this.game.movePlayerById(id, y, x);
	}

	placePlankOfPlayer(pid: string, y: number, x: number, orient: Orient) {
		this.game.placePlankOfPlayer(pid, y, x, orient);
	}
}
