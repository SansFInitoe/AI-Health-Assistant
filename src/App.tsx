/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LiveConsultPanel } from './components/LiveConsultPanel';
import { ChatPanel } from './components/ChatPanel';
import { StatusPanel } from './components/StatusPanel';
import { QuotePanel } from './components/QuotePanel';
import { Sparkles } from 'lucide-react';

export default function App() {
  return (
    <div className="h-screen bg-[#0b1121] text-white flex flex-col font-sans selection:bg-cyan-500/30 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 min-h-0 p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Panel - Live Consult */}
        <div className="md:col-span-3 flex flex-col gap-4 min-h-0">
          <LiveConsultPanel />
        </div>

        {/* Middle Panel - Chat */}
        <div className="md:col-span-6 flex flex-col gap-4 min-h-0">
          <ChatPanel />
        </div>

        {/* Right Panel - Status & Quote */}
        <div className="md:col-span-3 flex flex-col gap-4 md:gap-6 min-h-0">
          <StatusPanel />
          <QuotePanel />
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#131b2f] border-t border-slate-800/50 py-3 px-6 flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span>Built by AIDS Students: Raman, Mulayam, Shruti, Vaishnavi, Nisha</span>
        </div>
        <div>
          <span>Advisor: <span className="text-cyan-400">Mr. Ashish Sir</span></span>
        </div>
      </footer>
    </div>
  );
}
