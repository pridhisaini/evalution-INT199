import { HeroCarousel } from "@/components/home/HeroCarousel";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { MOCK_AUCTIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAuctions } from "@/services/auctionService";

export default async function Home() {
  const { auctions: realAuctions } = await getAuctions(1, 4);

  // Use real auctions if available, otherwise fallback to mock
  const trendingAuctions = realAuctions.length > 0
    ? realAuctions
    : MOCK_AUCTIONS.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <HeroCarousel />

      <section className="py-16 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Trending Auctions</h2>
            <p className="text-muted-foreground mt-2">Don't miss out on these popular items ending soon.</p>
          </div>
          <Link href="/auctions">
            <Button variant="outline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trendingAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container text-center max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Start Selling Today</h2>
          <p className="text-primary-foreground/80 text-lg">
            Join thousands of sellers and reach a global audience of collectors.
            It's fast, easy, and secure.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/sell">
              <Button size="lg" variant="secondary" className="px-8">
                Register as Seller
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="outline" className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
