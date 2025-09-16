"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BookOpen, Eye, Zap, Volume2 } from "lucide-react"

interface ReadingSettingsProps {
  onBack: () => void
}

export function ReadingSettings({ onBack }: ReadingSettingsProps) {
  const [pageTransition, setPageTransition] = useState("slide")
  const [autoSave, setAutoSave] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [pageFlipSound, setPageFlipSound] = useState(true)
  const [vibration, setVibration] = useState(false)
  const [readingSpeed, setReadingSpeed] = useState([150])
  const [eyeProtection, setEyeProtection] = useState(true)

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Настройки чтения</h1>
          <p className="text-muted-foreground">Персонализируйте опыт чтения комиксов</p>
        </div>
      </div>

      {/* Page Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Навигация по страницам
          </CardTitle>
          <CardDescription>Настройте способ перелистывания страниц</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Эффект перехода</Label>
            <Select value={pageTransition} onValueChange={setPageTransition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slide">Скольжение</SelectItem>
                <SelectItem value="fade">Затухание</SelectItem>
                <SelectItem value="flip">Переворот страницы</SelectItem>
                <SelectItem value="none">Без эффекта</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Автосохранение прогресса</Label>
              <div className="text-sm text-muted-foreground">Автоматически сохранять текущую страницу</div>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Полноэкранный режим</Label>
              <div className="text-sm text-muted-foreground">Скрывать элементы интерфейса при чтении</div>
            </div>
            <Switch checked={fullscreen} onCheckedChange={setFullscreen} />
          </div>
        </CardContent>
      </Card>

      {/* Reading Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Комфорт чтения
          </CardTitle>
          <CardDescription>Настройки для комфортного чтения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Скорость чтения: {readingSpeed[0]} слов/мин</Label>
            <Slider
              value={readingSpeed}
              onValueChange={setReadingSpeed}
              max={300}
              min={50}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Медленно</span>
              <span>Быстро</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Защита глаз</Label>
              <div className="text-sm text-muted-foreground">
                Автоматическая регулировка яркости и цветовой температуры
              </div>
            </div>
            <Switch checked={eyeProtection} onCheckedChange={setEyeProtection} />
          </div>

          <div className="space-y-2">
            <Label>Напоминания о перерывах</Label>
            <Select defaultValue="30min">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15min">Каждые 15 минут</SelectItem>
                <SelectItem value="30min">Каждые 30 минут</SelectItem>
                <SelectItem value="60min">Каждый час</SelectItem>
                <SelectItem value="never">Отключено</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audio & Haptics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Звук и вибрация
          </CardTitle>
          <CardDescription>Настройки звуковых эффектов и тактильной обратной связи</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Звук перелистывания</Label>
              <div className="text-sm text-muted-foreground">Воспроизводить звук при смене страниц</div>
            </div>
            <Switch checked={pageFlipSound} onCheckedChange={setPageFlipSound} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Вибрация</Label>
              <div className="text-sm text-muted-foreground">Тактильная обратная связь при взаимодействии</div>
            </div>
            <Switch checked={vibration} onCheckedChange={setVibration} />
          </div>

          <div className="space-y-2">
            <Label>Громкость звуковых эффектов</Label>
            <Slider defaultValue={[70]} max={100} min={0} step={5} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Производительность
          </CardTitle>
          <CardDescription>Настройки для оптимизации производительности</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Качество изображений</Label>
            <Select defaultValue="high">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкое (быстрая загрузка)</SelectItem>
                <SelectItem value="medium">Среднее</SelectItem>
                <SelectItem value="high">Высокое</SelectItem>
                <SelectItem value="original">Оригинальное</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Предзагрузка страниц</Label>
            <Select defaultValue="3">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 страница</SelectItem>
                <SelectItem value="3">3 страницы</SelectItem>
                <SelectItem value="5">5 страниц</SelectItem>
                <SelectItem value="all">Все страницы</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Экономия трафика</Label>
              <div className="text-sm text-muted-foreground">Сжимать изображения для экономии интернет-трафика</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
