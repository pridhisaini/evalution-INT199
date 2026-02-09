import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { getAuctions } from "@/services/auctionService";

export default async function DashboardPage() {
    const auctions = await getAuctions();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Manage your bids and account settings.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bids</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{auctions.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Won Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Spent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$1,250.00</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Active Bids</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {auctions.length > 0 ? (
                        auctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))
                    ) : (
                        <p className="text-muted-foreground col-span-full">No active auctions found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
