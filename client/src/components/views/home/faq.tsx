import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const FAQS = [
    {
        question: "What makes your platform unique?",
        answer: "Our platform stands out through its intuitive design, powerful automation capabilities, and seamless integration options. We've focused on creating a user experience that combines simplicity with advanced features.",
    },
    {
        question: "How does the pricing structure work?",
        answer: "We offer flexible, transparent pricing tiers designed to scale with your needs. Each tier includes a core set of features, with additional capabilities as you move up. All plans start with a 14-day free trial.",
    },
    {
        question: "What kind of support do you offer?",
        answer: "We provide comprehensive support through multiple channels. This includes 24/7 live chat, detailed documentation, video tutorials, and dedicated account managers for enterprise clients.",
    },
];

const FaqSection = () => {
    return (
        <section
            className={cn(
                "py-16 w-full bg-gradient-to-b from-transparent via-muted/50 to-transparent",
            )}
        >
            <div className="container">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl mx-auto text-center mb-12"
                >
                    <h2 className="text-3xl font-semibold mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text text-transparent">
                        Frequently Asked Questions
                    </h2>

                    <p className="text-sm text-muted-foreground">
                        Everything you need to know about our platform
                    </p>
                </motion.div>

                {/* FAQ Items */}
                <div className="max-w-2xl mx-auto space-y-2">
                    {FAQS.map((item, index) => (
                        <FaqItem
                            key={index}
                            question={item.question}
                            answer={item.answer}
                            index={index}
                        />
                    ))}
                </div>

                {/* Contact Section */}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-md mx-auto mt-12 p-6 rounded-lg text-center"
                >
                    <div className="inline-flex items-center justify-center p-1.5 rounded-full mb-4">
                        <Mail className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                        Still have questions?
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                        We're here to help you
                    </p>
                    <Button size="sm">Contact Support</Button>
                </motion.div>
            </div>
        </section>
    );
};

// Internal FaqItem component
const FaqItem = React.forwardRef<
    HTMLDivElement,
    {
        question: string;
        answer: string;
        index: number;
    }
>((props, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { question, answer, index } = props;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
            className={cn(
                "group rounded-lg",
                "transition-all duration-200 ease-in-out",
                "border border-border/50",
                isOpen
                    ? "bg-gradient-to-br from-background via-muted/50 to-background"
                    : "hover:bg-muted/50",
            )}
        >
            <Button
                variant="ghost"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 h-auto justify-between hover:bg-transparent"
            >
                <h3
                    className={cn(
                        "text-base font-medium transition-colors duration-200 text-left",
                        "text-foreground/70",
                        isOpen && "text-foreground",
                    )}
                >
                    {question}
                </h3>
                <motion.div
                    animate={{
                        rotate: isOpen ? 180 : 0,
                        scale: isOpen ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                        "p-0.5 rounded-full flex-shrink-0",
                        "transition-colors duration-200",
                        isOpen ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    <ChevronDown className="h-4 w-4" />
                </motion.div>
            </Button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                            transition: { duration: 0.2, ease: "easeOut" },
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                            transition: { duration: 0.2, ease: "easeIn" },
                        }}
                    >
                        <div className="px-6 pb-4 pt-2">
                            <motion.p
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -10, opacity: 0 }}
                                className="text-sm text-muted-foreground leading-relaxed"
                            >
                                {answer}
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
