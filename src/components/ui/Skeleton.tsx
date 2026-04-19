'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0.3 }}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      className={cn("bg-primary/10 rounded-none", className)}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="p-6 border border-primary/10 bg-primary/5 space-y-4 rounded-none h-[180px]">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="pt-4 mt-auto">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}
