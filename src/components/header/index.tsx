// Header.tsx
import { FaBars } from "react-icons/fa"
import { useLayout } from "@/contexts/LayoutContext"
import { usePageTitle } from "@/contexts/PageTitleContext"

export default function Header() {
  const { toggleSidebar, toggleCollapsed } = useLayout()
  const { title } = usePageTitle()

  return (
    <div className="fixed z-10 bg-[#ffe7a0] top-0 left-0 right-0 h-[70px] flex items-center">
      <div className="flex justify-between items-center w-[250px] px-3">
        <img src="/images/logo.png" alt="logo" className="h-[45px] w-auto object-cover object-center" />
        <button onClick={() => {
          toggleSidebar();
          toggleCollapsed();
        }}>
          <FaBars className="cursor-pointer" />
        </button>
      </div>
      <div className="flex-1">
        <h2 className="text-xl font-semibold ml-4">{title}</h2>
      </div>
      <div className="flex items-center gap-4 pr-3">
        <img src="/images/avatar-default.png" alt="avatar" className="w-10 h-10 rounded-[50%] object-cover" />
        <p>ADMINISTRATOR</p>
      </div>
    </div>
  )
}
