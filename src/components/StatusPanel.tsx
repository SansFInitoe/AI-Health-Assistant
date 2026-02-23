import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'motion/react';

export function StatusPanel() {
  return (
    <div className="bg-[#131b2f] rounded-3xl border border-slate-800/50 p-8 flex-1 flex items-center justify-center relative overflow-hidden min-h-[250px]">
      {/* Background concentric circles */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <div className="w-[400px] h-[400px] rounded-full border border-cyan-500/20 absolute"></div>
        <div className="w-[300px] h-[300px] rounded-full border border-cyan-500/30 absolute"></div>
        <div className="w-[200px] h-[200px] rounded-full border border-cyan-500/40 absolute"></div>
      </div>
      
      {/* Glowing Robot Icon */}
      <div className="relative z-10">
        <motion.div 
          animate={{ boxShadow: ['0 0 20px rgba(6,182,212,0.2)', '0 0 60px rgba(6,182,212,0.6)', '0 0 20px rgba(6,182,212,0.2)'] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="w-24 h-24 rounded-full bg-[#0f1629] border-2 border-cyan-500/50 flex items-center justify-center"
        >
          <Bot className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    </div>
  );
}
