import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ModelProviderState {
    selectedModelProvider: string;
    setSelectedModelProvider: (model: string) => void;
}

export const useModelProviderStore = create<ModelProviderState>()(
    persist(
        (set) => ({
            selectedModelProvider: "google",
            setSelectedModelProvider: (model) =>
                set({ selectedModelProvider: model }),
        }),
        {
            name: "provider-storage",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
