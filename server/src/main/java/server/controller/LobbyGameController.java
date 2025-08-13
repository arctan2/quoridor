package server.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import game.GameManager;
import lobby.LobbyManager;
import lobby.LobbyManager.LobbyInfo;
import respond.Response;
import lobby.Lobby;
import lobby.Lobby.PlayerInfo;

@Controller
public class LobbyGameController {
	@Autowired
	LobbyManager lobbyManager;
	@Autowired
	GameManager gameManager;
	
	static class JoinInfo {
		public String name;
		public String color;
	}

	static class CreateLobbyData {
		public int lobbySize;
	}

	static class LastJoineeData {
		public String id;
		public LobbyInfo lobbyInfo;
	}

	@Autowired
	SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/lobby/create-lobby")
	public void createLobby(@Payload int lobbySize, Principal principal) throws Exception {
		lobbyManager.createLobby(principal.getName(), lobbySize);
	}

	@MessageMapping("/lobby/{lobbyId}/info")
	public void getLobbyInfo(@DestinationVariable String lobbyId, Principal principal) throws Exception {
		String sessionId = principal.getName();
		Lobby lobby = lobbyManager.getLobby(lobbyId);

		if(lobby == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/info-res", Response.Error("Lobby doesn't exist."));
		} else if(lobby.getPlayerBySessionId(sessionId) == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/info-res", Response.Error("You are unauthorized to the lobby."));
		} else {
			LobbyInfo lobbyInfo = lobbyManager.getLobbyInfo(lobbyId);
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/info-res", Response.Success(lobbyInfo));
		}
	}

	@MessageMapping("/lobby/{lobbyId}/join")
	public void joinLobby(JoinInfo info, @DestinationVariable String lobbyId, Principal principal) throws Exception {
		String sessionId = principal.getName();
		Lobby lobby = lobbyManager.getLobby(lobbyId);

		if(lobby == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.Error("Lobby doesn't exist."));
			return;
		}

		if(info.color.equals("") || info.name.equals("")) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.Error("Color or player name is empty."));
			return;
		}

		if(lobby.isLobbyContainsColor(info.color)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.Error("The color is already taken."));
			return;
		}

		if(lobby.getPlayerBySessionId(sessionId) != null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.SuccessMsg("The user is already in lobby."));
			return;
		}

		PlayerInfo player = lobby.addPlayer(sessionId, info.name, info.color);

		boolean isLobbyFull = lobby.isLobbyFull();

		if(isLobbyFull) {
			LastJoineeData data = new LastJoineeData();
			data.id = sessionId;
			data.lobbyInfo = lobbyManager.getLobbyInfo(lobbyId);

			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.Success(data));
			gameManager.addGame(lobbyId, lobby.getPlayers());
			lobbyManager.deleteLobby(lobbyId);

			for(String id : lobby.getSessionIdList()) {
				messagingTemplate.convertAndSendToUser(id, "/lobby/player-connected", Response.Success(player));
				messagingTemplate.convertAndSendToUser(id, "/lobby/game-start", Response.Success(id));
			}
		} else {
			for(String id : lobby.getSessionIdList()) {
				messagingTemplate.convertAndSendToUser(id, "/lobby/player-connected", Response.Success(player));
			}
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/join-res", Response.Success(null));
		}
	}

	@MessageMapping("/lobby/{lobbyId}/available-colors")
	public void getAvailableColors(@DestinationVariable String lobbyId, Principal principal) throws Exception {
		String sessionId = principal.getName();
		Lobby lobby = lobbyManager.getLobby(lobbyId);

		if(lobby == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/available-colors-res", Response.Error("Lobby doesn't exist."));
		} else {
			messagingTemplate.convertAndSendToUser(sessionId, "/lobby/available-colors-res", Response.Success(lobby.getAvailableColors()));
		}
	}
}

