export interface Bid {
    id: string | number;
    user: string;
    amount: number;
    timestamp: Date;
}

// WebSocket Event Payloads
export interface ViewerCountPayload {
    auctionId: string;
    count: number;
}

export interface AuctionStatePayload {
    auctionId: number;
    currentPrice: number;
    endsAt: string;
    status: string;
    lastBid: {
        amount: number;
        bidderName: string;
        timestamp: string;
    } | null;
}

export interface NewBidPayload {
    amount: number;
    bidderName: string;
    timestamp: string;
}

export interface AuctionEndingSoonPayload {
    auctionId: string;
    secondsRemaining: number;
}

export interface AuctionSoldPayload {
    auctionId: string;
    winnerName: string;
    finalPrice: number;
}

export interface AuctionExpiredPayload {
    auctionId: string;
}
