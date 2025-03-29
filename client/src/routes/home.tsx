// import { useQuery } from "@tanstack/react-query";
// import { Cog } from "lucide-react";
// import PageTitle from "@/components/page-title";
// import { Button } from "@/components/ui/button";
// import {
//     Card,
//     CardContent,
//     CardFooter,
//     CardHeader,
//     CardTitle,
// } from "@/components/ui/card";
// import { apiClient } from "@/lib/api";
// import { NavLink } from "react-router";
// import type { UUID } from "@elizaos/core";
// import { formatAgentName } from "@/lib/utils";
import { Hero } from "@/components/views/home/hero";
import Header from "@/components/layouts/header";
import { FeaturesGrid } from "@/components/views/home/feature1";
import { Footer } from "@/components/layouts/footer";
import { Powered } from "@/components/views/home/powered";
import { FaqSection } from "@/components/views/home/faq";
import { CTASection } from "@/components/views/home/cta";
import { NewsletterSection } from "@/components/views/home/newsletter";

export default function Home() {
    // const query = useQuery({
    //     queryKey: ["agents"],
    //     queryFn: () => apiClient.getAgents(),
    //     refetchInterval: 5_000,
    // });

    // const agents = query?.data?.agents;

    return (
        <>
            <Header />
            <Hero />
            <FeaturesGrid />
            <Powered />
            <FaqSection />
            <CTASection />
            <NewsletterSection />
            <Footer />
        </>
    );
}
