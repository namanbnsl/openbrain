"use client"

import { useState } from "react"
import { Grid3X3, List, Plus, FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function MainContent() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeTab, setActiveTab] = useState("all")

  const tabs = [
    { id: "all", label: "All" },
    { id: "shared", label: "Shared with you" },
    { id: "owned", label: "Owned by you" },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Home</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "text-foreground border-accent"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        {/* Folders Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-foreground">Folders</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">0</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <Card className="p-6 border-2 border-dashed border-border hover:border-accent/50 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-3 group-hover:bg-accent/10 transition-colors">
                  <FolderPlus className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Create folder
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Classes Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-medium text-foreground">Classes</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">1</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create Class Card */}
            <Card className="p-6 border-2 border-dashed border-border cursor-pointer">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Create Class
                </span>
              </div>
            </Card>

            {/* Existing Class */}
            <Card className="p-4 cursor-pointer border-border">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg mb-3 flex items-center justify-center">
                <span className="text-sm text-muted-foreground italic">First Class</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-foreground text-sm">
                  My First Class
                </h3>
                <p className="text-xs text-muted-foreground">Sep 9, 2025</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
