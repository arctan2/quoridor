import { Component, HostListener, inject, signal } from '@angular/core';
import { WebsocketService } from '../../../websocket/websocket-service';
import { ActivatedRoute, Router } from '@angular/router';
import { WsResponse } from '../../../types/response';
import { Lobby } from '../../lobby/lobby';
import { PlayerInfo } from '../../../game/player';
import { copyToClipboard } from '../../../ts/clipboard';
import { SessionStorageKey } from '../../../game/session-store';

interface LobbyInfo {
	lobbySize: number,
	players: PlayerInfo[],
}

interface LastJoineeData {
	id: string,
	lobbyInfo: LobbyInfo,
}


@Component({
  selector: 'app-online-lobby',
  imports: [Lobby],
  templateUrl: './online-lobby.html',
  styleUrl: './online-lobby.less'
})
export class OnlineLobby {
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	ws: WebsocketService;

	errMsg = signal("Loading...");

	isLinkCopied = signal(false);

	constructor(ws: WebsocketService) { this.ws = ws; }

	players = signal<PlayerInfo[]>([]);
	lobbySize = signal<number>(0);

	@HostListener('window:beforeunload', ['$event'])
	onWindowResize(event: Event) {
		event.preventDefault();
	}

	copyLink() {
		const id = this.route.snapshot.paramMap.get("id");
		copyToClipboard(`${location.protocol}//${location.host}/online/join-lobby/${id}`);
		this.isLinkCopied.set(true);
	}

	ngOnInit() {
		const dataStr = sessionStorage.getItem(SessionStorageKey.LastJoineeData);

		if(dataStr) {
			const data: LastJoineeData = JSON.parse(dataStr);

			this.players.set(data.lobbyInfo.players);
			this.lobbySize.set(data.lobbyInfo.lobbySize);

			sessionStorage.removeItem(SessionStorageKey.LastJoineeData);
			sessionStorage.setItem(SessionStorageKey.PlayerId, data.id);
			this.errMsg.set("");
			return;
		}

		if(!this.ws.connected()) {
			this.ws.connect(() => this.onConnect());
		} else {
			this.onConnect();
		}
	}

	onConnect() {
		const id = this.route.snapshot.paramMap.get("id");
		this.ws.subscribe("/user/lobby/info-res", dataStr => {
			const data: WsResponse<null | LobbyInfo> = JSON.parse(dataStr);

			if(data.err) {
				this.ws.disconnect();
				this.errMsg.set(data.msg);
				return;
			}

			if(data.data === null) {
				this.ws.disconnect();
				this.errMsg.set(data.msg);
				return;
			}

			this.errMsg.set("");

			this.players.set(data.data.players);
			this.lobbySize.set(data.data.lobbySize);
		});

		this.ws.subscribe("/user/lobby/player-connected", dataStr => {
			const data: WsResponse<PlayerInfo> = JSON.parse(dataStr);
			this.players.update((prev) => [...prev, data.data]);
		});

		this.ws.subscribe("/user/lobby/player-disconnected", dataStr => {
			const data: WsResponse<string> = JSON.parse(dataStr);
			this.players.update((prev) => prev.filter(p => p.id !== data.data));
		});

		this.ws.subscribe("/user/lobby/game-start", dataStr => {
			const data: WsResponse<string> = JSON.parse(dataStr);
			sessionStorage.setItem(SessionStorageKey.PlayerId, data.data);
		});

		this.ws.send(`/app/lobby/${id}/info`, null);
	}

	ngOnDestroy() {
		this.ws.unsubscribe("/user/lobby/info-res");
		this.ws.unsubscribe("/user/lobby/player-disconnected");
		this.ws.unsubscribe("/user/lobby/player-connected");
	}
}
