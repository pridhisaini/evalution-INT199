import { addDays, addHours, subMinutes } from "date-fns";

export interface Auction {
    id: string;
    title: string;
    description: string;
    currentBid: number;
    startingPrice: number;
    endsAtIST: Date;
    image: string;
    bids: number;
    category: string;
    status?: string;
    bids_history?: {
        id: number;
        bidderName: string;
        amount: number;
        timestamp: string;
    }[];
}

export const CATEGORIES = [
    { id: "general", name: "General", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400" },
    { id: "art", name: "Art", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=400" },
    { id: "jewelry", name: "Jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400" },
    { id: "watches", name: "Watches", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400" },
    { id: "cars", name: "Classic Cars", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=400" },
    { id: "furniture", name: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400" },
    { id: "wine", name: "Wine & Whisky", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=400" },
];

export const MOCK_AUCTIONS: Auction[] = [
    {
        id: "1",
        title: "Vintage Rolex Submariner 1980",
        description: "A pristine condition vintage Rolex Submariner from 1980. Original box and papers included.",
        currentBid: 12500,
        startingPrice: 8000,
        endsAtIST: addHours(new Date(), 4),
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
        bids: 14,
        category: "Watches",
    },
    {
        id: "2",
        title: "Mid-Century Modern Eames Chair",
        description: "Original Eames Lounge Chair and Ottoman. Black leather and rosewood.",
        currentBid: 4200,
        startingPrice: 3500,
        endsAtIST: addDays(new Date(), 2),
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800",
        bids: 8,
        category: "Furniture",
    },
    {
        id: "3",
        title: "1965 Ford Mustang Fastback",
        description: "Fully restored 1965 Ford Mustang. 289 V8 engine, 4-speed manual transmission.",
        currentBid: 45000,
        startingPrice: 30000,
        endsAtIST: addDays(new Date(), 5),
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
        bids: 22,
        category: "Classic Cars",
    },
    {
        id: "4",
        title: "Abstract Oil Painting on Canvas",
        description: "Example abstract art piece by a contemporary artist.",
        currentBid: 850,
        startingPrice: 500,
        endsAtIST: addHours(new Date(), 1),
        image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
        bids: 6,
        category: "Art",
    },
    {
        id: "5",
        title: "Diamond Tennis Bracelet",
        description: "14k White Gold Diamond Tennis Bracelet, 5.00ctw.",
        currentBid: 3200,
        startingPrice: 2800,
        endsAtIST: addDays(new Date(), 3),
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
        bids: 9,
        category: "Jewelry",
    },
];
