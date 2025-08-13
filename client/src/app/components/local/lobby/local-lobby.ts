import { Component, inject, signal } from '@angular/core';
import { Lobby } from '../../lobby/lobby';
import { Colors, Player } from '../../../game/player';
import { NgStyle } from '@angular/common';
import { Router } from '@angular/router';
import { setLocalGameState } from '../../../game/session-store';

@Component({
	selector: 'app-local-lobby',
	imports: [Lobby, NgStyle],
	templateUrl: './local-lobby.html',
	styleUrl: './local-lobby.less'
})
export class LocalLobby {
	private router = inject(Router);
	playersColorIdxs: number[] = [-1, -1];
	Colors = Colors;
	countDown = signal(-1);
	countDownInterval = -1;

	isStartButtonDisabled() {
		return this.playersColorIdxs.length === 0 || this.playersColorIdxs.some(it => it === -1);
	}

	onColorSelect(playerIdx: number, colorIdx: number) {
		this.playersColorIdxs[playerIdx] = colorIdx;
	}

	toPlayers() {
		return this.playersColorIdxs.map((p, idx) => new Player(`p${idx}`, `Player ${idx}`, Colors[p]));
	}

	startGame() {
		this.countDown.set(1);

		this.countDownInterval = setInterval(() => {
			let cur = this.countDown();

			if(cur <= 0) {
				clearInterval(this.countDownInterval);
				setLocalGameState(this.toPlayers());
				this.router.navigate(["local", "game"]);
			} else {
				this.countDown.set(cur - 1);
			}
		}, 1000);
	}
}

