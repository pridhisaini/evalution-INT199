"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Bid } from "@/types";
import { BidForm } from "@/components/auctions/BidForm";
import { BidHistory } from "@/components/auctions/BidHistory";
import { Countdown } from "@/components/shared/Countdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAuctionById, placeBid } from "@/services/auctionService";
import { useAuth } from "@/context/AuthContext";
import { Auction } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";

// Standard Separator implementation to avoid dependency issue if not installed
const SeparatorComp = () => <div className="h-[1px] w-full bg-border my-4" />;

export default function AuctionDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [auction, setAuction] = useState<Auction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated, refreshUser, user } = useAuth();

    const [activeTab, setActiveTab] = useState("description");
    // Mock bids for now as API doesn't return them yet
    const [bids, setBids] = useState<Bid[]>([]);

    useEffect(() => {
        const fetchAuction = async () => {
            setIsLoading(true);
            const fetchedAuction = await getAuctionById(id);
            if (fetchedAuction) {
                setAuction(fetchedAuction);
                setDisplayBid(fetchedAuction.currentBid);
            }
            setIsLoading(false);
        };

        if (id) {
            fetchAuction();
        }
    }, [id]);





    if (isLoading) {
        return (
            <div className="container py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading auction details...</p>
            </div>
        );
    }

    if (!auction) {
        return <div className="container py-20 text-center">Auction not found</div>;
    }

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
            setDisplayBid(amount);
            // Update user balance in UI
            await refreshUser();
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

};

const isClosed = auction.status === "SOLD" || auction.status === "EXPIRED" || new Date(auction.endTime) < new Date();
const status = auction.status || (isClosed ? "EXPIRED" : "ACTIVE");

return (
    <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Left Column: Images */}
            <div className="space-y-4">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                        src={auction.image}
                        alt={auction.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {isClosed && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                            <span className="text-white text-4xl font-black uppercase tracking-widest border-4 border-white px-8 py-4 rotate-12">
                                <span className="text-white text-4xl font-black uppercase tracking-widest border-4 border-white px-8 py-4 rotate-12">
                                    {status}
                                </span>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-md border bg-muted opacity-70 hover:opacity-100 transition-opacity">
                            <Image
                                src={auction.image} // Reusing same image for mock gallery
                                alt={`View ${i}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Details & Bidding */}
            <div className="space-y-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge>{auction.category}</Badge>
                        <Badge variant={isClosed ? "secondary" : "default"}>
                            <Badge variant={isClosed ? "secondary" : "default"}>
                                {isClosed ? status : "Live Auction"}
                            </Badge>

                    </div>
                    <h1 className="text-3xl font-bold">{auction.title}</h1>
                    <p className="text-muted-foreground mt-2">
                        Lot #{auction.id} • Seller: VintageCollector
                    </p>
                </div>

                <Card className={`border-primary/20 shadow-md ${isClosed ? 'bg-secondary/10 opacity-80' : 'bg-primary/5'}`}>
                    <CardContent className="p-6 space-y-6">
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isClosed ? "Final Price" : "Current Bid"}
                                </p>
                                <div className={`text-4xl font-bold ${isClosed ? 'text-foreground' : 'text-primary'}`}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(displayBid)}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {isClosed ? "Auction Ended" : "Time Remaining"}
                                </p>
                                {isClosed ? (
                                    <div className="text-xl font-bold text-muted-foreground">Closed</div>
                                ) : (
                                    <Countdown endTime={auction.endTime} className="text-xl font-bold text-destructive" />
                                )}
                            </div>
                        </div>

                        <SeparatorComp />

                        {!isClosed && (
                            <BidForm currentBid={displayBid} onPlaceBid={handlePlaceBid} />
                        )}
                        {isClosed && (
                            <div className="text-center py-4 bg-secondary/20 rounded-lg font-medium text-muted-foreground">
                                This auction is no longer accepting bids.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description / Details Tabs */}
                <div className="border rounded-lg">
                    <div className="flex border-b">
                        {['description', 'shipping', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${activeTab === tab
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">
                        {activeTab === 'description' && (
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                <p>{auction.description}</p>
                                <p className="mt-4">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                </p>
                            </div>
                        )}
                        {activeTab === 'shipping' && (
                            <div className="text-sm text-muted-foreground">
                                <p className="mb-2"><strong>Shipping to United States:</strong> $45.00</p>
                                <p>Ships from: London, United Kingdom</p>
                                <p>Estimated delivery: 5-10 business days</p>
                            </div>
                        )}
                        {activeTab === 'history' && (
                            <BidHistory bids={bids} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}
