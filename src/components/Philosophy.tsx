'use client';

export default function Philosophy() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-6">
      <div className="max-w-md w-full space-y-16">
        {/* Main philosophy */}
        <div className="space-y-8">
          <div className="space-y-6 text-center">
            <p className="text-xl text-white/80 font-light tracking-wide leading-loose">
              체력은 정신력.
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-px bg-gradient-to-r from-emerald-500/30 to-[#C4A265]/30" />
            </div>
            <p className="text-xl text-white/80 font-light tracking-wide leading-loose">
              정신력은 의사결정.
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-px bg-gradient-to-r from-[#C4A265]/30 to-emerald-500/30" />
            </div>
            <p className="text-xl text-white/80 font-light tracking-wide leading-loose">
              의사결정은 내 삶.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C4A265]/30 to-transparent" />
          </div>

          <p className="text-center text-lg text-emerald-400/80 font-medium tracking-[0.15em]">
            지속가능한 삶을 위한 원칙.
          </p>
        </div>

        {/* Visual chain */}
        <div className="flex items-center justify-center gap-3 text-white/20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🏋️</span>
            <span className="text-[10px] tracking-wider text-[#C4A265]/40">BODY</span>
          </div>
          <svg className="w-6 h-6 text-[#C4A265]/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14m-4-4 4 4-4 4" />
          </svg>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🧠</span>
            <span className="text-[10px] tracking-wider text-[#C4A265]/40">MIND</span>
          </div>
          <svg className="w-6 h-6 text-[#C4A265]/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14m-4-4 4 4-4 4" />
          </svg>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⚡</span>
            <span className="text-[10px] tracking-wider text-emerald-400/40">DECISION</span>
          </div>
          <svg className="w-6 h-6 text-emerald-500/20" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M5 12h14m-4-4 4 4-4 4" />
          </svg>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🌱</span>
            <span className="text-[10px] tracking-wider text-emerald-400/40">LIFE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
