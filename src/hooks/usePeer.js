import { useEffect, useState, useRef, useCallback } from "react";
import { Peer } from "peerjs";

export function usePeer(roomId, localStream, isHost) {
  const [peer, setPeer] = useState(null);
  const [conn, setConn] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [peerId, setPeerId] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [remotePhoto, setRemotePhoto] = useState(null);
  const [peerCount, setPeerCount] = useState(0);

  const connRef = useRef(null);
  const localStreamRef = useRef(localStream);
  localStreamRef.current = localStream;
  const connectionsRef = useRef([]);
  const remoteStreamsRef = useRef([]);

  const disconnect = useCallback(() => {
    connectionsRef.current.forEach((c) => c.close());
    connectionsRef.current = [];
    remoteStreamsRef.current = [];
    if (connRef.current) connRef.current.close();
    if (peer) peer.destroy();
    setConnected(false);
    setRemoteStreams([]);
    setRemotePhoto(null);
    setPeerCount(0);
  }, [peer]);

  const handleCall = useCallback((call) => {
    call.answer(localStreamRef.current);
    call.on("stream", (stream) => {
      remoteStreamsRef.current = [...remoteStreamsRef.current, stream];
      setRemoteStreams([...remoteStreamsRef.current]);
    });
    call.on("close", () => {
      remoteStreamsRef.current = remoteStreamsRef.current.filter((s) => s !== call.remoteStream);
      setRemoteStreams([...remoteStreamsRef.current]);
    });
  }, []);

  const setupConnection = useCallback((connection) => {
    connectionsRef.current = [...connectionsRef.current, connection];
    connRef.current = connection;
    setConnected(true);
    setPeerCount(connectionsRef.current.length);

    connection.on("data", (data) => {
      if (data.type === "photo") {
        setRemotePhoto(data.payload);
      }
      setMessages((prev) => [...prev, data]);
    });

    connection.on("close", () => {
      connectionsRef.current = connectionsRef.current.filter((c) => c !== connection);
      setPeerCount(connectionsRef.current.length);
      if (connectionsRef.current.length === 0) {
        setConnected(false);
        setRemoteStreams([]);
        setRemotePhoto(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const hostId = `flare-${roomId}-host`;
    const peerIdStr = isHost
      ? hostId
      : `flare-${roomId}-guest-${Math.random().toString(36).substring(2, 6)}`;
    setPeerId(peerIdStr);

    const newPeer = new Peer(peerIdStr, { debug: 1 });
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      if (!isHost) {
        const connection = newPeer.connect(hostId);
        setupConnection(connection);

        if (localStreamRef.current) {
          const call = newPeer.call(hostId, localStreamRef.current);
          call.on("stream", (stream) => {
            remoteStreamsRef.current = [...remoteStreamsRef.current, stream];
            setRemoteStreams([...remoteStreamsRef.current]);
          });
        }
      }
    });

    if (isHost) {
      newPeer.on("connection", (connection) => {
        setupConnection(connection);
      });
      newPeer.on("call", handleCall);
    }

    newPeer.on("error", (err) => {
      console.error("PeerJS error:", err);
    });

    return () => {
      connectionsRef.current.forEach((c) => c.close());
      connectionsRef.current = [];
      newPeer.destroy();
    };
  }, [roomId, isHost, setupConnection, handleCall]);

  useEffect(() => {
    if (!isHost && connected && localStream && peer) {
      const hostId = `flare-${roomId}-host`;
      const call = peer.call(hostId, localStream);
      call.on("stream", (stream) => {
        remoteStreamsRef.current = [...remoteStreamsRef.current, stream];
        setRemoteStreams([...remoteStreamsRef.current]);
      });
    }
  }, [localStream, isHost, connected, peer, roomId]);

  const sendMessage = useCallback((type, payload = null) => {
    connectionsRef.current.forEach((c) => {
      if (c.open) c.send({ type, payload });
    });
  }, []);

  return {
    isHost,
    connected,
    remoteStreams,
    sendMessage,
    messages,
    remotePhoto,
    setRemotePhoto,
    disconnect,
    peerCount,
  };
}
