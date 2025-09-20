"use client"

import { useState } from "react"
import { Search, Home, Archive, Inbox, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("home")

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "a", label: "Archive", icon: Archive },
    { id: "inbox", label: "Inbox", icon: Inbox },
  ]

  const Classes = [{ id: "first-Class", title: "My First Class", date: "Sep 9, 2025" }]

  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 flex items-center justify-center bg-card border-2 opacity-90 rounded-full shadow-md">
            
          </div>
          <span className="text-sidebar-foreground text-sm font-semibold">Hello, &lt;User&gt;</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Search Classes" className="pl-10 bg-sidebar-accent border-0 text-sm h-8" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4">
        <nav className="space-y-1 mb-6">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-colors text-left",
                  activeItem === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Your Classes */}
        <div>
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Class</h3>
          <div className="space-y-1">
            {Classes.map((Class) => (
              <button
                key={Class.id}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-sm rounded-lg transition-colors text-left hover:bg-sidebar-accent/50"
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sidebar-foreground">{Class.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground h-8"
        >
          <Plus className="w-4 h-4" />
          New Class
        </Button>
      </div>
    </div>
  )
}
