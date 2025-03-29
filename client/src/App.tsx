import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import useVersion from "./hooks/use-version";
import Header from "./components/layouts/header";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Number.POSITIVE_INFINITY,
        },
    },
});

function App() {
    useVersion();
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <div className=" antialiased">
                    <BrowserRouter>
                        <TooltipProvider delayDuration={0}>
                            <div className="flex flex-1 flex-col gap-4 size-full ">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route
                                        element={
                                            <SidebarProvider>
                                                <AppSidebar />
                                                <SidebarInset>
                                                    <Header />

                                                    <Outlet />
                                                </SidebarInset>
                                            </SidebarProvider>
                                        }
                                    >
                                        <Route
                                            path="chat/:agentId"
                                            element={<Chat />}
                                        />
                                        <Route
                                            path="settings/:agentId"
                                            element={<Overview />}
                                        />
                                    </Route>
                                </Routes>
                            </div>

                            <Toaster />
                        </TooltipProvider>
                    </BrowserRouter>
                </div>
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
