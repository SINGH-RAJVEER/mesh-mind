import { cn } from "./utils"
import { type JSX, splitProps } from "solid-js"

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {}

export const Input = (props: InputProps) => {
    const [split, rest] = splitProps(props, ["className"])

    return (
        <input
            className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                split.className
            )}
            {...rest}
        />
    )
}
