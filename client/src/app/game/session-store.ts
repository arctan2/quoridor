import { Player } from "./player";

enum SessionStorageKey {
	LocalGameState = "local-game-state"
}

export function setLocalGameState(players: Player[]) {
	const str = JSON.stringify(players.map(p => {
		return {
			name: p.name,
			color: p.color
		};
	}));

	sessionStorage.setItem(SessionStorageKey.LocalGameState, str);
}

export function getLocalGameState(): Player[] | null {
	const str = sessionStorage.getItem(SessionStorageKey.LocalGameState);
	if(str === null || str === "") return null;
	return JSON.parse(str).map((p: Player) => new Player(p.name, p.color));
}

