import type { JSX } from "solid-js"
import { cn } from "./utils"

export interface SidebarProps extends JSX.HTMLAttributes<HTMLElement> {
    collapsed?: boolean
    onCollapse?: () => void
}

export const Sidebar = (props: SidebarProps) => {
    return (
        <aside
            className={cn(
                "h-full bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
                props.collapsed ? "w-16" : "w-64",
                props.class
            )}
            style={{
                minWidth: props.collapsed ? "4rem" : "16rem",
                maxWidth: props.collapsed ? "4rem" : "16rem",
            }}
        >
            <div
                className={cn(
                    "flex-1 overflow-y-auto transition-opacity duration-200 pt-4",
                    props.collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                )}
            >
                {props.children}
            </div>
        </aside>
    )
}
