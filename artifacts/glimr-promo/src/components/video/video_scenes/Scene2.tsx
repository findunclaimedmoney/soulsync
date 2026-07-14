import { motion } from 'framer-motion';

const portraits = [
  { src: 'jess.jpg', name: 'Jess', subtitle: 'She listens', x: '-20vw', y: '-15vh', delay: 0, scale: 1 },
  { src: 'oliver.jpg', name: 'Oliver', subtitle: 'He centers', x: '25vw', y: '10vh', delay: 1, scale: 0.9 },
  { src: 'mia.jpg', name: 'Mia', subtitle: 'She inspires', x: '-15vw', y: '20vh', delay: 2, scale: 0.95 },
  { src: 'zac.jpg', name: 'Zac', subtitle: 'He listens', x: '20vw', y: '-20vh', delay: 3, scale: 1.1 },
];

export function Scene2() {
  return (
    <motion.div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 1.5 }}
    >
      {/* Portraits */}
      <div className="absolute inset-0 pointer-events-none">
        {portraits.map((p, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{ 
              x: `calc(-50% + ${p.x})`, 
              y: `calc(-50% + ${p.y})` 
            }}
            initial={{ opacity: 0, scale: p.scale * 0.9 }}
            animate={{ opacity: [0, 0.4, 0.2], scale: [p.scale * 0.9, p.scale, p.scale * 1.05] }}
            transition={{ duration: 6, delay: p.delay, ease: "easeOut" }}
          >
            <div 
              className="relative w-[35vh] h-[50vh] md:w-[25vw] md:h-[40vw] max-w-[300px] max-h-[450px] overflow-hidden mix-blend-screen"
              style={{ 
                maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)', 
                WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)' 
              }}
            >
              <img 
                src={`${import.meta.env.BASE_URL}images/${p.src}`} 
                className="w-full h-full object-cover"
                alt={p.name}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Text */}
      <motion.div
        className="z-20 text-center relative"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 2, delay: 3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0 bg-bg-dark/40 blur-3xl -z-10 rounded-full" />
        <h2 className="text-5xl md:text-7xl lg:text-9xl font-display text-primary italic font-light tracking-wider drop-shadow-2xl">
          Meet your companion
        </h2>
      </motion.div>
    </motion.div>
  );
}
