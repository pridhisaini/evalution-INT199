import { Auction } from "@/lib/mock-data";

export interface ApiAuction {
    id: number;
    title: string;
    description: string;
    startingPrice: string;
    currentPrice: string;
    status: string;
    creatorId: number;
    winnerId: number | null;
    endsAt: string;
    createdAt: string;
    creator: {
        id: number;
        email: string;
    };
}

export interface AuctionsResponse {
    auctions: ApiAuction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const API_URL = "https://krystal-solutional-cherish.ngrok-free.dev";
// Use a placeholder image since the API doesn't provide one yet
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400";
const DEFAULT_CATEGORY = "General";

export async function getAuctions(): Promise<Auction[]> {
    try {
        const response = await fetch(`${API_URL}/auctions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // specific header to bypass ngrok browser warning
                "ngrok-skip-browser-warning": "true",
            },
            cache: "no-store", // Ensure fresh data
        });

        if (!response.ok) {
            console.error("Failed to fetch auctions:", response.status, response.statusText);
            throw new Error(`Failed to fetch auctions: ${response.statusText}`);
        }

        const data: AuctionsResponse = await response.json();

        return data.auctions.map((apiAuction) => ({
            id: apiAuction.id.toString(),
            title: apiAuction.title,
            description: apiAuction.description,
            currentBid: parseFloat(apiAuction.currentPrice),
            startingPrice: parseFloat(apiAuction.startingPrice),
            endTime: new Date(apiAuction.endsAt),
            image: PLACEHOLDER_IMAGE, // API doesn't have image field yet
            bids: 0, // API doesn't return bid count yet
            category: DEFAULT_CATEGORY, // API doesn't return category yet
            status: apiAuction.status,
        }));
    } catch (error) {
        console.error("Error fetching auctions:", error);
        // Fallback to empty array or rethrow depending on desired behavior
        // returning empty array to avoid crashing the dashboard if API is down
        return [];
    }
}

export async function getAuctionById(id: string): Promise<Auction | null> {
    try {
        const response = await fetch(`${API_URL}/auctions/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            console.error("Failed to fetch auction:", response.status);
            return null;
        }

        const apiAuction: ApiAuction = await response.json();

        return {
            id: apiAuction.id.toString(),
            title: apiAuction.title,
            description: apiAuction.description,
            currentBid: parseFloat(apiAuction.currentPrice),
            startingPrice: parseFloat(apiAuction.startingPrice),
            endTime: new Date(apiAuction.endsAt),
            image: PLACEHOLDER_IMAGE,
            bids: 0,
            category: DEFAULT_CATEGORY,
            status: apiAuction.status,
        };
    } catch (error) {
        console.error("Error fetching auction by ID:", error);
        return null;
    }
}

export async function placeBid(auctionId: string, amount: number, token: string): Promise<{ success: boolean; message: string }> {
    try {
        const response = await fetch(`${API_URL}/auctions/${auctionId}/bid`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                message: errorData.message || `Failed to place bid: ${response.statusText}`
            };
        }

        return { success: true, message: "Bid placed successfully!" };
    } catch (error) {
        console.error("Error placing bid:", error);
        return { success: false, message: "An error occurred while placing your bid." };
    }
}
