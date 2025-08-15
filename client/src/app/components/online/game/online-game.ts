import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SessionStorageKey } from '../../../game/session-store';
import { Game } from '../../game/game';
import { WebsocketService } from '../../../websocket/websocket-service';
import { GameActions, GameState } from '../../../game/game';
import { NgStyle } from '@angular/common';
import { WsResponse } from '../../../types/response';
import { Board, Orient } from '../../../game/board';
import { Coord, Player } from '../../../game/player';
import { OnlineGameActions } from './online-game-actions';

@Component({
  selector: 'app-online-game',
  imports: [Game, NgStyle],
  templateUrl: './online-game.html',
  styleUrl: './online-game.less'
})
export class OnlineGame {
	private route = inject(ActivatedRoute);
	private playerId: string = "";
	private gameId: string = "";
	game = signal<GameState | null>(null);
	actions = signal<GameActions | null>(null);
	Math = Math;

	ws: WebsocketService;

	errMsg = signal("Loading...");

	constructor(ws: WebsocketService) { this.ws = ws; }

	ngOnInit() {
		this.gameId = this.route.snapshot.paramMap.get("id") || "";
		this.playerId = sessionStorage.getItem(SessionStorageKey.PlayerId) || "";

		if(!this.ws.connected()) {
			this.ws.connect(() => this.onConnect());
		} else {
			this.onConnect();
		}
	}

	reconnect() {
		this.ws.sendStr(`/app/game/${this.gameId}/reconnect`, this.playerId);
	}

	initGame(gameData: GameState) {
		const game = new GameState;

		game.board = new Board;
		game.board.board = gameData.board.board;
		game.board.mid = gameData.board.mid;

		game.players = [];

		for(const player of gameData.players) {
			const p = new Player(player.id, player.name, player.color);
			p.planksLeft.set(player.planksLeft as any);
			p.x = player.x;
			p.y = player.y;
			p.end = new Coord(player.end.y, player.end.x);
			game.players.push(p);
		}

		for(const player of gameData.ranks) {
			const p = new Player(player.id, player.name, player.color);
			game.ranks.push(p);
		}

		game.curPlayerIdx.set(gameData.curPlayerIdx as any);
		game.isGameOver.set(gameData.isGameOver as any);

		if(gameData.players[gameData.curPlayerIdx as any].id !== this.playerId) {
			game.isStopInput.set(true);
		}

		this.game.set(game);
		this.actions.set(new OnlineGameActions(this.gameId, game, this.ws));
	}

	onConnect() {
		this.ws.subscribe("/user/game/game-state-res", resStr => {
			const res: WsResponse<GameState> = JSON.parse(resStr);

			if(res.err) {
				if(res.msg === "You are not authorized to the game.") {
					this.reconnect();
					return;
				}
				this.ws.disconnect();
				this.errMsg.set(res.msg);
				return;
			}

			this.errMsg.set("");

			this.initGame(res.data);
		});

		this.ws.subscribe("/user/game/reconnect-res", resStr => {
			const res: WsResponse<null> = JSON.parse(resStr);

			if(res.err) {
				this.ws.disconnect();
				this.errMsg.set(res.msg);
				return;
			}

			this.errMsg.set("");

			this.ws.send(`/app/game/${this.gameId}/game-state`, null);
		});

		this.ws.subscribe("/user/game/move-player", (resStr) => {
			const res: WsResponse<{
				coord: Coord,
				playerId: string,
				newCurPlayerId: string
			}> = JSON.parse(resStr);

			if(res.err) {
				this.ws.disconnect();
				this.errMsg.set(res.msg);
				return;
			}

			const game = this.game();

			if(game === null) return;

			if(this.playerId !== res.data.playerId) {
				game.movePlayerById(res.data.playerId, res.data.coord.y, res.data.coord.x);
			}

			game.setCurTurnIdxByPlayerId(res.data.newCurPlayerId);
			if(res.data.newCurPlayerId === this.playerId) {
				game.isStopInput.set(false);
			}
			game.updatePlayerPosHash();
		});

		this.ws.subscribe("/user/game/game-over", (resStr) => {
			const ranks: Player[] = JSON.parse(resStr);

			const game = this.game();

			if(game === null) return;

			game.ranks = ranks;
			game.isGameOver.set(true);
			game.isStopInput.set(false);
		});

		this.ws.subscribe("/user/game/place-plank", (resStr) => {
			const res: WsResponse<{
				y: number,
				x: number,
				orient: Orient,
				playerId: string,
				newCurPlayerId: string,
			}> = JSON.parse(resStr);

			if(res.err) {
				this.ws.disconnect();
				this.errMsg.set(res.msg);
				return;
			}

			const game = this.game();

			if(game === null) return;

			if(this.playerId !== res.data.playerId) {
				game.placePlankOfPlayer(res.data.playerId, res.data.y, res.data.x, res.data.orient);
			}

			game.setCurTurnIdxByPlayerId(res.data.newCurPlayerId);

			if(res.data.newCurPlayerId === this.playerId) {
				game.isStopInput.set(false);
			}
		});

		this.ws.send(`/app/game/${this.gameId}/game-state`, null);
	}

	ngOnDestroy() {
		this.ws.unsubscribe("/user/game/game-state-res");
		this.ws.unsubscribe("/user/game/reconnect-res");
		this.ws.unsubscribe("/user/game/move-player");
		this.ws.unsubscribe("/user/game/place-plank");
		this.ws.unsubscribe("/user/game/game-over");
	}
}
