package server.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import game.Board;
import game.Coord;
import game.GameManager;
import game.GameState;
import game.Player;
import respond.Response;

@Controller
public class GameController {
	@Autowired
	GameManager gameManager;

	@Autowired
	SimpMessagingTemplate messagingTemplate;

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

	static class MovePlayerRes {
		public Coord coord;
		public String playerId;
		public String newCurPlayerId;

		public MovePlayerRes(Coord coord, String playerId, String newCurPlayerId) {
			this.coord = coord;
			this.playerId = playerId;
			this.newCurPlayerId = newCurPlayerId;
		}
	}

	@MessageMapping("/game/{gameId}/move-player")
	public void movePlayerById(@Payload Coord coord, @DestinationVariable String gameId, Principal principal) {
		String sessionId = principal.getName();
		GameState game = gameManager.getGameById(gameId);
		if(game == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/move-player", Response.Error("The game doesn't exist."));
			return;
		}

		if(!game.isPlayerSessionIdValid(sessionId)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/move-player", Response.Error("You are not authorized to the game."));
			return;
		}

		if(!game.isCurTurnBySessionId(sessionId)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/move-player", Response.Error("It's not your turn buddy."));
			return;
		}

		if(!game.isMovePosssibleOfCurrentPlayer(coord.y, coord.x)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/move-player", Response.Error("The move is not possible."));
			return;
		}

		game.movePlayerBySessionId(sessionId, coord.y, coord.x);
		game.changeTurn();

		MovePlayerRes resData = new MovePlayerRes(coord, game.getPlayerBySessionId(sessionId).id, game.players.get(game.curPlayerIdx).id);
		Response res = Response.Success(resData);

		for(Player p : game.players) {
			messagingTemplate.convertAndSendToUser(p.sessionId, "/game/move-player", res);
		}

		game.checkIsGameOver();

		if(game.isGameOver) {
			for(Player p : game.players) {
				messagingTemplate.convertAndSendToUser(p.sessionId, "/game/game-over", game.ranks);
			}
			gameManager.deleteGameById(gameId);
		}
	}

	static class PlacePlankInfo {
		public int y;
		public int x;
		public Board.Orient orient;
	}

	static class PlacePlankRes {
		public int y;
		public int x;
		public Board.Orient orient;
		public String playerId;
		public String newCurPlayerId;

		public PlacePlankRes(int y, int x, Board.Orient orient, String playerId, String newCurPlayerId) {
			this.playerId = playerId;
			this.x = x;
			this.y = y;
			this.orient = orient;
			this.newCurPlayerId = newCurPlayerId;
		}
	}
	
	@MessageMapping("/game/{gameId}/place-plank")
	public void placePlankOfPlayer(@Payload PlacePlankInfo info, @DestinationVariable String gameId, Principal principal) {
		String sessionId = principal.getName();
		GameState game = gameManager.getGameById(gameId);
		if(game == null) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/place-plank", Response.Error("The game doesn't exist."));
			return;
		}

		if(!game.isPlayerSessionIdValid(sessionId)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/place-plank", Response.Error("You are not authorized to the game."));
			return;
		}

		if(!game.isCurTurnBySessionId(sessionId)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/place-plank", Response.Error("It's not your turn buddy."));
			return;
		}

		if(!game.canPlacePlank(info.y, info.x, info.orient)) {
			messagingTemplate.convertAndSendToUser(sessionId, "/game/place-plank", Response.Error("Plank can't be placed there."));
			return;
		}

		game.placePlankBySessionId(sessionId, info.y, info.x, info.orient);
		game.changeTurn();

		PlacePlankRes resData = new PlacePlankRes(
			info.y,
			info.x,
			info.orient,
			game.getPlayerBySessionId(sessionId).id,
			game.players.get(game.curPlayerIdx).id
		);

		Response res = Response.Success(resData);

		for(Player p : game.players) {
			messagingTemplate.convertAndSendToUser(p.sessionId, "/game/place-plank", res);
		}
	}
}
