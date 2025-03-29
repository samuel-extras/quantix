import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

import {
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Palette className=" size-4 rotate-0 scale-100 transition-all " />
                <span className="text-sm ml-2">Theme</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                        <Sun />
                        <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                        <Moon />
                        <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                        <Monitor />
                        <span>System</span>
                    </DropdownMenuItem>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    );
}
