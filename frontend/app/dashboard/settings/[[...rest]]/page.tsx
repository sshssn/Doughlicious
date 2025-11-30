"use client"

import { UserProfile } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings, profile information, and security preferences
        </p>
      </div>

      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Profile & Security</CardTitle>
          <CardDescription className="text-base">
            Update your profile information, email, password, and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center bg-muted/20 p-4 rounded-lg border border-border/50">
            <div className="w-full max-w-4xl">
              <UserProfile 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 bg-transparent",
                    navbar: "hidden",
                    navbarButton: "hidden",
                    page: "bg-background rounded-lg",
                    pageScrollBox: "bg-background rounded-lg",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                    formFieldInput: "bg-background border-border",
                    formFieldLabel: "text-foreground",
                    accordionTriggerButton: "text-foreground hover:bg-accent",
                    identityPreview: "bg-muted/50 border-border",
                    identityPreviewText: "text-foreground",
                    identityPreviewEditButton: "text-primary hover:text-primary/80",
                  }
                }}
                routing="path"
                path="/dashboard/settings"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}






