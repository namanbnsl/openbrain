import { Sidebar } from "@/components/sidebar"
import { MainContent } from "@/components/main-content"

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <MainContent />
    </div>
  )
}
