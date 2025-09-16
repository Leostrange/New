"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Palette, Eye, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

interface ThemeSettingsProps {
  onBack: () => void
}

const themes = [
  {
    id: "light",
    name: "Светлая",
    description: "Классическая светлая тема",
    preview: "bg-white border-gray-200",
    textColor: "text-gray-900",
  },
  {
    id: "dark",
    name: "Темная",
    description: "Темная тема для чтения в условиях низкой освещенности",
    preview: "bg-gray-900 border-gray-700",
    textColor: "text-gray-100",
  },
  {
    id: "sepia",
    name: "Сепия",
    description: "Теплая тема для комфортного чтения",
    preview: "bg-amber-50 border-amber-200",
    textColor: "text-amber-900",
  },
]

const accentColors = [
  { id: "blue", name: "Синий", color: "bg-blue-500" },
  { id: "green", name: "Зеленый", color: "bg-green-500" },
  { id: "purple", name: "Фиолетовый", color: "bg-purple-500" },
  { id: "red", name: "Красный", color: "bg-red-500" },
  { id: "orange", name: "Оранжевый", color: "bg-orange-500" },
  { id: "pink", name: "Розовый", color: "bg-pink-500" },
]

export function ThemeSettings({ onBack }: ThemeSettingsProps) {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState(theme || "light")
  const [accentColor, setAccentColor] = useState("blue")
  const [fontSize, setFontSize] = useState([16])
  const [borderRadius, setBorderRadius] = useState([8])
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [autoTheme, setAutoTheme] = useState(false)

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
    setTheme(themeId)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Дисплей и темы</h1>
          <p className="text-muted-foreground">Настройте внешний вид приложения</p>
        </div>
      </div>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Цветовая тема
          </CardTitle>
          <CardDescription>Выберите основную цветовую схему приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Автоматическая тема</Label>
              <div className="text-sm text-muted-foreground">
                Переключение между светлой и темной темой по времени суток
              </div>
            </div>
            <Switch checked={autoTheme} onCheckedChange={setAutoTheme} />
          </div>

          {!autoTheme && (
            <div className="grid grid-cols-1 gap-3">
              {themes.map((themeOption) => (
                <Card
                  key={themeOption.id}
                  className={`cursor-pointer transition-all ${
                    selectedTheme === themeOption.id ? "ring-2 ring-primary" : "hover:shadow-md"
                  }`}
                  onClick={() => handleThemeSelect(themeOption.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-16 rounded-lg border-2 ${themeOption.preview} flex items-center justify-center`}
                      >
                        <div className="space-y-1">
                          <div className={`h-0.5 w-6 ${themeOption.textColor} opacity-60`}></div>
                          <div className={`h-0.5 w-4 ${themeOption.textColor} opacity-40`}></div>
                          <div className={`h-0.5 w-5 ${themeOption.textColor} opacity-60`}></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{themeOption.name}</h3>
                        <p className="text-sm text-muted-foreground">{themeOption.description}</p>
                      </div>
                      {selectedTheme === themeOption.id && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Акцентный цвет</CardTitle>
          <CardDescription>Цвет для кнопок, ссылок и других интерактивных элементов</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {accentColors.map((color) => (
              <Card
                key={color.id}
                className={`cursor-pointer transition-all ${
                  accentColor === color.id ? "ring-2 ring-offset-2 ring-current" : "hover:shadow-md"
                }`}
                onClick={() => setAccentColor(color.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full ${color.color}`} />
                    <span className="text-sm font-medium">{color.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Типографика</CardTitle>
          <CardDescription>Настройте размер шрифта и другие параметры текста</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Размер шрифта: {fontSize[0]}px</Label>
            <Slider value={fontSize} onValueChange={setFontSize} max={24} min={12} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Маленький</span>
              <span>Большой</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Интерфейс</CardTitle>
          <CardDescription>Настройте внешний вид элементов интерфейса</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Скругление углов: {borderRadius[0]}px</Label>
            <Slider value={borderRadius} onValueChange={setBorderRadius} max={16} min={0} step={2} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Острые</span>
              <span>Скругленные</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Анимации</Label>
              <div className="text-sm text-muted-foreground">Включить плавные переходы и анимации</div>
            </div>
            <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Высокий контраст</Label>
              <div className="text-sm text-muted-foreground">Увеличить контрастность для лучшей читаемости</div>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Дисплей
          </CardTitle>
          <CardDescription>Настройки экрана и отображения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Яркость экрана</Label>
            <Select defaultValue="auto">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Автоматическая</SelectItem>
                <SelectItem value="low">Низкая</SelectItem>
                <SelectItem value="medium">Средняя</SelectItem>
                <SelectItem value="high">Высокая</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Тайм-аут экрана</Label>
            <Select defaultValue="5min">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30sec">30 секунд</SelectItem>
                <SelectItem value="1min">1 минута</SelectItem>
                <SelectItem value="5min">5 минут</SelectItem>
                <SelectItem value="10min">10 минут</SelectItem>
                <SelectItem value="never">Никогда</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Доступность
          </CardTitle>
          <CardDescription>Настройки для улучшения доступности приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Увеличенные кнопки</Label>
              <div className="text-sm text-muted-foreground">Сделать кнопки больше для удобства использования</div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Уменьшить движение</Label>
              <div className="text-sm text-muted-foreground">Минимизировать анимации и переходы</div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Голосовые подсказки</Label>
              <div className="text-sm text-muted-foreground">Озвучивание элементов интерфейса</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
