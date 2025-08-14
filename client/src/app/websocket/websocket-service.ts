import { Injectable, signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';

@Injectable({
	providedIn: 'root'
})
export class WebsocketService {
	private stompClient: Client = new Client({
		brokerURL: 'ws://localhost:8080/ws',
		reconnectDelay: 0,
	});
	connected = signal<boolean>(false);
	errorMsg = signal<string | null>(null);

	connect(onConnect?: () => void): void {
		if (this.connected()) return;

		this.errorMsg.set(null);

		this.stompClient.activate();

		this.stompClient.onStompError = (err) => {
			this.errorMsg.set("Error: " + err);
			this.connected.set(false);
		}

		this.stompClient.onWebSocketError = () => {
			this.errorMsg.set("Cannot connect to server.");
			this.connected.set(false);
		}

		const onClose = () => {
			if(this.connected()) {
				this.errorMsg.set("Connection was closed.");
				this.connected.set(false);
			}
		}

		this.stompClient.onDisconnect = onClose;
		this.stompClient.onWebSocketClose = onClose;

		this.stompClient.onConnect = () => {
			this.errorMsg.set("");
			this.connected.set(true);
			if(onConnect) {
				onConnect();
			}
		};
	}

	subscribe(topic: string, callback: (msg: string) => void): void {
		if (!this.connected()) {
			console.log('WebSocket not connected yet');
		}
		this.stompClient.subscribe(topic, (message: IMessage) => {
			callback(message.body);
		});
	}

	unsubscribe(topic: string) {
		if(this.connected()) {
			this.stompClient.unsubscribe(topic);
		}
	}

	send(destination: string, body: any): void {
		if (!this.connected()) {
			throw new Error('WebSocket not connected yet');
		}

		this.stompClient.publish({
			destination,
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' }
		});
	}

	sendStr(destination: string, body: string): void {
		if (!this.connected()) {
			throw new Error('WebSocket not connected yet');
		}

		this.stompClient.publish({ destination, body });
	}

	disconnect() {
		if(this.connected()) {
			this.stompClient.deactivate();
			this.connected.set(false);
			this.errorMsg.set("");
		}
	}
}
