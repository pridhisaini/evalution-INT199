"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Auction, CATEGORIES } from "@/lib/mock-data";
import { getAuctions } from "@/services/auctionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search, Loader2 } from "lucide-react";
import useSWR from "swr";

function AuctionsPageContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const initialCategory = searchParams.get("category") || null;

    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [sortBy, setSortBy] = useState("ending");
    const [statusFilters, setStatusFilters] = useState({
        live: false,
        upcoming: false,
        endingSoon: false,
    });

    const { data, isLoading } = useSWR(
        [`/auctions`, currentPage, 10],
        ([url, page, limit]) => getAuctions(page, limit),
        {
            revalidateOnFocus: true,
            keepPreviousData: true,
            dedupingInterval: 5000,
        }
    );

    const auctions = data?.auctions || [];
    const pagination = data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 };

    useEffect(() => {
        if (!isLoading) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage, isLoading]);

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
    const getAuctionStatus = (endsAtIST: Date, apiStatus?: string) => {
        const status = apiStatus?.toUpperCase();
        if (status === "SOLD" || status === "EXPIRED") return "ended";

        const now = new Date();
        const end = new Date(endsAtIST);
        const diffMs = end.getTime() - now.getTime();
        const hoursLeft = diffMs / (1000 * 60 * 60);

        if (hoursLeft <= 0) return "ended";
        if (hoursLeft < 2) return "endingSoon";
        if (hoursLeft > 24 * 7) return "upcoming";
        return "live";
    };

    // Filter auctions based on category, search, and status
    const filteredAuctions = auctions.filter((auction) => {
        const matchesCategory = !selectedCategory || auction.category.toLowerCase() === selectedCategory.toLowerCase();
        const matchesSearch = !searchQuery ||
            auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            auction.description.toLowerCase().includes(searchQuery.toLowerCase());

        // Status filtering
        const status = getAuctionStatus(auction.endsAtIST, auction.status);
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
                return new Date(a.endsAtIST).getTime() - new Date(b.endsAtIST).getTime();
            case "price-low":
                return a.currentBid - b.currentBid;
            case "price-high":
                return b.currentBid - a.currentBid;
            case "newest":
                return new Date(b.endsAtIST).getTime() - new Date(a.endsAtIST).getTime();
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
        setStatusFilters({ live: false, upcoming: false, endingSoon: false });
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

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Refreshing auction list...</p>
                        </div>
                    ) : sortedAuctions.length > 0 ? (
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

                    {!isLoading && pagination.totalPages > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4"
                            >
                                Previous
                            </Button>

                            <div className="flex items-center gap-1 mx-2">
                                {[...Array(pagination.totalPages)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={currentPage === i + 1 ? "default" : "outline"}
                                        size="icon"
                                        className="h-10 w-10 font-bold"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                                disabled={currentPage === pagination.totalPages}
                                className="px-4"
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AuctionsPage() {
    return (
        <Suspense fallback={
            <div className="container py-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading auctions...</p>
            </div>
        }>
            <AuctionsPageContent />
        </Suspense>
    );
}
