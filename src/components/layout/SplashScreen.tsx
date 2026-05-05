
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-primary text-primary-foreground">
      <div className="relative mb-8 flex flex-col items-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl border-4 border-white/30 bg-white text-primary shadow-2xl">
          {mounted && <span className="text-4xl font-black tracking-tighter">TBC</span>}
        </div>
        <div className="absolute -bottom-2 bg-white text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          EST. 2025
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-black tracking-tighter leading-none mb-1 text-primary-foreground">
            TBC
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 text-primary-foreground">
            Badminton Club
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary-foreground opacity-80" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-primary-foreground">
            Initializing System...
          </span>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] font-bold opacity-40 uppercase tracking-widest text-primary-foreground">
        Built with ❤️ by rims
      </div>
    </div>
  );
}
