import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const OpeningAnimation = ({ onComplete }: { onComplete: () => void }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 500); // Wait for exit animation
        }, 2000); // Animation duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black ${!show ? "pointer-events-none" : ""}`}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
            >
                <motion.img
                    src={`${import.meta.env.BASE_URL}favicon.png`}
                    alt="SRM Logo"
                    className="w-32 h-32 mb-4"
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                />
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-4xl font-bold text-white tracking-wider"
                >
                    SRM VIRTUAL LABS
                </motion.h1>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100px" }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="h-1 bg-blue-500 mt-4 rounded-full"
                />
            </motion.div>
        </motion.div>
    );
};

export default OpeningAnimation;
