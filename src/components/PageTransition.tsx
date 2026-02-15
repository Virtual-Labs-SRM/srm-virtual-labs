import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
    },
    in: {
        opacity: 1,
    },
    out: {
        opacity: 0,
    },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const pageTransition = {
    type: "tween" as const,
    ease: "linear" as const,
    duration: 0.2,
};

const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="w-full"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
