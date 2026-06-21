import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppShell } from '../AppShell';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500), // click toggle
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 bg-[#FDFCFB]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <AppShell activeTab="Assignments">
        <div className="flex h-full w-full">
          {/* Left Column: Lecture */}
          <div className="flex-[3] flex flex-col border-r border-[#E2E8F0] bg-white h-full relative">
            <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="text-sm font-medium text-[#718096]">1.2 Number and letter series: spotting what comes next</div>
              <div className="flex items-center bg-[#EFECE6] rounded-md p-1">
                <div className={`px-3 py-1 text-xs font-medium rounded ${phase === 0 ? 'bg-white shadow text-[#1A2B3D]' : 'text-[#718096]'}`}>Short</div>
                <div className={`px-3 py-1 text-xs font-medium rounded ${phase === 1 ? 'bg-white shadow text-[#1A2B3D]' : 'text-[#718096]'}`}>Medium</div>
                <div className="px-3 py-1 text-xs font-medium text-[#718096] rounded">Long</div>
              </div>
            </div>
            <div className="flex-1 p-10 overflow-hidden relative">
              <motion.h1 className="text-3xl font-display font-bold text-[#1A2B3D] mb-6">Spotting what comes next</motion.h1>
              
              <AnimatePresence mode="popLayout">
                {phase === 0 ? (
                  <motion.div
                    key="short"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg text-[#4A5568] leading-relaxed space-y-4"
                  >
                    <p>A series is an ordered sequence governed by a hidden rule, and your task is to recover that rule.</p>
                    <p>That's the core idea behind series questions. Instead of guessing, you test each step for a consistent relationship — a difference, a ratio, or an alternating pattern.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg text-[#4A5568] leading-relaxed space-y-4"
                  >
                    <p>A series is an ordered sequence governed by a hidden rule, and your task is to recover that rule.</p>
                    <p>That's the core idea behind series questions. Instead of guessing, you test each step for a consistent relationship — a difference, a ratio, or an alternating pattern.</p>
                    <p>Work it like an experiment. Compare adjacent terms, isolate the operation that holds across the whole sequence, then apply it once more. The rule isn't random; it encodes the <em>structure</em>.</p>
                    <div className="bg-[#FDFCFB] p-4 border border-[#E2E8F0] rounded-md font-mono text-sm mt-4 text-[#1A2B3D]">
                      2, 4, 8, 16, … → rule: ×2<br/>
                      next term → 16 × 2 = 32
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Right Column: Blank AI Tutor placeholder for next scene */}
          <div className="flex-[2] bg-[#FDFCFB] flex flex-col p-6">
            <div className="text-sm font-bold text-[#1A2B3D] mb-4">AI TUTOR</div>
            <div className="flex-1 border border-[#E2E8F0] rounded-lg bg-white flex items-center justify-center text-[#718096] text-sm">
              Ready to practice?
            </div>
          </div>

          <motion.div 
            className="absolute z-50 w-6 h-6"
            initial={{ x: '40vw', y: '25vh' }}
            animate={{ x: '51vw', y: '6vh' }} // Click the Medium toggle
            transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A2B3D" strokeWidth="2" className="drop-shadow-md">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" fill="white" />
            </svg>
          </motion.div>
        </div>
      </AppShell>
    </motion.div>
  );
}
