import { GradientTracing } from "@/components/ui/gradient-tracing";

const Demo = () => (
    <GradientTracing
        width={200}
        height={200}
        path="M100,100 m0,-75 a75,75 0 1,1 -0.1,0 z"
        gradientColors={["#7B68EE", "#7B68EE", "#3498DB"]}
    />
);

export { Demo };
