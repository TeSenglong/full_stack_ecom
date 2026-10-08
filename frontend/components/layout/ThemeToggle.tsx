"use client"

import { useSyncExternalStore } from "react"
import { useTheme } from "next-themes"

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  )

  if (!mounted) {
    return <span className="block size-8" aria-hidden="true" />
  }

  const darkMode = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={darkMode ? "Light mode" : "Dark mode"}
      className="flex size-8 cursor-pointer items-center justify-center rounded-full text-current transition-colors hover:bg-foreground/10"
    >
      <span className="material-symbols-outlined text-[21px]" aria-hidden="true">
        {darkMode ? "light_mode" : "dark_mode"}
      </span>
    </button>
  )
}
