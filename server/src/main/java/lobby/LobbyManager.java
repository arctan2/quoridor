package lobby;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Component;

import game.Player;
import lobby.Lobby.PlayerInfo;

@Component
public class LobbyManager {
	ConcurrentHashMap<String, Lobby> lobbies = new ConcurrentHashMap<>();
	ConcurrentHashMap<String, String> playersCurrentLobby = new ConcurrentHashMap<>();

	public class LobbyInfo {
		public int lobbySize;
		public List<PlayerInfo> players;

		public LobbyInfo(int lobbySize, List<PlayerInfo> players) {
			this.lobbySize = lobbySize;
			this.players = players;
		}
	}

	@Autowired
	private SimpMessageSendingOperations messagingTemplate;

	public void createLobby(String playerSessionId, int lobbySize) {
		String lobbyId = UUID.randomUUID().toString();

		while(lobbies.containsKey(lobbyId)) {
			lobbyId = UUID.randomUUID().toString();
		}

		Lobby lobby = new Lobby(lobbySize);

		lobbies.put(lobbyId, lobby);

		playersCurrentLobby.put(playerSessionId, lobbyId);

		messagingTemplate.convertAndSendToUser(playerSessionId, "/lobby/create-lobby-res", lobbyId);
	}

	public void onPlayerDisconnect(String playerSessionId) {
		String lobbyId = playersCurrentLobby.get(playerSessionId);
		if(lobbyId == null) return;

		Lobby lobby = lobbies.get(lobbyId);

		if(lobby == null) return;

		if(lobby.players.size() == 0) {
			deleteLobby(lobbyId);
			return;
		}

		Player player = lobby.getPlayerBySessionId(playerSessionId);

		if(player == null) return;

		String sessionId = player.id;

		playersCurrentLobby.remove(playerSessionId);

		if(lobby.removePlayer(playerSessionId) == 0) {
			deleteLobby(lobbyId);
		} else {
			playersCurrentLobby.put(lobby.players.get(0).sessionId, lobbyId);
			for(Player p : lobby.players) {
				messagingTemplate.convertAndSendToUser(p.sessionId, "/lobby/player-disconnected", sessionId);
			}
		}
	}

	public LobbyInfo getLobbyInfo(String lobbyId) {
		Lobby lobby = this.getLobby(lobbyId);
		return new LobbyInfo(lobby.playersCount, lobby.getPlayersInfo());
	}

	public void deleteLobby(String id) {
		lobbies.remove(id);
	}

	public Lobby getLobby(String id) {
		return lobbies.get(id);
	}
}
