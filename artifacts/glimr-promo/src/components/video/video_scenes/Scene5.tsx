import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-dark"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center justify-center relative z-20">
        {/* Brand Lockup */}
        <motion.div
          className="flex items-center gap-6 mb-8"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo Mark (abstract geometric spark) */}
          <div className="w-16 h-16 relative flex items-center justify-center">
             <motion.div 
               className="absolute w-full h-[2px] bg-primary rounded-full"
               initial={{ rotate: -45, scale: 0 }}
               animate={{ rotate: 45, scale: 1 }}
               transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
             />
             <motion.div 
               className="absolute w-full h-[2px] bg-primary rounded-full"
               initial={{ rotate: 45, scale: 0 }}
               animate={{ rotate: -45, scale: 1 }}
               transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
             />
             <motion.div 
               className="absolute w-12 h-12 border border-primary/40 rounded-full"
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
             />
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-widest text-text-primary uppercase drop-shadow-2xl">
            Glimr
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.div
          className="text-primary italic font-light text-2xl md:text-4xl text-center font-display overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
        >
           <motion.span 
             className="inline-block"
             initial={{ y: "100%" }}
             animate={{ y: 0 }}
             transition={{ duration: 1.2, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
           >
             Your companion. Always present.
           </motion.span>
        </motion.div>
      </div>

      {/* Subtle Light Flare */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[50vh] bg-primary/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 4, delay: 1, ease: "easeOut" }}
      />
    </motion.div>
  );
}
