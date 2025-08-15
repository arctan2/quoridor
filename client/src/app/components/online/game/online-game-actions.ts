import { Orient } from "../../../game/board";
import { GameActions, GameState } from "../../../game/game";
import { WebsocketService } from "../../../websocket/websocket-service";

export class OnlineGameActions implements GameActions{
	gameId: string;
	game: GameState;
	ws: WebsocketService;

	constructor(gameId: string, game: GameState, ws: WebsocketService) {
		this.game = game;
		this.ws = ws;
		this.gameId = gameId;
	}

	changeTurn() {
	}

	movePlayerById(id: string, y: number, x: number) {
		this.game.movePlayerById(id, y, x);
		this.ws.send(`/app/game/${this.gameId}/move-player`, { y, x });
		this.game.isStopInput.set(true);
	}

	placePlankOfPlayer(pid: string, y: number, x: number, orient: Orient) {
		this.game.placePlankOfPlayer(pid, y, x, orient);
		this.ws.send(`/app/game/${this.gameId}/place-plank`, { y, x, orient });
		this.game.isStopInput.set(true);
	}
}
