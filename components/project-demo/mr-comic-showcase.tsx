"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Smartphone, Cloud, Languages, Settings, Archive, Shield, Download } from "lucide-react"

export function MrComicShowcase() {
  const [activeDemo, setActiveDemo] = useState<string | null>(null)

  const features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Поддержка форматов",
      description: "CBZ, CBR, PDF с полной функциональностью",
      details: ["Извлечение страниц из архивов", "PDF рендеринг", "Сохранение прогресса чтения"],
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Android разрешения",
      description: "Современные разрешения для Android 15",
      details: ["READ_MEDIA_VISUAL_USER_SELECTED", "Доступ к файлам устройства", "Уведомления"],
    },
    {
      icon: <Languages className="h-6 w-6" />,
      title: "Система переводов",
      description: "Облачные API и локальные LLM",
      details: ["Google Translate", "Yandex Translate", "Hugging Face модели", "OCR распознавание"],
    },
    {
      icon: <Cloud className="h-6 w-6" />,
      title: "Облачная синхронизация",
      description: "Поддержка всех популярных провайдеров",
      details: ["Google Drive", "OneDrive", "Yandex Disk", "Mail.ru Cloud"],
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Настройки чтения",
      description: "Полная кастомизация интерфейса",
      details: ["Темы (светлая, темная, сепия)", "Настройки страниц", "Жесты управления"],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Безопасность",
      description: "Современная архитектура безопасности",
      details: ["FileProvider", "Шифрование данных", "Безопасное хранение"],
    },
  ]

  const androidModules = [
    "app - Основное приложение",
    "feature-library - Библиотека комиксов",
    "feature-reader - Читалка с полной функциональностью",
    "feature-auth - Система аутентификации",
    "feature-settings - Настройки и кастомизация",
    "feature-translations - OCR и переводы",
    "feature-sync - Синхронизация и бэкап",
    "core-data - Репозитории и источники данных",
    "core-database - Room база данных",
    "core-network - Сетевые запросы и API",
    "core-cloud - Облачные интеграции",
    "core-translation - Система переводов",
    "core-permissions - Управление разрешениями",
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Mr.Comic - Результат разработки
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Полнофункциональное кроссплатформенное приложение для чтения комиксов с современной архитектурой
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">Android 15</Badge>
          <Badge variant="secondary">Next.js 15</Badge>
          <Badge variant="secondary">Jetpack Compose</Badge>
          <Badge variant="secondary">Clean Architecture</Badge>
        </div>
      </div>

      <Tabs defaultValue="features" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="features">Функции</TabsTrigger>
          <TabsTrigger value="android">Android</TabsTrigger>
          <TabsTrigger value="web">Web</TabsTrigger>
          <TabsTrigger value="tech">Технологии</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">{feature.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="android" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="h-5 w-5" />
                <span>Android архитектура</span>
              </CardTitle>
              <CardDescription>Модульная архитектура с разделением на слои</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {androidModules.map((module, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Archive className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono">{module}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Разрешения Android 15</CardTitle>
              <CardDescription>Современные гранулярные разрешения</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline">READ_MEDIA_VISUAL_USER_SELECTED</Badge>
                <Badge variant="outline">ACCESS_MEDIA_LOCATION</Badge>
                <Badge variant="outline">POST_NOTIFICATIONS</Badge>
                <Badge variant="outline">MANAGE_EXTERNAL_STORAGE</Badge>
                <Badge variant="outline">INTERNET</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="web" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Веб-интерфейс</CardTitle>
                <CardDescription>Современный responsive дизайн</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Компоненты:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Библиотека с фильтрацией</li>
                    <li>• Читалка с навигацией</li>
                    <li>• Система настроек</li>
                    <li>• Аутентификация</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Темы оформления</CardTitle>
                <CardDescription>Адаптивные цветовые схемы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-white border rounded" />
                    <span className="text-sm">Светлая тема</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-900 rounded" />
                    <span className="text-sm">Темная тема</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-amber-100 border rounded" />
                    <span className="text-sm">Сепия (для чтения)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tech" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Frontend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>Next.js 15</Badge>
                  <Badge>React 18</Badge>
                  <Badge>TypeScript</Badge>
                  <Badge>Tailwind CSS v4</Badge>
                  <Badge>shadcn/ui</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Android</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>Kotlin</Badge>
                  <Badge>Jetpack Compose</Badge>
                  <Badge>Hilt DI</Badge>
                  <Badge>Room Database</Badge>
                  <Badge>Material Design 3</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Интеграции</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge>Google APIs</Badge>
                  <Badge>Yandex Services</Badge>
                  <Badge>Hugging Face</Badge>
                  <Badge>Cloud Storage</Badge>
                  <Badge>OCR Engine</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Готовность к развертыванию</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Android приложение:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Готово к сборке в Android Studio</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Все разрешения настроены</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Модульная архитектура</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Веб-приложение:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Готово к развертыванию</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>Responsive дизайн</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>PWA поддержка</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
