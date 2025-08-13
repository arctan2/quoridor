import { Component, Input } from '@angular/core';
import { PlayerInfo } from '../../game/player';
import { NgStyle } from '@angular/common';

@Component({
	selector: 'app-lobby',
	imports: [NgStyle],
	templateUrl: './lobby.html',
	styleUrl: './lobby.less'
})
export class Lobby {
	@Input() playerCount: number = 0;
	@Input() players: PlayerInfo[] = [];
}

