"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useModelProviderStore } from "@/stores/model-provider-store";

const models = [
    {
        value: "openai",
        label: "Open AI",
        imgWhite: "/openai.png",
        imgBlack: "/openai1.png",
    },
    {
        value: "anthropic",
        label: "Anthropic",
        imgWhite: "/anthropic.png",
        imgBlack: "/anthropic1.png",
    },
    {
        value: "grok",
        label: "Grok",
        imgWhite: "/grok.png",
        imgBlack: "/grok1.png",
    },
    {
        value: "google",
        label: "Gemini",
        imgWhite: "/gemini.png",
        imgBlack: "/gemini1.png",
    },
    {
        value: "deepseek",
        label: "Deepseek",
        imgWhite: "/deepseek.png",
        imgBlack: "/deepseek1.png",
    },
];

export function SelectModelCombobox() {
    const [open, setOpen] = React.useState(false);
    const selectedModel = useModelProviderStore(
        (state) => state.selectedModelProvider,
    );
    const setSelectedModel = useModelProviderStore(
        (state) => state.setSelectedModelProvider,
    );

    const commandListRef = React.useRef<HTMLDivElement>(null);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    <span className="flex gap-x-2 items-center line-clamp-1">
                        {selectedModel ? (
                            <Avatar className="size-4 rounded-sm dark:hidden">
                                <AvatarImage
                                    src={
                                        selectedModel
                                            ? models.find(
                                                  (model) =>
                                                      model.value ===
                                                      selectedModel,
                                              )?.imgBlack
                                            : "/mira.png"
                                    }
                                    alt="Quantix"
                                />
                                <AvatarFallback></AvatarFallback>
                            </Avatar>
                        ) : null}
                        {selectedModel ? (
                            <Avatar className="size-4 rounded-sm hidden dark:block">
                                <AvatarImage
                                    src={
                                        selectedModel
                                            ? models.find(
                                                  (model) =>
                                                      model.value ===
                                                      selectedModel,
                                              )?.imgWhite
                                            : "/mira.png"
                                    }
                                    alt="Quantix"
                                />
                                <AvatarFallback></AvatarFallback>
                            </Avatar>
                        ) : null}
                        {selectedModel
                            ? models.find(
                                  (model) => model.value === selectedModel,
                              )?.label
                            : "Gemini"}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0">
                <Command>
                    <CommandInput placeholder="Search model..." />
                    <CommandList
                        ref={commandListRef}
                        className="max-h-[320px] overflow-y-auto"
                    >
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup>
                            {/* {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin mx-auto" />
                            ) : null} */}
                            {models.map((model) => (
                                <CommandItem
                                    key={model.value}
                                    value={model.value}
                                    onSelect={(currentValue) => {
                                        setSelectedModel(currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <span className="flex gap-x-2 items-center ">
                                        <Avatar className="size-4 rounded-sm dark:hidden">
                                            <AvatarImage
                                                src={model.imgBlack}
                                                alt="Quantix"
                                            />
                                            <AvatarFallback></AvatarFallback>
                                        </Avatar>
                                        <Avatar className="size-4 rounded-sm hidden dark:block">
                                            <AvatarImage
                                                src={model.imgWhite}
                                                alt="Quantix"
                                            />
                                            <AvatarFallback></AvatarFallback>
                                        </Avatar>
                                        {model.label}
                                    </span>
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            selectedModel === model.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
