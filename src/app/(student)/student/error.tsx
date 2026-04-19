'use client'

export default function Error({ error }: { error: Error }) {
  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl mt-6">
       <div className="p-12 text-sm text-red-500 border border-red-500/20 bg-red-500/5 mt-8 font-mono text-center uppercase tracking-widest leading-relaxed">
         <p className="font-black mb-4">SYSTEM_FAILURE_DETECTED</p>
         <p>AN UNEXPECTED RUNTIME EXCEPTION HAS COMPROMISED THIS MODULE.</p>
         <p className="mt-4 opacity-60">TRACE: {error.message}</p>
       </div>
    </div>
  )
}
