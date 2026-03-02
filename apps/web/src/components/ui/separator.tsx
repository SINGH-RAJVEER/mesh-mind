import { JSX, mergeProps, splitProps } from "solid-js";
import { cn } from "./utils";

export interface SeparatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

export const Separator = (props: SeparatorProps) => {
  const [, rest] = splitProps(props, ["class", "orientation", "decorative"]);
  const orientation = () => props.orientation || "horizontal";

  const merged = mergeProps(rest, {
    role: props.decorative ? "none" : "separator",
    "aria-orientation": orientation(),
    class: cn(
      "shrink-0 bg-border",
      orientation() === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      props.class,
    ),
  });

  return <div {...merged} />;
};
