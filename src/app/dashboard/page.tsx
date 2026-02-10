"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { getAuctions } from "@/services/auctionService";
import { useAuth } from "@/context/AuthContext";
import { Auction } from "@/lib/mock-data";
import { Loader2 } from "lucide-react";
import useSWR from "swr";

export default function DashboardPage() {
    const { user } = useAuth();
    const { data, isLoading } = useSWR(
        [`/auctions`, 1, 100],
        ([url, page, limit]) => getAuctions(page, limit),
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000,
        }
    );

    const auctions = data?.auctions || [];

    const wonCount = auctions.filter(a => a.status?.toUpperCase() === "SOLD").length;
    const activeCount = auctions.filter(a => !a.status || ["ACTIVE", "OPEN"].includes(a.status.toUpperCase())).length;
    const balance = typeof user?.balance === 'string' ? parseFloat(user.balance) : (user?.balance || 0);

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
                <p className="text-muted-foreground">
                    Hello, {user?.email}. Here's what's happening with your auctions.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider">Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary">${balance.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground mt-1">Available for bidding</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider">Active Auctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Live bidding rooms</p>
                    </CardContent>
                </Card>
                <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium uppercase tracking-wider">Auctions Won</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{wonCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Items won successfully</p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Keep Bidding</h3>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {auctions.filter(a => !a.status || ["ACTIVE", "OPEN"].includes(a.status.toUpperCase())).slice(0, 6).map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))}
                    {activeCount === 0 && (
                        <p className="text-muted-foreground col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
                            No active auctions found at the moment.<br />
                            <span className="text-xs">Check back later for new items!</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
