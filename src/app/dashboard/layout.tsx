"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { getAuctions } from "@/services/auctionService";
import { Badge } from "@/components/ui/badge";
import { Wallet, Trophy } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { user } = useAuth();
    const [wonCount, setWonCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);

    useEffect(() => {
        async function fetchCounts() {
            if (!user?.id) return;
            const { auctions } = await getAuctions(1, 100);
            const won = auctions.filter(a => a.status?.toUpperCase() === "SOLD" && a.winnerId === user.id).length;
            const active = auctions.filter(a => !a.status || ["ACTIVE", "OPEN"].includes(a.status.toUpperCase())).length;
            setWonCount(won);
            setActiveCount(active);
        }
        fetchCounts();
    }, [user?.id]);

    const routes = [
        {
            title: "Overview",
            href: "/dashboard",
        },
        {
            title: "Active Bids",
            href: "/dashboard/active-bids",
            count: activeCount,
        },
        {
            title: "Won Auctions",
            href: "/dashboard/won-auctions",
            count: wonCount,
        },
        {
            title: "Settings",
            href: "/dashboard/settings",
        },
    ];

    const balance = typeof user?.balance === 'string' ? parseFloat(user.balance) : (user?.balance || 0);

    return (
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-8">
            <aside className="hidden w-[200px] flex-col md:flex">
                <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <Wallet className="h-3 w-3" /> Balance
                    </p>
                    <p className="text-xl font-black text-primary">${balance.toLocaleString()}</p>
                </div>

                <nav className="grid items-start gap-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                                pathname === route.href ? "bg-accent text-accent-foreground" : "text-foreground"
                            )}
                        >
                            <span>{route.title}</span>
                            {route.count !== undefined && route.count > 0 && (
                                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] font-bold bg-green-500/10 text-green-600 border-green-500/20">
                                    {route.count}
                                </Badge>
                            )}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
