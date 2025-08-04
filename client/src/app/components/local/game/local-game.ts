import { Component, inject } from '@angular/core';
import { Game } from '../../game/game';
import { GameActions, GameState } from '../../../game/game';
import { getLocalGameState } from '../../../game/session-store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-local-game',
  imports: [Game],
  templateUrl: './local-game.html',
  styleUrl: './local-game.less'
})
export class LocalGame {
	private router = inject(Router);

	game: GameState | null = null;
	actions: GameActions | null = null;

	ngOnInit() {
		const players = getLocalGameState();
		if(players === null) {
			this.router.navigate(["/"], { replaceUrl: true });
			return;
		}
		this.game = new GameState;
		this.actions = this.game;
		this.game.initPlayers(players);

		console.log(this.game);
	}
}
