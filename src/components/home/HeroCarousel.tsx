"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_AUCTIONS } from "@/lib/mock-data";

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const featured = MOCK_AUCTIONS.slice(0, 3); // Top 3 featured

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % featured.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [featured.length]);

    const next = () => setCurrent((prev) => (prev + 1) % featured.length);
    const prev = () => setCurrent((prev) => (prev - 1 + featured.length) % featured.length);

    return (
        <div className="relative h-[500px] w-full overflow-hidden bg-black text-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={featured[current].image}
                        alt={featured[current].title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 flex items-center justify-between p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prev}
                    className="z-10 text-white hover:bg-white/20 hover:text-white"
                >
                    <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="z-10 text-white hover:bg-white/20 hover:text-white"
                >
                    <ChevronRight className="h-8 w-8" />
                </Button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
                <div className="container mx-auto">
                    <motion.div
                        key={current + "-text"}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl space-y-4"
                    >
                        <span className="inline-block rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
                            Featured Auction
                        </span>
                        <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                            {featured[current].title}
                        </h1>
                        <p className="text-lg text-gray-200 line-clamp-2">
                            {featured[current].description}
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Link href={`/auctions/${featured[current].id}`}>
                                <Button size="lg" className="rounded-full text-lg px-8">
                                    Bid Now <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-300">Current Bid</span>
                                <span className="text-xl font-bold">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(featured[current].currentBid)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 flex gap-2">
                {featured.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-2 w-2 rounded-full transition-all ${index === current ? "w-8 bg-white" : "bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
