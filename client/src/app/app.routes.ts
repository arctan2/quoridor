import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LocalLobby } from './components/local/lobby/local-lobby';
import { LocalGame } from './components/local/game/local-game';
import { CreateOnlineLobby } from './components/online/create-lobby/create-lobby';
import { OnlineGame } from './components/online/game/online-game';
import { JoinLobby } from './components/online/join-lobby/join-lobby';
import { OnlineLobby } from './components/online/lobby/online-lobby';

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
				path: "create-lobby",
				component: CreateOnlineLobby
			},
			{
				path: "join-lobby/:id",
				component: JoinLobby
			},
			{
				path: "lobby/:id",
				component: OnlineLobby
			},
			{
				path: "game/:id",
				component: OnlineGame
			},
		],
	},
];
