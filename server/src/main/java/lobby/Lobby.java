package lobby;

import java.util.ArrayList;
import java.util.List;

import game.Colors;
import game.Player;

public class Lobby {
	public Integer playersCount;
	List<Player> players = new ArrayList<>();

	public static class PlayerInfo {
		public String name;
		public String id;
		public String color;

		public PlayerInfo(String name, String id, String color) {
			this.name = name;
			this.id = id;
			this.color = color;
		}
	}

	public Lobby(int playersCount) {
		this.playersCount = playersCount;
	}

	public boolean isLobbyFull() {
		return this.players.size() == this.playersCount;
	}

	public List<String> getSessionIdList() {
		List<String> s = new ArrayList<>();

		for(Player p : players) {
			s.add(p.sessionId);
		}

		return s;
	}

	public List<Player> getPlayers() {
		return this.players;
	}

	public PlayerInfo addPlayer(String sessionId, String name, String color) {
		Player player = new Player(sessionId, sessionId, name, color, 9);
		PlayerInfo playerInfo = new PlayerInfo(name, sessionId, color);
		players.add(player);
		return playerInfo;
	}

	public boolean isLobbyContainsColor(String color) {
		for(Player p : players) {
			if(p.color.equals(color)) return true;
		}

		return false;
	}

	public List<PlayerInfo> getPlayersInfo() {
		ArrayList<PlayerInfo> info = new ArrayList<>();

		for(Player p : players) {
			info.add(new PlayerInfo(p.name, p.id, p.color));
		}

		return info;
	}

	public List<String> getAvailableColors() {
		ArrayList<String> available = (ArrayList<String>) Colors.Colors.clone();
		available.removeIf(c -> this.isLobbyContainsColor(c));
		return available;
	}

	public int removePlayer(String playerId) {
		players.removeIf(p -> p.sessionId.equals(playerId));
		return players.size();
	}

	public Player getPlayerById(String playerId) {
		for(int i = 0; i < players.size(); i++) {
			if(players.get(i).id.equals(playerId)) return players.get(i);
		}
		return null;
	}

	public Player getPlayerBySessionId(String sessionId) {
		for(Player p : players) {
			if(p.sessionId.equals(sessionId)) return p;
		}
		return null;
	}
}
