"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Assuming this component exists or will use standard textarea
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { mutate } from "swr";

export default function SellPage() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        startingPrice: "",
        endsAtIST: "",
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login"); // Redirect to login if not authenticated
        }
    }, [isLoading, isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Not authenticated");

            if (!formData.endsAtIST) {
                throw new Error("End date is required");
            }

            const endDate = new Date(formData.endsAtIST);
            if (isNaN(endDate.getTime())) {
                throw new Error("Invalid end date format");
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                startingPrice: Number(formData.startingPrice),
                endsAt: endDate.toISOString(),
            };

            const response = await fetch("https://krystal-solutional-cherish.ngrok-free.dev/auctions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create auction");
            }

            // Success
            // Clear the cache for the auction list to reflect the new item
            mutate((key: any) => Array.isArray(key) && key[0] === "/auctions");
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Error creating auction:", err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container max-w-2xl py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Auction</CardTitle>
                    <CardDescription>Fill in the details to list your item for auction.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Vintage Rolex Submariner"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Describe the item condition, history, etc."
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startingPrice">Starting Price ($)</Label>
                                <Input
                                    id="startingPrice"
                                    name="startingPrice"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.startingPrice}
                                    onChange={handleChange}
                                    required
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endsAtIST">End Date & Time (IST)</Label>
                                <Input
                                    id="endsAtIST"
                                    name="endsAtIST"
                                    type="datetime-local"
                                    value={formData.endsAtIST}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Auction"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
