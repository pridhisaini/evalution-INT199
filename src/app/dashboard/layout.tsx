export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] py-8">
            <aside className="hidden w-[200px] flex-col md:flex">
                <nav className="grid items-start gap-2">
                    <div className="group flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-accent-foreground">
                        <span>Overview</span>
                    </div>
                    <div className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-transparent text-foreground">
                        <span>Active Bids</span>
                    </div>
                    <div className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-transparent text-foreground">
                        <span>Won Auctions</span>
                    </div>
                    <div className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-transparent text-foreground">
                        <span>Settings</span>
                    </div>
                </nav>
            </aside>
            <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
