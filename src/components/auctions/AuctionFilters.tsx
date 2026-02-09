"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/mock-data";
import { X } from "lucide-react";

export function AuctionFilters() {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="mb-4 text-lg font-semibold">Search</h3>
                <Input placeholder="Search keywords..." />
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold">Categories</h3>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                        <Badge
                            key={category.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-secondary transition-colors px-3 py-1"
                        >
                            {category.name}
                        </Badge>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold">Price Range</h3>
                <div className="flex items-center gap-2">
                    <Input type="number" placeholder="Min" className="w-24" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="number" placeholder="Max" className="w-24" />
                </div>
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold">Status</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" defaultChecked />
                        Live Auctions
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                        Upcoming
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-input text-primary focus:ring-primary" />
                        Ending Soon
                    </label>
                </div>
            </div>

            <Button className="w-full" variant="outline">
                <X className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
        </div>
    );
}
