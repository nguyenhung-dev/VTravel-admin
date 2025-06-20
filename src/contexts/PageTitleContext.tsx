
import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type PageTitleContextType = {
  title: string
  setTitle: (title: string) => void
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined)

export const PageTitleProvider = ({ children }: { children: ReactNode }) => {
  const [title, setTitle] = useState("")

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  )
}

export const usePageTitle = () => {
  const context = useContext(PageTitleContext)
  if (!context) throw new Error("usePageTitle must be used inside PageTitleProvider")
  return context
}
