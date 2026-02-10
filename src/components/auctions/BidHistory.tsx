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
                    bids.map((bid, index) => (
                        <div
                            key={bid.id}
                            className={`flex items-center justify-between border-b pb-2 last:border-0 ${index === 0 ? 'bg-primary/5 -mx-2 px-2 py-2 rounded-md border-primary/20' : ''
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                    }`}>
                                    {bid.user.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium">{bid.user}</p>
                                        {index === 0 && (
                                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                                Latest
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(bid.timestamp), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                            <p className={`font-bold ${index === 0 ? 'text-primary' : ''}`}>
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bid.amount)}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
