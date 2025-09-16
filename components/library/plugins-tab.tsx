"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Download, Settings, Trash2, ExternalLink, Star, Users } from "lucide-react"

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  author: string
  category: "translation" | "ocr" | "enhancement" | "utility"
  installed: boolean
  enabled: boolean
  rating: number
  downloads: number
  size: string
  lastUpdated: string
  permissions: string[]
}

const availablePlugins: Plugin[] = [
  {
    id: "google-translate",
    name: "Google Translate",
    description: "Автоматический перевод текста комиксов с помощью Google Translate API",
    version: "1.2.0",
    author: "Mr.Comic Team",
    category: "translation",
    installed: true,
    enabled: true,
    rating: 4.8,
    downloads: 15420,
    size: "2.1 MB",
    lastUpdated: "2024-01-15",
    permissions: ["Доступ к интернету", "Чтение текста комиксов"],
  },
  {
    id: "yandex-translate",
    name: "Yandex Translate",
    description: "Перевод с помощью Yandex Translate API с поддержкой множества языков",
    version: "1.0.5",
    author: "Community",
    category: "translation",
    installed: false,
    enabled: false,
    rating: 4.6,
    downloads: 8930,
    size: "1.8 MB",
    lastUpdated: "2024-01-10",
    permissions: ["Доступ к интернету", "Чтение текста комиксов"],
  },
  {
    id: "tesseract-ocr",
    name: "Tesseract OCR",
    description: "Распознавание текста на изображениях комиксов для последующего перевода",
    version: "2.1.3",
    author: "OCR Community",
    category: "ocr",
    installed: true,
    enabled: false,
    rating: 4.4,
    downloads: 12350,
    size: "15.2 MB",
    lastUpdated: "2024-01-12",
    permissions: ["Доступ к изображениям", "Обработка изображений"],
  },
  {
    id: "manga-enhancer",
    name: "Manga Enhancer",
    description: "Улучшение качества изображений манги и комиксов с помощью AI",
    version: "1.5.2",
    author: "AI Labs",
    category: "enhancement",
    installed: false,
    enabled: false,
    rating: 4.9,
    downloads: 23100,
    size: "45.7 MB",
    lastUpdated: "2024-01-18",
    permissions: ["Доступ к изображениям", "Обработка изображений", "Использование GPU"],
  },
  {
    id: "reading-stats",
    name: "Reading Statistics",
    description: "Подробная статистика чтения: время, скорость, прогресс по жанрам",
    version: "1.1.0",
    author: "Stats Team",
    category: "utility",
    installed: true,
    enabled: true,
    rating: 4.3,
    downloads: 9870,
    size: "0.8 MB",
    lastUpdated: "2024-01-08",
    permissions: ["Доступ к истории чтения", "Локальное хранение данных"],
  },
  {
    id: "cloud-backup",
    name: "Advanced Cloud Backup",
    description: "Расширенное резервное копирование в облако с шифрованием",
    version: "2.0.1",
    author: "Security Team",
    category: "utility",
    installed: false,
    enabled: false,
    rating: 4.7,
    downloads: 18650,
    size: "3.4 MB",
    lastUpdated: "2024-01-20",
    permissions: ["Доступ к облачным сервисам", "Шифрование данных", "Доступ к файлам"],
  },
]

export function PluginsTab() {
  const [plugins, setPlugins] = useState(availablePlugins)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)

  const categories = [
    { id: "all", name: "Все", count: plugins.length },
    { id: "translation", name: "Переводчики", count: plugins.filter((p) => p.category === "translation").length },
    { id: "ocr", name: "OCR", count: plugins.filter((p) => p.category === "ocr").length },
    { id: "enhancement", name: "Улучшения", count: plugins.filter((p) => p.category === "enhancement").length },
    { id: "utility", name: "Утилиты", count: plugins.filter((p) => p.category === "utility").length },
  ]

  const filteredPlugins = plugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || plugin.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const installedPlugins = plugins.filter((p) => p.installed)
  const enabledPlugins = plugins.filter((p) => p.installed && p.enabled)

  const togglePlugin = (pluginId: string) => {
    setPlugins(plugins.map((plugin) => (plugin.id === pluginId ? { ...plugin, enabled: !plugin.enabled } : plugin)))
  }

  const installPlugin = (pluginId: string) => {
    setPlugins(plugins.map((plugin) => (plugin.id === pluginId ? { ...plugin, installed: true } : plugin)))
  }

  const uninstallPlugin = (pluginId: string) => {
    setPlugins(
      plugins.map((plugin) => (plugin.id === pluginId ? { ...plugin, installed: false, enabled: false } : plugin)),
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "translation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "ocr":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "enhancement":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "utility":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{installedPlugins.length}</div>
            <div className="text-sm text-muted-foreground">Установлено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{enabledPlugins.length}</div>
            <div className="text-sm text-muted-foreground">Активно</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{plugins.length}</div>
            <div className="text-sm text-muted-foreground">Доступно</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск плагинов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-5">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                {category.name} ({category.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Plugins Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredPlugins.map((plugin) => (
          <Card key={plugin.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{plugin.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getCategoryColor(plugin.category)}>
                      {plugin.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                  </div>
                </div>
                {plugin.installed && (
                  <Switch checked={plugin.enabled} onCheckedChange={() => togglePlugin(plugin.id)} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">{plugin.description}</CardDescription>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{plugin.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{plugin.downloads.toLocaleString()}</span>
                  </div>
                </div>
                <span>{plugin.size}</span>
              </div>

              <div className="flex gap-2">
                {plugin.installed ? (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Settings className="h-4 w-4 mr-2" />
                          Настройки
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Настройки {plugin.name}</DialogTitle>
                          <DialogDescription>Настройте параметры плагина</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>API Ключ</Label>
                            <Input placeholder="Введите API ключ..." />
                          </div>
                          <div className="space-y-2">
                            <Label>Язык по умолчанию</Label>
                            <Input placeholder="ru" />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => uninstallPlugin(plugin.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex-1" onClick={() => installPlugin(plugin.id)}>
                    <Download className="h-4 w-4 mr-2" />
                    Установить
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedPlugin(plugin)}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plugin Details Dialog */}
      <Dialog open={!!selectedPlugin} onOpenChange={() => setSelectedPlugin(null)}>
        <DialogContent className="max-w-2xl">
          {selectedPlugin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedPlugin.name}
                  <Badge className={getCategoryColor(selectedPlugin.category)}>{selectedPlugin.category}</Badge>
                </DialogTitle>
                <DialogDescription>
                  Автор: {selectedPlugin.author} • Версия: {selectedPlugin.version}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Описание</h4>
                  <p className="text-sm text-muted-foreground">{selectedPlugin.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Разрешения</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPlugin.permissions.map((permission, index) => (
                      <li key={index}>• {permission}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Размер:</span> {selectedPlugin.size}
                  </div>
                  <div>
                    <span className="font-medium">Загрузки:</span> {selectedPlugin.downloads.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Рейтинг:</span> {selectedPlugin.rating}/5
                  </div>
                  <div>
                    <span className="font-medium">Обновлено:</span> {selectedPlugin.lastUpdated}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
