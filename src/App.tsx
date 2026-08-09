import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
      <div className="relative group">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-300"></div>
        
        {/* Card */}
        <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-10 flex flex-col items-center shadow-2xl">
          <div className="mb-6 inline-flex items-center justify-center p-3 bg-white/5 rounded-xl border border-white/10">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400 mb-4 tracking-tight">
            Hello World!
          </h1>
          
          <p className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed">
            Seja bem-vindo ao Open Task Manager. Criado com React, Vite, Capacitor e o novo Tailwind CSS v4.
          </p>
          
          <button
            onClick={() => setCount((c) => c + 1)}
            className="group relative px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all rounded-full font-medium text-white shadow-lg flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="text-indigo-300">Cliques:</span>
              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md font-mono">{count}</span>
            </span>
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-slate-500 text-sm font-medium tracking-wide flex gap-4">
        <span>React</span>
        <span>•</span>
        <span>Tailwind v4</span>
        <span>•</span>
        <span>Capacitor</span>
      </div>
    </div>
  )
}

export default App
