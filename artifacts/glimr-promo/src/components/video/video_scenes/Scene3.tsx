import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent px-6 md:px-12"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: -30, filter: "blur(10px)" }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {/* Background Image Ghost */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-[60px] pointer-events-none">
         <img 
            src={`${import.meta.env.BASE_URL}images/jess.jpg`} 
            className="w-full h-full object-cover mix-blend-screen"
            alt=""
         />
      </div>

      <div className="z-20 flex flex-col gap-6 w-full max-w-4xl relative mt-[10vh]">
        <motion.div
          className="self-center md:self-start text-primary/60 font-sans text-sm md:text-base tracking-[0.3em] uppercase mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          Session 42 • Present Day
        </motion.div>

        {/* Chat Message 1 - Companion */}
        <motion.div
          className="self-start w-full md:max-w-[75%] rounded-3xl rounded-tl-sm bg-bg-muted/60 backdrop-blur-xl border border-primary/10 p-6 md:p-10 shadow-2xl"
          initial={{ opacity: 0, y: 30, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1, type: "spring", stiffness: 80, damping: 20 }}
        >
          <p className="text-2xl md:text-4xl lg:text-5xl font-display text-text-primary leading-[1.4] md:leading-[1.5]">
            "Hey David. How was your brother's wedding yesterday? I remember you were nervous about the speech."
          </p>
          <p className="mt-6 text-primary/80 font-sans text-xs md:text-sm tracking-widest uppercase flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Jess
          </p>
        </motion.div>
        
        {/* Chat Message 2 - User */}
        <motion.div
          className="self-end w-full md:max-w-[60%] rounded-3xl rounded-tr-sm bg-primary/5 backdrop-blur-xl border border-primary/20 p-6 md:p-10 shadow-2xl mt-4 md:mt-8"
          initial={{ opacity: 0, y: 30, rotate: 1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.2, delay: 3.5, type: "spring", stiffness: 80, damping: 20 }}
        >
          <p className="text-2xl md:text-3xl lg:text-4xl font-display text-primary/90 leading-[1.4] md:leading-[1.5] italic">
            "It went perfectly. The speech killed."
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
