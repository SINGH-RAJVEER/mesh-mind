import { type JSX, splitProps } from "solid-js";
import { cn } from "./utils";

export interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export const Skeleton = (props: SkeletonProps) => {
  const [split, rest] = splitProps(props, ["class"]);
  return (
    <div
      className={cn("animate-pulse rounded-md bg-primary/10", split.class)}
      {...rest}
    />
  );
};
