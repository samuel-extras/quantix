import { useQuery } from "@tanstack/react-query";
// import info from "@/lib/info.json";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    // SidebarGroupContent,
    // SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    // SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import { NavLink } from "react-router";
import type { UUID } from "@elizaos/core";
import { Cog, Github } from "lucide-react";
import ConnectionStatus from "./connection-status";
import LogoRender from "./logo";
import { FeedbackDialog } from "./feedback-dialog";

export function AppSidebar() {
    const query = useQuery({
        queryKey: ["agents"],
        queryFn: () => apiClient.getAgents(),
        refetchInterval: 5_000,
    });

    const agents = query?.data?.agents;
    const quantixAgent =
        agents &&
        agents.find(
            (agent: { name: string; id: UUID }) => agent.name === "Quantix",
        );
    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <LogoRender />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    {/* <SidebarGroupLabel>Agents</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {query?.isPending ? (
                                <div>
                                    {Array.from({ length: 5 }).map(
                                        (_, index) => (
                                            <SidebarMenuItem key={index}>
                                                <SidebarMenuSkeleton />
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div>
                                    {agents?.map(
                                        (agent: { id: UUID; name: string }) => (
                                            <SidebarMenuItem key={agent.id}>
                                                <NavLink
                                                    to={`/chat/${agent.id}`}
                                                >
                                                    <SidebarMenuButton
                                                        isActive={location.pathname.includes(
                                                            agent.id,
                                                        )}
                                                    >
                                                        <User />
                                                        <span>
                                                            {agent.name}
                                                        </span>
                                                    </SidebarMenuButton>
                                                </NavLink>
                                            </SidebarMenuItem>
                                        ),
                                    )}
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent> */}
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <FeedbackDialog />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink
                            to="https://github.com/samuel-extras/quantix"
                            target="_blank"
                        >
                            <SidebarMenuButton size="sm">
                                <Github /> github
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <NavLink
                            to={
                                quantixAgent
                                    ? `/settings/${quantixAgent.id}`
                                    : "/"
                            }
                            key={quantixAgent ? quantixAgent.id : ""}
                        >
                            <SidebarMenuButton size="sm">
                                <Cog /> Settings
                            </SidebarMenuButton>
                        </NavLink>
                    </SidebarMenuItem>
                    <ConnectionStatus />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
