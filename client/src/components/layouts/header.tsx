import { Button } from "../ui/button";
import { Banner } from "../banner";
import { HelpDialog } from "../help-dialogue";
import LogoRender from "../logo";
// import NavBar from "./nav";
import { UserDropdownMenu } from "../user-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { NavLink, useLocation } from "react-router";
import { SidebarTrigger } from "../ui/sidebar";
import { SelectModelCombobox } from "../select-model-combobox";

export default function Header() {
    const location = useLocation();

    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;
    const quantixAgent =
        agents &&
        agents.find(
            (agent: { name: string; id: string }) => agent.name === "Quantix",
        );

    return (
        <header className="bg-background/10 bg-opacity-20 backdrop-blur sticky top-0  z-40 ">
            <Banner
                message="🎉 New features coming soon!"
                height="2rem"
                variant="rainbow"
                id="1"
            />
            <div className=" flex items-center justify-between gap-3  pl-2 pr-4 md:pl-3.5 md:pr-5  h-[3rem] ">
                {location.pathname === "/" ? <LogoRender /> : null}
                {location.pathname === "/" ? null : <SelectModelCombobox />}

                {/* <NavBar /> */}
                <div className="flex items-center ms-auto gap-x-3.5">
                    <HelpDialog />

                    {location.pathname === "/" ? null : <UserDropdownMenu />}

                    {location.pathname === "/" ? (
                        <NavLink
                            to={quantixAgent ? `/chat/${quantixAgent.id}` : "/"}
                            className="w-full grow"
                        >
                            <Button
                                disabled={query.isLoading}
                                className="text-xs h-8"
                            >
                                Get Started
                            </Button>
                        </NavLink>
                    ) : null}
                </div>
            </div>
            {location.pathname !== "/" ? (
                <SidebarTrigger className="absolute left-1 -bottom-10 z-50" />
            ) : null}
        </header>
    );
}
