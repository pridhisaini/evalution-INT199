"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { MOCK_AUCTIONS, CATEGORIES } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";

export default function AuctionsPage() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || null;

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sortBy, setSortBy] = useState("ending");
    const [statusFilters, setStatusFilters] = useState({
        live: true,
        upcoming: false,
        endingSoon: false,
    });

    // Initialize category from URL param
    useEffect(() => {
        if (initialCategory) {
            const category = CATEGORIES.find(c => c.id === initialCategory);
            if (category) {
                setSelectedCategory(category.name);
            }
        }
    }, [initialCategory]);

    // Helper function to determine auction status
    const getAuctionStatus = (endTime: Date) => {
        const now = new Date();
        const end = new Date(endTime);
        const hoursLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursLeft < 0) return "ended";
        if (hoursLeft < 2) return "endingSoon";
        if (hoursLeft > 24 * 7) return "upcoming";
        return "live";
    };

    // Filter auctions based on category, search, and status
    const filteredAuctions = [...MOCK_AUCTIONS, ...MOCK_AUCTIONS].filter((auction) => {
        const matchesCategory = !selectedCategory || auction.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = !searchQuery ||
            auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            auction.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filtering
        const status = getAuctionStatus(auction.endTime);
        const matchesStatus =
            (statusFilters.live && status === "live") ||
            (statusFilters.upcoming && status === "upcoming") ||
            (statusFilters.endingSoon && status === "endingSoon") ||
            (!statusFilters.live && !statusFilters.upcoming && !statusFilters.endingSoon); // Show all if none selected

        return matchesCategory && matchesSearch && matchesStatus;
    });

    // Sort auctions
    const sortedAuctions = [...filteredAuctions].sort((a, b) => {
        switch (sortBy) {
            case "ending":
                return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
            case "price-low":
                return a.currentBid - b.currentBid;
            case "price-high":
                return b.currentBid - a.currentBid;
            case "newest":
                return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
            default:
                return 0;
        }
    });

    const handleCategoryClick = (categoryId: string) => {
        const category = CATEGORIES.find(c => c.id === categoryId);
        if (selectedCategory === category?.name) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(category?.name || null);
        }
    };

    const handleStatusChange = (status: 'live' | 'upcoming' | 'endingSoon') => {
        setStatusFilters(prev => ({
            ...prev,
            [status]: !prev[status],
        }));
    };

    const resetFilters = () => {
        setSelectedCategory(null);
        setSearchQuery("");
        setStatusFilters({ live: true, upcoming: false, endingSoon: false });
    };

    return (
        <div className="container py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">All Auctions</h1>
                    <p className="text-muted-foreground">Discover unique items from around the world.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <option value="ending">Ending Soon</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                {/* Sidebar Filters */}
                <aside className="hidden lg:block">
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Search</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search keywords..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((category) => (
                                    <Badge
                                        key={category.id}
                                        variant={selectedCategory === category.name ? "default" : "outline"}
                                        className="cursor-pointer hover:bg-secondary transition-colors px-3 py-1"
                                        onClick={() => handleCategoryClick(category.id)}
                                    >
                                        {category.name}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-lg font-semibold">Status</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-input text-primary focus:ring-primary"
                                        checked={statusFilters.live}
                                        onChange={() => handleStatusChange('live')}
                                    />
                                    Live Auctions
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-input text-primary focus:ring-primary"
                                        checked={statusFilters.upcoming}
                                        onChange={() => handleStatusChange('upcoming')}
                                    />
                                    Upcoming
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="rounded border-input text-primary focus:ring-primary"
                                        checked={statusFilters.endingSoon}
                                        onChange={() => handleStatusChange('endingSoon')}
                                    />
                                    Ending Soon
                                </label>
                            </div>
                        </div>

                        {(selectedCategory || searchQuery || statusFilters.upcoming || statusFilters.endingSoon || !statusFilters.live) && (
                            <Button className="w-full" variant="outline" onClick={resetFilters}>
                                <X className="mr-2 h-4 w-4" /> Reset Filters
                            </Button>
                        )}
                    </div>
                </aside>

                {/* Auction Grid */}
                <div className="lg:col-span-3">
                    {/* Active Filters Display */}
                    {selectedCategory && (
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filtering by:</span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {selectedCategory}
                                <X
                                    className="h-3 w-3 cursor-pointer"
                                    onClick={() => setSelectedCategory(null)}
                                />
                            </Badge>
                        </div>
                    )}

                    {sortedAuctions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {sortedAuctions.map((auction, i) => (
                                <AuctionCard key={`${auction.id}-${i}`} auction={auction} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">No auctions found matching your criteria.</p>
                            <Button variant="outline" className="mt-4" onClick={resetFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    )}

                    {sortedAuctions.length > 0 && (
                        <div className="mt-8 flex justify-center">
                            <Button variant="outline" size="lg">Load More</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
