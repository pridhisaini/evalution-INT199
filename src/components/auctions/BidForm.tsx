"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const bidSchema = z.object({
    amount: z.coerce.number().min(1, "Bid amount must be greater than current bid"), // Validation logic should be dynamic in potential real app
});

type BidFormValues = z.infer<typeof bidSchema>;

interface BidFormProps {
    currentBid: number;
    onPlaceBid: (amount: number) => Promise<void>;
}

export function BidForm({ currentBid, onPlaceBid }: BidFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BidFormValues>({
        resolver: zodResolver(bidSchema) as any,
        defaultValues: {
            amount: currentBid + 1, // Minimum next bid
        },
    });

    async function onSubmit(data: BidFormValues) {
        if (data.amount <= currentBid) {
            form.setError("amount", { message: "Bid must be higher than current bid" });
            return;
        }

        setIsSubmitting(true);
        await onPlaceBid(data.amount);
        setIsSubmitting(false);
        form.reset({ amount: data.amount + 1 });
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Place your bid
                </label>
                <div className="flex gap-2">
                    <Input
                        type="number"
                        placeholder="Amount"
                        {...form.register("amount")}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Place Bid
                    </Button>
                </div>
                {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
            </div>
            <p className="text-xs text-muted-foreground">
                Enter any amount higher than the current bid.
            </p>
        </form>
    );
}
