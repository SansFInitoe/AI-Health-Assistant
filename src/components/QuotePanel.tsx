import React from 'react';
import { Quote } from 'lucide-react';

export function QuotePanel() {
  return (
    <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-3xl border border-slate-700/50 p-6 relative overflow-hidden">
      {/* Large background quote icon */}
      <Quote className="absolute -top-4 -right-4 w-32 h-32 text-slate-800/30 rotate-12" />
      
      <div className="relative z-10">
        <Quote className="w-8 h-8 text-cyan-400 mb-4" />
        <p className="text-xl font-medium text-white leading-snug italic mb-6">
          "Your health is an investment, not an expense."
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-1 bg-cyan-500 rounded-full"></div>
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Mindset Check
          </span>
        </div>
      </div>
    </div>
  );
}
