import { type JSX, splitProps } from "solid-js"
import { cn } from "./utils"

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Card = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return (
        <div
            className={cn("rounded-xl border bg-card text-card-foreground shadow", split.class)}
            {...rest}
        />
    )
}

export const CardHeader = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return <div className={cn("flex flex-col space-y-1.5 p-6", split.class)} {...rest} />
}

export const CardTitle = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return (
        <div className={cn("font-semibold leading-none tracking-tight", split.class)} {...rest} />
    )
}

export const CardDescription = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return <div className={cn("text-sm text-muted-foreground", split.class)} {...rest} />
}

export const CardContent = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return <div className={cn("p-6 pt-0", split.class)} {...rest} />
}

export const CardFooter = (props: CardProps) => {
    const [split, rest] = splitProps(props, ["class"])
    return <div className={cn("flex items-center p-6 pt-0", split.class)} {...rest} />
}
