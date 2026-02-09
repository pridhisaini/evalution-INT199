"use client";

import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";

export default function CategoriesPage() {
    return (
        <div className="container py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Browse Categories</h1>
                <p className="text-muted-foreground mt-2">
                    Explore our curated collection of unique items across all categories.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORIES.map((category) => (
                    <Link key={category.id} href={`/auctions?category=${category.id}`}>
                        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <p className="text-sm text-muted-foreground">
                                    Browse all {category.name.toLowerCase()} auctions
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
