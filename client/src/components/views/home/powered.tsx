export function Powered() {
    return (
        <div className=" w-full overflow-hidden py-10">
            <div className="mx-auto w-full max-w-2xl">
                <div className="text-center text-3xl text-foreground">
                    <span className="text-indigo-900 dark:text-indigo-200">
                        Powered by the best.
                    </span>
                </div>

                <div className="mt-10 grid grid-cols-5 text-zinc-900 dark:text-white">
                    <div className="flex items-center gap-px font-bold text-xl">
                        <img
                            src="/public/inj-logo.png"
                            width={28}
                            height={28}
                        />
                        <span>Injective</span>
                    </div>
                    <div className="flex items-center gap-px font-bold text-lg">
                        <img
                            src="/public/elizaos.webp"
                            className="h-4 w-auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
