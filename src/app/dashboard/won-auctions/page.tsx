"use client";

import { useAuth } from "@/context/AuthContext";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { getAuctions } from "@/services/auctionService";
import { Auction } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";
import useSWR from "swr";

export default function WonAuctionsPage() {
    const { user } = useAuth();
    const { data, isLoading } = useSWR(
        [`/auctions`, 1, 100],
        ([url, page, limit]) => getAuctions(page, limit),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    const wonAuctions = (data?.auctions || []).filter(a => a.status?.toUpperCase() === "SOLD");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Won Auctions</h2>
                <p className="text-muted-foreground">
                    Items you've successfully won.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : wonAuctions.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {wonAuctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">You haven't won any auctions yet.</p>
                </div>
            )}
        </div>
    );
}
