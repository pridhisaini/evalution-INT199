"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Bid } from "@/types";
import { BidForm } from "@/components/auctions/BidForm";
import { BidHistory } from "@/components/auctions/BidHistory";
import { Countdown } from "@/components/shared/Countdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuctionById, placeBid, deductBalance } from "@/services/auctionService";
import { useAuth } from "@/context/AuthContext";
import { formatIST } from "@/lib/utils";
import { Auction, MOCK_AUCTIONS } from "@/lib/mock-data";
import { Loader2, Users, Clock } from "lucide-react";
import { useSocket } from "@/hooks/useSocket";
import { useAuctionRoom } from "@/hooks/useAuctionRoom";
import { ConnectionStatus } from "@/components/shared/ConnectionStatus";
import useSWR from "swr";

export default function AuctionDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { isAuthenticated, refreshUser, user } = useAuth();
    const [activeTab, setActiveTab] = useState("history"); // State for custom tabs

    const { data: auction, isLoading } = useSWR(
        id ? `/auctions/${id}` : null,
        () => getAuctionById(id),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000,
        }
    );

    // WebSocket integration
    const { socket, isConnected, error: socketError } = useSocket();
    const {
        viewerCount,
        bids: websocketBids,
        currentPrice: websocketPrice,
        auctionStatus: websocketStatus,
        endsAtIST: websocketEndsAtIST,
        autoCloseTimer,
        winner,
        isUserWinner
    } = useAuctionRoom({
        socket,
        isConnected,
        auctionId: id,
        userEmail: user?.email,
        initialEndsAt: auction?.endsAtIST,
        initialPrice: auction?.startingPrice,
        initialStatus: auction?.status,
        initialBids: auction?.bids_history?.map((b: any) => ({
            id: b.id,
            user: b.bidderName,
            amount: b.amount,
            timestamp: new Date(b.timestamp)
        })),
        onBalanceDeduct: async (amount) => {
            const token = localStorage.getItem("token");
            if (token) {
                console.log("💰 Deducting balance for win:", amount);
                await deductBalance(amount, token);
                await refreshUser();
            }
        },
    });

    const currentPrice = websocketPrice ?? auction?.currentBid ?? 0;
    const auctionStatus = websocketStatus ?? auction?.status ?? "ACTIVE";
    const auctionEndsAtIST =  auction?.endsAtIST;
console.log("websocketEndsAtIST", websocketEndsAtIST);
console.log("auction?.endsAtIST", auction?.endsAtIST);

    const handlePlaceBid = async (amount: number) => {
        if (!isAuthenticated) {
            alert("Please login to place a bid.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Session expired. Please login again.");
            return;
        }

        const result = await placeBid(id, amount, token);

        if (result.success) {
            await refreshUser();
        } else {
            alert(result.message);
        }
    };

    if (isLoading) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading auction details...</p>
            </div>
        );
    }

    if (!auction) {
        return <div className="container py-20 text-center">Auction not found.</div>;
    }

    return (
        <div className="container py-8 relative">
            {/* Winner Celebration Overlay */}
            {isUserWinner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
                    <div className="bg-background p-10 rounded-2xl shadow-2xl border-4 border-primary text-center max-w-lg mx-4 animate-in zoom-in duration-300">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-4xl font-bold text-primary mb-2">Haye! You Won!</h2>
                        <p className="text-xl mb-6">Congratulations! You are the highest bidder for <strong>{auction.title}</strong>.</p>
                        <div className="bg-primary/10 p-4 rounded-xl mb-6">
                            <p className="text-sm uppercase tracking-wider text-muted-foreground">Winning Bid</p>
                            <p className="text-3xl font-bold text-primary">${winner?.price.toLocaleString() ?? currentPrice.toLocaleString()}</p>
                        </div>
                        <Button size="lg" className="w-full" onClick={() => window.location.reload()}>
                            Awesome!
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Left Column: Image */}
                <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted border shadow-sm">
                        <Image
                            src={auction.image}
                            alt={auction.title}
                            fill
                            className="object-cover"
                            priority
                        />
                        {auctionStatus === "SOLD" && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                                <Badge className="text-2xl py-2 px-6 bg-red-600 mb-2">SOLD</Badge>
                                <p className="text-lg font-medium">Winner: {winner?.name || "Sold"}</p>
                            </div>
                        )}
                        {auctionStatus === "EXPIRED" && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                                <Badge className="text-2xl py-2 px-6">EXPIRED</Badge>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-sm">
                                {auction.category}
                            </Badge>

                            <div className="flex items-center gap-3">
                                {/* Connection Status */}
                                <ConnectionStatus isConnected={isConnected} error={socketError || null} />

                                {/* Live viewer count */}
                                {isConnected && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100 animate-pulse">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-bold">{Math.max(1, viewerCount)} Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">{auction.title}</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            {auction.description}
                        </p>
                    </div>

                    <Card className={`border-2 transition-all duration-300 ${auctionStatus === "SOLD" ? 'border-primary shadow-lg bg-primary/5 shadow-primary/20' : 'border-primary/20'}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>{auctionStatus.toUpperCase() === "SOLD" ? "Auction Results" : "Bidding Overview"}</span>
                                {auctionStatus.toUpperCase() === "ACTIVE" && auctionEndsAtIST && (
                                    <div className="flex items-center text-destructive text-sm font-semibold">
                                        <Clock className="mr-1 h-4 w-4" />
                                        Ends in: <Countdown endsAtIST={new Date(auctionEndsAtIST)} className="ml-1" />
                                    </div>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground">Current Price</p>
                                <p className="text-4xl font-black text-primary">
                                    ${currentPrice.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Started at ${auction.startingPrice.toLocaleString()}
                                </p>
                                <div className="mt-2 p-2 bg-primary/5 rounded border border-primary/10">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Auction Ends At (IST)</p>
                                    <p className="text-xs font-semibold text-primary">{auctionEndsAtIST ? formatIST(new Date(auctionEndsAtIST)) : "..."}</p>
                                </div>
                            </div>
                            <div className="space-y-1 sm:text-right">
                                <p className="text-sm text-muted-foreground">{auctionStatus.toUpperCase() === "SOLD" ? "Status" : "Auto-Close Timer"}</p>
                                {auctionStatus.toUpperCase() === "ACTIVE" ? (
                                    autoCloseTimer > 0 ? (
                                        <div className={`inline-flex items-center justify-center rounded-xl p-3 min-w-[120px] transition-all duration-500 overflow-hidden ${autoCloseTimer <= 3
                                            ? 'bg-gradient-to-br from-red-500 to-red-700 text-white scale-110 shadow-lg shadow-red-500/50'
                                            : 'bg-muted text-foreground'
                                            }`}>
                                            <div className="flex flex-col items-center">
                                                <span className={`text-3xl font-black tabular-nums transition-transform ${autoCloseTimer <= 3 ? 'animate-bounce' : ''}`}>
                                                    {autoCloseTimer}s
                                                </span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                                                    {autoCloseTimer <= 3 ? "GOING ONCE..." : "Time to bid"}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-muted rounded-xl text-center min-w-[120px]">
                                            <p className="text-xs font-bold uppercase tracking-tight text-muted-foreground">
                                                {currentPrice > auction.startingPrice ? "Waiting for" : "Ready for"}
                                            </p>
                                            <p className="text-lg font-black italic">
                                                {currentPrice > auction.startingPrice ? "Next Bid" : "First Bid"}
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    <Badge className={`text-lg py-1 px-4 ${auctionStatus.toUpperCase() === "SOLD" ? "bg-green-600" : "bg-gray-600"}`}>
                                        {auctionStatus}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                        {auctionStatus.toUpperCase() === "ACTIVE" && (
                            <CardFooter className="bg-muted/30 pt-6">
                                <div className="w-full">
                                    <BidForm currentBid={currentPrice} onPlaceBid={handlePlaceBid} />
                                    <p className="mt-3 text-center text-xs text-muted-foreground italic">
                                        NOTE: Money will be deducted only if you win the auction.
                                    </p>
                                </div>
                            </CardFooter>
                        )}
                        {auctionStatus === "SOLD" && winner && (
                            <CardFooter className="bg-primary/10 pt-6 flex flex-col items-start gap-2">
                                <div className="flex items-center gap-2 text-primary">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                                        W
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">Winner: {winner.name}</p>
                                        <p className="text-xs opacity-80 font-medium">Final Price: ${winner.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                {isUserWinner && (
                                    <p className="text-xs font-bold text-green-600 mt-2">✨ Payment of ${winner.price.toLocaleString()} was settled from your balance.</p>
                                )}
                            </CardFooter>
                        )}
                    </Card>

                    <div className="w-full">
                        <div className="flex border-b border-primary/10 mb-4">
                            <button
                                onClick={() => setActiveTab("history")}
                                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                            >
                                Bid History
                            </button>
                            <button
                                onClick={() => setActiveTab("details")}
                                className={`px-4 py-2 text-sm font-bold transition-all border-b-2 ${activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                            >
                                Information
                            </button>
                        </div>

                        {activeTab === "history" && (
                            <div className="animate-in fade-in duration-300">
                                <BidHistory bids={websocketBids} />
                            </div>
                        )}

                        {activeTab === "details" && (
                            <div className="animate-in fade-in duration-300 grid grid-cols-2 gap-4 text-sm">
                                <div className="p-3 bg-muted/50 rounded-lg border border-primary/5">
                                    <p className="text-muted-foreground text-xs uppercase tracking-tighter font-bold">Condition</p>
                                    <p className="font-semibold">Excellent (A+)</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg border border-primary/5">
                                    <p className="text-muted-foreground text-xs uppercase tracking-tighter font-bold">Authentic</p>
                                    <p className="font-semibold text-green-600">Verified</p>
                                </div>
                                <div className="p-3 bg-muted/50 rounded-lg col-span-2 border border-primary/5">
                                    <p className="text-muted-foreground text-xs uppercase tracking-tighter font-bold">Shipping</p>
                                    <p className="font-semibold text-xs">Standard shipping (5-10 days) available worldwide.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
