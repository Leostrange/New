"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronRight, Globe, Palette, Zap, Bell, Volume2, Languages, BookOpen } from "lucide-react"
import { AccountSettings } from "./account-settings"
import { LanguageSettings } from "./language-settings"
import { ThemeSettings } from "./theme-settings"
import { OptimizationSettings } from "./optimization-settings"
import { TranslatorSettings } from "./translator-settings"
import { ReadingSettings } from "./reading-settings"

type SettingsSection = "main" | "account" | "language" | "themes" | "optimization" | "translators" | "reading"

export function SettingsView() {
  const [currentSection, setCurrentSection] = useState<SettingsSection>("main")

  if (currentSection === "account") {
    return <AccountSettings onBack={() => setCurrentSection("main")} />
  }

  if (currentSection === "language") {
    return <LanguageSettings onBack={() => setCurrentSection("main")} />
  }

  if (currentSection === "themes") {
    return <ThemeSettings onBack={() => setCurrentSection("main")} />
  }

  if (currentSection === "optimization") {
    return <OptimizationSettings onBack={() => setCurrentSection("main")} />
  }

  if (currentSection === "translators") {
    return <TranslatorSettings onBack={() => setCurrentSection("main")} />
  }

  if (currentSection === "reading") {
    return <ReadingSettings onBack={() => setCurrentSection("main")} />
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Настройки</h1>
        <p className="text-muted-foreground">Персонализируйте ваш опыт чтения</p>
      </div>

      {/* Account Card */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCurrentSection("account")}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/user-avatar.png" alt="Alex Mercer" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Alex Mercer</h3>
              <p className="text-sm text-muted-foreground">alex.mercer@example.com</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {/* Settings Options */}
      <div className="space-y-2">
        <SettingsItem
          icon={BookOpen}
          title="Чтение"
          description="Навигация, звуки, комфорт чтения"
          onClick={() => setCurrentSection("reading")}
        />

        <SettingsItem
          icon={Globe}
          title="Общие настройки"
          description="Язык, клавиатура"
          onClick={() => setCurrentSection("language")}
        />

        <SettingsItem
          icon={Languages}
          title="Переводчики"
          description="API ключи, облачные переводчики"
          onClick={() => setCurrentSection("translators")}
        />

        <SettingsItem
          icon={Palette}
          title="Дисплей"
          description="Темы, яркость, тайм-аут экрана"
          onClick={() => setCurrentSection("themes")}
        />

        <SettingsItem
          icon={Bell}
          title="Уведомления"
          description="Управление уведомлениями"
          onClick={() => {
            // TODO: Implement notifications settings
          }}
        />

        <SettingsItem
          icon={Volume2}
          title="Звуки"
          description="Разрешения, активность аккаунта"
          onClick={() => {
            // TODO: Implement sound settings
          }}
        />

        <SettingsItem
          icon={Zap}
          title="Оптимизация"
          description="Производительность, кэш"
          onClick={() => setCurrentSection("optimization")}
        />
      </div>
    </div>
  )
}

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  onClick: () => void
}

function SettingsItem({ icon: Icon, title, description, onClick }: SettingsItemProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
