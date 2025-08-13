import { Player } from "./player";

export enum SessionStorageKey {
	LocalGameState = "local-game-state",
	LastJoineeData = "last-joinee-data",
	PlayerId = "player-id"
}

export function setLocalGameState(players: Player[]) {
	const str = JSON.stringify(players.map(p => {
		return {
			name: p.name,
			color: p.color,
			id: p.id,
		};
	}));

	sessionStorage.setItem(SessionStorageKey.LocalGameState, str);
}

export function getLocalGameState(): Player[] | null {
	const str = sessionStorage.getItem(SessionStorageKey.LocalGameState);
	if(str === null || str === "") return null;
	return JSON.parse(str).map((p: Player) => new Player(p.id, p.name, p.color));
}

