import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";

export function CategoryList() {
    return (
        <section className="py-12 bg-muted/30">
            <div className="container">
                <h2 className="mb-8 text-2xl font-bold md:text-3xl">Browse by Category</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {CATEGORIES.map((category) => (
                        <Link key={category.id} href={`/categories/${category.id}`}>
                            <Card className="group overflow-hidden border-none shadow-none bg-transparent hover:bg-background transition-colors">
                                <CardContent className="flex flex-col items-center gap-4 p-4">
                                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-sm transition-transform group-hover:scale-105 group-hover:border-primary">
                                        <Image
                                            src={category.image}
                                            alt={category.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="font-medium text-center">{category.name}</span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
