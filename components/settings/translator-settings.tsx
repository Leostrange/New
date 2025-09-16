"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Key, Globe, Cloud, CheckCircle, XCircle, Plus, Trash2, Eye, EyeOff } from "lucide-react"

interface TranslatorSettingsProps {
  onBack: () => void
}

interface TranslatorService {
  id: string
  name: string
  provider: string
  description: string
  isConnected: boolean
  isEnabled: boolean
  apiKey?: string
  supportedLanguages: string[]
  rateLimit: string
  pricing: string
  icon: React.ComponentType<{ className?: string }>
}

const translatorServices: TranslatorService[] = [
  {
    id: "google-translate",
    name: "Google Translate",
    provider: "Google Cloud",
    description: "Высококачественный перевод с поддержкой 100+ языков",
    isConnected: false,
    isEnabled: false,
    supportedLanguages: ["ru", "en", "ja", "ko", "zh", "es", "fr", "de"],
    rateLimit: "1000 символов/мин",
    pricing: "$20/1M символов",
    icon: Globe,
  },
  {
    id: "yandex-translate",
    name: "Yandex Translate",
    provider: "Yandex Cloud",
    description: "Отличное качество перевода для русского и других языков",
    isConnected: true,
    isEnabled: true,
    apiKey: "AQVNx...hidden",
    supportedLanguages: ["ru", "en", "ja", "ko", "zh", "uk", "be"],
    rateLimit: "10M символов/месяц",
    pricing: "Бесплатно до 10M",
    icon: Key,
  },
  {
    id: "deepl",
    name: "DeepL",
    provider: "DeepL SE",
    description: "Самое точное качество перевода с помощью нейросетей",
    isConnected: false,
    isEnabled: false,
    supportedLanguages: ["ru", "en", "ja", "zh", "es", "fr", "de", "it"],
    rateLimit: "500K символов/месяц",
    pricing: "€5.99/месяц",
    icon: Cloud,
  },
]

export function TranslatorSettings({ onBack }: TranslatorSettingsProps) {
  const [services, setServices] = useState(translatorServices)
  const [selectedService, setSelectedService] = useState<TranslatorService | null>(null)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [newApiKey, setNewApiKey] = useState("")

  const toggleService = (serviceId: string) => {
    setServices(
      services.map((service) => (service.id === serviceId ? { ...service, isEnabled: !service.isEnabled } : service)),
    )
  }

  const connectService = (serviceId: string, apiKey: string) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, isConnected: true, apiKey: apiKey } : service,
      ),
    )
    setNewApiKey("")
    setSelectedService(null)
  }

  const disconnectService = (serviceId: string) => {
    setServices(
      services.map((service) =>
        service.id === serviceId ? { ...service, isConnected: false, isEnabled: false, apiKey: undefined } : service,
      ),
    )
  }

  const connectedServices = services.filter((s) => s.isConnected)
  const enabledServices = services.filter((s) => s.isConnected && s.isEnabled)

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Переводчики</h1>
          <p className="text-muted-foreground">Настройте облачные сервисы перевода</p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{connectedServices.length}</div>
            <div className="text-sm text-muted-foreground">Подключено</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{enabledServices.length}</div>
            <div className="text-sm text-muted-foreground">Активно</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{services.length}</div>
            <div className="text-sm text-muted-foreground">Доступно</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {enabledServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Автоматический перевод</h4>
                <p className="text-sm text-muted-foreground">Переводить комиксы автоматически при открытии</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Предпочитаемый переводчик</h4>
                <p className="text-sm text-muted-foreground">{enabledServices[0]?.name || "Не выбран"}</p>
              </div>
              <Button variant="outline" size="sm">
                Изменить
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translator Services */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Доступные сервисы</h2>

        {services.map((service) => {
          const IconComponent = service.icon
          return (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="secondary">{service.provider}</Badge>
                        {service.isConnected ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Подключен
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <XCircle className="h-3 w-3 mr-1" />
                            Не подключен
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>

                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>Лимит: {service.rateLimit}</span>
                        <span>Цена: {service.pricing}</span>
                        <span>Языки: {service.supportedLanguages.length}</span>
                      </div>

                      {service.isConnected && service.apiKey && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">API ключ:</span>
                          <code className="bg-muted px-2 py-1 rounded">
                            {showApiKey[service.id] ? service.apiKey : service.apiKey.replace(/./g, "•")}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowApiKey({
                                ...showApiKey,
                                [service.id]: !showApiKey[service.id],
                              })
                            }
                          >
                            {showApiKey[service.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {service.isConnected && (
                      <Switch checked={service.isEnabled} onCheckedChange={() => toggleService(service.id)} />
                    )}

                    {service.isConnected ? (
                      <Button variant="destructive" size="sm" onClick={() => disconnectService(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedService(service)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Подключить
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Подключить {service.name}</DialogTitle>
                            <DialogDescription>Введите API ключ для подключения сервиса перевода</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="api-key">API Ключ</Label>
                              <Input
                                id="api-key"
                                type="password"
                                placeholder="Введите ваш API ключ..."
                                value={newApiKey}
                                onChange={(e) => setNewApiKey(e.target.value)}
                              />
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <p>Получите API ключ:</p>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {service.id === "google-translate" && (
                                  <li>Google Cloud Console → APIs & Services → Credentials</li>
                                )}
                                {service.id === "yandex-translate" && <li>Yandex Cloud Console → Translate API</li>}
                                {service.id === "deepl" && <li>DeepL Pro Account → API Keys</li>}
                              </ul>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedService(null)
                                setNewApiKey("")
                              }}
                              className="flex-1"
                            >
                              Отмена
                            </Button>
                            <Button
                              onClick={() => connectService(service.id, newApiKey)}
                              disabled={!newApiKey.trim()}
                              className="flex-1"
                            >
                              Подключить
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Помощь</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Как получить API ключи:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Google Translate:</strong> Создайте проект в Google Cloud Console и включите Translate API
              </li>
              <li>
                <strong>Yandex Translate:</strong> Зарегистрируйтесь в Yandex Cloud и создайте API ключ
              </li>
              <li>
                <strong>DeepL:</strong> Подпишитесь на DeepL Pro и получите ключ в личном кабинете
              </li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Безопасность:</strong>
            </p>
            <p>
              Все API ключи хранятся локально на вашем устройстве и передаются только в соответствующие сервисы
              перевода.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
