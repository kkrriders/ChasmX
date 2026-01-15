"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Laptop } from "lucide-react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize the interface look and feel.
        </p>
      </div>
      <Separator />

      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Theme Preference</CardTitle>
          <CardDescription>
            Select your preferred theme for the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            defaultValue={theme}
            onValueChange={setTheme}
            className="grid max-w-md grid-cols-3 gap-8 pt-2"
          >
            <div className="text-center">
              <RadioGroupItem value="light" id="light" className="sr-only" />
              <Label
                htmlFor="light"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="mb-3 rounded-md bg-[#ffffff] p-2 shadow-sm border">
                   <div className="h-4 w-12 rounded-full bg-[#e5e7eb]" />
                   <div className="mt-2 h-16 w-[80px] rounded-md bg-[#f3f4f6]" />
                   <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-[#e5e7eb]" />
                      <div className="h-2 w-10 rounded-lg bg-[#e5e7eb]" />
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Sun className="h-4 w-4" />
                   <span className="block w-full text-center font-normal">Light</span>
                </div>
              </Label>
            </div>

            <div className="text-center">
              <RadioGroupItem value="dark" id="dark" className="sr-only" />
              <Label
                htmlFor="dark"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="mb-3 rounded-md bg-zinc-950 p-2 shadow-sm border border-zinc-800">
                   <div className="h-4 w-12 rounded-full bg-zinc-800" />
                   <div className="mt-2 h-16 w-[80px] rounded-md bg-zinc-900" />
                   <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-zinc-800" />
                      <div className="h-2 w-10 rounded-lg bg-zinc-800" />
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Moon className="h-4 w-4" />
                   <span className="block w-full text-center font-normal">Dark</span>
                </div>
              </Label>
            </div>

            <div className="text-center">
              <RadioGroupItem value="system" id="system" className="sr-only" />
              <Label
                htmlFor="system"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all"
              >
                <div className="mb-3 rounded-md bg-zinc-900 p-2 shadow-sm border border-zinc-800">
                   <div className="h-4 w-12 rounded-full bg-zinc-700" />
                   <div className="mt-2 h-16 w-[80px] rounded-md bg-zinc-800" />
                   <div className="mt-2 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-zinc-700" />
                      <div className="h-2 w-10 rounded-lg bg-zinc-700" />
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Laptop className="h-4 w-4" />
                   <span className="block w-full text-center font-normal">System</span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}
