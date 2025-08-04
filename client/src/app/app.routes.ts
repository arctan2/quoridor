import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LocalLobby } from './components/local/lobby/local-lobby';
import { LocalGame } from './components/local/game/local-game';
import { OnlineLobby } from './components/online/lobby/online-lobby';
import { OnlineGame } from './components/online/game/online-game';

export const routes: Routes = [
	{
		path: "",
		component: Home
	},
	{
		path: "local",
		children: [
			{
				path: "lobby",
				component: LocalLobby
			},
			{
				path: "game",
				component: LocalGame
			},
		],
	},
	{
		path: "online",
		children: [
			{
				path: "lobby",
				component: OnlineLobby
			},
			{
				path: "game",
				component: OnlineGame
			},
		],
	},
];
