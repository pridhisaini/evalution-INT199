"use client";

import { useAuth } from "@/context/AuthContext";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { getAuctions } from "@/services/auctionService";
import { Auction } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";
import useSWR from "swr";

export default function ActiveBidsPage() {
    const { user } = useAuth();
    const { data, isLoading } = useSWR(
        [`/auctions`, 1, 100],
        ([url, page, limit]) => getAuctions(page, limit),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    const activeAuctions = (data?.auctions || []).filter(a => !a.status || ["ACTIVE", "OPEN"].includes(a.status.toUpperCase()));

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Active Bids</h2>
                <p className="text-muted-foreground">
                    Auctions that are currently live.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : activeAuctions.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {activeAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">No active bids found.</p>
            )}
        </div>
    );
}
