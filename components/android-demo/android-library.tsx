"use client"

import { useState } from "react"
import { AndroidFrame } from "./android-frame"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Grid, List, Camera, Settings, Book, Palette } from "lucide-react"

const comicData = [
  { id: 1, title: "Spider-Man", author: "Stan Lee", progress: 75, cover: "/spider-man-comic-cover.png" },
  { id: 2, title: "Batman", author: "Bob Kane", progress: 45, cover: "/dark-knight-comic-panel.png" },
  { id: 3, title: "X-Men", author: "Stan Lee", progress: 90, cover: "/x-men-comic-cover.png" },
  { id: 4, title: "Wonder Woman", author: "William Marston", progress: 30, cover: "/wonder-woman-comic-cover.png" },
  { id: 5, title: "The Flash", author: "Gardner Fox", progress: 60, cover: "/flash-comic-cover.png" },
  { id: 6, title: "Green Lantern", author: "John Broome", progress: 20, cover: "/green-lantern-comic.png" },
]

export function AndroidLibraryDemo() {
  const [activeTab, setActiveTab] = useState("Библиотека")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentScreen, setCurrentScreen] = useState("library")
  const [selectedComic, setSelectedComic] = useState<any>(null)
  const [subScreen, setSubScreen] = useState<string>("")
  const [selectedTheme, setSelectedTheme] = useState("light")

  const tabs = ["Библиотека", "Облако", "Аннотации", "Плагины"]

  const renderScreen = () => {
    switch (currentScreen) {
      case "reader":
        return <ReaderScreenDemo onBack={() => setCurrentScreen("library")} />
      case "settings":
        return (
          <SettingsScreenDemo
            onBack={() => setCurrentScreen("library")}
            onSubScreen={setSubScreen}
            subScreen={subScreen}
          />
        )
      case "translations":
        return (
          <TranslationsScreenDemo
            onBack={() => setCurrentScreen("library")}
            onSubScreen={setSubScreen}
            subScreen={subScreen}
          />
        )
      case "comic-details":
        return (
          <ComicDetailsScreen
            comic={selectedComic}
            onBack={() => setCurrentScreen("library")}
            onRead={() => setCurrentScreen("reader")}
          />
        )
      default:
        return renderLibraryScreen()
    }
  }

  const renderLibraryScreen = () => (
    <div className="flex flex-col h-full">
      {/* Top Tabs */}
      <div className="flex bg-card border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
              activeTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Моя библиотека</h1>
          <span className="text-sm text-muted-foreground">11,116</span>
        </div>

        {/* Search and View Controls */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск комиксов..." className="pl-10" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Comics Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className={viewMode === "grid" ? "grid grid-cols-3 gap-3" : "space-y-3"}>
          {comicData.map((comic) => (
            <div
              key={comic.id}
              className={`cursor-pointer transition-transform hover:scale-105 ${
                viewMode === "grid" ? "space-y-2" : "flex items-center gap-3 p-3 bg-card rounded-lg"
              }`}
              onClick={() => {
                setSelectedComic(comic)
                setCurrentScreen("comic-details")
              }}
            >
              <div
                className={`relative ${viewMode === "grid" ? "aspect-[3/4]" : "w-16 h-20 flex-shrink-0"} bg-muted rounded-lg overflow-hidden`}
              >
                <img
                  src={comic.cover || "/placeholder.svg"}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `/placeholder.svg?height=120&width=90&text=${encodeURIComponent(comic.title)}`
                  }}
                />
                {/* Progress Indicator */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${comic.progress}%` }}
                  />
                </div>
              </div>

              <div className={viewMode === "grid" ? "space-y-1" : "flex-1 min-w-0"}>
                <h3 className={`font-medium ${viewMode === "grid" ? "text-xs" : "text-sm"} truncate`}>{comic.title}</h3>
                <p className={`text-muted-foreground ${viewMode === "grid" ? "text-xs" : "text-sm"} truncate`}>
                  {comic.author}
                </p>
                {viewMode === "list" && <p className="text-xs text-muted-foreground">Прогресс: {comic.progress}%</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex bg-card border-t h-16 items-center">
        {[
          { name: "Домой", screen: "library", icon: "🏠" },
          { name: "Чтение", screen: "reader", icon: "📖" },
          { name: "Переводы", screen: "translations", icon: "🌐" },
          { name: "Настройки", screen: "settings", icon: "⚙️" },
        ].map((item) => (
          <button
            key={item.name}
            className={`flex-1 py-2 px-2 text-xs text-center transition-colors flex flex-col items-center justify-center ${
              currentScreen === item.screen ? "text-primary bg-primary/10" : "text-muted-foreground"
            }`}
            onClick={() => {
              console.log("[v0] Navigating to screen:", item.screen)
              setCurrentScreen(item.screen)
              setSubScreen("") // сброс подэкранов при переключении
            }}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <span className="text-xs">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )

  return <AndroidFrame>{renderScreen()}</AndroidFrame>
}

function ReaderScreenDemo({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-sepia">
      <div className="flex items-center justify-between p-4 bg-card/80">
        <button onClick={onBack} className="text-sm">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Глава 3</h1>
        <button className="text-sm">Выйти</button>
      </div>

      <div className="flex-1 p-6 text-center">
        <div className="bg-card/50 rounded-lg p-8 mb-4">
          <p className="text-sm leading-relaxed">
            The following morning I was awoken early by the sonorous pealing of the village church bell. I raised the
            blinds, seeing golden sunlight break through the mist, casting a glow over hedgerows...
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-card/80">
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">←</button>
        <span className="text-sm">4/15</span>
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">→</button>
      </div>
    </div>
  )
}

function SettingsScreenDemo({
  onBack,
  onSubScreen,
  subScreen,
}: { onBack: () => void; onSubScreen: (screen: string) => void; subScreen: string }) {
  if (subScreen === "reader-settings") {
    return <ReaderSettingsScreen onBack={() => onSubScreen("")} />
  }
  if (subScreen === "language-settings") {
    return <LanguageSettingsScreen onBack={() => onSubScreen("")} />
  }
  if (subScreen === "theme-settings") {
    return <ThemeSettingsScreen onBack={() => onSubScreen("")} />
  }
  if (subScreen === "optimization-settings") {
    return <OptimizationSettingsScreen onBack={() => onSubScreen("")} />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Настройки</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-medium">Account Settings</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">AM</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-lg">Alex Mercer</p>
              <p className="text-sm text-muted-foreground">alex.mercer@example.com</p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Edit Profile</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Change Password</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-red-50 text-red-600 rounded-lg">
              <span className="text-sm">Log Out</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-medium">Чтение</h2>
          <div className="space-y-2">
            <button
              onClick={() => onSubScreen("reader-settings")}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Book className="h-4 w-4" />
                <span className="text-sm">Настройки читалки</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-medium">Внешний вид</h2>
          <div className="space-y-2">
            <button
              onClick={() => onSubScreen("theme-settings")}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4" />
                <span className="text-sm">Темы</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
            <button
              onClick={() => onSubScreen("language-settings")}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <span className="text-sm">Язык интерфейса</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-medium">Производительность</h2>
          <div className="space-y-2">
            <button
              onClick={() => onSubScreen("optimization-settings")}
              className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span className="text-sm">Оптимизация</span>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 space-y-3">
          <h2 className="font-medium">Общие</h2>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Уведомления</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">Звуки</span>
              <span className="text-muted-foreground">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm">О приложении</span>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReaderSettingsScreen({ onBack }: { onBack: () => void }) {
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState("Sans")
  const [lineSpacing, setLineSpacing] = useState(1.5)
  const [readerTheme, setReaderTheme] = useState("light")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Настройки читалки</h1>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-medium">Размер шрифта</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm">A</span>
            <input
              type="range"
              min="12"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-lg">A</span>
          </div>
          <p className="text-sm text-muted-foreground">Текущий размер: {fontSize}px</p>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Семейство шрифтов</h3>
          <div className="grid grid-cols-4 gap-2">
            {["Sans", "Serif", "Mono", "Display"].map((font) => (
              <button
                key={font}
                onClick={() => setFontFamily(font)}
                className={`p-3 rounded-lg border text-sm ${
                  fontFamily === font ? "border-primary bg-primary/10" : "border-muted"
                }`}
              >
                {font}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Межстрочный интервал</h3>
          <div className="flex items-center gap-4">
            <span className="text-sm">≡</span>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={lineSpacing}
              onChange={(e) => setLineSpacing(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm">≡</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Цвет фона</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "light", name: "Светлый", bg: "bg-white", border: "border-gray-200" },
              { id: "sepia", name: "Сепия", bg: "bg-amber-50", border: "border-amber-200" },
              { id: "dark", name: "Темный", bg: "bg-gray-900", border: "border-gray-700" },
              { id: "black", name: "Черный", bg: "bg-black", border: "border-gray-800" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setReaderTheme(theme.id)}
                className={`p-3 rounded-lg border-2 ${readerTheme === theme.id ? "border-primary" : "border-muted"}`}
              >
                <div className={`w-full h-8 ${theme.bg} ${theme.border} border rounded mb-1`}></div>
                <span className="text-xs">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LanguageSettingsScreen({ onBack }: { onBack: () => void }) {
  const [selectedLanguage, setSelectedLanguage] = useState("Русский")

  const languages = [
    "Русский",
    "English",
    "Español",
    "Français",
    "Deutsch",
    "Italiano",
    "中文",
    "日本語",
    "한국어",
    "العربية",
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Выбор языка</h1>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`w-full flex items-center justify-between p-4 rounded-lg ${
              selectedLanguage === lang ? "bg-primary/10 text-primary" : "bg-card"
            }`}
          >
            <span>{lang}</span>
            {selectedLanguage === lang && <span className="text-primary">●</span>}
          </button>
        ))}
      </div>

      <div className="p-4">
        <Button className="w-full">Подтвердить</Button>
      </div>
    </div>
  )
}

function ThemeSettingsScreen({ onBack }: { onBack: () => void }) {
  const [selectedTheme, setSelectedTheme] = useState("light")

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Выбор темы</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: "light", name: "Светлая", bg: "bg-white", text: "text-black", border: "border-gray-200" },
            { id: "dark", name: "Темная", bg: "bg-gray-900", text: "text-white", border: "border-gray-700" },
            { id: "sepia", name: "Сепия", bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id ? "border-primary" : "border-muted"
              }`}
            >
              <div
                className={`w-full h-24 ${theme.bg} ${theme.border} border rounded mb-3 flex flex-col justify-center items-center gap-2`}
              >
                <div
                  className={`w-16 h-2 ${theme.text === "text-white" ? "bg-white" : "bg-black"} opacity-60 rounded`}
                ></div>
                <div
                  className={`w-12 h-2 ${theme.text === "text-white" ? "bg-white" : "bg-black"} opacity-40 rounded`}
                ></div>
                <div
                  className={`w-20 h-2 ${theme.text === "text-white" ? "bg-white" : "bg-black"} opacity-60 rounded`}
                ></div>
              </div>
              <span className="font-medium">{theme.name}</span>
              {selectedTheme === theme.id && <span className="text-primary ml-2">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function OptimizationSettingsScreen({ onBack }: { onBack: () => void }) {
  const [performanceMode, setPerformanceMode] = useState("maximum")
  const [settings, setSettings] = useState({
    reduceAnimations: false,
    asyncLoading: true,
    imageCompression: true,
    nightModeOptimization: true,
    offlineMode: false,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Оптимизация</h1>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-medium">Режим производительности</h3>
          <div className="space-y-2">
            {[
              { id: "economy", name: "Экономия энергии", desc: "Максимальное время работы" },
              { id: "balanced", name: "Сбалансированный", desc: "Оптимальное соотношение" },
              { id: "maximum", name: "Максимум", desc: "Лучшая производительность" },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPerformanceMode(mode.id)}
                className={`w-full p-3 rounded-lg text-left ${
                  performanceMode === mode.id ? "bg-primary/10 border border-primary" : "bg-card border border-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{mode.name}</p>
                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                  </div>
                  {performanceMode === mode.id && <span className="text-primary">●</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Дополнительные настройки</h3>
          <div className="space-y-3">
            {[
              { key: "reduceAnimations", label: "Уменьшить анимации", desc: "Снижает нагрузку на процессор" },
              { key: "asyncLoading", label: "Асинхронная подгрузка обложек", desc: "Улучшает отзывчивость интерфейса" },
              {
                key: "imageCompression",
                label: "Сжатие изображений при импорте",
                desc: "Экономит место на устройстве",
              },
              {
                key: "nightModeOptimization",
                label: "Оптимизация для ночного режима",
                desc: "Снижает яркость и энергопотребление",
              },
              {
                key: "offlineMode",
                label: "Отключить онлайн-функции при слабом интернете",
                desc: "Автоматическое переключение в офлайн",
              },
            ].map((setting) => (
              <div key={setting.key} className="flex items-start justify-between p-3 bg-card rounded-lg">
                <div className="flex-1 mr-3">
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{setting.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      [setting.key as keyof typeof prev]: !prev[setting.key as keyof typeof prev],
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings[setting.key as keyof typeof settings] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings[setting.key as keyof typeof settings] ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Обслуживание</h3>
          <button className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 text-red-600 rounded-lg">
            <span>🗑️</span>
            <div className="text-left">
              <p className="font-medium">Очистить кэш</p>
              <p className="text-xs">Освободить место на устройстве</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

function TranslationsScreenDemo({
  onBack,
  onSubScreen,
  subScreen,
}: { onBack: () => void; onSubScreen: (screen: string) => void; subScreen: string }) {
  const [activeTab, setActiveTab] = useState("translator")

  const tabs = [
    { id: "translator", name: "Переводчик" },
    { id: "ocr", name: "OCR" },
    { id: "settings", name: "Настройки" },
  ]

  if (subScreen === "ocr-cropping") {
    return <OCRCroppingScreen onBack={() => onSubScreen("")} />
  }
  if (subScreen === "translation-settings") {
    return <TranslationSettingsScreen onBack={() => onSubScreen("")} />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Переводы и OCR</h1>
      </div>

      {/* Tabs */}
      <div className="flex bg-card border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-2 text-sm font-medium transition-colors ${
              activeTab === tab.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4">
        {activeTab === "translator" && (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm">English</span>
                <span className="text-sm">→ Русский</span>
              </div>

              <div className="space-y-3">
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  placeholder="Enter text to translate..."
                />

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Перевести
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onSubScreen("ocr-cropping")}>
                    📷 Сканировать
                  </Button>
                </div>

                <div className="p-3 bg-muted rounded-lg min-h-[80px]">
                  <p className="text-sm text-muted-foreground">Перевод появится здесь...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ocr" && (
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 text-center">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Распознавание текста</h3>
              <p className="text-sm text-muted-foreground mb-4">Сфотографируйте или выберите изображение с текстом</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onSubScreen("ocr-cropping")}>
                  📷 Камера
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  🖼️ Галерея
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <button
              onClick={() => onSubScreen("translation-settings")}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg"
            >
              <div className="text-left">
                <p className="font-medium">Настройки переводов</p>
                <p className="text-sm text-muted-foreground">OCR движки, API ключи</p>
              </div>
              <span className="text-muted-foreground">→</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function OCRCroppingScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex items-center justify-between p-4 text-white">
        <button onClick={onBack} className="text-sm">
          Отмена
        </button>
        <h1 className="text-lg font-bold">OCR Cropping</h1>
        <button className="text-sm text-primary">Готово</button>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg">
          <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <p className="text-sm mb-2">Lorem ipsum dolor sit amet,</p>
              <p className="text-sm mb-2">consectetur adipiscing elit.</p>
              <p className="text-sm">Перетащите углы для кадрирования</p>
            </div>
          </div>

          {/* Corner handles */}
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-primary rounded-full"></div>
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full"></div>
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary rounded-full"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary rounded-full"></div>
        </div>
      </div>

      <div className="p-4 flex gap-2">
        <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
          Отмена
        </Button>
        <Button className="flex-1">Подтвердить</Button>
      </div>
    </div>
  )
}

function TranslationSettingsScreen({ onBack }: { onBack: () => void }) {
  const [ocrEngine, setOcrEngine] = useState("tesseract")
  const [translationProviders, setTranslationProviders] = useState({
    googleTranslate: true,
    deepL: false,
    openAI: true,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Настройки переводов</h1>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="space-y-4">
          <h3 className="font-medium">OCR движок</h3>
          <div className="space-y-2">
            {[
              { id: "tesseract", name: "Tesseract", desc: "Открытый движок OCR" },
              { id: "mlkit", name: "ML Kit", desc: "Google ML Kit" },
            ].map((engine) => (
              <button
                key={engine.id}
                onClick={() => setOcrEngine(engine.id)}
                className={`w-full p-3 rounded-lg text-left ${
                  ocrEngine === engine.id ? "bg-primary/10 border border-primary" : "bg-card border border-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{engine.name}</p>
                    <p className="text-xs text-muted-foreground">{engine.desc}</p>
                  </div>
                  {ocrEngine === engine.id && <span className="text-primary">●</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Поставщики перевода</h3>
          <div className="space-y-3">
            {[
              { key: "googleTranslate", name: "Google Translate API", desc: "Поддержка 100+ языков" },
              { key: "deepL", name: "DeepL API", desc: "Высокое качество перевода" },
              { key: "openAI", name: "OpenAI Whisper", desc: "ИИ-переводчик" },
            ].map((provider) => (
              <div key={provider.key} className="flex items-center justify-between p-3 bg-card rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{provider.name}</p>
                  <p className="text-xs text-muted-foreground">{provider.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setTranslationProviders((prev) => ({
                      ...prev,
                      [provider.key]: !prev[provider.key as keyof typeof prev],
                    }))
                  }
                  className={`w-12 h-6 rounded-full transition-colors ${
                    translationProviders[provider.key as keyof typeof translationProviders] ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      translationProviders[provider.key as keyof typeof translationProviders]
                        ? "translate-x-6"
                        : "translate-x-0.5"
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">API ключи</h3>
            <Button size="sm" variant="outline">
              Добавить ключ
            </Button>
          </div>
          <div className="space-y-2">
            <div className="p-3 bg-card rounded-lg">
              <p className="text-sm font-medium">Google Translate</p>
              <p className="text-xs text-muted-foreground">••••••••••••••••</p>
            </div>
            <div className="p-3 bg-card rounded-lg">
              <p className="text-sm font-medium">OpenAI</p>
              <p className="text-xs text-muted-foreground">••••••••••••••••</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Оффлайн модели</h3>
          <div className="p-3 bg-card rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Whisper</p>
                <p className="text-xs text-muted-foreground">Модель для распознавания речи</p>
              </div>
              <Button size="sm" variant="outline">
                Скачать
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ComicDetailsScreen({ comic, onBack, onRead }: { comic: any; onBack: () => void; onRead: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 bg-card border-b">
        <button onClick={onBack} className="text-sm mr-4">
          ← Назад
        </button>
        <h1 className="text-lg font-bold">Детали комикса</h1>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="flex gap-4">
          <img
            src={comic?.cover || "/placeholder.svg"}
            alt={comic?.title}
            className="w-24 h-32 object-cover rounded-lg"
          />
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold">{comic?.title}</h2>
            <p className="text-muted-foreground">{comic?.author}</p>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.8 (1,234)</span>
            </div>
            <p className="text-sm">Прогресс: {comic?.progress}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onRead} className="flex-1">
            Читать
          </Button>
          <Button variant="outline">Скачать</Button>
          <Button variant="outline" size="icon">
            ♡
          </Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Описание</h3>
          <p className="text-sm text-muted-foreground">
            Захватывающие приключения супергероя в мире, полном опасностей и невероятных возможностей...
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Рекомендации</h3>
          <div className="grid grid-cols-3 gap-3">
            {comicData.slice(0, 3).map((rec) => (
              <div key={rec.id} className="space-y-1">
                <img
                  src={rec.cover || "/placeholder.svg"}
                  alt={rec.title}
                  className="w-full aspect-[3/4] object-cover rounded"
                />
                <p className="text-xs font-medium truncate">{rec.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
