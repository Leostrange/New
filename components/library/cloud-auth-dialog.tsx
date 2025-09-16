"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, Key, Globe } from "lucide-react"

interface CloudAuthDialogProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (provider: string, credentials: any) => void
}

export function CloudAuthDialog({ isOpen, onClose, onConnect }: CloudAuthDialogProps) {
  const [activeProvider, setActiveProvider] = useState("google")
  const [credentials, setCredentials] = useState({
    apiKey: "",
    clientId: "",
    clientSecret: "",
  })

  const handleConnect = () => {
    onConnect(activeProvider, credentials)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Подключение облачных переводчиков</DialogTitle>
          <DialogDescription>Подключите API ключи для автоматического перевода комиксов</DialogDescription>
        </DialogHeader>

        <Tabs value={activeProvider} onValueChange={setActiveProvider}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="google">Google</TabsTrigger>
            <TabsTrigger value="yandex">Yandex</TabsTrigger>
            <TabsTrigger value="deepl">DeepL</TabsTrigger>
          </TabsList>

          <TabsContent value="google" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Google Translate API
                </CardTitle>
                <CardDescription className="text-xs">Получите API ключ в Google Cloud Console</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="google-api-key" className="text-sm">
                    API Ключ
                  </Label>
                  <Input
                    id="google-api-key"
                    placeholder="AIzaSy..."
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yandex" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Yandex Translate API
                </CardTitle>
                <CardDescription className="text-xs">Получите API ключ в Yandex Cloud</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="yandex-api-key" className="text-sm">
                    API Ключ
                  </Label>
                  <Input
                    id="yandex-api-key"
                    placeholder="AQVNx..."
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deepl" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  DeepL API
                </CardTitle>
                <CardDescription className="text-xs">Получите API ключ на сайте DeepL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deepl-api-key" className="text-sm">
                    API Ключ
                  </Label>
                  <Input
                    id="deepl-api-key"
                    placeholder="xxx-xxx-xxx:fx"
                    value={credentials.apiKey}
                    onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
            Отмена
          </Button>
          <Button onClick={handleConnect} className="flex-1">
            Подключить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
