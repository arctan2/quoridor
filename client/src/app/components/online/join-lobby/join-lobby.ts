import { Component, HostListener, inject, signal } from '@angular/core';
import { WebsocketService } from '../../../websocket/websocket-service';
import { ActivatedRoute, Router } from '@angular/router';
import { WsResponse } from '../../../types/response';
import { NgClass, NgStyle, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionStorageKey } from '../../../game/session-store';

@Component({
  selector: 'app-join-lobby',
  imports: [NgStyle, FormsModule, NgClass],
  templateUrl: './join-lobby.html',
  styleUrl: './join-lobby.less'
})
export class JoinLobby {
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	ws: WebsocketService;

	availableColors = signal<string[]>([]);

	curSelectedColor = signal<string>("");
	errMsg = signal("Loading...");
	inputErrMsg = signal("");
	playerName = "";

	constructor(ws: WebsocketService, private location: Location) { this.ws = ws; }

	@HostListener('window:beforeunload', ['$event'])
	onWindowResize(event: Event) {
		if(this.errMsg() === "") {
			event.preventDefault();
		}
	}

	onJoinClick() {
		this.inputErrMsg.set("");
		if(this.curSelectedColor() === "") {
			this.inputErrMsg.set("Please select a color.");
			return;
		}

		if(this.playerName.trim() === "") {
			this.inputErrMsg.set("Please enter player name.");
			return;
		}

		const id = this.route.snapshot.paramMap.get("id");
		this.ws.send(`/app/lobby/${id}/join`, { name: this.playerName.trim(), color: this.curSelectedColor() });
	}

	ngOnInit() {
		if(!this.ws.connected()) {
			this.ws.connect(() => this.onConnect());
		} else {
			this.onConnect();
		}
	}

	onConnect() {
		const id = this.route.snapshot.paramMap.get("id");
		this.ws.subscribe(`/user/lobby/available-colors-res`, dataStr => {
			const data: WsResponse<string[] | null> = JSON.parse(dataStr);

			if(data.err) {
				this.errMsg.set(data.msg);
				this.ws.disconnect();
				return;
			}

			if(data.data === null) {
				this.errMsg.set("received no data from server.");
				this.ws.disconnect();
				return;
			}

			this.errMsg.set("");

			this.availableColors.set(data.data);
		});

		this.ws.subscribe(`/user/lobby/join-res`, dataStr => {
			const data: WsResponse<string | null> = JSON.parse(dataStr);

			if(data.err) {
				if(data.msg === "The color is already taken.") {
					this.availableColors.update(colors => colors.filter((c: string) => c !== this.curSelectedColor()));
					if(this.availableColors().length === 0) {
						alert("Lobby is full.");
						this.location.back();
					} else {
						alert("The color is already taken. Please pick another color");
					}
				} else {
					this.errMsg.set(data.msg);
				}
				this.ws.disconnect();
				return;
			}

			this.errMsg.set("");

			const id = this.route.snapshot.paramMap.get("id");
			if(data.data !== null) {
				sessionStorage.setItem(SessionStorageKey.LastJoineeData, JSON.stringify(data.data));
			}
			this.router.navigate(["online", "lobby", id], { replaceUrl: true });
		});

		this.ws.send(`/app/lobby/${id}/available-colors`, null);
	}

	ngOnDestroy() {
		this.ws.unsubscribe("/user/lobby/available-colors-res");
	}
}
