import { Outlet } from "react-router-dom"
import Header from "@/components/header"
import Dashboard from "@/components/dashboard"
import { useLayout } from "@/contexts/LayoutContext"

export default function MainLayout() {
  const { isSidebarOpen } = useLayout()

  return (
    <main className="w-full min-h-screen relative">
      <Header />
      <Dashboard />
      <div
        className={`transition-all duration-300 pt-[70px] ${isSidebarOpen ? "pl-[250px]" : "pl-[80px]"
          }`}
      >
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
