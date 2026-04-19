import { SystemLoader } from '@/components/ui/SystemLoader'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#0B0F14] z-50 flex items-center justify-center">
      <SystemLoader message="FETCHING_DATA_STREAM..." />
    </div>
  )
}
