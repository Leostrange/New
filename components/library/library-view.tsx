"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Grid, List, Filter, SortAsc } from "lucide-react"
import { PluginsTab } from "./plugins-tab"

interface LibraryViewProps {
  onOpenReader: () => void
}

const mockComics = [
  {
    id: 1,
    title: "Spider-Man: Новые приключения",
    author: "Стэн Ли",
    cover: "/spider-man-comic-cover.png",
    pages: 24,
    progress: 0,
  },
  {
    id: 2,
    title: "Batman: Темный рыцарь",
    author: "Фрэнк Миллер",
    cover: "/dark-knight-comic-panel.png",
    pages: 32,
    progress: 15,
  },
  {
    id: 3,
    title: "X-Men: Дни минувшего будущего",
    author: "Крис Клэрмонт",
    cover: "/x-men-comic-cover.png",
    pages: 28,
    progress: 28,
  },
  {
    id: 4,
    title: "Wonder Woman: Происхождение",
    author: "Джордж Перес",
    cover: "/wonder-woman-comic-cover.png",
    pages: 22,
    progress: 0,
  },
  {
    id: 5,
    title: "The Flash: Скорость силы",
    author: "Марк Уэйд",
    cover: "/flash-comic-cover.png",
    pages: 20,
    progress: 8,
  },
  {
    id: 6,
    title: "Green Lantern: Изумрудные рыцари",
    author: "Джефф Джонс",
    cover: "/green-lantern-comic.png",
    pages: 26,
    progress: 0,
  },
  {
    id: 7,
    title: "Avengers: Война бесконечности",
    author: "Джим Старлин",
    cover: "/infinity-war-comic.png",
    pages: 36,
    progress: 12,
  },
  {
    id: 8,
    title: "Deadpool: Максимальные усилия",
    author: "Роб Лифельд",
    cover: "/deadpool-comic-cover.png",
    pages: 24,
    progress: 24,
  },
  {
    id: 9,
    title: "Captain America: Зимний солдат",
    author: "Эд Брубейкер",
    cover: "/winter-soldier-confrontation.png",
    pages: 30,
    progress: 5,
  },
]

const cloudComics = [
  {
    id: 10,
    title: "Синхронизированный комикс 1",
    author: "Облачный автор",
    cover: "/cloud-comic-1.png",
    pages: 25,
    progress: 0,
    cloudStatus: "synced" as "synced" | "syncing" | "error",
    lastSynced: new Date().toISOString(),
    cloudProvider: "Google Drive" as "Google Drive" | "OneDrive" | "Yandex Disk",
  },
  {
    id: 11,
    title: "Синхронизированный комикс 2",
    author: "Облачный автор",
    cover: "/cloud-comic-2.png",
    pages: 18,
    progress: 0,
    cloudStatus: "syncing" as "synced" | "syncing" | "error",
    lastSynced: new Date().toISOString(),
    cloudProvider: "OneDrive" as "Google Drive" | "OneDrive" | "Yandex Disk",
  },
]

export function LibraryView({ onOpenReader }: LibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("library")
  const [isCloudConnected, setIsCloudConnected] = useState(false)
  const [cloudProvider, setCloudProvider] = useState<string | null>(null)

  const getCurrentComics = () => {
    switch (activeTab) {
      case "cloud":
        return cloudComics
      case "annotations":
        return mockComics.filter((comic) => comic.progress > 0)
      case "plugins":
        return []
      default:
        return mockComics
    }
  }

  const filteredComics = getCurrentComics().filter(
    (comic) =>
      comic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comic.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b bg-card">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">
                {activeTab === "library" && "Моя библиотека"}
                {activeTab === "cloud" && "Облако"}
                {activeTab === "annotations" && "Аннотации"}
                {activeTab === "plugins" && "Плагины"}
              </h1>
              <div className="text-sm text-muted-foreground">
                {filteredComics.length} {filteredComics.length === 1 ? "комикс" : "комиксов"}
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="library">Библиотека</TabsTrigger>
              <TabsTrigger value="cloud">Облако</TabsTrigger>
              <TabsTrigger value="annotations">Аннотации</TabsTrigger>
              <TabsTrigger value="plugins">Плагины</TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 pb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск комиксов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <TabsContent value="library" className="mt-0">
            <ComicsGrid comics={filteredComics} viewMode={viewMode} onOpenReader={onOpenReader} />
          </TabsContent>

          <TabsContent value="cloud" className="mt-0">
            {!isCloudConnected ? (
              <div className="p-8 text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Подключите облачное хранилище</h3>
                  <p className="text-muted-foreground">
                    Синхронизируйте свои комиксы и прогресс чтения между устройствами
                  </p>
                </div>
                <div className="flex flex-col gap-2 max-w-sm mx-auto">
                  <Button
                    onClick={() => {
                      setIsCloudConnected(true)
                      setCloudProvider("Google Drive")
                    }}
                    className="w-full"
                  >
                    Подключить Google Drive
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCloudConnected(true)
                      setCloudProvider("OneDrive")
                    }}
                    className="w-full"
                  >
                    Подключить OneDrive
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCloudConnected(true)
                      setCloudProvider("Yandex Disk")
                    }}
                    className="w-full"
                  >
                    Подключить Яндекс.Диск
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="px-4 py-2 bg-muted/50 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Подключено к {cloudProvider}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Синхронизировать
                    </Button>
                  </div>
                </div>
                <ComicsGrid comics={filteredComics} viewMode={viewMode} onOpenReader={onOpenReader} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="annotations" className="mt-0">
            <ComicsGrid comics={filteredComics} viewMode={viewMode} onOpenReader={onOpenReader} />
          </TabsContent>

          <TabsContent value="plugins" className="mt-0">
            <PluginsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ComicsGridProps {
  comics: Array<{
    id: number
    title: string
    author: string
    cover: string
    pages: number
    progress: number
    cloudStatus?: "synced" | "syncing" | "error"
    lastSynced?: string
    cloudProvider?: string
  }>
  viewMode: "grid" | "list"
  onOpenReader: () => void
}

function ComicsGrid({ comics, viewMode, onOpenReader }: ComicsGridProps) {
  if (comics.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Комиксы не найдены</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div
        className={`grid gap-4 ${
          viewMode === "grid"
            ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            : "grid-cols-1 max-w-2xl mx-auto"
        }`}
      >
        {comics.map((comic) => (
          <Card
            key={comic.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
            onClick={onOpenReader}
          >
            <CardContent className="p-3">
              {viewMode === "grid" ? (
                <div className="space-y-3">
                  <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden relative">
                    <img
                      src={comic.cover || "/placeholder.svg"}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                    />
                    {comic.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div
                            className="bg-primary h-1 rounded-full transition-all duration-300"
                            style={{ width: `${(comic.progress / comic.pages) * 100}%` }}
                          />
                        </div>
                        <p className="text-white text-xs mt-1">
                          {comic.progress}/{comic.pages}
                        </p>
                      </div>
                    )}
                    {comic.cloudStatus && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">
                            {comic.cloudStatus === "synced"
                              ? "Синхронизировано"
                              : comic.cloudStatus === "syncing"
                                ? "Синхронизация..."
                                : "Ошибка синхронизации"}
                          </span>
                          <span className="text-sm text-white">
                            {comic.lastSynced ? new Date(comic.lastSynced).toLocaleString() : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">{comic.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{comic.author}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      src={comic.cover || "/placeholder.svg"}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                    />
                    {comic.cloudStatus && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">
                            {comic.cloudStatus === "synced"
                              ? "Синхронизировано"
                              : comic.cloudStatus === "syncing"
                                ? "Синхронизация..."
                                : "Ошибка синхронизации"}
                          </span>
                          <span className="text-sm text-white">
                            {comic.lastSynced ? new Date(comic.lastSynced).toLocaleString() : ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-medium truncate">{comic.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{comic.author}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{comic.pages} стр.</span>
                      {comic.progress > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            Прочитано: {comic.progress}/{comic.pages}
                          </span>
                        </>
                      )}
                    </div>
                    {comic.progress > 0 && (
                      <div className="w-full bg-muted rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${(comic.progress / comic.pages) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
