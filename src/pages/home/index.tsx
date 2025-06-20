import styles from "./style.module.css";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { useEffect } from "react";

export default function HomePage() {
  const { setTitle } = usePageTitle();
  useEffect(() => {
    setTitle("Thống kê")
  }, [])

  return (
    <div>HomePage</div>
  )
}
