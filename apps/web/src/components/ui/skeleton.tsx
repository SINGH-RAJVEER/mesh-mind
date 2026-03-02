import { JSX, mergeProps, splitProps } from "solid-js";
import { cn } from "./utils";

export interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
}

export const Skeleton = (props: SkeletonProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("animate-pulse rounded-md bg-primary/10", props.class),
  });

  return <div {...merged} />;
};
