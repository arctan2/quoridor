import { Component, inject, signal } from '@angular/core';
import { WebsocketService } from '../../../websocket/websocket-service';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-lobby',
  imports: [NgClass],
  templateUrl: './create-lobby.html',
  styleUrl: './create-lobby.less'
})
export class CreateOnlineLobby {
	private router = inject(Router);
	ws: WebsocketService;

	constructor(ws: WebsocketService) { this.ws = ws; }

	curLobbySize = signal(2);

	onCreateClick() {
		this.ws.send("/app/lobby/create-lobby", this.curLobbySize());
	}

	ngOnInit() {
		this.ws.connect(() => this.onConnect());
	}

	onConnect() {
		this.ws.subscribe('/user/lobby/create-lobby-res', lobbyId => {
			this.router.navigate(["online", "join-lobby", lobbyId], { replaceUrl: true });
		});
	}

	ngOnDestroy() {
		this.ws.unsubscribe("/user/lobby/create-lobby-res");
	}
}
