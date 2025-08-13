package server;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import lobby.LobbyManager;

@Component
public class WebSocketEventListener {
	@Autowired
	LobbyManager lobbyManager;

	@EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
		StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        System.out.println("Connected session ID: " + sessionId);
    }

	@EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
		StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal principal = headerAccessor.getUser();

        if (principal != null) {
			String sessionId = principal.getName();
            System.out.println("disconnected: " + sessionId);
			lobbyManager.onPlayerDisconnect(sessionId);
        } else {
            System.out.println("Anonymous user disconnected.");
        }
    }
}
