import { Github, LifeBuoy, Settings2 } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function UserDropdownMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="px-3 h-8">
                    <Settings2 />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
                <ModeToggle />
                <DropdownMenuItem disabled>
                    <Github />
                    <span>GitHub</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                    <LifeBuoy />
                    <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
