import { AsciiConverter } from "@/components/AsciiConverter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-neutral-200 font-mono selection:bg-lime-400 selection:text-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <header className="w-full mb-8 border-b-2 border-neutral-800 pb-6 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 relative">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-3 px-3 py-1 bg-lime-400 text-black text-[10px] font-black uppercase tracking-widest border border-lime-500">
                <span className="w-2 h-2 bg-black animate-pulse" />
                SYS_ONLINE // V.1.0.9
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                Raw<span className="text-lime-400">Str</span>ucture
              </h1>
              <p className="text-neutral-500 text-xs md:text-sm uppercase tracking-widest leading-relaxed">
                Algorithmic image digestion layer. Convert visual data to raw character matrices. No pixels, just syntax.
              </p>
            </div>
            <div className="text-right flex-col items-end hidden lg:flex mt-auto">
              <div className="text-[10px] text-neutral-600 uppercase tracking-widest mb-1 font-bold">Status: Operational</div>
              <div className="font-bold text-xs text-lime-400 uppercase tracking-wider bg-lime-400/10 px-2 py-1 border border-lime-400/30">Node: Active</div>
            </div>
          </header>

          <AsciiConverter />
        </div>
      </div>
    </main>
  );
}

