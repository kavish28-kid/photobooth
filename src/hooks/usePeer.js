import { useEffect, useState, useRef, useCallback } from "react";
import { Peer } from "peerjs";

export function usePeer(roomId, localStream) {
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [remotePhoto, setRemotePhoto] = useState(null);

  const connRef = useRef(null);
  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;

  // Cleanup helper
  const disconnect = useCallback(() => {
    if (connRef.current) connRef.current.close();
    if (peer) peer.destroy();
    setConnected(false);
    setRemoteStream(null);
    setRemotePhoto(null);
  }, [peer]);

  // Handle incoming call (used by Host)
  const handleCall = useCallback((call) => {
    console.log("Receiving call from peer...");
    call.answer(localStreamRef.current);
    call.on("stream", (stream) => {
      console.log("Received remote stream!");
      setRemoteStream(stream);
    });
  }, []);

  // Handle connection events (messages)
  const setupConnection = useCallback((connection) => {
    connRef.current = connection;
    setConn(connection);
    setConnected(true);

    connection.on("data", (data) => {
      console.log("Received data:", data);
      if (data.type === "photo") {
        setRemotePhoto(data.payload);
      }
      setMessages((prev) => [...prev, data]);
    });

    connection.on("close", () => {
      console.log("Peer connection closed");
      setConnected(false);
      setRemoteStream(null);
      setRemotePhoto(null);
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const hostId = `flare-${roomId}-host`;
    const guestId = `flare-${roomId}-guest`;
    const currentIsHost = !window.location.search.includes("room=");
    setIsHost(currentIsHost);

    const myId = currentIsHost ? hostId : guestId;
    setPeerId(myId);

    // Initialize PeerJS
    const newPeer = new Peer(myId, {
      debug: 1,
    });

    setPeer(newPeer);

    newPeer.on("open", (id) => {
      console.log("My PeerJS ID is:", id);

      if (!currentIsHost) {
        // Guest: connect to Host
        console.log("Connecting to host:", hostId);
        const connection = newPeer.connect(hostId);
        setupConnection(connection);

        // Guest: call Host
        if (localStreamRef.current) {
          const call = newPeer.call(hostId, localStreamRef.current);
          call.on("stream", (stream) => {
            console.log("Guest received host stream!");
            setRemoteStream(stream);
          });
        }
      }
    });

    // Host: Listen for connections & calls
    if (currentIsHost) {
      newPeer.on("connection", (connection) => {
        console.log("Guest connected to host!");
        setupConnection(connection);
      });

      newPeer.on("call", handleCall);
    }

    newPeer.on("error", (err) => {
      console.error("PeerJS error:", err);
      // If Host ID is taken, we might already have a host active
      if (err.type === "unavailable-id" && !currentIsHost) {
        console.log("Host ID unavailable, retrying...");
      }
    });

    return () => {
      if (connRef.current) connRef.current.close();
      newPeer.destroy();
    };
  }, [roomId, setupConnection, handleCall]);

  // When localStream changes, update call for Guest if connected
  useEffect(() => {
    if (!isHost && connected && localStream && peer) {
      const hostId = `flare-${roomId}-host`;
      const call = peer.call(hostId, localStream);
      call.on("stream", (stream) => {
        setRemoteStream(stream);
      });
    }
  }, [localStream, isHost, connected, peer, roomId]);

  // Send message helper
  const sendMessage = useCallback((type, payload = null) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type, payload });
    }
  }, []);

  return {
    isHost,
    connected,
    remoteStream,
    sendMessage,
    messages,
    remotePhoto,
    setRemotePhoto,
    disconnect,
  };
}
