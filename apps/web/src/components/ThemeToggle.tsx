import { createEffect, createSignal } from "solid-js"
import { Button } from "./ui/button"
import { Sun, Moon } from "lucide-solid"

const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const getInitialTheme = () => {
    if (typeof window === "undefined") return "light"
    const savedTheme = localStorage.getItem("theme")
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : getSystemTheme()
}

export default function ThemeToggle() {
    const [theme, setTheme] = createSignal<"dark" | "light">(getInitialTheme())

    createEffect(() => {
        const root = window.document.documentElement
        const currentTheme = theme()

        if (currentTheme === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }

        localStorage.setItem("theme", currentTheme)
    })

    const toggleTheme = () => {
        const newTheme = theme() === "dark" ? "light" : "dark"
        setTheme(newTheme)
    }

    return (
        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme() === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
    )
}
