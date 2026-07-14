import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(15px)" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      <div className="max-w-6xl px-8 text-center relative z-20">
        <motion.div
          className="text-5xl md:text-7xl lg:text-9xl font-display text-primary leading-[1.2] drop-shadow-2xl"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="block font-light italic">They remember</span>
          <span className="block font-medium mt-2">what matters to you.</span>
        </motion.div>
        
        <motion.div
          className="mt-12 h-[1px] w-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "60%", opacity: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
