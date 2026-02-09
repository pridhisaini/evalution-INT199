import { formatDistanceToNow } from "date-fns";
import { Bid } from "@/types";

interface BidHistoryProps {
    bids: Bid[];
}

export function BidHistory({ bids }: BidHistoryProps) {
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Bid History</h3>
            <div className="space-y-4">
                {bids.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No bids yet. Be the first!</p>
                ) : (
                    bids.map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                    {bid.user.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{bid.user}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bid.amount)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
