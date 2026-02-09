"use client";

import Image from "next/image";
import Link from "next/link";
import { Auction } from "@/lib/mock-data";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/shared/Countdown"; // Need to update import path if moved
import { Button } from "@/components/ui/button";

interface AuctionCardProps {
    auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <Image
                    src={auction.image}
                    alt={auction.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="backdrop-blur-md bg-white/80 dark:bg-black/50">
                        {auction.category}
                    </Badge>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                    <Link href={`/auctions/${auction.id}`}>
                        <Button variant="secondary" className="translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                            View Auction
                        </Button>
                    </Link>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="line-clamp-1 text-lg font-semibold">{auction.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground mt-1 min-h-[40px]">
                    {auction.description}
                </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
                <div>
                    <p className="text-xs text-muted-foreground">Current Bid</p>
                    <p className="font-bold text-primary">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(auction.currentBid)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground">Ends in</p>
                    <Countdown endTime={auction.endTime} className="text-sm font-medium text-destructive" />
                </div>
            </CardFooter>
        </Card>
    );
}
