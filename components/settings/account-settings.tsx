"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Edit, Key, LogOut, ChevronRight } from "lucide-react"

interface AccountSettingsProps {
  onBack: () => void
}

export function AccountSettings({ onBack }: AccountSettingsProps) {
  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Account Settings</h1>
      </div>

      {/* Profile Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/user-avatar.png" alt="Alex Mercer" />
              <AvatarFallback className="text-lg">AM</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold">Alex Mercer</h2>
              <p className="text-muted-foreground">alex.mercer@example.com</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <div className="space-y-2">
        <AccountAction
          icon={Edit}
          title="Edit Profile"
          onClick={() => {
            // TODO: Implement edit profile
          }}
        />

        <AccountAction
          icon={Key}
          title="Change Password"
          onClick={() => {
            // TODO: Implement change password
          }}
        />

        <AccountAction
          icon={LogOut}
          title="Log Out"
          onClick={() => {
            // TODO: Implement logout
          }}
          variant="destructive"
        />
      </div>
    </div>
  )
}

interface AccountActionProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  onClick: () => void
  variant?: "default" | "destructive"
}

function AccountAction({ icon: Icon, title, onClick, variant = "default" }: AccountActionProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${variant === "destructive" ? "bg-destructive/10" : "bg-primary/10"}`}>
            <Icon className={`h-5 w-5 ${variant === "destructive" ? "text-destructive" : "text-primary"}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-medium ${variant === "destructive" ? "text-destructive" : ""}`}>{title}</h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
