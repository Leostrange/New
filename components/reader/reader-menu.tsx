"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { List, Bookmark, Search, Settings, X, ChevronRight, ArrowLeft } from "lucide-react"

interface ReaderMenuProps {
  isOpen: boolean
  onClose: () => void
  onOpenSettings: () => void
  currentPage: number
  totalPages: number
  onGoToPage: (page: number) => void
}

export function ReaderMenu({ isOpen, onClose, onOpenSettings, currentPage, totalPages, onGoToPage }: ReaderMenuProps) {
  const [showTableOfContents, setShowTableOfContents] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [goToPageInput, setGoToPageInput] = useState("")

  if (!isOpen) return null

  const tableOfContents = [
    { title: "Пролог", page: 0 },
    { title: "Глава 1: Начало", page: 2 },
    { title: "Глава 2: Конфликт", page: 8 },
    { title: "Глава 3: Решение", page: 15 },
    { title: "Эпилог", page: 22 },
  ]

  const bookmarks = [
    { title: "Важная сцена", page: 5, note: "Поворотный момент истории" },
    { title: "Любимый персонаж", page: 12, note: "Первое появление героя" },
    { title: "Эпическая битва", page: 18, note: "Лучшая сцена боя" },
  ]

  const handleGoToPage = () => {
    const pageNum = Number.parseInt(goToPageInput) - 1
    if (pageNum >= 0 && pageNum < totalPages) {
      onGoToPage(pageNum)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Reader Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[60vh]">
            {!showTableOfContents && !showBookmarks && !showSearch && (
              <div className="p-6 space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setShowTableOfContents(true)}
                >
                  <List className="h-5 w-5" />
                  <span>Table of Contents</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => setShowBookmarks(true)}
                >
                  <Bookmark className="h-5 w-5" />
                  <span>Bookmarks</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={() => setShowSearch(true)}>
                  <Search className="h-5 w-5" />
                  <span>Search</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button variant="ghost" className="w-full justify-start gap-3 h-12" onClick={onOpenSettings}>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <div className="pt-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder={`Страница (1-${totalPages})`}
                      value={goToPageInput}
                      onChange={(e) => setGoToPageInput(e.target.value)}
                      type="number"
                      min="1"
                      max={totalPages}
                    />
                    <Button onClick={handleGoToPage} disabled={!goToPageInput}>
                      Перейти
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {showTableOfContents && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setShowTableOfContents(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">Table of Contents</h3>
                </div>
                <div className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-between h-auto p-3"
                      onClick={() => {
                        onGoToPage(item.page)
                        onClose()
                      }}
                    >
                      <span className="text-left">{item.title}</span>
                      <span className="text-sm text-muted-foreground">стр. {item.page + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showBookmarks && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setShowBookmarks(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">Bookmarks</h3>
                </div>
                <div className="space-y-3">
                  {bookmarks.map((bookmark, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        onGoToPage(bookmark.page)
                        onClose()
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{bookmark.title}</h4>
                            <p className="text-sm text-muted-foreground">{bookmark.note}</p>
                          </div>
                          <span className="text-sm text-muted-foreground">стр. {bookmark.page + 1}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {showSearch && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="ghost" size="sm" onClick={() => setShowSearch(false)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="font-semibold">Search</h3>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Поиск по тексту..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <div className="text-sm text-muted-foreground">
                      Поиск функциональности будет реализован в следующих версиях
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
