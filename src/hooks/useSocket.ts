"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

import { SOCKET_URL } from "@/lib/constants";

export function useSocket() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Get JWT token from sessionStorage
        const token = sessionStorage.getItem("token");

        if (!token) {
            setError("No authentication token found");
            return;
        }

        // Create socket connection with JWT auth
        const newSocket = io(SOCKET_URL, {
            auth: {
                token: token,
            },
            extraHeaders: {
                "ngrok-skip-browser-warning": "true",
            },
            transports: ["polling", "websocket"],
        });

        socketRef.current = newSocket;

        // Connection event handlers
        newSocket.on("connect", () => {
            console.log("✅ Connected to WebSocket server");
            setIsConnected(true);
            setError(null);
        });

        newSocket.on("connect_error", (err) => {
            console.error("❌ Connection failed:", err.message);
            setError(err.message);
            setIsConnected(false);
        });

        newSocket.on("disconnect", () => {
            console.log("🔌 Disconnected from WebSocket server");
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            console.log("🧹 Cleaning up socket connection");
            newSocket.close();
        };
    }, []);

    return { socket, isConnected, error };
}
