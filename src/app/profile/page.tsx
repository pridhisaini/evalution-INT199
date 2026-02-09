"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your account settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">User ID</label>
                            <div className="p-3 bg-secondary/50 rounded-md font-mono">{user.id}</div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <div className="p-3 bg-secondary/50 rounded-md">{user.email}</div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Balance</label>
                            <div className="p-3 bg-secondary/50 rounded-md font-semibold text-green-600 dark:text-green-400">
                                ${Number(user.balance).toFixed(2)}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                            <div className="p-3 bg-secondary/50 rounded-md">
                                {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="text-lg font-semibold mb-3">Won Auctions</h3>
                        {user.wonAuctions && user.wonAuctions.length > 0 ? (
                            <div className="grid gap-2">
                                {/* Map through won auctions here when structure is known */}
                                <div className="p-4 border rounded-md text-center text-muted-foreground">
                                    {user.wonAuctions.length} auctions won
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 border border-dashed rounded-md text-center text-muted-foreground">
                                No auctions won yet.
                            </div>
                        )}
                    </div>
                    <div className="pt-4">
                        <Button variant="destructive" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
