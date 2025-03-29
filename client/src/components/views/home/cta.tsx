import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CTASection() {
    return (
        <section className={cn("overflow-hidden pt-0 md:pt-0")}>
            <div className="relative mx-auto flex max-w-container flex-col items-center gap-6 px-8 py-12 text-center sm:gap-8 md:py-24">
                {/* Badge */}

                <Badge
                    variant="outline"
                    className=" animate-fade-in-up delay-100"
                >
                    <span className="text-muted-foreground">
                        Get your financial freedom
                    </span>
                </Badge>

                {/* Title */}
                <h2 className="text-3xl font-semibold sm:text-5xl animate-fade-in-up delay-200">
                    Start trading with Quantix
                </h2>

                <p className="text-muted-foreground  animate-fade-in-up delay-300">
                    Start trading with ease, security and confidence on Quantix
                </p>

                {/* Action Button */}
                <Button className=" animate-fade-in-up delay-500">
                    Get started
                </Button>
            </div>
        </section>
    );
}
