'use client'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}
