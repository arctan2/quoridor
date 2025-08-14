import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageKey } from '../../../game/session-store';
import { Game } from '../../game/game';
import { WebsocketService } from '../../../websocket/websocket-service';
import { GameActions, GameState } from '../../../game/game';
import { NgStyle } from '@angular/common';
import { WsResponse } from '../../../types/response';
import { Board } from '../../../game/board';
import { Coord, Player } from '../../../game/player';
import { OnlineGameActions } from './online-game-actions';

@Component({
  selector: 'app-online-game',
  imports: [Game, NgStyle],
  templateUrl: './online-game.html',
  styleUrl: './online-game.less'
})
export class OnlineGame {
	private router = inject(Router);
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

		this.game.set(game);
		this.actions.set(new OnlineGameActions(game, this.ws));
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

			console.log(res.data);

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

		this.ws.send(`/app/game/${this.gameId}/game-state`, null);
	}

	ngOnDestroy() {
		this.ws.unsubscribe("/user/game/game-state-res");
		this.ws.unsubscribe("/user/game/reconnect-res");
	}
}
