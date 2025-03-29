import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SidebarMenuButton } from "./ui/sidebar";
import { Send } from "lucide-react";

function FeedbackDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <SidebarMenuButton size="sm">
                    <Send /> Feedback
                </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Send us feedback</DialogTitle>
                    <DialogDescription>
                        Watch{" "}
                        <a className="text-foreground hover:underline" href="#">
                            tutorials
                        </a>
                        , read Quantix&lsquo;s{" "}
                        <a className="text-foreground hover:underline" href="#">
                            documentation
                        </a>
                        , or join our{" "}
                        <a className="text-foreground hover:underline" href="#">
                            Discord
                        </a>{" "}
                        for community help.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-5">
                    <Textarea
                        id="feedback"
                        placeholder="How can we improve Quantix?"
                        aria-label="Send feedback"
                    />
                    <div className="flex flex-col sm:flex-row sm:justify-end">
                        <Button type="button">Send feedback</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export { FeedbackDialog };
