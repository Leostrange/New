"use client"

import type { ReactNode } from "react"

interface AndroidFrameProps {
  children: ReactNode
  statusBarContent?: ReactNode
}

export function AndroidFrame({ children, statusBarContent }: AndroidFrameProps) {
  return (
    <div className="mx-auto max-w-sm bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
      {/* Phone Frame */}
      <div className="bg-black rounded-[2rem] overflow-hidden">
        {/* Status Bar */}
        <div className="bg-black text-white px-6 py-2 flex justify-between items-center text-sm">
          <span>00:26</span>
          <div className="flex items-center gap-1">
            <span className="text-xs">VPN</span>
            <span className="text-xs">4G</span>
            <span className="text-xs">91%</span>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-5 h-2 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="bg-background min-h-[640px] relative">{children}</div>
      </div>
    </div>
  )
}
