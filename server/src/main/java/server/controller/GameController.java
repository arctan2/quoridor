package server.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import game.GameManager;
import game.GameState;
import game.Player;
import respond.Response;

@Controller
public class GameController {
	@Autowired
	GameManager gameManager;

	@MessageMapping("/game/{gameId}/reconnect")
	@SendToUser("/game/reconnect-res")
	public Response reconnect(@Payload String playerId, @DestinationVariable String gameId, Principal principal) {
		String sessionId = principal.getName();
		GameState game = gameManager.getGameById(gameId);
		if(game == null) {
			return Response.Error("The game doesn't exist.");
		}

		game.updateSessionIdOfPlayerId(playerId, sessionId);

		return Response.Success();
	}

	@MessageMapping("/game/{gameId}/game-state")
	@SendToUser("/game/game-state-res")
	public Response getGameState(@DestinationVariable String gameId, Principal principal) {
		String sessionId = principal.getName();
		GameState game = gameManager.getGameById(gameId);
		if(game == null) {
			return Response.Error("The game doesn't exist.");
		}

		if(!game.isPlayerSessionIdValid(sessionId)) {
			return Response.Error("You are not authorized to the game.");
		}

		return Response.Success(game);
	}
}
