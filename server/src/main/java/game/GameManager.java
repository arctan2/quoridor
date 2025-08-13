package game;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Component;

@Component
public class GameManager {
	ConcurrentMap<String, GameState> gamesMap = new ConcurrentHashMap<>();

	public void addGame(String gameId, List<Player> players) {
		GameState game = new GameState(players);
		gamesMap.put(gameId, game);
	}

	public GameState getGameById(String gameId) {
		return this.gamesMap.get(gameId);
	}

	public GameState deleteGameById(String gameId) {
		return this.gamesMap.remove(gameId);
	}
}
