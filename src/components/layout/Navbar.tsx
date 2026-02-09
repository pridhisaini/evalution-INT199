"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/auctions?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <div className="mr-4 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="hidden font-bold sm:inline-block text-xl tracking-tight">
                            LiveBid
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link
                            href="/auctions"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Auctions
                        </Link>
                        {isAuthenticated && (
                            <Link
                                href="/dashboard"
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                Dashboard
                            </Link>
                        )}
                        <Link
                            href="/sell"
                            className="transition-colors hover:text-foreground/80 text-foreground/60"
                        >
                            Sell
                        </Link>
                    </nav>
                </div>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-9 py-2 mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </button>
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search auctions..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </form>
                    </div>
                    <nav className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/01.png" alt={user?.email || "User"} />
                                            <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">User</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {user?.balance !== undefined && (
                                        <>
                                            <DropdownMenuItem>
                                                Balance: ${Number(user.balance).toFixed(2)}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile" className="cursor-pointer">Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer">
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button size="sm">Sign up</Button>
                                </Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
