"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { List, Bookmark, Search, Settings, X } from "lucide-react"

interface ReaderMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenSettings: () => void
}

export function ReaderMenu({ isOpen, onClose, onOpenSettings }: ReaderMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Reader Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                // TODO: Implement table of contents
                onClose()
              }}
            >
              <List className="h-5 w-5" />
              <span>Table of Contents</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                // TODO: Implement bookmarks
                onClose()
              }}
            >
              <Bookmark className="h-5 w-5" />
              <span>Bookmarks</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                // TODO: Implement search
                onClose()
              }}
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </Button>

            <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={onOpenSettings}>
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
