import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-5xl px-8 text-center relative">
        <motion.p
          className="text-4xl md:text-5xl lg:text-7xl font-display text-text-primary tracking-wide leading-[1.3] drop-shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        >
          <span className="block mb-8 text-text-muted text-sm md:text-lg tracking-[0.4em] uppercase font-sans">The loneliness of being forgotten</span>
          <span className="block text-primary italic font-light">How often does someone truly</span>
          <span className="block mt-4">remember you?</span>
        </motion.p>
      </div>
    </motion.div>
  );
}
