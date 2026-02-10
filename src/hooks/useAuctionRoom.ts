"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Socket } from "socket.io-client";
import {
    Bid,
    ViewerCountPayload,
    AuctionStatePayload,
    NewBidPayload,
    AuctionSoldPayload,
    AuctionExpiredPayload,
    AuctionEndingSoonPayload,
} from "@/types";

interface UseAuctionRoomProps {
    socket: Socket | null;
    auctionId: string;
    onBalanceDeduct?: (amount: number) => void;
    userEmail?: string | null;
    initialEndsAt?: Date;
    initialPrice?: number;
    initialBids?: Bid[];
    isConnected?: boolean;
    initialStatus?: string;
}

export function useAuctionRoom({ socket, auctionId, onBalanceDeduct, userEmail, initialEndsAt, initialPrice, initialBids, isConnected, initialStatus }: UseAuctionRoomProps) {
    const [viewerCount, setViewerCount] = useState(0);
    const [bids, setBids] = useState<Bid[]>(initialBids ?? []);
    const [currentPrice, setCurrentPrice] = useState<number | null>(initialPrice ?? null);
    const [auctionStatus, setAuctionStatus] = useState<string>(initialStatus?.toUpperCase() ?? "ACTIVE");
    const [endsAtIST, setEndsAtIST] = useState<Date | null>(initialEndsAt ?? null);
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
    const [autoCloseTimer, setAutoCloseTimer] = useState<number>(0);
    const [winner, setWinner] = useState<{ name: string; price: number } | null>(null);
    const [isUserWinner, setIsUserWinner] = useState(false);

    // Sync initial state if it becomes available later (after async fetch in parent)
    useEffect(() => {
        if (initialBids && initialBids.length > 0 && bids.length === 0) {
            setBids(initialBids);
        }
    }, [initialBids, bids.length]);

    useEffect(() => {
        if (initialPrice !== undefined && initialPrice !== null && currentPrice === null) {
            setCurrentPrice(initialPrice);
        }
    }, [initialPrice, currentPrice]);

    useEffect(() => {
        if (initialStatus && (auctionStatus === "ACTIVE" || auctionStatus !== initialStatus.toUpperCase())) {
            setAuctionStatus(initialStatus.toUpperCase());
        }
    }, [initialStatus]);

    useEffect(() => {
        if (initialEndsAt && !endsAtIST) {
            setEndsAtIST(initialEndsAt);
        }
    }, [initialEndsAt, endsAtIST]);

    const autoCloseIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Start 10-second auto-close countdown
    const startAutoCloseTimer = useCallback(() => {
        console.log("⏱️ Starting auto-close timer...");
        // Clear any existing timer
        if (autoCloseIntervalRef.current) {
            clearInterval(autoCloseIntervalRef.current);
        }

        setAutoCloseTimer(10);

        autoCloseIntervalRef.current = setInterval(() => {
            setAutoCloseTimer((prev) => {
                if (prev <= 1) {
                    console.log("⏱️ Timer expired naturally.");
                    // Timer expired, auction should close
                    if (autoCloseIntervalRef.current) {
                        clearInterval(autoCloseIntervalRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Stop auto-close timer
    const stopAutoCloseTimer = useCallback(() => {
        console.log("⏱️ Stopping auto-close timer manually.");
        if (autoCloseIntervalRef.current) {
            clearInterval(autoCloseIntervalRef.current);
            autoCloseIntervalRef.current = null;
        }
        setAutoCloseTimer(0);
    }, []);

    const onBalanceDeductRef = useRef(onBalanceDeduct);
    const userEmailRef = useRef(userEmail);

    useEffect(() => {
        onBalanceDeductRef.current = onBalanceDeduct;
        userEmailRef.current = userEmail;
    }, [onBalanceDeduct, userEmail]);

    useEffect(() => {
        if (!socket || !auctionId) return;

        // Ensure we only join when actually connected or specifically told it's connected
        if (!socket.connected && !isConnected) {
            console.warn("⚠️ Socket not connected yet, waiting...");
            return;
        }

        console.log(`🚪 Joining auction room: ${auctionId}`);
        socket.emit("join_room", auctionId); // Changed to join_room to match common project pattern
        socket.emit("joinAuction", auctionId); // Fallback to joinAuction just in case

        // Event: VIEWER_COUNT
        const handleViewerCount = (data: ViewerCountPayload) => {
            console.log("👥 Viewer count update:", data);
            setViewerCount(data.count);
        };

        // Event: AUCTION_STATE
        const handleAuctionState = (data: AuctionStatePayload) => {
            console.log("📊 Auction state received status:", data.status, "Price:", data.currentPrice);
            console.log("📊 Full auction state data:", data);
            setCurrentPrice(data.currentPrice);
            setAuctionStatus(data.status.toUpperCase());

            if (data.endsAt) {
                setEndsAtIST(new Date(data.endsAt));
            }

            if (data.lastBid && data.status.toUpperCase() === "ACTIVE") {
                console.log("📊 Starting timer from AUCTION_STATE because lastBid exists.");
                setBids([
                    {
                        id: Date.now(),
                        user: data.lastBid.bidderName,
                        amount: data.lastBid.amount,
                        timestamp: new Date(data.lastBid.timestamp),
                    },
                ]);

                // Start timer to show urgency if a bid exists
                startAutoCloseTimer();
            } else if (data.status === "ACTIVE" && data.currentPrice > 0) {
                // Even if lastBid isn't fully populated, if there's a current price
                // we might want to start the timer, but let's stick to lastBid presence for now
                // or check if currentPrice > initial price.
                // Actually, the server should send the last bid info.
            }

            if (data.status.toUpperCase() === "SOLD") {
                stopAutoCloseTimer();
            }
        };

        // Event: NEW_BID
        const handleNewBid = (data: NewBidPayload) => {
            console.log("💰 New bid received!", data.amount, "from", data.bidderName);
            setCurrentPrice(data.amount);

            // Ensure status is active when bid is received
            setAuctionStatus("ACTIVE");

            const newBid: Bid = {
                id: Date.now(),
                user: data.bidderName,
                amount: data.amount,
                timestamp: new Date(data.timestamp),
            };

            setBids((prevBids) => [newBid, ...prevBids]);

            // Reset auto-close timer on new bid
            startAutoCloseTimer();
        };

        // Event: AUCTION_ENDING_SOON
        const handleEndingSoon = (data: AuctionEndingSoonPayload) => {
            console.log("⏰ Auction ending soon:", data);
            setTimeRemaining(data.secondsRemaining);
        };

        // Event: AUCTION_SOLD
        const handleAuctionSold = (data: AuctionSoldPayload) => {
            console.log("🎉 Auction sold event received.");
            setAuctionStatus("SOLD");
            setWinner({ name: data.winnerName, price: data.finalPrice });
            stopAutoCloseTimer();

            // Check if current user is the winner
            if (userEmailRef.current === data.winnerName) {
                setIsUserWinner(true);
                if (onBalanceDeductRef.current) {
                    onBalanceDeductRef.current(data.finalPrice);
                }
            }
        };

        // Event: AUCTION_EXPIRED
        const handleAuctionExpired = (data: AuctionExpiredPayload) => {
            console.log("⏱️ Auction expired:", data);
            setAuctionStatus("EXPIRED");
            stopAutoCloseTimer();
        };

        // Register listeners
        socket.on("VIEWER_COUNT", handleViewerCount);
        socket.on("AUCTION_STATE", handleAuctionState);
        socket.on("NEW_BID", handleNewBid);
        socket.on("AUCTION_ENDING_SOON", handleEndingSoon);
        socket.on("AUCTION_SOLD", handleAuctionSold);
        socket.on("AUCTION_EXPIRED", handleAuctionExpired);

        // Robust alternative names
        socket.on("new_bid", handleNewBid);
        socket.on("auction_state", handleAuctionState);
        socket.on("viewer_count", handleViewerCount);

        // Error handling
        socket.on("error", (error: any) => {
            console.error("❌ WebSocket error in auction room:", error);
        });

        // Cleanup on unmount or auctionId change
        return () => {
            console.log(`🚪 Leaving auction room: ${auctionId}`);
            socket.emit("leaveAuction", auctionId);

            socket.off("VIEWER_COUNT", handleViewerCount);
            socket.off("AUCTION_STATE", handleAuctionState);
            socket.off("NEW_BID", handleNewBid);
            socket.off("AUCTION_ENDING_SOON", handleEndingSoon);
            socket.off("AUCTION_SOLD", handleAuctionSold);
            socket.off("AUCTION_EXPIRED", handleAuctionExpired);

            socket.off("new_bid", handleNewBid);
            socket.off("auction_state", handleAuctionState);
            socket.off("viewer_count", handleViewerCount);

            // Do NOT stop timer here if we are just re-rendering, 
            // but we must if we are truly leaving (switching auctions)
            if (autoCloseIntervalRef.current) {
                clearInterval(autoCloseIntervalRef.current);
            }
        };
    }, [socket, auctionId, isConnected, startAutoCloseTimer]);

    return {
        viewerCount,
        bids,
        currentPrice,
        auctionStatus,
        endsAtIST,
        timeRemaining,
        autoCloseTimer,
        winner,
        isUserWinner,
    };
}
