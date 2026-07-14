import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  scene1: 7000,  // OPEN — hook, let it land
  scene2: 9000,  // MEET — companion reveal, time to absorb each face
  scene3: 10000, // CONVERSATION — let the exchange breathe
  scene4: 10000, // MEMORY — cinematic hold on the "they remembered" moment
  scene5: 9000,  // CLOSE — brand lockup, lingering resolution
}; // Total: 45s

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({
    durations,
    loop,
  });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '') as keyof typeof SCENE_DURATIONS;
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div
      className="w-full h-screen overflow-hidden relative"
      style={{ backgroundColor: 'var(--color-bg-dark)' }}
    >
      {/* Background Layer - Persistent */}
      <div className="absolute inset-0 z-0 bg-bg-dark overflow-hidden">
        {/* Ambient video background spanning all scenes except the last */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: sceneIndex === 4 ? 0 : 0.6,
            scale: sceneIndex === 3 ? 1.1 : 1.05
          }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          {sceneIndex < 3 && (
            <video
              src={`${import.meta.env.BASE_URL}videos/ambient-gold.mp4`}
              className="w-full h-full object-cover mix-blend-screen opacity-50"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
          {sceneIndex === 3 && (
            <video
              src={`${import.meta.env.BASE_URL}videos/memory-threads.mp4`}
              className="w-full h-full object-cover mix-blend-screen opacity-70"
              autoPlay
              muted
              loop
              playsInline
            />
          )}
        </motion.div>

        {/* Global texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
